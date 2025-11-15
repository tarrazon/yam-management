import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  X,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  FileText,
  AlertCircle,
  CheckCircle,
  Circle,
  ChevronRight,
  Building2,
  Users,
  Home,
  Edit,
  Download
} from "lucide-react";
import { motion } from "framer-motion";
import { useDocumentsManquants } from "@/hooks/useDocumentsManquants";
import { useSignedUrls } from "@/hooks/useSignedUrl";

const statusColors = {
  sous_option: "bg-blue-100 text-blue-800",
  reserve: "bg-yellow-100 text-yellow-800",
  compromis: "bg-orange-100 text-orange-800",
  vendu: "bg-purple-100 text-purple-800",
};

const statusLabels = {
  sous_option: "Sous option",
  reserve: "Réservé",
  compromis: "Compromis",
  vendu: "Vendu",
};

const PIPELINE_STEPS = [
  { key: 'sous_option', label: 'Option', icon: Circle },
  { key: 'reserve', label: 'Réservé', icon: CheckCircle },
  { key: 'compromis', label: 'Compromis', icon: FileText },
  { key: 'vendu', label: 'Vendu', icon: CheckCircle },
];

const documentsConfig = [
  { key: "cni", label: "CNI", category: "Identité" },
  { key: "passeport", label: "Passeport", category: "Identité" },
  { key: "justificatif_domicile", label: "Justificatif de domicile", category: "Identité" },
  { key: "lettre_intention_achat", label: "Lettre d'intention d'achat", category: "Documents contractuels" },
  { key: "mandat_gestion", label: "Mandat de gestion", category: "Documents contractuels" },
  { key: "mandat_acquereur_honoraires", label: "Mandat acquéreur pour honoraires", category: "Documents contractuels" },
];

