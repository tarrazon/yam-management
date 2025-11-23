
import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, Grid3x3, List, Download, Calendar, X } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PartenaireCard from "../components/partenaires/PartenaireCard";
import PartenaireListItem from "../components/partenaires/PartenaireListItem";
import PartenaireForm from "../components/partenaires/PartenaireForm";
import PartenaireDetail from "../components/partenaires/PartenaireDetail";
import PartenaireTypeFilter from "../components/partenaires/PartenaireTypeFilter";
import { motion, AnimatePresence } from "framer-motion";
import DeleteConfirmDialog from "../components/common/DeleteConfirmDialog";
import { flattenPartenaireTypes } from "@/utils/partenaireTypes";

export default function PartenairesPage() {
  const [showForm, setShowForm] = useState(false);
  const [editingPartenaire, setEditingPartenaire] = useState(null);
  const [viewingPartenaire, setViewingPartenaire] = useState(null);
  const [deletingPartenaire, setDeletingPartenaire] = useState(null);
  const [filter, setFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState([]);
  const [dateDebut, setDateDebut] = useState("");
  const [dateFin, setDateFin] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("grid");
  const [error, setError] = useState(null);
  const queryClient = useQueryClient();

  const { data: currentUser } = useQuery({
    queryKey: ['current_user'],
    queryFn: () => base44.auth.me(),
  });

  const { data: partenaires = [], isLoading } = useQuery({
    queryKey: ['partenaires'],
    queryFn: () => base44.entities.Partenaire.list('-created_at'),
  });

  const { data: acquereurs = [] } = useQuery({
    queryKey: ['acquereurs'],
    queryFn: () => base44.entities.Acquereur.list(),
  });

  const { data: lots = [] } = useQuery({
    queryKey: ['lots_lmnp'],
    queryFn: () => base44.entities.LotLMNP.list(),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Partenaire.create(data),
    onSuccess: () => {
      queryClient.refetchQueries({ queryKey: ['partenaires'] });
      setShowForm(false);
      setEditingPartenaire(null);
      setError(null);
    },
    onError: (error) => {
      console.error("Error creating partenaire:", error);
      setError(error.message || "Une erreur est survenue lors de la création du partenaire");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Partenaire.update(id, data),
    onSuccess: () => {
      queryClient.refetchQueries({ queryKey: ['partenaires'] });
      setShowForm(false);
      setEditingPartenaire(null);
      setViewingPartenaire(null);
      setError(null);
    },
    onError: (error) => {
      console.error("Error updating partenaire:", error);
      setError(error.message || "Une erreur est survenue lors de la modification du partenaire");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      // Dissocier les acquéreurs où ce partenaire est associé
      const acquereursAssocies = acquereurs.filter(a => a.partenaire_id === id);
      for (const acquereur of acquereursAssocies) {
        await base44.entities.Acquereur.update(acquereur.id, { partenaire_id: null, partenaire_nom: "" });
      }
      
      // Dissocier les lots où ce partenaire est associé
      const lotsAssocies = lots.filter(l => l.partenaire_id === id);
      for (const lot of lotsAssocies) {
        await base44.entities.LotLMNP.update(lot.id, { partenaire_id: null, partenaire_nom: "" });
      }
      
      // Supprimer le partenaire
      return base44.entities.Partenaire.delete(id);
    },
    onSuccess: async () => {
      queryClient.refetchQueries({ queryKey: ['partenaires'] });
      queryClient.refetchQueries({ queryKey: ['acquereurs'] });
      queryClient.refetchQueries({ queryKey: ['lots_lmnp'] });
      setDeletingPartenaire(null);
      setViewingPartenaire(null);
      setError(null);
    },
    onError: (error) => {
      console.error("Error deleting partenaire:", error);
      setError(error.message || "Une erreur est survenue lors de la suppression du partenaire");
    },
  });

  const handleSubmit = (data) => {
    if (editingPartenaire) {
      updateMutation.mutate({ id: editingPartenaire.id, data });
    } else {
      // Ajouter l'email de l'utilisateur qui crée le partenaire
      const dataWithCreator = {
        ...data,
        created_by: userEmail
      };
      createMutation.mutate(dataWithCreator);
    }
  };

  const handleEdit = (partenaire) => {
    setEditingPartenaire(partenaire);
    setViewingPartenaire(null);
    setShowForm(true);
  };

  const handleView = (partenaire) => {
    setViewingPartenaire(partenaire);
    setShowForm(false);
  };

  const handleDelete = (partenaire) => {
    setDeletingPartenaire(partenaire);
  };

  // Filtrer selon le rôle de l'utilisateur
  const userRole = currentUser?.role_custom || 'admin';
  const userEmail = currentUser?.email;

  const filteredPartenaires = partenaires
    .filter(p => {
      // Si commercial, ne voir que ses propres partenaires
      if (userRole === 'commercial') {
        return p.created_by === userEmail;
      }
      return true;
    })
    .filter(p => filter === "all" || p.statut === filter)
    .filter(p => {
      // Filtrage par type : multi-sélection
      if (typeFilter.length === 0) return true;

      const partenaireFlattened = flattenPartenaireTypes(p.type_partenaire);

      // Vérifier si le partenaire a au moins un des types sélectionnés
      return typeFilter.some(selectedType =>
        partenaireFlattened.some(pType => pType.startsWith(selectedType))
      );
    })
    .filter(p => {
      if (!dateDebut && !dateFin) return true;
      const datePartenaire = p.date_convention || p.created_at;
      if (!datePartenaire) return false;

      const date = new Date(datePartenaire);
      if (dateDebut && date < new Date(dateDebut)) return false;
      if (dateFin && date > new Date(dateFin)) return false;
      return true;
    })
    .filter(p =>
      !searchTerm ||
      p.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

  const exportToExcel = () => {
    // Préparer les données avec stats calculées
    const dataToExport = filteredPartenaires.map(p => {
      const nombreLeads = acquereurs.filter(a => a.partenaire_id === p.id).length;
      const lotsVendus = lots.filter(l => l.partenaire_id === p.id && l.statut === 'vendu');
      const nombreVentes = lotsVendus.length;
      const caGenere = lotsVendus.reduce((sum, lot) => sum + (lot.prix_fai || 0), 0);
      const commissionTotale = lotsVendus.reduce((sum, lot) => sum + (lot.commission_partenaire || 0), 0);

      return {
        "Nom": p.nom || "",
        "Type": p.type_partenaire || "",
        "Statut": p.statut || "",
        "Contact principal": p.contact_principal || "",
        "Email": p.email || "",
        "Téléphone": p.telephone || "",
        "Adresse": p.adresse || "",
        "Zone d'activité": p.zone_activite || "",
        "Spécialité": p.specialite || "",
        "Convention signée": p.convention_signee ? "Oui" : "Non",
        "Date convention": p.date_convention || "",
        "Taux rétrocession (%)": p.taux_retrocession || "",
        "Volume annuel attendu (€)": p.volume_annuel_attendu || "",
        "Conditions commerciales": p.conditions_commerciales || "",
        "Leads apportés (calculé)": nombreLeads,
        "Ventes réalisées (calculé)": nombreVentes,
        "CA généré (calculé)": caGenere,
        "Commissions totales (calculé)": commissionTotale,
        "Notes": p.notes || "",
        "Date de création": p.created_at ? new Date(p.created_at).toLocaleDateString('fr-FR') : "",
        "Dernière modification": p.updated_at ? new Date(p.updated_at).toLocaleDateString('fr-FR') : "",
      };
    });

    // Créer le CSV
    const headers = Object.keys(dataToExport[0] || {});
    const csvContent = [
      headers.join(';'),
      ...dataToExport.map(row =>
        headers.map(header => {
          const value = row[header];
          return typeof value === 'string' && value.includes(';') ? `"${value}"` : value;
        }).join(';')
      )
    ].join('\n');

    // Télécharger le fichier
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `partenaires_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const stats = {
    actif: partenaires.filter(p => p.statut === 'actif').length,
    inactif: partenaires.filter(p => p.statut === 'inactif').length,
    a_relancer: partenaires.filter(p => p.statut === 'a_relancer').length,
  };

  const acquereursForDeletion = deletingPartenaire ? acquereurs.filter(a => a.partenaire_id === deletingPartenaire.id).length : 0;
  const lotsForDeletion = deletingPartenaire ? lots.filter(l => l.partenaire_id === deletingPartenaire.id).length : 0;

  return (
    <div className="p-6 md:p-8 bg-[#F9FAFB] min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-[#1E40AF] tracking-tight">Partenaires</h1>
            <p className="text-slate-500 mt-1">
              {stats.actif} actifs · {stats.a_relancer} à relancer · {stats.inactif} inactifs
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={exportToExcel}
              variant="outline"
              className="border-[#1E40AF] text-[#1E40AF] hover:bg-[#1E40AF] hover:text-white"
            >
              <Download className="w-4 h-4 mr-2" />
              Export Excel
            </Button>
            <Button
              onClick={() => {
                setShowForm(!showForm);
                setEditingPartenaire(null);
                setError(null); // Clear error when opening new form
              }}
              className="bg-[#1E40AF] hover:bg-[#1E3A8A] text-white shadow-lg"
            >
              <Plus className="w-5 h-5 mr-2" />
              Nouveau partenaire
            </Button>
          </div>
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

        <div className="flex flex-col gap-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
            <Input
              placeholder="Rechercher un partenaire..."
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
                <TabsTrigger value="all">Tous ({partenaires.length})</TabsTrigger>
                <TabsTrigger value="actif">Actifs ({stats.actif})</TabsTrigger>
                <TabsTrigger value="a_relancer">À relancer ({stats.a_relancer})</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Filtres avancés */}
          <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200">
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="w-4 h-4 text-[#F59E0B]" />
              <h3 className="font-semibold text-slate-700">Filtres avancés</h3>
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type_filter" className="text-sm">Type de partenaire</Label>
                <PartenaireTypeFilter
                  value={typeFilter}
                  onChange={setTypeFilter}
                />
              </div>
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
            {(typeFilter.length > 0 || dateDebut || dateFin) && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setTypeFilter([]);
                  setDateDebut("");
                  setDateFin("");
                }}
                className="mt-3"
              >
                Réinitialiser les filtres
              </Button>
            )}
          </div>
        </div>

        <AnimatePresence>
          {showForm && (
            <PartenaireForm
              partenaire={editingPartenaire}
              onSubmit={handleSubmit}
              onCancel={() => {
                setShowForm(false);
                setEditingPartenaire(null);
                setError(null);
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
        ) : filteredPartenaires.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-slate-400 text-lg">
              {searchTerm ? "Aucun partenaire trouvé" : "Aucun partenaire pour le moment"}
            </p>
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {filteredPartenaires.map((partenaire) => (
                <PartenaireCard
                  key={partenaire.id}
                  partenaire={partenaire}
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
              {filteredPartenaires.map((partenaire) => (
                <PartenaireListItem
                  key={partenaire.id}
                  partenaire={partenaire}
                  onEdit={handleEdit}
                  onView={handleView}
                  onDelete={handleDelete}
                />
              ))}
            </AnimatePresence>
          </div>
        )}

        <AnimatePresence>
          {viewingPartenaire && (
            <PartenaireDetail
              partenaire={viewingPartenaire}
              onClose={() => setViewingPartenaire(null)}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          )}
        </AnimatePresence>

        <DeleteConfirmDialog
          open={!!deletingPartenaire}
          onOpenChange={() => setDeletingPartenaire(null)}
          onConfirm={() => deletingPartenaire && deleteMutation.mutate(deletingPartenaire.id)}
          title="Supprimer ce partenaire ?"
          description="Cette action supprimera définitivement le partenaire de la base de données."
          itemName={deletingPartenaire?.nom}
          warningMessage={`⚠️ ${acquereursForDeletion} acquéreur(s) et ${lotsForDeletion} lot(s) sont associés à ce partenaire. Ils ne seront pas supprimés, mais la référence au partenaire sera retirée.`}
          isDeleting={deleteMutation.isPending}
        />
      </div>
    </div>
  );
}
