
import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { User, Edit, Mail, Phone, Building2, MapPin, Globe, Trash2 } from "lucide-react";
import { motion } from "framer-motion";

const typeContactColors = {
  gestionnaire_site: "bg-blue-100 text-blue-800 border-blue-200",
  syndic: "bg-purple-100 text-purple-800 border-purple-200",
  association_copro: "bg-green-100 text-green-800 border-green-200",
  mairie: "bg-amber-100 text-amber-800 border-amber-200",
};

const typeContactLabels = {
  gestionnaire_site: "Gestionnaire sur site",
  syndic: "Syndic de copropriété",
  association_copro: "Association copro",
  mairie: "Contact mairie",
};

const reactiviteColors = {
  excellente: "bg-green-500",
  bonne: "bg-blue-500",
  moyenne: "bg-yellow-500",
  faible: "bg-red-500",
};

export default function ContactResidenceCard({ contact, onEdit, onDelete }) {
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
                <User className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-bold text-[#1E40AF] truncate">
                  {contact.nom}
                </h3>
                <Badge className={`${typeContactColors[contact.type_contact]} border mt-1`}>
                  {typeContactLabels[contact.type_contact]}
                </Badge>
                {contact.reactivite && (
                  <div className="flex items-center gap-2 mt-2">
                    <div className={`w-2 h-2 rounded-full ${reactiviteColors[contact.reactivite]}`} />
                    <span className="text-xs text-slate-500 capitalize">{contact.reactivite}</span>
                  </div>
                )}
              </div>
            </div>
            <div className="flex gap-1 flex-shrink-0">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onEdit(contact)}
                className="hover:bg-slate-100"
                title="Modifier"
              >
                <Edit className="w-4 h-4 text-slate-500" />
              </Button>
              {onDelete && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDelete(contact)}
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
          {contact.residence_nom && (
            <div className="flex items-center gap-2 text-sm pb-3 border-b border-slate-100">
              <Building2 className="w-4 h-4 text-[#F59E0B] flex-shrink-0" />
              <span className="font-semibold text-slate-700 truncate">{contact.residence_nom}</span>
            </div>
          )}

          {contact.fonction && (
            <div className="text-sm">
              <p className="text-slate-500 text-xs">Fonction</p>
              <p className="font-medium text-slate-700">{contact.fonction}</p>
            </div>
          )}

          {contact.societe && (
            <div className="text-sm">
              <p className="text-slate-500 text-xs">Société</p>
              <p className="font-medium text-slate-700">{contact.societe}</p>
            </div>
          )}

          {contact.email && (
            <div className="flex items-center gap-3 text-sm">
              <Mail className="w-4 h-4 text-slate-400 flex-shrink-0" />
              <a 
                href={`mailto:${contact.email}`}
                className="text-slate-600 hover:text-[#1E40AF] truncate"
              >
                {contact.email}
              </a>
            </div>
          )}

          {contact.telephone && (
            <div className="flex items-center gap-3 text-sm">
              <Phone className="w-4 h-4 text-slate-400 flex-shrink-0" />
              <a 
                href={`tel:${contact.telephone}`}
                className="text-slate-600 hover:text-[#1E40AF]"
              >
                {contact.telephone}
              </a>
            </div>
          )}

          {contact.adresse && (
            <div className="flex items-start gap-3 text-sm pt-2">
              <MapPin className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-slate-500 line-clamp-2">{contact.adresse}</p>
            </div>
          )}

          {contact.site_web && (
            <div className="flex items-center gap-3 text-sm">
              <Globe className="w-4 h-4 text-slate-400 flex-shrink-0" />
              <a 
                href={contact.site_web}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 truncate text-xs"
              >
                {contact.site_web}
              </a>
            </div>
          )}

          {contact.qualite_relation && (
            <div className="pt-3 border-t border-slate-100">
              <p className="text-xs text-slate-500">
                Qualité relation : <span className="font-medium text-slate-700 capitalize">{contact.qualite_relation}</span>
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
