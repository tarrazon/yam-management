
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { X, Edit, Mail, Phone, MapPin, FileCheck, Building2, Trash2 } from "lucide-react";
import { motion } from "framer-motion";

const typeColors = {
  vendeur: "bg-blue-100 text-blue-800 border-blue-200",
  acquereur: "bg-green-100 text-green-800 border-green-200",
  mixte: "bg-purple-100 text-purple-800 border-purple-200",
};

const typeLabels = {
  vendeur: "Vendeur",
  acquereur: "Acquéreur",
  mixte: "Mixte",
};

export default function NotaireDetail({ notaire, onClose, onEdit, onDelete }) {
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
              <FileCheck className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">
                {notaire.prenom} {notaire.nom}
              </h2>
              {notaire.type_notaire && (
                <Badge className="bg-white/20 text-white border-white/30 mt-2">
                  {typeLabels[notaire.type_notaire]}
                </Badge>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            {onEdit && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onEdit(notaire)}
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
                onClick={() => onDelete(notaire)}
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
          {/* Étude */}
          {notaire.etude && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-[#F59E0B]" />
                  Étude notariale
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xl font-bold text-[#1E40AF]">{notaire.etude}</p>
              </CardContent>
            </Card>
          )}

          {/* Informations de contact */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Coordonnées</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {notaire.email && (
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-slate-400" />
                  <a href={`mailto:${notaire.email}`} className="text-slate-700 hover:text-[#1E40AF]">
                    {notaire.email}
                  </a>
                </div>
              )}
              {notaire.telephone && (
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-slate-400" />
                  <a href={`tel:${notaire.telephone}`} className="text-slate-700 hover:text-[#1E40AF]">
                    {notaire.telephone}
                  </a>
                </div>
              )}
              {notaire.adresse && (
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-slate-400 mt-1" />
                  <div>
                    <p className="text-slate-700">{notaire.adresse}</p>
                    {(notaire.code_postal || notaire.ville) && (
                      <p className="text-slate-600 text-sm">
                        {notaire.code_postal} {notaire.ville}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Spécialités et performances */}
          <div className="grid md:grid-cols-2 gap-6">
            {notaire.specialites && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Spécialités</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-700">{notaire.specialites}</p>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Dossiers traités</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold text-[#1E40AF]">{notaire.nombre_dossiers || 0}</p>
                <p className="text-sm text-slate-500 mt-2">Dossiers finalisés avec ce notaire</p>
              </CardContent>
            </Card>
          </div>

          {/* Notes */}
          {notaire.notes && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Notes internes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-700 whitespace-pre-wrap">{notaire.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
