
import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, Grid3x3, List, Filter, Download, X } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import LotLMNPCard from "../components/lots-lmnp/LotLMNPCard";
import LotLMNPListItem from "../components/lots-lmnp/LotLMNPListItem";
import LotLMNPForm from "../components/lots-lmnp/LotLMNPForm";
import LotLMNPDetail from "../components/lots-lmnp/LotLMNPDetail";
import PoserOptionDialog from "../components/lots-lmnp/PoserOptionDialog";
import DeleteConfirmDialog from "../components/common/DeleteConfirmDialog";
import { motion, AnimatePresence } from "framer-motion";

export default function LotsLMNP() {
  const [showForm, setShowForm] = useState(false);
  const [editingLot, setEditingLot] = useState(null);
  const [viewingLot, setViewingLot] = useState(null);
  const [deletingLot, setDeletingLot] = useState(null);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("grid");
  const [showFilters, setShowFilters] = useState(false);
  const [lotForOption, setLotForOption] = useState(null);
  const [filters, setFilters] = useState({
    fiscalite: "all",
    region: "all",
    ville: "all",
    type: "all",
    prixMin: 0,
    prixMax: 1000000,
    rentabiliteMin: 0,
  });
  const [error, setError] = useState(null);
  const queryClient = useQueryClient();

  const { data: currentUser } = useQuery({
    queryKey: ['current_user_lots'],
    queryFn: () => base44.auth.me(),
  });

  const { data: lots = [], isLoading, refetch: refetchLots } = useQuery({
    queryKey: ['lots_lmnp'],
    queryFn: () => base44.entities.LotLMNP.list('-created_at'),
    staleTime: 0,
    cacheTime: 0,
  });

  const { data: residences = [] } = useQuery({
    queryKey: ['residences_gestion'],
    queryFn: () => base44.entities.ResidenceGestion.list(),
  });

  const { data: vendeurs = [] } = useQuery({
    queryKey: ['vendeurs'],
    queryFn: () => base44.entities.Vendeur.list(),
  });

  const { data: partenaires = [] } = useQuery({
    queryKey: ['partenaires'],
    queryFn: () => base44.entities.Partenaire.list(),
  });

  const { data: acquereurs = [] } = useQuery({
    queryKey: ['acquereurs'],
    queryFn: () => base44.entities.Acquereur.list(),
  });

  const { data: allOptions = [], refetch: refetchOptions } = useQuery({
    queryKey: ['all_options'],
    queryFn: () => base44.entities.OptionLot.list(),
    staleTime: 0,
    cacheTime: 0,
  });

  React.useEffect(() => {
    refetchLots();
    refetchOptions();
  }, []);

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.LotLMNP.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lots_lmnp'] });
      queryClient.invalidateQueries({ queryKey: ['lots_disponibles'] });
      queryClient.invalidateQueries({ queryKey: ['lots_suivi'] });
      setShowForm(false);
      setEditingLot(null);
      setError(null);
    },
    onError: (error) => {
      console.error("Error creating lot:", error);
      setError(error.message || "Une erreur est survenue lors de la création du lot");
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      // Si le statut passe à "disponible", annuler toutes les options actives sur ce lot
      if (data.statut === 'disponible') {
        const optionsActives = allOptions.filter(o => o.lot_lmnp_id === id && o.statut === 'active');
        for (const option of optionsActives) {
          await base44.entities.OptionLot.update(option.id, { statut: 'annulee' });
        }
      }
      return base44.entities.LotLMNP.update(id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lots_lmnp'] });
      queryClient.invalidateQueries({ queryKey: ['all_options'] });
      queryClient.invalidateQueries({ queryKey: ['lots_disponibles'] });
      queryClient.invalidateQueries({ queryKey: ['lots_suivi'] });
      queryClient.invalidateQueries({ queryKey: ['toutes_mes_options'] });
      queryClient.invalidateQueries({ queryKey: ['all_options_partenaire'] });
      setShowForm(false);
      setEditingLot(null);
      setViewingLot(null);
      setError(null);
    },
    onError: (error) => {
      console.error("Error updating lot:", error);
      setError(error.message || "Une erreur est survenue lors de la modification du lot");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      // Annuler toutes les options actives sur ce lot
      const optionsActives = allOptions.filter(o => o.lot_lmnp_id === id && o.statut === 'active');
      for (const option of optionsActives) {
        await base44.entities.OptionLot.update(option.id, { statut: 'annulee' });
      }

      // Supprimer le lot
      return base44.entities.LotLMNP.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lots_lmnp'] });
      queryClient.invalidateQueries({ queryKey: ['all_options'] });
      queryClient.invalidateQueries({ queryKey: ['lots_disponibles'] });
      queryClient.invalidateQueries({ queryKey: ['lots_suivi'] });
      setDeletingLot(null);
      setViewingLot(null); // Close detail view if lot was deleted from there
      setError(null);
    },
    onError: (error) => {
      console.error("Error deleting lot:", error);
      setError(error.message || "Une erreur est survenue lors de la suppression du lot");
    }
  });

  const createOptionMutation = useMutation({
    mutationFn: (data) => base44.entities.OptionLot.create(data),
    onSuccess: () => {
      queryClient.refetchQueries({ queryKey: ['lots_lmnp'] });
      setLotForOption(null);
      setError(null);
    },
    onError: (error) => {
      console.error("Error creating option:", error);
      setError(error.message || "Une erreur est survenue lors de la pose de l'option");
    },
  });

  const handlePoserOption = async (formData) => {
    // Ne pas vérifier côté client - la contrainte unique en base de données gérera les doublons
    const partenaire = partenaires.find(p => p.id === formData.partenaire_id);
    const acquereur = acquereurs.find(a => a.id === formData.acquereur_id);

    const dateDebut = new Date();
    const dateFin = new Date(dateDebut.getTime() + formData.duree_jours * 24 * 60 * 60 * 1000);

    const optionData = {
      lot_lmnp_id: lotForOption.id,
      partenaire_id: formData.partenaire_id,
      partenaire_nom: partenaire?.nom || '',
      acquereur_id: formData.acquereur_id || null,
      acquereur_nom: acquereur ? `${acquereur.prenom} ${acquereur.nom}` : '',
      lot_reference: lotForOption.reference || '',
      residence_nom: lotForOption.residence_nom || '',
      date_option: dateDebut.toISOString().split('T')[0],
      date_expiration: dateFin.toISOString().split('T')[0],
      statut: 'active',
      pose_par: 'admin',
      user_email: currentUser?.email || '',
    };

    try {
      await createOptionMutation.mutateAsync(optionData);
      await updateMutation.mutateAsync({
        id: lotForOption.id,
        data: {
          statut: 'sous_option',
          date_prise_option: dateDebut.toISOString().split('T')[0],
          partenaire_id: formData.partenaire_id,
          partenaire_nom: partenaire?.nom || "",
          acquereur_id: formData.acquereur_id || null,
          acquereur_nom: acquereur ? `${acquereur.prenom} ${acquereur.nom}` : "",
        }
      });
      alert('Option posée avec succès !');
      setError(null);
    } catch (e) {
      console.error("Error in handlePoserOption:", e);
      const errorMsg = e.message || e.toString();
      if (errorMsg.includes('unique') || errorMsg.includes('duplicate')) {
        alert('Une option est déjà active sur ce lot. Veuillez rafraîchir la page.');
      } else {
        alert(`Erreur lors de la pose de l'option: ${errorMsg}`);
      }
      setError(errorMsg);
    }
  };

  const handleSubmit = (data) => {
    const residence = residences.find(r => r.id === data.residence_id);
    const vendeur = vendeurs.find(v => v.id === data.vendeur_id);
    const partenaire = partenaires.find(p => p.id === data.partenaire_id);
    const acquereur = acquereurs.find(a => a.id === data.acquereur_id);
    
    const enrichedData = {
      ...data,
      residence_nom: residence?.nom || "",
      vendeur_nom: vendeur ? (vendeur.type_vendeur === 'entreprise' ? vendeur.nom : `${vendeur.prenom} ${vendeur.nom}`) : "",
      partenaire_nom: partenaire?.nom || "",
      acquereur_nom: acquereur ? `${acquereur.prenom} ${acquereur.nom}` : "",
    };

    if (editingLot) {
      updateMutation.mutate({ id: editingLot.id, data: enrichedData });
    } else {
      createMutation.mutate(enrichedData);
    }
  };

  const handleEdit = (lot) => {
    setEditingLot(lot);
    setViewingLot(null);
    setShowForm(true);
    setError(null); // Clear any previous errors
  };

  const handleView = (lot) => {
    setViewingLot(lot);
    setShowForm(false);
    setError(null); // Clear any previous errors
  };

  const handleDelete = (lot) => {
    setDeletingLot(lot);
    setError(null); // Clear any previous errors
  };

  const filteredLots = lots
    .filter(l => filter === "all" || l.statut === filter)
    .filter(l => 
      !searchTerm || 
      l.reference?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.residence_nom?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter(l => filters.fiscalite === "all" || l.statut_fiscal === filters.fiscalite)
    .filter(l => {
      if (filters.region === "all") return true;
      const residence = residences.find(r => r.id === l.residence_id);
      return residence?.ville?.toLowerCase().includes(filters.region.toLowerCase());
    })
    .filter(l => {
      if (filters.ville === "all") return true;
      const residence = residences.find(r => r.id === l.residence_id);
      return residence?.ville?.toLowerCase() === filters.ville.toLowerCase();
    })
    .filter(l => filters.type === "all" || l.type_residence === filters.type)
    .filter(l => (l.prix_fai || 0) >= filters.prixMin && (l.prix_fai || 0) <= filters.prixMax)
    .filter(l => (l.rentabilite || 0) >= filters.rentabiliteMin);

  const stats = {
    disponible: lots.filter(l => l.statut === 'disponible').length,
    sous_option: lots.filter(l => l.statut === 'sous_option').length,
    allotement: lots.filter(l => l.statut === 'allotement').length,
    reserve: lots.filter(l => l.statut === 'reserve').length,
    vendu: lots.filter(l => l.statut === 'vendu').length,
  };

  const getResidenceForLot = (lotResidenceId) => {
    return residences.find(r => r.id === lotResidenceId);
  };

  // Export Excel
  const exportToExcel = () => {
    const dataToExport = filteredLots.map(lot => {
      const residence = residences.find(r => r.id === lot.residence_id);
      return {
        "Référence": lot.reference || "",
        "Statut": lot.statut || "",
        "Résidence": lot.residence_nom || "",
        "Ville": residence?.ville || "",
        "Type": lot.type_residence || "",
        "Typologie": lot.typologie || "",
        "Surface (m²)": lot.surface || "",
        "Étage": lot.etage || "",
        "Prix net vendeur (€)": lot.prix_net_vendeur || "",
        "Honoraires (€)": lot.honoraires || "",
        "Prix FAI (€)": lot.prix_fai || "",
        "Loyer mensuel (€)": lot.loyer_mensuel || "",
        "Rentabilité (%)": lot.rentabilite || "",
        "Gestionnaire": lot.gestionnaire_nom || "",
        "Vendeur": lot.vendeur_nom || "",
        "Acquéreur": lot.acquereur_nom || "",
        "Partenaire": lot.partenaire_nom || "",
        "Date création": lot.created_at ? new Date(lot.created_at).toLocaleDateString('fr-FR') : "",
      };
    });

    const headers = Object.keys(dataToExport[0] || {});
    const csvContent = [
      headers.join(';'),
      ...dataToExport.map(row => headers.map(h => row[h]).join(';'))
    ].join('\n');

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `lots_lmnp_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Récupérer les villes uniques
  const villes = [...new Set(residences.map(r => r.ville).filter(Boolean))];

  const optionsForDeletion = deletingLot ? allOptions.filter(o => o.lot_lmnp_id === deletingLot.id && o.statut === 'active').length : 0;

  return (
    <div className="p-6 md:p-8 bg-[#F9FAFB] min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-[#1E40AF] tracking-tight">Lots LMNP</h1>
            <p className="text-slate-500 mt-1">
              {filteredLots.length} lots trouvés · {stats.disponible} disponibles · {stats.sous_option} sous option
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={exportToExcel}
              variant="outline"
              className="border-[#1E40AF] text-[#1E40AF]"
            >
              <Download className="w-4 h-4 mr-2" />
              Export Excel
            </Button>
            <Button
              onClick={() => {
                setShowForm(!showForm);
                setEditingLot(null);
                setError(null);
              }}
              className="bg-[#1E40AF] hover:bg-[#1E3A8A] text-white shadow-lg"
            >
              <Plus className="w-5 h-5 mr-2" />
              Nouveau lot LMNP
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

        {/* Barre de recherche et filtres */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex gap-4 mb-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <Input
                  placeholder="Rechercher un lot..."
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
              <Button
                onClick={() => setShowFilters(!showFilters)}
                variant={showFilters ? "default" : "outline"}
                className={showFilters ? "bg-[#1E40AF]" : ""}
              >
                <Filter className="w-4 h-4 mr-2" />
                Filtres avancés
              </Button>
            </div>

            <Tabs value={filter} onValueChange={setFilter}>
              <TabsList className="bg-white shadow-sm w-full">
                <TabsTrigger value="all">Tous ({lots.length})</TabsTrigger>
                <TabsTrigger value="disponible">Disponibles ({stats.disponible})</TabsTrigger>
                <TabsTrigger value="sous_option">Sous option ({stats.sous_option})</TabsTrigger>
                <TabsTrigger value="reserve">Réservés ({stats.reserve})</TabsTrigger>
                <TabsTrigger value="vendu">Vendus ({stats.vendu})</TabsTrigger>
              </TabsList>
            </Tabs>

            {showFilters && (
              <div className="grid md:grid-cols-3 gap-4 pt-4 border-t mt-4">
                <div className="space-y-2">
                  <Label>Type de résidence</Label>
                  <Select value={filters.type} onValueChange={(v) => setFilters({...filters, type: v})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous types</SelectItem>
                      <SelectItem value="etudiante">Étudiante</SelectItem>
                      <SelectItem value="senior">Senior</SelectItem>
                      <SelectItem value="ehpad">EHPAD</SelectItem>
                      <SelectItem value="tourisme">Tourisme</SelectItem>
                      <SelectItem value="affaires">Affaires</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Ville</Label>
                  <Select value={filters.ville} onValueChange={(v) => setFilters({...filters, ville: v})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Toutes les villes</SelectItem>
                      {villes.map(v => (
                        <SelectItem key={v} value={v}>{v}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Prix maximum: {filters.prixMax.toLocaleString('fr-FR')} €</Label>
                  <Slider
                    value={[filters.prixMax]}
                    onValueChange={([v]) => setFilters({...filters, prixMax: v})}
                    max={1000000}
                    step={10000}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Rentabilité minimum: {filters.rentabiliteMin}%</Label>
                  <Slider
                    value={[filters.rentabiliteMin]}
                    onValueChange={([v]) => setFilters({...filters, rentabiliteMin: v})}
                    max={15}
                    step={0.5}
                  />
                </div>

                <div className="md:col-span-3 flex justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setFilters({
                      fiscalite: "all",
                      region: "all",
                      ville: "all",
                      type: "all",
                      prixMin: 0,
                      prixMax: 1000000,
                      rentabiliteMin: 0,
                    })}
                  >
                    Réinitialiser les filtres
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <AnimatePresence>
          {showForm && (
            <LotLMNPForm
              lot={editingLot}
              residences={residences}
              vendeurs={vendeurs}
              partenaires={partenaires}
              acquereurs={acquereurs}
              onSubmit={handleSubmit}
              onCancel={() => {
                setShowForm(false);
                setEditingLot(null);
                setError(null);
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
        ) : filteredLots.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-slate-400 text-lg">
              {searchTerm ? "Aucun lot trouvé" : "Aucun lot pour le moment"}
            </p>
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {filteredLots.map((lot) => (
                <LotLMNPCard
                  key={lot.id}
                  lot={lot}
                  onEdit={handleEdit}
                  onView={handleView}
                  onDelete={handleDelete}
                  onPoserOption={lot.statut === 'disponible' ? () => setLotForOption(lot) : null}
                />
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {filteredLots.map((lot) => (
                <LotLMNPListItem
                  key={lot.id}
                  lot={lot}
                  onEdit={handleEdit}
                  onView={handleView}
                  onDelete={handleDelete}
                  onPoserOption={lot.statut === 'disponible' ? () => setLotForOption(lot) : null}
                />
              ))}
            </AnimatePresence>
          </div>
        )}

        <AnimatePresence>
          {viewingLot && (
            <LotLMNPDetail
              lot={viewingLot}
              residence={getResidenceForLot(viewingLot.residence_id)}
              onClose={() => {
                setViewingLot(null);
                setError(null);
              }}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          )}
        </AnimatePresence>

        {/* Dialog pour poser une option (Admin) */}
        {lotForOption && (
          <PoserOptionDialog
            lot={lotForOption}
            partenaires={partenaires}
            acquereurs={acquereurs}
            onSubmit={handlePoserOption}
            onCancel={() => {
              setLotForOption(null);
              setError(null);
            }}
            isAdmin={true}
          />
        )}

        <DeleteConfirmDialog
          open={!!deletingLot}
          onOpenChange={(open) => {
            if (!open) setDeletingLot(null);
            setError(null);
          }}
          onConfirm={() => deleteMutation.mutate(deletingLot.id)}
          title="Supprimer ce lot ?"
          description="Cette action supprimera définitivement le lot de la base de données."
          itemName={deletingLot ? `Lot ${deletingLot.reference} - ${deletingLot.residence_nom}` : ""}
          warningMessage={optionsForDeletion > 0 ? `⚠️ ${optionsForDeletion} option(s) active(s) seront annulées.` : null}
          isDeleting={deleteMutation.isPending}
        />
      </div>
    </div>
  );
}
