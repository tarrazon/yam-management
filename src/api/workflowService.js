import { supabase } from '../lib/supabase';
import { toast } from 'sonner';

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
      console.log('Sending workflow email:', {
        lotId,
        stepCode,
        step_send_email: step.send_email,
        has_subject: !!step.email_subject,
        has_body: !!step.email_body
      });

      if (!step.email_subject || !step.email_body) {
        console.warn('Step has no email template configured:', {
          has_subject: !!step.email_subject,
          has_body: !!step.email_body
        });
        toast.error('Cette étape n\'a pas de template d\'email configuré');
        return;
      }

      const { data: lot, error: lotError } = await supabase
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
          ),
          partenaire:partenaire_id (
            nom,
            email
          )
        `)
        .eq('id', lotId)
        .maybeSingle();

      if (lotError) {
        console.error('Error fetching lot:', lotError);
        throw lotError;
      }

      if (!lot) {
        console.warn('Lot not found:', lotId);
        return;
      }

      let acquereurEmail = null;
      let vendeurEmail = null;

      if (lot.acquereur_id) {
        console.log('[workflowService] Fetching CURRENT acquereur email from DB...');
        const { data: acquereurData, error: acqError } = await supabase
          .from('acquereurs')
          .select('email, nom, prenom')
          .eq('id', lot.acquereur_id)
          .maybeSingle();

        if (acqError) {
          console.error('[workflowService] Error fetching acquereur:', acqError);
        } else if (acquereurData) {
          acquereurEmail = acquereurData.email;
          console.log('[workflowService] Acquereur email from DB:', {
            nom: acquereurData.nom,
            prenom: acquereurData.prenom,
            email: acquereurEmail
          });
        }
      }

      if (lot.vendeur_id) {
        console.log('[workflowService] Fetching CURRENT vendeur email from DB...');
        const { data: vendeurData, error: vendError } = await supabase
          .from('vendeurs')
          .select('email, nom, prenom')
          .eq('id', lot.vendeur_id)
          .maybeSingle();

        if (vendError) {
          console.error('[workflowService] Error fetching vendeur:', vendError);
        } else if (vendeurData) {
          vendeurEmail = vendeurData.email;
          console.log('[workflowService] Vendeur email from DB:', {
            nom: vendeurData.nom,
            prenom: vendeurData.prenom,
            email: vendeurEmail
          });
        }
      }

      console.log('[workflowService] Final emails to use for sending:', {
        acquereur_id: lot.acquereur_id,
        acquereur_email: acquereurEmail,
        vendeur_id: lot.vendeur_id,
        vendeur_email: vendeurEmail
      });

      const { getDocumentsByWorkflowStep } = await import('../hooks/useDocumentsManquants');
      const stepDocuments = getDocumentsByWorkflowStep(stepCode, lot.acquereur, lot.vendeur);

      const documentsManquantsText = stepDocuments.manquants
        .map(doc => `- ${doc.label}`)
        .join('\n');

      const replaceVariables = (text) => {
        return text
          .replace(/\{\{lot_reference\}\}/g, lot.reference || '')
          .replace(/\{\{residence_nom\}\}/g, lot.residence?.nom || '')
          .replace(/\{\{acquereur_nom\}\}/g, lot.acquereur ? `${lot.acquereur.prenom} ${lot.acquereur.nom}` : '')
          .replace(/\{\{vendeur_nom\}\}/g, lot.vendeur ? `${lot.vendeur.prenom} ${lot.vendeur.nom}` : '')
          .replace(/\{\{partenaire_nom\}\}/g, lot.partenaire?.nom || '')
          .replace(/\{\{date\}\}/g, new Date().toLocaleDateString('fr-FR'))
          .replace(/\{\{step_label\}\}/g, step.label)
          .replace(/\{\{notes\}\}/g, '')
          .replace(/\{\{documents_manquants\}\}/g, documentsManquantsText || 'Aucun document manquant');
      };

      const subject = replaceVariables(step.email_subject);
      const body = replaceVariables(step.email_body);

      const recipients = [];
      const emailRecipients = step.email_recipients || ['acquereur', 'vendeur'];

      console.log('[workflowService] Email recipients config:', {
        step_code: stepCode,
        email_recipients: emailRecipients,
        acquereur_email: acquereurEmail,
        vendeur_email: vendeurEmail
      });

      if (emailRecipients.includes('acquereur') && acquereurEmail) {
        console.log('[workflowService] Adding acquereur email:', acquereurEmail);
        recipients.push(acquereurEmail);
      } else if (emailRecipients.includes('acquereur')) {
        console.warn('[workflowService] Acquereur should receive email but no email found');
      }

      if (emailRecipients.includes('vendeur') && vendeurEmail) {
        console.log('[workflowService] Adding vendeur email:', vendeurEmail);
        recipients.push(vendeurEmail);
      } else if (emailRecipients.includes('vendeur')) {
        console.warn('[workflowService] Vendeur should receive email but no email found');
      }

      if (emailRecipients.includes('bo')) {
        const { data: notificationEmails } = await supabase
          .from('notification_emails')
          .select('email')
          .eq('active', true);

        if (notificationEmails && notificationEmails.length > 0) {
          notificationEmails.forEach(item => {
            console.log('[workflowService] Adding BO email:', item.email);
            recipients.push(item.email);
          });
        } else {
          console.warn('[workflowService] BO should receive email but no notification emails configured');
        }
      }

      console.log('Final recipients:', recipients);

      if (recipients.length === 0) {
        console.error('No recipients found for email - cannot send notification');
        toast.error('Aucun destinataire trouvé (acquéreur ou vendeur sans email)');
        return;
      }

      const emailData = {
        lot_id: lotId,
        step_code: stepCode,
        subject,
        body,
        recipients,
        lot_reference: lot.reference,
        residence_nom: lot.residence?.nom
      };

      console.log('Calling edge function with data:', JSON.stringify(emailData, null, 2));

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

      console.log('Edge function response status:', response.status);

      if (response.ok) {
        const result = await response.json();
        console.log('Email sent successfully:', result);

        await supabase
          .from('lot_workflow_progress')
          .update({
            email_sent: true,
            email_sent_at: new Date().toISOString()
          })
          .eq('lot_id', lotId)
          .eq('step_code', stepCode);

        toast.success(`Email envoyé avec succès à ${result.recipients?.join(', ')}`);
      } else {
        const error = await response.json();
        console.error('Error from email function:', error);
        toast.error(`Erreur d'envoi: ${error.error || 'Échec de l\'envoi'}`);
        throw new Error(error.error || 'Failed to send email');
      }
    } catch (error) {
      console.error('Error sending workflow email:', error);
      throw error;
    }
  },

  async resendWorkflowEmail(lotId, stepCode) {
    try {
      const { data: step, error: stepError } = await supabase
        .from('workflow_steps')
        .select('*')
        .eq('code', stepCode)
        .maybeSingle();

      if (stepError) {
        console.error('Error fetching step:', stepError);
        throw stepError;
      }

      if (!step) {
        throw new Error('Étape introuvable');
      }

      if (!step.send_email) {
        throw new Error('Cette étape n\'a pas l\'envoi d\'email activé');
      }

      if (!step.email_subject || !step.email_body) {
        throw new Error('Cette étape n\'a pas de template d\'email configuré. Veuillez d\'abord configurer le template dans Admin > Templates d\'emails');
      }

      console.log('Resending email for step:', {
        stepCode,
        lotId,
        has_subject: !!step.email_subject,
        has_body: !!step.email_body,
        email_recipients: step.email_recipients
      });

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
  },

  async initializeWorkflowForLot(lotId, workflowType = 'acquereur') {
    try {
      const steps = await this.getWorkflowSteps(workflowType);

      if (!steps || steps.length === 0) {
        console.warn('No workflow steps found for type:', workflowType);
        return;
      }

      const existingProgress = await this.getLotWorkflowProgress(lotId);
      const existingStepCodes = existingProgress.map(p => p.step_code);

      const newEntries = [];
      for (const step of steps) {
        if (!existingStepCodes.includes(step.code)) {
          newEntries.push({
            lot_id: lotId,
            step_code: step.code,
            status: 'pending'
          });
        }
      }

      if (newEntries.length > 0) {
        const { error } = await supabase
          .from('lot_workflow_progress')
          .insert(newEntries);

        if (error) throw error;
      }

      return { success: true, created: newEntries.length };
    } catch (error) {
      console.error('Error initializing workflow:', error);
      throw error;
    }
  }
};
