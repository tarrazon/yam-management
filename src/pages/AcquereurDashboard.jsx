import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { appelsDeFondService } from '@/api/appelsDeFond';
import { faqService } from '@/api/faq';
import { galeriePhotosService } from '@/api/galeriePhotos';
import { messagesAdminService } from '@/api/messagesAdmin';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Home, FileText, MessageSquare, Hammer, Image as ImageIcon, HelpCircle, Check, Clock, Send, Download, Mail, Phone, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function AcquereurDashboard() {
  const { profile } = useAuth();
  const [acquereur, setAcquereur] = useState(null);
  const [lot, setLot] = useState(null);
  const [appelsDeFond, setAppelsDeFond] = useState([]);
  const [messages, setMessages] = useState([]);
  const [faq, setFaq] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [nouveauMessage, setNouveauMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  useEffect(() => {
    loadData();
  }, [profile]);

  const loadData = async () => {
    try {
      setLoading(true);

      const { data: acquereurData, error: acquereurError } = await supabase
        .from('acquereurs')
        .select('*')
        .eq('user_id', profile.id)
        .single();

      if (acquereurError) throw acquereurError;
      setAcquereur(acquereurData);

      const { data: lotData, error: lotError } = await supabase
        .from('lots_lmnp')
        .select('*, residence:residences_gestion(*)')
        .eq('acquereur_id', acquereurData.id)
        .single();

      if (lotError && lotError.code !== 'PGRST116') throw lotError;
      setLot(lotData);

      if (lotData) {
        const appelsData = await appelsDeFondService.listByAcquereur(acquereurData.id);
        setAppelsDeFond(appelsData);

        const photosData = await galeriePhotosService.list(lotData.id);
        setPhotos(photosData);
      }

      const messagesData = await messagesAdminService.list(acquereurData.id);
      setMessages(messagesData);

      const faqData = await faqService.listActive();
      setFaq(faqData);

    } catch (error) {
      console.error('Erreur chargement données:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!nouveauMessage.trim()) return;

    try {
      await messagesAdminService.create({
        acquereur_id: acquereur.id,
        expediteur_type: 'acquereur',
        expediteur_id: null,
        message: nouveauMessage,
        lu: false
      });

      setNouveauMessage('');
      loadData();
    } catch (error) {
      console.error('Erreur envoi message:', error);
    }
  };

  const getStatutIcon = (statut) => {
    switch (statut) {
      case 'complete':
        return <Check className="w-6 h-6 text-white" />;
      case 'valide_admin':
        return <Check className="w-6 h-6 text-white" />;
      case 'en_attente':
        return <Clock className="w-6 h-6 text-slate-400" />;
      default:
        return <Clock className="w-6 h-6 text-slate-400" />;
    }
  };

  const getStatutColor = (statut) => {
    switch (statut) {
      case 'complete':
        return 'bg-green-500';
      case 'valide_admin':
        return 'bg-blue-500';
      case 'en_attente':
        return 'bg-slate-300';
      default:
        return 'bg-slate-300';
    }
  };

  if (loading) {
    return (
      <div className="p-6 md:p-8 bg-[#F9FAFB] min-h-screen">
        <div className="max-w-7xl mx-auto">
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-slate-200 rounded-lg animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!acquereur) {
    return (
      <div className="p-6 md:p-8 bg-[#F9FAFB] min-h-screen">
        <div className="max-w-7xl mx-auto">
          <Card>
            <CardContent className="p-12 text-center">
              <Home className="w-16 h-16 text-slate-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-slate-700 mb-2">Espace client non configuré</h2>
              <p className="text-slate-500">Votre profil acquéreur n'est pas encore configuré. Contactez votre conseiller.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const faqByCategory = faq.reduce((acc, item) => {
    const cat = item.categorie || 'Général';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {});

  return (
    <div className="p-6 md:p-8 bg-[#F9FAFB] min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#1E40AF] mb-2">Bienvenue {acquereur.prenom} {acquereur.nom}</h1>
          <p className="text-slate-600">Suivez l'avancement de votre projet immobilier</p>
        </div>

        <Tabs defaultValue="tableau-bord" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6 bg-white">
            <TabsTrigger value="tableau-bord" className="flex items-center gap-2">
              <Home className="w-4 h-4" />
              <span className="hidden sm:inline">Tableau de bord</span>
            </TabsTrigger>
            <TabsTrigger value="documents" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">Documents</span>
            </TabsTrigger>
            <TabsTrigger value="messages" className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              <span className="hidden sm:inline">Messages</span>
            </TabsTrigger>
            <TabsTrigger value="appels-fond" className="flex items-center gap-2">
              <Hammer className="w-4 h-4" />
              <span className="hidden sm:inline">Appels de fond</span>
            </TabsTrigger>
            <TabsTrigger value="galerie" className="flex items-center gap-2">
              <ImageIcon className="w-4 h-4" />
              <span className="hidden sm:inline">Galerie</span>
            </TabsTrigger>
            <TabsTrigger value="faq" className="flex items-center gap-2">
              <HelpCircle className="w-4 h-4" />
              <span className="hidden sm:inline">FAQ</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="tableau-bord">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-[#1E40AF]">Votre logement</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {lot ? (
                    <>
                      <div>
                        <p className="text-sm text-slate-500">Résidence</p>
                        <p className="font-semibold text-slate-700">{lot.residence?.nom}</p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-500">Lot</p>
                        <p className="font-semibold text-slate-700">N° {lot.numero} - {lot.type}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-slate-500">Surface</p>
                          <p className="font-semibold text-slate-700">{lot.surface} m²</p>
                        </div>
                        <div>
                          <p className="text-sm text-slate-500">Étage</p>
                          <p className="font-semibold text-slate-700">{lot.etage}</p>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-slate-500">Ville</p>
                        <p className="font-semibold text-slate-700">{lot.residence?.ville}</p>
                      </div>
                    </>
                  ) : (
                    <p className="text-slate-500">Aucun lot associé pour le moment</p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-[#1E40AF]">Avancement du projet</CardTitle>
                </CardHeader>
                <CardContent>
                  {appelsDeFond.length > 0 ? (
                    <div className="space-y-3">
                      {appelsDeFond.slice(0, 3).map(appel => (
                        <div key={appel.id} className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getStatutColor(appel.statut)}`}>
                            {getStatutIcon(appel.statut)}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-slate-700">{appel.etape}</p>
                            <p className="text-xs text-slate-500">
                              {appel.statut === 'complete' && 'Terminé'}
                              {appel.statut === 'valide_admin' && 'Validé par l\'administrateur'}
                              {appel.statut === 'en_attente' && 'En attente'}
                            </p>
                          </div>
                        </div>
                      ))}
                      <Button
                        variant="link"
                        className="text-[#1E40AF] p-0"
                        onClick={() => document.querySelector('[value="appels-fond"]').click()}
                      >
                        Voir tous les appels de fond →
                      </Button>
                    </div>
                  ) : (
                    <p className="text-slate-500">Les appels de fond seront disponibles prochainement</p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-[#1E40AF]">Messages récents</CardTitle>
                </CardHeader>
                <CardContent>
                  {messages.length > 0 ? (
                    <div className="space-y-3">
                      {messages.slice(0, 3).map(msg => (
                        <div key={msg.id} className="border-l-4 border-[#1E40AF] pl-3">
                          <p className="text-sm font-medium text-slate-700">
                            {msg.expediteur_type === 'admin' ? 'Administrateur' : 'Vous'}
                          </p>
                          <p className="text-sm text-slate-600 line-clamp-2">{msg.message}</p>
                          <p className="text-xs text-slate-400 mt-1">
                            {format(new Date(msg.created_at), 'dd MMM yyyy à HH:mm', { locale: fr })}
                          </p>
                        </div>
                      ))}
                      <Button
                        variant="link"
                        className="text-[#1E40AF] p-0"
                        onClick={() => document.querySelector('[value="messages"]').click()}
                      >
                        Voir tous les messages →
                      </Button>
                    </div>
                  ) : (
                    <p className="text-slate-500">Aucun message pour le moment</p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-[#1E40AF]">Vos contacts</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Mail className="w-5 h-5 text-[#1E40AF] mt-0.5" />
                    <div>
                      <p className="text-sm text-slate-500">Email</p>
                      <p className="font-medium text-slate-700">{acquereur.email}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Phone className="w-5 h-5 text-[#1E40AF] mt-0.5" />
                    <div>
                      <p className="text-sm text-slate-500">Téléphone</p>
                      <p className="font-medium text-slate-700">{acquereur.telephone || 'Non renseigné'}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-[#1E40AF] mt-0.5" />
                    <div>
                      <p className="text-sm text-slate-500">Adresse</p>
                      <p className="font-medium text-slate-700">{acquereur.adresse || 'Non renseignée'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="documents">
            <Card>
              <CardHeader>
                <CardTitle className="text-[#1E40AF]">Vos documents</CardTitle>
              </CardHeader>
              <CardContent>
                {acquereur.documents && Object.keys(acquereur.documents).length > 0 ? (
                  <div className="space-y-3">
                    {Object.entries(acquereur.documents).map(([key, doc]) => (
                      <div key={key} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <FileText className="w-5 h-5 text-[#1E40AF]" />
                          <div>
                            <p className="font-medium text-slate-700">{doc.name || key}</p>
                            <p className="text-xs text-slate-500">
                              {doc.date ? format(new Date(doc.date), 'dd MMM yyyy', { locale: fr }) : 'Date inconnue'}
                            </p>
                          </div>
                        </div>
                        <Button size="sm" variant="ghost">
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-500 text-center py-8">Aucun document disponible pour le moment</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="messages">
            <Card>
              <CardHeader>
                <CardTitle className="text-[#1E40AF]">Messagerie</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 mb-6 max-h-[500px] overflow-y-auto">
                  {messages.map(msg => (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${msg.expediteur_type === 'acquereur' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-md p-4 rounded-lg ${
                        msg.expediteur_type === 'acquereur'
                          ? 'bg-[#1E40AF] text-white'
                          : 'bg-slate-100 text-slate-700'
                      }`}>
                        <p className="text-sm font-medium mb-1">
                          {msg.expediteur_type === 'admin' ? 'Administrateur YAM' : 'Vous'}
                        </p>
                        <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                        <p className={`text-xs mt-2 ${
                          msg.expediteur_type === 'acquereur' ? 'text-blue-200' : 'text-slate-500'
                        }`}>
                          {format(new Date(msg.created_at), 'dd MMM yyyy à HH:mm', { locale: fr })}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <div className="flex gap-2">
                  <Textarea
                    placeholder="Écrivez votre message..."
                    value={nouveauMessage}
                    onChange={(e) => setNouveauMessage(e.target.value)}
                    className="flex-1"
                    rows={3}
                  />
                  <Button
                    onClick={handleSendMessage}
                    className="bg-[#1E40AF] hover:bg-[#1E3A8A]"
                    disabled={!nouveauMessage.trim()}
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="appels-fond">
            <Card>
              <CardHeader>
                <CardTitle className="text-[#1E40AF]">Appels de fond de travaux</CardTitle>
              </CardHeader>
              <CardContent>
                {appelsDeFond.length > 0 ? (
                  <div className="space-y-4">
                    {appelsDeFond.map((appel, index) => (
                      <motion.div
                        key={appel.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="relative"
                      >
                        <div className="flex items-start gap-4">
                          <div className="relative">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${getStatutColor(appel.statut)} shadow-md`}>
                              {getStatutIcon(appel.statut)}
                            </div>
                            {index < appelsDeFond.length - 1 && (
                              <div className="absolute left-1/2 top-12 w-0.5 h-12 bg-slate-300 -ml-px" />
                            )}
                          </div>

                          <div className="flex-1 pb-8">
                            <div className="bg-white border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                              <div className="flex items-start justify-between mb-2">
                                <h3 className="font-semibold text-slate-700">{appel.etape}</h3>
                                <Badge className={
                                  appel.statut === 'complete' ? 'bg-green-100 text-green-800' :
                                  appel.statut === 'valide_admin' ? 'bg-blue-100 text-blue-800' :
                                  'bg-slate-100 text-slate-600'
                                }>
                                  {appel.statut === 'complete' && 'Terminé'}
                                  {appel.statut === 'valide_admin' && 'Validé'}
                                  {appel.statut === 'en_attente' && 'En attente'}
                                </Badge>
                              </div>
                              {appel.description && (
                                <p className="text-sm text-slate-600 mb-3">{appel.description}</p>
                              )}
                              {appel.statut === 'valide_admin' && appel.date_validation_admin && (
                                <p className="text-xs text-blue-600">
                                  Validé le {format(new Date(appel.date_validation_admin), 'dd MMM yyyy', { locale: fr })}
                                </p>
                              )}
                              {appel.statut === 'complete' && appel.date_completion && (
                                <p className="text-xs text-green-600">
                                  Terminé le {format(new Date(appel.date_completion), 'dd MMM yyyy', { locale: fr })}
                                </p>
                              )}
                              {appel.notes_admin && (
                                <div className="mt-3 p-3 bg-blue-50 rounded border border-blue-200">
                                  <p className="text-xs font-medium text-blue-900 mb-1">Note de l'administrateur:</p>
                                  <p className="text-xs text-blue-700">{appel.notes_admin}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-500 text-center py-8">Les appels de fond seront disponibles prochainement</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="galerie">
            <Card>
              <CardHeader>
                <CardTitle className="text-[#1E40AF]">Galerie Photos</CardTitle>
              </CardHeader>
              <CardContent>
                {photos.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {photos.map(photo => (
                      <Dialog key={photo.id}>
                        <DialogTrigger asChild>
                          <div className="cursor-pointer group relative aspect-square overflow-hidden rounded-lg border border-slate-200">
                            <img
                              src={photo.photo_url}
                              alt={photo.titre}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            />
                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all" />
                          </div>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl">
                          <DialogHeader>
                            <DialogTitle>{photo.titre}</DialogTitle>
                          </DialogHeader>
                          <img
                            src={photo.photo_url}
                            alt={photo.titre}
                            className="w-full rounded-lg"
                          />
                          {photo.description && (
                            <p className="text-sm text-slate-600">{photo.description}</p>
                          )}
                        </DialogContent>
                      </Dialog>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-500 text-center py-8">Aucune photo disponible pour le moment</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="faq">
            <Card>
              <CardHeader>
                <CardTitle className="text-[#1E40AF]">Questions fréquentes</CardTitle>
              </CardHeader>
              <CardContent>
                {Object.keys(faqByCategory).length > 0 ? (
                  <div className="space-y-6">
                    {Object.entries(faqByCategory).map(([categorie, questions]) => (
                      <div key={categorie}>
                        <h3 className="font-semibold text-slate-700 mb-3">{categorie}</h3>
                        <Accordion type="single" collapsible className="w-full">
                          {questions.map(item => (
                            <AccordionItem key={item.id} value={item.id}>
                              <AccordionTrigger className="text-left">
                                {item.question}
                              </AccordionTrigger>
                              <AccordionContent>
                                <p className="text-slate-600 whitespace-pre-wrap">{item.reponse}</p>
                              </AccordionContent>
                            </AccordionItem>
                          ))}
                        </Accordion>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-500 text-center py-8">Aucune question disponible pour le moment</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
