
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { X, Edit, Mail, Phone, MapPin, User, Euro, Building2, FileText, Download, Trash2, Users, MessageSquare, HelpCircle, Image as ImageIcon, Send } from "lucide-react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { useSignedUrls } from "@/hooks/useSignedUrl";
import { supabase } from "@/lib/supabase";
import { messagesAdminService } from "@/api/messagesAdmin";
import { faqService } from "@/api/faq";
import { galeriePhotosService } from "@/api/galeriePhotos";
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const statusColors = {
  prospect: "bg-blue-100 text-blue-800 border-blue-200",
  qualifie: "bg-green-100 text-green-800 border-green-200",
  en_negociation: "bg-yellow-100 text-yellow-800 border-yellow-200",
  compromis: "bg-orange-100 text-orange-800 border-orange-200",
  acheteur: "bg-purple-100 text-purple-800 border-purple-200",
  perdu: "bg-red-100 text-red-800 border-red-200",
};

const statusLabels = {
  prospect: "Prospect",
  qualifie: "Qualifié",
  en_negociation: "En négociation",
  compromis: "Compromis",
  acheteur: "Acheteur",
  perdu: "Perdu",
};

const documentsConfig = [
  { key: "cni", label: "CNI", category: "Identité" },
  { key: "passeport", label: "Passeport", category: "Identité" },
  { key: "justificatif_domicile", label: "Justificatif de domicile", category: "Identité" },
  { key: "lettre_intention_achat", label: "Lettre d'intention d'achat", category: "Documents contractuels" },
  { key: "mandat_gestion", label: "Mandat de gestion", category: "Documents contractuels" },
  { key: "mandat_acquereur_honoraires", label: "Mandat acquéreur pour honoraires", category: "Documents contractuels" },
];

