import React, { useState, useMemo, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, Euro, Users, Building2, Calendar, Download, Home, Target, Award, Percent, Eye } from "lucide-react";
import { viewsTracking } from "@/api/viewsTracking";

const COLORS = ['#1E40AF', '#F59E0B', '#10B981', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6', '#F97316'];

export default function Statistiques() {
  const [dateDebut, setDateDebut] = useState("");
  const [dateFin, setDateFin] = useState("");
  const [partenaireFilter, setPartenaireFilter] = useState("all");
  const [residenceFilter, setResidenceFilter] = useState("all");

  const { data: lots = [] } = useQuery({
    queryKey: ['lots_lmnp'],
    queryFn: () => base44.entities.LotLMNP.list(),
  });

  const { data: partenaires = [] } = useQuery({
    queryKey: ['partenaires'],
    queryFn: () => base44.entities.Partenaire.list(),
  });

  const { data: residences = [] } = useQuery({
    queryKey: ['residences_gestion'],
    queryFn: () => base44.entities.ResidenceGestion.list(),
  });

  const { data: acquereurs = [] } = useQuery({
    queryKey: ['acquereurs'],
    queryFn: () => base44.entities.Acquereur.list(),
  });

  // Charger les stats de vues
  const [topViewedLots, setTopViewedLots] = useState([]);
  const [topViewedResidences, setTopViewedResidences] = useState([]);

  useEffect(() => {
    const loadViewsStats = async () => {
      const lots = await viewsTracking.getTopViewedLots(10);
      const residences = await viewsTracking.getTopViewedResidences(10);
      setTopViewedLots(lots);
      setTopViewedResidences(residences);
    };
    loadViewsStats();
  }, []);

  // Filtrer les lots
  const filteredLots = useMemo(() => {
    return lots.filter(lot => {
      if (partenaireFilter !== "all" && lot.partenaire_id !== partenaireFilter) return false;
      if (residenceFilter !== "all" && lot.residence_id !== residenceFilter) return false;
      
      if (dateDebut || dateFin) {
        const dateLot = lot.date_signature_acte || lot.date_signature_compromis || lot.updated_at;
        if (!dateLot) return false;
        const date = new Date(dateLot);
        if (dateDebut && date < new Date(dateDebut)) return false;
        if (dateFin && date > new Date(dateFin)) return false;
      }
      return true;
    });
  }, [lots, partenaireFilter, residenceFilter, dateDebut, dateFin]);

  // Calculs statistiques enrichis
  const stats = useMemo(() => {
    const lotsVendus = filteredLots.filter(l => l.statut === 'vendu');
    const lotsDisponibles = filteredLots.filter(l => l.statut === 'disponible').length;
    const lotsSousOption = filteredLots.filter(l => l.statut === 'sous_option').length;
    const lotsReserves = filteredLots.filter(l => ['reserve', 'compromis'].includes(l.statut)).length;
    
    const caTotal = lotsVendus.reduce((sum, lot) => sum + (lot.prix_fai || 0), 0);
    
    // Calcul des commissions partenaires avec fallback sur taux de rétrocession
    const commissionsPartenaires = lotsVendus.reduce((sum, lot) => {
      if (lot.commission_partenaire) {
        return sum + lot.commission_partenaire;
      }
      // Fallback: calculer avec le taux de rétrocession du partenaire
      if (lot.partenaire_id && lot.honoraires) {
        const partenaire = partenaires.find(p => p.id === lot.partenaire_id);
        const tauxRetrocession = partenaire?.taux_retrocession || 0;
        return sum + (lot.honoraires * tauxRetrocession / 100);
      }
      return sum;
    }, 0);
    
    const honorairesTotal = lotsVendus.reduce((sum, lot) => sum + (lot.honoraires || 0) + (lot.honoraires_acquereur_ht || 0), 0);

    // Nouvelles stats
    const prixMoyenVente = lotsVendus.length > 0 ? Math.round(caTotal / lotsVendus.length) : 0;
    
    const rentabiliteMoyenne = lotsVendus.filter(l => l.rentabilite).length > 0
      ? (lotsVendus.reduce((sum, lot) => sum + (lot.rentabilite || 0), 0) / lotsVendus.filter(l => l.rentabilite).length).toFixed(1)
      : 0;
    
    const margeBrute = honorairesTotal - commissionsPartenaires;
    const tauxMarge = honorairesTotal > 0 ? ((margeBrute / honorairesTotal) * 100).toFixed(1) : 0;
    
    const caPotentiel = filteredLots
      .filter(l => ['sous_option', 'reserve', 'compromis'].includes(l.statut))
      .reduce((sum, lot) => sum + (lot.prix_fai || 0), 0);
    
    // Acquéreurs actifs
    const acquereurActifs = acquereurs.filter(a => 
      a.statut_commercial === 'acheteur' || 
      lotsVendus.some(l => l.acquereur_id === a.id)
    ).length;
    
    // Partenaires contributeurs
    const partenairesContributeurs = new Set(
      lotsVendus.filter(l => l.partenaire_id).map(l => l.partenaire_id)
    ).size;

    return {
      caTotal,
      commissionsPartenaires,
      honorairesTotal,
      nombreVentes: lotsVendus.length,
      nombreLotsTotal: filteredLots.length,
      tauxConversion: filteredLots.length > 0 ? ((lotsVendus.length / filteredLots.length) * 100).toFixed(1) : 0,
      prixMoyenVente,
      rentabiliteMoyenne,
      margeBrute,
      tauxMarge,
      caPotentiel,
      lotsDisponibles,
      lotsSousOption,
      lotsReserves,
      acquereurActifs,
      partenairesContributeurs,
    };
  }, [filteredLots, partenaires, acquereurs]);

  // CA par partenaire
  const caParPartenaire = useMemo(() => {
    const data = {};
    filteredLots.filter(l => l.statut === 'vendu').forEach(lot => {
      if (lot.partenaire_id) {
        const partenaire = partenaires.find(p => p.id === lot.partenaire_id);
        const nom = partenaire?.nom || 'Inconnu';
        if (!data[nom]) {
          data[nom] = {
            nom,
            ca: 0,
            commissions: 0,
            ventes: 0,
          };
        }
        data[nom].ca += lot.prix_fai || 0;
        
        // Calcul commission avec fallback
        const commission = lot.commission_partenaire || 
          (lot.honoraires && partenaire?.taux_retrocession ? (lot.honoraires * partenaire.taux_retrocession / 100) : 0);
        data[nom].commissions += commission;
        
        data[nom].ventes += 1;
      }
    });
    return Object.values(data).sort((a, b) => b.ca - a.ca);
  }, [filteredLots, partenaires]);

  // CA par résidence
  const caParResidence = useMemo(() => {
    const data = {};
    filteredLots.filter(l => l.statut === 'vendu').forEach(lot => {
      const nom = lot.residence_nom || 'Inconnu';
      if (!data[nom]) {
        data[nom] = { nom, ca: 0, ventes: 0 };
      }
      data[nom].ca += lot.prix_fai || 0;
      data[nom].ventes += 1;
    });
    return Object.values(data).sort((a, b) => b.ca - a.ca);
  }, [filteredLots]);

  // Evolution des ventes par mois
  const ventesParMois = useMemo(() => {
    const data = {};
    filteredLots.filter(l => l.statut === 'vendu').forEach(lot => {
      const date = lot.date_signature_acte || lot.date_signature_compromis || lot.updated_at;
      if (date) {
        const mois = new Date(date).toLocaleDateString('fr-FR', { year: 'numeric', month: 'short' });
        if (!data[mois]) {
          data[mois] = { mois, ventes: 0, ca: 0 };
        }
        data[mois].ventes += 1;
        data[mois].ca += lot.prix_fai || 0;
      }
    });
    return Object.values(data).sort((a, b) => {
      const dateA = new Date(a.mois);
      const dateB = new Date(b.mois);
      return dateA - dateB;
    });
  }, [filteredLots]);

  // Répartition par statut
  const repartitionStatuts = useMemo(() => {
    const statuts = ['disponible', 'sous_option', 'reserve', 'compromis', 'vendu'];
    return statuts.map(statut => ({
      name: statut === 'disponible' ? 'Disponible' :
            statut === 'sous_option' ? 'Sous option' :
            statut === 'reserve' ? 'Réservé' :
            statut === 'compromis' ? 'Compromis' : 'Vendu',
      value: filteredLots.filter(l => l.statut === statut).length,
    })).filter(s => s.value > 0);
  }, [filteredLots]);

  const exportStats = () => {
    const data = [
      ["STATISTIQUES GLOBALES", ""],
      ["CA Total", stats.caTotal],
      ["Commissions Partenaires", stats.commissionsPartenaires],
      ["Honoraires Total", stats.honorairesTotal],
      ["Nombre de ventes", stats.nombreVentes],
      ["Taux de conversion", `${stats.tauxConversion}%`],
      [""],
      ["CA PAR PARTENAIRE", ""],
      ["Partenaire", "CA", "Commissions", "Ventes"],
      ...caParPartenaire.map(p => [p.nom, p.ca, p.commissions, p.ventes]),
      [""],
      ["CA PAR RÉSIDENCE", ""],
      ["Résidence", "CA", "Ventes"],
      ...caParResidence.map(r => [r.nom, r.ca, r.ventes]),
    ];

    const csvContent = data.map(row => row.join(';')).join('\n');
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `statistiques_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-6 md:p-8 bg-[#F9FAFB] min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-[#1E40AF] tracking-tight">Statistiques</h1>
            <p className="text-slate-500 mt-1">Analyse des performances et du chiffre d'affaires</p>
          </div>
          <Button onClick={exportStats} className="bg-[#1E40AF] hover:bg-[#1E3A8A]">
            <Download className="w-4 h-4 mr-2" />
            Export Excel
          </Button>
        </div>

        {/* Filtres */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Calendar className="w-5 h-5 text-[#F59E0B]" />
              Filtres
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label>Date de début</Label>
                <Input
                  type="date"
                  value={dateDebut}
                  onChange={(e) => setDateDebut(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Date de fin</Label>
                <Input
                  type="date"
                  value={dateFin}
                  onChange={(e) => setDateFin(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Partenaire</Label>
                <Select value={partenaireFilter} onValueChange={setPartenaireFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les partenaires</SelectItem>
                    {partenaires.map(p => (
                      <SelectItem key={p.id} value={p.id}>{p.nom}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Résidence</Label>
                <Select value={residenceFilter} onValueChange={setResidenceFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes les résidences</SelectItem>
                    {residences.map(r => (
                      <SelectItem key={r.id} value={r.id}>{r.nom}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            {(dateDebut || dateFin || partenaireFilter !== "all" || residenceFilter !== "all") && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setDateDebut("");
                  setDateFin("");
                  setPartenaireFilter("all");
                  setResidenceFilter("all");
                }}
                className="mt-4"
              >
                Réinitialiser les filtres
              </Button>
            )}
          </CardContent>
        </Card>

        {/* KPIs Ligne 1 - Financiers */}
        <div className="grid md:grid-cols-4 gap-6 mb-6">
          <Card className="border-none shadow-lg bg-gradient-to-br from-green-50 to-emerald-50">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-white/80 shadow-sm">
                  <Euro className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-green-700 font-medium">CA Total</p>
                  <p className="text-2xl font-bold text-green-800">
                    {stats.caTotal.toLocaleString('fr-FR')} €
                  </p>
                  <p className="text-xs text-green-600 mt-1">{stats.nombreVentes} ventes</p>
                </div>
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
                  <p className="text-sm text-amber-700 font-medium">Commissions</p>
                  <p className="text-2xl font-bold text-amber-800">
                    {stats.commissionsPartenaires.toLocaleString('fr-FR', {minimumFractionDigits: 2, maximumFractionDigits: 2})} €
                  </p>
                  <p className="text-xs text-amber-600 mt-1">Partenaires</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg bg-gradient-to-br from-blue-50 to-indigo-50">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-white/80 shadow-sm">
                  <Euro className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-blue-700 font-medium">Honoraires</p>
                  <p className="text-2xl font-bold text-blue-800">
                    {stats.honorairesTotal.toLocaleString('fr-FR')} €
                  </p>
                  <p className="text-xs text-blue-600 mt-1">Total perçus</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg bg-gradient-to-br from-rose-50 to-pink-50">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-white/80 shadow-sm">
                  <Award className="w-6 h-6 text-rose-600" />
                </div>
                <div>
                  <p className="text-sm text-rose-700 font-medium">Marge Brute</p>
                  <p className="text-2xl font-bold text-rose-800">
                    {stats.margeBrute.toLocaleString('fr-FR')} €
                  </p>
                  <p className="text-xs text-rose-600 mt-1">Taux: {stats.tauxMarge}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* KPIs Ligne 2 - Stock et performances */}
        <div className="grid md:grid-cols-4 gap-6 mb-6">
          <Card className="border-none shadow-lg bg-gradient-to-br from-violet-50 to-purple-50">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-white/80 shadow-sm">
                  <Home className="w-6 h-6 text-violet-600" />
                </div>
                <div>
                  <p className="text-sm text-violet-700 font-medium">Stock</p>
                  <p className="text-2xl font-bold text-violet-800">{stats.nombreLotsTotal}</p>
                  <div className="flex gap-1 mt-1 text-xs">
                    <span className="text-green-600">{stats.lotsDisponibles} dispo</span>
                    <span className="text-slate-400">•</span>
                    <span className="text-yellow-600">{stats.lotsReserves} réservés</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg bg-gradient-to-br from-cyan-50 to-teal-50">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-white/80 shadow-sm">
                  <Target className="w-6 h-6 text-cyan-600" />
                </div>
                <div>
                  <p className="text-sm text-cyan-700 font-medium">Taux conversion</p>
                  <p className="text-2xl font-bold text-cyan-800">{stats.tauxConversion}%</p>
                  <p className="text-xs text-cyan-600 mt-1">{stats.nombreVentes} / {stats.nombreLotsTotal} lots</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg bg-gradient-to-br from-indigo-50 to-blue-50">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-white/80 shadow-sm">
                  <Euro className="w-6 h-6 text-indigo-600" />
                </div>
                <div>
                  <p className="text-sm text-indigo-700 font-medium">Prix moyen</p>
                  <p className="text-2xl font-bold text-indigo-800">
                    {stats.prixMoyenVente.toLocaleString('fr-FR')} €
                  </p>
                  <p className="text-xs text-indigo-600 mt-1">Par vente</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg bg-gradient-to-br from-teal-50 to-emerald-50">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-white/80 shadow-sm">
                  <Percent className="w-6 h-6 text-teal-600" />
                </div>
                <div>
                  <p className="text-sm text-teal-700 font-medium">Rentabilité moy.</p>
                  <p className="text-2xl font-bold text-teal-800">{stats.rentabiliteMoyenne}%</p>
                  <p className="text-xs text-teal-600 mt-1">Lots vendus</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* KPIs Ligne 3 - Pipeline et acteurs */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="border-none shadow-lg bg-gradient-to-br from-orange-50 to-amber-50">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-white/80 shadow-sm">
                  <TrendingUp className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-orange-700 font-medium">CA Potentiel</p>
                  <p className="text-2xl font-bold text-orange-800">
                    {stats.caPotentiel >= 1000000 
                      ? `${(stats.caPotentiel / 1000000).toFixed(1)}M€`
                      : `${Math.round(stats.caPotentiel / 1000)}k€`}
                  </p>
                  <p className="text-xs text-orange-600 mt-1">{stats.lotsSousOption + stats.lotsReserves} lots en cours</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg bg-gradient-to-br from-purple-50 to-fuchsia-50">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-white/80 shadow-sm">
                  <Users className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-purple-700 font-medium">Acquéreurs actifs</p>
                  <p className="text-2xl font-bold text-purple-800">{stats.acquereurActifs}</p>
                  <p className="text-xs text-purple-600 mt-1">Acheteurs confirmés</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg bg-gradient-to-br from-emerald-50 to-green-50">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-white/80 shadow-sm">
                  <Users className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm text-emerald-700 font-medium">Partenaires actifs</p>
                  <p className="text-2xl font-bold text-emerald-800">{stats.partenairesContributeurs}</p>
                  <p className="text-xs text-emerald-600 mt-1">Ont généré des ventes</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg bg-gradient-to-br from-slate-50 to-gray-100">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-white/80 shadow-sm">
                  <Building2 className="w-6 h-6 text-slate-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-700 font-medium">Résidences</p>
                  <p className="text-2xl font-bold text-slate-800">{residences.length}</p>
                  <p className="text-xs text-slate-600 mt-1">En portefeuille</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Graphiques */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* CA par partenaire */}
          <Card>
            <CardHeader>
              <CardTitle>CA par Partenaire</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={caParPartenaire.slice(0, 10)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="nom" angle={-45} textAnchor="end" height={100} />
                  <YAxis />
                  <Tooltip formatter={(value) => `${value.toLocaleString('fr-FR')} €`} />
                  <Legend />
                  <Bar dataKey="ca" fill="#1E40AF" name="CA" />
                  <Bar dataKey="commissions" fill="#F59E0B" name="Commissions" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Répartition par statut */}
          <Card>
            <CardHeader>
              <CardTitle>Répartition par Statut</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={repartitionStatuts}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {repartitionStatuts.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Evolution des ventes */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Évolution des Ventes</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={ventesParMois}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mois" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="ventes" stroke="#1E40AF" name="Nombre de ventes" />
                <Line yAxisId="right" type="monotone" dataKey="ca" stroke="#F59E0B" name="CA (€)" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* CA par résidence */}
        <Card>
          <CardHeader>
            <CardTitle>CA par Résidence</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={caParResidence} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="nom" type="category" width={150} />
                <Tooltip formatter={(value) => `${value.toLocaleString('fr-FR')} €`} />
                <Legend />
                <Bar dataKey="ca" fill="#10B981" name="CA" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Statistiques de vues */}
        <div className="grid md:grid-cols-2 gap-6 mt-6">
          {/* Lots les plus vus */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="w-5 h-5 text-blue-600" />
                Lots les Plus Vus
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {topViewedLots.length > 0 ? (
                  topViewedLots.map((lot, index) => (
                    <div key={lot.entity_id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-bold text-sm">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-700">{lot.entity_name}</p>
                          <p className="text-xs text-slate-500">{lot.unique} partenaire{lot.unique > 1 ? 's' : ''}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-blue-600">{lot.total}</p>
                        <p className="text-xs text-slate-500">vues</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-500 text-center py-4">Aucune vue enregistrée</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Résidences les plus vues */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="w-5 h-5 text-green-600" />
                Résidences les Plus Vues
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {topViewedResidences.length > 0 ? (
                  topViewedResidences.map((residence, index) => (
                    <div key={residence.entity_id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-100 text-green-600 font-bold text-sm">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-700">{residence.entity_name}</p>
                          <p className="text-xs text-slate-500">{residence.unique} partenaire{residence.unique > 1 ? 's' : ''}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-600">{residence.total}</p>
                        <p className="text-xs text-slate-500">vues</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-500 text-center py-4">Aucune vue enregistrée</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}