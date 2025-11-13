import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, Eye, Mail, Phone, Euro, Trash2 } from "lucide-react";
import { motion } from "framer-motion";

const statusColors = {
  prospect: "bg-blue-100 text-blue-800",
  qualifie: "bg-green-100 text-green-800",
  en_negociation: "bg-yellow-100 text-yellow-800",
  compromis: "bg-orange-100 text-orange-800",
  acheteur: "bg-purple-100 text-purple-800",
  perdu: "bg-red-100 text-red-800",
};

const statusLabels = {
  prospect: "Prospect",
  qualifie: "Qualifié",
  en_negociation: "En négociation",
  compromis: "Compromis",
  acheteur: "Acheteur",
  perdu: "Perdu",
};

export default function AcquereurListItem({ acquereur, onEdit, onView, onDelete }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="bg-white rounded-lg shadow hover:shadow-lg transition-all p-4 border border-slate-100"
    >
      <div className="flex items-center gap-4">
        <div className="flex-1 min-w-0 grid md:grid-cols-5 gap-4 items-center">
          <div className="md:col-span-2">
            <h3 className="font-bold text-[#1E40AF] text-sm mb-1 truncate">
              {acquereur.prenom} {acquereur.nom}
            </h3>
            <div className="flex gap-1 flex-wrap">
              <Badge className={`${statusColors[acquereur.statut_commercial]} text-xs`}>
                {statusLabels[acquereur.statut_commercial]}
              </Badge>
            </div>
          </div>

          {acquereur.email && (
            <div className="flex items-center gap-2">
              <Mail className="w-3 h-3 text-slate-400" />
              <a href={`mailto:${acquereur.email}`} className="text-sm text-slate-600 hover:text-[#1E40AF] truncate">
                {acquereur.email}
              </a>
            </div>
          )}

          {acquereur.telephone && (
            <div className="flex items-center gap-2">
              <Phone className="w-3 h-3 text-slate-400" />
              <a href={`tel:${acquereur.telephone}`} className="text-sm text-slate-600 hover:text-[#1E40AF]">
                {acquereur.telephone}
              </a>
            </div>
          )}

          <div className="flex gap-1 justify-end">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onView(acquereur)}
              className="hover:bg-slate-100 h-8 w-8"
              title="Voir"
            >
              <Eye className="w-4 h-4 text-slate-500" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onEdit(acquereur)}
              className="hover:bg-slate-100 h-8 w-8"
              title="Modifier"
            >
              <Edit className="w-4 h-4 text-slate-500" />
            </Button>
            {onDelete && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDelete(acquereur)}
                className="hover:bg-red-50 h-8 w-8"
                title="Supprimer"
              >
                <Trash2 className="w-4 h-4 text-red-500" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}