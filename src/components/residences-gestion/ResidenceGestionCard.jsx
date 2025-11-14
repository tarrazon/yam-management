
import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Building2, Edit, MapPin, Users, TrendingUp, Calendar, Eye, Image, FileText, Trash2, MapPinned } from "lucide-react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
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

export default function ResidenceGestionCard({ residence, onEdit, onView, onDelete, viewsStats = null }) {
  const firstPhoto = residence.documents?.photos?.[0];

  const { data: lots = [] } = useQuery({
    queryKey: ['lots_lmnp'],
    queryFn: () => base44.entities.LotLMNP.list(),
  });

  const lotsCount = lots.filter(lot => lot.residence_id === residence.id).length;

  // Calculer le nombre de documents (sans les photos)
  const documentsCount = residence.documents ?
    Object.entries(residence.documents).reduce((count, [key, value]) => {
      if (key === 'photos') {
        return count; // Ignorer les photos
      } else if (Array.isArray(value)) {
        return count + value.filter(v => v).length;
      } else if (value) {
        return count + 1;
      }
      return count;
    }, 0) : 0;

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
                {residence.adresse && (
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(residence.adresse + ', ' + residence.ville)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-1 text-blue-600 hover:text-blue-800 transition-colors"
                    title="Voir sur Google Maps / Street View"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MapPinned className="w-4 h-4" />
                  </a>
                )}
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
              {onEdit && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onEdit(residence)}
                  className="hover:bg-slate-100"
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
                  className="hover:bg-red-50"
                  title="Supprimer"
                >
                  <Trash2 className="w-4 h-4 text-red-500" />
                </Button>
              )}
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

          <div className="grid grid-cols-2 gap-4">
            {residence.nombre_lots_total !== undefined && (
              <div>
                <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
                  <Building2 className="w-3 h-3" />
                  <span>Lots total</span>
                </div>
                <p className="text-lg font-bold text-[#1E40AF]">
                  {residence.nombre_lots_total}
                </p>
              </div>
            )}

            <div>
              <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
                <Users className="w-3 h-3" />
                <span>Lots Portefeuille</span>
              </div>
              <p className="text-lg font-bold text-[#F59E0B]">
                {lotsCount}
              </p>
            </div>

            {residence.taux_occupation !== undefined && (
              <div>
                <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
                  <TrendingUp className="w-3 h-3" />
                  <span>Occupation</span>
                </div>
                <p className="text-lg font-bold text-green-600">
                  {residence.taux_occupation}%
                </p>
              </div>
            )}

            {residence.rentabilite_moyenne !== undefined && (
              <div>
                <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
                  <TrendingUp className="w-3 h-3" />
                  <span>Rentabilité</span>
                </div>
                <p className="text-lg font-bold text-green-600">
                  {residence.rentabilite_moyenne}%
                </p>
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-slate-100 space-y-2">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <FileText className="w-3 h-3" />
              <span>Documents : <span className="font-semibold text-slate-700">{documentsCount}</span></span>
            </div>
            {viewsStats && (
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Eye className="w-3 h-3" />
                <span>
                  Vues : <span className="font-semibold text-slate-700">{viewsStats.total || 0}</span>
                  {viewsStats.unique > 0 && <span className="ml-1">({viewsStats.unique} partenaire{viewsStats.unique > 1 ? 's' : ''})</span>}
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
