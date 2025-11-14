
import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Home, Edit, MapPin, Maximize2, Euro, TrendingUp, Eye, Building2, Percent, Clock, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import StorageImage from "@/components/common/StorageImage";

const statusColors = {
  disponible: "bg-green-100 text-green-800 border-green-200",
  sous_option: "bg-blue-100 text-blue-800 border-blue-200",
  allotement: "bg-cyan-100 text-cyan-800 border-cyan-200",
  reserve: "bg-yellow-100 text-yellow-800 border-yellow-200",
  compromis: "bg-orange-100 text-orange-800 border-orange-200",
  vendu: "bg-purple-100 text-purple-800 border-purple-200",
};

const statusLabels = {
  disponible: "Disponible",
  sous_option: "Sous option",
  allotement: "Allotement",
  reserve: "Réservé",
  compromis: "Compromis",
  vendu: "Vendu",
};

const typeColors = {
  etudiante: "bg-blue-100 text-blue-800",
  senior: "bg-rose-100 text-rose-800",
  ehpad: "bg-purple-100 text-purple-800",
  tourisme: "bg-amber-100 text-amber-800",
  affaires: "bg-indigo-100 text-indigo-800",
};

const typeLabels = {
  etudiante: "Étudiante",
  senior: "Senior",
  ehpad: "EHPAD",
  tourisme: "Tourisme",
  affaires: "Affaires",
};

