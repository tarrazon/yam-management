
import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileCheck, Edit, Mail, Phone, MapPin, Eye, Building2, Trash2 } from "lucide-react";
import { motion } from "framer-motion";

const typeColors = {
  vendeur: "bg-blue-100 text-blue-800",
  acquereur: "bg-green-100 text-green-800",
  mixte: "bg-purple-100 text-purple-800",
};

const typeLabels = {
  vendeur: "Vendeur",
  acquereur: "Acquéreur",
  mixte: "Mixte",
};

export default function NotaireCard({ notaire, onEdit, onView, onDelete }) {
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
                <FileCheck className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-bold text-[#1E40AF] truncate">
                  {notaire.prenom} {notaire.nom}
                </h3>
                {notaire.type_notaire && (
                  <Badge className={`${typeColors[notaire.type_notaire]} mt-1`}>
                    {typeLabels[notaire.type_notaire]}
                  </Badge>
                )}
              </div>
            </div>
            <div className="flex gap-1 flex-shrink-0">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onView(notaire)}
                className="hover:bg-slate-100"
                title="Voir la fiche"
              >
                <Eye className="w-4 h-4 text-slate-500" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onEdit(notaire)}
                className="hover:bg-slate-100"
                title="Modifier"
              >
                <Edit className="w-4 h-4 text-slate-500" />
              </Button>
              {onDelete && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDelete(notaire)}
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
          {notaire.etude && (
            <div className="pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-[#F59E0B]" />
                <span className="font-semibold text-slate-700">{notaire.etude}</span>
              </div>
            </div>
          )}

          {notaire.email && (
            <div className="flex items-center gap-3 text-sm">
              <Mail className="w-4 h-4 text-slate-400 flex-shrink-0" />
              <a 
                href={`mailto:${notaire.email}`}
                className="text-slate-600 hover:text-[#1E40AF] truncate"
              >
                {notaire.email}
              </a>
            </div>
          )}

          {notaire.telephone && (
            <div className="flex items-center gap-3 text-sm">
              <Phone className="w-4 h-4 text-slate-400 flex-shrink-0" />
              <a 
                href={`tel:${notaire.telephone}`}
                className="text-slate-600 hover:text-[#1E40AF]"
              >
                {notaire.telephone}
              </a>
            </div>
          )}

          {(notaire.ville || notaire.code_postal) && (
            <div className="flex items-center gap-3 text-sm">
              <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0" />
              <span className="text-slate-600">
                {notaire.code_postal} {notaire.ville}
              </span>
            </div>
          )}

          {notaire.specialites && (
            <div className="pt-3 border-t border-slate-100">
              <p className="text-xs text-slate-500 mb-1">Spécialités</p>
              <p className="text-sm text-slate-700">{notaire.specialites}</p>
            </div>
          )}

          {notaire.nombre_dossiers > 0 && (
            <div className="pt-3 border-t border-slate-100">
              <p className="text-xs text-slate-500">Dossiers traités</p>
              <p className="text-2xl font-bold text-[#1E40AF]">{notaire.nombre_dossiers}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
