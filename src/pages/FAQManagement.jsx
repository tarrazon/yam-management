import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { faqService } from '@/api/faq';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { HelpCircle, Plus, Edit, Trash2, ChevronUp, ChevronDown, Eye, EyeOff, Save, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function FAQManagement() {
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  const [showDialog, setShowDialog] = useState(false);
  const [editingFaq, setEditingFaq] = useState(null);
  const [formData, setFormData] = useState({
    question: '',
    reponse: '',
    categorie: 'Général',
    ordre: 0,
    actif: true
  });

  const { data: faqs = [], isLoading } = useQuery({
    queryKey: ['faqs'],
    queryFn: () => faqService.listAll()
  });

  const createMutation = useMutation({
    mutationFn: (data) => faqService.create({ ...data, created_by: profile.id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['faqs'] });
      resetForm();
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => faqService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['faqs'] });
      resetForm();
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => faqService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['faqs'] });
    }
  });

  const resetForm = () => {
    setFormData({
      question: '',
      reponse: '',
      categorie: 'Général',
      ordre: 0,
      actif: true
    });
    setEditingFaq(null);
    setShowDialog(false);
  };

  const handleOpenCreate = () => {
    resetForm();
    setShowDialog(true);
  };

  const handleOpenEdit = (faq) => {
    setEditingFaq(faq);
    setFormData({
      question: faq.question,
      reponse: faq.reponse,
      categorie: faq.categorie || 'Général',
      ordre: faq.ordre,
      actif: faq.actif
    });
    setShowDialog(true);
  };

  const handleSubmit = () => {
    if (editingFaq) {
      updateMutation.mutate({ id: editingFaq.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleToggleActif = (faq) => {
    updateMutation.mutate({
      id: faq.id,
      data: { ...faq, actif: !faq.actif }
    });
  };

  const handleDelete = (id) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette question ?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleMoveUp = (faq) => {
    updateMutation.mutate({
      id: faq.id,
      data: { ...faq, ordre: Math.max(0, faq.ordre - 1) }
    });
  };

  const handleMoveDown = (faq) => {
    updateMutation.mutate({
      id: faq.id,
      data: { ...faq, ordre: faq.ordre + 1 }
    });
  };

  const faqsByCategory = faqs.reduce((acc, faq) => {
    const cat = faq.categorie || 'Général';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(faq);
    return acc;
  }, {});

  const categories = ['Général', 'Financement', 'Travaux', 'Location', 'Fiscalité', 'Garanties'];

  if (profile?.role_custom !== 'admin') {
    return (
      <div className="p-6 md:p-8 bg-[#F9FAFB] min-h-screen">
        <Card>
          <CardContent className="p-12 text-center">
            <HelpCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-slate-700 mb-2">Accès refusé</h2>
            <p className="text-slate-500">Vous n'avez pas les permissions pour accéder à cette page.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 bg-[#F9FAFB] min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex justify-between items-start">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <HelpCircle className="w-8 h-8 text-[#1E40AF]" />
              <h1 className="text-3xl font-bold text-[#1E40AF]">Gestion des FAQ</h1>
            </div>
            <p className="text-slate-500">{faqs.length} questions · {faqs.filter(f => f.actif).length} actives</p>
          </div>
          <Button onClick={handleOpenCreate} className="bg-[#1E40AF] hover:bg-[#1E3A8A]">
            <Plus className="w-4 h-4 mr-2" />
            Nouvelle question
          </Button>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-slate-200 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : Object.keys(faqsByCategory).length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <HelpCircle className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">Aucune question pour le moment</p>
              <Button onClick={handleOpenCreate} className="mt-4 bg-[#1E40AF] hover:bg-[#1E3A8A]">
                Créer la première question
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {Object.entries(faqsByCategory).map(([categorie, questions]) => (
              <Card key={categorie}>
                <CardHeader>
                  <CardTitle className="text-[#1E40AF]">{categorie}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <AnimatePresence>
                      {questions.map((faq, index) => (
                        <motion.div
                          key={faq.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          className="bg-white border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h3 className="font-semibold text-slate-700">{faq.question}</h3>
                                {faq.actif ? (
                                  <Badge className="bg-green-100 text-green-800">
                                    <Eye className="w-3 h-3 mr-1" />
                                    Visible
                                  </Badge>
                                ) : (
                                  <Badge className="bg-slate-100 text-slate-600">
                                    <EyeOff className="w-3 h-3 mr-1" />
                                    Masqué
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-slate-600 line-clamp-2">{faq.reponse}</p>
                            </div>

                            <div className="flex items-center gap-2">
                              <div className="flex flex-col gap-1">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleMoveUp(faq)}
                                  disabled={index === 0}
                                  title="Monter"
                                >
                                  <ChevronUp className="w-4 h-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleMoveDown(faq)}
                                  disabled={index === questions.length - 1}
                                  title="Descendre"
                                >
                                  <ChevronDown className="w-4 h-4" />
                                </Button>
                              </div>

                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleToggleActif(faq)}
                                title={faq.actif ? 'Masquer' : 'Afficher'}
                              >
                                {faq.actif ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                              </Button>

                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleOpenEdit(faq)}
                                title="Modifier"
                              >
                                <Edit className="w-4 h-4 text-blue-600" />
                              </Button>

                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleDelete(faq.id)}
                                title="Supprimer"
                                className="hover:bg-red-50"
                              >
                                <Trash2 className="w-4 h-4 text-red-600" />
                              </Button>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogContent className="sm:max-w-2xl bg-white max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-[#1E40AF]">
                {editingFaq ? 'Modifier la question' : 'Nouvelle question'}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Question <span className="text-red-500">*</span></Label>
                <Input
                  placeholder="Ex: Comment fonctionne le dispositif LMNP ?"
                  value={formData.question}
                  onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Réponse <span className="text-red-500">*</span></Label>
                <Textarea
                  placeholder="Réponse détaillée à la question..."
                  value={formData.reponse}
                  onChange={(e) => setFormData({ ...formData, reponse: e.target.value })}
                  rows={6}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Catégorie</Label>
                  <Select
                    value={formData.categorie}
                    onValueChange={(value) => setFormData({ ...formData, categorie: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      {categories.map(cat => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Ordre d'affichage</Label>
                  <Input
                    type="number"
                    min="0"
                    value={formData.ordre}
                    onChange={(e) => setFormData({ ...formData, ordre: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  checked={formData.actif}
                  onCheckedChange={(checked) => setFormData({ ...formData, actif: checked })}
                />
                <Label>Question visible pour les acquéreurs</Label>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={resetForm}>
                <X className="w-4 h-4 mr-2" />
                Annuler
              </Button>
              <Button
                onClick={handleSubmit}
                className="bg-[#1E40AF] hover:bg-[#1E3A8A]"
                disabled={!formData.question || !formData.reponse || createMutation.isPending || updateMutation.isPending}
              >
                <Save className="w-4 h-4 mr-2" />
                {editingFaq ? 'Modifier' : 'Créer'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
