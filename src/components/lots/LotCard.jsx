import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Home, Edit, Maximize, Euro, MapPin } from "lucide-react";
import { motion } from "framer-motion";

const statusColors = {
  disponible: "bg-green-100 text-green-800 border-green-200",
  reserve: "bg-orange-100 text-orange-800 border-orange-200",
  vendu: "bg-slate-100 text-slate-800 border-slate-200",
};

const statusLabels = {
  disponible: "Disponible",
  reserve: "Réservé",
  vendu: "Vendu",
};

const typeColors = {
  T1: "bg-blue-50 text-blue-700",
  T2: "bg-purple-50 text-purple-700",
  T3: "bg-pink-50 text-pink-700",
  T4: "bg-indigo-50 text-indigo-700",
  T5: "bg-violet-50 text-violet-700",
  Maison: "bg-emerald-50 text-emerald-700",
  Parking: "bg-slate-50 text-slate-700",
  Cave: "bg-amber-50 text-amber-700",
};

export default function LotCard({ lot, onEdit }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="border-none shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden bg-white group">
        <div className="h-40 overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200 relative">
          {lot.images && lot.images[0] ? (
            <img 
              src={lot.images[0]} 
              alt={`Lot ${lot.numero_lot}`}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Home className="w-16 h-16 text-slate-300" />
            </div>
          )}
          <div className="absolute top-4 left-4">
            <Badge className={`${typeColors[lot.type]} border-0 shadow-sm font-semibold`}>
              {lot.type}
            </Badge>
          </div>
          <div className="absolute top-4 right-4">
            <Badge className={`${statusColors[lot.statut]} border shadow-sm`}>
              {statusLabels[lot.statut]}
            </Badge>
          </div>
        </div>

        <CardHeader className="pb-3">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h3 className="text-xl font-bold text-[#0F172A] mb-1">
                Lot {lot.numero_lot}
              </h3>
              {lot.residence_nom && (
                <div className="flex items-center gap-1 text-sm text-slate-500">
                  <MapPin className="w-3 h-3" />
                  <span>{lot.residence_nom}</span>
                </div>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onEdit(lot)}
              className="hover:bg-slate-100"
            >
              <Edit className="w-4 h-4 text-slate-500" />
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-600">
                <Maximize className="w-4 h-4" />
                <span className="text-sm font-medium">{lot.surface} m²</span>
              </div>
              {lot.etage && (
                <span className="text-sm text-slate-500">Étage {lot.etage}</span>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              {lot.balcon && (
                <Badge variant="outline" className="text-xs">Balcon</Badge>
              )}
              {lot.terrasse && (
                <Badge variant="outline" className="text-xs">Terrasse</Badge>
              )}
              {lot.jardin && (
                <Badge variant="outline" className="text-xs">Jardin</Badge>
              )}
            </div>

            <div className="pt-3 border-t border-slate-100">
              <div className="flex items-center gap-2">
                <Euro className="w-5 h-5 text-[#D4AF37]" />
                <span className="text-2xl font-bold text-[#0F172A]">
                  {(lot.prix / 1000).toFixed(0)}k€
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}