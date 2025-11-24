import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Clock, CheckCircle, XCircle, AlertCircle, Search, Filter, Edit2, ShoppingBag, Mail, MailCheck } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

export default function SuiviOptionsAdmin() {
  const [searchTerm, setSearchTerm] = useState("");
  const [partenaireFilter, setPartenaireFilter] = useState("all");
  const [statutLotFilter, setStatutLotFilter] = useState("all");
  const [editingOptionId, setEditingOptionId] = useState(null);

  const queryClient = useQueryClient();

  const { data: toutesOptions = [], refetch: refetchOptions } = useQuery({
    queryKey: ['toutes_options_admin'],
    queryFn: () => base44.entities.OptionLot.list('-created_at'),
    staleTime: 0,
    cacheTime: 0,
  });

  const { data: lots = [], refetch: refetchLots } = useQuery({
    queryKey: ['lots_suivi_admin'],
    queryFn: () => base44.entities.LotLMNP.list(),
    staleTime: 0,
    cacheTime: 0,
  });

  const { data: partenaires = [] } = useQuery({
    queryKey: ['partenaires_options'],
    queryFn: () => base44.entities.Partenaire.list(),
  });

  useEffect(() => {
    const checkExpiredOptions = async () => {
      try {
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

        const response = await fetch(
          `${supabaseUrl}/functions/v1/expire-options-cron`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${supabaseKey}`,
              'Content-Type': 'application/json',
            },
          }
        );

        if (response.ok) {
          const result = await response.json();
          console.log('Options expirées vérifiées:', result);
        }
      } catch (error) {
        console.error('Erreur lors de la vérification des options expirées:', error);
      }
    };

    checkExpiredOptions();
    refetchOptions();
    refetchLots();
  }, []);

  const updateLotMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.LotLMNP.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lots_suivi_admin'] });
      queryClient.invalidateQueries({ queryKey: ['toutes_options_admin'] });
      queryClient.invalidateQueries({ queryKey: ['lots_lmnp'] });
      queryClient.invalidateQueries({ queryKey: ['lots_disponibles'] });
      queryClient.invalidateQueries({ queryKey: ['lots_suivi'] });
      setEditingOptionId(null);
    },
  });

  const updateOptionMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.OptionLot.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['toutes_options_admin'] });
      queryClient.invalidateQueries({ queryKey: ['lots_suivi_admin'] });
      queryClient.invalidateQueries({ queryKey: ['all_options'] });
      queryClient.invalidateQueries({ queryKey: ['toutes_mes_options'] });
      queryClient.invalidateQueries({ queryKey: ['all_options_partenaire'] });
      queryClient.invalidateQueries({ queryKey: ['lots_lmnp'] });
      queryClient.invalidateQueries({ queryKey: ['lots_disponibles'] });
    },
  });

  const handleChangeLotStatut = async (lotId, newStatut) => {
    // Si le lot devient disponible, annuler l'option active associée
    if (newStatut === 'disponible') {
      const optionActive = toutesOptions.find(
        o => o.lot_lmnp_id === lotId && o.statut === 'active'
      );
      if (optionActive) {
        await updateOptionMutation.mutateAsync({
          id: optionActive.id,
          data: { statut: 'annulee' }
        });
      }
    }
    await updateLotMutation.mutateAsync({ id: lotId, data: { statut: newStatut } });
  };

  // Regrouper les LOTS par statut (pas les options)
  // Pour chaque lot, on récupère l'option la plus récente (non annulée)
  const getLotsByStatut = (statut) => {
    // Filtrer les options actives (non annulées)
    const optionsActives = toutesOptions.filter(opt => opt.statut !== 'annulee');

    return lots
      .filter(l => l.statut === statut)
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

  const filterLots = (lotsWithOptions) => {
    return lotsWithOptions.filter(lot => {
      const searchMatch = !searchTerm ||
        lot.reference?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lot.residence_nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lot.acquereur_nom?.toLowerCase().includes(searchTerm.toLowerCase());

      const partenaireMatch = partenaireFilter === "all" || lot.partenaire_id === partenaireFilter;
      const statutLotMatch = statutLotFilter === "all" || lot.statut === statutLotFilter;

      return searchMatch && partenaireMatch && statutLotMatch;
    });
  };

  const renderLotCard = (lotWithOption) => {
    const lot = lotWithOption;
    const option = lotWithOption.option;

    const isExpiringSoon = option && option.statut === 'active' && new Date(option.date_expiration) - new Date() < 24 * 60 * 60 * 1000;
    const isEditing = editingOptionId === lot.id;

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

    const config = option ? statusConfig[option.statut] : null;
    const Icon = config ? config.icon : null;

    return (
      <Card key={lot.id} className="border-none shadow-md">
        <CardContent className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <p className="font-semibold text-[#1E40AF] text-lg">
                  Lot {lot.reference}
                </p>
                {option && option.pose_par === 'admin' ? (
                  <Badge className="bg-indigo-100 text-indigo-800 text-xs">
                    Posée par admin
                  </Badge>
                ) : option && option.pose_par === 'partenaire' ? (
                  <Badge className="bg-teal-100 text-teal-800 text-xs">
                    Posée par partenaire
                  </Badge>
                ) : null}
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
            {option && config && lot.statut === 'sous_option' && (
              <div className="flex items-center gap-2">
                <Badge className={config.color}>
                  <Icon className="w-3 h-3 mr-1" />
                  {config.label}
                </Badge>
              </div>
            )}
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
            {option && option.statut === 'active' && option.date_option && (
              <div className="flex justify-between">
                <span className="text-slate-500">Date début:</span>
                <span className="font-medium">
                  {new Date(option.date_option).toLocaleDateString('fr-FR')}
                </span>
              </div>
            )}
            {option && option.statut === 'active' && option.date_expiration && (
              <div className="flex justify-between">
                <span className="text-slate-500">Date fin:</span>
                <span className="font-medium">
                  {new Date(option.date_expiration).toLocaleDateString('fr-FR')}
                </span>
              </div>
            )}
            {option && option.statut === 'active' && isExpiringSoon !== null && (
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
                    onClick={() => setEditingOptionId(isEditing ? null : lot.id)}
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
            {option && option.notification_recipient && (
              <div className="pt-2 border-t mt-3">
                <div className="flex items-start gap-2">
                  {option.email_sent ? (
                    <MailCheck className="w-4 h-4 text-green-600 mt-0.5" />
                  ) : (
                    <Mail className="w-4 h-4 text-blue-600 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <p className="text-xs font-medium text-slate-700">Notification email</p>
                    <p className="text-xs text-slate-600">À: {option.notification_recipient}</p>
                    {option.email_scheduled_at && !option.email_sent && (
                      <p className="text-xs text-blue-600 mt-1">
                        Prévu: {new Date(option.email_scheduled_at).toLocaleDateString('fr-FR')} à {new Date(option.email_scheduled_at).toLocaleTimeString('fr-FR', {hour: '2-digit', minute: '2-digit'})}
                      </p>
                    )}
                    {option.email_sent && option.email_sent_at && (
                      <p className="text-xs text-green-600 mt-1">
                        Envoyé: {new Date(option.email_sent_at).toLocaleDateString('fr-FR')} à {new Date(option.email_sent_at).toLocaleTimeString('fr-FR', {hour: '2-digit', minute: '2-digit'})}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
            {option && option.notes && (
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
            <TabsTrigger value="sous_option">Sous option ({filterLots(lotsSousOption).length})</TabsTrigger>
            <TabsTrigger value="reserve">Réservé ({filterLots(lotsReserve).length})</TabsTrigger>
            <TabsTrigger value="allotement">Allotement ({filterLots(lotsAllotement).length})</TabsTrigger>
            <TabsTrigger value="compromis">Compromis ({filterLots(lotsCompromis).length})</TabsTrigger>
            <TabsTrigger value="vendu">Vendu ({filterLots(lotsVendu).length})</TabsTrigger>
          </TabsList>

          <TabsContent value="sous_option" className="mt-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filterLots(lotsSousOption).length === 0 ? (
                <p className="text-slate-400 col-span-full text-center py-12">Aucun lot sous option</p>
              ) : (
                filterLots(lotsSousOption).map(renderLotCard)
              )}
            </div>
          </TabsContent>

          <TabsContent value="reserve" className="mt-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filterLots(lotsReserve).length === 0 ? (
                <p className="text-slate-400 col-span-full text-center py-12">Aucun lot réservé</p>
              ) : (
                filterLots(lotsReserve).map(renderLotCard)
              )}
            </div>
          </TabsContent>

          <TabsContent value="allotement" className="mt-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filterLots(lotsAllotement).length === 0 ? (
                <p className="text-slate-400 col-span-full text-center py-12">Aucun lot en allotement</p>
              ) : (
                filterLots(lotsAllotement).map(renderLotCard)
              )}
            </div>
          </TabsContent>

          <TabsContent value="compromis" className="mt-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filterLots(lotsCompromis).length === 0 ? (
                <p className="text-slate-400 col-span-full text-center py-12">Aucun lot en compromis</p>
              ) : (
                filterLots(lotsCompromis).map(renderLotCard)
              )}
            </div>
          </TabsContent>

          <TabsContent value="vendu" className="mt-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filterLots(lotsVendu).length === 0 ? (
                <p className="text-slate-400 col-span-full text-center py-12">Aucun lot vendu</p>
              ) : (
                filterLots(lotsVendu).map(renderLotCard)
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}