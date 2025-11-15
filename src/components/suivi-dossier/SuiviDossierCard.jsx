import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Users, Eye, Edit, TrendingUp, AlertCircle, ChevronRight, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useDocumentsManquants } from "@/hooks/useDocumentsManquants";

const statusColors = {
  sous_option: "bg-blue-100 text-blue-800 border-blue-200",
  reserve: "bg-yellow-100 text-yellow-800 border-yellow-200",
  compromis: "bg-orange-100 text-orange-800 border-orange-200",
  vendu: "bg-purple-100 text-purple-800 border-purple-200",
};

const statusLabels = {
  sous_option: "Sous option",
  reserve: "Réservé",
  compromis: "Compromis",
  vendu: "Vendu",
};

export default function SuiviDossierCard({ lot, onEdit, onView }) {
  const { totalManquants, hasDocumentsManquants, documentsManquantsAcquereur, documentsManquantsVendeur } = useDocumentsManquants(lot);

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
      return format(new Date(dateString), 'dd MMM yyyy', { locale: fr });
    } catch {
      return '-';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="border-none shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden bg-white">
        <CardHeader className="border-b border-slate-100 pb-4">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-lg font-bold text-[#1E40AF]">
                  Lot {lot.reference}
                </h3>
                <Badge className={`${statusColors[lot.statut]} border`}>
                  {statusLabels[lot.statut]}
                </Badge>
              </div>
              <p className="text-sm text-slate-500">{lot.residence_nom}</p>
            </div>
            <div className="flex gap-1 flex-shrink-0 ml-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onView(lot)}
                className="hover:bg-slate-100"
                title="Voir le détail"
              >
                <Eye className="w-4 h-4 text-slate-500" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onEdit(lot)}
                className="hover:bg-slate-100"
                title="Éditer le suivi"
              >
                <Edit className="w-4 h-4 text-slate-500" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6 space-y-4">
          {/* Mini pipeline de progression */}
          <div className="pb-4 border-b border-slate-100">
            <p className="text-xs text-slate-500 mb-3 font-semibold">Progression du dossier</p>
            <div className="flex items-start justify-between">
              {['sous_option', 'reserve', 'compromis', 'vendu'].map((status, idx) => {
                const statusLabelsShort = {
                  sous_option: "Option",
                  reserve: "Réservé",
                  compromis: "Compromis",
                  vendu: "Vendu"
                };

                const statusPositions = {
                  sous_option: 0,
                  reserve: 1,
                  compromis: 2,
                  vendu: 3,
                };

                const statusDates = {
                  sous_option: lot.date_prise_option,
                  reserve: lot.date_prise_option,
                  compromis: lot.date_signature_compromis,
                  vendu: lot.date_signature_acte
                };

                const bubbleColors = {
                  sous_option: {
                    completed: 'bg-gradient-to-br from-blue-400 to-blue-600 shadow-md',
                    current: 'bg-gradient-to-br from-blue-500 to-blue-700 ring-2 ring-blue-200 shadow-lg',
                    textCurrent: 'text-blue-700',
                    arrowCompleted: 'text-blue-600'
                  },
                  reserve: {
                    completed: 'bg-gradient-to-br from-yellow-400 to-yellow-600 shadow-md',
                    current: 'bg-gradient-to-br from-yellow-500 to-yellow-700 ring-2 ring-yellow-200 shadow-lg',
                    textCurrent: 'text-yellow-700',
                    arrowCompleted: 'text-yellow-600'
                  },
                  compromis: {
                    completed: 'bg-gradient-to-br from-orange-400 to-orange-600 shadow-md',
                    current: 'bg-gradient-to-br from-orange-500 to-orange-700 ring-2 ring-orange-200 shadow-lg',
                    textCurrent: 'text-orange-700',
                    arrowCompleted: 'text-orange-600'
                  },
                  vendu: {
                    completed: 'bg-gradient-to-br from-purple-400 to-purple-600 shadow-md',
                    current: 'bg-gradient-to-br from-purple-500 to-purple-700 ring-2 ring-purple-200 shadow-lg',
                    textCurrent: 'text-purple-700',
                    arrowCompleted: 'text-purple-600'
                  }
                };

                const currentPosition = statusPositions[lot.statut] || 0;
                const isCompleted = idx < currentPosition;
                const isCurrent = idx === currentPosition;
                const dateForStatus = statusDates[status];
                const colors = bubbleColors[status];

                return (
                  <React.Fragment key={status}>
                    <div className="flex flex-col items-center flex-1">
                      <div
                        className={`
                          w-10 h-10 rounded-full flex items-center justify-center transition-all
                          ${isCompleted ? colors.completed : ''}
                          ${isCurrent ? colors.current : ''}
                          ${!isCompleted && !isCurrent ? 'bg-slate-200 border-2 border-slate-300' : ''}
                        `}
                      >
                        {isCompleted ? (
                          <CheckCircle className="w-5 h-5 text-white" strokeWidth={2.5} />
                        ) : (
                          <span className={`text-xs font-bold ${
                            isCurrent ? 'text-white' : 'text-slate-400'
                          }`}>
                            {idx + 1}
                          </span>
                        )}
                      </div>
                      <p className={`
                        text-[10px] mt-1 text-center leading-tight
                        ${isCompleted ? `font-bold ${colors.textCurrent}` : ''}
                        ${isCurrent ? `font-bold ${colors.textCurrent}` : ''}
                        ${!isCompleted && !isCurrent ? 'text-slate-400' : ''}
                      `}>
                        {statusLabelsShort[status]}
                      </p>
                      {(isCompleted || isCurrent) && dateForStatus && (
                        <p className="text-[9px] text-slate-500 mt-0.5 text-center">
                          {formatDate(dateForStatus)}
                        </p>
                      )}
                    </div>
                    {idx < 3 && (
                      <div className="flex items-center justify-center px-1 pt-3">
                        <ChevronRight
                          className={`
                            w-5 h-5 transition-all
                            ${isCompleted ? colors.arrowCompleted : 'text-slate-300'}
                          `}
                          strokeWidth={2.5}
                        />
                      </div>
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>

          {lot.prix_fai != null && (
            <div className="pb-4 border-b border-slate-100">
              <p className="text-xs text-slate-500 mb-1">Prix FAI</p>
              <p className="text-2xl font-bold text-[#1E40AF]">
                {lot.prix_fai.toLocaleString('fr-FR')} €
              </p>
            </div>
          )}

          {(lot.partenaire_nom || lot.acquereur_nom) && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Users className="w-3 h-3" />
                <span className="font-semibold">Intervenants</span>
              </div>
              {lot.partenaire_nom && (
                <div>
                  <p className="text-xs text-slate-500">Partenaire</p>
                  <p className="font-semibold text-slate-700">{lot.partenaire_nom}</p>
                </div>
              )}
              {lot.acquereur_nom && (
                <div>
                  <p className="text-xs text-slate-500">Acquéreur</p>
                  <p className="font-semibold text-slate-700">{lot.acquereur_nom}</p>
                </div>
              )}
            </div>
          )}

          {hasDocumentsManquants && (
            <div className="pt-4 border-t border-slate-100 space-y-2">
              {documentsManquantsAcquereur.length > 0 && (
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-xs text-blue-700 font-bold flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Acquéreur : {documentsManquantsAcquereur.length} doc{documentsManquantsAcquereur.length > 1 ? 's' : ''} manquant{documentsManquantsAcquereur.length > 1 ? 's' : ''}
                  </p>
                  <p className="text-xs text-blue-600 mt-1">
                    {lot.acquereur_nom}
                  </p>
                </div>
              )}
              {documentsManquantsVendeur.length > 0 && (
                <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                  <p className="text-xs text-orange-700 font-bold flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    Vendeur : {documentsManquantsVendeur.length} doc{documentsManquantsVendeur.length > 1 ? 's' : ''} manquant{documentsManquantsVendeur.length > 1 ? 's' : ''}
                  </p>
                  <p className="text-xs text-orange-600 mt-1">
                    {lot.vendeur_nom}
                  </p>
                </div>
              )}
            </div>
          )}

          {(lot.observations_acquereurs || lot.negociation_en_cours) && (
            <div className="pt-4 border-t border-slate-100">
              <p className="text-xs text-amber-600 font-medium flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                Points d'attention en cours
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}