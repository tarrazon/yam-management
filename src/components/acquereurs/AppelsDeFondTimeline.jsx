import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Check, X, Clock, ChevronRight, Edit2, DollarSign, Plus } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { appelsDeFondService } from "@/api/appelsDeFond";

export default function AppelsDeFondTimeline({ lotId, acquereurId, isAdmin = false }) {
  const queryClient = useQueryClient();
  const [editingEtape, setEditingEtape] = useState(null);
  const [notes, setNotes] = useState("");

  const { data: etapes = [], isLoading } = useQuery({
    queryKey: isAdmin ? ["appels-de-fond", lotId] : ["appels-de-fond-portal", lotId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("appels_de_fond")
        .select("*")
        .eq("lot_id", lotId)
        .order("ordre", { ascending: true });

      if (error) throw error;
      return data || [];
    },
    enabled: !!lotId,
    refetchInterval: isAdmin ? false : 5000, // Rafraîchir toutes les 5 secondes pour les acquéreurs
  });

  const toggleValidationMutation = useMutation({
    mutationFn: async ({ etapeId, currentStatut }) => {
      const newStatut = currentStatut === "valide" ? "en_attente" : "valide";
      const updateData = {
        statut: newStatut,
        date_validation_admin: newStatut === "valide" ? new Date().toISOString() : null,
      };

      const { data: { user } } = await supabase.auth.getUser();
      if (newStatut === "valide") {
        updateData.valide_par = user.id;
      }

      const { error } = await supabase
        .from("appels_de_fond")
        .update(updateData)
        .eq("id", etapeId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(isAdmin ? ["appels-de-fond", lotId] : ["appels-de-fond-portal", lotId]);
      toast.success("Statut mis à jour");
    },
    onError: (error) => {
      toast.error("Erreur lors de la mise à jour: " + error.message);
    },
  });

  const updateNotesMutation = useMutation({
    mutationFn: async ({ etapeId, notes }) => {
      const { error } = await supabase
        .from("appels_de_fond")
        .update({ notes_admin: notes })
        .eq("id", etapeId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(isAdmin ? ["appels-de-fond", lotId] : ["appels-de-fond-portal", lotId]);
      toast.success("Notes enregistrées");
      setEditingEtape(null);
      setNotes("");
    },
    onError: (error) => {
      toast.error("Erreur lors de la sauvegarde: " + error.message);
    },
  });

  const initStepsMutation = useMutation({
    mutationFn: async () => {
      await appelsDeFondService.initStepsForLot(lotId, acquereurId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(isAdmin ? ["appels-de-fond", lotId] : ["appels-de-fond-portal", lotId]);
      toast.success("Étapes initialisées avec succès");
    },
    onError: (error) => {
      toast.error("Erreur lors de l'initialisation: " + error.message);
    },
  });

  const getStatusIcon = (statut) => {
    switch (statut) {
      case "valide":
        return <Check className="w-5 h-5 text-white" />;
      case "complete":
        return <Check className="w-5 h-5 text-white" />;
      case "en_attente":
      default:
        return <Clock className="w-5 h-5 text-white" />;
    }
  };

  const getStatusColor = (statut) => {
    switch (statut) {
      case "valide":
        return "bg-blue-600";
      case "complete":
        return "bg-green-600";
      case "en_attente":
      default:
        return "bg-slate-300";
    }
  };

  const getStatusBadge = (statut) => {
    switch (statut) {
      case "valide":
        return <Badge className="bg-blue-100 text-blue-800">Validé</Badge>;
      case "complete":
        return <Badge className="bg-green-100 text-green-800">Terminé</Badge>;
      case "en_attente":
      default:
        return <Badge className="bg-slate-100 text-slate-800">En attente</Badge>;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-slate-500">Chargement...</div>
        </CardContent>
      </Card>
    );
  }

  if (etapes.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-[#1E40AF]" />
            Appels de fond - Suivi des travaux
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="text-center">
            <p className="text-slate-500 mb-4">
              Aucune étape d'appel de fond configurée pour ce lot.
            </p>
            {isAdmin && (
              <Button
                onClick={() => initStepsMutation.mutate()}
                disabled={initStepsMutation.isPending}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Initialiser les étapes
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-[#1E40AF]" />
            Appels de fond - Suivi des travaux
          </CardTitle>
          {isAdmin && etapes.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (confirm('Réinitialiser les étapes ? Cette action supprimera toutes les étapes actuelles et créera les 10 étapes standards.')) {
                  initStepsMutation.mutate();
                }
              }}
              disabled={initStepsMutation.isPending}
              className="text-slate-600 hover:text-slate-800"
            >
              <Plus className="w-4 h-4 mr-2" />
              Réinitialiser
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-8">
          {etapes.map((etape, index) => (
            <div key={etape.id} className="relative">
              {index < etapes.length - 1 && (
                <div
                  className={`absolute left-[23px] top-12 w-0.5 h-full ${
                    etape.statut === "valide" || etape.statut === "complete"
                      ? "bg-blue-600"
                      : "bg-slate-200"
                  }`}
                />
              )}

              <div className="flex gap-4">
                <div className="flex flex-col items-center flex-shrink-0">
                  <div
                    className={`w-12 h-12 rounded-full ${getStatusColor(
                      etape.statut
                    )} flex items-center justify-center shadow-lg z-10`}
                  >
                    {getStatusIcon(etape.statut)}
                  </div>
                </div>

                <div className="flex-1 pb-8">
                  <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-bold text-slate-900">
                            {etape.etape}
                          </h4>
                          {getStatusBadge(etape.statut)}
                        </div>
                        {etape.sous_titre && (
                          <p className="text-sm text-slate-600 mb-2">
                            {etape.sous_titre}
                          </p>
                        )}

                        {etape.montant && (
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                              {etape.montant.toLocaleString("fr-FR")} €
                            </Badge>
                          </div>
                        )}

                        {etape.pourcentage && (
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                              {etape.pourcentage}%
                            </Badge>
                          </div>
                        )}

                        {etape.date_validation_admin && etape.statut !== 'en_attente' && (
                          <p className="text-xs text-slate-500 mt-2">
                            Validé le{" "}
                            {format(
                              new Date(etape.date_validation_admin),
                              "dd MMMM yyyy 'à' HH:mm",
                              { locale: fr }
                            )}
                          </p>
                        )}

                        {etape.notes_admin && etape.statut !== 'en_attente' && (
                          <div className="mt-2 p-3 bg-blue-50 rounded-md border border-blue-200">
                            <p className="text-sm text-blue-900 font-medium mb-1">Notes de suivi:</p>
                            <p className="text-sm text-blue-800">
                              {etape.notes_admin}
                            </p>
                          </div>
                        )}
                      </div>

                      {isAdmin && (
                        <div className="flex gap-2 flex-shrink-0">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  setEditingEtape(etape);
                                  setNotes(etape.notes_admin || "");
                                }}
                                title="Ajouter des notes"
                              >
                                <Edit2 className="w-4 h-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Notes administrateur</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div>
                                  <label className="text-sm font-medium">
                                    {etape.etape}
                                  </label>
                                  <Textarea
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    placeholder="Ajouter des notes pour cette étape..."
                                    rows={4}
                                    className="mt-2"
                                  />
                                </div>
                                <div className="flex justify-end gap-2">
                                  <Button
                                    variant="outline"
                                    onClick={() => {
                                      setEditingEtape(null);
                                      setNotes("");
                                    }}
                                  >
                                    Annuler
                                  </Button>
                                  <Button
                                    onClick={() =>
                                      updateNotesMutation.mutate({
                                        etapeId: etape.id,
                                        notes,
                                      })
                                    }
                                  >
                                    Enregistrer
                                  </Button>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>

                          <Button
                            size="sm"
                            variant={
                              etape.statut === "valide" ? "outline" : "default"
                            }
                            onClick={() =>
                              toggleValidationMutation.mutate({
                                etapeId: etape.id,
                                currentStatut: etape.statut,
                              })
                            }
                            disabled={toggleValidationMutation.isPending}
                            className={
                              etape.statut === "valide"
                                ? "border-red-300 text-red-600 hover:bg-red-50"
                                : "bg-blue-600 hover:bg-blue-700"
                            }
                          >
                            {etape.statut === "valide" ? (
                              <>
                                <X className="w-4 h-4 mr-1" />
                                Dévalider
                              </>
                            ) : (
                              <>
                                <Check className="w-4 h-4 mr-1" />
                                Valider
                              </>
                            )}
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {isAdmin && (
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> Vous pouvez valider et dévalider les étapes à tout moment.
              Les étapes validées seront visibles par l'acquéreur dans son espace client.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
