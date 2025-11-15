import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, Mail, Phone, User, Euro, Plus, Eye, Edit, AlertCircle, Users as UsersIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import AcquereurForm from "../components/acquereurs/AcquereurForm";
import AcquereurDetailPartenaire from "../components/acquereurs/AcquereurDetailPartenaire";
import AcquereurCardPartenaire from "../components/acquereurs/AcquereurCardPartenaire";

export default function MesAcquereurs() {
  const [currentUser, setCurrentUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [viewingAcquereur, setViewingAcquereur] = useState(null);
  const [editingAcquereur, setEditingAcquereur] = useState(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    base44.auth.me().then(setCurrentUser);
  }, []);

  const { data: mesAcquereurs = [] } = useQuery({
    queryKey: ['mes_acquereurs_full'],
    queryFn: () => base44.entities.Acquereur.filter({ partenaire_id: currentUser?.partenaire_id }),
    enabled: !!currentUser?.partenaire_id,
  });

  const { data: lots = [] } = useQuery({
    queryKey: ['lots_lmnp'],
    queryFn: () => base44.entities.LotLMNP.list(),
  });

  const { data: partenaires = [] } = useQuery({
    queryKey: ['partenaires'],
    queryFn: () => base44.entities.Partenaire.list(),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Acquereur.create(data),
    onSuccess: () => {
      queryClient.refetchQueries({ queryKey: ['mes_acquereurs_full'] });
      setShowForm(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Acquereur.update(id, data),
    onSuccess: () => {
      queryClient.refetchQueries({ queryKey: ['mes_acquereurs_full'] });
      setEditingAcquereur(null);
      setViewingAcquereur(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Acquereur.delete(id),
    onSuccess: () => {
      queryClient.refetchQueries({ queryKey: ['mes_acquereurs_full'] });
    },
  });

  const handleSubmit = (data) => {
    const partenaire = partenaires.find(p => p.id === currentUser?.partenaire_id);
    const enrichedData = {
      ...data,
      partenaire_id: currentUser?.partenaire_id,
      partenaire_nom: partenaire?.nom || partenaire?.nom_societe || "",
    };

    if (data.id) {
      updateMutation.mutate({ id: data.id, data: enrichedData });
    } else {
      createMutation.mutate(enrichedData);
    }
  };

  const handleView = (acquereur) => {
    setViewingAcquereur(acquereur);
    setEditingAcquereur(null);
  };

  const handleEdit = (acquereur) => {
    setEditingAcquereur(acquereur);
    setViewingAcquereur(null);
  };

  const getLotForAcquereur = (acquereurId) => {
    return lots.find(lot => lot.acquereur_id === acquereurId);
  };

  const handleDelete = (acquereur) => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer l'acquéreur ${acquereur.prenom} ${acquereur.nom} ?`)) {
      deleteMutation.mutate(acquereur.id);
    }
  };

  const statusColors = {
    prospect: "bg-blue-100 text-blue-800",
    qualifie: "bg-green-100 text-green-800",
    en_negociation: "bg-yellow-100 text-yellow-800",
    compromis: "bg-orange-100 text-orange-800",
    acheteur: "bg-purple-100 text-purple-800",
    perdu: "bg-red-100 text-red-800",
  };

  const statusLabels = {
    prospect: "Prospect",
    qualifie: "Qualifié",
    en_negociation: "En négociation",
    compromis: "Compromis",
    acheteur: "Acheteur",
    perdu: "Perdu",
  };

  const filteredAcquereurs = mesAcquereurs.filter(a =>
    !searchTerm ||
    a.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.prenom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 md:p-8 bg-[#F9FAFB] min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-[#1E40AF]">Mes Acquéreurs</h1>
            <p className="text-slate-500 mt-1">{mesAcquereurs.length} acquéreurs dans votre portefeuille</p>
          </div>
          <Button
            onClick={() => setShowForm(!showForm)}
            className="bg-[#1E40AF] hover:bg-[#1E3A8A] text-white shadow-lg"
          >
            <Plus className="w-5 h-5 mr-2" />
            Nouvel acquéreur
          </Button>
        </div>

        <AnimatePresence>
          {showForm && currentUser && (
            <AcquereurForm
              acquereur={{
                partenaire_id: currentUser.partenaire_id,
                date_entree_crm: new Date().toISOString().split('T')[0]
              }}
              onSubmit={handleSubmit}
              onCancel={() => setShowForm(false)}
              isLoading={createMutation.isPending}
              isPartner={true}
            />
          )}

          {editingAcquereur && (
            <AcquereurForm
              acquereur={editingAcquereur}
              onSubmit={handleSubmit}
              onCancel={() => setEditingAcquereur(null)}
              isLoading={updateMutation.isPending}
              isPartner={true}
            />
          )}

          {viewingAcquereur && (
            <AcquereurDetailPartenaire
              acquereur={viewingAcquereur}
              lot={getLotForAcquereur(viewingAcquereur.id)}
              onClose={() => setViewingAcquereur(null)}
              onEdit={handleEdit}
            />
          )}
        </AnimatePresence>

        {/* Barre de recherche */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <Input
                placeholder="Rechercher un acquéreur..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Liste des acquéreurs */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAcquereurs.length === 0 ? (
            <div className="col-span-full text-center py-20">
              <p className="text-slate-400 text-lg">Aucun acquéreur trouvé</p>
            </div>
          ) : (
            filteredAcquereurs.map(acquereur => (
              <AcquereurCardPartenaire
                key={acquereur.id}
                acquereur={acquereur}
                lot={getLotForAcquereur(acquereur.id)}
                onView={handleView}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}