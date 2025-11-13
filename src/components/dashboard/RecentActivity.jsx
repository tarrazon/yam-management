import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Clock } from "lucide-react";

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

export default function RecentActivity({ reservations }) {
  return (
    <Card className="border-none shadow-lg bg-white">
      <CardHeader className="border-b border-slate-100">
        <CardTitle className="text-xl font-bold text-[#0F172A] flex items-center gap-2">
          <Clock className="w-5 h-5 text-[#D4AF37]" />
          Activité récente
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-4">
          {reservations.length === 0 ? (
            <p className="text-center text-slate-400 py-8">Aucune activité récente</p>
          ) : (
            reservations.map((reservation) => (
              <div
                key={reservation.id}
                className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-[#0F172A] text-sm truncate">
                    {reservation.client_nom}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    {reservation.residence_nom} - Lot {reservation.lot_numero}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge className={`${statusColors[reservation.statut]} border text-xs`}>
                      {statusLabels[reservation.statut]}
                    </Badge>
                    <span className="text-xs text-slate-400">
                      {format(new Date(reservation.created_date), "d MMM", { locale: fr })}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-[#0F172A] text-sm">
                    {(reservation.montant / 1000).toFixed(0)}k€
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}