import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Save, X } from "lucide-react";

export default function PoserOptionDialog({ 
  lot, 
  partenaires, 
  acquereurs,
  onSubmit, 
  onCancel,
  isAdmin = false 
}) {
  const [formData, setFormData] = useState({
    partenaire_id: '',
    acquereur_id: '',
    duree_jours: 5,
  });

  const filteredAcquereurs = formData.partenaire_id
    ? acquereurs.filter(a => a.partenaire_id === formData.partenaire_id)
    : [];

  const handleSubmit = () => {
    if (!formData.partenaire_id) {
      alert("Veuillez sélectionner un partenaire");
      return;
    }
    onSubmit(formData);
  };

  return (
    <Dialog open={true} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="bg-white sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-slate-900">
            Poser une option - Lot {lot.reference}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Partenaire *</Label>
            <Select
              value={formData.partenaire_id}
              onValueChange={(value) => setFormData({...formData, partenaire_id: value, acquereur_id: ''})}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un partenaire" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                {partenaires.map(p => (
                  <SelectItem key={p.id} value={p.id}>{p.nom}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Acquéreur</Label>
            <Select
              value={formData.acquereur_id}
              onValueChange={(value) => setFormData({...formData, acquereur_id: value})}
              disabled={!formData.partenaire_id}
            >
              <SelectTrigger className={!formData.partenaire_id ? "opacity-50" : ""}>
                <SelectValue placeholder={
                  formData.partenaire_id
                    ? "Sélectionner un acquéreur (optionnel)"
                    : "Sélectionnez d'abord un partenaire"
                } />
              </SelectTrigger>
              <SelectContent className="bg-white">
                <SelectItem value={null}>Aucun</SelectItem>
                {filteredAcquereurs.map(a => (
                  <SelectItem key={a.id} value={a.id}>
                    {a.prenom} {a.nom}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {formData.partenaire_id && filteredAcquereurs.length === 0 && (
              <p className="text-xs text-amber-600">
                Aucun acquéreur associé à ce partenaire
              </p>
            )}
          </div>

          {isAdmin && (
            <div className="space-y-2">
              <Label>Durée de l'option (jours)</Label>
              <Input
                type="number"
                min="1"
                max="90"
                value={formData.duree_jours}
                onChange={(e) => setFormData({...formData, duree_jours: parseInt(e.target.value) || 1})}
              />
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>
            <X className="w-4 h-4 mr-2" />
            Annuler
          </Button>
          <Button 
            onClick={handleSubmit}
            className="bg-[#1E40AF] hover:bg-[#1E3A8A]"
            disabled={!formData.partenaire_id}
          >
            <Save className="w-4 h-4 mr-2" />
            Poser l'option
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}