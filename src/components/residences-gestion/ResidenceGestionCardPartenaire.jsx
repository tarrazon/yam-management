import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Building2, MapPin, Eye, Home, FileText } from "lucide-react";
import { motion } from "framer-motion";
import StorageImage from "@/components/common/StorageImage";

const statusColors = {
  active: "bg-green-100 text-green-800 border-green-200",
  en_renovation: "bg-yellow-100 text-yellow-800 border-yellow-200",
  en_liquidation: "bg-red-100 text-red-800 border-red-200",
  fermee: "bg-slate-100 text-slate-800 border-slate-200",
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

const typeLabels = {
  ehpad: "EHPAD",
  etudiante: "Étudiante",
  affaires: "Affaires",
  tourisme: "Tourisme",
  senior: "Senior",
};

export default function ResidenceGestionCardPartenaire({ residence, lots, onView, onNavigateToLots }) {
  const firstPhoto = residence.documents?.photos?.[0];

  // Compter uniquement les lots disponibles de cette résidence
  const lotsDisponiblesCount = lots.filter(lot => 
    lot.residence_id === residence.id && lot.statut === 'disponible'
  ).length;

  // Compter les documents (sans les photos)
  const documentsCount = [
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
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="border-none shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden bg-white">
        {/* Image de couverture */}
        <div className="h-48 bg-gradient-to-br from-slate-200 to-slate-300 relative overflow-hidden">
          {firstPhoto ? (
            <StorageImage
              src={firstPhoto}
              alt={residence.nom}
              className="w-full h-full object-cover"
              fallback={
                <div className="w-full h-full flex items-center justify-center">
                  <Building2 className="w-16 h-16 text-slate-400" />
                </div>
              }
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Building2 className="w-16 h-16 text-slate-400" />
            </div>
          )}
          <div className="absolute top-3 right-3 flex gap-2">
            <Badge className={`${typeColors[residence.type_residence]} shadow-lg`}>
              {typeLabels[residence.type_residence]}
            </Badge>
            <Badge className={`${statusColors[residence.statut]} border shadow-lg`}>
              {statusLabels[residence.statut]}
            </Badge>
          </div>
        </div>

        <CardHeader className="border-b border-slate-100 pb-4">
          <div className="flex justify-between items-start">
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-bold text-[#1E40AF] truncate">
                {residence.nom}
              </h3>
              <div className="flex items-center gap-2 text-sm text-slate-500 mt-1">
                <MapPin className="w-4 h-4" />
                <span className="truncate">{residence.ville}</span>
              </div>
            </div>
            <div className="flex gap-1 flex-shrink-0 ml-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onView(residence)}
                className="hover:bg-slate-100"
                title="Voir la fiche"
              >
                <Eye className="w-4 h-4 text-slate-500" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6 space-y-4">
          {residence.gestionnaire && (
            <div className="pb-3 border-b border-slate-100">
              <p className="text-xs text-slate-500 mb-1">Gestionnaire</p>
              <p className="font-semibold text-slate-700 truncate">{residence.gestionnaire}</p>
            </div>
          )}

          {/* Lots disponibles avec bouton cliquable */}
          <div 
            onClick={() => onNavigateToLots(residence.id)}
            className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200 cursor-pointer hover:from-green-100 hover:to-emerald-100 transition-all group"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 text-xs text-green-700 mb-1">
                  <Home className="w-3 h-3" />
                  <span className="font-medium">Lots disponibles</span>
                </div>
                <p className="text-2xl font-bold text-green-600">
                  {lotsDisponiblesCount}
                </p>
              </div>
              <div className="text-green-600 group-hover:translate-x-1 transition-transform">
                →
              </div>
            </div>
          </div>

          {residence.taux_occupation !== undefined && (
            <div className="flex justify-between items-center">
              <span className="text-xs text-slate-500">Taux d'occupation</span>
              <span className="font-bold text-green-600">{residence.taux_occupation}%</span>
            </div>
          )}

          {residence.rentabilite_moyenne !== undefined && (
            <div className="flex justify-between items-center">
              <span className="text-xs text-slate-500">Rentabilité moyenne</span>
              <span className="font-bold text-green-600">{residence.rentabilite_moyenne}%</span>
            </div>
          )}

          {/* Documents */}
          <div 
            onClick={() => onView(residence)}
            className="pt-3 border-t border-slate-100 cursor-pointer hover:bg-slate-50 rounded-lg -mx-2 px-2 py-2 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#F59E0B]" />
                <span className="text-xs text-slate-600">Documents</span>
              </div>
              <span className="font-bold text-[#F59E0B]">{documentsCount}</span>
            </div>
            <p className="text-xs text-slate-400 mt-1">Cliquer pour voir et télécharger</p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}