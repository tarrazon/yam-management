import React from "react";
import { CheckCircle, FileCheck, FileSignature, Home, Archive, TrendingUp, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

const PIPELINE_STEPS = [
  {
    id: "option",
    label: "Sous option",
    icon: FileCheck,
    position: 0,
  },
  {
    id: "reservation",
    label: "Réservé",
    icon: FileSignature,
    position: 1,
  },
  {
    id: "compromis",
    label: "Compromis",
    icon: FileSignature,
    position: 2,
  },
  {
    id: "vente",
    label: "Vendu",
    icon: Home,
    position: 3,
  },
  {
    id: "suivi",
    label: "Suivi post-vente",
    icon: TrendingUp,
    position: 4,
  },
  {
    id: "archive",
    label: "Archivage",
    icon: Archive,
    position: 5,
  },
];

const getStepStatus = (stepIndex, currentStatut, phasePostVente) => {
  const statutPositions = {
    sous_option: 0,
    reserve: 1,
    compromis: 2,
    vendu: 3,
  };

  let currentPosition = statutPositions[currentStatut] || 0;

  if (currentStatut === 'vendu' && phasePostVente) {
    if (phasePostVente === 'suivi_post_vente') {
      currentPosition = 4;
    } else if (phasePostVente === 'archive') {
      currentPosition = 5;
    }
  }

  if (stepIndex < currentPosition) return "completed";
  if (stepIndex === currentPosition) return "current";
  return "pending";
};

export default function SuiviPipeline({ lot }) {
  const currentStatut = lot.statut;
  const phasePostVente = lot.phase_post_vente;

  const formatDate = (dateString) => {
    if (!dateString) return null;
    try {
      return format(new Date(dateString), 'dd MMM yyyy', { locale: fr });
    } catch {
      return null;
    }
  };

  const getDateForStep = (stepId) => {
    switch (stepId) {
      case 'option':
      case 'reservation':
        return lot.date_prise_option;
      case 'compromis':
        return lot.date_signature_compromis;
      case 'vente':
        return lot.date_signature_acte;
      default:
        return null;
    }
  };

  return (
    <div className="w-full py-8">
      <div className="relative">
        {/* Étapes avec flèches */}
        <div className="flex items-start justify-between">
          {PIPELINE_STEPS.map((step, index) => {
            const status = getStepStatus(index, currentStatut, phasePostVente);
            const Icon = step.icon;

            const isCompleted = status === "completed";
            const isCurrent = status === "current";
            const isPending = status === "pending";

            const dateForStep = getDateForStep(step.id);
            const formattedDate = formatDate(dateForStep);

            return (
              <React.Fragment key={step.id}>
                {/* Étape */}
                <div className="flex flex-col items-center text-center flex-1">
                  {/* Icône de l'étape */}
                  <div className="relative z-10 mb-3">
                    <div
                      className={`
                        w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300
                        ${isCompleted ? 'bg-gradient-to-br from-green-400 to-green-600 shadow-lg shadow-green-200' : ''}
                        ${isCurrent ? 'bg-gradient-to-br from-blue-500 to-blue-700 shadow-xl shadow-blue-300 scale-110' : ''}
                        ${isPending ? 'bg-slate-200 border-2 border-slate-300' : ''}
                      `}
                    >
                      {isCompleted ? (
                        <CheckCircle className="w-8 h-8 text-white" strokeWidth={2.5} />
                      ) : (
                        <Icon
                          className={`
                            w-8 h-8
                            ${isCurrent ? 'text-white' : ''}
                            ${isPending ? 'text-slate-400' : ''}
                          `}
                          strokeWidth={isCurrent ? 2.5 : 2}
                        />
                      )}
                    </div>

                    {/* Indicateur de progression pour l'étape en cours */}
                    {isCurrent && (
                      <div className="absolute -inset-2 rounded-full border-2 border-blue-400 animate-ping opacity-75" />
                    )}
                  </div>

                  {/* Label de l'étape */}
                  <div className="space-y-1">
                    <p
                      className={`
                        text-xs font-bold leading-tight
                        ${isCompleted ? 'text-green-700' : ''}
                        ${isCurrent ? 'text-blue-700' : ''}
                        ${isPending ? 'text-slate-400' : ''}
                      `}
                    >
                      {step.label}
                    </p>
                    {(isCompleted || isCurrent) && formattedDate && (
                      <p className="text-[10px] text-slate-600 font-medium">
                        {formattedDate}
                      </p>
                    )}
                  </div>
                </div>

                {/* Flèche entre les étapes */}
                {index < PIPELINE_STEPS.length - 1 && (
                  <div className="flex items-center justify-center px-2 pt-6">
                    <ChevronRight
                      className={`
                        w-8 h-8 transition-all duration-500
                        ${isCompleted ? 'text-green-600' : 'text-slate-300'}
                      `}
                      strokeWidth={3}
                    />
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Légende des dates clés */}
      <div className="mt-8 p-4 bg-slate-50 rounded-lg border border-slate-200">
        <h4 className="text-sm font-semibold text-slate-700 mb-3">Dates clés</h4>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          {lot.date_premier_contact && (
            <div className="flex flex-col">
              <span className="text-slate-500">Premier contact</span>
              <span className="font-semibold text-slate-700">
                {new Date(lot.date_premier_contact).toLocaleDateString('fr-FR')}
              </span>
            </div>
          )}
          {lot.date_prise_option && (
            <div className="flex flex-col">
              <span className="text-slate-500">Prise d'option</span>
              <span className="font-semibold text-blue-700">
                {new Date(lot.date_prise_option).toLocaleDateString('fr-FR')}
              </span>
            </div>
          )}
          {lot.date_signature_compromis && (
            <div className="flex flex-col">
              <span className="text-slate-500">Signature compromis</span>
              <span className="font-semibold text-orange-700">
                {new Date(lot.date_signature_compromis).toLocaleDateString('fr-FR')}
              </span>
            </div>
          )}
          {lot.date_signature_acte && (
            <div className="flex flex-col">
              <span className="text-slate-500">Signature acte</span>
              <span className="font-semibold text-green-700">
                {new Date(lot.date_signature_acte).toLocaleDateString('fr-FR')}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
