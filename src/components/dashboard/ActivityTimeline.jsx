import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Activity } from "lucide-react";

const statusColors = {
  disponible: "bg-green-100 text-green-800 border-green-200",
  sous_option: "bg-blue-100 text-blue-800 border-blue-200",
  reserve: "bg-yellow-100 text-yellow-800 border-yellow-200",
  compromis: "bg-orange-100 text-orange-800 border-orange-200",
  vendu: "bg-purple-100 text-purple-800 border-purple-200",
};

const statusLabels = {
  disponible: "Disponible",
  sous_option: "Sous option",
  reserve: "Réservé",
  compromis: "Compromis",
  vendu: "Vendu",
};

export default function ActivityTimeline({ lots }) {
  // Récupérer les lots les plus récemment modifiés/créés
  const recentLots = [...lots]
    .filter(lot => lot.updated_at || lot.created_at)
    .sort((a, b) => {
      const dateA = new Date(a.updated_at || a.created_at);
      const dateB = new Date(b.updated_at || b.created_at);
      return dateB - dateA;
    })
    .slice(0, 8);

  return (
    <Card className="border-none shadow-lg bg-white">
      <CardHeader className="border-b border-slate-100">
        <CardTitle className="text-xl font-bold text-[#1E40AF] flex items-center gap-2">
          <Activity className="w-5 h-5 text-[#F59E0B]" />
          Activité récente
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-4">
          {recentLots.length === 0 ? (
            <p className="text-center text-slate-400 py-8">Aucune activité récente</p>
          ) : (
            recentLots.map((lot) => (
              <div
                key={lot.id}
                className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-[#1E40AF] text-sm">
                    Lot {lot.reference}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    {lot.residence_nom}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge className={`${statusColors[lot.statut]} border text-xs`}>
                      {statusLabels[lot.statut]}
                    </Badge>
                    {(lot.updated_at || lot.created_at) && (
                      <span className="text-xs text-slate-400">
                        {format(new Date(lot.updated_at || lot.created_at), "d MMM", { locale: fr })}
                      </span>
                    )}
                  </div>
                </div>
                {lot.prix_fai && (
                  <div className="text-right">
                    <p className="font-bold text-[#1E40AF] text-sm">
                      {(lot.prix_fai / 1000).toFixed(0)}k€
                    </p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}