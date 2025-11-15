import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Search, Grid3x3, List } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion, AnimatePresence } from "framer-motion";
import SuiviDossierCard from "../components/suivi-dossier/SuiviDossierCard";
import SuiviDossierListItem from "../components/suivi-dossier/SuiviDossierListItem";
import AcquereurDetailPartenaire from "../components/acquereurs/AcquereurDetailPartenaire";

export default function SuiviDossierPartenaire() {
  const [currentUser, setCurrentUser] = useState(null);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [dateDebut, setDateDebut] = useState("");
  const [dateFin, setDateFin] = useState("");
  const [viewMode, setViewMode] = useState("grid");
  const [viewingLot, setViewingLot] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setCurrentUser);
  }, []);

  const { data: lots = [], isLoading } = useQuery({
    queryKey: ['lots_lmnp_partenaire', currentUser?.partenaire_id],
    queryFn: () => base44.entities.LotLMNP.list('-updated_at'),
    enabled: !!currentUser?.partenaire_id,
  });

  const { data: acquereurs = [] } = useQuery({
    queryKey: ['mes_acquereurs_full'],
    queryFn: () => base44.entities.Acquereur.filter({ partenaire_id: currentUser?.partenaire_id }),
    enabled: !!currentUser?.partenaire_id,
  });

  const { data: partenaireData } = useQuery({
    queryKey: ['partenaire_info', currentUser?.partenaire_id],
    queryFn: () => base44.entities.Partenaire.get(currentUser?.partenaire_id),
    enabled: !!currentUser?.partenaire_id,
    staleTime: 0,
    cacheTime: 0,
  });

  const lotsPartenaire = lots.filter(lot => {
    const acquereur = acquereurs.find(a => a.id === lot.acquereur_id);
    return acquereur && lot.statut !== 'disponible' && lot.statut !== 'allotement';
  });

  const filteredLots = lotsPartenaire
    .filter(l => filter === "all" || l.statut === filter)
    .filter(l =>
      !searchTerm ||
      l.reference?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.residence_nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.acquereur_nom?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter(l => {
      if (!dateDebut && !dateFin) return true;
      const dateLot = l.date_prise_option || l.date_premier_contact || l.date_signature_compromis || l.updated_at;
      if (!dateLot) return false;

      const date = new Date(dateLot);
      if (dateDebut && date < new Date(dateDebut)) return false;
      if (dateFin && date > new Date(dateFin)) return false;
      return true;
    });

  const tauxRetrocession = Number(partenaireData?.taux_retrocession) || 0;

  const calculateRetrocession = (lot) => {
    const honoraires = Number(lot.honoraires) || 0;
    return (honoraires * tauxRetrocession) / 100;
  };

  const retrocessionAVenir = lotsPartenaire
    .filter(l => ['reserve', 'compromis', 'sous_option'].includes(l.statut))
    .reduce((total, lot) => total + calculateRetrocession(lot), 0);

  const retrocessionActee = lotsPartenaire
    .filter(l => l.statut === 'vendu')
    .reduce((total, lot) => total + calculateRetrocession(lot), 0);

  const stats = {
    sous_option: lotsPartenaire.filter(l => l.statut === 'sous_option').length,
    reserve: lotsPartenaire.filter(l => l.statut === 'reserve').length,
    compromis: lotsPartenaire.filter(l => l.statut === 'compromis').length,
    vendu: lotsPartenaire.filter(l => l.statut === 'vendu').length,
  };

  const handleView = (lot) => {
    setViewingLot(lot);
  };

  const getAcquereurForLot = (lotId) => {
    const lot = lots.find(l => l.id === lotId);
    return acquereurs.find(a => a.id === lot?.acquereur_id);
  };

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="text-slate-500">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 bg-[#F9FAFB] min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#1E40AF]">Suivi de Dossier</h1>
          <p className="text-slate-500 mt-1">
            Suivez l'avancement de vos dossiers en cours
          </p>
        </div>

        <AnimatePresence>
          {viewingLot && (
            <AcquereurDetailPartenaire
              acquereur={getAcquereurForLot(viewingLot.id)}
              lot={viewingLot}
              onClose={() => setViewingLot(null)}
            />
          )}
        </AnimatePresence>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
            <p className="text-sm text-slate-500 mb-1">Sous option</p>
            <p className="text-2xl font-bold text-blue-600">{stats.sous_option}</p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
            <p className="text-sm text-slate-500 mb-1">Réservés</p>
            <p className="text-2xl font-bold text-yellow-600">{stats.reserve}</p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
            <p className="text-sm text-slate-500 mb-1">Compromis</p>
            <p className="text-2xl font-bold text-orange-600">{stats.compromis}</p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
            <p className="text-sm text-slate-500 mb-1">Vendus</p>
            <p className="text-2xl font-bold text-purple-600">{stats.vendu}</p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-emerald-100 p-6 rounded-xl shadow-sm border border-green-200 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-green-900">Mes Rétrocessions</h3>
            <span className="text-xs bg-green-200 text-green-800 px-2 py-1 rounded-full font-medium">
              Taux: {tauxRetrocession}%
            </span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-green-700 mb-1">À venir</p>
              <p className="text-xl font-bold text-green-600">
                {retrocessionAVenir.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
              </p>
              <p className="text-xs text-green-500 mt-1">Réservé + Compromis</p>
            </div>
            <div>
              <p className="text-xs text-green-700 mb-1">Actée</p>
              <p className="text-xl font-bold text-green-600">
                {retrocessionActee.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
              </p>
              <p className="text-xs text-green-500 mt-1">Vendus</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="flex-1">
              <Label htmlFor="search" className="text-sm text-slate-600 mb-2 block">
                Rechercher
              </Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input
                  id="search"
                  placeholder="Référence, résidence, acquéreur..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="dateDebut" className="text-sm text-slate-600 mb-2 block">
                Date début
              </Label>
              <Input
                id="dateDebut"
                type="date"
                value={dateDebut}
                onChange={(e) => setDateDebut(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="dateFin" className="text-sm text-slate-600 mb-2 block">
                Date fin
              </Label>
              <Input
                id="dateFin"
                type="date"
                value={dateFin}
                onChange={(e) => setDateFin(e.target.value)}
              />
            </div>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <Tabs value={filter} onValueChange={setFilter} className="w-full md:w-auto">
              <TabsList className="grid w-full grid-cols-5 md:w-auto">
                <TabsTrigger value="all">Tous</TabsTrigger>
                <TabsTrigger value="sous_option">Option</TabsTrigger>
                <TabsTrigger value="reserve">Réservé</TabsTrigger>
                <TabsTrigger value="compromis">Compromis</TabsTrigger>
                <TabsTrigger value="vendu">Vendu</TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="flex gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="icon"
                onClick={() => setViewMode('grid')}
              >
                <Grid3x3 className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="icon"
                onClick={() => setViewMode('list')}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {filteredLots.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-slate-400 text-lg">Aucun dossier trouvé</p>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredLots.map((lot) => (
              <motion.div
                key={lot.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <SuiviDossierCard
                  lot={lot}
                  onView={handleView}
                  hideVendeur={true}
                  commission={calculateCommission(lot)}
                />
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="divide-y divide-slate-100">
              {filteredLots.map((lot) => (
                <SuiviDossierListItem
                  key={lot.id}
                  lot={lot}
                  onView={handleView}
                  hideVendeur={true}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
