
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { X, Edit, Mail, Phone, MapPin, Building2, FileText, Download, Image, TrendingUp, Users, Contact, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { useSignedUrls } from "@/hooks/useSignedUrl";
import StorageImage from "@/components/common/StorageImage";

const statusColors = {
  active: "bg-green-100 text-green-800 border-green-200",
  en_renovation: "bg-yellow-100 text-yellow-800 border-yellow-200",
  en_liquidation: "bg-red-100 text-red-800 border-red-200",
  fermee: "bg-slate-100 text-slate-800 border-slate-200",
};

const statusLabels = {
  active: "Active",
  en_renovation: "En rénovation",
  en_liquidation: "En liquidation",
  fermee: "Fermée",
};

const typeLabels = {
  ehpad: "EHPAD",
  etudiante: "Étudiante",
  affaires: "Affaires",
  tourisme: "Tourisme",
  senior: "Senior",
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

export default function ResidenceGestionDetail({ residence, lotsCount, onClose, onEdit, onDelete }) {
  const documents = residence.documents || {};

  const groupedDocuments = documentsConfig.reduce((acc, doc) => {
    if (!acc[doc.category]) acc[doc.category] = [];
    acc[doc.category].push(doc);
    return acc;
  }, {});

  const photos = documents.photos || [];

  // Générer les URLs signées pour tous les documents
  const { urls: signedDocUrls } = useSignedUrls(documents);

  // Générer les URLs signées pour les photos
  const photoUrlsObj = photos.reduce((acc, photo, index) => {
    acc[`photo_${index}`] = photo;
    return acc;
  }, {});
  const { urls: signedPhotoUrls } = useSignedUrls(photoUrlsObj);

  // Récupérer les contacts liés à cette résidence
  const { data: contacts = [] } = useQuery({
    queryKey: ['contacts_residence', residence.id],
    queryFn: () => base44.entities.ContactResidence.list(),
  });

  const residenceContacts = contacts.filter(c => c.residence_id === residence.id);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 overflow-y-auto"
      style={{ zIndex: 9999 }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 20 }}
        className="bg-white rounded-xl shadow-2xl max-w-5xl w-full my-8 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b border-slate-200 bg-gradient-to-r from-[#1E40AF] to-[#1E3A8A] flex-shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
              <Building2 className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">{residence.nom}</h2>
              <div className="flex gap-2 mt-2">
                <Badge className={`${statusColors[residence.statut]} border`}>
                  {statusLabels[residence.statut]}
                </Badge>
                <Badge className="bg-white/20 text-white border-white/30">
                  {typeLabels[residence.type_residence]}
                </Badge>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            {onEdit && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onEdit(residence)}
                className="text-white hover:bg-white/20"
                title="Modifier"
              >
                <Edit className="w-5 h-5" />
              </Button>
            )}
            {onDelete && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDelete(residence)}
                className="text-white hover:bg-red-500/20"
                title="Supprimer"
              >
                <Trash2 className="w-5 h-5" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-white hover:bg-white/20"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Photos */}
          {photos.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Image className="w-5 h-5 text-[#F59E0B]" />
                  Photos ({photos.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {photos.map((photo, index) => {
                    const signedUrl = signedPhotoUrls[`photo_${index}`];
                    return (
                      <a
                        key={index}
                        href={signedUrl || '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="relative aspect-video rounded-lg overflow-hidden hover:opacity-80 transition-opacity group"
                        onClick={(e) => !signedUrl && e.preventDefault()}
                      >
                        <StorageImage
                          src={photo}
                          alt={`Photo ${index + 1}`}
                          className="w-full h-full object-cover"
                          fallback={
                            <div className="w-full h-full flex items-center justify-center bg-slate-100">
                              <Image className="w-8 h-8 text-slate-400" />
                            </div>
                          }
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                          <Download className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </a>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Informations générales */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Informations générales</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-slate-400" />
                <div>
                  <p className="text-slate-700">{residence.adresse}</p>
                  <p className="text-sm text-slate-500">{residence.code_postal} {residence.ville}</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4 pt-3 border-t">
                {residence.nombre_lots_total !== undefined && (
                  <div>
                    <p className="text-xs text-slate-500">Nombre de lots total</p>
                    <p className="text-lg font-bold text-[#1E40AF]">{residence.nombre_lots_total}</p>
                  </div>
                )}
                {lotsCount !== undefined && (
                  <div>
                    <p className="text-xs text-slate-500">Lots en portefeuille</p>
                    <p className="text-lg font-bold text-[#F59E0B]">{lotsCount}</p>
                  </div>
                )}
                {residence.taux_occupation !== undefined && (
                  <div>
                    <p className="text-xs text-slate-500">Taux d'occupation</p>
                    <p className="text-lg font-bold text-green-600">{residence.taux_occupation}%</p>
                  </div>
                )}
                {residence.rentabilite_moyenne !== undefined && (
                  <div>
                    <p className="text-xs text-slate-500">Rentabilité moyenne</p>
                    <p className="text-lg font-bold text-green-600">{residence.rentabilite_moyenne}%</p>
                  </div>
                )}
                {residence.annee_construction && (
                  <div>
                    <p className="text-xs text-slate-500">Année de construction</p>
                    <p className="text-lg font-bold text-slate-700">{residence.annee_construction}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Gestionnaire */}
          {residence.gestionnaire && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Gestionnaire</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="font-semibold text-slate-700">{residence.gestionnaire}</p>
                {residence.gestionnaire_email && (
                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-slate-400" />
                    <a href={`mailto:${residence.gestionnaire_email}`} className="text-slate-700 hover:text-[#1E40AF]">
                      {residence.gestionnaire_email}
                    </a>
                  </div>
                )}
                {residence.gestionnaire_telephone && (
                  <div className="flex items-center gap-3">
                    <Phone className="w-4 h-4 text-slate-400" />
                    <a href={`tel:${residence.gestionnaire_telephone}`} className="text-slate-700 hover:text-[#1E40AF]">
                      {residence.gestionnaire_telephone}
                    </a>
                  </div>
                )}
                {residence.classement_qualite && (
                  <div className="pt-3 border-t">
                    <p className="text-sm text-slate-500">
                      Classement qualité : <span className="font-medium text-slate-700 uppercase">{residence.classement_qualite}</span>
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Contacts de la résidence (admin seulement) */}
          {onEdit && residenceContacts.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Contact className="w-5 h-5 text-[#F59E0B]" />
                  Contacts de la résidence ({residenceContacts.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {residenceContacts.map((contact, index) => (
                    <div key={contact.id} className={`p-4 rounded-lg border ${
                      contact.type_contact === 'gestionnaire_site' ? 'bg-blue-50 border-blue-200' :
                      contact.type_contact === 'syndic' ? 'bg-purple-50 border-purple-200' :
                      contact.type_contact === 'association_copro' ? 'bg-green-50 border-green-200' :
                      'bg-amber-50 border-amber-200'
                    }`}>
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-semibold text-slate-700">{contact.nom}</p>
                          <Badge className={`mt-1 ${
                            contact.type_contact === 'gestionnaire_site' ? 'bg-blue-100 text-blue-800' :
                            contact.type_contact === 'syndic' ? 'bg-purple-100 text-purple-800' :
                            contact.type_contact === 'association_copro' ? 'bg-green-100 text-green-800' :
                            'bg-amber-100 text-amber-800'
                          }`}>
                            {contact.type_contact === 'gestionnaire_site' && 'Gestionnaire site'}
                            {contact.type_contact === 'syndic' && 'Syndic'}
                            {contact.type_contact === 'association_copro' && 'Association copro'}
                            {contact.type_contact === 'mairie' && 'Mairie'}
                          </Badge>
                        </div>
                      </div>
                      {contact.fonction && (
                        <p className="text-sm text-slate-600 mb-2">{contact.fonction}</p>
                      )}
                      <div className="space-y-1">
                        {contact.telephone && (
                          <div className="flex items-center gap-2 text-sm">
                            <Phone className="w-3 h-3 text-slate-400" />
                            <a href={`tel:${contact.telephone}`} className="text-slate-700 hover:text-[#1E40AF]">
                              {contact.telephone}
                            </a>
                          </div>
                        )}
                        {contact.email && (
                          <div className="flex items-center gap-2 text-sm">
                            <Mail className="w-3 h-3 text-slate-400" />
                            <a href={`mailto:${contact.email}`} className="text-slate-700 hover:text-[#1E40AF]">
                              {contact.email}
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Performances */}
          {(residence.satisfaction_investisseurs || residence.historique_baux || residence.etat_general) && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Performances et état</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {residence.satisfaction_investisseurs && (
                  <div>
                    <p className="text-sm text-slate-500">Satisfaction des investisseurs</p>
                    <p className="font-medium text-slate-700 capitalize">{residence.satisfaction_investisseurs.replace('_', ' ')}</p>
                  </div>
                )}
                {residence.historique_baux && (
                  <div className="pt-3 border-t">
                    <p className="text-sm text-slate-500 mb-2">Historique des baux</p>
                    <p className="text-slate-700 whitespace-pre-wrap">{residence.historique_baux}</p>
                  </div>
                )}
                {residence.etat_general && (
                  <div className="pt-3 border-t">
                    <p className="text-sm text-slate-500 mb-2">État général</p>
                    <p className="text-slate-700 whitespace-pre-wrap">{residence.etat_general}</p>
                  </div>
                )}
                {residence.classement_details && (
                  <div className="pt-3 border-t">
                    <p className="text-sm text-slate-500 mb-2">Détails du classement</p>
                    <p className="text-slate-700 whitespace-pre-wrap">{residence.classement_details}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Documents */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#F59E0B]" />
                Pièces jointes
              </CardTitle>
            </CardHeader>
            <CardContent>
              {Object.entries(groupedDocuments).map(([category, docs]) => (
                <div key={category} className="mb-6 last:mb-0">
                  <h4 className="font-semibold text-sm text-slate-600 mb-3 border-b pb-2">{category}</h4>
                  <div className="space-y-2">
                    {docs.map((doc) => {
                      const hasDocument = doc.multiple 
                        ? documents[doc.key]?.length > 0 
                        : documents[doc.key];
                      
                      if (doc.multiple && documents[doc.key]?.length > 0) {
                        return (
                          <div key={doc.key} className="space-y-1">
                            <p className="text-sm font-medium text-slate-700">{doc.label}</p>
                            {documents[doc.key].map((url, index) => (
                              <div
                                key={index}
                                className="flex items-center justify-between p-3 rounded-lg bg-green-50 border border-green-200 ml-4"
                              >
                                <div className="flex items-center gap-3">
                                  <FileText className="w-4 h-4 text-green-600" />
                                  <span className="text-sm text-green-900 font-medium">
                                    {doc.label} {index + 1}
                                  </span>
                                </div>
                                <a
                                  href={url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-green-600 hover:text-green-800"
                                >
                                  <Download className="w-4 h-4" />
                                </a>
                              </div>
                            ))}
                          </div>
                        );
                      }

                      return (
                        <div
                          key={doc.key}
                          className={`flex items-center justify-between p-3 rounded-lg ${
                            hasDocument 
                              ? 'bg-green-50 border border-green-200' 
                              : 'bg-slate-50 border border-slate-200'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <FileText className={`w-4 h-4 ${hasDocument ? 'text-green-600' : 'text-slate-400'}`} />
                            <span className={`text-sm ${hasDocument ? 'text-green-900 font-medium' : 'text-slate-500'}`}>
                              {doc.label}
                            </span>
                          </div>
                          {hasDocument && signedDocUrls[doc.key] && (
                            <a
                              href={signedDocUrls[doc.key]}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-green-600 hover:text-green-800"
                            >
                              <Download className="w-4 h-4" />
                            </a>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Notes */}
          {residence.notes && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Notes internes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-700 whitespace-pre-wrap">{residence.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
