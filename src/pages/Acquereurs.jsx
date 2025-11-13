
import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Grid3x3, List, X } from "lucide-react"; // Added X icon
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AcquereurCard from "../components/acquereurs/AcquereurCard";
import AcquereurListItem from "../components/acquereurs/AcquereurListItem";
import AcquereurForm from "../components/acquereurs/AcquereurForm";
import AcquereurDetail from "../components/acquereurs/AcquereurDetail";
import DeleteConfirmDialog from "../components/common/DeleteConfirmDialog";
import { motion, AnimatePresence } from "framer-motion";

export default function Acquereurs() {
  const [showForm, setShowForm] = useState(false);
  const [editingAcquereur, setEditingAcquereur] = useState(null);
  const [viewingAcquereur, setViewingAcquereur] = useState(null);
  const [deletingAcquereur, setDeletingAcquereur] = useState(null);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("grid");
  const [error, setError] = useState(null); // New state for error messages
  const queryClient = useQueryClient();

  const { data: acquereurs = [], isLoading } = useQuery({
    queryKey: ['acquereurs'],
    queryFn: () => base44.entities.Acquereur.list('-created_at'),
  });

  const { data: partenaires = [] } = useQuery({
    queryKey: ['partenaires'],
    queryFn: () => base44.entities.Partenaire.list(),
  });

  const { data: lots = [] } = useQuery({
    queryKey: ['lots_lmnp'],
    queryFn: () => base44.entities.LotLMNP.list(),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Acquereur.create(data),
    onSuccess: () => {
      queryClient.refetchQueries({ queryKey: ['acquereurs'] });
      setShowForm(false);
      setEditingAcquereur(null);
      setError(null); // Clear error on success
    },
    onError: (error) => {
      console.error("Error creating acquereur:", error);
      setError(error.message || "Une erreur est survenue lors de la création de l'acquéreur");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Acquereur.update(id, data),
    onSuccess: () => {
      queryClient.refetchQueries({ queryKey: ['acquereurs'] });
      setShowForm(false);
      setEditingAcquereur(null);
      setViewingAcquereur(null);
      setError(null); // Clear error on success
    },
    onError: (error) => {
      console.error("Error updating acquereur:", error);
      setError(error.message || "Une erreur est survenue lors de la modification de l'acquéreur");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      // Dissocier les lots où cet acquéreur est associé
      const lotsAssocies = lots.filter(l => l.acquereur_id === id);
      for (const lot of lotsAssocies) {
        await base44.entities.LotLMNP.update(lot.id, { acquereur_id: null, acquereur_nom: "" });
      }
      
      // Supprimer l'acquéreur
      return base44.entities.Acquereur.delete(id);
    },
    onSuccess: () => {
      queryClient.refetchQueries({ queryKey: ['acquereurs'] });
      queryClient.refetchQueries({ queryKey: ['lots_lmnp'] });
      setDeletingAcquereur(null);
      setViewingAcquereur(null); // Close detail view if the deleted acquereur was being viewed
      setError(null); // Clear error on success
    },
    onError: (error) => {
      console.error("Error deleting acquereur:", error);
      setError(error.message || "Une erreur est survenue lors de la suppression de l'acquéreur");
    },
  });

  const handleSubmit = (data) => {
    const partenaire = partenaires.find(p => p.id === data.partenaire_id);
    const enrichedData = {
      ...data,
      partenaire_nom: partenaire?.nom || partenaire?.nom_societe || "",
    };

    if (editingAcquereur) {
      updateMutation.mutate({ id: editingAcquereur.id, data: enrichedData });
    } else {
      createMutation.mutate(enrichedData);
    }
  };

  const handleEdit = (acquereur) => {
    setEditingAcquereur(acquereur);
    setViewingAcquereur(null);
    setShowForm(true);
  };

  const handleView = (acquereur) => {
    setViewingAcquereur(acquereur);
    setShowForm(false);
  };

  const handleDelete = (acquereur) => {
    setDeletingAcquereur(acquereur);
  };

  const filteredAcquereurs = acquereurs
    .filter(a => filter === "all" || a.statut_commercial === filter)
    .filter(a => 
      !searchTerm || 
      `${a.nom} ${a.prenom}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

  const stats = {
    prospect: acquereurs.filter(a => a.statut_commercial === 'prospect').length,
    qualifie: acquereurs.filter(a => a.statut_commercial === 'qualifie').length,
    en_negociation: acquereurs.filter(a => a.statut_commercial === 'en_negociation').length,
    acheteur: acquereurs.filter(a => a.statut_commercial === 'acheteur').length,
  };

  const lotsForDeletion = deletingAcquereur ? lots.filter(l => l.acquereur_id === deletingAcquereur.id).length : 0;

  return (
    <div className="p-6 md:p-8 bg-[#F9FAFB] min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-[#1E40AF] tracking-tight">Acquéreurs</h1>
            <p className="text-slate-500 mt-1">
              {stats.qualifie} qualifiés · {stats.en_negociation} en négociation · {stats.acheteur} acheteurs
            </p>
          </div>
          <Button
            onClick={() => {
              setShowForm(!showForm);
              setEditingAcquereur(null);
            }}
            className="bg-[#1E40AF] hover:bg-[#1E3A8A] text-white shadow-lg"
          >
            <Plus className="w-5 h-5 mr-2" />
            Nouvel acquéreur
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
              placeholder="Rechercher un acquéreur..."
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
              <TabsTrigger value="all">Tous ({acquereurs.length})</TabsTrigger>
              <TabsTrigger value="qualifie">Qualifiés ({stats.qualifie})</TabsTrigger>
              <TabsTrigger value="en_negociation">Négociation ({stats.en_negociation})</TabsTrigger>
              <TabsTrigger value="acheteur">Acheteurs ({stats.acheteur})</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <AnimatePresence>
          {showForm && (
            <AcquereurForm
              acquereur={editingAcquereur}
              onSubmit={handleSubmit}
              onCancel={() => {
                setShowForm(false);
                setEditingAcquereur(null);
                setError(null); // Clear error on form cancel
              }}
              isLoading={createMutation.isPending || updateMutation.isPending}
            />
          )}
        </AnimatePresence>

        {isLoading ? (
          <div className={viewMode === "grid" ? "grid md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}>
            {[1, 2, 3].map((i) => (
              <div key={i} className={`${viewMode === "grid" ? "h-80" : "h-24"} bg-white rounded-xl animate-pulse`} />
            ))}
          </div>
        ) : filteredAcquereurs.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-slate-400 text-lg">
              {searchTerm ? "Aucun acquéreur trouvé" : "Aucun acquéreur pour le moment"}
            </p>
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {filteredAcquereurs.map((acquereur) => (
                <AcquereurCard
                  key={acquereur.id}
                  acquereur={acquereur}
                  onEdit={handleEdit}
                  onView={handleView}
                  onDelete={handleDelete}
                />
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {filteredAcquereurs.map((acquereur) => (
                <AcquereurListItem
                  key={acquereur.id}
                  acquereur={acquereur}
                  onEdit={handleEdit}
                  onView={handleView}
                  onDelete={handleDelete}
                />
              ))}
            </AnimatePresence>
          </div>
        )}

        <AnimatePresence>
          {viewingAcquereur && (
            <AcquereurDetail
              acquereur={viewingAcquereur}
              onClose={() => setViewingAcquereur(null)}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          )}
        </AnimatePresence>

        <DeleteConfirmDialog
          open={!!deletingAcquereur}
          onOpenChange={() => setDeletingAcquereur(null)}
          onConfirm={() => deleteMutation.mutate(deletingAcquereur.id)}
          title="Supprimer cet acquéreur ?"
          description="Cette action supprimera définitivement l'acquéreur de la base de données."
          itemName={deletingAcquereur ? `${deletingAcquereur.prenom} ${deletingAcquereur.nom}` : ""}
          warningMessage={lotsForDeletion > 0 ? `⚠️ ${lotsForDeletion} lot(s) sont associés à cet acquéreur. Les lots ne seront pas supprimés, mais la référence à l'acquéreur sera retirée.` : null}
          isDeleting={deleteMutation.isPending}
        />
      </div>
    </div>
  );
}
