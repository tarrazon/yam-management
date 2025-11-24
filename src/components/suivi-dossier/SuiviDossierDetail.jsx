import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { X, Edit, Calendar, Users, FileText, Euro, CheckCircle, Building2, AlertCircle, ListChecks } from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useDocumentsManquants } from "@/hooks/useDocumentsManquants";
import SuiviPipeline from "./SuiviPipeline";
import { WorkflowTimeline } from "../workflow/WorkflowTimeline";

const statusColors = {
  sous_option: "bg-blue-100 text-blue-800 border-blue-200",
  reserve: "bg-yellow-100 text-yellow-800 border-yellow-200",
  compromis: "bg-orange-100 text-orange-800 border-orange-200",
  vendu: "bg-purple-100 text-purple-800 border-purple-200",
};

const statusLabels = {
  sous_option: "Sous option",
  reserve: "Réservé",
  compromis: "Compromis",
  vendu: "Vendu",
};

export default function SuiviDossierDetail({ lot, onClose, onEdit, readOnly = false }) {
  const [refreshKey, setRefreshKey] = useState(0);
  const { documentsManquantsAcquereur, documentsManquantsVendeur } = useDocumentsManquants(lot);

  const handleWorkflowUpdate = () => {
    setRefreshKey(prev => prev + 1);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
      return format(new Date(dateString), 'dd MMMM yyyy', { locale: fr });
    } catch {
      return '-';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 20 }}
        className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b border-slate-200 bg-gradient-to-r from-[#1E40AF] to-[#1E3A8A]">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
              <FileText className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Suivi - Lot {lot.reference}</h2>
              <div className="flex gap-2 mt-2">
                <Badge className={`${statusColors[lot.statut]} border`}>
                  {statusLabels[lot.statut]}
                </Badge>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            {onEdit && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onEdit(lot)}
                className="text-white hover:bg-white/20"
              >
                <Edit className="w-5 h-5" />
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
          {/* Pipeline visuel */}
          <Card className="border-2 border-slate-200 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-slate-50 to-white">
              <CardTitle className="text-lg flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-[#F59E0B]" />
                Parcours du dossier
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <SuiviPipeline lot={lot} />
            </CardContent>
          </Card>

          {/* Workflow acquéreur */}
          <Card className="border-2 border-slate-200 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-slate-50 to-white">
              <CardTitle className="text-lg flex items-center gap-2">
                <ListChecks className="w-5 h-5 text-[#F59E0B]" />
                Étapes du dossier acquéreur
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <WorkflowTimeline key={refreshKey} lotId={lot.id} onUpdate={handleWorkflowUpdate} workflowType="acquereur" readOnly={readOnly} />
            </CardContent>
          </Card>

          {/* Workflow vendeur */}
          {lot.vendeur_id && (
            <Card className="border-2 border-slate-200 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-slate-50 to-white">
                <CardTitle className="text-lg flex items-center gap-2">
                  <ListChecks className="w-5 h-5 text-[#F59E0B]" />
                  Étapes du dossier vendeur
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <WorkflowTimeline key={refreshKey} lotId={lot.id} onUpdate={handleWorkflowUpdate} workflowType="vendeur" readOnly={readOnly} />
              </CardContent>
            </Card>
          )}

          {/* Informations du lot */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Building2 className="w-5 h-5 text-[#F59E0B]" />
                Informations du lot
              </CardTitle>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-slate-500">Résidence</p>
                <p className="font-semibold text-slate-700">{lot.residence_nom}</p>
              </div>
              {lot.typologie && (
                <div>
                  <p className="text-xs text-slate-500">Type</p>
                  <p className="font-semibold text-slate-700">{lot.typologie}</p>
                </div>
              )}
              {lot.prix_fai != null && (
                <div>
                  <p className="text-xs text-slate-500">Prix FAI</p>
                  <p className="text-xl font-bold text-[#1E40AF]">
                    {lot.prix_fai.toLocaleString('fr-FR')} €
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Intervenants */}
          {(lot.partenaire_nom || lot.acquereur_nom) && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Users className="w-5 h-5 text-[#F59E0B]" />
                  Intervenants
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {lot.partenaire_nom && (
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-700 font-medium mb-1">Partenaire apporteur</p>
                    <p className="text-lg font-bold text-blue-800">{lot.partenaire_nom}</p>
                  </div>
                )}
                {lot.acquereur_nom && (
                  <div className="p-4 bg-green-50 rounded-lg">
                    <p className="text-sm text-green-700 font-medium mb-1">Acquéreur</p>
                    <p className="text-lg font-bold text-green-800">{lot.acquereur_nom}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Timeline des dates */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="w-5 h-5 text-[#F59E0B]" />
                Chronologie
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {lot.date_premier_contact && (
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0">
                      <Calendar className="w-5 h-5 text-slate-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-slate-700">Premier contact</p>
                      <p className="text-sm text-slate-500">{formatDate(lot.date_premier_contact)}</p>
                    </div>
                  </div>
                )}

                {lot.date_prise_option && (
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-blue-700">Prise d'option</p>
                      <p className="text-sm text-blue-600">{formatDate(lot.date_prise_option)}</p>
                    </div>
                  </div>
                )}

                {lot.date_signature_compromis && (
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                      <FileText className="w-5 h-5 text-orange-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-orange-700">Signature du compromis</p>
                      <p className="text-sm text-orange-600">{formatDate(lot.date_signature_compromis)}</p>
                    </div>
                  </div>
                )}

                {lot.date_signature_acte && (
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="w-5 h-5 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-purple-700">Signature de l'acte authentique</p>
                      <p className="text-sm text-purple-600">{formatDate(lot.date_signature_acte)}</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Statut du suivi */}
          {(lot.statut_suivi || lot.statut_suivi_libre || lot.observations_suivi) && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-[#F59E0B]" />
                  Statut du suivi
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {lot.statut_suivi && (
                  <div className="flex items-center gap-3">
                    <Badge className={`
                      ${lot.statut_suivi === 'en_cours' ? 'bg-blue-100 text-blue-800' : ''}
                      ${lot.statut_suivi === 'signe' ? 'bg-green-100 text-green-800' : ''}
                      ${lot.statut_suivi === 'reporte' ? 'bg-orange-100 text-orange-800' : ''}
                    `}>
                      {lot.statut_suivi === 'en_cours' && 'En cours'}
                      {lot.statut_suivi === 'signe' && 'Signé'}
                      {lot.statut_suivi === 'reporte' && 'Reporté'}
                    </Badge>
                    {lot.statut_suivi_libre && (
                      <span className="text-sm text-slate-600 font-medium">
                        {lot.statut_suivi_libre}
                      </span>
                    )}
                  </div>
                )}
                {lot.observations_suivi && (
                  <div className="p-4 bg-slate-50 rounded-lg">
                    <p className="text-sm text-slate-700 font-medium mb-2">Observations</p>
                    <p className="text-sm text-slate-600 whitespace-pre-wrap">{lot.observations_suivi}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Documents manquants */}
          {(documentsManquantsAcquereur.length > 0 || documentsManquantsVendeur.length > 0) && (
            <Card className="border-2 border-slate-200">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-slate-600" />
                  Documents manquants
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {documentsManquantsAcquereur.length > 0 && (
                  <div className="p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
                    <div className="flex items-center gap-2 mb-3">
                      <Users className="w-4 h-4 text-blue-600" />
                      <p className="text-sm font-bold text-blue-800">
                        Acquéreur : {lot.acquereur_nom}
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
                )}

                {documentsManquantsVendeur.length > 0 && (
                  <div className="p-4 bg-orange-50 rounded-lg border-2 border-orange-200">
                    <div className="flex items-center gap-2 mb-3">
                      <Building2 className="w-4 h-4 text-orange-600" />
                      <p className="text-sm font-bold text-orange-800">
                        Vendeur : {lot.vendeur_nom}
                      </p>
                    </div>
                    <ul className="space-y-2">
                      {documentsManquantsVendeur.map((doc, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-sm text-orange-700">
                          <div className="w-2 h-2 rounded-full bg-orange-500" />
                          {doc}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="p-3 bg-orange-100 rounded-lg border border-orange-200">
                  <p className="text-xs text-orange-800 font-medium">
                    ⚠️ Ces documents sont nécessaires pour finaliser le dossier. Contactez les parties concernées pour obtenir les pièces manquantes.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Comptes-rendus et observations */}
          {(lot.comptes_rendus_visite || lot.observations_acquereurs || lot.negociation_en_cours) && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="w-5 h-5 text-[#F59E0B]" />
                  Suivi commercial
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {lot.comptes_rendus_visite && (
                  <div className="p-4 bg-slate-50 rounded-lg">
                    <p className="text-sm text-slate-700 font-medium mb-2">Comptes-rendus de visite</p>
                    <p className="text-sm text-slate-600 whitespace-pre-wrap">{lot.comptes_rendus_visite}</p>
                  </div>
                )}

                {lot.observations_acquereurs && (
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-700 font-medium mb-2">Observations acquéreurs</p>
                    <p className="text-sm text-slate-700 whitespace-pre-wrap">{lot.observations_acquereurs}</p>
                  </div>
                )}

                {lot.negociation_en_cours && (
                  <div className="p-4 bg-amber-50 rounded-lg">
                    <p className="text-sm text-amber-700 font-medium mb-2">Négociation en cours</p>
                    <p className="text-sm text-slate-700 whitespace-pre-wrap">{lot.negociation_en_cours}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}