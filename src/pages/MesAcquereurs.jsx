import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, Mail, Phone, User, Euro, Plus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import AcquereurForm from "../components/acquereurs/AcquereurForm";

export default function MesAcquereurs() {
  const [currentUser, setCurrentUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    base44.auth.me().then(setCurrentUser);
  }, []);

  const { data: mesAcquereurs = [] } = useQuery({
    queryKey: ['mes_acquereurs_full'],
    queryFn: () => base44.entities.Acquereur.filter({ partenaire_id: currentUser?.partenaire_id }),
    enabled: !!currentUser?.partenaire_id,
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

  const handleSubmit = (data) => {
    const partenaire = partenaires.find(p => p.id === data.partenaire_id);
    const enrichedData = {
      ...data,
      partenaire_id: currentUser?.partenaire_id,
      partenaire_nom: partenaire?.nom || "",
    };
    createMutation.mutate(enrichedData);
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
              <Card key={acquereur.id} className="border-none shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#1E40AF] to-[#1E3A8A] flex items-center justify-center">
                        <User className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-lg text-[#1E40AF]">
                          {acquereur.prenom} {acquereur.nom}
                        </CardTitle>
                        <Badge className={`${statusColors[acquereur.statut_commercial]} border mt-1`}>
                          {statusLabels[acquereur.statut_commercial]}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {acquereur.email && (
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Mail className="w-4 h-4 text-slate-400" />
                      <a href={`mailto:${acquereur.email}`} className="hover:text-[#1E40AF]">
                        {acquereur.email}
                      </a>
                    </div>
                  )}

                  {acquereur.telephone && (
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Phone className="w-4 h-4 text-slate-400" />
                      <a href={`tel:${acquereur.telephone}`} className="hover:text-[#1E40AF]">
                        {acquereur.telephone}
                      </a>
                    </div>
                  )}

                  {(acquereur.budget_min || acquereur.budget_max || acquereur.budget) && (
                    <div className="pt-3 border-t">
                      <div className="flex items-center gap-2 mb-2">
                        <Euro className="w-4 h-4 text-[#F59E0B]" />
                        <span className="text-sm font-semibold text-slate-700">Budget</span>
                      </div>
                      {acquereur.budget_min || acquereur.budget_max ? (
                        <p className="text-lg font-bold text-[#1E40AF]">
                          {acquereur.budget_min?.toLocaleString('fr-FR') || '...'} - {acquereur.budget_max?.toLocaleString('fr-FR') || '...'} €
                        </p>
                      ) : (
                        <p className="text-lg font-bold text-[#1E40AF]">
                          {acquereur.budget?.toLocaleString('fr-FR')} €
                        </p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}