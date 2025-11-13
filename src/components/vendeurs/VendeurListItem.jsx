import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, Eye, Mail, Phone, Building2, User, Trash2 } from "lucide-react";
import { motion } from "framer-motion";

const statusColors = {
  prospect: "bg-blue-100 text-blue-800",
  en_negociation: "bg-yellow-100 text-yellow-800",
  mandate: "bg-green-100 text-green-800",
  vendu: "bg-purple-100 text-purple-800",
  perdu: "bg-red-100 text-red-800",
};

const statusLabels = {
  prospect: "Prospect",
  en_negociation: "En négociation",
  mandate: "Mandaté",
  vendu: "Vendu",
  perdu: "Perdu",
};

export default function VendeurListItem({ vendeur, lotsAssocies = [], onEdit, onView, onDelete }) {
  const isEntreprise = vendeur.type_vendeur === 'entreprise';

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
              {isEntreprise ? (
                <Building2 className="w-5 h-5 text-white" />
              ) : (
                <User className="w-5 h-5 text-white" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-bold text-[#1E40AF] text-sm mb-1 truncate">
                {isEntreprise ? vendeur.nom : `${vendeur.prenom} ${vendeur.nom}`}
              </h3>
              <div className="flex gap-1 flex-wrap">
                <Badge className={`${statusColors[vendeur.statut_commercial]} text-xs`}>
                  {statusLabels[vendeur.statut_commercial]}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {isEntreprise ? "Entreprise" : "Particulier"}
                </Badge>
              </div>
            </div>
          </div>

          {vendeur.email && (
            <div className="flex items-center gap-2">
              <Mail className="w-3 h-3 text-slate-400" />
              <a href={`mailto:${vendeur.email}`} className="text-sm text-slate-600 hover:text-[#1E40AF] truncate">
                {vendeur.email}
              </a>
            </div>
          )}

          {vendeur.telephone && (
            <div className="flex items-center gap-2">
              <Phone className="w-3 h-3 text-slate-400" />
              <a href={`tel:${vendeur.telephone}`} className="text-sm text-slate-600 hover:text-[#1E40AF]">
                {vendeur.telephone}
              </a>
            </div>
          )}

          <div className="flex gap-1 justify-end">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onView(vendeur)}
              className="hover:bg-slate-100 h-8 w-8"
              title="Voir"
            >
              <Eye className="w-4 h-4 text-slate-500" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onEdit(vendeur)}
              className="hover:bg-slate-100 h-8 w-8"
              title="Modifier"
            >
              <Edit className="w-4 h-4 text-slate-500" />
            </Button>
            {onDelete && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDelete(vendeur)}
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