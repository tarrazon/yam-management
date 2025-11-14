
import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Grid3x3, List, Map as MapIcon, X } from "lucide-react"; // Added X icon
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ResidenceGestionCard from "../components/residences-gestion/ResidenceGestionCard";
import ResidenceGestionListItem from "../components/residences-gestion/ResidenceGestionListItem";
import ResidenceGestionForm from "../components/residences-gestion/ResidenceGestionForm";
import ResidenceGestionDetail from "../components/residences-gestion/ResidenceGestionDetail";
import ResidencesMapView from "../components/residences-gestion/ResidencesMapView";
import DeleteConfirmDialog from "../components/common/DeleteConfirmDialog";
import { motion, AnimatePresence } from "framer-motion";
import { viewsTracking } from "@/api/viewsTracking";

export default function ResidencesGestion() {
  const [showForm, setShowForm] = useState(false);
  const [editingResidence, setEditingResidence] = useState(null);
  const [viewingResidence, setViewingResidence] = useState(null);
  const [deletingResidence, setDeletingResidence] = useState(null);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("grid");
  const [error, setError] = useState(null); // New state for error messages
  const queryClient = useQueryClient();

  const { data: residences = [], isLoading } = useQuery({
    queryKey: ['residences_gestion'],
    queryFn: () => base44.entities.ResidenceGestion.list('-created_at'),
  });

  const { data: lots = [] } = useQuery({
    queryKey: ['lots_lmnp'],
    queryFn: () => base44.entities.LotLMNP.list(),
  });

  const { data: contacts = [] } = useQuery({
    queryKey: ['contacts_residence'],
    queryFn: () => base44.entities.ContactResidence.list(),
  });

  const { data: currentUser } = useQuery({
    queryKey: ['current_user_residences'],
    queryFn: () => base44.auth.me(),
  });

  // Charger les stats de vues pour les résidences (admin uniquement)
  const [residencesViewsStats, setResidencesViewsStats] = useState(new Map());

  useEffect(() => {
    const loadViewsStats = async () => {
      if (currentUser?.role_custom === 'admin' && residences.length > 0) {
        const residenceIds = residences.map(res => res.id);
        const stats = await viewsTracking.getBulkViewsStats('residence', residenceIds);
        setResidencesViewsStats(stats);
      }
    };
    loadViewsStats();
  }, [residences, currentUser]);

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.ResidenceGestion.create(data),
    onSuccess: () => {
      queryClient.refetchQueries({ queryKey: ['residences_gestion'] });
      setShowForm(false);
      setEditingResidence(null);
      setError(null); // Clear error on success
    },
    onError: (error) => {
      console.error("Error creating residence:", error);
      setError(error.message || "Une erreur est survenue lors de la création de la résidence");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.ResidenceGestion.update(id, data),
    onSuccess: () => {
      queryClient.refetchQueries({ queryKey: ['residences_gestion'] });
      setShowForm(false);
      setEditingResidence(null);
      setViewingResidence(null);
      setError(null); // Clear error on success
    },
    onError: (error) => {
      console.error("Error updating residence:", error);
      setError(error.message || "Une erreur est survenue lors de la modification de la résidence");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      // Supprimer tous les lots associés
      const lotsAssocies = lots.filter(l => l.residence_id === id);
      for (const lot of lotsAssocies) {
        await base44.entities.LotLMNP.delete(lot.id);
      }
      
      // Supprimer tous les contacts associés
      const contactsAssocies = contacts.filter(c => c.residence_id === id);
      for (const contact of contactsAssocies) {
        await base44.entities.ContactResidence.delete(contact.id);
      }
      
      // Supprimer la résidence
      return base44.entities.ResidenceGestion.delete(id);
    },
    onSuccess: () => {
      queryClient.refetchQueries({ queryKey: ['residences_gestion'] });
      queryClient.refetchQueries({ queryKey: ['lots_lmnp'] });
      queryClient.refetchQueries({ queryKey: ['contacts_residence'] });
      setDeletingResidence(null);
      setError(null); // Clear error on success
    },
    onError: (error) => {
      console.error("Error deleting residence:", error);
      setError(error.message || "Une erreur est survenue lors de la suppression de la résidence");
    },
  });

  const handleSubmit = (data) => {
    if (editingResidence) {
      updateMutation.mutate({ id: editingResidence.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (residence) => {
    setEditingResidence(residence);
    setViewingResidence(null);
    setShowForm(true);
  };

  const handleView = (residence) => {
    setViewingResidence(residence);
    setShowForm(false);
  };

  const handleDelete = (residence) => {
    setDeletingResidence(residence);
  };

  const getLotsCountForResidence = (residenceId) => {
    return lots.filter(lot => lot.residence_id === residenceId).length;
  };

  // Créer un objet pour les comptages de lots
  const lotsCountByResidence = lots.reduce((acc, lot) => {
    if (lot.residence_id) {
      acc[lot.residence_id] = (acc[lot.residence_id] || 0) + 1;
    }
    return acc;
  }, {});

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

  const lotsForDeletion = deletingResidence ? lots.filter(l => l.residence_id === deletingResidence.id).length : 0;

  return (
    <div className="p-6 md:p-8 bg-[#F9FAFB] min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-[#1E40AF] tracking-tight">Résidences en gestion</h1>
            <p className="text-slate-500 mt-1">
              {stats.active} actives · {stats.en_renovation} en rénovation · {stats.en_liquidation} en liquidation
            </p>
          </div>
          <Button
            onClick={() => {
              setShowForm(!showForm);
              setEditingResidence(null);
            }}
            className="bg-[#1E40AF] hover:bg-[#1E3A8A] text-white shadow-lg"
          >
            <Plus className="w-5 h-5 mr-2" />
            Nouvelle résidence
          </Button>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-lg">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <X className="w-5 h-5 text-red-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-red-800 mb-1">Erreur</h3>
                <p className="text-sm text-red-700">{error}</p>
              </div>
              <button
                onClick={() => setError(null)}
                className="text-red-400 hover:text-red-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        <div className="flex flex-col md:flex-row gap-4 mb-6">
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
              <MapIcon className="w-4 h-4" />
            </Button>
          </div>
          <Tabs value={filter} onValueChange={setFilter}>
            <TabsList className="bg-white shadow-sm">
              <TabsTrigger value="all">Toutes ({residences.length})</TabsTrigger>
              <TabsTrigger value="active">Actives ({stats.active})</TabsTrigger>
              <TabsTrigger value="en_renovation">Rénovation ({stats.en_renovation})</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <AnimatePresence>
          {showForm && (
            <ResidenceGestionForm
              residence={editingResidence}
              onSubmit={handleSubmit}
              onCancel={() => {
                setShowForm(false);
                setEditingResidence(null);
                setError(null); // Clear error on form cancel
              }}
              isLoading={createMutation.isPending || updateMutation.isPending}
            />
          )}
        </AnimatePresence>

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
            onEdit={handleEdit}
            onView={handleView}
            onDelete={handleDelete}
            lotsCountByResidence={lotsCountByResidence}
          />
        ) : viewMode === "grid" ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {filteredResidences.map((residence) => (
                <ResidenceGestionCard
                  key={residence.id}
                  residence={residence}
                  onEdit={handleEdit}
                  onView={handleView}
                  onDelete={handleDelete}
                  viewsStats={currentUser?.role_custom === 'admin' ? residencesViewsStats.get(residence.id) : null}
                />
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {filteredResidences.map((residence) => (
                <ResidenceGestionListItem
                  key={residence.id}
                  residence={residence}
                  onEdit={handleEdit}
                  onView={handleView}
                  onDelete={handleDelete}
                />
              ))}
            </AnimatePresence>
          </div>
        )}

        <AnimatePresence>
          {viewingResidence && (
            <ResidenceGestionDetail
              residence={viewingResidence}
              lotsCount={getLotsCountForResidence(viewingResidence.id)}
              onClose={() => setViewingResidence(null)}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          )}
        </AnimatePresence>

        <DeleteConfirmDialog
          open={!!deletingResidence}
          onOpenChange={() => setDeletingResidence(null)}
          onConfirm={() => deleteMutation.mutate(deletingResidence.id)}
          title="Supprimer cette résidence ?"
          description="Cette action supprimera définitivement la résidence et toutes ses données associées."
          itemName={deletingResidence?.nom}
          warningMessage={`⚠️ ${lotsForDeletion} lot(s) associé(s) seront également supprimés, ainsi que tous les contacts de cette résidence. Cette action est irréversible.`}
          isDeleting={deleteMutation.isPending}
        />
      </div>
    </div>
  );
}
