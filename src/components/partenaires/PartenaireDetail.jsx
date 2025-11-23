
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { X, Edit, Mail, Phone, MapPin, Handshake, FileText, TrendingUp, Users, Euro, Trash2, FileCheck } from "lucide-react";
import { motion } from "framer-motion";
import PartenaireStats from "./PartenaireStats";
import { formatPartenaireTypes } from "@/utils/partenaireTypes";

const statusColors = {
  actif: "bg-green-100 text-green-800 border-green-200",
  inactif: "bg-slate-100 text-slate-800 border-slate-200",
  a_relancer: "bg-yellow-100 text-yellow-800 border-yellow-200",
  suspendu: "bg-red-100 text-red-800 border-red-200",
};

const statusLabels = {
  actif: "Actif",
  inactif: "Inactif",
  a_relancer: "À relancer",
  suspendu: "Suspendu",
};

export default function PartenaireDetail({ partenaire, onClose, onEdit, onDelete }) {
  const partenaireTypes = formatPartenaireTypes(partenaire.type_partenaire);
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
        className="bg-white rounded-xl shadow-2xl max-w-4xl w-full my-8 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b border-slate-200 bg-gradient-to-r from-[#1E40AF] to-[#1E3A8A] flex-shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
              <Handshake className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">{partenaire.nom}</h2>
              <div className="flex gap-2 mt-2 flex-wrap">
                {partenaire.statut && (
                  <Badge className={`${statusColors[partenaire.statut] || 'bg-slate-100 text-slate-800 border-slate-200'} border`}>
                    {statusLabels[partenaire.statut] || partenaire.statut}
                  </Badge>
                )}
                {partenaireTypes.length > 0 && (
                  partenaireTypes.slice(0, 3).map((type, index) => (
                    <Badge key={index} className="bg-blue-100 text-blue-800 border-blue-200 border">
                      {type}
                    </Badge>
                  ))
                )}
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            {onEdit && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onEdit(partenaire)}
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
                onClick={() => onDelete(partenaire)}
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
          {/* Stats du partenaire */}
          <PartenaireStats partenaire={partenaire} />

          {/* Informations de contact */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Informations de contact</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {partenaire.contact_principal && (
                <div className="pb-3 border-b">
                  <p className="text-xs text-slate-500">Contact principal</p>
                  <p className="font-semibold text-slate-700">{partenaire.contact_principal}</p>
                </div>
              )}
              {partenaire.email && (
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-slate-400" />
                  <a href={`mailto:${partenaire.email}`} className="text-slate-700 hover:text-[#1E40AF]">
                    {partenaire.email}
                  </a>
                </div>
              )}
              {partenaire.telephone && (
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-slate-400" />
                  <a href={`tel:${partenaire.telephone}`} className="text-slate-700 hover:text-[#1E40AF]">
                    {partenaire.telephone}
                  </a>
                </div>
              )}
              {partenaire.adresse && (
                <div className="flex items-center gap-3">
                  <MapPin className="w-4 h-4 text-slate-400" />
                  <span className="text-slate-700">{partenaire.adresse}</span>
                </div>
              )}
              {partenaire.taux_retrocession && (
                <div className="pt-3 border-t">
                  <p className="text-xs text-slate-500">Taux de rétrocession</p>
                  <p className="font-semibold text-[#10B981] text-lg">{partenaire.taux_retrocession}%</p>
                </div>
              )}
              {partenaire.zone_activite && (
                <div className="pt-3 border-t">
                  <p className="text-xs text-slate-500">Zone d'activité</p>
                  <p className="font-medium text-slate-700">{partenaire.zone_activite}</p>
                </div>
              )}
              {partenaire.specialite && (
                <div>
                  <p className="text-xs text-slate-500">Spécialité</p>
                  <p className="font-medium text-slate-700">{partenaire.specialite}</p>
                </div>
              )}
              {partenaire.created_by && (
                <div className="pt-3 border-t">
                  <p className="text-xs text-slate-500">Créé par</p>
                  <p className="font-medium text-slate-700">{partenaire.created_by}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Conditions commerciales */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-[#F59E0B]" />
                Conditions commerciales
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {partenaire.convention_signee && (
                  <div className="p-3 bg-green-50 rounded-lg">
                    <p className="text-sm text-green-700 font-medium">✓ Convention signée</p>
                    {partenaire.date_convention && (
                      <p className="text-xs text-green-600 mt-1">
                        Le {new Date(partenaire.date_convention).toLocaleDateString('fr-FR')}
                      </p>
                    )}
                  </div>
                )}
                <div className="grid md:grid-cols-2 gap-4">
                  {partenaire.taux_retrocession !== undefined && (
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <p className="text-sm text-blue-700 mb-1">Taux de rétrocession</p>
                      <p className="text-2xl font-bold text-blue-800">{partenaire.taux_retrocession}%</p>
                    </div>
                  )}
                  {partenaire.volume_annuel_attendu !== undefined && (
                    <div className="p-4 bg-purple-50 rounded-lg">
                      <p className="text-sm text-purple-700 mb-1">Volume annuel attendu</p>
                      <p className="text-2xl font-bold text-purple-800">
                        {partenaire.volume_annuel_attendu.toLocaleString('fr-FR')} €
                      </p>
                    </div>
                  )}
                </div>
                {partenaire.conditions_commerciales && (
                  <div>
                    <p className="text-sm font-semibold text-slate-700 mb-2">Conditions</p>
                    <p className="text-slate-600 whitespace-pre-wrap">{partenaire.conditions_commerciales}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>



          {/* Notes */}
          {partenaire.notes && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Notes internes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-700 whitespace-pre-wrap">{partenaire.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
