import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Loader2, Building2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import GestionnaireCard from "@/components/gestionnaires/GestionnaireCard";
import GestionnaireForm from "@/components/gestionnaires/GestionnaireForm";
import DeleteConfirmDialog from "@/components/common/DeleteConfirmDialog";

export default function GestionnairesPage() {
  const [gestionnaires, setGestionnaires] = useState([]);
  const [filteredGestionnaires, setFilteredGestionnaires] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingGestionnaire, setEditingGestionnaire] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, gestionnaire: null });
  const [gestionnaireResidences, setGestionnaireResidences] = useState({});

  useEffect(() => {
    loadGestionnaires();
  }, []);

  useEffect(() => {
    filterGestionnaires();
  }, [searchTerm, gestionnaires]);

  const loadGestionnaires = async () => {
    try {
      setLoading(true);

      const { data: gestionnairesData, error: gestionnairesError } = await supabase
        .from("gestionnaires")
        .select("*")
        .order("nom_societe");

      if (gestionnairesError) throw gestionnairesError;

      const { data: relationsData, error: relationsError } = await supabase
        .from("gestionnaires_residences")
        .select(`
          gestionnaire_id,
          residence_id,
          residences_gestion (
            id,
            nom
          )
        `);

      if (relationsError) throw relationsError;

      const residencesByGestionnaire = {};
      relationsData.forEach(relation => {
        if (!residencesByGestionnaire[relation.gestionnaire_id]) {
          residencesByGestionnaire[relation.gestionnaire_id] = [];
        }
        if (relation.residences_gestion) {
          residencesByGestionnaire[relation.gestionnaire_id].push(relation.residences_gestion);
        }
      });

      setGestionnaireResidences(residencesByGestionnaire);
      setGestionnaires(gestionnairesData || []);
    } catch (error) {
      console.error("Error loading gestionnaires:", error);
      toast.error("Erreur lors du chargement des gestionnaires");
    } finally {
      setLoading(false);
    }
  };

  const filterGestionnaires = () => {
    if (!searchTerm.trim()) {
      setFilteredGestionnaires(gestionnaires);
      return;
    }

    const term = searchTerm.toLowerCase();
    const filtered = gestionnaires.filter(g =>
      g.nom_societe?.toLowerCase().includes(term) ||
      g.contact_principal?.toLowerCase().includes(term) ||
      g.email?.toLowerCase().includes(term) ||
      g.telephone?.includes(term)
    );

    setFilteredGestionnaires(filtered);
  };

  const handleSubmit = async (formData) => {
    try {
      setIsSubmitting(true);

      const gestionnaireData = {
        nom_societe: formData.nom_societe,
        contact_principal: formData.contact_principal || null,
        email: formData.email || null,
        telephone: formData.telephone || null,
        adresse: formData.adresse || null,
      };

      let gestionnaireId;

      if (editingGestionnaire) {
        const { error } = await supabase
          .from("gestionnaires")
          .update(gestionnaireData)
          .eq("id", editingGestionnaire.id);

        if (error) throw error;
        gestionnaireId = editingGestionnaire.id;

        toast.success("Gestionnaire modifié avec succès");
      } else {
        const { data, error } = await supabase
          .from("gestionnaires")
          .insert([gestionnaireData])
          .select()
          .single();

        if (error) throw error;
        gestionnaireId = data.id;

        toast.success("Gestionnaire créé avec succès");
      }

      await supabase
        .from("gestionnaires_residences")
        .delete()
        .eq("gestionnaire_id", gestionnaireId);

      if (formData.residence_ids && formData.residence_ids.length > 0) {
        const relations = formData.residence_ids.map(residenceId => ({
          gestionnaire_id: gestionnaireId,
          residence_id: residenceId
        }));

        const { error: relError } = await supabase
          .from("gestionnaires_residences")
          .insert(relations);

        if (relError) throw relError;
      }

      setShowForm(false);
      setEditingGestionnaire(null);
      loadGestionnaires();
    } catch (error) {
      console.error("Error saving gestionnaire:", error);
      toast.error("Erreur lors de l'enregistrement du gestionnaire");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (gestionnaire) => {
    setEditingGestionnaire(gestionnaire);
    setShowForm(true);
  };

  const handleDelete = async () => {
    if (!deleteDialog.gestionnaire) return;

    try {
      const { error } = await supabase
        .from("gestionnaires")
        .delete()
        .eq("id", deleteDialog.gestionnaire.id);

      if (error) throw error;

      toast.success("Gestionnaire supprimé avec succès");
      setDeleteDialog({ open: false, gestionnaire: null });
      loadGestionnaires();
    } catch (error) {
      console.error("Error deleting gestionnaire:", error);
      toast.error("Erreur lors de la suppression du gestionnaire");
    }
  };

  const openDeleteDialog = (gestionnaire) => {
    setDeleteDialog({ open: true, gestionnaire });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#1E40AF]">Gestionnaires</h1>
          <p className="text-slate-600 mt-1">
            Gérez les gestionnaires de résidences
          </p>
        </div>
        <Button
          onClick={() => {
            setEditingGestionnaire(null);
            setShowForm(true);
          }}
          className="bg-gradient-to-r from-[#1E40AF] to-[#7C3AED] hover:opacity-90"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nouveau gestionnaire
        </Button>
      </div>

      <div className="flex items-center gap-4 bg-white p-4 rounded-lg shadow-sm border border-slate-200">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
          <Input
            placeholder="Rechercher un gestionnaire..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="text-sm text-slate-600">
          {filteredGestionnaires.length} résultat{filteredGestionnaires.length !== 1 ? "s" : ""}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-[#1E40AF]" />
        </div>
      ) : filteredGestionnaires.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-slate-200">
          <Building2 className="w-16 h-16 mx-auto text-slate-300 mb-4" />
          <h3 className="text-lg font-semibold text-slate-900 mb-2">
            {searchTerm ? "Aucun gestionnaire trouvé" : "Aucun gestionnaire"}
          </h3>
          <p className="text-slate-600 mb-4">
            {searchTerm
              ? "Essayez de modifier vos critères de recherche"
              : "Commencez par créer un nouveau gestionnaire"}
          </p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredGestionnaires.map((gestionnaire) => (
            <GestionnaireCard
              key={gestionnaire.id}
              gestionnaire={gestionnaire}
              residences={gestionnaireResidences[gestionnaire.id] || []}
              onEdit={handleEdit}
              onDelete={openDeleteDialog}
            />
          ))}
        </div>
      )}

      {showForm && (
        <GestionnaireForm
          gestionnaire={editingGestionnaire}
          onSubmit={handleSubmit}
          onCancel={() => {
            setShowForm(false);
            setEditingGestionnaire(null);
          }}
          isLoading={isSubmitting}
        />
      )}

      <DeleteConfirmDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ open, gestionnaire: null })}
        onConfirm={handleDelete}
        title="Supprimer le gestionnaire"
        description={`Êtes-vous sûr de vouloir supprimer le gestionnaire "${deleteDialog.gestionnaire?.nom_societe}" ? Cette action est irréversible.`}
      />
    </div>
  );
}
