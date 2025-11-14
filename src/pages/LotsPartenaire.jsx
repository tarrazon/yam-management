import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Search, Filter, Download, Grid3x3, List } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { motion, AnimatePresence } from "framer-motion";
import LotLMNPCard from "../components/lots-lmnp/LotLMNPCard";
import LotLMNPListItem from "../components/lots-lmnp/LotLMNPListItem";
import LotLMNPDetail from "../components/lots-lmnp/LotLMNPDetail";
import PoserOptionPartenaireDialog from "../components/lots-lmnp/PoserOptionPartenaireDialog";

export default function LotsPartenaire() {
  const [currentUser, setCurrentUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("grid");
  const [viewingLot, setViewingLot] = useState(null);
  const [lotForOption, setLotForOption] = useState(null);
  const [filters, setFilters] = useState({
    fiscalite: "all",
    region: "all",
    ville: "all",
    type: "all",
    prixMin: 0,
    prixMax: 1000000,
    rentabiliteMin: 0,
    residence_id: "all",
  });
  const [showFilters, setShowFilters] = useState(false);

  const queryClient = useQueryClient();

  const { data: lots = [], refetch: refetchLots } = useQuery({
    queryKey: ['lots_disponibles'],
    queryFn: () => base44.entities.LotLMNP.list(),
    staleTime: 0,
    cacheTime: 0,
  });

  const { data: residences = [] } = useQuery({
    queryKey: ['residences'],
    queryFn: () => base44.entities.ResidenceGestion.list(),
  });

  const { data: partenaire } = useQuery({
    queryKey: ['mon_partenaire', currentUser?.partenaire_id],
    queryFn: () => base44.entities.Partenaire.filter({ id: currentUser?.partenaire_id }).then(res => res[0]),
    enabled: !!currentUser?.partenaire_id,
  });

  const { data: mesOptions = [] } = useQuery({
    queryKey: ['mes_options_partenaire'],
    queryFn: () => base44.entities.OptionLot.filter({ partenaire_id: currentUser?.partenaire_id }),
    enabled: !!currentUser?.partenaire_id,
  });

  const { data: allOptions = [], refetch: refetchAllOptions } = useQuery({
    queryKey: ['all_options_partenaire'],
    queryFn: () => base44.entities.OptionLot.list(),
    staleTime: 0,
    cacheTime: 0,
  });

  const { data: mesAcquereurs = [] } = useQuery({
    queryKey: ['mes_acquereurs_select'],
    queryFn: () => base44.entities.Acquereur.filter({ partenaire_id: currentUser?.partenaire_id }),
    enabled: !!currentUser?.partenaire_id,
  });

  useEffect(() => {
    base44.auth.me().then(setCurrentUser);

    // Vérifier s'il y a un filtre de résidence dans l'URL
    const urlParams = new URLSearchParams(window.location.search);
    const residenceId = urlParams.get('residence_id');
    if (residenceId) {
      setFilters(prev => ({ ...prev, residence_id: residenceId }));
    }
  }, []);

  useEffect(() => {
    if (refetchLots && refetchAllOptions) {
      refetchLots();
      refetchAllOptions();
    }
  }, [currentUser]);

  const createOptionMutation = useMutation({
    mutationFn: (data) => base44.entities.OptionLot.create(data),
    onSuccess: () => {
      // Invalider TOUS les caches liés aux options et lots
      queryClient.invalidateQueries({ queryKey: ['mes_options_partenaire'] });
      queryClient.invalidateQueries({ queryKey: ['lots_disponibles'] });
      queryClient.invalidateQueries({ queryKey: ['all_options_partenaire'] });
      queryClient.invalidateQueries({ queryKey: ['lots_lmnp'] });
      queryClient.invalidateQueries({ queryKey: ['all_options'] });
      queryClient.invalidateQueries({ queryKey: ['toutes_mes_options'] });
      queryClient.invalidateQueries({ queryKey: ['lots_suivi'] });
    },
  });

  const updateLotMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.LotLMNP.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lots_disponibles'] });
      queryClient.invalidateQueries({ queryKey: ['lots_lmnp'] });
      queryClient.invalidateQueries({ queryKey: ['lots_suivi'] });
    },
  });

  const handlePoserOption = async (lot, acquereurId) => {
    try {
      // Vérifier s'il existe déjà une option active sur ce lot
      const optionActiveExistante = allOptions.find(
        o => o.lot_lmnp_id === lot.id && o.statut === 'active'
      );

      if (optionActiveExistante) {
        alert('Une option est déjà active sur ce lot.');
        setLotForOption(null);
        return;
      }

      const optionsActives = mesOptions.filter(o => {
        const lotOption = lots.find(l => l.id === o.lot_lmnp_id);
        return o.statut === 'active' && lotOption?.statut === 'sous_option';
      }).length;
      const optionsMax = partenaire?.options_max || 3;

      if (optionsActives >= optionsMax) {
        alert(`Vous avez atteint votre limite de ${optionsMax} options simultanées.`);
        setLotForOption(null);
        return;
      }

      const dureeJours = partenaire?.duree_option_jours || 5;
      const dateDebut = new Date();
      const dateFin = new Date(dateDebut.getTime() + dureeJours * 24 * 60 * 60 * 1000);

      const acquereur = mesAcquereurs.find(a => a.id === acquereurId);

      const optionData = {
        lot_lmnp_id: lot.id,
        partenaire_id: currentUser.partenaire_id,
        partenaire_nom: partenaire?.nom || '',
        acquereur_id: acquereurId,
        acquereur_nom: acquereur ? `${acquereur.prenom} ${acquereur.nom}` : '',
        lot_reference: lot.reference || '',
        residence_nom: lot.residence_nom || '',
        date_option: dateDebut.toISOString().split('T')[0],
        date_expiration: dateFin.toISOString().split('T')[0],
        statut: 'active',
        pose_par: 'partenaire',
        user_email: currentUser?.email || '',
      };

      await createOptionMutation.mutateAsync(optionData);
      await updateLotMutation.mutateAsync({
        id: lot.id,
        data: {
          statut: 'sous_option',
          date_prise_option: dateDebut.toISOString().split('T')[0],
          partenaire_id: currentUser.partenaire_id,
          acquereur_id: acquereurId,
          acquereur_nom: acquereur ? `${acquereur.prenom} ${acquereur.nom}` : '',
        }
      });

      try {
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

        await fetch(`${supabaseUrl}/functions/v1/send-option-notification`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${supabaseAnonKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            partenaire_nom: partenaire?.nom || '',
            partenaire_prenom: partenaire?.prenom || '',
            lot_numero: lot.reference || '',
            residence_nom: lot.residence_nom || '',
            acquereur_nom: acquereur?.nom || '',
            acquereur_prenom: acquereur?.prenom || '',
            date_debut: dateDebut.toISOString(),
            date_fin: dateFin.toISOString(),
          }),
        });
      } catch (error) {
        console.error('Erreur lors de l\'envoi des notifications:', error);
      }

      await queryClient.refetchQueries({ queryKey: ['lots_disponibles'] });
      await queryClient.refetchQueries({ queryKey: ['mes_options_partenaire'] });
      await queryClient.refetchQueries({ queryKey: ['all_options_partenaire'] });

      setLotForOption(null);
      alert('Option posée avec succès ! Le lot est maintenant sous option.');
    } catch (error) {
      console.error('Erreur lors de la prise d\'option:', error);
      alert('Erreur lors de la prise d\'option. Veuillez réessayer.');
      setLotForOption(null);
    }
  };

  // Filtrage
  const filteredLots = lots
    .filter(l => l.statut === 'disponible')
    .filter(l => {
      // Exclure les lots qui ont une option active
      const hasActiveOption = allOptions.some(opt => opt.lot_lmnp_id === l.id && opt.statut === 'active');
      return !hasActiveOption;
    })
    .filter(l => !searchTerm || l.reference?.toLowerCase().includes(searchTerm.toLowerCase()) || l.residence_nom?.toLowerCase().includes(searchTerm.toLowerCase()))
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
    .filter(l => (l.rentabilite || 0) >= filters.rentabiliteMin)
    .filter(l => filters.residence_id === "all" || l.residence_id === filters.residence_id);

  // Export Excel avec commission
  const exportToExcel = () => {
    const tauxRetrocession = partenaire?.taux_retrocession || 0;
    const dataToExport = filteredLots.map(lot => {
      const residence = residences.find(r => r.id === lot.residence_id);
      const commission = lot.commission_partenaire || (lot.honoraires ? (lot.honoraires * tauxRetrocession / 100) : 0);
      return {
        "Référence": lot.reference || "",
        "Résidence": lot.residence_nom || "",
        "Ville": residence?.ville || "",
        "Type": lot.type_residence || "",
        "Typologie": lot.typologie || "",
        "Surface (m²)": lot.surface || "",
        "Prix FAI (€)": lot.prix_fai || "",
        "Honoraires (€)": lot.honoraires || "",
        "Ma Commission (€)": commission.toFixed(2),
        "Loyer mensuel (€)": lot.loyer_mensuel || "",
        "Rentabilité (%)": lot.rentabilite || "",
        "Statut": lot.statut || "",
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
    link.setAttribute('download', `lots_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Récupérer les villes uniques
  const villes = [...new Set(residences.map(r => r.ville).filter(Boolean))];

  const getResidenceForLot = (lotResidenceId) => {
    return residences.find(r => r.id === lotResidenceId);
  };

  const handleView = (lot) => {
    setViewingLot(lot);
  };

  // Enrichir les lots avec la commission
  const lotsWithCommission = filteredLots.map(lot => {
    const tauxRetrocession = partenaire?.taux_retrocession || 0;
    const commission = lot.commission_partenaire || (lot.honoraires ? (lot.honoraires * tauxRetrocession / 100) : 0);
    return { ...lot, commission_calculee: commission };
  });

  return (
    <div className="p-6 md:p-8 bg-[#F9FAFB] min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[#1E40AF]">Lots disponibles</h1>
            <p className="text-slate-500 mt-1">
              {filteredLots.length} lots trouvés · Taux de rétrocession: {partenaire?.taux_retrocession || 0}%
            </p>
          </div>
          <Button onClick={exportToExcel} variant="outline" className="border-[#1E40AF] text-[#1E40AF]">
            <Download className="w-4 h-4 mr-2" />
            Export Excel
          </Button>
        </div>

        {/* Barre de recherche et filtres */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex gap-4 mb-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <Input
                  placeholder="Rechercher par référence ou résidence..."
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
                Filtres
              </Button>
            </div>

            {showFilters && (
              <div className="grid md:grid-cols-3 gap-4 pt-4 border-t">
                <div className="space-y-2">
                  <Label>Résidence</Label>
                  <Select value={filters.residence_id} onValueChange={(v) => setFilters({...filters, residence_id: v})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Toutes les résidences</SelectItem>
                      {residences.map(r => (
                        <SelectItem key={r.id} value={r.id}>{r.nom}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

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

                <div className="md:col-span-3 flex justify-end">
                  <Button
                    variant="outline"
                    onClick={() => setFilters({
                      fiscalite: "all",
                      region: "all",
                      ville: "all",
                      type: "all",
                      prixMin: 0,
                      prixMax: 1000000,
                      rentabiliteMin: 0,
                      residence_id: "all",
                    })}
                  >
                    Réinitialiser les filtres
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Liste des lots avec miniatures */}
        {lotsWithCommission.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-slate-400 text-lg">Aucun lot trouvé avec ces critères</p>
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {lotsWithCommission.map((lot) => {
                const aMonOption = mesOptions.some(o => o.lot_lmnp_id === lot.id && o.statut === 'active');
                const canPoserOption = !aMonOption && lot.statut === 'disponible';
                console.log(`Lot ${lot.reference}: statut=${lot.statut}, aMonOption=${aMonOption}, canPoserOption=${canPoserOption}`);
                return (
                  <LotLMNPCard
                    key={lot.id}
                    lot={lot}
                    onEdit={null}
                    onView={handleView}
                    onPoserOption={canPoserOption ? () => {
                      console.log('Opening dialog for lot:', lot.reference);
                      setLotForOption(lot);
                    } : null}
                    showCommission={true}
                    commission={lot.commission_calculee}
                    hidePartenaireAcquereur={true}
                  />
                );
              })}
            </AnimatePresence>
          </div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {lotsWithCommission.map((lot) => {
                const aMonOption = mesOptions.some(o => o.lot_lmnp_id === lot.id && o.statut === 'active');
                const canPoserOption = !aMonOption && lot.statut === 'disponible';
                return (
                  <LotLMNPListItem
                    key={lot.id}
                    lot={lot}
                    onEdit={null}
                    onView={handleView}
                    onPoserOption={canPoserOption ? () => {
                      console.log('Opening dialog for lot:', lot.reference);
                      setLotForOption(lot);
                    } : null}
                    showCommission={true}
                    commission={lot.commission_calculee}
                    hidePartenaireAcquereur={true}
                  />
                );
              })}
            </AnimatePresence>
          </div>
        )}

        {/* Détail du lot */}
        <AnimatePresence>
          {viewingLot && (
            <LotLMNPDetail
              lot={viewingLot}
              residence={getResidenceForLot(viewingLot.residence_id)}
              onClose={() => setViewingLot(null)}
              onEdit={null}
            />
          )}
        </AnimatePresence>

        {/* Dialog pour poser une option */}
        {lotForOption && currentUser && (
          <PoserOptionPartenaireDialog
            lot={lotForOption}
            mesAcquereurs={mesAcquereurs}
            optionsActives={mesOptions.filter(o => {
              const lotOption = lots.find(l => l.id === o.lot_lmnp_id);
              return o.statut === 'active' && lotOption?.statut === 'sous_option';
            }).length}
            optionsMax={partenaire?.options_max || 3}
            dureeJours={partenaire?.duree_option_jours || 5}
            onSubmit={handlePoserOption}
            onCancel={() => {
              setLotForOption(null);
            }}
          />
        )}
      </div>
    </div>
  );
}