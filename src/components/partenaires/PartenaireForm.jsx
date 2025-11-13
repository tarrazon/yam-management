
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { X, Save } from "lucide-react";
import { motion } from "framer-motion";

export default function PartenaireForm({ partenaire, onSubmit, onCancel, isLoading }) {
  const [formData, setFormData] = useState(partenaire || {
    nom: "",
    contact_principal: "",
    email: "",
    telephone: "",
    adresse: "",
    type_partenaire: "cgp",
    zone_activite: "",
    specialite: "",
    convention_signee: false,
    date_convention: "",
    conditions_commerciales: "",
    taux_retrocession: "",
    volume_annuel_attendu: "",
    statut: "actif",
    notes: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Nettoyer les données : convertir les strings vides en null pour les champs numériques
    const cleanedData = {
      ...formData,
      taux_retrocession: formData.taux_retrocession ? Number(formData.taux_retrocession) : null,
      volume_annuel_attendu: formData.volume_annuel_attendu ? Number(formData.volume_annuel_attendu) : null,
    };
    
    onSubmit(cleanedData);
  };

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
            {partenaire ? "Modifier le partenaire" : "Nouveau partenaire"}
          </CardTitle>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="p-6">
            <Tabs defaultValue="general" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="general">Général</TabsTrigger>
                <TabsTrigger value="commercial">Commercial</TabsTrigger>
              </TabsList>

              <TabsContent value="general" className="space-y-6 mt-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="nom">Nom du partenaire ou société *</Label>
                    <Input
                      id="nom"
                      value={formData.nom}
                      onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="type_partenaire">Type de partenaire *</Label>
                    <Select
                      value={formData.type_partenaire}
                      onValueChange={(value) => setFormData({ ...formData, type_partenaire: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cgp">CGP</SelectItem>
                        <SelectItem value="plateforme">Plateforme</SelectItem>
                        <SelectItem value="courtier">Courtier</SelectItem>
                        <SelectItem value="notaire">Notaire</SelectItem>
                        <SelectItem value="diffuseur_web">Diffuseur Web</SelectItem>
                        <SelectItem value="autre">Autre</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="statut">Statut</Label>
                    <Select
                      value={formData.statut}
                      onValueChange={(value) => setFormData({ ...formData, statut: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="actif">Actif</SelectItem>
                        <SelectItem value="inactif">Inactif</SelectItem>
                        <SelectItem value="a_relancer">À relancer</SelectItem>
                        <SelectItem value="suspendu">Suspendu</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contact_principal">Contact principal</Label>
                    <Input
                      id="contact_principal"
                      value={formData.contact_principal}
                      onChange={(e) => setFormData({ ...formData, contact_principal: e.target.value })}
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

                  <div className="space-y-2">
                    <Label htmlFor="telephone">Téléphone</Label>
                    <Input
                      id="telephone"
                      value={formData.telephone}
                      onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
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
                    <Label htmlFor="zone_activite">Zone d'activité</Label>
                    <Input
                      id="zone_activite"
                      value={formData.zone_activite}
                      onChange={(e) => setFormData({ ...formData, zone_activite: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="specialite">Spécialité</Label>
                    <Input
                      id="specialite"
                      value={formData.specialite}
                      onChange={(e) => setFormData({ ...formData, specialite: e.target.value })}
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="commercial" className="space-y-6 mt-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="flex items-center space-x-2 md:col-span-2">
                    <Checkbox
                      id="convention_signee"
                      checked={formData.convention_signee}
                      onCheckedChange={(checked) => setFormData({ ...formData, convention_signee: checked })}
                    />
                    <Label htmlFor="convention_signee">Convention signée</Label>
                  </div>

                  {formData.convention_signee && (
                    <div className="space-y-2">
                      <Label htmlFor="date_convention">Date de signature</Label>
                      <Input
                        id="date_convention"
                        type="date"
                        value={formData.date_convention}
                        onChange={(e) => setFormData({ ...formData, date_convention: e.target.value })}
                      />
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="taux_retrocession">Taux de rétrocession (%)</Label>
                    <Input
                      id="taux_retrocession"
                      type="number"
                      step="0.01"
                      value={formData.taux_retrocession}
                      onChange={(e) => setFormData({ ...formData, taux_retrocession: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="volume_annuel_attendu">Volume annuel attendu (€)</Label>
                    <Input
                      id="volume_annuel_attendu"
                      type="number"
                      value={formData.volume_annuel_attendu}
                      onChange={(e) => setFormData({ ...formData, volume_annuel_attendu: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="conditions_commerciales">Conditions commerciales</Label>
                    <Textarea
                      id="conditions_commerciales"
                      value={formData.conditions_commerciales}
                      onChange={(e) => setFormData({ ...formData, conditions_commerciales: e.target.value })}
                      rows={4}
                    />
                  </div>

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
