import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Handshake, Users, Target, TrendingUp, Euro, Building2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import StatsCard from "../components/dashboard/StatsCardCRM";
import ActivityTimeline from "../components/dashboard/ActivityTimeline";
import { formatCurrency } from "@/utils/formHelpers";

export default function CommercialDashboard() {
  const { profile } = useAuth();

  const { data: partenairesCommercial = [] } = useQuery({
    queryKey: ['partenaires_commercial', profile?.id],
    queryFn: async () => {
      if (!profile?.id) return [];
      const { data, error } = await supabase
        .from('partenaires')
        .select('*')
        .eq('created_by', profile.id)
        .order('nom', { ascending: true });
      if (error) throw error;
      return data || [];
    },
    enabled: !!profile?.id,
  });

  const { data: lots = [] } = useQuery({
    queryKey: ['lots_lmnp'],
    queryFn: () => base44.entities.LotLMNP.list(),
  });

  const { data: acquereurs = [] } = useQuery({
    queryKey: ['acquereurs'],
    queryFn: () => base44.entities.Acquereur.list(),
  });

  const { data: residences = [] } = useQuery({
    queryKey: ['residences_gestion'],
    queryFn: () => base44.entities.ResidenceGestion.list(),
  });

  const partenaireIds = partenairesCommercial.map(p => p.id);

  const lotsPartenaires = lots.filter(lot =>
    lot.partenaire_id && partenaireIds.includes(lot.partenaire_id)
  );

  const lotsDisponibles = lotsPartenaires.filter(lot => lot.statut === 'disponible');
  const lotsVendus = lotsPartenaires.filter(lot => lot.statut === 'vendu');
  const lotsEnCours = lotsPartenaires.filter(lot =>
    ['reserve', 'compromis', 'acte_programme'].includes(lot.statut)
  );

  const caRealise = lotsVendus.reduce((sum, lot) => sum + (parseFloat(lot.prix_vente) || 0), 0);
  const caPotentiel = lotsEnCours.reduce((sum, lot) => sum + (parseFloat(lot.prix_vente) || 0), 0);

  const tauxConversion = lotsPartenaires.length > 0
    ? ((lotsVendus.length / lotsPartenaires.length) * 100).toFixed(1)
    : "0.0";

  const acquereursPartenaires = acquereurs.filter(acq =>
    acq.partenaire_id && partenaireIds.includes(acq.partenaire_id)
  );

  const residencesActives = [...new Set(lotsPartenaires.map(l => l.residence_id).filter(Boolean))].length;

  return (
    <div className="p-6 md:p-8 bg-[#F9FAFB] min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#1E40AF] mb-2">Mon Activité Commerciale</h1>
          <p className="text-slate-500">Suivi de mes partenaires et de leur activité</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <StatsCard
            title="Mes Partenaires"
            value={partenairesCommercial.length}
            subtitle={`${partenairesCommercial.filter(p => p.statut === 'actif').length} actifs`}
            icon={Handshake}
            trend="neutral"
            iconBgColor="bg-gradient-to-br from-amber-500 to-orange-600"
          />

          <StatsCard
            title="CA réalisé"
            value={formatCurrency(caRealise)}
            subtitle={`${lotsVendus.length} ventes`}
            icon={Euro}
            trend="up"
            iconBgColor="bg-gradient-to-br from-green-500 to-emerald-600"
          />

          <StatsCard
            title="Taux conversion"
            value={`${tauxConversion}%`}
            subtitle={`${lotsVendus.length} vendus / ${lotsPartenaires.length} lots`}
            icon={Target}
            trend={parseFloat(tauxConversion) > 20 ? "up" : "neutral"}
            iconBgColor="bg-gradient-to-br from-purple-500 to-purple-600"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card className="border-none shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[#1E40AF]">
                <TrendingUp className="w-5 h-5" />
                Pipeline de ventes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-amber-50 rounded-lg">
                  <div>
                    <p className="text-sm text-slate-600">En cours de vente</p>
                    <p className="text-2xl font-bold text-amber-600">{lotsEnCours.length}</p>
                  </div>
                  <p className="text-sm text-slate-500">{formatCurrency(caPotentiel)}</p>
                </div>
                <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                  <div>
                    <p className="text-sm text-slate-600">Vendus</p>
                    <p className="text-2xl font-bold text-green-600">{lotsVendus.length}</p>
                  </div>
                  <p className="text-sm text-slate-500">{formatCurrency(caRealise)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[#1E40AF]">
                <Users className="w-5 h-5" />
                Mes statistiques
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg flex items-center justify-center">
                      <Handshake className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-600">Partenaires</p>
                      <p className="text-lg font-bold text-slate-800">{partenairesCommercial.length}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                      <Users className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-600">Acquéreurs</p>
                      <p className="text-lg font-bold text-slate-800">{acquereursPartenaires.length}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                      <Building2 className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-600">Résidences actives</p>
                      <p className="text-lg font-bold text-slate-800">{residencesActives}</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="border-none shadow-md">
          <CardHeader>
            <CardTitle className="text-[#1E40AF]">Mes Partenaires</CardTitle>
          </CardHeader>
          <CardContent>
            {partenairesCommercial.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <Handshake className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                <p>Vous n'avez pas encore de partenaires</p>
                <p className="text-sm mt-1">Créez votre premier partenaire depuis le menu Partenaires</p>
              </div>
            ) : (
              <div className="space-y-3">
                {partenairesCommercial.map((partenaire) => {
                  const lotsPartenaire = lotsPartenaires.filter(l => l.partenaire_id === partenaire.id);
                  const vendusPartenaire = lotsPartenaire.filter(l => l.statut === 'vendu').length;
                  const caPartenaire = lotsPartenaire
                    .filter(l => l.statut === 'vendu')
                    .reduce((sum, l) => sum + (parseFloat(l.prix_vente) || 0), 0);

                  return (
                    <div
                      key={partenaire.id}
                      className="flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg flex items-center justify-center">
                          <Handshake className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800">{partenaire.nom}</p>
                          <p className="text-sm text-slate-500">{partenaire.contact_principal}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-slate-600">
                          {vendusPartenaire} vente{vendusPartenaire > 1 ? 's' : ''}
                        </p>
                        <p className="text-sm text-green-600 font-semibold">
                          {formatCurrency(caPartenaire)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
