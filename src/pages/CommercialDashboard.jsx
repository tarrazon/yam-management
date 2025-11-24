import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Handshake, Users, Target, TrendingUp, Euro, Building2, FileText, ChevronDown, ChevronUp } from "lucide-react";
import { supabase } from "@/lib/supabase";
import StatsCard from "../components/dashboard/StatsCardCRM";
import ActivityTimeline from "../components/dashboard/ActivityTimeline";
import { formatCurrency } from "@/utils/formHelpers";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

export default function CommercialDashboard() {
  const { profile } = useAuth();
  const [expandedLots, setExpandedLots] = useState({});

  const { data: partenairesCommercial = [], isLoading: isLoadingPartenaires } = useQuery({
    queryKey: ['partenaires_commercial', profile?.id, profile?.email],
    queryFn: async () => {
      if (!profile?.id) return [];
      // Cherche par ID (nouveau format) ou email (ancien format pour compatibilité)
      const { data, error } = await supabase
        .from('partenaires')
        .select('*')
        .or(`created_by.eq.${profile.id},created_by.eq.${profile.email}`)
        .order('nom', { ascending: true });
      if (error) {
        console.error('Error fetching partenaires:', error);
        throw error;
      }
      console.log('Partenaires récupérés pour', profile.email, ':', data?.length || 0);
      return data || [];
    },
    enabled: !!profile?.id,
  });

  const { data: lots = [], isLoading: isLoadingLots } = useQuery({
    queryKey: ['lots_lmnp'],
    queryFn: () => base44.entities.LotLMNP.list(),
  });

  const { data: acquereurs = [], isLoading: isLoadingAcquereurs } = useQuery({
    queryKey: ['acquereurs'],
    queryFn: () => base44.entities.Acquereur.list(),
  });

  const isLoading = isLoadingPartenaires || isLoadingLots || isLoadingAcquereurs;

  const partenaireIds = partenairesCommercial.map(p => p.id);

  const lotsPartenaires = lots.filter(lot =>
    lot.partenaire_id && partenaireIds.includes(lot.partenaire_id)
  );

  const lotsDisponibles = lotsPartenaires.filter(lot => lot.statut === 'disponible');
  const lotsVendus = lotsPartenaires.filter(lot => lot.statut === 'vendu');
  const lotsEnCours = lotsPartenaires.filter(lot =>
    ['sous_option', 'reserve', 'compromis', 'acte_programme'].includes(lot.statut)
  );

  const caRealise = lotsVendus.reduce((sum, lot) => sum + (parseFloat(lot.prix_fai) || 0), 0);
  const caPotentiel = lotsEnCours.reduce((sum, lot) => sum + (parseFloat(lot.prix_fai) || 0), 0);

  const tauxConversion = lotsPartenaires.length > 0
    ? ((lotsVendus.length / lotsPartenaires.length) * 100).toFixed(1)
    : "0.0";

  const acquereursPartenaires = acquereurs.filter(acq =>
    acq.partenaire_id && partenaireIds.includes(acq.partenaire_id)
  );

  // Debug logs
  console.log('CommercialDashboard Debug:', {
    profileId: profile?.id,
    partenairesCount: partenairesCommercial.length,
    partenaireIds,
    lotsTotal: lots.length,
    lotsPartenaires: lotsPartenaires.length,
    lotsVendus: lotsVendus.length,
    lotsEnCours: lotsEnCours.length,
    caRealise,
    acquereursTotal: acquereurs.length,
    acquereursPartenaires: acquereursPartenaires.length,
  });

  if (isLoading) {
    return (
      <div className="p-6 md:p-8 bg-[#F9FAFB] min-h-screen">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-[#1E40AF] mb-2">Mon Activité Commerciale</h1>
            <p className="text-slate-500">Chargement des données...</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white p-6 rounded-lg shadow-md animate-pulse">
                <div className="h-4 bg-slate-200 rounded w-1/2 mb-4"></div>
                <div className="h-8 bg-slate-200 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

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
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
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
                      .reduce((sum, l) => sum + (parseFloat(l.prix) || 0), 0);

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

          <Card className="border-none shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[#1E40AF]">
                <FileText className="w-5 h-5" />
                Suivi des dossiers
              </CardTitle>
            </CardHeader>
            <CardContent>
              {lotsPartenaires.filter(l => ['sous_option', 'reserve', 'compromis', 'acte_programme', 'vendu'].includes(l.statut)).length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  <FileText className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                  <p>Aucun dossier en cours</p>
                  <p className="text-sm mt-1">Les dossiers de vos partenaires apparaîtront ici</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[400px] overflow-y-auto">
                  {lotsPartenaires
                    .filter(l => ['sous_option', 'reserve', 'compromis', 'acte_programme', 'vendu'].includes(l.statut))
                    .sort((a, b) => {
                      const order = { 'sous_option': 1, 'reserve': 2, 'compromis': 3, 'acte_programme': 4, 'vendu': 5 };
                      return order[a.statut] - order[b.statut];
                    })
                    .map((lot) => {
                      const partenaire = partenairesCommercial.find(p => p.id === lot.partenaire_id);
                      const isExpanded = expandedLots[lot.id];

                      return (
                        <div
                          key={lot.id}
                          className="border border-slate-200 rounded-lg overflow-hidden"
                        >
                          <div
                            className="flex items-center justify-between p-3 bg-slate-50 hover:bg-slate-100 cursor-pointer transition-colors"
                            onClick={() => setExpandedLots(prev => ({ ...prev, [lot.id]: !prev[lot.id] }))}
                          >
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <p className="font-semibold text-slate-800 text-sm">
                                  {lot.residence_nom} - {lot.numero}
                                </p>
                                <Badge variant={
                                  lot.statut === 'sous_option' ? 'default' :
                                  lot.statut === 'reserve' ? 'secondary' :
                                  lot.statut === 'compromis' ? 'secondary' :
                                  lot.statut === 'acte_programme' ? 'outline' :
                                  'success'
                                } className="text-xs">
                                  {lot.statut}
                                </Badge>
                              </div>
                              <p className="text-xs text-slate-500">{partenaire?.nom || 'Partenaire inconnu'}</p>
                            </div>
                            {isExpanded ? (
                              <ChevronUp className="w-4 h-4 text-slate-400" />
                            ) : (
                              <ChevronDown className="w-4 h-4 text-slate-400" />
                            )}
                          </div>

                          {isExpanded && (
                            <div className="p-3 bg-white border-t border-slate-200 space-y-2">
                              {lot.acquereur_nom && (
                                <div className="flex justify-between text-xs">
                                  <span className="text-slate-600">Acquéreur:</span>
                                  <span className="font-medium text-slate-800">{lot.acquereur_nom}</span>
                                </div>
                              )}
                              {lot.prix && (
                                <div className="flex justify-between text-xs">
                                  <span className="text-slate-600">Prix:</span>
                                  <span className="font-medium text-green-600">{formatCurrency(lot.prix)}</span>
                                </div>
                              )}
                              {lot.phase_post_vente && (
                                <div className="flex justify-between text-xs">
                                  <span className="text-slate-600">Phase:</span>
                                  <span className="font-medium text-slate-800">{lot.phase_post_vente}</span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
