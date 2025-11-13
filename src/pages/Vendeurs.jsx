
import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Grid3x3, List, X } from "lucide-react"; // Added X icon
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import VendeurCard from "../components/vendeurs/VendeurCard";
import VendeurListItem from "../components/vendeurs/VendeurListItem";
import VendeurForm from "../components/vendeurs/VendeurForm";
import VendeurDetail from "../components/vendeurs/VendeurDetail";
import DeleteConfirmDialog from "../components/common/DeleteConfirmDialog";
import { motion, AnimatePresence } from "framer-motion";

export default function Vendeurs() {
  const [showForm, setShowForm] = useState(false);
  const [editingVendeur, setEditingVendeur] = useState(null);
  const [viewingVendeur, setViewingVendeur] = useState(null);
  const [deletingVendeur, setDeletingVendeur] = useState(null);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("grid");
  const [error, setError] = useState(null); // New state for error messages
  const queryClient = useQueryClient();

  const { data: vendeurs = [], isLoading } = useQuery({
    queryKey: ['vendeurs'],
    queryFn: () => base44.entities.Vendeur.list('-created_at'),
  });

  const { data: lots = [] } = useQuery({
    queryKey: ['lots_lmnp'],
    queryFn: () => base44.entities.LotLMNP.list(),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Vendeur.create(data),
    onSuccess: () => {
      queryClient.refetchQueries({ queryKey: ['vendeurs'] });
      setShowForm(false);
      setEditingVendeur(null);
      setError(null); // Clear error on success
    },
    onError: (error) => {
      console.error("Error creating vendeur:", error);
      setError(error.message || "Une erreur est survenue lors de la création du vendeur");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Vendeur.update(id, data),
    onSuccess: () => {
      queryClient.refetchQueries({ queryKey: ['vendeurs'] });
      setShowForm(false);
      setEditingVendeur(null);
      setViewingVendeur(null);
      setError(null); // Clear error on success
    },
    onError: (error) => {
      console.error("Error updating vendeur:", error);
      setError(error.message || "Une erreur est survenue lors de la modification du vendeur");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      // Dissocier les lots où ce vendeur est associé
      const lotsAssocies = lots.filter(l => l.vendeur_id === id);
      for (const lot of lotsAssocies) {
        await base44.entities.LotLMNP.update(lot.id, { 
          vendeur_id: null, 
          vendeur_nom: "" // Set to empty string instead of null for consistency
        });
      }
      
      // Supprimer le vendeur
      return base44.entities.Vendeur.delete(id);
    },
    onSuccess: () => {
      queryClient.refetchQueries({ queryKey: ['vendeurs'] });
      queryClient.refetchQueries({ queryKey: ['lots_lmnp'] });
      setDeletingVendeur(null);
      setViewingVendeur(null); // Close detail view if the deleted vendeur was being viewed
      setError(null); // Clear error on success
    },
    onError: (error) => {
      console.error("Error deleting vendeur:", error);
      setError(error.message || "Une erreur est survenue lors de la suppression du vendeur");
    },
  });

  const handleSubmit = (data) => {
    if (editingVendeur) {
      updateMutation.mutate({ id: editingVendeur.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (vendeur) => {
    setEditingVendeur(vendeur);
    setViewingVendeur(null);
    setShowForm(true);
    setError(null); // Clear error when opening form
  };

  const handleView = (vendeur) => {
    setViewingVendeur(vendeur);
    setShowForm(false);
    setError(null); // Clear error when viewing
  };

  const handleDelete = (vendeur) => {
    setDeletingVendeur(vendeur);
    setError(null); // Clear error when initiating delete
  };

  const filteredVendeurs = vendeurs
    .filter(v => filter === "all" || v.statut_commercial === filter)
    .filter(v => {
      if (!searchTerm) return true;
      const search = searchTerm.toLowerCase();
      const fullName = v.type_vendeur === 'entreprise' 
        ? v.nom?.toLowerCase() 
        : `${v.prenom} ${v.nom}`.toLowerCase();
      return fullName.includes(search) || v.email?.toLowerCase().includes(search);
    });

  const stats = {
    prospect: vendeurs.filter(v => v.statut_commercial === 'prospect').length,
    en_negociation: vendeurs.filter(v => v.statut_commercial === 'en_negociation').length,
    mandate: vendeurs.filter(v => v.statut_commercial === 'mandate').length,
    vendu: vendeurs.filter(v => v.statut_commercial === 'vendu').length,
  };

  const getLotsForVendeur = (vendeurId) => {
    return lots.filter(lot => lot.vendeur_id === vendeurId);
  };

  const lotsForDeletion = deletingVendeur ? lots.filter(l => l.vendeur_id === deletingVendeur.id).length : 0;

  return (
    <div className="p-6 md:p-8 bg-[#F9FAFB] min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-[#1E40AF] tracking-tight">Vendeurs</h1>
            <p className="text-slate-500 mt-1">
              {stats.prospect} prospects · {stats.mandate} mandatés · {stats.vendu} vendus
            </p>
          </div>
          <Button
            onClick={() => {
              setShowForm(!showForm);
              setEditingVendeur(null);
              setError(null); // Clear error when opening new form
            }}
            className="bg-[#1E40AF] hover:bg-[#1E3A8A] text-white shadow-lg"
          >
            <Plus className="w-5 h-5 mr-2" />
            Nouveau vendeur
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
              placeholder="Rechercher un vendeur..."
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
              <TabsTrigger value="all">Tous ({vendeurs.length})</TabsTrigger>
              <TabsTrigger value="prospect">Prospects ({stats.prospect})</TabsTrigger>
              <TabsTrigger value="en_negociation">Négociation ({stats.en_negociation})</TabsTrigger>
              <TabsTrigger value="mandate">Mandatés ({stats.mandate})</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <AnimatePresence>
          {showForm && (
            <VendeurForm
              vendeur={editingVendeur}
              onSubmit={handleSubmit}
              onCancel={() => {
                setShowForm(false);
                setEditingVendeur(null);
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
        ) : filteredVendeurs.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-slate-400 text-lg">
              {searchTerm ? "Aucun vendeur trouvé" : "Aucun vendeur pour le moment"}
            </p>
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {filteredVendeurs.map((vendeur) => (
                <VendeurCard
                  key={vendeur.id}
                  vendeur={vendeur}
                  onEdit={handleEdit}
                  onView={handleView}
                  onDelete={handleDelete}
                  lotsAssocies={getLotsForVendeur(vendeur.id)}
                />
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {filteredVendeurs.map((vendeur) => (
                <VendeurListItem
                  key={vendeur.id}
                  vendeur={vendeur}
                  lotsAssocies={getLotsForVendeur(vendeur.id)}
                  onEdit={handleEdit}
                  onView={handleView}
                  onDelete={handleDelete}
                />
              ))}
            </AnimatePresence>
          </div>
        )}

        <AnimatePresence>
          {viewingVendeur && (
            <VendeurDetail
              vendeur={viewingVendeur}
              lotsAssocies={getLotsForVendeur(viewingVendeur.id)}
              onClose={() => {
                setViewingVendeur(null);
                setError(null); // Clear error on detail close
              }}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          )}
        </AnimatePresence>

        <DeleteConfirmDialog
          open={!!deletingVendeur}
          onOpenChange={() => {
            setDeletingVendeur(null);
            setError(null); // Clear error on dialog close/cancel
          }}
          onConfirm={() => deleteMutation.mutate(deletingVendeur.id)}
          title="Supprimer ce vendeur ?"
          description="Cette action supprimera définitivement le vendeur de la base de données."
          itemName={deletingVendeur ? (deletingVendeur.type_vendeur === 'entreprise' ? deletingVendeur.nom : `${deletingVendeur.prenom} ${deletingVendeur.nom}`) : ""}
          warningMessage={lotsForDeletion > 0 ? `⚠️ ${lotsForDeletion} lot(s) sont associés à ce vendeur. Les lots ne seront pas supprimés, mais la référence au vendeur sera retirée.` : null}
          isDeleting={deleteMutation.isPending}
        />
      </div>
    </div>
  );
}