export default function LotLMNPCard({ lot, onEdit, onView, onDelete, onPoserOption, showCommission = false, commission = 0, hidePartenaireAcquereur = false, viewsStats = null }) {
  const firstPhoto = lot.photos?.[0];

  const { data: residences = [] } = useQuery({
    queryKey: ['residences_gestion'],
    queryFn: () => base44.entities.ResidenceGestion.list(),
  });

  const residence = residences.find(r => r.id === lot.residence_id);
  const residencePhoto = residence?.documents?.photos?.[0];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="border-none shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden bg-white">
        {/* Image avec overlay résidence */}
        <div className="h-40 bg-gradient-to-br from-slate-200 to-slate-300 relative overflow-hidden">
          {firstPhoto ? (
            <StorageImage
              src={firstPhoto}
              alt={`Lot ${lot.numero || lot.reference}`}
              className="w-full h-full object-cover"
              fallback={
                residencePhoto ? (
                  <StorageImage
                    src={residencePhoto}
                    alt={residence?.nom || 'Résidence'}
                    className="w-full h-full object-cover opacity-50"
                    fallback={
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-200 to-slate-300">
                        <Home className="w-16 h-16 text-slate-400" />
                      </div>
                    }
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-200 to-slate-300">
                    <Home className="w-16 h-16 text-slate-400" />
                  </div>
                )
              }
            />
          ) : residencePhoto ? (
            <StorageImage
              src={residencePhoto}
              alt={residence?.nom || 'Résidence'}
              className="w-full h-full object-cover opacity-70"
              fallback={
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-200 to-slate-300">
                  <Home className="w-16 h-16 text-slate-400" />
                </div>
              }
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-200 to-slate-300">
              <Home className="w-16 h-16 text-slate-400" />
            </div>
          )}
          
          {/* Overlay avec nom de résidence */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-3">
            <div className="flex items-center gap-2 text-white mb-1">
              <Building2 className="w-4 h-4" />
              <p className="font-bold text-sm truncate">{lot.residence_nom || 'Résidence'}</p>
            </div>
          </div>

          {/* Badges en haut */}
          <div className="absolute top-3 right-3 flex gap-2">
            {lot.type_residence && (
              <Badge className={`${typeColors[lot.type_residence]} shadow-lg text-xs`}>
                {typeLabels[lot.type_residence]}
              </Badge>
            )}
            <Badge className={`${statusColors[lot.statut]} border shadow-lg text-xs`}>
              {statusLabels[lot.statut]}
            </Badge>
          </div>
        </div>

        <CardHeader className="border-b border-slate-100 pb-3 pt-3">
          <div className="flex justify-between items-start">
            <div className="flex-1 min-w-0">
              <h3 className="text-base font-bold text-[#1E40AF]">
                Lot {lot.reference}
              </h3>
              {!hidePartenaireAcquereur && lot.statut !== 'disponible' && (lot.partenaire_nom || lot.acquereur_nom) && (
                <div className="mt-2 space-y-1">
                  {lot.partenaire_nom && (
                    <p className="text-xs text-slate-600">
                      <span className="font-medium">Partenaire:</span> {lot.partenaire_nom}
                    </p>
                  )}
                  {lot.acquereur_nom && (
                    <p className="text-xs text-slate-600">
                      <span className="font-medium">Acquéreur:</span> {lot.acquereur_nom}
                    </p>
                  )}
                </div>
              )}
            </div>
            <div className="flex gap-1 flex-shrink-0 ml-2">
              {onPoserOption && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onPoserOption}
                  className="hover:bg-green-100 text-green-700 hover:text-green-800 h-8 px-2"
                  title="Poser une option"
                >
                  <Clock className="w-3.5 h-3.5 mr-1" />
                  <span className="text-xs">Option</span>
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onView(lot)}
                className="hover:bg-slate-100 h-8 w-8"
                title="Voir la fiche"
              >
                <Eye className="w-3.5 h-3.5 text-slate-500" />
              </Button>
              {onEdit && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onEdit(lot)}
                  className="hover:bg-slate-100 h-8 w-8"
                  title="Modifier"
                >
                  <Edit className="w-3.5 h-3.5 text-slate-500" />
                </Button>
              )}
              {onDelete && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDelete(lot)}
                  className="hover:bg-red-50 h-8 w-8"
                  title="Supprimer"
                >
                  <Trash2 className="w-3.5 h-3.5 text-red-500" />
                </Button>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            {lot.typologie && (
              <div>
                <p className="text-xs text-slate-500">Type</p>
                <p className="font-semibold text-slate-700 text-sm">{lot.typologie}</p>
              </div>
            )}
            {lot.surface && (
              <div>
                <p className="text-xs text-slate-500">Surface</p>
                <p className="font-semibold text-slate-700 text-sm">{lot.surface} m²</p>
              </div>
            )}
            {lot.etage && (
              <div>
                <p className="text-xs text-slate-500">Étage</p>
                <p className="font-semibold text-slate-700 text-sm">{lot.etage}</p>
              </div>
            )}
            {lot.loyer_mensuel != null && (
              <div>
                <p className="text-xs text-slate-500">Loyer</p>
                <p className="font-semibold text-green-600 text-sm">{lot.loyer_mensuel.toLocaleString('fr-FR')} €</p>
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-slate-100 grid grid-cols-2 gap-3">
            {lot.rentabilite != null && (
              <div>
                <div className="flex items-center gap-1 mb-1">
                  <TrendingUp className="w-3 h-3 text-green-600" />
                  <span className="text-xs font-semibold text-slate-700">Rentabilité</span>
                </div>
                <p className="text-xl font-bold text-green-600">{lot.rentabilite}%</p>
              </div>
            )}
            
            {lot.pourcentage_honoraires != null && (
              <div>
                <div className="flex items-center gap-1 mb-1">
                  <Percent className="w-3 h-3 text-[#F59E0B]" />
                  <span className="text-xs font-semibold text-slate-700">Honoraires</span>
                </div>
                <p className="text-xl font-bold text-[#F59E0B]">{lot.pourcentage_honoraires}%</p>
              </div>
            )}
          </div>

          {viewsStats && (
            <div className="pt-3 border-t border-slate-100">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Eye className="w-3 h-3" />
                <span>
                  Vues : <span className="font-semibold text-slate-700">{viewsStats.total || 0}</span>
                  {viewsStats.unique > 0 && <span className="ml-1">({viewsStats.unique} partenaire{viewsStats.unique > 1 ? 's' : ''})</span>}
                </span>
              </div>
            </div>
          )}

          <div className="pt-3 border-t border-slate-100 space-y-2">
            {lot.prix_net_vendeur != null && (
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-500">Prix net vendeur</span>
                <span className="font-bold text-[#1E40AF] text-sm">{lot.prix_net_vendeur.toLocaleString('fr-FR')} €</span>
              </div>
            )}
            {lot.prix_fai != null && (
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-500">Prix FAI</span>
                <span className="font-bold text-green-600 text-sm">{lot.prix_fai.toLocaleString('fr-FR')} €</span>
              </div>
            )}
            {showCommission && commission > 0 && (
              <div className="flex justify-between items-center p-2 bg-amber-50 rounded-lg border border-amber-200">
                <span className="text-xs font-semibold text-amber-800">Ma commission</span>
                <span className="font-bold text-amber-700 text-sm">{commission.toLocaleString('fr-FR', {minimumFractionDigits: 2, maximumFractionDigits: 2})} €</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
