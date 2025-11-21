import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { appelsDeFondService } from '@/api/appelsDeFond';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Hammer, Plus, Check, Clock, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useAuth } from '@/contexts/AuthContext';

export default function AppelsDeFondSection({ acquereurId, lotId }) {
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  const [showValidationDialog, setShowValidationDialog] = useState(false);
  const [selectedAppel, setSelectedAppel] = useState(null);
  const [notesAdmin, setNotesAdmin] = useState('');

  const { data: appelsDeFond = [], isLoading } = useQuery({
    queryKey: ['appels-fond', acquereurId],
    queryFn: () => appelsDeFondService.listByAcquereur(acquereurId),
    enabled: !!acquereurId
  });

  const createDefaultMutation = useMutation({
    mutationFn: () => appelsDeFondService.createDefaultSteps(lotId, acquereurId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appels-fond', acquereurId] });
    }
  });

  const validerMutation = useMutation({
    mutationFn: ({ id, notes }) => appelsDeFondService.validerParAdmin(id, profile.id, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appels-fond', acquereurId] });
      setShowValidationDialog(false);
      setSelectedAppel(null);
      setNotesAdmin('');
    }
  });

  const completerMutation = useMutation({
    mutationFn: (id) => appelsDeFondService.marquerComplete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appels-fond', acquereurId] });
    }
  });

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

  if (!lotId) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Hammer className="w-5 h-5 text-[#F59E0B]" />
            Appels de fond
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-500 text-sm">
            Aucun lot associé à cet acquéreur. Les appels de fond seront disponibles une fois un lot attribué.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Hammer className="w-5 h-5 text-[#F59E0B]" />
            Appels de fond
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-slate-100 rounded-lg animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Hammer className="w-5 h-5 text-[#F59E0B]" />
              Appels de fond de travaux
            </CardTitle>
            {appelsDeFond.length === 0 && (
              <Button
                size="sm"
                onClick={() => createDefaultMutation.mutate()}
                className="bg-[#1E40AF] hover:bg-[#1E3A8A]"
                disabled={createDefaultMutation.isPending}
              >
                <Plus className="w-4 h-4 mr-2" />
                Créer les étapes
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {appelsDeFond.length === 0 ? (
            <div className="text-center py-8">
              <Hammer className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 mb-4">
                Aucun appel de fond créé pour le moment
              </p>
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

                          {appel.statut === 'valide_admin' && appel.date_validation_admin && (
                            <p className="text-xs text-blue-600 mb-2">
                              Validé le {format(new Date(appel.date_validation_admin), 'dd MMM yyyy', { locale: fr })}
                            </p>
                          )}

                          {appel.statut === 'complete' && appel.date_completion && (
                            <p className="text-xs text-green-600 mb-2">
                              Terminé le {format(new Date(appel.date_completion), 'dd MMM yyyy', { locale: fr })}
                            </p>
                          )}

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
        </CardContent>
      </Card>

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
