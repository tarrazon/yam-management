
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, Eye, Building2, MapPin, Users, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

const statusColors = {
  active: "bg-green-100 text-green-800",
  en_renovation: "bg-yellow-100 text-yellow-800",
  en_liquidation: "bg-red-100 text-red-800",
  fermee: "bg-slate-100 text-slate-800",
};

const statusLabels = {
  active: "Active",
  en_renovation: "En rénovation",
  en_liquidation: "En liquidation",
  fermee: "Fermée",
};

const typeColors = {
  ehpad: "bg-purple-100 text-purple-800",
  etudiante: "bg-blue-100 text-blue-800",
  affaires: "bg-indigo-100 text-indigo-800",
  tourisme: "bg-amber-100 text-amber-800",
  senior: "bg-rose-100 text-rose-800",
};

export default function ResidenceGestionListItem({ residence, onEdit, onView, onDelete }) {
  const firstPhoto = residence.documents?.photos?.[0];

  const { data: lots = [] } = useQuery({
    queryKey: ['lots_lmnp'],
    queryFn: () => base44.entities.LotLMNP.list(),
  });

  const lotsCount = lots.filter(lot => lot.residence_id === residence.id).length;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="bg-white rounded-lg shadow hover:shadow-lg transition-all p-4 border border-slate-100"
    >
      <div className="flex items-center gap-4">
        {/* Miniature */}
        <div className="w-20 h-20 rounded-lg overflow-hidden bg-slate-200 flex-shrink-0">
          {firstPhoto ? (
            <img src={firstPhoto} alt={residence.nom} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Building2 className="w-8 h-8 text-slate-400" />
            </div>
          )}
        </div>

        {/* Informations principales */}
        <div className="flex-1 min-w-0 grid md:grid-cols-5 gap-4 items-center">
          <div className="md:col-span-2">
            <h3 className="font-bold text-[#1E40AF] text-sm mb-1 truncate">{residence.nom}</h3>
            <div className="flex items-center gap-1 text-xs text-slate-500 mb-1">
              <MapPin className="w-3 h-3" />
              <span className="truncate">{residence.ville}</span>
            </div>
            <div className="flex gap-1 flex-wrap">
              <Badge className={`${typeColors[residence.type_residence]} text-xs`}>
                {residence.type_residence}
              </Badge>
              <Badge className={`${statusColors[residence.statut]} text-xs`}>
                {statusLabels[residence.statut]}
              </Badge>
            </div>
          </div>

          {residence.gestionnaire && (
            <div>
              <p className="text-xs text-slate-500">Gestionnaire</p>
              <p className="font-semibold text-slate-700 text-sm truncate">{residence.gestionnaire}</p>
            </div>
          )}

          <div>
            <p className="text-xs text-slate-500">Lots portefeuille</p>
            <div className="flex items-center gap-1">
              <Users className="w-3 h-3 text-[#F59E0B]" />
              <p className="font-bold text-[#F59E0B] text-sm">{lotsCount}</p>
            </div>
          </div>

          <div className="flex gap-1 justify-end">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onView(residence)}
              className="hover:bg-slate-100 h-8 w-8"
              title="Voir"
            >
              <Eye className="w-4 h-4 text-slate-500" />
            </Button>
            {onEdit && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onEdit(residence)}
                className="hover:bg-slate-100 h-8 w-8"
                title="Modifier"
              >
                <Edit className="w-4 h-4 text-slate-500" />
              </Button>
            )}
            {onDelete && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDelete(residence)}
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
