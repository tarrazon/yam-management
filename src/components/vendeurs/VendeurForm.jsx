import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { X, Save, Upload, FileText, CheckCircle2, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";

export default function VendeurForm({ vendeur, onSubmit, onCancel, isLoading }) {
  const [formData, setFormData] = useState(vendeur || {
    type_vendeur: "particulier",
    nom: "",
    prenom: "",
    adresse: "",
    telephone: "",
    email: "",
    statut_juridique: "proprietaire",
    situation_familiale: "marie",
    profession: "",
    situation_financiere: "",
    source_contact: "site_web",
    statut_commercial: "prospect",
    documents_particulier: {},
    documents_entreprise: {},
    notes: "",
  });

  const [uploading, setUploading] = useState({});

  const handleFileUpload = async (file, docKey) => {
    setUploading(prev => ({ ...prev, [docKey]: true }));
    try {
      const result = await base44.integrations.Core.UploadFile({ file });
      const documentsKey = formData.type_vendeur === 'entreprise' ? 'documents_entreprise' : 'documents_particulier';
      setFormData({
        ...formData,
        [documentsKey]: {
          ...formData[documentsKey],
          [docKey]: result.file_url
        }
      });
    } catch (error) {
      alert("Erreur lors de l'upload du document");
    } finally {
      setUploading(prev => ({ ...prev, [docKey]: false }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const isEntreprise = formData.type_vendeur === 'entreprise';
  const documents = isEntreprise ? formData.documents_entreprise : formData.documents_particulier;

  const documentCategories = isEntreprise ? [
    {
      title: "Documents entreprise",
      items: [
        { key: "kbis", label: "Kbis" },
        { key: "statuts", label: "Statuts de la société" },
        { key: "pv_ag", label: "PV AG autorisant la vente" },
      ]
    },
    {
      title: "Documents financiers",
      items: [
        { key: "rib", label: "RIB" },
      ]
    },
    {
      title: "Documents du bien",
      items: [
        { key: "titre_propriete", label: "Titre de propriété" },
        { key: "diagnostic", label: "Diagnostic" },
        { key: "certificat_mesurage", label: "Certificat de mesurage" },
        { key: "plan", label: "Plan" },
        { key: "charges_2ans", label: "Charges des 2 dernières années" },
        { key: "pre_etat_date", label: "Pré état daté" },
      ]
    },
    {
      title: "Documents locatifs",
      items: [
        { key: "bail_commercial", label: "Bail commercial + avenants" },
        { key: "quittances_loyers", label: "3 dernières quittances de loyers" },
      ]
    },
    {
      title: "Documents contractuels",
      items: [
        { key: "convention_signee", label: "Convention signée (DocuSign)" },
      ]
    }
  ] : [
    {
      title: "Documents d'identité et état civil",
      items: [
        { key: "cni", label: "CNI" },
        { key: "livret_famille", label: "Livret de famille" },
        { key: "contrat_mariage_divorce_pacs", label: "Contrat mariage / Jugement divorce / PACS" },
        { key: "questionnaire_etat_civil", label: "Questionnaire état civil" },
      ]
    },
    {
      title: "Documents financiers",
      items: [
        { key: "rib", label: "RIB" },
      ]
    },
    {
      title: "Documents du bien",
      items: [
        { key: "titre_propriete", label: "Titre de propriété" },
        { key: "diagnostic", label: "Diagnostic" },
        { key: "certificat_mesurage", label: "Certificat de mesurage" },
        { key: "plan", label: "Plan" },
        { key: "charges_2ans", label: "Charges des 2 dernières années" },
        { key: "pre_etat_date", label: "Pré état daté" },
      ]
    },
    {
      title: "Documents locatifs",
      items: [
        { key: "bail_commercial", label: "Bail commercial + avenants" },
        { key: "quittances_loyers", label: "3 dernières quittances de loyers" },
      ]
    },
    {
      title: "Documents contractuels",
      items: [
        { key: "convention_signee", label: "Convention signée (DocuSign)" },
      ]
    }
  ];

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
            {vendeur ? "Modifier le vendeur" : "Nouveau vendeur"}
          </CardTitle>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="p-6">
            <Tabs defaultValue="general" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="general">Informations générales</TabsTrigger>
                <TabsTrigger value="documents">Documents</TabsTrigger>
                <TabsTrigger value="commercial">Suivi commercial</TabsTrigger>
              </TabsList>

              <TabsContent value="general" className="space-y-6 mt-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="type_vendeur">Type de vendeur *</Label>
                    <Select
                      value={formData.type_vendeur}
                      onValueChange={(value) => setFormData({ ...formData, type_vendeur: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="particulier">Particulier</SelectItem>
                        <SelectItem value="entreprise">Entreprise</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="nom">{isEntreprise ? "Raison sociale" : "Nom"} *</Label>
                    <Input
                      id="nom"
                      value={formData.nom}
                      onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                      required
                    />
                  </div>

                  {!isEntreprise && (
                    <div className="space-y-2">
                      <Label htmlFor="prenom">Prénom</Label>
                      <Input
                        id="prenom"
                        value={formData.prenom}
                        onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
                      />
                    </div>
                  )}

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
                    <Label htmlFor="statut_juridique">Statut juridique</Label>
                    <Select
                      value={formData.statut_juridique}
                      onValueChange={(value) => setFormData({ ...formData, statut_juridique: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="proprietaire">Propriétaire</SelectItem>
                        <SelectItem value="mandataire">Mandataire</SelectItem>
                        <SelectItem value="sci">SCI</SelectItem>
                        <SelectItem value="indivision">Indivision</SelectItem>
                        <SelectItem value="succession">Succession</SelectItem>
                        <SelectItem value="autre">Autre</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {!isEntreprise && (
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
                          <SelectItem value="separe">Séparé</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="profession">Profession</Label>
                    <Input
                      id="profession"
                      value={formData.profession}
                      onChange={(e) => setFormData({ ...formData, profession: e.target.value })}
                    />
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
                        <SelectItem value="recommandation">Recommandation</SelectItem>
                        <SelectItem value="publicite">Publicité</SelectItem>
                        <SelectItem value="site_web">Site web</SelectItem>
                        <SelectItem value="partenaire">Partenaire</SelectItem>
                        <SelectItem value="prospection">Prospection</SelectItem>
                        <SelectItem value="autre">Autre</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="documents" className="space-y-6 mt-6">
                {documentCategories.map((category) => (
                  <div key={category.title} className="space-y-4">
                    <h3 className="font-semibold text-slate-700 text-sm border-b pb-2">
                      {category.title}
                    </h3>
                    <div className="grid gap-4">
                      {category.items.map((doc) => (
                        <div key={doc.key} className="space-y-2">
                          <Label htmlFor={doc.key} className="text-sm">
                            {doc.label}
                          </Label>
                          <div className="flex gap-2">
                            <div className="flex-1">
                              <label className="flex items-center justify-center gap-2 px-4 py-2 border-2 border-dashed border-slate-300 rounded-lg cursor-pointer hover:border-[#1E40AF] hover:bg-slate-50 transition-colors">
                                {uploading[doc.key] ? (
                                  <>
                                    <Loader2 className="w-4 h-4 animate-spin text-[#1E40AF]" />
                                    <span className="text-sm text-slate-600">Upload en cours...</span>
                                  </>
                                ) : documents?.[doc.key] ? (
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
                                    if (file) handleFileUpload(file, doc.key);
                                  }}
                                  disabled={uploading[doc.key]}
                                />
                              </label>
                            </div>
                            {documents?.[doc.key] && (
                              <a
                                href={documents[doc.key]}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-center px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                              >
                                <FileText className="w-4 h-4" />
                              </a>
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
                        <SelectItem value="en_negociation">En négociation</SelectItem>
                        <SelectItem value="mandate">Mandaté</SelectItem>
                        <SelectItem value="vendu">Vendu</SelectItem>
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