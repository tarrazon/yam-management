import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Home, Users, Handshake, Building2, TrendingUp, Euro, FileCheck, Target, MessageSquare, FileWarning } from "lucide-react";
import { supabase } from "@/lib/supabase";
import StatsCard from "../components/dashboard/StatsCardCRM";
import ActivityTimeline from "../components/dashboard/ActivityTimeline";
import PartnersPerformance from "../components/dashboard/PartnersPerformance";
import SalesChartCRM from "../components/dashboard/SalesChartCRM";
import TopResidences from "../components/dashboard/TopResidences";
import { formatCurrency, calculateRetrocession } from "@/utils/formHelpers";

export default function DashboardCRM() {
  const { data: lots = [] } = useQuery({
    queryKey: ['lots_lmnp'],
    queryFn: () => base44.entities.LotLMNP.list(),
  });

  const { data: vendeurs = [] } = useQuery({
    queryKey: ['vendeurs'],
    queryFn: () => base44.entities.Vendeur.list(),
  });

  const { data: acquereurs = [] } = useQuery({
    queryKey: ['acquereurs'],
    queryFn: () => base44.entities.Acquereur.list(),
  });

  const { data: partenaires = [] } = useQuery({
    queryKey: ['partenaires'],
    queryFn: () => base44.entities.Partenaire.list(),
  });

  const { data: residences = [] } = useQuery({
    queryKey: ['residences_gestion'],
    queryFn: () => base44.entities.ResidenceGestion.list(),
  });

  // Messages non lus des acquéreurs
  const { data: messagesNonLus = 0 } = useQuery({
    queryKey: ['messages_non_lus'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('messages_admin')
        .select('*', { count: 'exact', head: true })
        .eq('expediteur_type', 'acquereur')
        .eq('lu', false);
      if (error) {
        console.error('Erreur récupération messages non lus:', error);
        return 0;
      }
      return count || 0;
    },
  });

  // Calcul des documents manquants
  const documentsManquantsTotal = React.useMemo(() => {
    let total = 0;

    // Documents manquants pour les acquéreurs
    acquereurs.forEach(acquereur => {
      const docs = acquereur.documents || {};
      if (!docs.cni && !docs.passeport) total++;
      if (!docs.justificatif_domicile) total++;
      if (!docs.lettre_intention_achat) total++;
      if (!docs.mandat_gestion) total++;
      if (!docs.mandat_acquereur_honoraires) total++;
    });

    // Documents manquants pour les vendeurs
    vendeurs.forEach(vendeur => {
      if (vendeur.type_vendeur === 'entreprise') {
        const docsEntreprise = vendeur.documents_entreprise || {};
        if (!docsEntreprise.kbis) total++;
        if (!docsEntreprise.statuts) total++;
        if (!docsEntreprise.pv_ag) total++;
        if (!docsEntreprise.rib) total++;
        if (!docsEntreprise.titre_propriete) total++;
        if (!docsEntreprise.diagnostic) total++;
        if (!docsEntreprise.certificat_mesurage) total++;
        if (!docsEntreprise.bail_commercial) total++;
        if (!docsEntreprise.convention_signee) total++;
      } else if (vendeur.type_vendeur === 'particulier') {
        const docsParticulier = vendeur.documents_particulier || {};
        if (!docsParticulier.cni) total++;
        if (!docsParticulier.questionnaire_etat_civil) total++;
        if (!docsParticulier.rib) total++;
        if (!docsParticulier.titre_propriete) total++;
        if (!docsParticulier.diagnostic) total++;
        if (!docsParticulier.certificat_mesurage) total++;
        if (!docsParticulier.bail_commercial) total++;
        if (!docsParticulier.convention_signee) total++;
      }
    });

    return total;
  }, [acquereurs, vendeurs]);

  // Statistiques basées sur les LOTS (source de vérité)
  const lotsDisponibles = lots.filter(l => l.statut === 'disponible').length;
  const lotsReserves = lots.filter(l => ['reserve', 'compromis'].includes(l.statut)).length;
  const lotsVendus = lots.filter(l => l.statut === 'vendu').length;
  const lotsSousOption = lots.filter(l => l.statut === 'sous_option').length;
  
  // CA réalisé = somme des prix_fai des lots VENDUS
  const caRealise = lots
    .filter(l => l.statut === 'vendu')
    .reduce((sum, lot) => sum + (lot.prix_fai || 0), 0);
    
  // CA potentiel = somme des prix_fai des lots en cours (réservés, compromis, sous option)
  const caPotentiel = lots
    .filter(l => ['reserve', 'compromis', 'sous_option'].includes(l.statut))
    .reduce((sum, lot) => sum + (lot.prix_fai || 0), 0);

  const honorairesPercus = lots
    .filter(l => l.statut === 'vendu')
    .reduce((sum, lot) => sum + (Number(lot.honoraires) || 0), 0);

  const honorairesAPercevoir = lots
    .filter(l => ['reserve', 'compromis'].includes(l.statut))
    .reduce((sum, lot) => sum + (Number(lot.honoraires) || 0), 0);

  const retrocessionActee = lots
    .filter(l => l.statut === 'vendu' && l.partenaire_id)
    .reduce((sum, lot) => {
      const partenaire = partenaires.find(p => p.id === lot.partenaire_id);
      const tauxRetro = Number(partenaire?.taux_retrocession) || 0;
      return sum + calculateRetrocession(lot, tauxRetro);
    }, 0);

  const retrocessionAVenir = lots
    .filter(l => ['reserve', 'compromis'].includes(l.statut) && l.partenaire_id)
    .reduce((sum, lot) => {
      const partenaire = partenaires.find(p => p.id === lot.partenaire_id);
      const tauxRetro = Number(partenaire?.taux_retrocession) || 0;
      return sum + calculateRetrocession(lot, tauxRetro);
    }, 0);

  // Taux de conversion = lots vendus / total lots
  const tauxConversion = lots.length > 0 
    ? ((lotsVendus / lots.length) * 100).toFixed(1)
    : 0;

  const partenairesActifs = partenaires.filter(p => p.statut === 'actif').length;

  return (
    <div className="p-6 md:p-8 bg-[#F9FAFB] min-h-screen">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl md:text-4xl font-bold text-[#1E40AF] tracking-tight">
            Tableau de bord CRM
          </h1>
          <p className="text-slate-500 text-lg">Vue d'ensemble de votre activité commerciale</p>
        </div>

        {/* KPIs principaux */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Lots disponibles"
            value={lotsDisponibles}
            icon={Home}
            color="blue"
            subtitle={`${lotsSousOption} sous option · ${lotsReserves} réservés`}
          />
          <StatsCard
            title="CA réalisé"
            value={caRealise >= 1000000 ? `${Math.round(caRealise / 1000000)}M€` : `${Math.round(caRealise / 1000)}k€`}
            icon={Euro}
            color="green"
            subtitle={`${lotsVendus} lots vendus`}
          />
          <StatsCard
            title="CA potentiel"
            value={caPotentiel >= 1000000 ? `${Math.round(caPotentiel / 1000000)}M€` : `${Math.round(caPotentiel / 1000)}k€`}
            icon={TrendingUp}
            color="amber"
            subtitle={`${lotsReserves + lotsSousOption} lots en cours`}
          />
          <StatsCard
            title="Taux conversion"
            value={`${tauxConversion}%`}
            icon={Target}
            color="purple"
            subtitle={`${lotsVendus} vendus / ${lots.length} lots`}
          />
        </div>

        {/* Alertes et suivi */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="border-none shadow-lg bg-gradient-to-br from-blue-50 to-cyan-50 hover:shadow-xl transition-shadow cursor-pointer" onClick={() => window.location.href = '/Acquereurs'}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-white/80 shadow-sm">
                    <MessageSquare className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-blue-700 font-medium">Messages non lus</p>
                    <p className="text-3xl font-bold text-blue-800 mt-1">{messagesNonLus}</p>
                    <p className="text-xs text-blue-600 mt-1">Messages des acquéreurs</p>
                  </div>
                </div>
                {messagesNonLus > 0 && (
                  <div className="animate-pulse">
                    <span className="flex h-3 w-3 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg bg-gradient-to-br from-orange-50 to-red-50 hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-white/80 shadow-sm">
                  <FileWarning className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-orange-700 font-medium">Documents manquants</p>
                  <p className="text-3xl font-bold text-orange-800 mt-1">{documentsManquantsTotal}</p>
                  <p className="text-xs text-orange-600 mt-1">Acquéreurs et vendeurs</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* KPIs financiers détaillés */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-none shadow-lg bg-gradient-to-br from-green-50 to-emerald-50">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-white/80 shadow-sm">
                  <Euro className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-green-700 font-medium">CA Total</p>
                  <p className="text-2xl font-bold text-green-800">
                    {formatCurrency(caRealise)} €
                  </p>
                  <p className="text-xs text-green-600 mt-1">{lotsVendus} ventes réalisées</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg bg-gradient-to-br from-blue-50 to-blue-100">
            <CardContent className="p-6">
              <div>
                <p className="text-sm text-blue-700 font-medium mb-2">Honoraires perçus</p>
                <p className="text-2xl font-bold text-blue-800">
                  {formatCurrency(honorairesPercus)} €
                </p>
                <p className="text-xs text-blue-600 mt-1">Lots vendus</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg bg-gradient-to-br from-blue-50 to-indigo-100">
            <CardContent className="p-6">
              <div>
                <p className="text-sm text-blue-700 font-medium mb-2">Honoraires à percevoir</p>
                <p className="text-2xl font-bold text-blue-800">
                  {formatCurrency(honorairesAPercevoir)} €
                </p>
                <p className="text-xs text-blue-600 mt-1">Réservé + Compromis</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg bg-gradient-to-br from-amber-50 to-orange-50">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-white/80 shadow-sm">
                  <TrendingUp className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm text-amber-700 font-medium">Rétrocessions actées</p>
                  <p className="text-2xl font-bold text-amber-800">
                    {formatCurrency(retrocessionActee)} €
                  </p>
                  <p className="text-xs text-amber-600 mt-1">Partenaires - Vendus</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Statistiques secondaires */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-none shadow-md bg-white">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-blue-50">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">Vendeurs</p>
                  <p className="text-2xl font-bold text-[#1E40AF]">{vendeurs.length}</p>
                  <p className="text-xs text-slate-400">{vendeurs.filter(v => v.statut_commercial === 'mandate').length} mandatés</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-md bg-white">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-purple-50">
                  <Users className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">Acquéreurs</p>
                  <p className="text-2xl font-bold text-[#1E40AF]">{acquereurs.length}</p>
                  <p className="text-xs text-slate-400">{acquereurs.filter(a => a.statut_commercial === 'qualifie').length} qualifiés</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-md bg-white">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-green-50">
                  <Handshake className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">Partenaires</p>
                  <p className="text-2xl font-bold text-[#1E40AF]">{partenairesActifs}</p>
                  <p className="text-xs text-slate-400">{partenaires.length} au total</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-md bg-white">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-amber-50">
                  <Building2 className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">Résidences</p>
                  <p className="text-2xl font-bold text-[#1E40AF]">{residences.length}</p>
                  <p className="text-xs text-slate-400">{residences.filter(r => r.statut === 'active').length} actives</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Graphiques et activités */}
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <SalesChartCRM lots={lots} />
            <TopResidences residences={residences} lots={lots} />
          </div>
          <div className="space-y-6">
            <ActivityTimeline lots={lots} />
            <PartnersPerformance partenaires={partenaires} lots={lots} />
          </div>
        </div>
      </div>
    </div>
  );
}