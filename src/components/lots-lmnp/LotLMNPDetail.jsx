
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { X, Edit, MapPin, Home, Euro, TrendingUp, Building2, FileText, Download, Image, User, Handshake, Trash2, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

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
  etudiante: "Résidence Étudiante",
  senior: "Résidence Sénior",
  ehpad: "EHPAD",
  tourisme: "Résidence Tourisme",
  affaires: "Résidence Affaires",
};

export default function LotLMNPDetail({ lot, residence, onClose, onEdit, onDelete }) {
  const firstPhoto = lot.photos?.[0];
  const prixVente = (lot.prix_net_vendeur || 0) + (lot.honoraires || 0);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 overflow-y-auto"
      style={{ zIndex: 9999 }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 20 }}
        className="bg-white rounded-xl shadow-2xl max-w-6xl w-full my-8 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b border-slate-200 bg-gradient-to-r from-[#1E40AF] to-[#1E3A8A] flex-shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
              <Home className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Lot {lot.reference}</h2>
              <div className="flex gap-2 mt-2">
                <Badge className={`${statusColors[lot.statut]} border`}>
                  {statusLabels[lot.statut]}
                </Badge>
                {lot.type_residence && (
                  <Badge className="bg-white/20 text-white border-white/30">
                    {typeLabels[lot.type_residence]}
                  </Badge>
                )}
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            {onEdit && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onEdit(lot)}
                className="text-white hover:bg-white/20"
                title="Modifier"
              >
                <Edit className="w-5 h-5" />
              </Button>
            )}
            {onDelete && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDelete(lot)}
                className="text-white hover:bg-red-500/20"
                title="Supprimer"
              >
                <Trash2 className="w-5 h-5" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-white hover:bg-white/20"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Photo principale */}
          {firstPhoto && (
            <Card>
              <CardContent className="p-0">
                <img 
                  src={firstPhoto} 
                  alt={`Lot ${lot.reference}`}
                  className="w-full h-96 object-cover rounded-lg"
                />
              </CardContent>
            </Card>
          )}

          {/* Résidence */}
          {residence && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-[#F59E0B]" />
                  Résidence
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Link
                  to={onEdit ? createPageUrl("ResidencesGestion") : createPageUrl("ResidencesPartenaire")}
                  className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 transition-colors group"
                >
                  <div>
                    <h3 className="font-bold text-[#1E40AF] text-lg group-hover:underline">
                      {residence.nom}
                    </h3>
                    {residence.adresse && (
                      <div className="flex items-center gap-2 text-sm text-slate-600 mt-1">
                        <MapPin className="w-4 h-4" />
                        <span>{residence.adresse}</span>
                      </div>
                    )}
                    {(residence.code_postal || residence.ville) && (
                      <p className="text-sm text-slate-600">
                        {residence.code_postal} {residence.ville}
                      </p>
                    )}
                  </div>
                  <ExternalLink className="w-5 h-5 text-[#1E40AF] group-hover:scale-110 transition-transform" />
                </Link>
              </CardContent>
            </Card>
          )}

          {/* Partenaire et Acquéreur */}
          {lot.statut !== 'disponible' && (lot.partenaire_nom || lot.acquereur_nom) && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <User className="w-5 h-5 text-[#F59E0B]" />
                  Acteur du dossier
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {lot.partenaire_nom && (
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-700 font-medium mb-1">Partenaire apporteur</p>
                    <p className="text-lg font-bold text-blue-800">{lot.partenaire_nom}</p>
                  </div>
                )}
                {lot.acquereur_nom && (
                  <div className="p-4 bg-green-50 rounded-lg">
                    <p className="text-sm text-green-700 font-medium mb-1">Acquéreur</p>
                    <p className="text-lg font-bold text-green-800">{lot.acquereur_nom}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Caractéristiques */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Caractéristiques du lot</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                {lot.typologie && (
                  <div>
                    <p className="text-xs text-slate-500">Typologie</p>
                    <p className="text-lg font-bold text-slate-700">{lot.typologie}</p>
                  </div>
                )}
                {lot.surface && (
                  <div>
                    <p className="text-xs text-slate-500">Surface</p>
                    <p className="text-lg font-bold text-slate-700">{lot.surface} m²</p>
                  </div>
                )}
                {lot.etage && (
                  <div>
                    <p className="text-xs text-slate-500">Étage</p>
                    <p className="text-lg font-bold text-slate-700">{lot.etage}</p>
                  </div>
                )}
                {lot.orientation && (
                  <div>
                    <p className="text-xs text-slate-500">Orientation</p>
                    <p className="text-lg font-bold text-slate-700">{lot.orientation}</p>
                  </div>
                )}
                {lot.loyer_mensuel != null && (
                  <div>
                    <p className="text-xs text-slate-500">Loyer mensuel</p>
                    <p className="text-lg font-bold text-green-600">{lot.loyer_mensuel.toLocaleString('fr-FR')} €</p>
                  </div>
                )}
                {lot.rentabilite != null && (
                  <div>
                    <p className="text-xs text-slate-500">Rentabilité</p>
                    <p className="text-lg font-bold text-green-600">{lot.rentabilite}%</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Informations financières */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Euro className="w-5 h-5 text-[#F59E0B]" />
                Informations financières
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  {lot.prix_net_vendeur != null && (
                    <div className="p-4 bg-slate-50 rounded-lg">
                      <p className="text-sm text-slate-500 mb-1">Prix net vendeur</p>
                      <p className="text-2xl font-bold text-[#1E40AF]">
                        {lot.prix_net_vendeur.toLocaleString('fr-FR')} €
                      </p>
                    </div>
                  )}
                  
                  {lot.honoraires != null && (
                    <div className="p-4 bg-slate-50 rounded-lg">
                      <p className="text-sm text-slate-500 mb-1">Honoraires</p>
                      <p className="text-2xl font-bold text-slate-700">
                        {lot.honoraires.toLocaleString('fr-FR')} €
                      </p>
                      {lot.pourcentage_honoraires && (
                        <p className="text-xs text-slate-500 mt-1">
                          ({lot.pourcentage_honoraires}% du prix net)
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {lot.tva_honoraires != null && (
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-slate-600">
                      TVA sur honoraires : <span className="font-semibold">{lot.tva_honoraires.toLocaleString('fr-FR')} €</span>
                    </p>
                  </div>
                )}

                <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border-2 border-green-200">
                  <p className="text-sm text-green-700 mb-1">Prix de vente total (net vendeur + honoraires)</p>
                  <p className="text-3xl font-bold text-green-700">
                    {prixVente.toLocaleString('fr-FR')} €
                  </p>
                </div>

                {(lot.honoraires_acquereur_ht != null || lot.tva_honoraires_acquereur != null) && (
                  <div className="pt-4 border-t space-y-3">
                    <h4 className="font-semibold text-slate-700">Honoraires acquéreur</h4>
                    {lot.honoraires_acquereur_ht != null && (
                      <div className="p-3 bg-amber-50 rounded-lg">
                        <p className="text-sm text-slate-600">
                          Honoraires acquéreur HT : <span className="font-semibold">{lot.honoraires_acquereur_ht.toLocaleString('fr-FR')} €</span>
                        </p>
                      </div>
                    )}
                    {lot.tva_honoraires_acquereur != null && (
                      <div className="p-3 bg-amber-50 rounded-lg">
                        <p className="text-sm text-slate-600">
                          TVA honoraires acquéreur : <span className="font-semibold">{lot.tva_honoraires_acquereur.toLocaleString('fr-FR')} €</span>
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {lot.prix_fai != null && (
                  <div className="p-4 bg-indigo-50 rounded-lg">
                    <p className="text-sm text-indigo-700 mb-1">Prix FAI (Frais d'Agence Inclus)</p>
                    <p className="text-2xl font-bold text-indigo-700">
                      {lot.prix_fai.toLocaleString('fr-FR')} €
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Vendeur */}
          {lot.vendeur_nom && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <User className="w-5 h-5 text-slate-500" />
                  Vendeur
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-semibold text-slate-700">{lot.vendeur_nom}</p>
              </CardContent>
            </Card>
          )}

          {/* Description */}
          {lot.description && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-700 whitespace-pre-wrap">{lot.description}</p>
              </CardContent>
            </Card>
          )}

          {/* Gestionnaire */}
          {lot.gestionnaire_nom && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Gestionnaire</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="font-semibold text-slate-700">{lot.gestionnaire_nom}</p>
                {lot.gestionnaire_contact && (
                  <p className="text-sm text-slate-600">{lot.gestionnaire_contact}</p>
                )}
              </CardContent>
            </Card>
          )}

          {/* Photos additionnelles */}
          {lot.photos && lot.photos.length > 1 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Galerie photos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {lot.photos.slice(1).map((photo, index) => (
                    <a
                      key={index}
                      href={photo}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="relative aspect-video rounded-lg overflow:hidden hover:opacity-80 transition-opacity group"
                    >
                      <img 
                        src={photo} 
                        alt={`Photo ${index + 2}`}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                        <Download className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </a>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Documents */}
          {lot.documents && lot.documents.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="w-5 h-5 text-[#F59E0B]" />
                  Documents
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {lot.documents.map((doc, index) => (
                    <a
                      key={index}
                      href={doc}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-3 rounded-lg bg-green-50 border border-green-200 hover:bg-green-100 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="w-4 h-4 text-green-600" />
                        <span className="text-sm text-green-900 font-medium">
                          Document {index + 1}
                        </span>
                      </div>
                      <Download className="w-4 h-4 text-green-600" />
                    </a>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Notes */}
          {lot.notes && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Notes internes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-700 whitespace-pre-wrap">{lot.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
