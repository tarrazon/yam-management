import { supabase } from '../lib/supabase';

export const workflowService = {
  async getWorkflowSteps(workflowType = null) {
    let query = supabase
      .from('workflow_steps')
      .select('*');

    if (workflowType) {
      query = query.eq('workflow_type', workflowType);
    }

    const { data, error } = await query.order('order_index');

    if (error) throw error;
    return data;
  },

  async getLotWorkflowProgress(lotId) {
    const { data, error } = await supabase
      .from('lot_workflow_progress')
      .select(`
        *,
        completed_by_user:profiles!completed_by (
          nom,
          prenom,
          email
        )
      `)
      .eq('lot_id', lotId)
      .order('created_at');

    if (error) throw error;
    return data || [];
  },

  async completeStep(lotId, stepCode, notes = null) {
    const { data: existingProgress, error: fetchError } = await supabase
      .from('lot_workflow_progress')
      .select('*')
      .eq('lot_id', lotId)
      .eq('step_code', stepCode)
      .maybeSingle();

    if (fetchError) throw fetchError;

    if (existingProgress) {
      const { data, error } = await supabase
        .from('lot_workflow_progress')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          completed_by: (await supabase.auth.getUser()).data.user.id,
          notes
        })
        .eq('id', existingProgress.id)
        .select()
        .single();

      if (error) throw error;

      const { data: step } = await supabase
        .from('workflow_steps')
        .select('*')
        .eq('code', stepCode)
        .single();

      if (step?.send_email) {
        await this.sendWorkflowEmail(lotId, stepCode, step);
      }

      return data;
    }
  },

  async skipStep(lotId, stepCode, notes = null) {
    const { data: existingProgress } = await supabase
      .from('lot_workflow_progress')
      .select('*')
      .eq('lot_id', lotId)
      .eq('step_code', stepCode)
      .maybeSingle();

    if (existingProgress) {
      const { data, error } = await supabase
        .from('lot_workflow_progress')
        .update({
          status: 'skipped',
          notes
        })
        .eq('id', existingProgress.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    }
  },

  async resetStep(lotId, stepCode) {
    const { data: existingProgress } = await supabase
      .from('lot_workflow_progress')
      .select('*')
      .eq('lot_id', lotId)
      .eq('step_code', stepCode)
      .maybeSingle();

    if (existingProgress) {
      const { data, error } = await supabase
        .from('lot_workflow_progress')
        .update({
          status: 'pending',
          completed_at: null,
          completed_by: null,
          notes: null
        })
        .eq('id', existingProgress.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    }
  },

  async getCurrentStep(lotId) {
    const [allSteps, progressData] = await Promise.all([
      this.getWorkflowSteps(),
      this.getLotWorkflowProgress(lotId)
    ]);

    if (!allSteps || allSteps.length === 0) return null;

    const progressMap = {};
    progressData.forEach(p => {
      progressMap[p.step_code] = p.status;
    });

    for (const step of allSteps) {
      const status = progressMap[step.code];
      if (status === 'pending' || !status) {
        return {
          ...step,
          status: status || 'pending'
        };
      }
    }

    return {
      ...allSteps[allSteps.length - 1],
      status: 'completed'
    };
  },

  async getWorkflowSummary(lotId) {
    const { data, error } = await supabase
      .from('lot_workflow_progress')
      .select('status')
      .eq('lot_id', lotId);

    if (error) throw error;

    const total = data.length;
    const completed = data.filter(p => p.status === 'completed').length;
    const pending = data.filter(p => p.status === 'pending').length;
    const skipped = data.filter(p => p.status === 'skipped').length;

    return {
      total,
      completed,
      pending,
      skipped,
      percentage: total > 0 ? Math.round((completed / total) * 100) : 0
    };
  },

  async sendWorkflowEmail(lotId, stepCode, step) {
    try {
      const { data: lot } = await supabase
        .from('lots_lmnp')
        .select(`
          *,
          residence:residence_id (
            nom,
            ville
          ),
          acquereur:acquereur_id (
            nom,
            prenom,
            email
          ),
          vendeur:vendeur_id (
            nom,
            prenom,
            email
          )
        `)
        .eq('id', lotId)
        .single();

      if (!lot) return;

      const { getDocumentsByWorkflowStep } = await import('../hooks/useDocumentsManquants');
      const documentsManquants = await getDocumentsByWorkflowStep(stepCode, lot);

      const emailData = {
        lot_id: lotId,
        step_code: stepCode,
        template: step.email_template,
        recipients: step.email_recipients,
        lot_reference: lot.reference,
        residence_nom: lot.residence?.nom,
        acquereur_email: lot.acquereur?.email,
        vendeur_email: lot.vendeur?.email,
        documents_manquants: documentsManquants
      };

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-workflow-notification`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(emailData)
        }
      );

      if (response.ok) {
        await supabase
          .from('lot_workflow_progress')
          .update({
            email_sent: true,
            email_sent_at: new Date().toISOString()
          })
          .eq('lot_id', lotId)
          .eq('step_code', stepCode);
      }
    } catch (error) {
      console.error('Error sending workflow email:', error);
      throw error;
    }
  },

  async resendWorkflowEmail(lotId, stepCode) {
    try {
      const { data: step } = await supabase
        .from('workflow_steps')
        .select('*')
        .eq('code', stepCode)
        .single();

      if (!step || !step.send_email) {
        throw new Error('Cette étape ne nécessite pas d\'envoi d\'email');
      }

      await this.sendWorkflowEmail(lotId, stepCode, step);

      await supabase
        .from('lot_workflow_progress')
        .update({
          email_sent: true,
          email_sent_at: new Date().toISOString()
        })
        .eq('lot_id', lotId)
        .eq('step_code', stepCode);

      return { success: true };
    } catch (error) {
      console.error('Error resending workflow email:', error);
      throw error;
    }
  },

  async resetLotWorkflow(lotId) {
    try {
      const { error } = await supabase
        .from('lot_workflow_progress')
        .delete()
        .eq('lot_id', lotId);

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Error resetting lot workflow:', error);
      throw error;
    }
  }
};
