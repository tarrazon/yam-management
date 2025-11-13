import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, TrendingUp, Euro, Award } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

export default function PartenaireStats({ partenaire }) {
  const { data: acquereurs = [] } = useQuery({
    queryKey: ['acquereurs'],
    queryFn: () => base44.entities.Acquereur.list(),
  });

  const { data: lots = [] } = useQuery({
    queryKey: ['lots_lmnp'],
    queryFn: () => base44.entities.LotLMNP.list(),
  });

  // Calculer le nombre de leads (acquéreurs liés au partenaire)
  const nombreLeads = acquereurs.filter(a => a.partenaire_id === partenaire.id).length;

  // Calculer le nombre de ventes (lots vendus avec ce partenaire)
  const lotsVendus = lots.filter(l => l.partenaire_id === partenaire.id && l.statut === 'vendu');
  const nombreVentes = lotsVendus.length;

  // Calculer le CA généré (somme des prix_fai des lots vendus)
  const caGenere = lotsVendus.reduce((sum, lot) => sum + (lot.prix_fai || 0), 0);

  // Calculer le montant total de commission
  const commissionTotale = lotsVendus.reduce((sum, lot) => sum + (lot.commission_partenaire || 0), 0);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card className="border-none shadow-lg bg-gradient-to-br from-blue-50 to-blue-100">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-blue-700 flex items-center gap-2">
            <Users className="w-4 h-4" />
            Leads apportés
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold text-blue-900">{nombreLeads}</p>
          <p className="text-xs text-blue-600 mt-1">Acquéreurs liés</p>
        </CardContent>
      </Card>

      <Card className="border-none shadow-lg bg-gradient-to-br from-green-50 to-green-100">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-green-700 flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Ventes réalisées
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold text-green-900">{nombreVentes}</p>
          <p className="text-xs text-green-600 mt-1">Lots vendus</p>
        </CardContent>
      </Card>

      <Card className="border-none shadow-lg bg-gradient-to-br from-indigo-50 to-indigo-100">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-indigo-700 flex items-center gap-2">
            <Euro className="w-4 h-4" />
            CA généré
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold text-indigo-900">
            {caGenere.toLocaleString('fr-FR')} €
          </p>
          <p className="text-xs text-indigo-600 mt-1">Chiffre d'affaires total</p>
        </CardContent>
      </Card>

      <Card className="border-none shadow-lg bg-gradient-to-br from-amber-50 to-amber-100">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-amber-700 flex items-center gap-2">
            <Award className="w-4 h-4" />
            Commissions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold text-amber-900">
            {commissionTotale.toLocaleString('fr-FR')} €
          </p>
          <p className="text-xs text-amber-600 mt-1">Montant total</p>
        </CardContent>
      </Card>
    </div>
  );
}