export default function AcquereurDetail({ acquereur, onClose, onEdit, onDelete }) {
  const documents = acquereur.documents || {};
  const { urls: signedUrls, loading: urlsLoading } = useSignedUrls(documents);
  const [messages, setMessages] = useState([]);
  const [nouveauMessage, setNouveauMessage] = useState('');
  const [photos, setPhotos] = useState([]);
  const [faq, setFaq] = useState([]);

  // Récupérer le partenaire associé
  const { data: partenaire } = useQuery({
    queryKey: ['partenaire', acquereur.partenaire_id],
    queryFn: () => base44.entities.Partenaire.findOne(acquereur.partenaire_id),
    enabled: !!acquereur.partenaire_id,
  });

  // Récupérer les lots LMNP associés à l'acquéreur
  const { data: lotsLmnp = [] } = useQuery({
    queryKey: ['lots-lmnp-acquereur', acquereur.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('lots_lmnp')
        .select('id, numero, statut')
        .eq('acquereur_id', acquereur.id);
      if (error) throw error;
      return data || [];
    },
  });

  // Prendre le premier lot s'il y en a plusieurs
  const lotLmnp = lotsLmnp.length > 0 ? lotsLmnp[0] : null;

  // Charger les messages, photos et FAQ
  useEffect(() => {
    const loadData = async () => {
      try {
        console.log('Chargement données pour acquéreur:', acquereur.id);

        const messagesData = await messagesAdminService.list(acquereur.id);
        console.log('Messages chargés:', messagesData);
        setMessages(messagesData);

        const faqData = await faqService.listActive();
        console.log('FAQ chargées:', faqData);
        setFaq(faqData);

        if (lotLmnp?.id) {
          console.log('Chargement photos pour lot:', lotLmnp.id);
          const photosData = await galeriePhotosService.list(lotLmnp.id);
          console.log('Photos chargées:', photosData);
          setPhotos(photosData);
        } else {
          console.log('Aucun lot associé, photos non chargées');
        }
      } catch (error) {
        console.error('Erreur chargement données:', error);
      }
    };

    loadData();
  }, [acquereur.id, lotLmnp?.id]);

  const handleSendMessage = async () => {
    if (!nouveauMessage.trim()) return;

    try {
      await messagesAdminService.create({
        acquereur_id: acquereur.id,
        expediteur_type: 'admin',
        expediteur_id: null,
        message: nouveauMessage,
        lu: false
      });

      setNouveauMessage('');
      const messagesData = await messagesAdminService.list(acquereur.id);
      setMessages(messagesData);
    } catch (error) {
      console.error('Erreur envoi message:', error);
    }
  };
  
  const groupedDocuments = documentsConfig.reduce((acc, doc) => {
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
              <User className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">
                {acquereur.prenom} {acquereur.nom}
              </h2>
              <Badge className={`${statusColors[acquereur.statut_commercial]} border mt-2`}>
                {statusLabels[acquereur.statut_commercial]}
              </Badge>
            </div>
          </div>
          <div className="flex gap-2">
            {onEdit && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onEdit(acquereur)}
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
                onClick={() => onDelete(acquereur)}
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
          {/* Partenaire apporteur */}
          {partenaire && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Users className="w-5 h-5 text-[#F59E0B]" />
                  Partenaire apporteur
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-semibold text-slate-700">{partenaire.nom || partenaire.nom_societe}</p>
                {partenaire.email && (
                  <div className="flex items-center gap-3 mt-2">
                    <Mail className="w-4 h-4 text-slate-400" />
                    <a href={`mailto:${partenaire.email}`} className="text-slate-700 hover:text-[#1E40AF]">
                      {partenaire.email}
                    </a>
                  </div>
                )}
                {partenaire.telephone && (
                  <div className="flex items-center gap-3 mt-2">
                    <Phone className="w-4 h-4 text-slate-400" />
                    <a href={`tel:${partenaire.telephone}`} className="text-slate-700 hover:text-[#1E40AF]">
                      {partenaire.telephone}
                    </a>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Informations de contact */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Informations de contact</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {acquereur.email && (
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-slate-400" />
                  <a href={`mailto:${acquereur.email}`} className="text-slate-700 hover:text-[#1E40AF]">
                    {acquereur.email}
                  </a>
                </div>
              )}
              {acquereur.telephone && (
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-slate-400" />
                  <a href={`tel:${acquereur.telephone}`} className="text-slate-700 hover:text-[#1E40AF]">
                    {acquereur.telephone}
                  </a>
                </div>
              )}
              {acquereur.adresse && (
                <div className="flex items-center gap-3">
                  <MapPin className="w-4 h-4 text-slate-400" />
                  <span className="text-slate-700">{acquereur.adresse}</span>
                </div>
              )}
              <div className="grid md:grid-cols-2 gap-4 pt-3 border-t">
                {acquereur.date_naissance && (
                  <div>
                    <p className="text-xs text-slate-500">Date de naissance</p>
                    <p className="font-medium text-slate-700">
                      {new Date(acquereur.date_naissance).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                )}
                {acquereur.date_entree_crm && (
                  <div>
                    <p className="text-xs text-slate-500">Date d'entrée CRM</p>
                    <p className="font-medium text-green-600">
                      {new Date(acquereur.date_entree_crm).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                )}
                {acquereur.profession && (
                  <div>
                    <p className="text-xs text-slate-500">Profession</p>
                    <p className="font-medium text-slate-700">{acquereur.profession}</p>
                  </div>
                )}
                {acquereur.situation_familiale && (
                  <div>
                    <p className="text-xs text-slate-500">Situation familiale</p>
                    <p className="font-medium text-slate-700 capitalize">{acquereur.situation_familiale}</p>
                  </div>
                )}
                {acquereur.residence_fiscale && (
                  <div>
                    <p className="text-xs text-slate-500">Résidence fiscale</p>
                    <p className="font-medium text-slate-700">{acquereur.residence_fiscale}</p>
                  </div>
                )}
                {acquereur.statut_fiscal && (
                  <div>
                    <p className="text-xs text-slate-500">Statut fiscal</p>
                    <p className="font-medium text-slate-700">{acquereur.statut_fiscal.toUpperCase()}</p>
                  </div>
                )}
                {acquereur.source_contact && (
                  <div>
                    <p className="text-xs text-slate-500">Source du contact</p>
                    <p className="font-medium text-slate-700 capitalize">{acquereur.source_contact}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Informations financières */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Euro className="w-5 h-5 text-[#F59E0B]" />
                Capacité financière
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                {(acquereur.budget_min || acquereur.budget_max) && (
                  <div className="p-4 bg-blue-50 rounded-lg md:col-span-2">
                    <p className="text-sm text-blue-700 mb-1">Budget (plage)</p>
                    <p className="text-2xl font-bold text-blue-800">
                      {acquereur.budget_min ? acquereur.budget_min.toLocaleString('fr-FR') : '...'} - {acquereur.budget_max ? acquereur.budget_max.toLocaleString('fr-FR') : '...'} €
                    </p>
                  </div>
                )}
                {acquereur.budget != null && !acquereur.budget_min && !acquereur.budget_max && (
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-700 mb-1">Budget</p>
                    <p className="text-2xl font-bold text-blue-800">
                      {acquereur.budget.toLocaleString('fr-FR')} €
                    </p>
                  </div>
                )}
                {acquereur.apport != null && (
                  <div className="p-4 bg-green-50 rounded-lg">
                    <p className="text-sm text-green-700 mb-1">Apport personnel</p>
                    <p className="text-2xl font-bold text-green-800">
                      {acquereur.apport.toLocaleString('fr-FR')} €
                    </p>
                  </div>
                )}
                {acquereur.revenus_mensuels != null && (
                  <div>
                    <p className="text-xs text-slate-500">Revenus mensuels</p>
                    <p className="text-lg font-bold text-slate-700">
                      {acquereur.revenus_mensuels.toLocaleString('fr-FR')} €
                    </p>
                  </div>
                )}
                {acquereur.endettement_estime != null && (
                  <div>
                    <p className="text-xs text-slate-500">Niveau d'endettement</p>
                    <p className="text-lg font-bold text-slate-700">
                      {acquereur.endettement_estime}%
                    </p>
                  </div>
                )}
                {acquereur.mode_financement && (
                  <div>
                    <p className="text-xs text-slate-500">Mode de financement</p>
                    <p className="text-lg font-bold text-slate-700 capitalize">
                      {acquereur.mode_financement.replace('_', ' ')}
                    </p>
                  </div>
                )}
              </div>
              {acquereur.accord_bancaire && (
                <div className="mt-4 p-3 bg-slate-50 rounded-lg">
                  <p className="text-sm text-slate-600">
                    Accord bancaire : <span className="font-semibold capitalize">{acquereur.accord_bancaire.replace('_', ' ')}</span>
                  </p>
                </div>
              )}
              {acquereur.courtier && (
                <div className="mt-2 p-3 bg-slate-50 rounded-lg">
                  <p className="text-sm text-slate-600">
                    Courtier : <span className="font-semibold">{acquereur.courtier}</span>
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

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


          {/* Notes */}
          {acquereur.notes && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Notes internes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-700 whitespace-pre-wrap">{acquereur.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
