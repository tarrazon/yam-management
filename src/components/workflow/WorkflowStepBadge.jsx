import { useEffect, useState } from 'react';
import { Badge } from '../ui/badge';
import { Loader2, CheckCircle2, Circle } from 'lucide-react';
import { workflowService } from '../../api/workflowService';

export function WorkflowStepBadge({ lotId, compact = false }) {
  const [currentStep, setCurrentStep] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCurrentStep();
  }, [lotId]);

  const loadCurrentStep = async () => {
    try {
      setLoading(true);
      const step = await workflowService.getCurrentStep(lotId);
      setCurrentStep(step);
    } catch (error) {
      console.error('Error loading current step:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Badge variant="outline" className="bg-slate-50 text-slate-500 border-slate-200">
        <Loader2 className="w-3 h-3 mr-1 animate-spin" />
        Chargement...
      </Badge>
    );
  }

  if (!currentStep) return null;

  const isCompleted = currentStep.status === 'completed';
  const isPending = currentStep.status === 'pending';

  if (compact) {
    return (
      <Badge
        variant="outline"
        className={`
          ${isCompleted ? 'bg-green-50 text-green-700 border-green-200' : 'bg-blue-50 text-blue-700 border-blue-200'}
        `}
      >
        {isCompleted ? (
          <CheckCircle2 className="w-3 h-3 mr-1" />
        ) : (
          <Circle className="w-3 h-3 mr-1" />
        )}
        Étape {currentStep.order_index}
      </Badge>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Badge
        variant="outline"
        className={`
          ${isCompleted ? 'bg-green-50 text-green-700 border-green-200' : 'bg-blue-50 text-blue-700 border-blue-200'}
        `}
      >
        {isCompleted ? (
          <CheckCircle2 className="w-3 h-3 mr-1" />
        ) : (
          <Circle className="w-3 h-3 mr-1" />
        )}
        Étape {currentStep.order_index}/{15}
      </Badge>
      <span className="text-xs text-slate-600 truncate max-w-[200px]">
        {currentStep.label}
      </span>
    </div>
  );
}
