import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Clock, CheckCircle, XCircle, AlertCircle, Search, Filter, Edit2, ShoppingBag } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

export default function SuiviOptionsAdmin() {
  const [searchTerm, setSearchTerm] = useState("");
  const [partenaireFilter, setPartenaireFilter] = useState("all");
  const [statutLotFilter, setStatutLotFilter] = useState("all");
  const [editingOptionId, setEditingOptionId] = useState(null);

  const queryClient = useQueryClient();

  const { data: toutesOptions = [] } = useQuery({
    queryKey: ['toutes_options_admin'],
    queryFn: () => base44.entities.OptionLot.list('-created_at'),
  });

  const { data: lots = [] } = useQuery({
    queryKey: ['lots_suivi_admin'],
    queryFn: () => base44.entities.LotLMNP.list(),
  });

  const { data: partenaires = [] } = useQuery({
    queryKey: ['partenaires_options'],
    queryFn: () => base44.entities.Partenaire.list(),
  });

  const updateLotMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.LotLMNP.update(id, data),
    onSuccess: () => {
      queryClient.refetchQueries({ queryKey: ['lots_suivi_admin'] });
      queryClient.refetchQueries({ queryKey: ['toutes_options_admin'] });
      setEditingOptionId(null);
    },
  });

  const handleChangeLotStatut = async (lotId, newStatut) => {
    await updateLotMutation.mutateAsync({ id: lotId, data: { statut: newStatut } });
  };

  const optionsActives = toutesOptions.filter(o => o.statut === 'active');
  const optionsExpirees = toutesOptions.filter(o => o.statut === 'expiree');
  const optionsConverties = toutesOptions.filter(o => o.statut === 'convertie');
  const optionsAnnulees = toutesOptions.filter(o => o.statut === 'annulee');
  
  // Tous les lots vendus
  const lotsVendus = lots.filter(l => l.statut === 'vendu');

  const getTimeRemaining = (dateFin) => {
    const now = new Date();
    const end = new Date(dateFin);
    const diff = end - now;
    
    if (diff <= 0) return "Expiré";
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days}j ${hours}h`;
    return `${hours}h`;
  };

  const filterOptions = (options) => {
    return options.filter(option => {
      const lot = lots.find(l => l.id === option.lot_lmnp_id);
      if (!lot) return false;

      const searchMatch = !searchTerm ||
        lot.reference?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lot.residence_nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lot.acquereur_nom?.toLowerCase().includes(searchTerm.toLowerCase());

      const partenaireMatch = partenaireFilter === "all" || option.partenaire_id === partenaireFilter;
      const statutLotMatch = statutLotFilter === "all" || lot.statut === statutLotFilter;

      return searchMatch && partenaireMatch && statutLotMatch;
    });
  };

  const renderOptionCard = (option) => {
    const lot = lots.find(l => l.id === option.lot_lmnp_id);
    if (!lot) return null;

    const isExpiringSoon = option.statut === 'active' && new Date(option.date_expiration) - new Date() < 24 * 60 * 60 * 1000;
    const isEditing = editingOptionId === option.id;

    const statusConfig = {
      active: { icon: Clock, color: "bg-green-100 text-green-800", label: "Active" },
      expiree: { icon: AlertCircle, color: "bg-red-100 text-red-800", label: "Expirée" },
      convertie: { icon: CheckCircle, color: "bg-blue-100 text-blue-800", label: "Convertie" },
      annulee: { icon: XCircle, color: "bg-slate-100 text-slate-800", label: "Annulée" },
    };

    const lotStatusColors = {
      disponible: "bg-green-100 text-green-800",
      sous_option: "bg-blue-100 text-blue-800",
      allotement: "bg-cyan-100 text-cyan-800",
      reserve: "bg-yellow-100 text-yellow-800",
      compromis: "bg-orange-100 text-orange-800",
      vendu: "bg-purple-100 text-purple-800",
    };

    const lotStatusLabels = {
      disponible: "Disponible",
      sous_option: "Sous option",
      allotement: "Allotement",
      reserve: "Réservé",
      compromis: "Compromis",
      vendu: "Vendu",
    };

    const config = statusConfig[option.statut];
    const Icon = config.icon;

    return (
      <Card key={option.id} className="border-none shadow-md">
        <CardContent className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <p className="font-semibold text-[#1E40AF] text-lg">
                  Lot {lot.reference}
                </p>
              </div>
              <p className="text-sm text-slate-600 mb-3">{lot?.residence_nom}</p>
              <p className="text-xs text-slate-500 mb-3">
                {lot?.typologie} · {lot?.ville}
              </p>
              
              {/* Statut du lot en gros */}
              <Badge className={`${lotStatusColors[lot.statut]} text-base px-3 py-1.5 font-semibold`}>
                {lotStatusLabels[lot.statut]}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <Badge className={config.color}>
                <Icon className="w-3 h-3 mr-1" />
                {config.label}
              </Badge>
            </div>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500">Partenaire:</span>
              <span className="font-medium">{lot.partenaire_nom || "Non spécifié"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Acquéreur:</span>
              <span className="font-medium">{lot.acquereur_nom || "Non spécifié"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Date début:</span>
              <span className="font-medium">
                {new Date(option.date_option).toLocaleDateString('fr-FR')}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Date fin:</span>
              <span className="font-medium">
                {new Date(option.date_expiration).toLocaleDateString('fr-FR')}
              </span>
            </div>
            {option.statut === 'active' && (
              <div className={`p-3 rounded-lg border mt-3 ${isExpiringSoon ? 'bg-red-50 border-red-200' : 'bg-blue-50 border-blue-200'}`}>
                <div className="flex items-center gap-2">
                  <Clock className={`w-4 h-4 ${isExpiringSoon ? 'text-red-600' : 'text-blue-600'}`} />
                  <span className={`font-semibold ${isExpiringSoon ? 'text-red-800' : 'text-blue-800'}`}>
                    {getTimeRemaining(option.date_expiration)} restants
                  </span>
                </div>
              </div>
            )}
            {lot && (
              <div className="pt-2 border-t mt-3">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs text-slate-500">Statut actuel du lot:</p>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setEditingOptionId(isEditing ? null : option.id)}
                    className="h-6 w-6"
                    title={isEditing ? "Annuler" : "Modifier le statut du lot"}
                  >
                    <Edit2 className="w-3 h-3 text-slate-500" />
                  </Button>
                </div>
                {isEditing ? (
                  <Select 
                    value={lot.statut} 
                    onValueChange={(value) => handleChangeLotStatut(lot.id, value)}
                  >
                    <SelectTrigger className="w-full h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectItem value="disponible">Disponible</SelectItem>
                      <SelectItem value="sous_option">Sous option</SelectItem>
                      <SelectItem value="allotement">Allotement</SelectItem>
                      <SelectItem value="reserve">Réservé</SelectItem>
                      <SelectItem value="compromis">Compromis</SelectItem>
                      <SelectItem value="vendu">Vendu</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <Badge className="bg-slate-100 text-slate-800">{lot.statut}</Badge>
                )}
              </div>
            )}
            {option.notes && (
              <div className="pt-2 border-t mt-3">
                <p className="text-xs text-slate-500">Notes:</p>
                <p className="text-sm text-slate-700">{option.notes}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="p-6 md:p-8 bg-[#F9FAFB] min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#1E40AF]">Suivi de toutes les options</h1>
          <p className="text-slate-500 mt-1">Historique complet des options et réservations</p>
        </div>

        {/* Filtres */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Search className="w-4 h-4 text-[#F59E0B]" />
                  Rechercher
                </Label>
                <Input
                  placeholder="Lot, partenaire, acquéreur..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-[#F59E0B]" />
                  Partenaire
                </Label>
                <Select value={partenaireFilter} onValueChange={setPartenaireFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="all">Tous les partenaires</SelectItem>
                    {partenaires.map(p => (
                      <SelectItem key={p.id} value={p.id}>{p.nom}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-[#F59E0B]" />
                  Statut du lot
                </Label>
                <Select value={statutLotFilter} onValueChange={setStatutLotFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="all">Tous les statuts</SelectItem>
                    <SelectItem value="sous_option">Sous option</SelectItem>
                    <SelectItem value="allotement">Allotement</SelectItem>
                    <SelectItem value="reserve">Réservé</SelectItem>
                    <SelectItem value="compromis">Compromis</SelectItem>
                    <SelectItem value="vendu">Vendu</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Statistiques */}
        <div className="grid md:grid-cols-5 gap-6 mb-8">
          <Card className="border-none shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-green-50">
                  <Clock className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">Actives</p>
                  <p className="text-2xl font-bold text-[#1E40AF]">{optionsActives.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-blue-50">
                  <CheckCircle className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">Converties</p>
                  <p className="text-2xl font-bold text-[#1E40AF]">{optionsConverties.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-purple-50">
                  <ShoppingBag className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">Vendus</p>
                  <p className="text-2xl font-bold text-[#1E40AF]">{lotsVendus.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-red-50">
                  <AlertCircle className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">Expirées</p>
                  <p className="text-2xl font-bold text-[#1E40AF]">{optionsExpirees.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-slate-50">
                  <XCircle className="w-6 h-6 text-slate-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">Annulées</p>
                  <p className="text-2xl font-bold text-[#1E40AF]">{optionsAnnulees.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs par statut */}
        <Tabs defaultValue="active" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="active">Actives ({filterOptions(optionsActives).length})</TabsTrigger>
            <TabsTrigger value="convertie">Converties ({filterOptions(optionsConverties).length})</TabsTrigger>
            <TabsTrigger value="vendus">Vendus ({lotsVendus.length})</TabsTrigger>
            <TabsTrigger value="expiree">Expirées ({filterOptions(optionsExpirees).length})</TabsTrigger>
            <TabsTrigger value="annulee">Annulées ({filterOptions(optionsAnnulees).length})</TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="mt-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filterOptions(optionsActives).length === 0 ? (
                <p className="text-slate-400 col-span-full text-center py-12">Aucune option active</p>
              ) : (
                filterOptions(optionsActives).map(renderOptionCard)
              )}
            </div>
          </TabsContent>

          <TabsContent value="convertie" className="mt-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filterOptions(optionsConverties).length === 0 ? (
                <p className="text-slate-400 col-span-full text-center py-12">Aucune option convertie</p>
              ) : (
                filterOptions(optionsConverties).map(renderOptionCard)
              )}
            </div>
          </TabsContent>

          <TabsContent value="vendus" className="mt-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {lotsVendus.length === 0 ? (
                <p className="text-slate-400 col-span-full text-center py-12">Aucun lot vendu</p>
              ) : (
                lotsVendus.map((lot) => (
                  <Card key={lot.id} className="border-none shadow-md">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <p className="font-semibold text-[#1E40AF] text-lg mb-2">
                            Lot {lot.reference}
                          </p>
                          <p className="text-sm text-slate-600 mb-3">{lot.residence_nom}</p>
                          <p className="text-xs text-slate-500 mb-3">
                            {lot.typologie} · {lot.ville}
                          </p>
                          
                          <Badge className="bg-purple-100 text-purple-800 text-base px-3 py-1.5 font-semibold">
                            Vendu
                          </Badge>
                        </div>
                      </div>

                      <div className="space-y-2 text-sm">
                        {lot.partenaire_nom && (
                          <div className="flex justify-between">
                            <span className="text-slate-500">Partenaire:</span>
                            <span className="font-medium">{lot.partenaire_nom}</span>
                          </div>
                        )}
                        {lot.acquereur_nom && (
                          <div className="flex justify-between">
                            <span className="text-slate-500">Acquéreur:</span>
                            <span className="font-medium">{lot.acquereur_nom}</span>
                          </div>
                        )}
                        {lot.prix_fai && (
                          <div className="flex justify-between">
                            <span className="text-slate-500">Prix FAI:</span>
                            <span className="font-semibold text-green-600">{lot.prix_fai.toLocaleString('fr-FR')} €</span>
                          </div>
                        )}
                        {lot.date_signature_acte && (
                          <div className="flex justify-between">
                            <span className="text-slate-500">Date signature:</span>
                            <span className="font-medium">
                              {new Date(lot.date_signature_acte).toLocaleDateString('fr-FR')}
                            </span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="expiree" className="mt-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filterOptions(optionsExpirees).length === 0 ? (
                <p className="text-slate-400 col-span-full text-center py-12">Aucune option expirée</p>
              ) : (
                filterOptions(optionsExpirees).map(renderOptionCard)
              )}
            </div>
          </TabsContent>

          <TabsContent value="annulee" className="mt-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filterOptions(optionsAnnulees).length === 0 ? (
                <p className="text-slate-400 col-span-full text-center py-12">Aucune option annulée</p>
              ) : (
                filterOptions(optionsAnnulees).map(renderOptionCard)
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}