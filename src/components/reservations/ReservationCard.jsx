import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileCheck, Edit, User, Home, Euro, Calendar } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { motion } from "framer-motion";

const statusColors = {
  en_attente: "bg-yellow-100 text-yellow-800 border-yellow-200",
  confirmee: "bg-blue-100 text-blue-800 border-blue-200",
  vendu: "bg-green-100 text-green-800 border-green-200",
  annulee: "bg-red-100 text-red-800 border-red-200",
};

const statusLabels = {
  en_attente: "En attente",
  confirmee: "Confirmée",
  vendu: "Vendu",
  annulee: "Annulée",
};

export default function ReservationCard({ reservation, onEdit }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="border-none shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden bg-white">
        <CardHeader className="border-b border-slate-100 pb-4 bg-gradient-to-br from-slate-50 to-white">
          <div className="flex justify-between items-start">
            <div className="flex items-start gap-3 flex-1">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#0F172A] to-[#1E293B] flex items-center justify-center flex-shrink-0">
                <FileCheck className="w-6 h-6 text-[#D4AF37]" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-bold text-[#0F172A] mb-1 truncate">
                  Réservation #{reservation.id.slice(-6).toUpperCase()}
                </h3>
                <Badge className={`${statusColors[reservation.statut]} border`}>
                  {statusLabels[reservation.statut]}
                </Badge>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onEdit(reservation)}
              className="hover:bg-slate-100 flex-shrink-0"
            >
              <Edit className="w-4 h-4 text-slate-500" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-6 space-y-4">
          <div className="flex items-center gap-3">
            <User className="w-4 h-4 text-slate-400 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm text-slate-500">Client</p>
              <p className="font-semibold text-[#0F172A] truncate">{reservation.client_nom}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Home className="w-4 h-4 text-slate-400 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm text-slate-500">Lot</p>
              <p className="font-semibold text-[#0F172A]">
                Lot {reservation.lot_numero}
              </p>
              {reservation.residence_nom && (
                <p className="text-xs text-slate-500 truncate">{reservation.residence_nom}</p>
              )}
            </div>
          </div>

          {reservation.date_reservation && (
            <div className="flex items-center gap-3">
              <Calendar className="w-4 h-4 text-slate-400 flex-shrink-0" />
              <div>
                <p className="text-sm text-slate-500">Date de réservation</p>
                <p className="font-medium text-slate-700">
                  {format(new Date(reservation.date_reservation), "d MMMM yyyy", { locale: fr })}
                </p>
              </div>
            </div>
          )}

          <div className="pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Euro className="w-5 h-5 text-[#D4AF37]" />
                <span className="text-sm text-slate-500">Montant</span>
              </div>
              <span className="text-2xl font-bold text-[#0F172A]">
                {(reservation.montant / 1000).toFixed(0)}k€
              </span>
            </div>
          </div>

          {reservation.notes && (
            <div className="pt-3 border-t border-slate-100">
              <p className="text-xs text-slate-500 line-clamp-2">{reservation.notes}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}