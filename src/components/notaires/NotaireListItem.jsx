import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, Eye, Mail, Phone, FileCheck, Trash2 } from "lucide-react";
import { motion } from "framer-motion";

const typeColors = {
  vendeur: "bg-blue-100 text-blue-800",
  acquereur: "bg-green-100 text-green-800",
  mixte: "bg-purple-100 text-purple-800",
};

const typeLabels = {
  vendeur: "Vendeur",
  acquereur: "Acquéreur",
  mixte: "Mixte",
};

export default function NotaireListItem({ notaire, onEdit, onView, onDelete }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="bg-white rounded-lg shadow hover:shadow-lg transition-all p-4 border border-slate-100"
    >
      <div className="flex items-center gap-4">
        <div className="flex-1 min-w-0 grid md:grid-cols-5 gap-4 items-center">
          <div className="md:col-span-2 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#1E40AF] to-[#1E3A8A] flex items-center justify-center flex-shrink-0">
              <FileCheck className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-bold text-[#1E40AF] text-sm mb-1 truncate">
                {notaire.prenom} {notaire.nom}
              </h3>
              <p className="text-xs text-slate-500 truncate">{notaire.etude}</p>
              {notaire.type_notaire && (
                <Badge className={`${typeColors[notaire.type_notaire]} text-xs mt-1`}>
                  {typeLabels[notaire.type_notaire]}
                </Badge>
              )}
            </div>
          </div>

          {notaire.email && (
            <div className="flex items-center gap-2">
              <Mail className="w-3 h-3 text-slate-400" />
              <a href={`mailto:${notaire.email}`} className="text-sm text-slate-600 hover:text-[#1E40AF] truncate">
                {notaire.email}
              </a>
            </div>
          )}

          {notaire.telephone && (
            <div className="flex items-center gap-2">
              <Phone className="w-3 h-3 text-slate-400" />
              <a href={`tel:${notaire.telephone}`} className="text-sm text-slate-600 hover:text-[#1E40AF]">
                {notaire.telephone}
              </a>
            </div>
          )}

          <div className="flex gap-1 justify-end">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onView(notaire)}
              className="hover:bg-slate-100 h-8 w-8"
              title="Voir"
            >
              <Eye className="w-4 h-4 text-slate-500" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onEdit(notaire)}
              className="hover:bg-slate-100 h-8 w-8"
              title="Modifier"
            >
              <Edit className="w-4 h-4 text-slate-500" />
            </Button>
            {onDelete && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDelete(notaire)}
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