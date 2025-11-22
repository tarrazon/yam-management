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

export default function EspaceClientModal({ acquereur, isOpen, onClose }) {
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('messages');

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

  // Appels de fond
  const [showValidationDialog, setShowValidationDialog] = useState(false);
  const [selectedAppel, setSelectedAppel] = useState(null);
  const [notesAdmin, setNotesAdmin] = useState('');

  // Récupérer les lots associés
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
    enabled: isOpen && !!acquereur.id,
  });

  const lotLmnp = lotsLmnp.length > 0 ? lotsLmnp[0] : null;

  // Charger les appels de fond
  const { data: appelsDeFond = [], isLoading: loadingAppels } = useQuery({
    queryKey: ['appels-fond', acquereur.id],
    queryFn: () => appelsDeFondService.listByAcquereur(acquereur.id),
    enabled: isOpen && !!acquereur.id && !!lotLmnp?.id
  });

  // Mutations pour appels de fond
  const createDefaultMutation = useMutation({
    mutationFn: () => appelsDeFondService.createDefaultSteps(lotLmnp.id, acquereur.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appels-fond', acquereur.id] });
      toast.success('Étapes créées avec succès');
    }
  });

  const validerMutation = useMutation({
    mutationFn: ({ id, notes }) => appelsDeFondService.validerParAdmin(id, profile.id, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appels-fond', acquereur.id] });
      setShowValidationDialog(false);
      setSelectedAppel(null);
      setNotesAdmin('');
      toast.success('Étape validée');
    }
  });

  const completerMutation = useMutation({
    mutationFn: (id) => appelsDeFondService.marquerComplete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appels-fond', acquereur.id] });
      toast.success('Étape marquée comme terminée');
    }
  });

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
          titre: file.name.replace(/\.[^/.]+$/, ''),
          photo_url: publicUrl,
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
        titre: photoForm.titre,
        description: photoForm.description,
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

  const handleOpenValidation = (appel) => {
    setSelectedAppel(appel);
    setNotesAdmin('');
    setShowValidationDialog(true);
  };

  const handleValider = () => {
    if (selectedAppel) {
      validerMutation.mutate({ id: selectedAppel.id, notes: notesAdmin });
    }
  };

  const getStatutIcon = (statut) => {
    switch (statut) {
      case 'complete':
        return <CheckCircle className="w-6 h-6 text-white" />;
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
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-[#1E40AF] to-[#1E3A8A] text-white p-6">
            <div className="flex items-center justify-between">
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
                {!lotLmnp?.id ? (
                  <div className="text-center py-8 text-slate-500">
                    Aucun lot associé. Les photos seront disponibles une fois un lot attribué.
                  </div>
                ) : (
                  <>
                    <div className="flex justify-end mb-4">
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
                                src={photo.photo_url}
                                alt={photo.titre}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                              />
                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center">
                                <ImageIcon className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                              </div>
                            </div>
                            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditingPhoto(photo);
                                  setPhotoForm({ titre: photo.titre || '', description: photo.description || '' });
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
                            {photo.titre && (
                              <p className="text-xs text-slate-600 mt-1 truncate">{photo.titre}</p>
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
                {!lotLmnp?.id ? (
                  <div className="text-center py-8 text-slate-500">
                    Aucun lot associé. Les appels de fond seront disponibles une fois un lot attribué.
                  </div>
                ) : (
                  <>
                    {appelsDeFond.length === 0 && (
                      <div className="flex justify-end mb-4">
                        <Button
                          onClick={() => createDefaultMutation.mutate()}
                          className="bg-[#1E40AF] hover:bg-[#1E3A8A]"
                          disabled={createDefaultMutation.isPending}
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Créer les étapes
                        </Button>
                      </div>
                    )}

                    {appelsDeFond.length === 0 ? (
                      <div className="text-center py-8 text-slate-500">
                        <Hammer className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                        Aucun appel de fond créé pour le moment
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <AnimatePresence>
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
                                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                                    <div className="flex items-start justify-between mb-2">
                                      <div className="flex-1">
                                        <h3 className="font-semibold text-slate-700">{appel.etape}</h3>
                                        {appel.description && (
                                          <p className="text-sm text-slate-600 mt-1">{appel.description}</p>
                                        )}
                                      </div>
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

                                    {appel.notes_admin && (
                                      <div className="mt-3 p-3 bg-blue-50 rounded border border-blue-200">
                                        <p className="text-xs font-medium text-blue-900 mb-1">Note admin:</p>
                                        <p className="text-xs text-blue-700">{appel.notes_admin}</p>
                                      </div>
                                    )}

                                    <div className="flex gap-2 mt-3">
                                      {appel.statut === 'en_attente' && (
                                        <Button
                                          size="sm"
                                          onClick={() => handleOpenValidation(appel)}
                                          className="bg-blue-600 hover:bg-blue-700 text-white"
                                        >
                                          <Check className="w-3 h-3 mr-1" />
                                          Valider
                                        </Button>
                                      )}
                                      {appel.statut === 'valide_admin' && (
                                        <Button
                                          size="sm"
                                          onClick={() => completerMutation.mutate(appel.id)}
                                          className="bg-green-600 hover:bg-green-700 text-white"
                                          disabled={completerMutation.isPending}
                                        >
                                          <CheckCircle className="w-3 h-3 mr-1" />
                                          Marquer terminé
                                        </Button>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          ))}
                        </AnimatePresence>
                      </div>
                    )}
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
            <img src={selectedPhoto.photo_url} alt={selectedPhoto.titre} className="w-full rounded-lg" />
            {selectedPhoto.titre && <h3 className="font-semibold mt-4">{selectedPhoto.titre}</h3>}
            {selectedPhoto.description && <p className="text-slate-600">{selectedPhoto.description}</p>}
          </DialogContent>
        </Dialog>
      )}

      {/* Photo Edit Dialog */}
      {editingPhoto && (
        <Dialog open={!!editingPhoto} onOpenChange={() => setEditingPhoto(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Modifier la photo</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Titre</label>
                <Input
                  value={photoForm.titre}
                  onChange={(e) => setPhotoForm({ ...photoForm, titre: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  value={photoForm.description}
                  onChange={(e) => setPhotoForm({ ...photoForm, description: e.target.value })}
                  rows={3}
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

      {/* Validation Dialog */}
      <Dialog open={showValidationDialog} onOpenChange={setShowValidationDialog}>
        <DialogContent className="sm:max-w-md bg-white">
          <DialogHeader>
            <DialogTitle className="text-[#1E40AF]">Valider l'étape</DialogTitle>
          </DialogHeader>
          {selectedAppel && (
            <div className="space-y-4 py-4">
              <div>
                <p className="font-semibold text-slate-700 mb-1">{selectedAppel.etape}</p>
                <p className="text-sm text-slate-600">{selectedAppel.description}</p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  Notes (optionnel)
                </label>
                <Textarea
                  placeholder="Ajouter des notes pour l'acquéreur..."
                  value={notesAdmin}
                  onChange={(e) => setNotesAdmin(e.target.value)}
                  rows={4}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowValidationDialog(false)}
            >
              Annuler
            </Button>
            <Button
              onClick={handleValider}
              className="bg-blue-600 hover:bg-blue-700 text-white"
              disabled={validerMutation.isPending}
            >
              <Check className="w-4 h-4 mr-2" />
              Valider cette étape
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
