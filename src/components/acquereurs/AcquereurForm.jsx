import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { X, Save, Upload, CheckCircle2, Loader2, Trash2, Download, Eye } from "lucide-react";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { autoCleanFormData } from "@/utils/formHelpers";
import { useSignedUrls } from "@/hooks/useSignedUrl";

export default function AcquereurForm({ acquereur, onSubmit, onCancel, isLoading, isPartner = false }) {
  const [formData, setFormData] = useState(acquereur || {
    nom: "",
    prenom: "",
    adresse: "",
    telephone: "",
    email: "",
    date_naissance: "",
    date_entree_crm: acquereur?.date_entree_crm || new Date().toISOString().split('T')[0],
    profession: "",
    statut_professionnel: "salarie",
    situation_familiale: "marie",
    residence_fiscale: "",
    statut_fiscal: "lmnp",
    source_contact: "web",
    partenaire_id: "",
    budget_min: "",
    budget_max: "",
    budget: "",
    mode_financement: "credit",
    apport: "",
    endettement_estime: "",
    revenus_mensuels: "",
    courtier: "",
    accord_bancaire: "non",
    statut_commercial: "prospect",
    documents: {},
    notes: "",
  });

  const [uploading, setUploading] = useState({});
  const [uploadError, setUploadError] = useState("");
  const { urls: signedUrls, loading: urlsLoading } = useSignedUrls(formData.documents || {});

  const { data: partenaires = [] } = useQuery({
    queryKey: ['partenaires'],
    queryFn: () => base44.entities.Partenaire.list(),
  });

  const handleFileUpload = async (file, docKey) => {
    if (!file) return;
    
    setUploading(prev => ({ ...prev, [docKey]: true }));
    setUploadError("");
    
    try {
      const result = await base44.integrations.Core.UploadFile({ file });
      setFormData({
        ...formData,
        documents: {
          ...(formData.documents || {}),
          [docKey]: result.file_url
        }
      });
    } catch (error) {
      console.error("Upload error:", error);
      setUploadError("Erreur lors de l'upload du document. Veuillez réessayer.");
    } finally {
      setUploading(prev => ({ ...prev, [docKey]: false }));
    }
  };

  const removeFile = (docKey) => {
    setFormData({
      ...formData,
      documents: {
        ...(formData.documents || {}),
        [docKey]: ""
      }
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const partenaire = partenaires.find(p => p.id === formData.partenaire_id);

    // Nettoyer automatiquement toutes les données (nombres et dates)
    const cleanedData = {
      ...autoCleanFormData(formData),
      partenaire_nom: partenaire?.nom || "",
    };

    onSubmit(cleanedData);
  };

  const documentsConfig = [
    { key: "cni", label: "CNI", category: "Identité" },
    { key: "passeport", label: "Passeport", category: "Identité" },
    { key: "justificatif_domicile", label: "Justificatif de domicile", category: "Identité" },
    { key: "lettre_intention_achat", label: "Lettre d'intention d'achat", category: "Documents contractuels" },
    { key: "mandat_gestion", label: "Mandat de gestion", category: "Documents contractuels" },
    { key: "mandat_acquereur_honoraires", label: "Mandat acquéreur pour honoraires", category: "Documents contractuels" },
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
            {acquereur ? "Modifier l'acquéreur" : "Nouvel acquéreur"}
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
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="general">Général</TabsTrigger>
                <TabsTrigger value="financier">Capacité financière</TabsTrigger>
                <TabsTrigger value="documents">Documents</TabsTrigger>
                <TabsTrigger value="commercial">Suivi commercial</TabsTrigger>
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
                    <Label htmlFor="prenom">Prénom *</Label>
                    <Input
                      id="prenom"
                      value={formData.prenom}
                      onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
                      required
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
                    <Label htmlFor="adresse">Adresse postale</Label>
                    <Input
                      id="adresse"
                      value={formData.adresse}
                      onChange={(e) => setFormData({ ...formData, adresse: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="date_naissance">Date de naissance</Label>
                    <Input
                      id="date_naissance"
                      type="date"
                      value={formData.date_naissance}
                      onChange={(e) => setFormData({ ...formData, date_naissance: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Date d'entrée dans le CRM</Label>
                    <div className="p-3 bg-slate-100 rounded-lg">
                      <p className="text-sm font-semibold text-slate-700">
                        {new Date(formData.date_entree_crm).toLocaleDateString('fr-FR')}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        Date générée automatiquement lors de la création
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="profession">Profession</Label>
                    <Input
                      id="profession"
                      value={formData.profession}
                      onChange={(e) => setFormData({ ...formData, profession: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="statut_professionnel">Statut professionnel</Label>
                    <Select
                      value={formData.statut_professionnel}
                      onValueChange={(value) => setFormData({ ...formData, statut_professionnel: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="salarie">Salarié</SelectItem>
                        <SelectItem value="tns">TNS</SelectItem>
                        <SelectItem value="retraite">Retraité</SelectItem>
                        <SelectItem value="liberal">Libéral</SelectItem>
                        <SelectItem value="fonctionnaire">Fonctionnaire</SelectItem>
                        <SelectItem value="autre">Autre</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="situation_familiale">Situation familiale</Label>
                    <Select
                      value={formData.situation_familiale}
                      onValueChange={(value) => setFormData({ ...formData, situation_familiale: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="celibataire">Célibataire</SelectItem>
                        <SelectItem value="marie">Marié</SelectItem>
                        <SelectItem value="pacse">Pacsé</SelectItem>
                        <SelectItem value="divorce">Divorcé</SelectItem>
                        <SelectItem value="veuf">Veuf</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="residence_fiscale">Résidence fiscale</Label>
                    <Input
                      id="residence_fiscale"
                      value={formData.residence_fiscale}
                      onChange={(e) => setFormData({ ...formData, residence_fiscale: e.target.value })}
                      placeholder="Pays de résidence fiscale"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="statut_fiscal">Statut fiscal</Label>
                    <Select
                      value={formData.statut_fiscal}
                      onValueChange={(value) => setFormData({ ...formData, statut_fiscal: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="lmnp">LMNP</SelectItem>
                        <SelectItem value="lmp">LMP</SelectItem>
                        <SelectItem value="ir">IR</SelectItem>
                        <SelectItem value="is">IS</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="source_contact">Source du contact</Label>
                    <Select
                      value={formData.source_contact}
                      onValueChange={(value) => setFormData({ ...formData, source_contact: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="apporteur">Apporteur</SelectItem>
                        <SelectItem value="web">Campagne web</SelectItem>
                        <SelectItem value="mailing">Mailing</SelectItem>
                        <SelectItem value="partenaire">Partenaire</SelectItem>
                        <SelectItem value="recommandation">Recommandation</SelectItem>
                        <SelectItem value="autre">Autre</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="partenaire_id">Partenaire apporteur</Label>
                    <Select
                      value={formData.partenaire_id}
                      onValueChange={(value) => setFormData({ ...formData, partenaire_id: value })}
                      disabled={isPartner}
                    >
                      <SelectTrigger className={isPartner ? "opacity-50" : ""}>
                        <SelectValue placeholder="Sélectionner un partenaire" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={null}>Aucun</SelectItem>
                        {partenaires.map((p) => (
                          <SelectItem key={p.id} value={p.id}>{p.nom}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {isPartner && (
                      <p className="text-xs text-slate-500">
                        Vous êtes automatiquement défini comme partenaire apporteur
                      </p>
                    )}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="financier" className="space-y-6 mt-6">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-700 mb-4">Budget global</h3>
                    <div className="grid md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="budget_min">Budget minimum (€)</Label>
                        <Input
                          id="budget_min"
                          type="number"
                          value={formData.budget_min}
                          onChange={(e) => setFormData({ ...formData, budget_min: e.target.value })}
                          placeholder="Ex: 100000"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="budget_max">Budget maximum (€)</Label>
                        <Input
                          id="budget_max"
                          type="number"
                          value={formData.budget_max}
                          onChange={(e) => setFormData({ ...formData, budget_max: e.target.value })}
                          placeholder="Ex: 150000"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="budget">Budget exact (€)</Label>
                        <Input
                          id="budget"
                          type="number"
                          value={formData.budget}
                          onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                          placeholder="Si montant précis"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="border-t pt-6">
                    <h3 className="text-sm font-semibold text-slate-700 mb-4">Capacité financière</h3>
                    <div className="grid md:grid-cols-2 gap-6">

                      <div className="space-y-2">
                        <Label htmlFor="apport">Apport personnel (€)</Label>
                        <Input
                          id="apport"
                          type="number"
                          value={formData.apport}
                          onChange={(e) => setFormData({ ...formData, apport: e.target.value })}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="mode_financement">Mode de financement</Label>
                        <Select
                          value={formData.mode_financement}
                          onValueChange={(value) => setFormData({ ...formData, mode_financement: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="comptant">Comptant</SelectItem>
                            <SelectItem value="credit">Crédit</SelectItem>
                            <SelectItem value="credit_in_fine">Crédit in fine</SelectItem>
                            <SelectItem value="mixte">Mixte</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="revenus_mensuels">Revenus mensuels (€)</Label>
                        <Input
                          id="revenus_mensuels"
                          type="number"
                          value={formData.revenus_mensuels}
                          onChange={(e) => setFormData({ ...formData, revenus_mensuels: e.target.value })}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="endettement_estime">Niveau d'endettement estimé (%)</Label>
                        <Input
                          id="endettement_estime"
                          type="number"
                          value={formData.endettement_estime}
                          onChange={(e) => setFormData({ ...formData, endettement_estime: e.target.value })}
                          placeholder="Ex: 33"
                          max="100"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="courtier">Courtier</Label>
                        <Input
                          id="courtier"
                          value={formData.courtier}
                          onChange={(e) => setFormData({ ...formData, courtier: e.target.value })}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="accord_bancaire">Accord bancaire</Label>
                        <Select
                          value={formData.accord_bancaire}
                          onValueChange={(value) => setFormData({ ...formData, accord_bancaire: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="non">Non</SelectItem>
                            <SelectItem value="en_cours">En cours</SelectItem>
                            <SelectItem value="obtenu">Obtenu</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="documents" className="space-y-6 mt-6">
                {Object.entries(groupedDocuments).map(([category, docs]) => (
                  <div key={category} className="space-y-4">
                    <h3 className="font-semibold text-slate-700 text-sm border-b pb-2">{category}</h3>
                    <div className="space-y-4">
                      {docs.map((doc) => (
                        <div key={doc.key} className="space-y-2">
                          <Label className="text-sm">{doc.label}</Label>
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
                                    handleFileUpload(file, doc.key);
                                    e.target.value = '';
                                  }
                                }}
                                disabled={uploading[doc.key]}
                              />
                            </label>
                            {formData.documents?.[doc.key] && (
                              <>
                                {signedUrls[doc.key] && (
                                  <a
                                    href={signedUrls[doc.key]}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors flex items-center justify-center"
                                    title="Voir/Télécharger"
                                  >
                                    <Download className="w-4 h-4" />
                                  </a>
                                )}
                                <button
                                  type="button"
                                  onClick={() => removeFile(doc.key)}
                                  className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                                  title="Supprimer"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </TabsContent>

              <TabsContent value="commercial" className="space-y-6 mt-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="statut_commercial">Statut commercial</Label>
                    <Select
                      value={formData.statut_commercial}
                      onValueChange={(value) => setFormData({ ...formData, statut_commercial: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="prospect">Prospect</SelectItem>
                        <SelectItem value="qualifie">Qualifié</SelectItem>
                        <SelectItem value="en_negociation">En négociation</SelectItem>
                        <SelectItem value="compromis">Compromis</SelectItem>
                        <SelectItem value="acheteur">Acheteur</SelectItem>
                        <SelectItem value="perdu">Perdu</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="notes">Notes internes</Label>
                    <Textarea
                      id="notes"
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      rows={6}
                      placeholder="Notes, observations, historique des échanges..."
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