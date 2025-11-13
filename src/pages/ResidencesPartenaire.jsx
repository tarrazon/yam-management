
import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Search, Grid3x3, List, Map } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import ResidenceGestionCardPartenaire from "../components/residences-gestion/ResidenceGestionCardPartenaire";
import ResidenceGestionListItemPartenaire from "../components/residences-gestion/ResidenceGestionListItemPartenaire";
import ResidenceGestionDetail from "../components/residences-gestion/ResidenceGestionDetail";
import ResidencesMapView from "../components/residences-gestion/ResidencesMapView";

export default function ResidencesPartenaire() {
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("grid");
  const [viewingResidence, setViewingResidence] = useState(null);

  const { data: residences = [], isLoading } = useQuery({
    queryKey: ['residences_gestion'],
    queryFn: () => base44.entities.ResidenceGestion.list('-created_at'),
  });

  const { data: lots = [] } = useQuery({
    queryKey: ['lots_lmnp_residences'],
    queryFn: () => base44.entities.LotLMNP.list(),
  });

  const filteredResidences = residences
    .filter(r => filter === "all" || r.statut === filter)
    .filter(r => 
      !searchTerm || 
      r.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.ville?.toLowerCase().includes(searchTerm.toLowerCase())
    );

  const stats = {
    active: residences.filter(r => r.statut === 'active').length,
    en_renovation: residences.filter(r => r.statut === 'en_renovation').length,
    en_liquidation: residences.filter(r => r.statut === 'en_liquidation').length,
  };

  // Créer un objet pour les comptages de lots disponibles uniquement
  const lotsCountByResidence = lots.reduce((acc, lot) => {
    if (lot.residence_id && lot.statut === 'disponible') {
      acc[lot.residence_id] = (acc[lot.residence_id] || 0) + 1;
    }
    return acc;
  }, {});

  const navigate = useNavigate();

  const handleView = (residence) => {
    setViewingResidence(residence);
  };

  const handleNavigateToLots = (residenceId) => {
    navigate(createPageUrl("LotsPartenaire") + `?residence_id=${residenceId}`);
  };

  return (
    <div className="p-6 md:p-8 bg-[#F9FAFB] min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#1E40AF] tracking-tight">Résidences</h1>
          <p className="text-slate-500 mt-1">
            {residences.length} résidences · {stats.active} actives
          </p>
        </div>

        {/* Barre de recherche */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <Input
                  placeholder="Rechercher une résidence..."
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
                  title="Vue grille"
                >
                  <Grid3x3 className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "outline"}
                  size="icon"
                  onClick={() => setViewMode("list")}
                  className={viewMode === "list" ? "bg-[#1E40AF]" : ""}
                  title="Vue liste"
                >
                  <List className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === "map" ? "default" : "outline"}
                  size="icon"
                  onClick={() => setViewMode("map")}
                  className={viewMode === "map" ? "bg-[#1E40AF]" : ""}
                  title="Vue carte"
                >
                  <Map className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <Tabs value={filter} onValueChange={setFilter} className="mt-4">
              <TabsList className="bg-white shadow-sm">
                <TabsTrigger value="all">Toutes ({residences.length})</TabsTrigger>
                <TabsTrigger value="active">Actives ({stats.active})</TabsTrigger>
                <TabsTrigger value="en_renovation">En rénovation ({stats.en_renovation})</TabsTrigger>
                <TabsTrigger value="en_liquidation">En liquidation ({stats.en_liquidation})</TabsTrigger>
              </TabsList>
            </Tabs>
          </CardContent>
        </Card>

        {isLoading ? (
          <div className={viewMode === "grid" ? "grid md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}>
            {[1, 2, 3].map((i) => (
              <div key={i} className={`${viewMode === "grid" ? "h-96" : "h-24"} bg-white rounded-xl animate-pulse`} />
            ))}
          </div>
        ) : filteredResidences.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-slate-400 text-lg">
              {searchTerm ? "Aucune résidence trouvée" : "Aucune résidence pour le moment"}
            </p>
          </div>
        ) : viewMode === "map" ? (
          <ResidencesMapView
            residences={filteredResidences}
            onView={handleView}
            onEdit={null}
            onDelete={null}
            lotsCountByResidence={lotsCountByResidence}
          />
        ) : viewMode === "grid" ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {filteredResidences.map((residence) => (
                <ResidenceGestionCardPartenaire
                  key={residence.id}
                  residence={residence}
                  lots={lots}
                  onView={handleView}
                  onNavigateToLots={handleNavigateToLots}
                />
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {filteredResidences.map((residence) => (
                <ResidenceGestionListItemPartenaire
                  key={residence.id}
                  residence={residence}
                  lots={lots}
                  onView={handleView}
                  onNavigateToLots={handleNavigateToLots}
                />
              ))}
            </AnimatePresence>
          </div>
        )}

        <AnimatePresence>
          {viewingResidence && (
            <ResidenceGestionDetail
              residence={viewingResidence}
              onClose={() => setViewingResidence(null)}
              onEdit={null}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
