
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Home, Edit, Eye, MapPin, Euro, TrendingUp, Building2, Clock, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import StorageImage from "@/components/common/StorageImage";
import { formatCurrency, calculatePrixFAI } from "@/utils/formHelpers";

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

export default function LotLMNPListItem({ lot, onEdit, onView, onDelete, onPoserOption, showCommission = false, commission = 0, hidePartenaireAcquereur = false, partenaires = [], showExtendedView = false }) {
  const firstPhoto = lot.photos?.[0];

  const partenaire = partenaires.find(p => p.id === lot.partenaire_id);
  const tauxRetrocession = Number(partenaire?.taux_retrocession) || 0;
  const prixFAI = calculatePrixFAI(lot, tauxRetrocession);

  const { data: residences = [] } = useQuery({
    queryKey: ['residences_gestion'],
    queryFn: () => base44.entities.ResidenceGestion.list(),
  });

  const residence = residences.find(r => r.id === lot.residence_id);
  const residencePhoto = residence?.documents?.photos?.[0];

  if (showExtendedView) {
    return (
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        className="bg-white rounded-lg shadow hover:shadow-lg transition-all border border-slate-100 overflow-hidden"
      >
        <div className="overflow-x-auto">
          <div className="inline-flex min-w-full">
            <div className="flex items-center gap-2 p-3 sticky left-0 bg-white z-10 border-r border-slate-200 min-w-[280px]">
              <div className="w-16 h-16 rounded-lg overflow-hidden bg-slate-200 flex-shrink-0">
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
                            <Building2 className="w-6 h-6 text-slate-400" />
                          </div>
                        }
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Building2 className="w-6 h-6 text-slate-400" />
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
                        <Building2 className="w-6 h-6 text-slate-400" />
                      </div>
                    }
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-slate-400" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-[#1E40AF] text-xs mb-0.5 truncate">Lot {lot.reference}</h3>
                <p className="text-[10px] text-slate-500 truncate">{lot.residence_nom || 'Résidence'}</p>
                <Badge className={`${statusColors[lot.statut]} text-[10px] mt-0.5`}>
                  {statusLabels[lot.statut]}
                </Badge>
              </div>
            </div>

            <div className="flex items-center gap-4 px-4 py-3">
              <div className="min-w-[120px]">
                <p className="text-[10px] text-slate-500 mb-0.5">Type résidence</p>
                <p className="font-semibold text-slate-700 text-xs">{lot.type_residence || '-'}</p>
              </div>

              <div className="min-w-[100px]">
                <p className="text-[10px] text-slate-500 mb-0.5">Ville</p>
                <p className="font-semibold text-slate-700 text-xs">{lot.ville || residence?.ville || '-'}</p>
              </div>

              <div className="min-w-[100px]">
                <p className="text-[10px] text-slate-500 mb-0.5">Région</p>
                <p className="font-semibold text-slate-700 text-xs">{lot.region || residence?.region || '-'}</p>
              </div>

              <div className="min-w-[80px]">
                <p className="text-[10px] text-slate-500 mb-0.5">Typologie</p>
                <p className="font-semibold text-slate-700 text-xs">{lot.typologie || '-'}</p>
              </div>

              <div className="min-w-[80px]">
                <p className="text-[10px] text-slate-500 mb-0.5">Surface int.</p>
                <p className="font-semibold text-slate-700 text-xs">{lot.surface ? `${lot.surface}m²` : '-'}</p>
              </div>

              <div className="min-w-[80px]">
                <p className="text-[10px] text-slate-500 mb-0.5">Surface ext.</p>
                <p className="font-semibold text-slate-700 text-xs">{lot.surface_exterieure ? `${lot.surface_exterieure}m²` : '-'}</p>
              </div>

              <div className="min-w-[70px]">
                <p className="text-[10px] text-slate-500 mb-0.5">Parking</p>
                <p className="font-semibold text-slate-700 text-xs">{lot.parking ? 'Oui' : 'Non'}</p>
              </div>

              <div className="min-w-[110px]">
                <p className="text-[10px] text-slate-500 mb-0.5">Prix mobilier</p>
                <p className="font-semibold text-slate-700 text-xs">{lot.prix_mobilier ? `${formatCurrency(lot.prix_mobilier)} €` : '-'}</p>
              </div>

              <div className="min-w-[130px]">
                <p className="text-[10px] text-slate-500 mb-0.5">Prix total HT</p>
                <p className="font-bold text-[#1E40AF] text-xs">{lot.prix_total_ht ? `${formatCurrency(lot.prix_total_ht)} €` : '-'}</p>
              </div>

              <div className="min-w-[120px]">
                <p className="text-[10px] text-slate-500 mb-0.5">TVA récupérable</p>
                <p className="font-semibold text-slate-700 text-xs">{lot.tva_recuperable ? `${formatCurrency(lot.tva_recuperable)} €` : '-'}</p>
              </div>

              <div className="min-w-[130px]">
                <p className="text-[10px] text-slate-500 mb-0.5">Prix total TTC</p>
                <p className="font-bold text-[#1E40AF] text-xs">{lot.prix_total_ttc ? `${formatCurrency(lot.prix_total_ttc)} €` : '-'}</p>
              </div>

              <div className="min-w-[120px]">
                <p className="text-[10px] text-slate-500 mb-0.5">Exploitant</p>
                <p className="font-semibold text-slate-700 text-xs truncate max-w-[120px]">{lot.exploitant || '-'}</p>
              </div>

              <div className="min-w-[110px]">
                <p className="text-[10px] text-slate-500 mb-0.5">Loyer annuel HT</p>
                <p className="font-semibold text-slate-700 text-xs">{lot.loyer_annuel_ht ? `${formatCurrency(lot.loyer_annuel_ht)} €` : '-'}</p>
              </div>

              <div className="min-w-[80px]">
                <p className="text-[10px] text-slate-500 mb-0.5">Rentabilité</p>
                <div className="flex items-center gap-1">
                  {lot.rentabilite != null ? (
                    <>
                      <TrendingUp className="w-3 h-3 text-green-600" />
                      <p className="font-bold text-green-600 text-xs">{lot.rentabilite}%</p>
                    </>
                  ) : (
                    <span className="text-xs text-slate-400">-</span>
                  )}
                </div>
              </div>

              <div className="flex gap-1 min-w-[180px] justify-end sticky right-0 bg-white pl-2 border-l border-slate-200">
                {onPoserOption && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onPoserOption}
                    className="hover:bg-green-100 text-green-700 hover:text-green-800 h-7 px-2"
                    title="Poser une option"
                  >
                    <Clock className="w-3 h-3 mr-1" />
                    <span className="text-[10px]">Option</span>
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onView(lot)}
                  className="hover:bg-slate-100 h-7 w-7"
                  title="Voir"
                >
                  <Eye className="w-3.5 h-3.5 text-slate-500" />
                </Button>
                {onEdit && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEdit(lot)}
                    className="hover:bg-slate-100 h-7 w-7"
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
                    className="hover:bg-red-50 h-7 w-7"
                    title="Supprimer"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-red-500" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="bg-white rounded-lg shadow hover:shadow-lg transition-all p-3 border border-slate-100"
    >
      <div className="flex items-center gap-3">
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

        <div className="flex-1 min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-[#1E40AF] text-base mb-1">Lot {lot.reference}</h3>
              <p className="text-sm text-slate-600 truncate mb-2">{lot.residence_nom || 'Résidence'}</p>
              <Badge className={`${statusColors[lot.statut]} text-xs`}>
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

            <div className="flex flex-wrap sm:flex-nowrap items-center gap-4 sm:gap-6">
              <div className="text-center">
                <p className="text-xs text-slate-500 mb-1">Type / Surface</p>
                <p className="font-semibold text-slate-700 text-sm whitespace-nowrap">
                  {lot.typologie || '-'} • {lot.surface ? `${lot.surface}m²` : '-'}
                </p>
              </div>

              <div className="text-center">
                <p className="text-xs text-slate-500 mb-1">Prix FAI</p>
                <p className="font-bold text-[#1E40AF] text-base whitespace-nowrap">
                  {prixFAI > 0 ? `${formatCurrency(prixFAI)} €` : '-'}
                </p>
                {showCommission && commission > 0 && (
                  <p className="text-xs text-amber-700 font-semibold mt-0.5">
                    Commission: {formatCurrency(commission)} €
                  </p>
                )}
              </div>

              {lot.rentabilite != null && (
                <div className="text-center">
                  <p className="text-xs text-slate-500 mb-1">Rentabilité</p>
                  <div className="flex items-center gap-1 justify-center">
                    <TrendingUp className="w-3.5 h-3.5 text-green-600" />
                    <p className="font-bold text-green-600 text-base">{lot.rentabilite}%</p>
                  </div>
                </div>
              )}

              <div className="flex gap-1 ml-auto">
                {onPoserOption && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onPoserOption}
                    className="hover:bg-green-100 text-green-700 hover:text-green-800 h-8 px-2"
                    title="Poser une option"
                  >
                    <Clock className="w-3.5 h-3.5 sm:mr-1" />
                    <span className="text-xs hidden sm:inline">Option</span>
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
        </div>
      </div>
    </motion.div>
  );
}
