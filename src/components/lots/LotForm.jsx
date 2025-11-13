import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { X, Save } from "lucide-react";
import { motion } from "framer-motion";

export default function LotForm({ lot, residences, onSubmit, onCancel, isLoading }) {
  const [formData, setFormData] = useState(lot || {
    numero_lot: "",
    residence_id: "",
    type: "T2",
    surface: 0,
    prix: 0,
    etage: "",
    balcon: false,
    terrasse: false,
    jardin: false,
    statut: "disponible",
    images: [],
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
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
          <CardTitle className="text-2xl font-bold text-[#0F172A]">
            {lot ? "Modifier le lot" : "Nouveau lot"}
          </CardTitle>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="p-6 space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="numero_lot">Numéro de lot *</Label>
                <Input
                  id="numero_lot"
                  value={formData.numero_lot}
                  onChange={(e) => setFormData({ ...formData, numero_lot: e.target.value })}
                  placeholder="A101"
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
                    {residences.map((residence) => (
                      <SelectItem key={residence.id} value={residence.id}>
                        {residence.nom}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Type *</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => setFormData({ ...formData, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="T1">T1</SelectItem>
                    <SelectItem value="T2">T2</SelectItem>
                    <SelectItem value="T3">T3</SelectItem>
                    <SelectItem value="T4">T4</SelectItem>
                    <SelectItem value="T5">T5</SelectItem>
                    <SelectItem value="Maison">Maison</SelectItem>
                    <SelectItem value="Parking">Parking</SelectItem>
                    <SelectItem value="Cave">Cave</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="surface">Surface (m²) *</Label>
                <Input
                  id="surface"
                  type="number"
                  min="0"
                  step="0.1"
                  value={formData.surface}
                  onChange={(e) => setFormData({ ...formData, surface: parseFloat(e.target.value) || 0 })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="prix">Prix (€) *</Label>
                <Input
                  id="prix"
                  type="number"
                  min="0"
                  value={formData.prix}
                  onChange={(e) => setFormData({ ...formData, prix: parseFloat(e.target.value) || 0 })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="etage">Étage</Label>
                <Input
                  id="etage"
                  value={formData.etage}
                  onChange={(e) => setFormData({ ...formData, etage: e.target.value })}
                  placeholder="RDC, 1, 2..."
                />
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
                    <SelectItem value="disponible">Disponible</SelectItem>
                    <SelectItem value="reserve">Réservé</SelectItem>
                    <SelectItem value="vendu">Vendu</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-4">
              <Label>Caractéristiques</Label>
              <div className="flex flex-wrap gap-6">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="balcon"
                    checked={formData.balcon}
                    onCheckedChange={(checked) => setFormData({ ...formData, balcon: checked })}
                  />
                  <label htmlFor="balcon" className="text-sm font-medium cursor-pointer">
                    Balcon
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="terrasse"
                    checked={formData.terrasse}
                    onCheckedChange={(checked) => setFormData({ ...formData, terrasse: checked })}
                  />
                  <label htmlFor="terrasse" className="text-sm font-medium cursor-pointer">
                    Terrasse
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="jardin"
                    checked={formData.jardin}
                    onCheckedChange={(checked) => setFormData({ ...formData, jardin: checked })}
                  />
                  <label htmlFor="jardin" className="text-sm font-medium cursor-pointer">
                    Jardin
                  </label>
                </div>
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
              className="bg-[#D4AF37] hover:bg-[#B8941F] text-white"
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