import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, Eye, Calendar, Users, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useDocumentsManquants } from "@/hooks/useDocumentsManquants";

const statusColors = {
  sous_option: "bg-blue-100 text-blue-800",
  allotement: "bg-cyan-100 text-cyan-800",
  reserve: "bg-yellow-100 text-yellow-800",
  compromis: "bg-orange-100 text-orange-800",
  vendu: "bg-purple-100 text-purple-800",
};

const statusLabels = {
  sous_option: "Sous option",
  allotement: "Allotement",
  reserve: "Réservé",
  compromis: "Compromis",
  vendu: "Vendu",
};

export default function SuiviDossierListItem({ lot, onEdit, onView }) {
  const { totalManquants, hasDocumentsManquants } = useDocumentsManquants(lot);

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

          <div>
            <p className="text-xs text-slate-500">Prise d'option</p>
            <p className="font-semibold text-green-600 text-sm">{formatDate(lot.date_prise_option)}</p>
          </div>

          <div className="flex items-center justify-center">
            {hasDocumentsManquants ? (
              <div className="flex items-center gap-1 px-2 py-1 bg-orange-100 rounded-full">
                <AlertCircle className="w-4 h-4 text-orange-600" />
                <span className="text-xs font-bold text-orange-700">{totalManquants}</span>
              </div>
            ) : (
              <span className="text-xs text-slate-400">-</span>
            )}
          </div>

          <div className="flex gap-1 justify-end">
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
    </motion.div>
  );
}