import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Home, Users, FileCheck, Clock, AlertCircle, Download, Euro, TrendingUp, Building2, Mail, Briefcase } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function PartenairesDashboard() {
  const [currentUser, setCurrentUser] = useState(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    base44.auth.me().then(setCurrentUser);
  }, []);

  const { data: lots = [] } = useQuery({
    queryKey: ['lots_partenaire'],
    queryFn: () => base44.entities.LotLMNP.list(),
  });

  const { data: mesOptions = [] } = useQuery({
    queryKey: ['mes_options'],
    queryFn: () => base44.entities.OptionLot.filter({ partenaire_id: currentUser?.partenaire_id }),
    enabled: !!currentUser?.partenaire_id,
  });

  const { data: mesAcquereurs = [] } = useQuery({
    queryKey: ['mes_acquereurs'],
    queryFn: () => base44.entities.Acquereur.filter({ partenaire_id: currentUser?.partenaire_id }),
    enabled: !!currentUser?.partenaire_id,
  });

  const { data: partenaire } = useQuery({
    queryKey: ['mon_partenaire_data', currentUser?.partenaire_id],
    queryFn: () => base44.entities.Partenaire.filter({ id: currentUser?.partenaire_id }).then(res => res[0]),
    enabled: !!currentUser?.partenaire_id,
  });

  // Vérifier les options expirées et mettre à jour
  useEffect(() => {
    if (mesOptions.length > 0) {
      const now = new Date();
      mesOptions.forEach(option => {
        if (option.statut === 'active' && new Date(option.date_fin) < now) {
          // Marquer l'option comme expirée
          base44.entities.OptionLot.update(option.id, { statut: 'expiree' });
          // Remettre le lot en disponible
          base44.entities.LotLMNP.update(option.lot_id, { statut: 'disponible' });
        }
      });
    }
  }, [mesOptions]);

  const optionsActives = mesOptions.filter(o => o.statut === 'active');
  const optionsMax = currentUser?.options_max || 3;
  const optionsRestantes = optionsMax - optionsActives.length;

  const lotsDisponibles = lots.filter(l => l.statut === 'disponible').length;
  const lotsAvecOption = lots.filter(l => 
    mesOptions.some(o => o.lot_id === l.id && o.statut === 'active')
  ).length;

  // Calcul du CA et commissions
  const mesLotsVendus = lots.filter(l => 
    l.statut === 'vendu' && l.partenaire_id === currentUser?.partenaire_id
  );
  
  const chiffreAffaires = mesLotsVendus.reduce((total, lot) => {
    return total + (lot.prix_fai || 0);
  }, 0);

  const tauxRetrocession = partenaire?.taux_retrocession || 0;
  
  const commissionsTotal = mesLotsVendus.reduce((total, lot) => {
    const commission = lot.commission_partenaire || (lot.honoraires ? (lot.honoraires * tauxRetrocession / 100) : 0);
    return total + commission;
  }, 0);

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

  return (
    <div className="p-6 md:p-8 bg-[#F9FAFB] min-h-screen">
      <div className="max-w-7xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-[#1E40AF]">Mon Espace Partenaire</h1>
          <p className="text-slate-500 mt-1">Bienvenue {currentUser?.full_name}</p>
        </div>

        {/* Informations du partenaire */}
        {partenaire && (
          <Card className="border-l-4 border-l-[#F59E0B] shadow-lg bg-gradient-to-r from-white to-amber-50">
            <CardContent className="p-6">
              <div className="flex items-start gap-6">
                <div className="p-4 rounded-xl bg-[#F59E0B]/10">
                  <Building2 className="w-8 h-8 text-[#F59E0B]" />
                </div>
                <div className="flex-1 grid md:grid-cols-3 gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Building2 className="w-4 h-4 text-[#1E40AF]" />
                      <p className="text-xs font-semibold text-slate-500 uppercase">Partenaire</p>
                    </div>
                    <p className="text-lg font-bold text-[#1E40AF]">{partenaire.nom}</p>
                  </div>
                  
                  {partenaire.contact_principal && (
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Users className="w-4 h-4 text-[#1E40AF]" />
                        <p className="text-xs font-semibold text-slate-500 uppercase">Contact principal</p>
                      </div>
                      <p className="text-lg font-bold text-slate-700">{partenaire.contact_principal}</p>
                    </div>
                  )}
                  
                  {partenaire.type_partenaire && (
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Briefcase className="w-4 h-4 text-[#1E40AF]" />
                        <p className="text-xs font-semibold text-slate-500 uppercase">Type</p>
                      </div>
                      <Badge className="bg-indigo-100 text-indigo-800 text-sm">
                        {partenaire.type_partenaire.toUpperCase()}
                      </Badge>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Statistiques */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="border-none shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-blue-50">
                  <Home className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">Lots disponibles</p>
                  <p className="text-2xl font-bold text-[#1E40AF]">{lotsDisponibles}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-amber-50">
                  <Clock className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">Mes options actives</p>
                  <p className="text-2xl font-bold text-[#1E40AF]">{optionsActives.length}</p>
                  <p className="text-xs text-slate-400">{optionsRestantes} restantes</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-purple-50">
                  <Users className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">Mes acquéreurs</p>
                  <p className="text-2xl font-bold text-[#1E40AF]">{mesAcquereurs.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Statistiques financières */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="border-none shadow-lg bg-gradient-to-br from-green-50 to-emerald-50">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-white/80 shadow-sm">
                  <FileCheck className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-green-700 font-medium">Lots vendus</p>
                  <p className="text-3xl font-bold text-green-800">{mesLotsVendus.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg bg-gradient-to-br from-blue-50 to-indigo-50">
            <CardContent className="p-6">
              <div>
                <p className="text-sm text-blue-700 font-medium mb-2">Chiffre d'affaires généré</p>
                <p className="text-2xl font-bold text-blue-800">
                  {chiffreAffaires.toLocaleString('fr-FR')} €
                </p>
                <p className="text-xs text-blue-600 mt-1">Total des ventes réalisées</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg bg-gradient-to-br from-amber-50 to-orange-50">
            <CardContent className="p-6">
              <div>
                <p className="text-sm text-amber-700 font-medium mb-2">Mes commissions</p>
                <p className="text-2xl font-bold text-amber-800">
                  {commissionsTotal.toLocaleString('fr-FR', {minimumFractionDigits: 2, maximumFractionDigits: 2})} €
                </p>
                <p className="text-xs text-amber-600 mt-1">
                  Taux de rétrocession: {tauxRetrocession}%
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Alerte si limite d'options atteinte */}
        {optionsRestantes === 0 && (
          <Card className="border-amber-200 bg-amber-50">
            <CardContent className="p-4 flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600" />
              <p className="text-sm text-amber-800">
                Vous avez atteint votre limite d'options simultanées ({optionsMax}). 
                Attendez qu'une option expire ou soit convertie pour en poser une nouvelle.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Mes options actives */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-[#F59E0B]" />
              Mes options actives
            </CardTitle>
          </CardHeader>
          <CardContent>
            {optionsActives.length === 0 ? (
              <p className="text-slate-400 text-center py-8">Aucune option active</p>
            ) : (
              <div className="space-y-3">
                {optionsActives.map(option => {
                  const lot = lots.find(l => l.id === option.lot_id);
                  const timeRemaining = getTimeRemaining(option.date_fin);
                  const isExpiringSoon = new Date(option.date_fin) - new Date() < 24 * 60 * 60 * 1000;
                  const isMyOption = option.user_email === currentUser?.email;
                  
                  return (
                    <div key={option.id} className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-[#1E40AF]">
                              Lot {option.lot_reference}
                            </p>
                            {!isMyOption && (
                              <Badge className="bg-blue-100 text-blue-800 text-xs">
                                {option.pose_par === 'admin' ? 'Par admin' : 'Autre partenaire'}
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-slate-600">
                            {lot?.residence_nom} - {lot?.typologie}
                          </p>
                          {option.acquereur_nom && (
                            <p className="text-sm text-slate-500 mt-1">
                              Acquéreur: {option.acquereur_nom}
                            </p>
                          )}
                          {option.pose_par_nom && (
                            <p className="text-xs text-slate-400 mt-1">
                              Posée par: {option.pose_par_nom}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <Badge className={isExpiringSoon ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"}>
                            <Clock className="w-3 h-3 mr-1" />
                            {timeRemaining}
                          </Badge>
                          <p className="text-xs text-slate-500 mt-1">
                            Expire le {new Date(option.date_fin).toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Actions rapides */}
        <div className="grid md:grid-cols-3 gap-6">
          <Link to={createPageUrl("LotsPartenaire")}>
            <Card className="border-none shadow-lg hover:shadow-xl transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center">
                <Home className="w-12 h-12 text-[#1E40AF] mx-auto mb-3" />
                <h3 className="font-semibold text-[#1E40AF]">Parcourir les lots</h3>
                <p className="text-sm text-slate-500 mt-2">Découvrez les lots disponibles</p>
              </CardContent>
            </Card>
          </Link>

          <Link to={createPageUrl("MesAcquereurs")}>
            <Card className="border-none shadow-lg hover:shadow-xl transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center">
                <Users className="w-12 h-12 text-[#1E40AF] mx-auto mb-3" />
                <h3 className="font-semibold text-[#1E40AF]">Mes acquéreurs</h3>
                <p className="text-sm text-slate-500 mt-2">Gérez vos contacts</p>
              </CardContent>
            </Card>
          </Link>

          <Link to={createPageUrl("SuiviOptions")}>
            <Card className="border-none shadow-lg hover:shadow-xl transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center">
                <FileCheck className="w-12 h-12 text-[#1E40AF] mx-auto mb-3" />
                <h3 className="font-semibold text-[#1E40AF]">Suivi des options</h3>
                <p className="text-sm text-slate-500 mt-2">Historique complet</p>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
}