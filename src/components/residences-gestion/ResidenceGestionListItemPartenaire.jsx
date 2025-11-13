import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Building2, MapPin, Home, FileText } from "lucide-react";
import { motion } from "framer-motion";
import StorageImage from "@/components/common/StorageImage";

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

export default function ResidenceGestionListItemPartenaire({ residence, lots, onView, onNavigateToLots }) {
  const firstPhoto = residence.documents?.photos?.[0];

  // Compter uniquement les lots disponibles de cette résidence
  const lotsDisponiblesCount = lots.filter(lot => 
    lot.residence_id === residence.id && lot.statut === 'disponible'
  ).length;

  // Compter les documents
  const documentsCount = [
    ...(residence.documents?.photos || []),
    residence.documents?.presentation,
    residence.documents?.fiche_synthetique,
    residence.documents?.attestation_immatriculation,
    residence.documents?.carnet_entretien,
    residence.documents?.rcp_gestionnaire,
    ...(residence.documents?.pv_ag || []),
    ...(residence.documents?.plans || []),
    ...(residence.documents?.plaquettes || []),
    ...(residence.documents?.diagnostics || []),
    residence.documents?.historique_gestionnaires,
  ].filter(Boolean).length;

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
            <StorageImage
              src={firstPhoto}
              alt={residence.nom}
              className="w-full h-full object-cover"
              fallback={
                <div className="w-full h-full flex items-center justify-center">
                  <Building2 className="w-8 h-8 text-slate-400" />
                </div>
              }
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Building2 className="w-8 h-8 text-slate-400" />
            </div>
          )}
        </div>

        {/* Informations principales */}
        <div className="flex-1 min-w-0 grid md:grid-cols-6 gap-4 items-center">
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

          {/* Lots disponibles cliquable */}
          <div 
            onClick={() => onNavigateToLots(residence.id)}
            className="cursor-pointer hover:bg-green-50 p-2 rounded-lg transition-colors group"
          >
            <p className="text-xs text-slate-500 mb-1">Lots disponibles</p>
            <div className="flex items-center gap-1">
              <Home className="w-3 h-3 text-green-600" />
              <p className="font-bold text-green-600 text-sm">{lotsDisponiblesCount}</p>
              <span className="text-xs text-green-600 opacity-0 group-hover:opacity-100 transition-opacity">→</span>
            </div>
          </div>

          {/* Documents cliquable */}
          <div 
            onClick={() => onView(residence)}
            className="cursor-pointer hover:bg-amber-50 p-2 rounded-lg transition-colors"
          >
            <p className="text-xs text-slate-500 mb-1">Documents</p>
            <div className="flex items-center gap-1">
              <FileText className="w-3 h-3 text-[#F59E0B]" />
              <p className="font-bold text-[#F59E0B] text-sm">{documentsCount}</p>
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
          </div>
        </div>
      </div>
    </motion.div>
  );
}