import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, Home } from "lucide-react";

const typeColors = {
  ehpad: "bg-purple-100 text-purple-700",
  etudiante: "bg-blue-100 text-blue-700",
  affaires: "bg-green-100 text-green-700",
  tourisme: "bg-amber-100 text-amber-700",
  senior: "bg-pink-100 text-pink-700",
};

export default function TopResidences({ residences, lots }) {
  const residencesWithLots = residences.map(residence => {
    const residenceLots = lots.filter(l => l.residence_id === residence.id);
    const disponibles = residenceLots.filter(l => l.statut === 'disponible').length;
    const vendus = residenceLots.filter(l => l.statut === 'vendu').length;
    
    return {
      ...residence,
      nbLots: residenceLots.length,
      disponibles,
      vendus,
      tauxVente: residenceLots.length > 0 ? ((vendus / residenceLots.length) * 100).toFixed(0) : 0,
    };
  }).sort((a, b) => b.nbLots - a.nbLots).slice(0, 5);

  return (
    <Card className="border-none shadow-lg bg-white">
      <CardHeader className="border-b border-slate-100">
        <CardTitle className="text-xl font-bold text-[#1E40AF] flex items-center gap-2">
          <Building2 className="w-5 h-5 text-[#F59E0B]" />
          Top Résidences
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-4">
          {residencesWithLots.length === 0 ? (
            <p className="text-center text-slate-400 py-8">Aucune résidence</p>
          ) : (
            residencesWithLots.map((residence) => (
              <div
                key={residence.id}
                className="flex items-center justify-between p-4 rounded-lg hover:bg-slate-50 transition-colors border border-slate-100"
              >
                <div className="flex items-start gap-3 flex-1">
                  <div className="p-2 rounded-lg bg-blue-50">
                    <Building2 className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-[#1E40AF] truncate">{residence.nom}</p>
                    <p className="text-sm text-slate-500">{residence.ville}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge className={`${typeColors[residence.type_residence]} text-xs`} variant="secondary">
                        {residence.type_residence}
                      </Badge>
                      <span className="text-xs text-slate-500">
                        {residence.disponibles} dispo · {residence.vendus} vendus
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right ml-4">
                  <div className="flex items-center gap-1 text-sm text-slate-600">
                    <Home className="w-4 h-4" />
                    <span className="font-bold">{residence.nbLots}</span>
                  </div>
                  <p className="text-xs text-green-600 font-medium mt-1">
                    {residence.tauxVente}% vendus
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