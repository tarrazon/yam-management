
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { X, Save } from "lucide-react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

export default function LotLMNPForm({ lot, residences, vendeurs, onSubmit, onCancel, isLoading }) {
  const [formData, setFormData] = useState(lot || {
    reference: "",
    type_residence: "etudiante",
    residence_id: "",
    vendeur_id: "",
    partenaire_id: "",
    acquereur_id: "",
    gestionnaire_nom: "",
    gestionnaire_contact: "",
    statut_juridique: "lmnp_existant",
    surface: "",
    typologie: "",
    mobilier_inclus: true,
    etage: "",
    orientation: "",
    prix_net_vendeur: "",
    honoraires: "",
    tva_honoraires: "",
    pourcentage_honoraires: "",
    honoraires_acquereur_ht: "",
    tva_honoraires_acquereur: "",
    prix_fai: "",
    statut: "disponible", // Default for new lots
    description: "",
    rentabilite: "",
    loyer_mensuel: "",
    en_ligne_wordpress: false,
    date_mise_en_ligne: "",
    notes: "",
    date_premier_contact: "",
    date_signature_compromis: "",
    date_signature_acte: "",
    observations_acquereurs: "",
    comptes_rendus_visite: "",
    negociation_en_cours: "",
  });

  const { data: partenaires = [] } = useQuery({
    queryKey: ['partenaires'],
    queryFn: () => base44.entities.Partenaire.list(),
  });

  const { data: acquereurs = [] } = useQuery({
    queryKey: ['acquereurs'],
    queryFn: () => base44.entities.Acquereur.list(),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Nettoyer les données : convertir les strings vides en null pour les champs numériques
    const cleanedData = {
      ...formData,
      surface: formData.surface === "" ? null : Number(formData.surface),
      prix_net_vendeur: formData.prix_net_vendeur === "" ? null : Number(formData.prix_net_vendeur),
      honoraires: formData.honoraires === "" ? null : Number(formData.honoraires),
      tva_honoraires: formData.tva_honoraires === "" ? null : Number(formData.tva_honoraires),
      pourcentage_honoraires: formData.pourcentage_honoraires === "" ? null : Number(formData.pourcentage_honoraires),
      honoraires_acquereur_ht: formData.honoraires_acquereur_ht === "" ? null : Number(formData.honoraires_acquereur_ht),
      tva_honoraires_acquereur: formData.tva_honoraires_acquereur === "" ? null : Number(formData.tva_honoraires_acquereur),
      prix_fai: formData.prix_fai === "" ? null : Number(formData.prix_fai),
      rentabilite: formData.rentabilite === "" ? null : Number(formData.rentabilite),
      loyer_mensuel: formData.loyer_mensuel === "" ? null : Number(formData.loyer_mensuel),
    };

    // Auto-générer la date de prise d'option si le statut passe à "sous_option" et qu'il n'y a pas encore de date
    if (cleanedData.statut === 'sous_option' && !lot?.date_prise_option && !cleanedData.date_prise_option) {
      cleanedData.date_prise_option = new Date().toISOString().split('T')[0];
    }
    
    onSubmit(cleanedData);
  };

  // Calcul automatique du pourcentage d'honoraires
  React.useEffect(() => {
    if (formData.prix_net_vendeur && formData.honoraires) {
      const pourcentage = ((parseFloat(formData.honoraires) / parseFloat(formData.prix_net_vendeur)) * 100).toFixed(2);
      setFormData(prev => ({ ...prev, pourcentage_honoraires: parseFloat(pourcentage) }));
    } else if (formData.pourcentage_honoraires !== "") {
      setFormData(prev => ({ ...prev, pourcentage_honoraires: "" }));
    }
  }, [formData.prix_net_vendeur, formData.honoraires]);

  // Calcul automatique du prix FAI
  React.useEffect(() => {
    if (formData.prix_net_vendeur && formData.honoraires) {
      const prixFAI = parseFloat(formData.prix_net_vendeur) + parseFloat(formData.honoraires);
      setFormData(prev => ({ ...prev, prix_fai: prixFAI }));
    } else if (formData.prix_fai !== "") {
      setFormData(prev => ({ ...prev, prix_fai: "" }));
    }
  }, [formData.prix_net_vendeur, formData.honoraires]);

  // Filtrer les acquéreurs par partenaire
  const filteredAcquereurs = formData.partenaire_id
    ? acquereurs.filter(a => a.partenaire_id === formData.partenaire_id)
    : [];

  // Vérifier si le statut permet la sélection d'un acquéreur
  const canSelectAcquereur = formData.statut !== "disponible";

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="mb-8"
    >
      <Card className="border-none shadow-xl bg-white">
        <CardHeader className="border-b border-slate-100">
          <CardTitle className="text-2xl font-bold text-[#1E40AF]">
            {lot ? "Modifier le lot LMNP" : "Nouveau lot LMNP"}
          </CardTitle>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="p-6">
            <Tabs defaultValue="general" className="w-full">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="general">Général</TabsTrigger>
                <TabsTrigger value="caracteristiques">Caractéristiques</TabsTrigger>
                <TabsTrigger value="financier">Financier</TabsTrigger>
                <TabsTrigger value="suivi">Suivi dossier</TabsTrigger>
                <TabsTrigger value="publication">Publication</TabsTrigger>
              </TabsList>

              <TabsContent value="general" className="space-y-6 mt-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="reference">Référence *</Label>
                    <Input
                      id="reference"
                      value={formData.reference}
                      onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="residence_id">Résidence *</Label>
                    <Select
                      value={formData.residence_id}
                      onValueChange={(value) => setFormData({ ...formData, residence_id: value })}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner une résidence" />
                      </SelectTrigger>
                      <SelectContent>
                        {residences.map((r) => (
                          <SelectItem key={r.id} value={r.id}>{r.nom}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="type_residence">Type de résidence</Label>
                    <Select
                      value={formData.type_residence}
                      onValueChange={(value) => setFormData({ ...formData, type_residence: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="etudiante">Étudiante</SelectItem>
                        <SelectItem value="senior">Senior</SelectItem>
                        <SelectItem value="ehpad">EHPAD</SelectItem>
                        <SelectItem value="tourisme">Tourisme</SelectItem>
                        <SelectItem value="affaires">Affaires</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="statut">Statut</Label>
                    <Select
                      value={formData.statut}
                      onValueChange={(value) => {
                        // Si on passe à "disponible", on réinitialise le partenaire et l'acquéreur
                        if (value === "disponible") {
                          setFormData({ ...formData, statut: value, partenaire_id: "", acquereur_id: "" });
                        } else {
                          setFormData({ ...formData, statut: value });
                        }
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="disponible">Disponible</SelectItem>
                        <SelectItem value="sous_option">Sous option</SelectItem>
                        <SelectItem value="allotement">Allotement</SelectItem>
                        <SelectItem value="reserve">Réservé</SelectItem>
                        <SelectItem value="compromis">Compromis</SelectItem>
                        <SelectItem value="vendu">Vendu</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="vendeur_id">Vendeur</Label>
                    <Select
                      value={formData.vendeur_id}
                      onValueChange={(value) => setFormData({ ...formData, vendeur_id: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un vendeur" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={null}>Aucun</SelectItem>
                        {vendeurs.map((v) => (
                          <SelectItem key={v.id} value={v.id}>
                            {v.type_vendeur === 'entreprise' ? v.nom : `${v.prenom} ${v.nom}`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="partenaire_id">
                      Partenaire apporteur
                      {!canSelectAcquereur && <span className="text-xs text-slate-500 ml-2">(Changez le statut pour activer)</span>}
                    </Label>
                    <Select
                      value={formData.partenaire_id}
                      onValueChange={(value) => {
                        setFormData({ ...formData, partenaire_id: value, acquereur_id: "" });
                      }}
                      disabled={!canSelectAcquereur}
                    >
                      <SelectTrigger className={!canSelectAcquereur ? "opacity-50" : ""}>
                        <SelectValue placeholder={canSelectAcquereur ? "Sélectionner un partenaire" : "Disponible uniquement si statut ≠ Disponible"} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={null}>Aucun</SelectItem>
                        {partenaires.map((p) => (
                          <SelectItem key={p.id} value={p.id}>{p.nom}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="acquereur_id">
                      Acquéreur
                      {!canSelectAcquereur && <span className="text-xs text-slate-500 ml-2">(Changez le statut pour activer)</span>}
                    </Label>
                    <Select
                      value={formData.acquereur_id}
                      onValueChange={(value) => setFormData({ ...formData, acquereur_id: value })}
                      disabled={!canSelectAcquereur || !formData.partenaire_id}
                    >
                      <SelectTrigger className={(!canSelectAcquereur || !formData.partenaire_id) ? "opacity-50" : ""}>
                        <SelectValue placeholder={
                          !canSelectAcquereur
                            ? "Disponible uniquement si statut ≠ Disponible"
                            : formData.partenaire_id
                              ? "Sélectionner un acquéreur"
                              : "Sélectionnez d'abord un partenaire"
                        } />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={null}>Aucun</SelectItem>
                        {filteredAcquereurs.map((a) => (
                          <SelectItem key={a.id} value={a.id}>
                            {a.prenom} {a.nom}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {canSelectAcquereur && formData.partenaire_id && filteredAcquereurs.length === 0 && (
                      <p className="text-xs text-amber-600">
                        Aucun acquéreur associé à ce partenaire
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="statut_juridique">Statut juridique</Label>
                    <Select
                      value={formData.statut_juridique}
                      onValueChange={(value) => setFormData({ ...formData, statut_juridique: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="lmnp_existant">LMNP existant</SelectItem>
                        <SelectItem value="en_bail">En bail</SelectItem>
                        <SelectItem value="libre">Libre</SelectItem>
                        <SelectItem value="revente">Revente</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="gestionnaire_nom">Gestionnaire</Label>
                    <Input
                      id="gestionnaire_nom"
                      value={formData.gestionnaire_nom}
                      onChange={(e) => setFormData({ ...formData, gestionnaire_nom: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={4}
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="caracteristiques" className="space-y-6 mt-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="typologie">Typologie</Label>
                    <Input
                      id="typologie"
                      placeholder="T1, T2, T3..."
                      value={formData.typologie}
                      onChange={(e) => setFormData({ ...formData, typologie: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="surface">Surface (m²)</Label>
                    <Input
                      id="surface"
                      type="number"
                      value={formData.surface}
                      onChange={(e) => setFormData({ ...formData, surface: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="etage">Étage</Label>
                    <Input
                      id="etage"
                      value={formData.etage}
                      onChange={(e) => setFormData({ ...formData, etage: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="orientation">Orientation</Label>
                    <Input
                      id="orientation"
                      value={formData.orientation}
                      onChange={(e) => setFormData({ ...formData, orientation: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="loyer_mensuel">Loyer mensuel (€)</Label>
                    <Input
                      id="loyer_mensuel"
                      type="number"
                      value={formData.loyer_mensuel}
                      onChange={(e) => setFormData({ ...formData, loyer_mensuel: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="rentabilite">Rentabilité (%)</Label>
                    <Input
                      id="rentabilite"
                      type="number"
                      step="0.01"
                      value={formData.rentabilite}
                      onChange={(e) => setFormData({ ...formData, rentabilite: e.target.value })}
                    />
                  </div>

                  <div className="flex items-center space-x-2 md:col-span-2">
                    <Checkbox
                      id="mobilier_inclus"
                      checked={formData.mobilier_inclus}
                      onCheckedChange={(checked) => setFormData({ ...formData, mobilier_inclus: checked })}
                    />
                    <Label htmlFor="mobilier_inclus">Mobilier inclus</Label>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="financier" className="space-y-6 mt-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="prix_net_vendeur">Prix net vendeur (€)</Label>
                    <Input
                      id="prix_net_vendeur"
                      type="number"
                      value={formData.prix_net_vendeur}
                      onChange={(e) => setFormData({ ...formData, prix_net_vendeur: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="honoraires">Honoraires (€)</Label>
                    <Input
                      id="honoraires"
                      type="number"
                      value={formData.honoraires}
                      onChange={(e) => setFormData({ ...formData, honoraires: e.target.value })}
                    />
                  </div>

                  {formData.pourcentage_honoraires && (
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <p className="text-sm text-blue-700">% Honoraires</p>
                      <p className="text-2xl font-bold text-blue-800">{formData.pourcentage_honoraires}%</p>
                    </div>
                  )}

                  {formData.prix_fai && (
                    <div className="p-4 bg-green-50 rounded-lg">
                      <p className="text-sm text-green-700">Prix de vente (net + honoraires)</p>
                      <p className="text-2xl font-bold text-green-800">
                        {parseFloat(formData.prix_fai).toLocaleString('fr-FR')} €
                      </p>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="tva_honoraires">TVA honoraires (€)</Label>
                    <Input
                      id="tva_honoraires"
                      type="number"
                      value={formData.tva_honoraires}
                      onChange={(e) => setFormData({ ...formData, tva_honoraires: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="honoraires_acquereur_ht">Honoraires acquéreur HT (€)</Label>
                    <Input
                      id="honoraires_acquereur_ht"
                      type="number"
                      value={formData.honoraires_acquereur_ht}
                      onChange={(e) => setFormData({ ...formData, honoraires_acquereur_ht: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tva_honoraires_acquereur">TVA honoraires acquéreur (€)</Label>
                    <Input
                      id="tva_honoraires_acquereur"
                      type="number"
                      value={formData.tva_honoraires_acquereur}
                      onChange={(e) => setFormData({ ...formData, tva_honoraires_acquereur: e.target.value })}
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="suivi" className="space-y-6 mt-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="date_premier_contact">Date du premier contact</Label>
                    <Input
                      id="date_premier_contact"
                      type="date"
                      value={formData.date_premier_contact || ''}
                      onChange={(e) => setFormData({ ...formData, date_premier_contact: e.target.value })}
                    />
                  </div>

                  {lot?.date_prise_option && (
                    <div className="space-y-2">
                      <Label>Date de prise d'option</Label>
                      <div className="p-3 bg-slate-100 rounded-lg">
                        <p className="text-sm font-semibold text-slate-700">
                          {new Date(lot.date_prise_option).toLocaleDateString('fr-FR')}
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                          Générée automatiquement lors du passage en "Sous option"
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="date_signature_compromis">Date signature compromis</Label>
                    <Input
                      id="date_signature_compromis"
                      type="date"
                      value={formData.date_signature_compromis || ''}
                      onChange={(e) => setFormData({ ...formData, date_signature_compromis: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="date_signature_acte">Date signature acte authentique</Label>
                    <Input
                      id="date_signature_acte"
                      type="date"
                      value={formData.date_signature_acte || ''}
                      onChange={(e) => setFormData({ ...formData, date_signature_acte: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="observations_acquereurs">Observations acquéreurs</Label>
                    <Textarea
                      id="observations_acquereurs"
                      value={formData.observations_acquereurs || ''}
                      onChange={(e) => setFormData({ ...formData, observations_acquereurs: e.target.value })}
                      rows={4}
                      placeholder="Notes sur les retours et observations de l'acquéreur..."
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="comptes_rendus_visite">Comptes-rendus de visite</Label>
                    <Textarea
                      id="comptes_rendus_visite"
                      value={formData.comptes_rendus_visite || ''}
                      onChange={(e) => setFormData({ ...formData, comptes_rendus_visite: e.target.value })}
                      rows={4}
                      placeholder="Dates et détails des visites effectuées..."
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="negociation_en_cours">Négociation en cours</Label>
                    <Textarea
                      id="negociation_en_cours"
                      value={formData.negociation_en_cours || ''}
                      onChange={(e) => setFormData({ ...formData, negociation_en_cours: e.target.value })}
                      rows={4}
                      placeholder="Offres, contre-offres, points de négociation..."
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="publication" className="space-y-6 mt-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="en_ligne_wordpress"
                      checked={formData.en_ligne_wordpress}
                      onCheckedChange={(checked) => setFormData({ ...formData, en_ligne_wordpress: checked })}
                    />
                    <Label htmlFor="en_ligne_wordpress">Publié sur WordPress</Label>
                  </div>

                  {formData.en_ligne_wordpress && (
                    <div className="space-y-2">
                      <Label htmlFor="date_mise_en_ligne">Date de mise en ligne</Label>
                      <Input
                        id="date_mise_en_ligne"
                        type="date"
                        value={formData.date_mise_en_ligne}
                        onChange={(e) => setFormData({ ...formData, date_mise_en_ligne: e.target.value })}
                      />
                    </div>
                  )}

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="notes">Notes internes</Label>
                    <Textarea
                      id="notes"
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      rows={6}
                    />
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter className="flex justify-end gap-3 border-t border-slate-100 p-6">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isLoading}
            >
              <X className="w-4 h-4 mr-2" />
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-[#F59E0B] hover:bg-[#D97706] text-white"
            >
              <Save className="w-4 h-4 mr-2" />
              Enregistrer
            </Button>
          </CardFooter>
        </form>
      </Card>
    </motion.div>
  );
}
