import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, Save } from "lucide-react";
import { motion } from "framer-motion";

export default function ContactResidenceForm({ contact, residences, onSubmit, onCancel, isLoading }) {
  const [formData, setFormData] = useState(contact || {
    residence_gestion_id: "",
    type_contact: "gestionnaire_site",
    nom: "",
    prenom: "",
    fonction: "",
    telephone: "",
    email: "",
    adresse: "",
    site_web: "",
    societe: "",
    mode_communication: "",
    observations: "",
    reactivite: "bonne",
    qualite_relation: "bonne",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const getTypeContactLabels = () => {
    switch(formData.type_contact) {
      case "gestionnaire_site":
        return {
          fonction: "Fonction (directeur, régisseur, gestionnaire...)",
          societe: "Société gestionnaire",
          observations: "Observations (réactivité, qualité relation, incidents...)"
        };
      case "syndic":
        return {
          fonction: "Contact référent",
          societe: "Nom du syndic (société)",
          observations: "Points de vigilance (retards AG, litiges, travaux prévus...)"
        };
      case "association_copro":
        return {
          fonction: "Rôle (président, référent...)",
          societe: "Association / Organisation",
          observations: "Notes internes (implication, transparence, problèmes connus...)"
        };
      case "mairie":
        return {
          fonction: "Service (urbanisme, logement, tourisme...)",
          societe: "Mairie / Administration",
          observations: "Observations (classement tourisme, projets d'aménagement, PLU...)"
        };
      default:
        return {
          fonction: "Fonction",
          societe: "Société / Organisation",
          observations: "Observations"
        };
    }
  };

  const labels = getTypeContactLabels();

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
            {contact ? "Modifier le contact" : "Nouveau contact résidence"}
          </CardTitle>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="p-6 space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="residence_gestion_id">Résidence *</Label>
                <Select
                  value={formData.residence_gestion_id}
                  onValueChange={(value) => setFormData({ ...formData, residence_gestion_id: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner une résidence" />
                  </SelectTrigger>
                  <SelectContent>
                    {residences.map((residence) => (
                      <SelectItem key={residence.id} value={residence.id}>
                        {residence.nom} - {residence.ville}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="type_contact">Type de contact *</Label>
                <Select
                  value={formData.type_contact}
                  onValueChange={(value) => setFormData({ ...formData, type_contact: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gestionnaire_site">Gestionnaire sur site</SelectItem>
                    <SelectItem value="syndic">Syndic de copropriété</SelectItem>
                    <SelectItem value="association_copro">Association de copropriétaires</SelectItem>
                    <SelectItem value="mairie">Contact mairie</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="nom">Nom / Prénom *</Label>
                <Input
                  id="nom"
                  value={formData.nom}
                  onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="fonction">{labels.fonction}</Label>
                <Input
                  id="fonction"
                  value={formData.fonction}
                  onChange={(e) => setFormData({ ...formData, fonction: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="societe">{labels.societe}</Label>
                <Input
                  id="societe"
                  value={formData.societe}
                  onChange={(e) => setFormData({ ...formData, societe: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="telephone">Téléphone</Label>
                <Input
                  id="telephone"
                  value={formData.telephone}
                  onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="adresse">Adresse</Label>
                <Input
                  id="adresse"
                  value={formData.adresse}
                  onChange={(e) => setFormData({ ...formData, adresse: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="site_web">Site web</Label>
                <Input
                  id="site_web"
                  value={formData.site_web}
                  onChange={(e) => setFormData({ ...formData, site_web: e.target.value })}
                  placeholder="https://..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="mode_communication">Mode de communication privilégié</Label>
                <Input
                  id="mode_communication"
                  value={formData.mode_communication}
                  onChange={(e) => setFormData({ ...formData, mode_communication: e.target.value })}
                  placeholder="Email, Téléphone, Courrier..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="reactivite">Réactivité</Label>
                <Select
                  value={formData.reactivite}
                  onValueChange={(value) => setFormData({ ...formData, reactivite: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="excellente">Excellente</SelectItem>
                    <SelectItem value="bonne">Bonne</SelectItem>
                    <SelectItem value="moyenne">Moyenne</SelectItem>
                    <SelectItem value="faible">Faible</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="qualite_relation">Qualité de la relation</Label>
                <Select
                  value={formData.qualite_relation}
                  onValueChange={(value) => setFormData({ ...formData, qualite_relation: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="excellente">Excellente</SelectItem>
                    <SelectItem value="bonne">Bonne</SelectItem>
                    <SelectItem value="moyenne">Moyenne</SelectItem>
                    <SelectItem value="difficile">Difficile</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="observations">{labels.observations}</Label>
                <Textarea
                  id="observations"
                  value={formData.observations}
                  onChange={(e) => setFormData({ ...formData, observations: e.target.value })}
                  rows={4}
                  placeholder="Observations, points de vigilance, notes..."
                />
              </div>
            </div>
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