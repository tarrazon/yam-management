
import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { User, Edit, Mail, Phone, FileCheck, Building2, Eye, Trash2 } from "lucide-react";
import { motion } from "framer-motion";

const statusColors = {
  prospect: "bg-blue-100 text-blue-800 border-blue-200",
  en_negociation: "bg-yellow-100 text-yellow-800 border-yellow-200",
  mandate: "bg-green-100 text-green-800 border-green-200",
  vendu: "bg-purple-100 text-purple-800 border-purple-200",
  perdu: "bg-red-100 text-red-800 border-red-200",
};

const statusLabels = {
  prospect: "Prospect",
  en_negociation: "En négociation",
  mandate: "Mandaté",
  vendu: "Vendu",
  perdu: "Perdu",
};

export default function VendeurCard({ vendeur, onEdit, onView, onDelete, lotsAssocies = [] }) {
  const isEntreprise = vendeur.type_vendeur === 'entreprise';
  const documents = isEntreprise ? vendeur.documents_entreprise : vendeur.documents_particulier;
  const documentsCount = documents ? 
    Object.values(documents).filter(doc => doc && doc !== "").length : 0;
  const totalDocuments = isEntreprise ? 13 : 14;

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
                {isEntreprise ? (
                  <Building2 className="w-6 h-6 text-white" />
                ) : (
                  <User className="w-6 h-6 text-white" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-bold text-[#1E40AF] truncate">
                  {isEntreprise ? vendeur.nom : `${vendeur.prenom} ${vendeur.nom}`}
                </h3>
                <div className="flex gap-2 mt-1 flex-wrap">
                  <Badge className={`${statusColors[vendeur.statut_commercial]} border`}>
                    {statusLabels[vendeur.statut_commercial]}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {isEntreprise ? "Entreprise" : "Particulier"}
                  </Badge>
                </div>
              </div>
            </div>
            <div className="flex gap-1 flex-shrink-0">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onView(vendeur)}
                className="hover:bg-slate-100"
                title="Voir la fiche"
              >
                <Eye className="w-4 h-4 text-slate-500" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onEdit(vendeur)}
                className="hover:bg-slate-100"
                title="Modifier"
              >
                <Edit className="w-4 h-4 text-slate-500" />
              </Button>
              {onDelete && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDelete(vendeur)}
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
          {vendeur.email && (
            <div className="flex items-center gap-3 text-sm">
              <Mail className="w-4 h-4 text-slate-400 flex-shrink-0" />
              <a 
                href={`mailto:${vendeur.email}`}
                className="text-slate-600 hover:text-[#1E40AF] truncate"
              >
                {vendeur.email}
              </a>
            </div>
          )}

          {vendeur.telephone && (
            <div className="flex items-center gap-3 text-sm">
              <Phone className="w-4 h-4 text-slate-400 flex-shrink-0" />
              <a 
                href={`tel:${vendeur.telephone}`}
                className="text-slate-600 hover:text-[#1E40AF]"
              >
                {vendeur.telephone}
              </a>
            </div>
          )}

          {vendeur.statut_juridique && (
            <div className="pt-3 border-t border-slate-100">
              <p className="text-xs text-slate-500">
                Statut : <span className="font-medium text-slate-700 capitalize">{vendeur.statut_juridique}</span>
              </p>
            </div>
          )}

          <div className="pt-3 border-t border-slate-100">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-[#F59E0B]" />
                <span className="text-sm font-semibold text-slate-700">Documents</span>
              </div>
              <span className="text-xs font-medium text-slate-600">
                {documentsCount} / {totalDocuments}
              </span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2">
              <div 
                className="bg-[#F59E0B] h-2 rounded-full transition-all" 
                style={{ width: `${(documentsCount / totalDocuments) * 100}%` }}
              />
            </div>
          </div>

          {lotsAssocies.length > 0 && (
            <div className="pt-2">
              <p className="text-xs text-slate-500">
                <span className="font-semibold text-slate-700">{lotsAssocies.length}</span> lot(s) associé(s)
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
