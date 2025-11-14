
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { X, Save, Upload, CheckCircle2, Loader2, Image as ImageIcon, Trash2, MapPin } from "lucide-react";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { uploadFile } from "@/api/uploadService";
import StorageImage from "@/components/common/StorageImage";
import { verifyAddressAndGetCoordinates } from "@/api/geocodingService";
import { toast } from "sonner";

export default function ResidenceGestionForm({ residence, onSubmit, onCancel, isLoading }) {
  const [formData, setFormData] = useState(residence || {
    nom: "",
    adresse: "",
    ville: "",
    code_postal: "",
    type_residence: "etudiante",
    annee_construction: "",
    nombre_lots_total: "",
    nombre_lots_portefeuille: "",
    statut: "active",
    classement_qualite: "non_classe",
    classement_details: "",
    rentabilite_moyenne: "",
    taux_occupation: "",
    satisfaction_investisseurs: "satisfait",
    historique_baux: "",
    etat_general: "",
    documents: {
      photos: [],
      presentation: "",
      fiche_synthetique: "",
      attestation_immatriculation: "",
      carnet_entretien: "",
      rcp_gestionnaire: "",
      pv_ag: [],
      plans: [],
      plaquettes: [],
      diagnostics: [],
      historique_gestionnaires: "",
    },
    notes: "",
  });

  const [uploading, setUploading] = useState({});
  const [uploadError, setUploadError] = useState("");
  const [verifyingAddress, setVerifyingAddress] = useState(false);

  const handleFileUpload = async (file, docKey, isMultiple = false) => {
    if (!file) return;
    
    setUploading(prev => ({ ...prev, [docKey]: true }));
    setUploadError("");
    
    try {
      const result = await uploadFile(file);

      if (isMultiple) {
        const currentFiles = formData.documents?.[docKey] || [];
        setFormData({
          ...formData,
          documents: {
            ...formData.documents,
            [docKey]: [...currentFiles, result.file_url]
          }
        });
      } else {
        setFormData({
          ...formData,
          documents: {
            ...formData.documents,
            [docKey]: result.file_url
          }
        });
      }
    } catch (error) {
      console.error("Upload error:", error);
      setUploadError("Erreur lors de l'upload du document. Veuillez réessayer.");
    } finally {
      setUploading(prev => ({ ...prev, [docKey]: false }));
    }
  };

  const removeFile = (docKey, index = null) => {
    if (index !== null) {
      const currentFiles = formData.documents?.[docKey] || [];
      setFormData({
        ...formData,
        documents: {
          ...formData.documents,
          [docKey]: currentFiles.filter((_, i) => i !== index)
        }
      });
    } else {
      setFormData({
        ...formData,
        documents: {
          ...formData.documents,
          [docKey]: ""
        }
      });
    }
  };

  const handleVerifyAddress = async () => {
    if (!formData.adresse || !formData.ville) {
      toast.error("Veuillez renseigner l'adresse et la ville");
      return;
    }

    setVerifyingAddress(true);
    try {
      const result = await verifyAddressAndGetCoordinates(formData.adresse, formData.ville);

      if (result.success) {
        setFormData({
          ...formData,
          latitude: result.latitude,
          longitude: result.longitude,
          street_view_available: result.street_view_available,
          address_verified_at: new Date().toISOString()
        });

        if (result.street_view_available) {
          toast.success("Adresse vérifiée ! Street View disponible");
        } else {
          toast.warning("Adresse vérifiée mais Street View non disponible à cet emplacement");
        }
      } else {
        toast.error(result.error || "Impossible de vérifier l'adresse");
      }
    } catch (error) {
      console.error("Error verifying address:", error);
      toast.error("Erreur lors de la vérification de l'adresse");
    } finally {
      setVerifyingAddress(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Nettoyer les données : convertir les strings vides en null pour les champs numériques
    const cleanedData = {
      ...formData,
      annee_construction: formData.annee_construction ? Number(formData.annee_construction) : null,
      nombre_lots_total: formData.nombre_lots_total ? Number(formData.nombre_lots_total) : null,
      nombre_lots_portefeuille: formData.nombre_lots_portefeuille ? Number(formData.nombre_lots_portefeuille) : null,
      rentabilite_moyenne: formData.rentabilite_moyenne ? Number(formData.rentabilite_moyenne) : null,
      taux_occupation: formData.taux_occupation ? Number(formData.taux_occupation) : null,
      latitude: formData.latitude || null,
      longitude: formData.longitude || null,
      street_view_available: formData.street_view_available || false,
      address_verified_at: formData.address_verified_at || null,
    };

    onSubmit(cleanedData);
  };

  const documentsConfig = [
    { key: "presentation", label: "Document de présentation", category: "Documents principaux", multiple: false },
    { key: "fiche_synthetique", label: "Fiche synthétique", category: "Documents principaux", multiple: false },
    { key: "attestation_immatriculation", label: "Attestation d'immatriculation", category: "Documents administratifs", multiple: false },
    { key: "carnet_entretien", label: "Carnet d'entretien", category: "Documents administratifs", multiple: false },
    { key: "rcp_gestionnaire", label: "RCP gestionnaire", category: "Documents administratifs", multiple: false },
    { key: "pv_ag", label: "PV d'assemblées générales", category: "Documents juridiques", multiple: true },
    { key: "plans", label: "Plans", category: "Documents techniques", multiple: true },
    { key: "plaquettes", label: "Plaquettes", category: "Documents techniques", multiple: true },
    { key: "diagnostics", label: "Diagnostics", category: "Documents techniques", multiple: true },
    { key: "historique_gestionnaires", label: "Historique des changements de gestionnaire", category: "Documents administratifs", multiple: false },
  ];

  const groupedDocuments = documentsConfig.reduce((acc, doc) => {
    if (!acc[doc.category]) acc[doc.category] = [];
    acc[doc.category].push(doc);
    return acc;
  }, {});

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
            {residence ? "Modifier la résidence" : "Nouvelle résidence"}
          </CardTitle>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="p-6">
            {uploadError && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                {uploadError}
              </div>
            )}
            
            <Tabs defaultValue="general" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="general">Général</TabsTrigger>
                <TabsTrigger value="performances">Performances</TabsTrigger>
                <TabsTrigger value="documents">Documents</TabsTrigger>
              </TabsList>

              <TabsContent value="general" className="space-y-6 mt-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="nom">Nom de la résidence *</Label>
                    <Input
                      id="nom"
                      value={formData.nom}
                      onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="type_residence">Type de résidence *</Label>
                    <Select
                      value={formData.type_residence}
                      onValueChange={(value) => setFormData({ ...formData, type_residence: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ehpad">EHPAD</SelectItem>
                        <SelectItem value="etudiante">Étudiante</SelectItem>
                        <SelectItem value="affaires">Affaires</SelectItem>
                        <SelectItem value="tourisme">Tourisme</SelectItem>
                        <SelectItem value="senior">Senior</SelectItem>
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
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="en_renovation">En rénovation</SelectItem>
                        <SelectItem value="en_liquidation">En liquidation</SelectItem>
                        <SelectItem value="fermee">Fermée</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="adresse">Adresse complète</Label>
                    <Input
                      id="adresse"
                      value={formData.adresse}
                      onChange={(e) => setFormData({ ...formData, adresse: e.target.value })}
                      placeholder="Ex: 12 rue de la République"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="code_postal">Code postal</Label>
                    <Input
                      id="code_postal"
                      value={formData.code_postal}
                      onChange={(e) => setFormData({ ...formData, code_postal: e.target.value })}
                      placeholder="Ex: 75001"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="ville">Ville *</Label>
                    <Input
                      id="ville"
                      value={formData.ville}
                      onChange={(e) => setFormData({ ...formData, ville: e.target.value })}
                      placeholder="Ex: Paris"
                      required
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <div className="flex items-center gap-2 mb-2">
                      <Label>Vérification de l'adresse</Label>
                      {formData.latitude && formData.longitude && (
                        <span className="text-xs text-green-600 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          Adresse vérifiée
                          {formData.street_view_available && " - Street View disponible"}
                        </span>
                      )}
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleVerifyAddress}
                      disabled={verifyingAddress || !formData.adresse || !formData.ville}
                      className="w-full sm:w-auto"
                    >
                      {verifyingAddress ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Vérification en cours...
                        </>
                      ) : (
                        <>
                          <MapPin className="w-4 h-4 mr-2" />
                          Vérifier l'adresse et Street View
                        </>
                      )}
                    </Button>
                    <p className="text-xs text-slate-500 mt-1">
                      La vérification permet d'obtenir les coordonnées GPS précises et de vérifier la disponibilité de Street View
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="annee_construction">Année de construction</Label>
                    <Input
                      id="annee_construction"
                      type="number"
                      value={formData.annee_construction}
                      onChange={(e) => setFormData({ ...formData, annee_construction: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="nombre_lots_total">Nombre de lots total</Label>
                    <Input
                      id="nombre_lots_total"
                      type="number"
                      value={formData.nombre_lots_total}
                      onChange={(e) => setFormData({ ...formData, nombre_lots_total: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm text-blue-800">
                        <span className="font-semibold">💡 Astuce :</span> Pour que la résidence s'affiche sur la carte, renseignez l'adresse complète, le code postal et la ville de manière précise.
                      </p>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="performances" className="space-y-6 mt-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="classement_qualite">Classement qualité</Label>
                    <Select
                      value={formData.classement_qualite}
                      onValueChange={(value) => setFormData({ ...formData, classement_qualite: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="a">A</SelectItem>
                        <SelectItem value="b">B</SelectItem>
                        <SelectItem value="c">C</SelectItem>
                        <SelectItem value="d">D</SelectItem>
                        <SelectItem value="non_classe">Non classé</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="classement_details">Détails du classement</Label>
                    <Textarea
                      id="classement_details"
                      value={formData.classement_details}
                      onChange={(e) => setFormData({ ...formData, classement_details: e.target.value })}
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="taux_occupation">Taux d'occupation (%)</Label>
                    <Input
                      id="taux_occupation"
                      type="number"
                      value={formData.taux_occupation}
                      onChange={(e) => setFormData({ ...formData, taux_occupation: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="rentabilite_moyenne">Rentabilité moyenne (%)</Label>
                    <Input
                      id="rentabilite_moyenne"
                      type="number"
                      step="0.01"
                      value={formData.rentabilite_moyenne}
                      onChange={(e) => setFormData({ ...formData, rentabilite_moyenne: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="satisfaction_investisseurs">Satisfaction investisseurs</Label>
                    <Select
                      value={formData.satisfaction_investisseurs}
                      onValueChange={(value) => setFormData({ ...formData, satisfaction_investisseurs: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="tres_satisfait">Très satisfait</SelectItem>
                        <SelectItem value="satisfait">Satisfait</SelectItem>
                        <SelectItem value="moyen">Moyen</SelectItem>
                        <SelectItem value="insatisfait">Insatisfait</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="historique_baux">Historique des baux</Label>
                    <Textarea
                      id="historique_baux"
                      value={formData.historique_baux}
                      onChange={(e) => setFormData({ ...formData, historique_baux: e.target.value })}
                      rows={4}
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="etat_general">État général</Label>
                    <Textarea
                      id="etat_general"
                      value={formData.etat_general}
                      onChange={(e) => setFormData({ ...formData, etat_general: e.target.value })}
                      rows={4}
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

              <TabsContent value="documents" className="space-y-6 mt-6">
                {/* Photos */}
                <div className="space-y-4">
                  <div>
                    <Label>Photos de la résidence</Label>
                    <p className="text-xs text-slate-500 mb-3">La première photo sera utilisée comme miniature</p>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {formData.documents?.photos?.map((photo, index) => (
                      <div key={index} className="relative aspect-video rounded-lg overflow-hidden border-2 border-slate-200 group">
                        <StorageImage
                          src={photo}
                          alt={`Photo ${index + 1}`}
                          className="w-full h-full object-cover"
                          fallback={
                            <div className="w-full h-full flex items-center justify-center bg-slate-100">
                              <ImageIcon className="w-8 h-8 text-slate-400" />
                            </div>
                          }
                        />
                        <button
                          type="button"
                          onClick={() => removeFile('photos', index)}
                          className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        {index === 0 && (
                          <div className="absolute bottom-0 left-0 right-0 bg-[#1E40AF]/90 text-white text-xs p-1 text-center">
                            Photo principale
                          </div>
                        )}
                      </div>
                    ))}
                    <label className="aspect-video rounded-lg border-2 border-dashed border-slate-300 hover:border-[#1E40AF] flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 transition-colors">
                      {uploading.photos ? (
                        <>
                          <Loader2 className="w-8 h-8 text-[#1E40AF] animate-spin mb-2" />
                          <span className="text-sm text-slate-600">Upload...</span>
                        </>
                      ) : (
                        <>
                          <ImageIcon className="w-8 h-8 text-slate-400 mb-2" />
                          <span className="text-sm text-slate-600">Ajouter photo</span>
                        </>
                      )}
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            handleFileUpload(file, 'photos', true);
                            e.target.value = '';
                          }
                        }}
                        disabled={uploading.photos}
                      />
                    </label>
                  </div>
                </div>

                {/* Other documents */}
                {Object.entries(groupedDocuments).map(([category, docs]) => (
                  <div key={category} className="space-y-4">
                    <h3 className="font-semibold text-slate-700 text-sm border-b pb-2">{category}</h3>
                    <div className="space-y-4">
                      {docs.map((doc) => (
                        <div key={doc.key} className="space-y-2">
                          <Label className="text-sm">{doc.label}</Label>
                          {doc.multiple ? (
                            <div className="space-y-2">
                              {formData.documents?.[doc.key]?.map((url, index) => (
                                <div key={index} className="flex gap-2">
                                  <div className="flex-1 flex items-center gap-2 px-4 py-2 border-2 border-green-300 bg-green-50 rounded-lg">
                                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                                    <span className="text-sm text-green-700 flex-1">Document {index + 1}</span>
                                    <button
                                      type="button"
                                      onClick={() => removeFile(doc.key, index)}
                                      className="text-red-500 hover:text-red-700"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>
                                </div>
                              ))}
                              <label className="flex items-center justify-center gap-2 px-4 py-2 border-2 border-dashed border-slate-300 rounded-lg cursor-pointer hover:border-[#1E40AF] hover:bg-slate-50 transition-colors">
                                {uploading[doc.key] ? (
                                  <>
                                    <Loader2 className="w-4 h-4 animate-spin text-[#1E40AF]" />
                                    <span className="text-sm text-slate-600">Upload en cours...</span>
                                  </>
                                ) : (
                                  <>
                                    <Upload className="w-4 h-4 text-slate-400" />
                                    <span className="text-sm text-slate-600">Ajouter un document</span>
                                  </>
                                )}
                                <input
                                  type="file"
                                  className="hidden"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      handleFileUpload(file, doc.key, true);
                                      e.target.value = '';
                                    }
                                  }}
                                  disabled={uploading[doc.key]}
                                />
                              </label>
                            </div>
                          ) : (
                            <div className="flex gap-2">
                              <label className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border-2 border-dashed border-slate-300 rounded-lg cursor-pointer hover:border-[#1E40AF] hover:bg-slate-50 transition-colors">
                                {uploading[doc.key] ? (
                                  <>
                                    <Loader2 className="w-4 h-4 animate-spin text-[#1E40AF]" />
                                    <span className="text-sm text-slate-600">Upload en cours...</span>
                                  </>
                                ) : formData.documents?.[doc.key] ? (
                                  <>
                                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                                    <span className="text-sm text-green-700 font-medium">Document uploadé</span>
                                  </>
                                ) : (
                                  <>
                                    <Upload className="w-4 h-4 text-slate-400" />
                                    <span className="text-sm text-slate-600">Cliquer pour uploader</span>
                                  </>
                                )}
                                <input
                                  type="file"
                                  className="hidden"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      handleFileUpload(file, doc.key, false);
                                      e.target.value = '';
                                    }
                                  }}
                                  disabled={uploading[doc.key]}
                                />
                              </label>
                              {formData.documents?.[doc.key] && (
                                <button
                                  type="button"
                                  onClick={() => removeFile(doc.key)}
                                  className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
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
