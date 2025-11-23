
import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Handshake, Edit, Mail, Phone, MapPin, Eye, TrendingUp, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
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

export default function PartenaireCard({ partenaire, onEdit, onView, onDelete }) {
  const partenaireTypes = formatPartenaireTypes(partenaire.type_partenaire);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="border-none shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden bg-white">
        <CardHeader className="border-b border-slate-100 pb-4">
          <div className="flex justify-between items-start">
            <div className="flex items-start gap-3 flex-1">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#1E40AF] to-[#1E3A8A] flex items-center justify-center flex-shrink-0">
                <Handshake className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-bold text-[#1E40AF] truncate">
                  {partenaire.nom}
                </h3>
                <div className="flex gap-2 mt-1 flex-wrap">
                  <Badge className={`${statusColors[partenaire.statut]} border`}>
                    {statusLabels[partenaire.statut]}
                  </Badge>
                  {partenaireTypes.length > 0 ? (
                    partenaireTypes.slice(0, 2).map((type, index) => (
                      <Badge key={index} variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                        {type}
                      </Badge>
                    ))
                  ) : (
                    <Badge variant="outline" className="bg-slate-50 text-slate-600">
                      Non spécifié
                    </Badge>
                  )}
                  {partenaireTypes.length > 2 && (
                    <Badge variant="outline" className="bg-slate-100 text-slate-600">
                      +{partenaireTypes.length - 2}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            <div className="flex gap-1 flex-shrink-0">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onView(partenaire)}
                className="hover:bg-slate-100"
                title="Voir la fiche"
              >
                <Eye className="w-4 h-4 text-slate-500" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onEdit(partenaire)}
                className="hover:bg-slate-100"
                title="Modifier"
              >
                <Edit className="w-4 h-4 text-slate-500" />
              </Button>
              {onDelete && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDelete(partenaire)}
                  className="hover:bg-red-50"
                  title="Supprimer"
                >
                  <Trash2 className="w-4 h-4 text-red-500" />
                </Button>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6 space-y-3">
          {partenaire.contact_principal && (
            <div className="pb-3 border-b border-slate-100">
              <p className="text-xs text-slate-500">Contact principal</p>
              <p className="font-semibold text-slate-700">{partenaire.contact_principal}</p>
            </div>
          )}

          {partenaire.email && (
            <div className="flex items-center gap-3 text-sm">
              <Mail className="w-4 h-4 text-slate-400 flex-shrink-0" />
              <a 
                href={`mailto:${partenaire.email}`}
                className="text-slate-600 hover:text-[#1E40AF] truncate"
              >
                {partenaire.email}
              </a>
            </div>
          )}

          {partenaire.telephone && (
            <div className="flex items-center gap-3 text-sm">
              <Phone className="w-4 h-4 text-slate-400 flex-shrink-0" />
              <a 
                href={`tel:${partenaire.telephone}`}
                className="text-slate-600 hover:text-[#1E40AF]"
              >
                {partenaire.telephone}
              </a>
            </div>
          )}

          {partenaire.zone_activite && (
            <div className="pt-3 border-t border-slate-100">
              <p className="text-xs text-slate-500">Zone d'activité</p>
              <p className="text-sm font-medium text-slate-700">{partenaire.zone_activite}</p>
            </div>
          )}

          {partenaire.created_by && (
            <div className="pt-3 border-t border-slate-100">
              <p className="text-xs text-slate-500">Créé par</p>
              <p className="text-sm font-medium text-slate-700">{partenaire.created_by}</p>
            </div>
          )}

          {partenaire.taux_retrocession !== undefined && (
            <div className="pt-3 border-t border-slate-100">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="w-4 h-4 text-[#F59E0B]" />
                <span className="text-sm font-semibold text-slate-700">Rétrocession</span>
              </div>
              <p className="text-2xl font-bold text-[#F59E0B]">{partenaire.taux_retrocession}%</p>
            </div>
          )}

          {(partenaire.nombre_leads > 0 || partenaire.nombre_ventes > 0) && (
            <div className="pt-3 border-t border-slate-100">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-slate-500">Leads</p>
                  <p className="text-lg font-bold text-slate-700">{partenaire.nombre_leads || 0}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Ventes</p>
                  <p className="text-lg font-bold text-green-600">{partenaire.nombre_ventes || 0}</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
