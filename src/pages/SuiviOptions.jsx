import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Clock, CheckCircle, XCircle, AlertCircle, Filter, ShoppingBag } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function SuiviOptions() {
  const [currentUser, setCurrentUser] = useState(null);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    base44.auth.me().then(setCurrentUser);
  }, []);

  const { data: toutesOptions = [], refetch: refetchOptions } = useQuery({
    queryKey: ['toutes_mes_options'],
    queryFn: () => base44.entities.OptionLot.filter({ partenaire_id: currentUser?.partenaire_id }),
    enabled: !!currentUser?.partenaire_id,
    staleTime: 0,
    cacheTime: 0,
  });

  const { data: lots = [], refetch: refetchLots } = useQuery({
    queryKey: ['lots_suivi'],
    queryFn: () => base44.entities.LotLMNP.list(),
    staleTime: 0,
    cacheTime: 0,
  });

  useEffect(() => {
    if (currentUser?.partenaire_id) {
      refetchOptions();
      refetchLots();
    }
  }, [currentUser?.partenaire_id]);

  // Filtrer les lots par statut
  const filteredLots = filter === "all" 
    ? lots 
    : lots.filter(l => l.statut === filter);

  // Regrouper les LOTS par statut (pas les options)
  // Pour chaque option du partenaire, on récupère le lot correspondant
  const getLotsByStatut = (statut) => {
    // D'abord, on obtient tous les lots avec ce statut
    const lotsAvecStatut = lots.filter(l => l.statut === statut);

    // Filtrer les options actives (non annulées)
    const optionsActives = toutesOptions.filter(opt => opt.statut !== 'annulee');

    // Ensuite, on garde seulement ceux qui ont au moins une option active du partenaire
    const lotsPartenaire = lotsAvecStatut
      .filter(lot => {
        // Vérifier si ce lot a au moins une option active du partenaire
        return optionsActives.some(opt => opt.lot_lmnp_id === lot.id);
      })
      .map(lot => {
        // Trouver l'option active la plus récente pour ce lot
        const optionsForLot = optionsActives
          .filter(o => o.lot_lmnp_id === lot.id)
          .sort((a, b) => new Date(b.created_at || b.date_option) - new Date(a.created_at || a.date_option));

        return {
          ...lot,
          option: optionsForLot[0] || null
        };
      });

    return lotsPartenaire;
  };

  const lotsSousOption = getLotsByStatut('sous_option');
  const lotsReserve = getLotsByStatut('reserve');
  const lotsAllotement = getLotsByStatut('allotement');
  const lotsCompromis = getLotsByStatut('compromis');
  const lotsVendu = getLotsByStatut('vendu');

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

  const renderLotCard = (lotWithOption) => {
    const lot = lotWithOption;
    const option = lotWithOption.option;

    const isExpiringSoon = option && option.statut === 'active' && new Date(option.date_expiration) - new Date() < 24 * 60 * 60 * 1000;
    const isMyOption = option && option.user_email === currentUser?.email;

    // Utiliser les informations du lot
    const lotReference = lot.reference || 'N/A';
    const residenceNom = lot.residence_nom || 'N/A';
    const acquereurNom = lot.acquereur_nom || 'Non spécifié';
    const lotStatut = lot.statut || 'inconnu';

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
      <Card key={lot.id} className="border-none shadow-md">
        <CardContent className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <p className="font-semibold text-[#1E40AF] text-lg">
                  Lot {lotReference}
                </p>
                {option.pose_par === 'admin' && (
                  <Badge className="bg-indigo-100 text-indigo-800 text-xs">
                    Posée par admin
                  </Badge>
                )}
              </div>
              <p className="text-sm text-slate-600 mb-3">{residenceNom}</p>

              {/* Statut du lot en gros */}
              <Badge className={`${lotStatusColors[lotStatut]} text-base px-3 py-1.5 font-semibold`}>
                {lotStatusLabels[lotStatut]}
              </Badge>
            </div>
            <Badge className={config.color}>
              <Icon className="w-3 h-3 mr-1" />
              {config.label}
            </Badge>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500">Acquéreur:</span>
              <span className="font-medium">{acquereurNom}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Date début:</span>
              <span className="font-medium">
                {option && option.date_option ? new Date(option.date_option).toLocaleDateString('fr-FR') : 'N/A'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Date fin:</span>
              <span className="font-medium">
                {option && option.date_expiration ? new Date(option.date_expiration).toLocaleDateString('fr-FR') : 'N/A'}
              </span>
            </div>
            {option && option.statut === 'active' && (
              <div className={`p-3 rounded-lg border mt-3 ${isExpiringSoon ? 'bg-red-50 border-red-200' : 'bg-blue-50 border-blue-200'}`}>
                <div className="flex items-center gap-2">
                  <Clock className={`w-4 h-4 ${isExpiringSoon ? 'text-red-600' : 'text-blue-600'}`} />
                  <span className={`font-semibold ${isExpiringSoon ? 'text-red-800' : 'text-blue-800'}`}>
                    {getTimeRemaining(option.date_expiration)} restants
                  </span>
                </div>
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
          <h1 className="text-3xl font-bold text-[#1E40AF]">Suivi de mes options</h1>
          <p className="text-slate-500 mt-1">Historique complet de vos options et réservations</p>
        </div>

        {/* Filtre par statut de lot */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <Filter className="w-5 h-5 text-[#F59E0B]" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-slate-700 mb-2">Filtrer par statut du lot</p>
                <Select value={filter} onValueChange={setFilter}>
                  <SelectTrigger className="w-full md:w-64">
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
                  <p className="text-sm text-slate-500">Sous option</p>
                  <p className="text-2xl font-bold text-[#1E40AF]">{lotsSousOption.length}</p>
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
                  <p className="text-sm text-slate-500">Réservé</p>
                  <p className="text-2xl font-bold text-[#1E40AF]">{lotsReserve.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-purple-50">
                  <AlertCircle className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">Allotement</p>
                  <p className="text-2xl font-bold text-[#1E40AF]">{lotsAllotement.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-orange-50">
                  <CheckCircle className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">Compromis</p>
                  <p className="text-2xl font-bold text-[#1E40AF]">{lotsCompromis.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-amber-50">
                  <ShoppingBag className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">Vendu</p>
                  <p className="text-2xl font-bold text-[#1E40AF]">{lotsVendu.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs par statut de lot */}
        <Tabs defaultValue="sous_option" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="sous_option">Sous option ({lotsSousOption.length})</TabsTrigger>
            <TabsTrigger value="reserve">Réservé ({lotsReserve.length})</TabsTrigger>
            <TabsTrigger value="allotement">Allotement ({lotsAllotement.length})</TabsTrigger>
            <TabsTrigger value="compromis">Compromis ({lotsCompromis.length})</TabsTrigger>
            <TabsTrigger value="vendu">Vendu ({lotsVendu.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="sous_option" className="mt-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {lotsSousOption.length === 0 ? (
                <p className="text-slate-400 col-span-full text-center py-12">Aucun lot sous option</p>
              ) : (
                lotsSousOption.map(renderLotCard)
              )}
            </div>
          </TabsContent>

          <TabsContent value="reserve" className="mt-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {lotsReserve.length === 0 ? (
                <p className="text-slate-400 col-span-full text-center py-12">Aucun lot réservé</p>
              ) : (
                lotsReserve.map(renderLotCard)
              )}
            </div>
          </TabsContent>

          <TabsContent value="allotement" className="mt-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {lotsAllotement.length === 0 ? (
                <p className="text-slate-400 col-span-full text-center py-12">Aucun lot en allotement</p>
              ) : (
                lotsAllotement.map(renderLotCard)
              )}
            </div>
          </TabsContent>

          <TabsContent value="compromis" className="mt-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {lotsCompromis.length === 0 ? (
                <p className="text-slate-400 col-span-full text-center py-12">Aucun lot en compromis</p>
              ) : (
                lotsCompromis.map(renderLotCard)
              )}
            </div>
          </TabsContent>

          <TabsContent value="vendu" className="mt-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {lotsVendu.length === 0 ? (
                <p className="text-slate-400 col-span-full text-center py-12">Aucun lot vendu</p>
              ) : (
                lotsVendu.map(renderLotCard)
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}