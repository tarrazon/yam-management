import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Users, Eye, Edit, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

const statusColors = {
  sous_option: "bg-blue-100 text-blue-800 border-blue-200",
  allotement: "bg-cyan-100 text-cyan-800 border-cyan-200",
  reserve: "bg-yellow-100 text-yellow-800 border-yellow-200",
  compromis: "bg-orange-100 text-orange-800 border-orange-200",
  vendu: "bg-purple-100 text-purple-800 border-purple-200",
};

const statusLabels = {
  sous_option: "Sous option",
  allotement: "Allotement",
  reserve: "Réservé",
  compromis: "Compromis",
  vendu: "Vendu",
};

export default function SuiviDossierCard({ lot, onEdit, onView }) {
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

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Calendar className="w-3 h-3" />
              <span className="font-semibold">Dates clés</span>
            </div>
            {lot.date_prise_option && (
              <div>
                <p className="text-xs text-slate-500">Prise d'option</p>
                <p className="font-semibold text-green-600">{formatDate(lot.date_prise_option)}</p>
              </div>
            )}
            {lot.date_signature_compromis && (
              <div>
                <p className="text-xs text-slate-500">Compromis signé</p>
                <p className="font-semibold text-orange-600">{formatDate(lot.date_signature_compromis)}</p>
              </div>
            )}
            {lot.date_signature_acte && (
              <div>
                <p className="text-xs text-slate-500">Acte signé</p>
                <p className="font-semibold text-purple-600">{formatDate(lot.date_signature_acte)}</p>
              </div>
            )}
          </div>

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