import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, Save } from "lucide-react";
import { motion } from "framer-motion";

export default function SuiviDossierForm({ lot, onSubmit, onCancel, isLoading }) {
  const [formData, setFormData] = useState({
    statut: lot.statut || 'sous_option',
    date_prise_option: lot.date_prise_option || '',
    date_signature_compromis: lot.date_signature_compromis || '',
    date_premier_contact: lot.date_premier_contact || '',
    date_signature_acte: lot.date_signature_acte || '',
    statut_suivi: lot.statut_suivi || 'en_cours',
    statut_suivi_libre: lot.statut_suivi_libre || '',
    observations_suivi: lot.observations_suivi || '',
    comptes_rendus_visite: lot.comptes_rendus_visite || '',
    observations_acquereurs: lot.observations_acquereurs || '',
    negociation_en_cours: lot.negociation_en_cours || '',
    phase_post_vente: lot.phase_post_vente || '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    const cleanedData = {};
    Object.keys(formData).forEach(key => {
      const value = formData[key];
      if (value === '' || value === null || value === undefined) {
        cleanedData[key] = null;
      } else {
        cleanedData[key] = value;
      }
    });

    onSubmit({
      ...lot,
      ...cleanedData,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={onCancel}
    >
      <motion.div
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 20 }}
        className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <CardHeader className="border-b border-slate-100 bg-gradient-to-r from-[#1E40AF] to-[#1E3A8A] flex-shrink-0">
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-bold text-white">
              Éditer le suivi - Lot {lot.reference}
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={onCancel}
              className="text-white hover:bg-white/20"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </CardHeader>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto flex flex-col">
          <CardContent className="p-6 space-y-6 flex-1">
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-slate-700 mb-4">Statut principal du lot</h3>
                <div className="grid md:grid-cols-2 gap-4">
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
                        <SelectItem value="sous_option">Sous option</SelectItem>
                        <SelectItem value="reserve">Réservé</SelectItem>
                        <SelectItem value="compromis">Compromis</SelectItem>
                        <SelectItem value="vendu">Vendu</SelectItem>
                        <SelectItem value="disponible">Disponible</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-slate-700 mb-4">Statut du suivi</h3>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="statut_suivi">Statut</Label>
                    <Select
                      value={formData.statut_suivi}
                      onValueChange={(value) => setFormData({ ...formData, statut_suivi: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en_cours">En cours</SelectItem>
                        <SelectItem value="signe">Signé</SelectItem>
                        <SelectItem value="reporte">Reporté</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="statut_suivi_libre">Statut personnalisé (optionnel)</Label>
                    <Input
                      id="statut_suivi_libre"
                      value={formData.statut_suivi_libre}
                      onChange={(e) => setFormData({ ...formData, statut_suivi_libre: e.target.value })}
                      placeholder="Ex: En attente documents"
                    />
                  </div>

                  {lot.statut === 'vendu' && (
                    <div className="space-y-2">
                      <Label htmlFor="phase_post_vente">Phase post-vente</Label>
                      <Select
                        value={formData.phase_post_vente || "none"}
                        onValueChange={(value) => setFormData({ ...formData, phase_post_vente: value === "none" ? null : value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner une phase" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Aucune</SelectItem>
                          <SelectItem value="suivi_post_vente">Suivi post-vente</SelectItem>
                          <SelectItem value="archive">Archivé / Clôturé</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-slate-500 mt-1">
                        Avancement après la vente finalisée
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="observations_suivi">Observations</Label>
                <Textarea
                  id="observations_suivi"
                  value={formData.observations_suivi}
                  onChange={(e) => setFormData({ ...formData, observations_suivi: e.target.value })}
                  rows={4}
                  placeholder="Observations générales sur le suivi du dossier..."
                />
              </div>

              <div className="border-t pt-6">
                <h3 className="text-sm font-semibold text-slate-700 mb-4">Dates</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="date_premier_contact">Date du premier contact</Label>
                    <Input
                      id="date_premier_contact"
                      type="date"
                      value={formData.date_premier_contact}
                      onChange={(e) => setFormData({ ...formData, date_premier_contact: e.target.value })}
                    />
                  </div>

              {lot.date_prise_option && (
                <div className="space-y-2">
                  <Label>Date de prise d'option</Label>
                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-sm font-semibold text-blue-700">
                      {new Date(lot.date_prise_option).toLocaleDateString('fr-FR')}
                    </p>
                    <p className="text-xs text-blue-600 mt-1">
                      Date générée automatiquement (non modifiable)
                    </p>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label>Date signature compromis</Label>
                {lot.date_signature_compromis ? (
                  <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                    <p className="text-sm font-semibold text-orange-700">
                      {new Date(lot.date_signature_compromis).toLocaleDateString('fr-FR')}
                    </p>
                    <p className="text-xs text-orange-600 mt-1">
                      Date générée automatiquement lors du passage en statut "Compromis"
                    </p>
                  </div>
                ) : (
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <p className="text-xs text-slate-600">
                      La date sera générée automatiquement lors du passage du statut "Réservé" à "Compromis"
                    </p>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="date_signature_acte">Date signature acte authentique</Label>
                <Input
                  id="date_signature_acte"
                  type="date"
                  value={formData.date_signature_acte}
                  onChange={(e) => setFormData({ ...formData, date_signature_acte: e.target.value })}
                />
              </div>
                </div>
              </div>

              <div className="border-t pt-6">
                <h3 className="text-sm font-semibold text-slate-700 mb-4">Suivi commercial</h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="comptes_rendus_visite">Comptes-rendus de visite</Label>
                    <Textarea
                      id="comptes_rendus_visite"
                      value={formData.comptes_rendus_visite}
                      onChange={(e) => setFormData({ ...formData, comptes_rendus_visite: e.target.value })}
                      rows={5}
                      placeholder="Dates et détails des visites effectuées..."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="observations_acquereurs">Observations acquéreurs</Label>
                    <Textarea
                      id="observations_acquereurs"
                      value={formData.observations_acquereurs}
                      onChange={(e) => setFormData({ ...formData, observations_acquereurs: e.target.value })}
                      rows={5}
                      placeholder="Notes sur les retours et observations de l'acquéreur..."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="negociation_en_cours">Négociation en cours</Label>
                    <Textarea
                      id="negociation_en_cours"
                      value={formData.negociation_en_cours}
                      onChange={(e) => setFormData({ ...formData, negociation_en_cours: e.target.value })}
                      rows={5}
                      placeholder="Offres, contre-offres, points de négociation..."
                    />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex justify-end gap-3 border-t border-slate-100 p-6 flex-shrink-0">
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
      </motion.div>
    </motion.div>
  );
}