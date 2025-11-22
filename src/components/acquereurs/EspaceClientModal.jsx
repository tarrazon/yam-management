import React, { useState, useEffect } from 'react';
import { X, MessageSquare, Image as ImageIcon, HelpCircle, Send, Upload, Trash2, FileText, Check, Clock, CheckCircle, Hammer, Plus } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { messagesAdminService } from '@/api/messagesAdmin';
import { galeriePhotosService } from '@/api/galeriePhotos';
import { faqService } from '@/api/faq';
import { appelsDeFondService } from '@/api/appelsDeFond';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { motion, AnimatePresence } from 'framer-motion';
import AppelsDeFondTimeline from './AppelsDeFondTimeline';

export default function EspaceClientModal({ acquereur, isOpen, onClose }) {
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('messages');
  const [selectedLotId, setSelectedLotId] = useState(null);

  // Messages
  const [messages, setMessages] = useState([]);
  const [nouveauMessage, setNouveauMessage] = useState('');

  // Photos
  const [photos, setPhotos] = useState([]);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [editingPhoto, setEditingPhoto] = useState(null);
  const [photoForm, setPhotoForm] = useState({ titre: '', description: '' });

  // FAQ
  const [faq, setFaq] = useState([]);


  // Récupérer les lots associés avec les infos de résidence
  const { data: lotsLmnp = [], isLoading: loadingLots } = useQuery({
    queryKey: ['lots-lmnp-acquereur', acquereur?.id],
    queryFn: async () => {
      if (!acquereur?.id) return [];

      // Récupérer les lots
      const { data: lots, error: lotsError } = await supabase
        .from('lots_lmnp')
        .select('id, numero, statut, residence_id')
        .eq('acquereur_id', acquereur.id)
        .order('numero');

      if (lotsError) {
        console.error('Erreur chargement lots:', lotsError);
        throw lotsError;
      }

      if (!lots || lots.length === 0) return [];

      // Récupérer les infos des résidences
      const residenceIds = [...new Set(lots.map(l => l.residence_id).filter(Boolean))];
      const { data: residences, error: residencesError } = await supabase
        .from('residences_gestion')
        .select('id, nom, ville')
        .in('id', residenceIds);

      if (residencesError) {
        console.error('Erreur chargement résidences:', residencesError);
      }

      // Mapper les résidences aux lots
      const residencesMap = (residences || []).reduce((acc, r) => {
        acc[r.id] = r;
        return acc;
      }, {});

      return lots.map(lot => ({
        ...lot,
        residence: residencesMap[lot.residence_id] || null
      }));
    },
    enabled: isOpen && !!acquereur?.id,
  });

  // Sélectionner automatiquement le premier lot
  useEffect(() => {
    if (lotsLmnp.length > 0 && !selectedLotId) {
      setSelectedLotId(lotsLmnp[0].id);
    }
  }, [lotsLmnp, selectedLotId]);

  const lotLmnp = lotsLmnp.find(l => l.id === selectedLotId) || null;


  // Charger les données
  useEffect(() => {
    if (!isOpen || !acquereur.id) return;

    const loadData = async () => {
      try {
        const messagesData = await messagesAdminService.list(acquereur.id);
        setMessages(messagesData);

        const faqData = await faqService.listActive();
        setFaq(faqData);

        if (lotLmnp?.id) {
          const photosData = await galeriePhotosService.list(lotLmnp.id);
          setPhotos(photosData);
        }
      } catch (error) {
        console.error('Erreur chargement données:', error);
        toast.error('Erreur lors du chargement des données');
      }
    };

    loadData();
  }, [isOpen, acquereur.id, lotLmnp?.id]);

  const handleSendMessage = async () => {
    if (!nouveauMessage.trim()) return;

    try {
      const newMessage = await messagesAdminService.create({
        acquereur_id: acquereur.id,
        expediteur_type: 'admin',
        message: nouveauMessage,
        lu: false,
      });
      setMessages([...messages, newMessage]);
      setNouveauMessage('');
      toast.success('Message envoyé');
    } catch (error) {
      console.error('Erreur envoi message:', error);
      toast.error('Erreur lors de l\'envoi du message');
    }
  };

  const handleUploadPhoto = async (e) => {
    if (!lotLmnp?.id) {
      toast.error('Aucun lot associé');
      return;
    }

    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `lots/${lotLmnp.id}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('documents')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('documents')
          .getPublicUrl(filePath);

        return galeriePhotosService.create({
          lot_id: lotLmnp.id,
          legende: file.name.replace(/\.[^/.]+$/, ''),
          url: publicUrl,
          categorie: 'travaux',
          uploaded_by: profile?.id,
        });
      });

      const newPhotos = await Promise.all(uploadPromises);
      setPhotos([...photos, ...newPhotos]);
      toast.success(`${files.length} photo(s) ajoutée(s)`);
    } catch (error) {
      console.error('Erreur upload:', error);
      toast.error('Erreur lors de l\'upload');
    } finally {
      setUploading(false);
    }
  };

  const handleUpdatePhoto = async () => {
    if (!editingPhoto) return;

    try {
      const updated = await galeriePhotosService.update(editingPhoto.id, {
        legende: photoForm.titre,
      });
      setPhotos(photos.map(p => p.id === updated.id ? updated : p));
      setEditingPhoto(null);
      setPhotoForm({ titre: '', description: '' });
      toast.success('Photo mise à jour');
    } catch (error) {
      console.error('Erreur mise à jour photo:', error);
      toast.error('Erreur lors de la mise à jour');
    }
  };

  const handleDeletePhoto = async (photoId) => {
    if (!confirm('Supprimer cette photo ?')) return;

    try {
      await galeriePhotosService.delete(photoId);
      setPhotos(photos.filter(p => p.id !== photoId));
      toast.success('Photo supprimée');
    } catch (error) {
      console.error('Erreur suppression photo:', error);
      toast.error('Erreur lors de la suppression');
    }
  };


  if (!isOpen) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto"
        onClick={handleBackdropClick}
      >
        <div
          className="bg-white rounded-xl shadow-2xl max-w-5xl w-full my-8 overflow-hidden flex flex-col max-h-[90vh]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-[#1E40AF] to-[#1E3A8A] text-white p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold">Espace Client</h2>
                <p className="text-blue-100 mt-1">
                  {acquereur.prenom} {acquereur.nom}
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Sélecteur de lots */}
            {lotsLmnp.length > 1 && (
              <div className="mt-4">
                <label className="text-xs font-semibold text-blue-100 uppercase mb-2 block">
                  Lot à visualiser ({lotsLmnp.length} lots)
                </label>
                <select
                  value={selectedLotId || ''}
                  onChange={(e) => setSelectedLotId(e.target.value)}
                  className="w-full px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent"
                >
                  {lotsLmnp.map((lot) => (
                    <option key={lot.id} value={lot.id} className="text-slate-900">
                      {lot.residence?.nom || 'Résidence'} - Lot {lot.numero} ({lot.statut})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {lotsLmnp.length === 1 && lotLmnp && (
              <div className="mt-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg px-4 py-2">
                <p className="text-sm text-blue-100">
                  <span className="font-semibold">{lotLmnp.residence?.nom || 'Résidence'}</span> - Lot {lotLmnp.numero}
                </p>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-4 mb-6">
                <TabsTrigger value="messages" className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  Messages
                </TabsTrigger>
                <TabsTrigger value="photos" className="flex items-center gap-2">
                  <ImageIcon className="w-4 h-4" />
                  Photos
                </TabsTrigger>
                <TabsTrigger value="appels-fond" className="flex items-center gap-2">
                  <Hammer className="w-4 h-4" />
                  Appels de fond
                </TabsTrigger>
                <TabsTrigger value="faq" className="flex items-center gap-2">
                  <HelpCircle className="w-4 h-4" />
                  FAQ
                </TabsTrigger>
              </TabsList>

              {/* Messages Tab */}
              <TabsContent value="messages" className="space-y-4">
                <div className="space-y-4 mb-6 max-h-[400px] overflow-y-auto">
                  {messages.length === 0 ? (
                    <div className="text-center py-8 text-slate-500">
                      Aucun message pour le moment
                    </div>
                  ) : (
                    messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`p-4 rounded-lg ${
                          msg.expediteur_type === 'admin'
                            ? 'bg-blue-50 ml-8'
                            : 'bg-slate-50 mr-8'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <span className="font-medium text-slate-700">
                            {msg.expediteur_type === 'admin' ? 'Admin' : 'Acquéreur'}
                          </span>
                          <span className="text-xs text-slate-500">
                            {format(new Date(msg.created_at), 'dd/MM/yyyy HH:mm', { locale: fr })}
                          </span>
                        </div>
                        <p className="text-slate-700">{msg.message}</p>
                      </div>
                    ))
                  )}
                </div>

                <div className="flex gap-2">
                  <Textarea
                    placeholder="Votre message..."
                    value={nouveauMessage}
                    onChange={(e) => setNouveauMessage(e.target.value)}
                    rows={3}
                    className="flex-1"
                  />
                  <Button
                    onClick={handleSendMessage}
                    className="bg-[#1E40AF] hover:bg-[#1E3A8A] self-end"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </TabsContent>

              {/* Photos Tab */}
              <TabsContent value="photos" className="space-y-4">
                {loadingLots ? (
                  <div className="text-center py-8 text-slate-500">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1E40AF] mx-auto mb-2"></div>
                    Chargement des lots...
                  </div>
                ) : !lotLmnp?.id ? (
                  <div className="text-center py-8 text-slate-500">
                    <p className="mb-2">Aucun lot associé. Les photos seront disponibles une fois un lot attribué.</p>
                    <p className="text-xs text-slate-400">
                      Acquéreur ID: {acquereur?.id || 'non défini'} - Lots trouvés: {lotsLmnp.length}
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between mb-4">
                      {lotsLmnp.length > 1 && (
                        <div className="text-sm text-slate-600">
                          <span className="font-semibold">Lot {lotLmnp.numero}</span> - {lotLmnp.residence?.nom}
                        </div>
                      )}
                      <div className={lotsLmnp.length === 1 ? 'ml-auto' : ''}>
                        <label>
                          <input
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={handleUploadPhoto}
                            className="hidden"
                            disabled={uploading}
                          />
                          <Button
                            as="span"
                            className="bg-[#1E40AF] hover:bg-[#1E3A8A] cursor-pointer"
                            disabled={uploading}
                          >
                            <Upload className="w-4 h-4 mr-2" />
                            {uploading ? 'Upload en cours...' : 'Ajouter des photos'}
                          </Button>
                        </label>
                      </div>
                    </div>

                    {photos.length === 0 ? (
                      <div className="text-center py-8 text-slate-500">
                        <ImageIcon className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                        Aucune photo pour le moment
                      </div>
                    ) : (
                      <div className="grid grid-cols-3 gap-4">
                        {photos.map((photo) => (
                          <div key={photo.id} className="relative group">
                            <div
                              className="cursor-pointer group relative aspect-square overflow-hidden rounded-lg border border-slate-200"
                              onClick={() => setSelectedPhoto(photo)}
                            >
                              <img
                                src={photo.url}
                                alt={photo.legende || 'Photo'}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                              />
                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center">
                                <ImageIcon className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                              </div>
                              {photo.categorie && (
                                <div className="absolute top-2 left-2">
                                  <Badge className="bg-white/90 text-slate-700 text-xs">
                                    {photo.categorie}
                                  </Badge>
                                </div>
                              )}
                            </div>
                            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditingPhoto(photo);
                                  setPhotoForm({ titre: photo.legende || '', description: '' });
                                }}
                                className="p-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded"
                              >
                                <FileText className="w-4 h-4" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeletePhoto(photo.id);
                                }}
                                className="p-1.5 bg-red-600 hover:bg-red-700 text-white rounded"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                            {photo.legende && (
                              <p className="text-xs text-slate-600 mt-1 truncate">{photo.legende}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </TabsContent>

              {/* Appels de fond Tab */}
              <TabsContent value="appels-fond" className="space-y-4">
                {loadingLots ? (
                  <div className="text-center py-8 text-slate-500">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1E40AF] mx-auto mb-2"></div>
                    Chargement des lots...
                  </div>
                ) : !lotLmnp?.id ? (
                  <div className="text-center py-8 text-slate-500">
                    <p className="mb-2">Aucun lot associé. Les appels de fond seront disponibles une fois un lot attribué.</p>
                    <p className="text-xs text-slate-400">
                      Acquéreur ID: {acquereur?.id || 'non défini'} - Lots trouvés: {lotsLmnp.length}
                    </p>
                  </div>
                ) : (
                  <>
                    {lotsLmnp.length > 1 && (
                      <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-sm text-blue-900">
                          <span className="font-semibold">Lot {lotLmnp.numero}</span> - {lotLmnp.residence?.nom} - {lotLmnp.residence?.ville}
                        </p>
                      </div>
                    )}
                    <div className="-mx-6">
                      <AppelsDeFondTimeline
                        lotId={lotLmnp.id}
                        acquereurId={acquereur.id}
                        isAdmin={true}
                      />
                    </div>
                  </>
                )}
              </TabsContent>

              {/* FAQ Tab */}
              <TabsContent value="faq" className="space-y-4">
                {faq.length === 0 ? (
                  <div className="text-center py-8 text-slate-500">
                    Aucune question fréquente disponible
                  </div>
                ) : (
                  <div className="space-y-4">
                    {faq.map((item) => (
                      <div key={item.id} className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                        <h3 className="font-semibold text-slate-700 mb-2">{item.question}</h3>
                        <p className="text-slate-600 text-sm">{item.reponse}</p>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      {/* Photo Detail Dialog */}
      {selectedPhoto && (
        <Dialog open={!!selectedPhoto} onOpenChange={() => setSelectedPhoto(null)}>
          <DialogContent className="max-w-4xl">
            <img src={selectedPhoto.url} alt={selectedPhoto.legende || 'Photo'} className="w-full rounded-lg" />
            {selectedPhoto.legende && <h3 className="font-semibold mt-4">{selectedPhoto.legende}</h3>}
            {selectedPhoto.categorie && (
              <Badge className="mt-2">{selectedPhoto.categorie}</Badge>
            )}
          </DialogContent>
        </Dialog>
      )}

      {/* Photo Edit Dialog */}
      {editingPhoto && (
        <Dialog open={!!editingPhoto} onOpenChange={() => setEditingPhoto(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Modifier la légende</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Légende</label>
                <Input
                  value={photoForm.titre}
                  onChange={(e) => setPhotoForm({ ...photoForm, titre: e.target.value })}
                  placeholder="Description de la photo"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditingPhoto(null)}>
                Annuler
              </Button>
              <Button onClick={handleUpdatePhoto} className="bg-[#1E40AF] hover:bg-[#1E3A8A]">
                Enregistrer
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

    </>
  );
}
