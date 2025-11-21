import { useEffect, useState } from 'react';
import {
  CheckCircle2,
  Circle,
  XCircle,
  Clock,
  User,
  Mail,
  Zap,
  MessageSquare,
  AlertCircle,
  FileText,
  FileCheck,
  Send
} from 'lucide-react';
import { workflowService } from '../../api/workflowService';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { toast } from 'sonner';
import { format, addDays } from 'date-fns';
import { fr } from 'date-fns/locale';
import { base44 } from '@/api/base44Client';
import { getDocumentsByWorkflowStep } from '@/hooks/useDocumentsManquants';

export function WorkflowTimeline({ lotId, onUpdate, workflowType = null, readOnly = false }) {
  const [progress, setProgress] = useState([]);
  const [steps, setSteps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState({});
  const [lot, setLot] = useState(null);
  const [acquereur, setAcquereur] = useState(null);
  const [vendeur, setVendeur] = useState(null);
  const [sendingEmail, setSendingEmail] = useState({});

  useEffect(() => {
    loadWorkflow();
  }, [lotId, workflowType]);

  const loadWorkflow = async () => {
    try {
      setLoading(true);
      const [progressData, stepsData, lotData] = await Promise.all([
        workflowService.getLotWorkflowProgress(lotId),
        workflowService.getWorkflowSteps(workflowType),
        base44.entities.LotLMNP.findOne(lotId)
      ]);

      if (!stepsData || stepsData.length === 0) {
        console.warn('No workflow steps found in database');
        toast.error('Aucune étape de dossier trouvée');
        return;
      }

      setLot(lotData);

      if (lotData?.acquereur_id) {
        const acquereurData = await base44.entities.Acquereur.findOne(lotData.acquereur_id);
        setAcquereur(acquereurData);
      }

      if (lotData?.vendeur_id) {
        const vendeurData = await base44.entities.Vendeur.findOne(lotData.vendeur_id);
        setVendeur(vendeurData);
      }

      const progressMap = {};
      if (progressData && Array.isArray(progressData)) {
        progressData.forEach(p => {
          progressMap[p.step_code] = p;
        });
      }

      const combined = stepsData.map(step => ({
        ...step,
        progress: progressMap[step.code] || {
          status: 'pending',
          step_code: step.code,
          lot_id: lotId
        }
      }));

      setSteps(combined);
      setProgress(progressData || []);
    } catch (error) {
      console.error('Error loading workflow:', error);
      toast.error(`Erreur: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteStep = async (stepCode) => {
    try {
      await workflowService.completeStep(lotId, stepCode, notes[stepCode] || null);
      toast.success('Étape marquée comme complétée');
      setNotes(prev => ({ ...prev, [stepCode]: '' }));
      await loadWorkflow();
      onUpdate?.();
    } catch (error) {
      console.error('Error completing step:', error);
      toast.error('Erreur lors de la complétion de l\'étape');
    }
  };

  const handleSkipStep = async (stepCode) => {
    try {
      await workflowService.skipStep(lotId, stepCode, notes[stepCode] || null);
      toast.success('Étape ignorée');
      setNotes(prev => ({ ...prev, [stepCode]: '' }));
      await loadWorkflow();
      onUpdate?.();
    } catch (error) {
      console.error('Error skipping step:', error);
      toast.error('Erreur lors de l\'ignorage de l\'étape');
    }
  };

  const handleResetStep = async (stepCode) => {
    try {
      await workflowService.resetStep(lotId, stepCode);
      toast.success('Étape réinitialisée');
      await loadWorkflow();
      onUpdate?.();
    } catch (error) {
      console.error('Error resetting step:', error);
      toast.error('Erreur lors de la réinitialisation');
    }
  };

  const handleResendEmail = async (stepCode) => {
    try {
      setSendingEmail(prev => ({ ...prev, [stepCode]: true }));
      await workflowService.resendWorkflowEmail(lotId, stepCode);
      toast.success('Email de relance envoyé avec succès');
      await loadWorkflow();
    } catch (error) {
      console.error('Error resending email:', error);
      toast.error(error.message || 'Erreur lors de l\'envoi de l\'email');
    } finally {
      setSendingEmail(prev => ({ ...prev, [stepCode]: false }));
    }
  };

  const getStatusIcon = (status, isAutomatic) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-6 h-6 text-green-600" />;
      case 'skipped':
        return <XCircle className="w-6 h-6 text-amber-500" />;
      default:
        return isAutomatic ?
          <Zap className="w-6 h-6 text-blue-500" /> :
          <Circle className="w-6 h-6 text-slate-300" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'border-green-600 bg-green-50';
      case 'skipped':
        return 'border-amber-500 bg-amber-50';
      default:
        return 'border-slate-300 bg-white';
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="flex gap-4 animate-pulse">
            <div className="w-6 h-6 bg-slate-200 rounded-full" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-slate-200 rounded w-1/3" />
              <div className="h-3 bg-slate-200 rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!steps || steps.length === 0) {
    return (
      <div className="text-center py-8">
        <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-3" />
        <p className="text-slate-600 font-medium">Aucune étape de dossier configurée</p>
        <p className="text-sm text-slate-500 mt-1">
          Les étapes seront créées automatiquement pour ce lot
        </p>
      </div>
    );
  }

  const canCompleteStep = (stepIndex) => {
    if (stepIndex === 0) return true;

    const currentStep = steps[stepIndex];

    if (currentStep.is_automatic) {
      const previousStep = steps[stepIndex - 1];
      if (!previousStep) return true;
      const previousProgress = previousStep.progress;
      return previousProgress.status === 'completed' || previousProgress.status === 'skipped';
    }

    for (let i = stepIndex - 1; i >= 0; i--) {
      const step = steps[i];
      if (step.is_automatic) {
        const stepProgress = step.progress;
        return stepProgress.status === 'completed' || stepProgress.status === 'skipped';
      }
    }

    return true;
  };

  return (
    <div className="space-y-1 relative">
      {steps.map((step, index) => {
        const isLast = index === steps.length - 1;
        const progressItem = step.progress;
        const isPending = progressItem.status === 'pending';
        const isCompleted = progressItem.status === 'completed';
        const isSkipped = progressItem.status === 'skipped';
        const canComplete = canCompleteStep(index);
        const isBlocked = !canComplete && isPending;

        return (
          <div key={step.id} className="relative flex gap-4 pb-8">
            {!isLast && (
              <div className={`absolute left-3 top-8 bottom-0 w-0.5 ${
                isCompleted ? 'bg-green-600' : isSkipped ? 'bg-amber-500' : 'bg-slate-200'
              }`} />
            )}

            <div className="flex-shrink-0 relative z-10">
              {getStatusIcon(progressItem.status, step.is_automatic)}
            </div>

            <div className={`flex-1 border rounded-lg p-4 transition-all ${
              isBlocked ? 'border-slate-200 bg-slate-50 opacity-60' : getStatusColor(progressItem.status)
            }`}>
              <div className="flex items-start justify-between gap-4 mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className={`font-semibold ${isBlocked ? 'text-slate-500' : 'text-slate-900'}`}>
                      {step.label}
                    </h4>
                    {step.is_automatic && (
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                        <Zap className="w-3 h-3 mr-1" />
                        Auto
                      </Badge>
                    )}
                    {step.send_email && (
                      <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                        <Mail className="w-3 h-3 mr-1" />
                        Email
                      </Badge>
                    )}
                    {isBlocked && (
                      <Badge variant="outline" className="bg-slate-100 text-slate-600 border-slate-300">
                        Verrouillé
                      </Badge>
                    )}
                  </div>
                  {step.description && (
                    <p className={`text-sm ${isBlocked ? 'text-slate-500' : 'text-slate-600'}`}>
                      {step.description}
                    </p>
                  )}
                  {isBlocked && (
                    <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Complétez l'étape précédente pour débloquer
                    </p>
                  )}
                  {isPending && canComplete && step.send_email && step.delay_days > 0 && !isBlocked && (
                    <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded">
                      <p className="text-xs text-blue-700 flex items-center gap-1">
                        <Mail className="w-3 h-3" />
                        Email automatique sera envoyé {step.delay_days} jours après complétion de l'étape
                      </p>
                    </div>
                  )}
                </div>

                {!readOnly && !step.is_automatic && isPending && canComplete && (
                  <div className="flex gap-2">
                    {step.send_email && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleResendEmail(step.code)}
                        disabled={sendingEmail[step.code]}
                        className="border-purple-300 text-purple-700 hover:bg-purple-50"
                      >
                        <Send className="w-4 h-4 mr-1" />
                        {sendingEmail[step.code] ? 'Envoi...' : 'Envoyer relance'}
                      </Button>
                    )}
                    <Button
                      size="sm"
                      onClick={() => handleCompleteStep(step.code)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle2 className="w-4 h-4 mr-1" />
                      Compléter
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleSkipStep(step.code)}
                    >
                      <XCircle className="w-4 h-4 mr-1" />
                      Ignorer
                    </Button>
                  </div>
                )}

                {!readOnly && !isPending && (
                  <div className="flex gap-2">
                    {step.send_email && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleResendEmail(step.code)}
                        disabled={sendingEmail[step.code]}
                        className="border-purple-300 text-purple-700 hover:bg-purple-50"
                      >
                        <Send className="w-4 h-4 mr-1" />
                        {sendingEmail[step.code] ? 'Envoi...' : 'Renvoyer'}
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleResetStep(step.code)}
                    >
                      Réinitialiser
                    </Button>
                  </div>
                )}
              </div>

              {isCompleted && progressItem.completed_at && (
                <div className="mt-3 pt-3 border-t border-green-200 space-y-1">
                  <div className="flex items-center gap-2 text-xs text-slate-600">
                    <Clock className="w-3 h-3" />
                    <span>
                      Complété le {format(new Date(progressItem.completed_at), 'dd MMMM yyyy à HH:mm', { locale: fr })}
                    </span>
                  </div>
                  {progressItem.completed_by_user && (
                    <div className="flex items-center gap-2 text-xs text-slate-600">
                      <User className="w-3 h-3" />
                      <span>
                        Par {progressItem.completed_by_user.prenom} {progressItem.completed_by_user.nom}
                      </span>
                    </div>
                  )}
                  {step.send_email && progressItem.email_sent && progressItem.email_sent_at && (
                    <div className="flex items-center gap-2 text-xs text-green-600">
                      <Mail className="w-3 h-3" />
                      <span>
                        Email envoyé le {format(new Date(progressItem.email_sent_at), 'dd MMMM yyyy à HH:mm', { locale: fr })}
                      </span>
                    </div>
                  )}
                  {step.send_email && !progressItem.email_sent && step.delay_days > 0 && progressItem.created_at && (
                    <div className="flex items-center gap-2 text-xs text-blue-600">
                      <Mail className="w-3 h-3" />
                      <span>
                        Email automatique prévu le {format(addDays(new Date(progressItem.created_at), step.delay_days), 'dd MMMM yyyy', { locale: fr })}
                        <span className="text-slate-500"> ({step.delay_days} jours après création)</span>
                      </span>
                    </div>
                  )}
                  {progressItem.notes && (
                    <div className="mt-2 p-2 bg-white rounded border border-green-200">
                      <div className="flex items-start gap-2">
                        <MessageSquare className="w-3 h-3 text-slate-500 mt-0.5 flex-shrink-0" />
                        <p className="text-xs text-slate-700">{progressItem.notes}</p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {isSkipped && progressItem.notes && (
                <div className="mt-3 pt-3 border-t border-amber-200">
                  <div className="p-2 bg-white rounded border border-amber-200">
                    <div className="flex items-start gap-2">
                      <MessageSquare className="w-3 h-3 text-slate-500 mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-slate-700">{progressItem.notes}</p>
                    </div>
                  </div>
                </div>
              )}

              {(() => {
                const stepDocuments = getDocumentsByWorkflowStep(step.code, acquereur, vendeur);
                const hasDocuments = stepDocuments.manquants.length > 0 || stepDocuments.presents.length > 0;

                return hasDocuments && (
                  <div className="mt-3 pt-3 border-t border-slate-200">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="w-4 h-4 text-slate-600" />
                      <span className="text-sm font-medium text-slate-700">Documents requis</span>
                    </div>

                    {stepDocuments.manquants.length > 0 && (
                      <div className="space-y-1 mb-2">
                        {stepDocuments.manquants.map((doc, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-xs text-red-600 bg-red-50 px-2 py-1 rounded">
                            <XCircle className="w-3 h-3 flex-shrink-0" />
                            <span>{doc.label}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {stepDocuments.presents.length > 0 && (
                      <div className="space-y-1">
                        {stepDocuments.presents.map((doc, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
                            <FileCheck className="w-3 h-3 flex-shrink-0" />
                            <span>{doc.label}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })()}

              {!readOnly && !step.is_automatic && isPending && canComplete && (
                <div className="mt-3 pt-3 border-t border-slate-200">
                  <Textarea
                    placeholder="Notes (optionnel)..."
                    value={notes[step.code] || ''}
                    onChange={(e) => setNotes(prev => ({ ...prev, [step.code]: e.target.value }))}
                    className="text-sm"
                    rows={2}
                  />
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
