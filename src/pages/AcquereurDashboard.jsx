import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { appelsDeFondService } from '@/api/appelsDeFond';
import { faqService } from '@/api/faq';
import { galeriePhotosService } from '@/api/galeriePhotos';
import { messagesAdminService } from '@/api/messagesAdmin';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Home, FileText, MessageSquare, Hammer, Image as ImageIcon, HelpCircle, Check, Clock, Send, Download, Mail, Phone, MapPin, User, Building, Calendar, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import AppelsDeFondTimeline from '@/components/acquereurs/AppelsDeFondTimeline';

export default function AcquereurDashboard() {
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  const [nouveauMessage, setNouveauMessage] = useState('');
  const [activeSection, setActiveSection] = useState('tableau-bord');
  const [selectedLotId, setSelectedLotId] = useState(null);

  // Charger les données de l'acquéreur avec React Query
  const { data: acquereur, isLoading: loadingAcquereur } = useQuery({
    queryKey: ['acquereur-portal', profile?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('acquereurs')
        .select('*')
        .eq('user_id', profile.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!profile?.id,
    refetchInterval: 10000, // Rafraîchir toutes les 10 secondes
  });

  // Charger TOUS les lots de l'acquéreur
  const { data: lots = [] } = useQuery({
    queryKey: ['lots-acquereur', acquereur?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('lots_lmnp')
        .select('*, residence:residences_gestion(*)')
        .eq('acquereur_id', acquereur.id)
        .order('numero');
      if (error) throw error;
      return data || [];
    },
    enabled: !!acquereur?.id,
    refetchInterval: 10000,
  });

  // Sélectionner automatiquement le premier lot si aucun n'est sélectionné
  useEffect(() => {
    if (lots.length > 0 && !selectedLotId) {
      setSelectedLotId(lots[0].id);
    }
  }, [lots, selectedLotId]);

  // Le lot actuellement sélectionné
  const lot = lots.find(l => l.id === selectedLotId);

  // Charger les appels de fond du lot actif uniquement
  const { data: appelsDeFond = [] } = useQuery({
    queryKey: ['appels-de-fond-portal', lot?.id],
    queryFn: async () => {
      if (!lot?.id) return [];
      const { data, error } = await supabase
        .from('appels_de_fond')
        .select('*')
        .eq('lot_id', lot.id)
        .order('ordre', { ascending: true });
      if (error) throw error;
      return data || [];
    },
    enabled: !!lot?.id,
    refetchInterval: 5000, // Rafraîchir toutes les 5 secondes
  });

  // Charger les messages
  const { data: messages = [] } = useQuery({
    queryKey: ['messages-portal', acquereur?.id],
    queryFn: () => messagesAdminService.list(acquereur.id),
    enabled: !!acquereur?.id,
    refetchInterval: 5000,
  });

  // Charger les photos
  const { data: photos = [] } = useQuery({
    queryKey: ['photos-portal', lot?.id],
    queryFn: () => galeriePhotosService.list(lot.id),
    enabled: !!lot?.id,
    refetchInterval: 10000,
  });

  // Charger la FAQ
  const { data: faq = [] } = useQuery({
    queryKey: ['faq-portal'],
    queryFn: () => faqService.listActive(),
    refetchInterval: 30000, // Rafraîchir toutes les 30 secondes
  });

  const loading = loadingAcquereur;

  // Abonnement en temps réel pour les changements
  useEffect(() => {
    if (!lot?.id || !acquereur?.id) return;

    // Subscription pour les appels de fond du lot actif
    const appelsFondChannel = supabase
      .channel('appels-fond-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'appels_de_fond',
          filter: `lot_id=eq.${lot.id}`,
        },
        () => {
          queryClient.invalidateQueries(['appels-de-fond-portal', lot.id]);
        }
      )
      .subscribe();

    // Subscription pour les messages
    const messagesChannel = supabase
      .channel('messages-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages_admin',
          filter: `acquereur_id=eq.${acquereur.id}`,
        },
        () => {
          queryClient.invalidateQueries(['messages-portal', acquereur.id]);
        }
      )
      .subscribe();

    // Subscription pour les photos
    if (lot?.id) {
      const photosChannel = supabase
        .channel('photos-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'galerie_photos',
            filter: `lot_id=eq.${lot.id}`,
          },
          () => {
            queryClient.invalidateQueries(['photos-portal', lot.id]);
          }
        )
        .subscribe();

      return () => {
        appelsFondChannel.unsubscribe();
        messagesChannel.unsubscribe();
        photosChannel.unsubscribe();
      };
    }

    return () => {
      appelsFondChannel.unsubscribe();
      messagesChannel.unsubscribe();
    };
  }, [lot?.id, acquereur?.id, queryClient]);

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
      queryClient.invalidateQueries(['messages-portal', acquereur.id]);
    } catch (error) {
      console.error('Erreur envoi message:', error);
    }
  };

  const getStatutIcon = (statut) => {
    switch (statut) {
      case 'complete':
        return <Check className="w-6 h-6 text-white" />;
      case 'valide':
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
      case 'valide':
        return 'bg-blue-500';
      case 'en_attente':
        return 'bg-slate-300';
      default:
        return 'bg-slate-300';
    }
  };

  const getCurrentStep = () => {
    if (!appelsDeFond.length) return null;
    const completed = appelsDeFond.filter(a => a.statut === 'complete').length;
    const validated = appelsDeFond.filter(a => a.statut === 'valide').length;
    return {
      current: completed + validated,
      total: appelsDeFond.length,
      percentage: Math.round(((completed + validated) / appelsDeFond.length) * 100)
    };
  };

  const menuItems = [
    { id: 'tableau-bord', label: 'Tableau de bord', icon: Home },
    { id: 'avancement-travaux', label: 'Avancement travaux', icon: Hammer },
    { id: 'documents', label: 'Documents', icon: FileText },
    { id: 'messages', label: 'Messages', icon: MessageSquare },
    { id: 'galerie', label: 'Galerie', icon: ImageIcon },
    { id: 'faq', label: 'FAQ', icon: HelpCircle },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#F9FAFB]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#1E40AF] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Chargement...</p>
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

  const currentStep = getCurrentStep();

  return (
    <div className="flex min-h-screen bg-[#F9FAFB]">
      {/* Menu latéral */}
      <div className="w-64 bg-white border-r border-slate-200 flex flex-col">
        <div className="p-6 border-b border-slate-200">
          <h2 className="text-lg font-bold text-[#1E40AF]">Mon Espace Client</h2>
          <p className="text-sm text-slate-500 mt-1">{acquereur.prenom} {acquereur.nom}</p>
        </div>

        {/* Sélecteur de lots */}
        {lots.length > 1 && (
          <div className="p-4 border-b border-slate-200 bg-slate-50">
            <label className="text-xs font-semibold text-slate-600 uppercase mb-2 block">
              Mes lots ({lots.length})
            </label>
            <select
              value={selectedLotId || ''}
              onChange={(e) => setSelectedLotId(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1E40AF] focus:border-transparent"
            >
              {lots.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.residence?.nom} - Lot {l.numero}
                </option>
              ))}
            </select>
          </div>
        )}

        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.id}>
                  <button
                    onClick={() => setActiveSection(item.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                      activeSection === item.id
                        ? 'bg-[#1E40AF] text-white'
                        : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>

      {/* Contenu principal */}
      <div className="flex-1 overflow-auto">
        <div className="p-6 md:p-8">
          <div className="max-w-6xl mx-auto">
            {activeSection === 'tableau-bord' && (
              <div className="space-y-6">
                <div>
                  <h1 className="text-3xl font-bold text-[#1E40AF] mb-2">Bienvenue {acquereur.prenom} !</h1>
                  <p className="text-slate-600">Suivez l'avancement de votre projet immobilier</p>
                </div>

                {/* Carte profil acquéreur */}
                <Card className="border-l-4 border-[#1E40AF]">
                  <CardHeader>
                    <CardTitle className="text-[#1E40AF] flex items-center gap-2">
                      <User className="w-5 h-5" />
                      Vos informations
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm text-slate-500">Nom complet</p>
                          <p className="font-semibold text-slate-700">{acquereur.prenom} {acquereur.nom}</p>
                        </div>
                        <div className="flex items-start gap-3">
                          <Mail className="w-5 h-5 text-[#1E40AF] mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-sm text-slate-500">Email</p>
                            <p className="font-medium text-slate-700">{acquereur.email}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <Phone className="w-5 h-5 text-[#1E40AF] mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-sm text-slate-500">Téléphone</p>
                            <p className="font-medium text-slate-700">{acquereur.telephone || 'Non renseigné'}</p>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-start gap-3">
                          <MapPin className="w-5 h-5 text-[#1E40AF] mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-sm text-slate-500">Adresse</p>
                            <p className="font-medium text-slate-700">{acquereur.adresse || 'Non renseignée'}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <Calendar className="w-5 h-5 text-[#1E40AF] mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-sm text-slate-500">Date de naissance</p>
                            <p className="font-medium text-slate-700">
                              {acquereur.date_naissance
                                ? format(new Date(acquereur.date_naissance), 'dd MMMM yyyy', { locale: fr })
                                : 'Non renseignée'
                              }
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Progression du projet */}
                {currentStep && (
                  <Card className="border-l-4 border-green-500">
                    <CardHeader>
                      <CardTitle className="text-green-700 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5" />
                        Avancement de votre projet
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-slate-700">
                              Étape {currentStep.current} sur {currentStep.total}
                            </span>
                            <span className="text-sm font-bold text-green-600">{currentStep.percentage}%</span>
                          </div>
                          <div className="w-full bg-slate-200 rounded-full h-3">
                            <div
                              className="bg-gradient-to-r from-green-500 to-green-600 h-3 rounded-full transition-all duration-500"
                              style={{ width: `${currentStep.percentage}%` }}
                            />
                          </div>
                        </div>
                        <p className="text-sm text-slate-600">
                          Vous avez complété <span className="font-semibold text-green-600">{currentStep.current} étapes</span> sur {currentStep.total}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )}

                <div className="grid md:grid-cols-2 gap-6">
                  {/* Votre logement */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-[#1E40AF] flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Building className="w-5 h-5" />
                          {lots.length > 1 ? 'Vos logements' : 'Votre logement'}
                        </div>
                        {lots.length > 1 && (
                          <Badge className="bg-blue-100 text-blue-800">
                            {lots.length} lots
                          </Badge>
                        )}
                      </CardTitle>
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
                          <div>
                            <p className="text-sm text-slate-500">Statut</p>
                            <Badge className="bg-green-100 text-green-800">
                              {lot.statut}
                            </Badge>
                          </div>
                        </>
                      ) : (
                        <p className="text-slate-500">Aucun lot associé pour le moment</p>
                      )}
                    </CardContent>
                  </Card>

                  {/* Dernières étapes */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-[#1E40AF]">Dernières étapes</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {appelsDeFond.length > 0 ? (
                        <div className="space-y-3">
                          {appelsDeFond.slice(0, 4).map(appel => (
                            <div key={appel.id} className="flex items-center gap-3">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getStatutColor(appel.statut)}`}>
                                {getStatutIcon(appel.statut)}
                              </div>
                              <div className="flex-1">
                                <p className="font-medium text-slate-700 text-sm">{appel.etape}</p>
                                <p className="text-xs text-slate-500">
                                  {appel.statut === 'complete' && 'Terminé'}
                                  {appel.statut === 'valide' && 'Validé'}
                                  {appel.statut === 'en_attente' && 'En attente'}
                                </p>
                              </div>
                            </div>
                          ))}
                          <Button
                            variant="link"
                            className="text-[#1E40AF] p-0 h-auto"
                            onClick={() => setActiveSection('avancement-travaux')}
                          >
                            Voir tous les appels de fond →
                          </Button>
                        </div>
                      ) : (
                        <p className="text-slate-500">Les appels de fond seront disponibles prochainement</p>
                      )}
                    </CardContent>
                  </Card>

                  {/* Messages récents */}
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
                            className="text-[#1E40AF] p-0 h-auto"
                            onClick={() => setActiveSection('messages')}
                          >
                            Voir tous les messages →
                          </Button>
                        </div>
                      ) : (
                        <p className="text-slate-500">Aucun message pour le moment</p>
                      )}
                    </CardContent>
                  </Card>

                  {/* Galerie photos récente */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-[#1E40AF]">Dernières photos</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {photos.length > 0 ? (
                        <div>
                          <div className="grid grid-cols-3 gap-2 mb-3">
                            {photos.slice(0, 3).map(photo => (
                              <div key={photo.id} className="aspect-square overflow-hidden rounded-lg border border-slate-200">
                                <img
                                  src={photo.photo_url}
                                  alt={photo.titre}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            ))}
                          </div>
                          <Button
                            variant="link"
                            className="text-[#1E40AF] p-0 h-auto"
                            onClick={() => setActiveSection('galerie')}
                          >
                            Voir toute la galerie ({photos.length} photos) →
                          </Button>
                        </div>
                      ) : (
                        <p className="text-slate-500">Aucune photo disponible pour le moment</p>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {activeSection === 'avancement-travaux' && lot && (
              <AppelsDeFondTimeline
                lotId={lot.id}
                acquereurId={acquereur.id}
                isAdmin={false}
              />
            )}

            {activeSection === 'documents' && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-[#1E40AF]">Vos documents</CardTitle>
                </CardHeader>
                <CardContent>
                  {acquereur.documents && Object.keys(acquereur.documents).length > 0 ? (
                    <div className="space-y-3">
                      {Object.entries(acquereur.documents).map(([key, doc]) => (
                        <div key={key} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
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
            )}

            {activeSection === 'messages' && (
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
            )}

            {activeSection === 'appels-fond' && (
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
                                    appel.statut === 'valide' ? 'bg-blue-100 text-blue-800' :
                                    'bg-slate-100 text-slate-600'
                                  }>
                                    {appel.statut === 'complete' && 'Terminé'}
                                    {appel.statut === 'valide' && 'Validé'}
                                    {appel.statut === 'en_attente' && 'En attente'}
                                  </Badge>
                                </div>
                                {appel.description && (
                                  <p className="text-sm text-slate-600 mb-3">{appel.description}</p>
                                )}
                                {appel.statut === 'valide' && appel.date_validation_admin && (
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
            )}

            {activeSection === 'galerie' && lot && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-[#1E40AF] flex items-center justify-between">
                    <span>Galerie Photos - Lot {lot.numero}</span>
                    {lots.length > 1 && (
                      <span className="text-sm font-normal text-slate-500">
                        {lot.residence?.nom}
                      </span>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {photos.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {photos.map(photo => (
                        <Dialog key={photo.id}>
                          <DialogTrigger asChild>
                            <div className="cursor-pointer group relative aspect-square overflow-hidden rounded-lg border border-slate-200">
                              <img
                                src={photo.url}
                                alt={photo.legende || 'Photo du lot'}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                              />
                              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all" />
                              {photo.categorie && (
                                <div className="absolute top-2 left-2">
                                  <Badge className="bg-white/90 text-slate-700 text-xs">
                                    {photo.categorie}
                                  </Badge>
                                </div>
                              )}
                            </div>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl">
                            <DialogHeader>
                              <DialogTitle>{photo.legende || 'Photo du lot'}</DialogTitle>
                            </DialogHeader>
                            <img
                              src={photo.url}
                              alt={photo.legende || 'Photo du lot'}
                              className="w-full rounded-lg"
                            />
                            {photo.legende && (
                              <p className="text-sm text-slate-600">{photo.legende}</p>
                            )}
                          </DialogContent>
                        </Dialog>
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-500 text-center py-8">
                      Aucune photo disponible pour ce lot
                    </p>
                  )}
                </CardContent>
              </Card>
            )}

            {activeSection === 'faq' && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-[#1E40AF]">Questions fréquentes</CardTitle>
                </CardHeader>
                <CardContent>
                  {Object.keys(faqByCategory).length > 0 ? (
                    <div className="space-y-6">
                      {Object.entries(faqByCategory).map(([categorie, questions]) => (
                        <div key={categorie}>
                          <h3 className="font-semibold text-slate-700 mb-3 text-lg">{categorie}</h3>
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
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
