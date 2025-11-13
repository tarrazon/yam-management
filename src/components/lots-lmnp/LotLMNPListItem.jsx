
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Home, Edit, Eye, MapPin, Euro, TrendingUp, Building2, Clock, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import StorageImage from "@/components/common/StorageImage";

const statusColors = {
  disponible: "bg-green-100 text-green-800",
  sous_option: "bg-blue-100 text-blue-800",
  allotement: "bg-cyan-100 text-cyan-800",
  reserve: "bg-yellow-100 text-yellow-800",
  compromis: "bg-orange-100 text-orange-800",
  vendu: "bg-purple-100 text-purple-800",
};

const statusLabels = {
  disponible: "Disponible",
  sous_option: "Sous option",
  allotement: "Allotement",
  reserve: "Réservé",
  compromis: "Compromis",
  vendu: "Vendu",
};

export default function LotLMNPListItem({ lot, onEdit, onView, onDelete, onPoserOption, showCommission = false, commission = 0, hidePartenaireAcquereur = false }) {
  const firstPhoto = lot.photos?.[0];

  const { data: residences = [] } = useQuery({
    queryKey: ['residences_gestion'],
    queryFn: () => base44.entities.ResidenceGestion.list(),
  });

  const residence = residences.find(r => r.id === lot.residence_id);
  const residencePhoto = residence?.documents?.photos?.[0];

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="bg-white rounded-lg shadow hover:shadow-lg transition-all p-4 border border-slate-100"
    >
      <div className="flex items-center gap-4">
        {/* Miniature du lot ou de la résidence */}
        <div className="w-20 h-20 rounded-lg overflow-hidden bg-slate-200 flex-shrink-0">
          {firstPhoto ? (
            <StorageImage
              src={firstPhoto}
              alt={`Lot ${lot.numero || lot.reference}`}
              className="w-full h-full object-cover"
              fallback={residencePhoto ? (
                <StorageImage
                  src={residencePhoto}
                  alt={lot.residence_nom || 'Résidence'}
                  className="w-full h-full object-cover opacity-70"
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
            />
          ) : residencePhoto ? (
            <StorageImage
              src={residencePhoto}
              alt={lot.residence_nom || 'Résidence'}
              className="w-full h-full object-cover opacity-70"
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
            <h3 className="font-bold text-[#1E40AF] text-sm mb-1">Lot {lot.reference}</h3>
            <p className="text-xs text-slate-500 truncate">{lot.residence_nom || 'Résidence'}</p>
            <Badge className={`${statusColors[lot.statut]} text-xs mt-1`}>
              {statusLabels[lot.statut]}
            </Badge>
            {!hidePartenaireAcquereur && lot.statut !== 'disponible' && (lot.partenaire_nom || lot.acquereur_nom) && (
              <div className="mt-2 space-y-0.5">
                {lot.partenaire_nom && (
                  <p className="text-xs text-slate-600 truncate">
                    <span className="font-medium">Partenaire:</span> {lot.partenaire_nom}
                  </p>
                )}
                {lot.acquereur_nom && (
                  <p className="text-xs text-slate-600 truncate">
                    <span className="font-medium">Acquéreur:</span> {lot.acquereur_nom}
                  </p>
                )}
              </div>
            )}
          </div>

          <div>
            <p className="text-xs text-slate-500">Type / Surface</p>
            <p className="font-semibold text-slate-700 text-sm">
              {lot.typologie || '-'} • {lot.surface ? `${lot.surface}m²` : '-'}
            </p>
          </div>

          <div>
            <p className="text-xs text-slate-500">Prix FAI</p>
            <p className="font-bold text-[#1E40AF] text-sm">
              {lot.prix_fai != null ? `${lot.prix_fai.toLocaleString('fr-FR')} €` : '-'}
            </p>
            {showCommission && commission > 0 && (
              <p className="text-xs text-amber-700 font-semibold mt-1">
                Commission: {commission.toLocaleString('fr-FR', {minimumFractionDigits: 2, maximumFractionDigits: 2})} €
              </p>
            )}
          </div>

          {lot.rentabilite != null ? (
            <div>
              <p className="text-xs text-slate-500">Rentabilité</p>
              <div className="flex items-center gap-1">
                <TrendingUp className="w-3 h-3 text-green-600" />
                <p className="font-bold text-green-600 text-sm">{lot.rentabilite}%</p>
              </div>
            </div>
          ) : (
            <div />
          )}

          <div className="flex gap-1 justify-end">
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
              title="Voir"
            >
              <Eye className="w-4 h-4 text-slate-500" />
            </Button>
            {onEdit && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onEdit(lot)}
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
                onClick={() => onDelete(lot)}
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
