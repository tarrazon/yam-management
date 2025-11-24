import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Search, Grid3x3, List, Calendar } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion, AnimatePresence } from "framer-motion";
import SuiviDossierCard from "../components/suivi-dossier/SuiviDossierCard";
import SuiviDossierListItem from "../components/suivi-dossier/SuiviDossierListItem";
import SuiviDossierDetail from "../components/suivi-dossier/SuiviDossierDetail";
import SuiviDossierForm from "../components/suivi-dossier/SuiviDossierForm";
import { useAuth } from "@/contexts/AuthContext";

export default function SuiviDossier() {
  const { profile } = useAuth();
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [dateDebut, setDateDebut] = useState("");
  const [dateFin, setDateFin] = useState("");
  const [viewMode, setViewMode] = useState("grid");
  const [viewingLot, setViewingLot] = useState(null);
  const [editingLot, setEditingLot] = useState(null);
  const queryClient = useQueryClient();

  const userRole = profile?.role_custom || 'admin';
  const userId = profile?.id;
  const userEmail = profile?.email;

  const { data: lots = [], isLoading } = useQuery({
    queryKey: ['lots_lmnp'],
    queryFn: () => base44.entities.LotLMNP.list('-updated_at'),
  });

  const { data: partenaires = [] } = useQuery({
    queryKey: ['partenaires'],
    queryFn: () => base44.entities.Partenaire.list(),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.LotLMNP.update(id, data),
    onSuccess: () => {
      queryClient.refetchQueries({ queryKey: ['lots_lmnp'] });
      setEditingLot(null);
      setViewingLot(null);
    },
  });

  // Filtrer les partenaires selon le rôle
  const partenaireIds = userRole === 'commercial'
    ? partenaires
        .filter(p => p.created_by === userId || p.created_by === userEmail)
        .map(p => p.id)
    : null;

  // Filtrer uniquement les lots non disponibles et non en allotement
  let lotsEnCours = lots.filter(l => l.statut !== 'disponible' && l.statut !== 'allotement');

  // Pour les commerciaux, filtrer par partenaires
  if (userRole === 'commercial' && partenaireIds) {
    lotsEnCours = lotsEnCours.filter(l =>
      l.partenaire_id && partenaireIds.includes(l.partenaire_id)
    );
  }

  const filteredLots = lotsEnCours
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

  const getHonoraires = (lot) => {
    return lot.honoraires || 0;
  };

  const honorairesAVenir = lotsEnCours
    .filter(l => ['reserve', 'compromis'].includes(l.statut))
    .reduce((total, lot) => total + getHonoraires(lot), 0);

  const stats = {
    sous_option: lotsEnCours.filter(l => l.statut === 'sous_option').length,
    reserve: lotsEnCours.filter(l => l.statut === 'reserve').length,
    compromis: lotsEnCours.filter(l => l.statut === 'compromis').length,
    vendu: lotsEnCours.filter(l => l.statut === 'vendu').length,
  };

  const handleEdit = (lot) => {
    setEditingLot(lot);
    setViewingLot(null);
  };

  const handleView = (lot) => {
    setViewingLot(lot);
    setEditingLot(null);
  };

  const handleSubmit = (data) => {
    updateMutation.mutate({ id: data.id, data });
  };

  return (
    <div className="p-6 md:p-8 bg-[#F9FAFB] min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-[#1E40AF] tracking-tight">Suivi de dossier</h1>
              <p className="text-slate-500 mt-1">
                {lotsEnCours.length} dossiers en cours · {stats.compromis} compromis · {stats.vendu} vendus
              </p>
            </div>
            {honorairesAVenir > 0 && (
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-200 shadow-sm">
                <p className="text-sm text-blue-700 font-semibold mb-1">Honoraires à venir</p>
                <p className="text-2xl font-bold text-blue-600">
                  {honorairesAVenir.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <Input
                placeholder="Rechercher un dossier..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
            <Button
              variant={viewMode === "grid" ? "default" : "outline"}
              size="icon"
              onClick={() => setViewMode("grid")}
              className={viewMode === "grid" ? "bg-[#1E40AF]" : ""}
            >
              <Grid3x3 className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "outline"}
              size="icon"
              onClick={() => setViewMode("list")}
              className={viewMode === "list" ? "bg-[#1E40AF]" : ""}
            >
              <List className="w-4 h-4" />
            </Button>
            </div>
            <Tabs value={filter} onValueChange={setFilter}>
              <TabsList className="bg-white shadow-sm">
                <TabsTrigger value="all">Tous ({lotsEnCours.length})</TabsTrigger>
                <TabsTrigger value="sous_option">Sous option ({stats.sous_option})</TabsTrigger>
                <TabsTrigger value="reserve">Réservés ({stats.reserve})</TabsTrigger>
                <TabsTrigger value="compromis">Compromis ({stats.compromis})</TabsTrigger>
                <TabsTrigger value="vendu">Vendus ({stats.vendu})</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Filtres par date */}
          <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200">
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="w-4 h-4 text-[#F59E0B]" />
              <h3 className="font-semibold text-slate-700">Filtrer par date</h3>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date_debut" className="text-sm">Date de début</Label>
                <Input
                  id="date_debut"
                  type="date"
                  value={dateDebut}
                  onChange={(e) => setDateDebut(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="date_fin" className="text-sm">Date de fin</Label>
                <Input
                  id="date_fin"
                  type="date"
                  value={dateFin}
                  onChange={(e) => setDateFin(e.target.value)}
                />
              </div>
            </div>
            {(dateDebut || dateFin) && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setDateDebut("");
                  setDateFin("");
                }}
                className="mt-3"
              >
                Réinitialiser les dates
              </Button>
            )}
          </div>
        </div>

        {isLoading ? (
          <div className={viewMode === "grid" ? "grid md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}>
            {[1, 2, 3].map((i) => (
              <div key={i} className={`${viewMode === "grid" ? "h-80" : "h-24"} bg-white rounded-xl animate-pulse`} />
            ))}
          </div>
        ) : filteredLots.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-slate-400 text-lg">
              {searchTerm ? "Aucun dossier trouvé" : "Aucun dossier en cours"}
            </p>
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {filteredLots.map((lot) => {
                const partenaire = partenaires.find(p => p.id === lot.partenaire_id);
                return (
                  <SuiviDossierCard
                    key={lot.id}
                    lot={lot}
                    onEdit={handleEdit}
                    onView={handleView}
                    honoraires={getHonoraires(lot)}
                    partenaire={partenaire}
                  />
                );
              })}
            </AnimatePresence>
          </div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {filteredLots.map((lot) => {
                const partenaire = partenaires.find(p => p.id === lot.partenaire_id);
                return (
                  <SuiviDossierListItem
                    key={lot.id}
                    lot={lot}
                    onEdit={handleEdit}
                    onView={handleView}
                    partenaire={partenaire}
                  />
                );
              })}
            </AnimatePresence>
          </div>
        )}

        <AnimatePresence>
          {viewingLot && (
            <SuiviDossierDetail
              lot={viewingLot}
              onClose={() => setViewingLot(null)}
              onEdit={handleEdit}
            />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {editingLot && (
            <SuiviDossierForm
              lot={editingLot}
              onSubmit={handleSubmit}
              onCancel={() => setEditingLot(null)}
              isLoading={updateMutation.isPending}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}