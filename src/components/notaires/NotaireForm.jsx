
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, Save, Plus, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function NotaireForm({ notaire, onSubmit, onCancel, isLoading }) {
  const [formData, setFormData] = useState(notaire || {
    nom: "",
    prenom: "",
    etude: "",
    email: "",
    telephone: "",
    adresse: "",
    ville: "",
    code_postal: "",
    type_notaire: "acquereur",
    vendeurs_ids: [],
    acquereurs_ids: [],
    specialites: "",
    notes: "",
  });

  const [selectedType, setSelectedType] = useState(notaire?.type_notaire || "acquereur");

  const { data: vendeurs = [] } = useQuery({
    queryKey: ['vendeurs'],
    queryFn: () => base44.entities.Vendeur.list(),
  });

  const { data: acquereurs = [] } = useQuery({
    queryKey: ['acquereurs'],
    queryFn: () => base44.entities.Acquereur.list(),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Nettoyer les données
    const cleanedData = {
      ...formData,
    };

    onSubmit(cleanedData);
  };

  const handleTypeChange = (type) => {
    setSelectedType(type);
    setFormData({
      ...formData,
      type_notaire: type,
      vendeurs_ids: type === 'vendeur' || type === 'mixte' ? formData.vendeurs_ids : [],
      acquereurs_ids: type === 'acquereur' || type === 'mixte' ? formData.acquereurs_ids : [],
    });
  };

  const addVendeur = (vendeurId) => {
    if (vendeurId && !formData.vendeurs_ids.includes(vendeurId)) {
      setFormData({ 
        ...formData, 
        vendeurs_ids: [...formData.vendeurs_ids, vendeurId] 
      });
    }
  };

  const removeVendeur = (vendeurId) => {
    setFormData({ 
      ...formData, 
      vendeurs_ids: formData.vendeurs_ids.filter(id => id !== vendeurId) 
    });
  };

  const addAcquereur = (acquereurId) => {
    if (acquereurId && !formData.acquereurs_ids.includes(acquereurId)) {
      setFormData({ 
        ...formData, 
        acquereurs_ids: [...formData.acquereurs_ids, acquereurId] 
      });
    }
  };

  const removeAcquereur = (acquereurId) => {
    setFormData({ 
      ...formData, 
      acquereurs_ids: formData.acquereurs_ids.filter(id => id !== acquereurId) 
    });
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
            {notaire ? "Modifier le notaire" : "Nouveau notaire"}
          </CardTitle>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="p-6">
            <Tabs defaultValue="general" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="general">Informations générales</TabsTrigger>
                <TabsTrigger value="clients">Clients associés</TabsTrigger>
              </TabsList>

              <TabsContent value="general" className="space-y-6 mt-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="nom">Nom *</Label>
                    <Input
                      id="nom"
                      value={formData.nom}
                      onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="prenom">Prénom</Label>
                    <Input
                      id="prenom"
                      value={formData.prenom}
                      onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="etude">Nom de l'étude notariale *</Label>
                    <Input
                      id="etude"
                      value={formData.etude}
                      onChange={(e) => setFormData({ ...formData, etude: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="type_notaire">Type de notaire</Label>
                    <Select
                      value={selectedType}
                      onValueChange={handleTypeChange}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="vendeur">Notaire vendeur</SelectItem>
                        <SelectItem value="acquereur">Notaire acquéreur</SelectItem>
                        <SelectItem value="mixte">Mixte (vendeur et acquéreur)</SelectItem>
                      </SelectContent>
                    </Select>
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
                    <Label htmlFor="code_postal">Code postal</Label>
                    <Input
                      id="code_postal"
                      value={formData.code_postal}
                      onChange={(e) => setFormData({ ...formData, code_postal: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="ville">Ville</Label>
                    <Input
                      id="ville"
                      value={formData.ville}
                      onChange={(e) => setFormData({ ...formData, ville: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="specialites">Spécialités</Label>
                    <Input
                      id="specialites"
                      value={formData.specialites}
                      onChange={(e) => setFormData({ ...formData, specialites: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="notes">Notes internes</Label>
                    <Textarea
                      id="notes"
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      rows={4}
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="clients" className="space-y-6 mt-6">
                {(selectedType === 'vendeur' || selectedType === 'mixte') && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label className="text-base font-semibold">Vendeurs associés</Label>
                    </div>
                    
                    <div className="flex gap-2">
                      <Select onValueChange={addVendeur}>
                        <SelectTrigger className="flex-1">
                          <SelectValue placeholder="Ajouter un vendeur" />
                        </SelectTrigger>
                        <SelectContent>
                          {vendeurs
                            .filter(v => !formData.vendeurs_ids.includes(v.id))
                            .map((v) => (
                              <SelectItem key={v.id} value={v.id}>
                                {v.type_vendeur === 'entreprise' ? v.nom : `${v.prenom} ${v.nom}`}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {formData.vendeurs_ids.length > 0 && (
                      <div className="space-y-2">
                        {formData.vendeurs_ids.map(vendeurId => {
                          const vendeur = vendeurs.find(v => v.id === vendeurId);
                          if (!vendeur) return null;
                          return (
                            <div key={vendeurId} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                              <span className="font-medium text-slate-700">
                                {vendeur.type_vendeur === 'entreprise' ? vendeur.nom : `${vendeur.prenom} ${vendeur.nom}`}
                              </span>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => removeVendeur(vendeurId)}
                                className="hover:bg-red-100 hover:text-red-600"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {(selectedType === 'acquereur' || selectedType === 'mixte') && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label className="text-base font-semibold">Acquéreurs associés</Label>
                    </div>
                    
                    <div className="flex gap-2">
                      <Select onValueChange={addAcquereur}>
                        <SelectTrigger className="flex-1">
                          <SelectValue placeholder="Ajouter un acquéreur" />
                        </SelectTrigger>
                        <SelectContent>
                          {acquereurs
                            .filter(a => !formData.acquereurs_ids.includes(a.id))
                            .map((a) => (
                              <SelectItem key={a.id} value={a.id}>
                                {a.prenom} {a.nom}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {formData.acquereurs_ids.length > 0 && (
                      <div className="space-y-2">
                        {formData.acquereurs_ids.map(acquereurId => {
                          const acquereur = acquereurs.find(a => a.id === acquereurId);
                          if (!acquereur) return null;
                          return (
                            <div key={acquereurId} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                              <span className="font-medium text-slate-700">
                                {acquereur.prenom} {acquereur.nom}
                              </span>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => removeAcquereur(acquereurId)}
                                className="hover:bg-red-100 hover:text-red-600"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {selectedType !== 'vendeur' && selectedType !== 'acquereur' && selectedType !== 'mixte' && (
                  <div className="text-center py-8">
                    <p className="text-slate-500">Sélectionnez un type de notaire pour associer des clients</p>
                  </div>
                )}
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
