import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Building2, MapPin, Calendar, Edit } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { motion } from "framer-motion";

const statusColors = {
  en_commercialisation: "bg-green-100 text-green-800 border-green-200",
  bientot_disponible: "bg-blue-100 text-blue-800 border-blue-200",
  complet: "bg-slate-100 text-slate-800 border-slate-200",
};

const statusLabels = {
  en_commercialisation: "En commercialisation",
  bientot_disponible: "Bientôt disponible",
  complet: "Complet",
};

export default function ResidenceCard({ residence, onEdit }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="border-none shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden bg-white group">
        <div className="h-48 overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200 relative">
          {residence.image_url ? (
            <img 
              src={residence.image_url} 
              alt={residence.nom}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Building2 className="w-20 h-20 text-slate-300" />
            </div>
          )}
          <div className="absolute top-4 right-4">
            <Badge className={`${statusColors[residence.statut]} border shadow-sm`}>
              {statusLabels[residence.statut]}
            </Badge>
          </div>
        </div>

        <CardHeader className="pb-3">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h3 className="text-xl font-bold text-[#0F172A] mb-2">{residence.nom}</h3>
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <MapPin className="w-4 h-4" />
                <span>{residence.ville}</span>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onEdit(residence)}
              className="hover:bg-slate-100"
            >
              <Edit className="w-4 h-4 text-slate-500" />
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          {residence.description && (
            <p className="text-sm text-slate-600 mb-4 line-clamp-2">
              {residence.description}
            </p>
          )}
          
          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <div>
              <p className="text-xs text-slate-500">Lots</p>
              <p className="text-lg font-bold text-[#0F172A]">{residence.nombre_lots || 0}</p>
            </div>
            {residence.date_livraison && (
              <div className="text-right">
                <p className="text-xs text-slate-500 flex items-center gap-1 justify-end">
                  <Calendar className="w-3 h-3" />
                  Livraison
                </p>
                <p className="text-sm font-semibold text-[#0F172A]">
                  {format(new Date(residence.date_livraison), "MMM yyyy", { locale: fr })}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}