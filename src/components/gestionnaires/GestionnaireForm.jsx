import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, Save, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export default function GestionnaireForm({ gestionnaire, onSubmit, onCancel, isLoading }) {
  const [formData, setFormData] = useState(gestionnaire || {
    nom_societe: "",
    contact_principal: "",
    email: "",
    telephone: "",
    adresse: "",
    type_gestion: "bail_commercial",
    residence_ids: []
  });

  const [residences, setResidences] = useState([]);
  const [loadingResidences, setLoadingResidences] = useState(true);

  useEffect(() => {
    loadResidences();
    if (gestionnaire?.id) {
      loadGestionnaireResidences(gestionnaire.id);
    }
  }, [gestionnaire]);

  const loadResidences = async () => {
    try {
      const { data, error } = await supabase
        .from("residences_gestion")
        .select("id, nom")
        .order("nom");

      if (error) throw error;
      setResidences(data || []);
    } catch (error) {
      console.error("Error loading residences:", error);
      toast.error("Erreur lors du chargement des résidences");
    } finally {
      setLoadingResidences(false);
    }
  };

  const loadGestionnaireResidences = async (gestionnaireId) => {
    try {
      const { data, error } = await supabase
        .from("gestionnaires_residences")
        .select("residence_id")
        .eq("gestionnaire_id", gestionnaireId);

      if (error) throw error;

      const residenceIds = data.map(item => item.residence_id);
      setFormData(prev => ({ ...prev, residence_ids: residenceIds }));
    } catch (error) {
      console.error("Error loading gestionnaire residences:", error);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const toggleResidence = (residenceId) => {
    setFormData(prev => {
      const residence_ids = prev.residence_ids || [];
      if (residence_ids.includes(residenceId)) {
        return {
          ...prev,
          residence_ids: residence_ids.filter(id => id !== residenceId)
        };
      } else {
        return {
          ...prev,
          residence_ids: [...residence_ids, residenceId]
        };
      }
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto"
      onClick={onCancel}
    >
      <Card
        className="w-full max-w-2xl my-8"
        onClick={(e) => e.stopPropagation()}
      >
        <CardHeader className="border-b border-slate-200 bg-gradient-to-r from-[#1E40AF] to-[#7C3AED] text-white">
          <CardTitle className="flex items-center justify-between">
            <span>{gestionnaire ? "Modifier le gestionnaire" : "Nouveau gestionnaire"}</span>
            <Button
              variant="ghost"
              size="icon"
              onClick={onCancel}
              className="text-white hover:bg-white/20"
            >
              <X className="w-5 h-5" />
            </Button>
          </CardTitle>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="p-6 space-y-6">
            <div className="space-y-2">
              <Label htmlFor="nom_societe">Nom ou société *</Label>
              <Input
                id="nom_societe"
                value={formData.nom_societe}
                onChange={(e) => setFormData({ ...formData, nom_societe: e.target.value })}
                placeholder="Ex: Société de gestion immobilière"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type_gestion">Type de gestionnaire *</Label>
              <Select
                value={formData.type_gestion}
                onValueChange={(value) => setFormData({ ...formData, type_gestion: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez le type" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="bail_commercial">Bail commercial</SelectItem>
                  <SelectItem value="mandat_gestion">Mandat de gestion</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="contact_principal">Contact principal</Label>
              <Input
                id="contact_principal"
                value={formData.contact_principal}
                onChange={(e) => setFormData({ ...formData, contact_principal: e.target.value })}
                placeholder="Ex: Jean Dupont"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="contact@exemple.fr"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="telephone">Téléphone</Label>
                <Input
                  id="telephone"
                  type="tel"
                  value={formData.telephone}
                  onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                  placeholder="06 12 34 56 78"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="adresse">Adresse</Label>
              <Textarea
                id="adresse"
                value={formData.adresse}
                onChange={(e) => setFormData({ ...formData, adresse: e.target.value })}
                placeholder="Adresse complète du gestionnaire"
                rows={2}
              />
            </div>

            <div className="space-y-3 pt-4 border-t border-slate-200">
              <Label>Résidences gérées</Label>
              {loadingResidences ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
                </div>
              ) : residences.length > 0 ? (
                <div className="space-y-2 max-h-64 overflow-y-auto border border-slate-200 rounded-lg p-4">
                  {residences.map((residence) => (
                    <div key={residence.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`residence-${residence.id}`}
                        checked={(formData.residence_ids || []).includes(residence.id)}
                        onCheckedChange={() => toggleResidence(residence.id)}
                      />
                      <label
                        htmlFor={`residence-${residence.id}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        {residence.nom}
                      </label>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500 py-4 text-center">
                  Aucune résidence disponible
                </p>
              )}
            </div>
          </CardContent>

          <CardFooter className="flex justify-end gap-3 border-t border-slate-200 bg-slate-50 p-6">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isLoading}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-gradient-to-r from-[#1E40AF] to-[#7C3AED] hover:opacity-90"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Enregistrement...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Enregistrer
                </>
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </motion.div>
  );
}
