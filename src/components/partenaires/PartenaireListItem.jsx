import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, Eye, Mail, Phone, Handshake, Trash2 } from "lucide-react";
import { motion } from "framer-motion";

const statusColors = {
  actif: "bg-green-100 text-green-800",
  inactif: "bg-slate-100 text-slate-800",
  a_relancer: "bg-yellow-100 text-yellow-800",
  suspendu: "bg-red-100 text-red-800",
};

const statusLabels = {
  actif: "Actif",
  inactif: "Inactif",
  a_relancer: "À relancer",
  suspendu: "Suspendu",
};

const typeColors = {
  cgp: "bg-blue-100 text-blue-800",
  plateforme: "bg-purple-100 text-purple-800",
  courtier: "bg-indigo-100 text-indigo-800",
  notaire: "bg-amber-100 text-amber-800",
  diffuseur_web: "bg-pink-100 text-pink-800",
  autre: "bg-slate-100 text-slate-800",
};

export default function PartenaireListItem({ partenaire, onEdit, onView, onDelete }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="bg-white rounded-lg shadow hover:shadow-lg transition-all p-4 border border-slate-100"
    >
      <div className="flex items-center gap-4">
        <div className="flex-1 min-w-0 grid md:grid-cols-6 gap-4 items-center">
          <div className="md:col-span-2 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#1E40AF] to-[#1E3A8A] flex items-center justify-center flex-shrink-0">
              <Handshake className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-bold text-[#1E40AF] text-sm mb-1 truncate">
                {partenaire.nom}
              </h3>
              <div className="flex gap-1 flex-wrap">
                <Badge className={`${statusColors[partenaire.statut]} text-xs`}>
                  {statusLabels[partenaire.statut]}
                </Badge>
                <Badge className={`${typeColors[partenaire.type_partenaire]} text-xs`}>
                  {partenaire.type_partenaire.toUpperCase()}
                </Badge>
              </div>
            </div>
          </div>

          {partenaire.email && (
            <div className="flex items-center gap-2">
              <Mail className="w-3 h-3 text-slate-400" />
              <a href={`mailto:${partenaire.email}`} className="text-sm text-slate-600 hover:text-[#1E40AF] truncate">
                {partenaire.email}
              </a>
            </div>
          )}

          {partenaire.telephone && (
            <div className="flex items-center gap-2">
              <Phone className="w-3 h-3 text-slate-400" />
              <a href={`tel:${partenaire.telephone}`} className="text-sm text-slate-600 hover:text-[#1E40AF]">
                {partenaire.telephone}
              </a>
            </div>
          )}

          {partenaire.created_by && (
            <div className="flex flex-col">
              <span className="text-xs text-slate-500">Créé par</span>
              <span className="text-sm text-slate-700 truncate font-medium">{partenaire.created_by}</span>
            </div>
          )}

          <div className="flex gap-1 justify-end">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onView(partenaire)}
              className="hover:bg-slate-100 h-8 w-8"
              title="Voir"
            >
              <Eye className="w-4 h-4 text-slate-500" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onEdit(partenaire)}
              className="hover:bg-slate-100 h-8 w-8"
              title="Modifier"
            >
              <Edit className="w-4 h-4 text-slate-500" />
            </Button>
            {onDelete && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDelete(partenaire)}
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