import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, Eye, Calendar, Users, AlertCircle, ChevronRight, CheckCircle, Circle } from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useDocumentsManquants } from "@/hooks/useDocumentsManquants";

const statusColors = {
  sous_option: "bg-blue-100 text-blue-800",
  reserve: "bg-yellow-100 text-yellow-800",
  compromis: "bg-orange-100 text-orange-800",
  vendu: "bg-purple-100 text-purple-800",
};

const statusLabels = {
  sous_option: "Sous option",
  reserve: "Réservé",
  compromis: "Compromis",
  vendu: "Vendu",
};

const MINI_PIPELINE_STEPS = ['sous_option', 'reserve', 'compromis', 'vendu'];

export default function SuiviDossierListItem({ lot, onEdit, onView, hideVendeur = false }) {
  const { totalManquants, hasDocumentsManquants, documentsManquantsAcquereur, documentsManquantsVendeur } = useDocumentsManquants(lot);

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
      return format(new Date(dateString), 'dd MMM yyyy', { locale: fr });
    } catch {
      return '-';
    }
  };

  const getStepStatus = (step) => {
    const currentPosition = MINI_PIPELINE_STEPS.indexOf(lot.statut);
    const stepPosition = MINI_PIPELINE_STEPS.indexOf(step);

    if (stepPosition < currentPosition) return 'completed';
    if (stepPosition === currentPosition) return 'current';
    return 'pending';
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className={`bg-white rounded-lg shadow hover:shadow-lg transition-all p-4 border ${
        hasDocumentsManquants ? 'border-orange-300 border-l-4' : 'border-slate-100'
      }`}
    >
      <div className="flex items-center gap-4">
        <div className="flex-1 min-w-0 grid md:grid-cols-7 gap-4 items-center">
          <div className="md:col-span-2">
            <h3 className="font-bold text-[#1E40AF] text-sm mb-1">Lot {lot.reference}</h3>
            <p className="text-xs text-slate-500 truncate">{lot.residence_nom}</p>
            <Badge className={`${statusColors[lot.statut]} text-xs mt-1`}>
              {statusLabels[lot.statut]}
            </Badge>
          </div>

          <div>
            <p className="text-xs text-slate-500">Prix FAI</p>
            <p className="font-bold text-[#1E40AF] text-sm">
              {lot.prix_fai != null ? `${lot.prix_fai.toLocaleString('fr-FR')} €` : '-'}
            </p>
          </div>

          <div>
            {lot.acquereur_nom ? (
              <>
                <p className="text-xs text-slate-500">Acquéreur</p>
                <p className="font-semibold text-slate-700 text-sm truncate">{lot.acquereur_nom}</p>
              </>
            ) : (
              <>
                <p className="text-xs text-slate-500">Partenaire</p>
                <p className="font-semibold text-slate-700 text-sm truncate">{lot.partenaire_nom || '-'}</p>
              </>
            )}
          </div>

          <div className="md:col-span-2">
            <p className="text-xs text-slate-500 mb-2">Progression</p>
            <div className="flex items-center gap-1">
              {MINI_PIPELINE_STEPS.map((step, index) => {
                const status = getStepStatus(step);

                const stepColors = {
                  sous_option: {
                    completed: 'bg-blue-500',
                    current: 'bg-blue-600 ring-2 ring-blue-200',
                    arrow: 'text-blue-500'
                  },
                  reserve: {
                    completed: 'bg-yellow-500',
                    current: 'bg-yellow-600 ring-2 ring-yellow-200',
                    arrow: 'text-yellow-500'
                  },
                  compromis: {
                    completed: 'bg-orange-500',
                    current: 'bg-orange-600 ring-2 ring-orange-200',
                    arrow: 'text-orange-500'
                  },
                  vendu: {
                    completed: 'bg-purple-500',
                    current: 'bg-purple-600 ring-2 ring-purple-200',
                    arrow: 'text-purple-500'
                  }
                };

                const colors = stepColors[step];

                return (
                  <React.Fragment key={step}>
                    <div
                      className={`
                        w-6 h-6 rounded-full flex items-center justify-center transition-all
                        ${status === 'completed' ? colors.completed : ''}
                        ${status === 'current' ? colors.current : ''}
                        ${status === 'pending' ? 'bg-slate-200' : ''}
                      `}
                      title={statusLabels[step]}
                    >
                      {status === 'completed' ? (
                        <CheckCircle className="w-3 h-3 text-white" strokeWidth={3} />
                      ) : (
                        <Circle className="w-3 h-3 text-white" strokeWidth={2} />
                      )}
                    </div>
                    {index < MINI_PIPELINE_STEPS.length - 1 && (
                      <ChevronRight
                        className={`
                          w-3 h-3
                          ${status === 'completed' ? colors.arrow : 'text-slate-300'}
                        `}
                        strokeWidth={3}
                      />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-3 justify-end">
            {hasDocumentsManquants && (
              <div className="flex items-center gap-2">
                {documentsManquantsAcquereur.length > 0 && (
                  <div className="flex items-center gap-1 px-2 py-1 bg-blue-100 rounded-full" title={`Acquéreur: ${documentsManquantsAcquereur.length} document(s) manquant(s)`}>
                    <Users className="w-3 h-3 text-blue-600" />
                    <span className="text-xs font-bold text-blue-700">{documentsManquantsAcquereur.length}</span>
                  </div>
                )}
                {!hideVendeur && documentsManquantsVendeur.length > 0 && (
                  <div className="flex items-center gap-1 px-2 py-1 bg-orange-100 rounded-full" title={`Vendeur: ${documentsManquantsVendeur.length} document(s) manquant(s)`}>
                    <AlertCircle className="w-3 h-3 text-orange-600" />
                    <span className="text-xs font-bold text-orange-700">{documentsManquantsVendeur.length}</span>
                  </div>
                )}
              </div>
            )}
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onView(lot)}
                className="hover:bg-slate-100 h-8 w-8"
                title="Voir"
              >
                <Eye className="w-4 h-4 text-slate-500" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onEdit(lot)}
                className="hover:bg-slate-100 h-8 w-8"
                title="Éditer"
              >
                <Edit className="w-4 h-4 text-slate-500" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