export default function AcquereurDetailPartenaire({ acquereur, lot, onClose, onEdit }) {
  const { documentsManquantsAcquereur } = useDocumentsManquants(lot || {});
  const documents = acquereur.documents || {};
  const { urls: signedUrls, loading: urlsLoading } = useSignedUrls(documents);

  const groupedDocuments = documentsConfig.reduce((acc, doc) => {
    if (!acc[doc.category]) acc[doc.category] = [];
    acc[doc.category].push(doc);
    return acc;
  }, {});

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
      return new Date(dateString).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    } catch {
      return '-';
    }
  };

  const getCurrentStepIndex = () => {
    if (!lot?.statut) return -1;
    return PIPELINE_STEPS.findIndex(step => step.key === lot.statut);
  };

  const currentStepIndex = getCurrentStepIndex();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-xl shadow-2xl w-full max-w-4xl my-8"
      >
        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 rounded-t-xl flex items-center justify-between z-10">
          <div>
            <h2 className="text-2xl font-bold text-[#1E40AF]">
              {acquereur.prenom} {acquereur.nom}
            </h2>
            <p className="text-sm text-slate-500 mt-1">Détails de l'acquéreur</p>
          </div>
          <div className="flex gap-2">
            {onEdit && (
              <Button
                onClick={() => onEdit(acquereur)}
                variant="outline"
                size="sm"
                className="gap-2"
              >
                <Edit className="w-4 h-4" />
                Modifier
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-slate-500 hover:text-slate-700"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        <div className="p-6 space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto">

          {/* Informations personnelles */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="w-5 h-5 text-[#1E40AF]" />
                Informations personnelles
              </CardTitle>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-slate-500 mb-1">Email</p>
                <p className="flex items-center gap-2 text-slate-800">
                  <Mail className="w-4 h-4 text-[#1E40AF]" />
                  {acquereur.email || '-'}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-500 mb-1">Téléphone</p>
                <p className="flex items-center gap-2 text-slate-800">
                  <Phone className="w-4 h-4 text-[#1E40AF]" />
                  {acquereur.telephone || '-'}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-500 mb-1">Adresse</p>
                <p className="flex items-center gap-2 text-slate-800">
                  <MapPin className="w-4 h-4 text-[#1E40AF]" />
                  {acquereur.adresse || '-'}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-500 mb-1">Date d'entrée CRM</p>
                <p className="flex items-center gap-2 text-slate-800">
                  <Calendar className="w-4 h-4 text-[#1E40AF]" />
                  {formatDate(acquereur.date_entree_crm)}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Informations du lot si disponible */}
          {lot && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Home className="w-5 h-5 text-[#1E40AF]" />
                    Lot associé
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-lg text-[#1E40AF]">{lot.reference}</p>
                      <p className="text-sm text-slate-600">{lot.residence_nom}</p>
                    </div>
                    <Badge className={statusColors[lot.statut]}>
                      {statusLabels[lot.statut]}
                    </Badge>
                  </div>
                  <Separator />
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-slate-500">Prix FAI</p>
                      <p className="font-semibold text-slate-800">
                        {lot.prix_fai?.toLocaleString('fr-FR')} €
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Type</p>
                      <p className="font-semibold text-slate-800">{lot.type_lot || '-'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Pipeline de progression */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <FileText className="w-5 h-5 text-[#1E40AF]" />
                    Progression du dossier
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between gap-2">
                    {PIPELINE_STEPS.map((step, index) => {
                      const StepIcon = step.icon;
                      const isCompleted = index <= currentStepIndex;
                      const isCurrent = index === currentStepIndex;

                      return (
                        <React.Fragment key={step.key}>
                          <div className="flex flex-col items-center flex-1">
                            <div className={`
                              w-12 h-12 rounded-full flex items-center justify-center transition-all
                              ${isCurrent ? 'bg-[#1E40AF] ring-4 ring-blue-100' : ''}
                              ${isCompleted && !isCurrent ? 'bg-green-500' : ''}
                              ${!isCompleted ? 'bg-slate-200' : ''}
                            `}>
                              <StepIcon className={`
                                w-6 h-6
                                ${isCompleted ? 'text-white' : 'text-slate-400'}
                              `} />
                            </div>
                            <p className={`
                              text-xs mt-2 text-center font-medium
                              ${isCurrent ? 'text-[#1E40AF]' : ''}
                              ${isCompleted && !isCurrent ? 'text-green-600' : ''}
                              ${!isCompleted ? 'text-slate-400' : ''}
                            `}>
                              {step.label}
                            </p>
                          </div>

                          {index < PIPELINE_STEPS.length - 1 && (
                            <ChevronRight className={`
                              w-5 h-5 flex-shrink-0 -mx-2
                              ${index < currentStepIndex ? 'text-green-500' : 'text-slate-300'}
                            `} />
                          )}
                        </React.Fragment>
                      );
                    })}
                  </div>

                  <div className="mt-6 pt-6 border-t border-slate-100 grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-slate-500 mb-1">Date de prise d'option</p>
                      <p className="text-sm font-medium text-slate-800">
                        {formatDate(lot.date_prise_option)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500 mb-1">Date signature compromis</p>
                      <p className="text-sm font-medium text-slate-800">
                        {formatDate(lot.date_signature_compromis)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Documents */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <FileText className="w-5 h-5 text-[#1E40AF]" />
                    Documents
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {Object.entries(groupedDocuments).map(([category, docs]) => (
                    <div key={category} className="mb-6 last:mb-0">
                      <h4 className="font-semibold text-sm text-slate-600 mb-3 border-b pb-2">{category}</h4>
                      <div className="space-y-2">
                        {docs.map((doc) => {
                          const hasDocument = documents[doc.key];
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

              {/* Documents manquants Acquéreur uniquement */}
              {documentsManquantsAcquereur.length > 0 && (
                <Card className="border-2 border-blue-200">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <AlertCircle className="w-5 h-5 text-blue-600" />
                      Documents manquants
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
                      <div className="flex items-center gap-2 mb-3">
                        <Users className="w-4 h-4 text-blue-600" />
                        <p className="text-sm font-bold text-blue-800">
                          Vos documents manquants
                        </p>
                      </div>
                      <ul className="space-y-2">
                        {documentsManquantsAcquereur.map((doc, idx) => (
                          <li key={idx} className="flex items-center gap-2 text-sm text-blue-700">
                            <div className="w-2 h-2 rounded-full bg-blue-500" />
                            {doc}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="p-3 bg-blue-100 rounded-lg border border-blue-200">
                      <p className="text-xs text-blue-800 font-medium">
                        ℹ️ Ces documents sont nécessaires pour finaliser votre dossier. Veuillez les fournir dans les plus brefs délais.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}

          {/* Observations */}
          {acquereur.observations && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="w-5 h-5 text-[#1E40AF]" />
                  Observations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-700 whitespace-pre-wrap">{acquereur.observations}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
