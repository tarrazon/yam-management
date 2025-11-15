
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { X, Edit, Mail, Phone, MapPin, User, Building2, FileText, Download, Home, ExternalLink, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { useSignedUrls } from "@/hooks/useSignedUrl";

const statusColors = {
  prospect: "bg-blue-100 text-blue-800 border-blue-200",
  en_negociation: "bg-yellow-100 text-yellow-800 border-yellow-200",
  mandate: "bg-green-100 text-green-800 border-green-200",
  vendu: "bg-purple-100 text-purple-800 border-purple-200",
  perdu: "bg-red-100 text-red-800 border-red-200",
};

const statusLabels = {
  prospect: "Prospect",
  en_negociation: "En négociation",
  mandate: "Mandaté",
  vendu: "Vendu",
  perdu: "Perdu",
};

const documentsParticulier = [
  { key: "cni", label: "CNI", category: "Identité" },
  { key: "livret_famille", label: "Livret de famille", category: "Identité" },
  { key: "contrat_mariage_divorce_pacs", label: "Contrat mariage/Divorce/PACS", category: "Identité" },
  { key: "questionnaire_etat_civil", label: "Questionnaire état civil", category: "Identité" },
  { key: "rib", label: "RIB", category: "Financier" },
  { key: "titre_propriete", label: "Titre de propriété", category: "Bien" },
  { key: "diagnostic", label: "Diagnostic", category: "Bien" },
  { key: "certificat_mesurage", label: "Certificat de mesurage", category: "Bien" },
  { key: "plan", label: "Plan", category: "Bien" },
  { key: "charges_2ans", label: "Charges 2 ans", category: "Bien" },
  { key: "pre_etat_date", label: "Pré état daté", category: "Bien" },
  { key: "bail_commercial", label: "Bail commercial", category: "Locatif" },
  { key: "quittances_loyers", label: "Quittances loyers", category: "Locatif" },
  { key: "convention_signee", label: "Convention signée", category: "Contractuel" },
];

const documentsEntreprise = [
  { key: "kbis", label: "Kbis", category: "Entreprise" },
  { key: "statuts", label: "Statuts", category: "Entreprise" },
  { key: "pv_ag", label: "PV AG", category: "Entreprise" },
  { key: "rib", label: "RIB", category: "Financier" },
  { key: "titre_propriete", label: "Titre de propriété", category: "Bien" },
  { key: "diagnostic", label: "Diagnostic", category: "Bien" },
  { key: "certificat_mesurage", label: "Certificat de mesurage", category: "Bien" },
  { key: "plan", label: "Plan", category: "Bien" },
  { key: "charges_2ans", label: "Charges 2 ans", category: "Bien" },
  { key: "pre_etat_date", label: "Pré état daté", category: "Bien" },
  { key: "bail_commercial", label: "Bail commercial", category: "Locatif" },
  { key: "quittances_loyers", label: "Quittances loyers", category: "Locatif" },
  { key: "convention_signee", label: "Convention signée", category: "Contractuel" },
];

export default function VendeurDetail({ vendeur, lotsAssocies = [], onClose, onEdit, onDelete }) {
  const isEntreprise = vendeur.type_vendeur === 'entreprise';
  const documents = isEntreprise ? vendeur.documents_entreprise : vendeur.documents_particulier;
  const documentsList = isEntreprise ? documentsEntreprise : documentsParticulier;
  const { urls: signedUrls, loading: urlsLoading } = useSignedUrls(documents || {});

  const groupedDocuments = documentsList.reduce((acc, doc) => {
    if (!acc[doc.category]) acc[doc.category] = [];
    acc[doc.category].push(doc);
    return acc;
  }, {});

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
              {isEntreprise ? (
                <Building2 className="w-8 h-8 text-white" />
              ) : (
                <User className="w-8 h-8 text-white" />
              )}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">
                {isEntreprise ? vendeur.nom : `${vendeur.prenom} ${vendeur.nom}`}
              </h2>
              <div className="flex gap-2 mt-2">
                <Badge className={`${statusColors[vendeur.statut_commercial]} border`}>
                  {statusLabels[vendeur.statut_commercial]}
                </Badge>
                <Badge className="bg-white/20 text-white border-white/30">
                  {isEntreprise ? "Entreprise" : "Particulier"}
                </Badge>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            {onEdit && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onEdit(vendeur)}
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
                onClick={() => onDelete(vendeur)}
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
          {/* Informations de contact */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Informations de contact</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {vendeur.email && (
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-slate-400" />
                  <a href={`mailto:${vendeur.email}`} className="text-slate-700 hover:text-[#1E40AF]">
                    {vendeur.email}
                  </a>
                </div>
              )}
              {vendeur.telephone && (
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-slate-400" />
                  <a href={`tel:${vendeur.telephone}`} className="text-slate-700 hover:text-[#1E40AF]">
                    {vendeur.telephone}
                  </a>
                </div>
              )}
              {vendeur.adresse && (
                <div className="flex items-center gap-3">
                  <MapPin className="w-4 h-4 text-slate-400" />
                  <span className="text-slate-700">{vendeur.adresse}</span>
                </div>
              )}
              {vendeur.statut_juridique && (
                <div className="pt-3 border-t">
                  <p className="text-sm text-slate-500">
                    Statut juridique : <span className="font-medium text-slate-700">{vendeur.statut_juridique}</span>
                  </p>
                </div>
              )}
              {!isEntreprise && vendeur.situation_familiale && (
                <div>
                  <p className="text-sm text-slate-500">
                    Situation familiale : <span className="font-medium text-slate-700">{vendeur.situation_familiale}</span>
                  </p>
                </div>
              )}
              {vendeur.profession && (
                <div>
                  <p className="text-sm text-slate-500">
                    Profession : <span className="font-medium text-slate-700">{vendeur.profession}</span>
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Lots associés */}
          {lotsAssocies && lotsAssocies.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Home className="w-5 h-5 text-[#F59E0B]" />
                  Lots associés ({lotsAssocies.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {lotsAssocies.map((lot) => (
                    <Link
                      key={lot.id}
                      to={createPageUrl("LotsLMNP")}
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 transition-colors group"
                    >
                      <div>
                        <p className="font-semibold text-slate-700 group-hover:text-[#1E40AF]">
                          Lot {lot.reference}
                        </p>
                        <p className="text-sm text-slate-500">{lot.residence_nom}</p>
                      </div>
                      <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-[#1E40AF]" />
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Documents */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#F59E0B]" />
                Documents
              </CardTitle>
            </CardHeader>
            <CardContent>
              {Object.entries(groupedDocuments).map(([category, docs]) => (
                <div key={category} className="mb-6 last:mb-0">
                  <h4 className="font-semibold text-sm text-slate-600 mb-3 border-b pb-2">{category}</h4>
                  <div className="grid md:grid-cols-2 gap-3">
                    {docs.map((doc) => {
                      const hasDocument = documents?.[doc.key];
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
                          {hasDocument && signedUrls[doc.key] && (
                            <a
                              href={signedUrls[doc.key]}
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
          {vendeur.notes && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Notes internes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-700 whitespace-pre-wrap">{vendeur.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
