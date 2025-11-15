import React from "react";
import { CheckCircle, Circle, Users, FileCheck, FileSignature, Home, Archive, TrendingUp } from "lucide-react";

const PIPELINE_STEPS = [
  {
    id: "prospect",
    label: "Prospect partenaire",
    icon: Users,
    position: 0,
  },
  {
    id: "option",
    label: "Option accordée",
    sublabel: "(en attente dossier)",
    icon: FileCheck,
    position: 1,
  },
  {
    id: "validation",
    label: "Dossier complet",
    sublabel: "Validation interne",
    icon: FileCheck,
    position: 2,
  },
  {
    id: "reservation",
    label: "Réservation formalisée",
    icon: FileSignature,
    position: 3,
  },
  {
    id: "preparation",
    label: "Préparation vente",
    sublabel: "Acte en cours",
    icon: FileSignature,
    position: 4,
  },
  {
    id: "vente",
    label: "Vente finalisée",
    sublabel: "Transfert propriété",
    icon: Home,
    position: 5,
  },
  {
    id: "suivi",
    label: "Suivi post-vente",
    icon: TrendingUp,
    position: 6,
  },
  {
    id: "archive",
    label: "Archivage / Clôture",
    icon: Archive,
    position: 7,
  },
];

const getStepStatus = (stepIndex, currentStatut, phasePostVente) => {
  // Mapping des statuts vers leur position dans le pipeline
  const statutPositions = {
    sous_option: 1,
    allotement: 2,
    reserve: 3,
    compromis: 4,
    vendu: 5,
  };

  let currentPosition = statutPositions[currentStatut] || 0;

  // Si le statut est "vendu" et qu'on a une phase post-vente, ajuster la position
  if (currentStatut === 'vendu' && phasePostVente) {
    if (phasePostVente === 'suivi_post_vente') {
      currentPosition = 6;
    } else if (phasePostVente === 'archive') {
      currentPosition = 7;
    }
  }

  if (stepIndex < currentPosition) return "completed";
  if (stepIndex === currentPosition) return "current";
  return "pending";
};

export default function SuiviPipeline({ lot }) {
  const currentStatut = lot.statut;
  const phasePostVente = lot.phase_post_vente;

  return (
    <div className="w-full py-8">
      <div className="relative">
        {/* Ligne de connexion */}
        <div className="absolute top-8 left-0 right-0 h-1 bg-slate-200 hidden md:block"
          style={{ width: 'calc(100% - 48px)', marginLeft: '24px' }} />

        {/* Étapes */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4 relative">
          {PIPELINE_STEPS.map((step, index) => {
            const status = getStepStatus(index, currentStatut, phasePostVente);
            const Icon = step.icon;

            const isCompleted = status === "completed";
            const isCurrent = status === "current";
            const isPending = status === "pending";

            return (
              <div key={step.id} className="flex flex-col items-center text-center">
                {/* Icône de l'étape */}
                <div className="relative z-10 mb-3">
                  <div
                    className={`
                      w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300
                      ${isCompleted ? 'bg-green-500 ring-4 ring-green-100' : ''}
                      ${isCurrent ? 'bg-blue-500 ring-4 ring-blue-100 scale-110 shadow-lg' : ''}
                      ${isPending ? 'bg-slate-200 ring-4 ring-slate-100' : ''}
                    `}
                  >
                    {isCompleted ? (
                      <CheckCircle className="w-8 h-8 text-white" />
                    ) : (
                      <Icon
                        className={`
                          w-8 h-8
                          ${isCurrent ? 'text-white' : ''}
                          ${isPending ? 'text-slate-400' : ''}
                        `}
                      />
                    )}
                  </div>

                  {/* Indicateur de progression pour l'étape en cours */}
                  {isCurrent && (
                    <div className="absolute -inset-1 rounded-full border-4 border-blue-300 animate-ping opacity-75" />
                  )}
                </div>

                {/* Label de l'étape */}
                <div className="space-y-1">
                  <p
                    className={`
                      text-xs font-semibold leading-tight
                      ${isCompleted ? 'text-green-700' : ''}
                      ${isCurrent ? 'text-blue-700' : ''}
                      ${isPending ? 'text-slate-400' : ''}
                    `}
                  >
                    {step.label}
                  </p>
                  {step.sublabel && (
                    <p
                      className={`
                        text-xs leading-tight
                        ${isCompleted ? 'text-green-600' : ''}
                        ${isCurrent ? 'text-blue-600' : ''}
                        ${isPending ? 'text-slate-400' : ''}
                      `}
                    >
                      {step.sublabel}
                    </p>
                  )}
                </div>

                {/* Barre de progression verticale sur mobile */}
                {index < PIPELINE_STEPS.length - 1 && (
                  <div className="md:hidden w-1 h-12 mt-2 bg-slate-200">
                    <div
                      className={`
                        w-full transition-all duration-500
                        ${isCompleted ? 'h-full bg-green-500' : 'h-0'}
                      `}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Barre de progression horizontale sur desktop */}
        <div className="absolute top-8 left-0 right-0 h-1 hidden md:block pointer-events-none"
          style={{ width: 'calc(100% - 48px)', marginLeft: '24px' }}>
          <div
            className="h-full bg-gradient-to-r from-green-500 to-blue-500 transition-all duration-700 ease-in-out"
            style={{
              width: `${((PIPELINE_STEPS.findIndex(s => getStepStatus(PIPELINE_STEPS.indexOf(s), currentStatut, phasePostVente) === "current") + 1) / PIPELINE_STEPS.length) * 100}%`,
            }}
          />
        </div>
      </div>

      {/* Légende des dates clés */}
      <div className="mt-8 p-4 bg-slate-50 rounded-lg">
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
