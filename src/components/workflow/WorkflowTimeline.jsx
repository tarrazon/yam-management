import { useEffect, useState } from 'react';
import {
  CheckCircle2,
  Circle,
  XCircle,
  Clock,
  User,
  Mail,
  Zap,
  MessageSquare
} from 'lucide-react';
import { workflowService } from '../../api/workflowService';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export function WorkflowTimeline({ lotId, onUpdate }) {
  const [progress, setProgress] = useState([]);
  const [steps, setSteps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState({});

  useEffect(() => {
    loadWorkflow();
  }, [lotId]);

  const loadWorkflow = async () => {
    try {
      setLoading(true);
      const [progressData, stepsData] = await Promise.all([
        workflowService.getLotWorkflowProgress(lotId),
        workflowService.getWorkflowSteps()
      ]);

      const progressMap = {};
      progressData.forEach(p => {
        progressMap[p.step_code] = p;
      });

      const combined = stepsData.map(step => ({
        ...step,
        progress: progressMap[step.code] || {
          status: 'pending',
          step_code: step.code,
          lot_id: lotId
        }
      }));

      setSteps(combined);
      setProgress(progressData);
    } catch (error) {
      console.error('Error loading workflow:', error);
      toast.error('Erreur lors du chargement du workflow');
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

  return (
    <div className="space-y-1 relative">
      {steps.map((step, index) => {
        const isLast = index === steps.length - 1;
        const progressItem = step.progress;
        const isPending = progressItem.status === 'pending';
        const isCompleted = progressItem.status === 'completed';
        const isSkipped = progressItem.status === 'skipped';

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

            <div className={`flex-1 border rounded-lg p-4 transition-all ${getStatusColor(progressItem.status)}`}>
              <div className="flex items-start justify-between gap-4 mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-slate-900">{step.label}</h4>
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
                  </div>
                  {step.description && (
                    <p className="text-sm text-slate-600">{step.description}</p>
                  )}
                </div>

                {!step.is_automatic && isPending && (
                  <div className="flex gap-2">
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

                {!isPending && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleResetStep(step.code)}
                  >
                    Réinitialiser
                  </Button>
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
                  {progressItem.email_sent && (
                    <div className="flex items-center gap-2 text-xs text-green-600">
                      <Mail className="w-3 h-3" />
                      <span>Email envoyé</span>
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

              {!step.is_automatic && isPending && (
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
