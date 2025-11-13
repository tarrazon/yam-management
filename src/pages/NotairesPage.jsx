
import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Grid3x3, List, X } from "lucide-react"; // Added X import
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import NotaireCard from "../components/notaires/NotaireCard";
import NotaireListItem from "../components/notaires/NotaireListItem";
import NotaireForm from "../components/notaires/NotaireForm";
import NotaireDetail from "../components/notaires/NotaireDetail";
import { motion, AnimatePresence } from "framer-motion";
import DeleteConfirmDialog from "../components/common/DeleteConfirmDialog";

export default function NotairesPage() {
  const [showForm, setShowForm] = useState(false);
  const [editingNotaire, setEditingNotaire] = useState(null);
  const [viewingNotaire, setViewingNotaire] = useState(null);
  const [deletingNotaire, setDeletingNotaire] = useState(null);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("grid");
  const [error, setError] = useState(null); // Added error state
  const queryClient = useQueryClient();

  const { data: notaires = [], isLoading } = useQuery({
    queryKey: ['notaires'],
    queryFn: () => base44.entities.Notaire.list('-created_date'),
  });

  const { data: dossiers = [] } = useQuery({
    queryKey: ['dossiers_vente'],
    queryFn: () => base44.entities.DossierVente.list(),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Notaire.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notaires'] });
      setShowForm(false);
      setEditingNotaire(null);
      setError(null); // Clear error on success
    },
    onError: (error) => {
      console.error("Error creating notaire:", error);
      setError(error.message || "Une erreur est survenue lors de la création du notaire");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Notaire.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notaires'] });
      setShowForm(false);
      setEditingNotaire(null);
      setViewingNotaire(null);
      setError(null); // Clear error on success
    },
    onError: (error) => {
      console.error("Error updating notaire:", error);
      setError(error.message || "Une erreur est survenue lors de la modification du notaire");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      // Dissocier les dossiers de vente où ce notaire est associé
      const dossiersAssocies = dossiers.filter(d => d.notaire_vendeur_id === id || d.notaire_acquereur_id === id);
      for (const dossier of dossiersAssocies) {
        const updates = {};
        if (dossier.notaire_vendeur_id === id) updates.notaire_vendeur_id = null;
        if (dossier.notaire_acquereur_id === id) updates.notaire_acquereur_id = null;
        await base44.entities.DossierVente.update(dossier.id, updates);
      }
      
      // Supprimer le notaire
      return base44.entities.Notaire.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notaires'] });
      queryClient.invalidateQueries({ queryKey: ['dossiers_vente'] });
      setDeletingNotaire(null);
      setViewingNotaire(null);
      setError(null); // Clear error on success
    },
    onError: (error) => {
      console.error("Error deleting notaire:", error);
      setError(error.message || "Une erreur est survenue lors de la suppression du notaire");
    },
  });

  const handleSubmit = (data) => {
    if (editingNotaire) {
      updateMutation.mutate({ id: editingNotaire.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (notaire) => {
    setEditingNotaire(notaire);
    setViewingNotaire(null);
    setShowForm(true);
    setError(null); // Clear error when opening form for edit
  };

  const handleView = (notaire) => {
    setViewingNotaire(notaire);
    setShowForm(false);
    setError(null); // Clear error when viewing
  };

  const handleDelete = (notaire) => {
    setDeletingNotaire(notaire);
    setError(null); // Clear error when preparing to delete
  };

  const filteredNotaires = notaires
    .filter(n => filter === "all" || n.type_notaire === filter)
    .filter(n =>
      !searchTerm ||
      `${n.nom} ${n.prenom}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      n.etude?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      n.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

  const stats = {
    vendeur: notaires.filter(n => n.type_notaire === 'vendeur').length,
    acquereur: notaires.filter(n => n.type_notaire === 'acquereur').length,
    mixte: notaires.filter(n => n.type_notaire === 'mixte').length,
  };

  const dossiersForDeletion = deletingNotaire ?
    dossiers.filter(d => d.notaire_vendeur_id === deletingNotaire.id || d.notaire_acquereur_id === deletingNotaire.id).length : 0;

  return (
    <div className="p-6 md:p-8 bg-[#F9FAFB] min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-[#1E40AF] tracking-tight">Notaires</h1>
            <p className="text-slate-500 mt-1">
              {stats.vendeur} vendeurs · {stats.acquereur} acquéreurs · {stats.mixte} mixtes
            </p>
          </div>
          <Button
            onClick={() => {
              setShowForm(!showForm);
              setEditingNotaire(null);
              setError(null); // Clear error when toggling form
            }}
            className="bg-[#1E40AF] hover:bg-[#1E3A8A] text-white shadow-lg"
          >
            <Plus className="w-5 h-5 mr-2" />
            Nouveau notaire
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
              placeholder="Rechercher un notaire..."
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
              <TabsTrigger value="all">Tous ({notaires.length})</TabsTrigger>
              <TabsTrigger value="vendeur">Vendeurs ({stats.vendeur})</TabsTrigger>
              <TabsTrigger value="acquereur">Acquéreurs ({stats.acquereur})</TabsTrigger>
              <TabsTrigger value="mixte">Mixtes ({stats.mixte})</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <AnimatePresence>
          {showForm && (
            <NotaireForm
              notaire={editingNotaire}
              onSubmit={handleSubmit}
              onCancel={() => {
                setShowForm(false);
                setEditingNotaire(null);
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
        ) : filteredNotaires.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-slate-400 text-lg">
              {searchTerm ? "Aucun notaire trouvé" : "Aucun notaire pour le moment"}
            </p>
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {filteredNotaires.map((notaire) => (
                <NotaireCard
                  key={notaire.id}
                  notaire={notaire}
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
              {filteredNotaires.map((notaire) => (
                <NotaireListItem
                  key={notaire.id}
                  notaire={notaire}
                  onEdit={handleEdit}
                  onView={handleView}
                  onDelete={handleDelete}
                />
              ))}
            </AnimatePresence>
          </div>
        )}

        <AnimatePresence>
          {viewingNotaire && (
            <NotaireDetail
              notaire={viewingNotaire}
              onClose={() => {
                setViewingNotaire(null);
                setError(null); // Clear error on detail close
              }}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          )}
        </AnimatePresence>

        <DeleteConfirmDialog
          open={!!deletingNotaire}
          onOpenChange={() => {
            setDeletingNotaire(null);
            setError(null); // Clear error on delete dialog close
          }}
          onConfirm={() => deleteMutation.mutate(deletingNotaire.id)}
          title="Supprimer ce notaire ?"
          description="Cette action supprimera définitivement le notaire de la base de données."
          itemName={deletingNotaire ? `${deletingNotaire.prenom} ${deletingNotaire.nom} - ${deletingNotaire.etude}` : ""}
          warningMessage={dossiersForDeletion > 0 ? `⚠️ ${dossiersForDeletion} dossier(s) sont associés à ce notaire. Les dossiers ne seront pas supprimés, mais la référence au notaire sera retirée.` : null}
          isDeleting={deleteMutation.isPending}
        />
      </div>
    </div>
  );
}
