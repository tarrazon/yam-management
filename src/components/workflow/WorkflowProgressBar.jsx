import { useEffect, useState } from 'react';
import { CheckCircle2, Circle, Clock } from 'lucide-react';
import { workflowService } from '../../api/workflowService';
import { Progress } from '../ui/progress';

export function WorkflowProgressBar({ lotId, compact = false }) {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSummary();
  }, [lotId]);

  const loadSummary = async () => {
    try {
      setLoading(true);
      const data = await workflowService.getWorkflowSummary(lotId);
      setSummary(data);
    } catch (error) {
      console.error('Error loading workflow summary:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !summary) {
    return (
      <div className="flex items-center gap-2">
        <div className="h-2 w-24 bg-slate-200 rounded animate-pulse" />
      </div>
    );
  }

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <Progress value={summary.percentage} className="h-2 w-24" />
        <span className="text-xs font-medium text-slate-600 whitespace-nowrap">
          {summary.completed}/{summary.total}
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-slate-400" />
          <span className="text-sm font-medium text-slate-700">Progression</span>
        </div>
        <span className="text-sm font-bold text-[#1E40AF]">{summary.percentage}%</span>
      </div>
      <Progress value={summary.percentage} className="h-2" />
      <div className="flex items-center gap-4 text-xs text-slate-600">
        <div className="flex items-center gap-1">
          <CheckCircle2 className="w-3 h-3 text-green-600" />
          <span>{summary.completed} complétées</span>
        </div>
        <div className="flex items-center gap-1">
          <Circle className="w-3 h-3 text-slate-400" />
          <span>{summary.pending} en attente</span>
        </div>
        {summary.skipped > 0 && (
          <div className="flex items-center gap-1">
            <Circle className="w-3 h-3 text-amber-500" />
            <span>{summary.skipped} ignorées</span>
          </div>
        )}
      </div>
    </div>
  );
}
