import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Save, X, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function PoserOptionPartenaireDialog({ 
  lot, 
  mesAcquereurs,
  optionsActives,
  optionsMax,
  dureeJours,
  onSubmit, 
  onCancel
}) {
  const [acquereurId, setAcquereurId] = useState("");

  const handleSubmit = () => {
    if (!acquereurId) {
      alert("Veuillez sélectionner un acquéreur");
      return;
    }
    onSubmit(lot, acquereurId);
  };

  const limiteAtteinte = optionsActives >= optionsMax;

  return (
    <Dialog open={true} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="bg-white sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-slate-900">
            Poser une option - Lot {lot.reference}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Info sur les limites */}
          <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-blue-700 font-medium">Options actives</span>
              <Badge className={limiteAtteinte ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"}>
                {optionsActives} / {optionsMax}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-blue-700 font-medium">Durée de l'option</span>
              <span className="text-sm font-semibold text-blue-800">{dureeJours} jours</span>
            </div>
          </div>

          {limiteAtteinte && (
            <div className="p-3 bg-red-50 rounded-lg border border-red-200 flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-800">Limite atteinte</p>
                <p className="text-xs text-red-700 mt-1">
                  Vous avez atteint votre limite de {optionsMax} options simultanées. Veuillez attendre qu'une option expire ou soit convertie.
                </p>
              </div>
            </div>
          )}

          {!limiteAtteinte && (
            <div className="space-y-2">
              <Label>Sélectionner un acquéreur *</Label>
              <Select value={acquereurId} onValueChange={setAcquereurId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choisir un acquéreur" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  {mesAcquereurs.length === 0 ? (
                    <div className="p-4 text-center text-sm text-slate-500">
                      Aucun acquéreur dans votre portefeuille
                    </div>
                  ) : (
                    mesAcquereurs.map(acq => (
                      <SelectItem key={acq.id} value={acq.id}>
                        {acq.prenom} {acq.nom}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {mesAcquereurs.length === 0 && (
                <p className="text-xs text-amber-600">
                  Ajoutez d'abord un acquéreur depuis "Mes Acquéreurs"
                </p>
              )}
            </div>
          )}

          <div className="p-3 bg-slate-50 rounded-lg">
            <h4 className="text-sm font-semibold text-slate-700 mb-2">Résumé du lot</h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-600">Résidence:</span>
                <span className="font-medium text-slate-800">{lot.residence_nom}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Type:</span>
                <span className="font-medium text-slate-800">{lot.typologie}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Prix FAI:</span>
                <span className="font-medium text-slate-800">{lot.prix_fai?.toLocaleString('fr-FR')} €</span>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>
            <X className="w-4 h-4 mr-2" />
            Annuler
          </Button>
          <Button 
            onClick={handleSubmit}
            className="bg-[#1E40AF] hover:bg-[#1E3A8A]"
            disabled={!acquereurId || limiteAtteinte || mesAcquereurs.length === 0}
          >
            <Save className="w-4 h-4 mr-2" />
            Poser l'option
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}