import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp } from "lucide-react";
import { formatCurrency } from "@/utils/formHelpers";

const typeColors = {
  cgp: "bg-purple-100 text-purple-700",
  plateforme: "bg-blue-100 text-blue-700",
  courtier: "bg-green-100 text-green-700",
  notaire: "bg-amber-100 text-amber-700",
  diffuseur_web: "bg-pink-100 text-pink-700",
  autre: "bg-slate-100 text-slate-700",
};

export default function PartnersPerformance({ partenaires, lots }) {
  // Calculer les performances réelles basées sur les lots vendus
  const partenairesWithStats = partenaires.map(partenaire => {
    const lotsVendus = lots.filter(l => l.statut === 'vendu' && l.partenaire_id === partenaire.id);
    const caGenere = lotsVendus.reduce((sum, lot) => sum + (lot.prix_fai || 0), 0);
    const nombreVentes = lotsVendus.length;
    
    return {
      ...partenaire,
      ca_genere_calcule: caGenere,
      nombre_ventes_calcule: nombreVentes,
    };
  });

  const sortedPartenaires = [...partenairesWithStats]
    .sort((a, b) => (b.ca_genere_calcule || 0) - (a.ca_genere_calcule || 0))
    .slice(0, 5);

  return (
    <Card className="border-none shadow-lg bg-white">
      <CardHeader className="border-b border-slate-100">
        <CardTitle className="text-xl font-bold text-[#1E40AF] flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-[#F59E0B]" />
          Top Partenaires
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-4">
          {sortedPartenaires.length === 0 ? (
            <p className="text-center text-slate-400 py-8">Aucun partenaire</p>
          ) : (
            sortedPartenaires.map((partenaire, index) => (
              <div
                key={partenaire.id}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    ['bg-blue-100', 'bg-green-100', 'bg-purple-100', 'bg-orange-100', 'bg-pink-100'][index % 5]
                  }`}>
                    <span className={`text-sm font-medium ${
                      ['text-blue-600', 'text-green-600', 'text-purple-600', 'text-orange-600', 'text-pink-600'][index % 5]
                    }`}>
                      {partenaire.nom ? partenaire.nom[0].toUpperCase() : '?'}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">{partenaire.nom || partenaire.nom_societe || 'Sans nom'}</p>
                    <div className="flex items-center gap-2 mt-1">
                      {partenaire.type_partenaire && (
                        <Badge className={`${typeColors[partenaire.type_partenaire] || typeColors.autre} text-xs`} variant="secondary">
                          {partenaire.type_partenaire.toUpperCase()}
                        </Badge>
                      )}
                      <span className="text-xs text-slate-500">
                        {partenaire.nombre_ventes_calcule || 0} ventes
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-[#1E40AF] text-sm">
                    {Math.round((partenaire.ca_genere_calcule || 0) / 1000)}k€
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