
import React, { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { User, Edit, Mail, Phone, Euro, TrendingUp, Eye, FileCheck, Trash2, Users, MessageSquare } from "lucide-react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import EspaceClientModal from "./EspaceClientModal";

const statusColors = {
  prospect: "bg-blue-100 text-blue-800 border-blue-200",
  qualifie: "bg-green-100 text-green-800 border-green-200",
  en_negociation: "bg-yellow-100 text-yellow-800 border-yellow-200",
  compromis: "bg-orange-100 text-orange-800 border-orange-200",
  acheteur: "bg-purple-100 text-purple-800 border-purple-200",
  perdu: "bg-red-100 text-red-800 border-red-200",
};

const statusLabels = {
  prospect: "Prospect",
  qualifie: "Qualifié",
  en_negociation: "En négociation",
  compromis: "Compromis",
  acheteur: "Acheteur",
  perdu: "Perdu",
};

const accordBancaireColors = {
  non: "bg-slate-100 text-slate-700",
  en_cours: "bg-yellow-100 text-yellow-800",
  obtenu: "bg-green-100 text-green-800",
};

const accordBancaireLabels = {
  non: "Non",
  en_cours: "En cours",
  obtenu: "Obtenu",
};

export default function AcquereurCard({ acquereur, onEdit, onView, onDelete }) {
  const [showEspaceClient, setShowEspaceClient] = useState(false);
  const documents = acquereur.documents || {};
  const documentsCount = Object.values(documents).filter(doc => doc && doc !== "").length;
  const totalDocuments = 5;

  // Récupérer le partenaire associé
  const { data: partenaire } = useQuery({
    queryKey: ['partenaire', acquereur.partenaire_id],
    queryFn: () => base44.entities.Partenaire.findOne(acquereur.partenaire_id),
    enabled: !!acquereur.partenaire_id,
  });

  // Compter les messages non lus
  const { data: unreadCount = 0 } = useQuery({
    queryKey: ['unread-messages', acquereur.id],
    queryFn: async () => {
      const { supabase } = await import('@/lib/supabase');
      const { count, error } = await supabase
        .from('messages_admin')
        .select('*', { count: 'exact', head: true })
        .eq('acquereur_id', acquereur.id)
        .eq('expediteur_type', 'acquereur')
        .eq('lu', false);

      if (error) throw error;
      return count || 0;
    },
    enabled: !!acquereur.id,
  });

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="border-none shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden bg-white">
        <CardHeader className="border-b border-slate-100 pb-4">
          <div className="flex justify-between items-start">
            <div className="flex items-start gap-3 flex-1">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#1E40AF] to-[#1E3A8A] flex items-center justify-center flex-shrink-0">
                <User className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-bold text-[#1E40AF] truncate">
                  {acquereur.prenom} {acquereur.nom}
                </h3>
                <Badge className={`${statusColors[acquereur.statut_commercial]} border mt-1`}>
                  {statusLabels[acquereur.statut_commercial]}
                </Badge>
              </div>
            </div>
            <div className="flex gap-1 flex-shrink-0">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onView(acquereur)}
                className="hover:bg-slate-100"
                title="Voir la fiche"
              >
                <Eye className="w-4 h-4 text-slate-500" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onEdit(acquereur)}
                className="hover:bg-slate-100"
                title="Modifier"
              >
                <Edit className="w-4 h-4 text-slate-500" />
              </Button>
              {onDelete && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDelete(acquereur)}
                  className="hover:bg-red-50"
                  title="Supprimer"
                >
                  <Trash2 className="w-4 h-4 text-red-500" />
                </Button>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6 space-y-3">
          {acquereur.email && (
            <div className="flex items-center gap-3 text-sm">
              <Mail className="w-4 h-4 text-slate-400 flex-shrink-0" />
              <a 
                href={`mailto:${acquereur.email}`}
                className="text-slate-600 hover:text-[#1E40AF] truncate"
              >
                {acquereur.email}
              </a>
            </div>
          )}

          {acquereur.telephone && (
            <div className="flex items-center gap-3 text-sm">
              <Phone className="w-4 h-4 text-slate-400 flex-shrink-0" />
              <a
                href={`tel:${acquereur.telephone}`}
                className="text-slate-600 hover:text-[#1E40AF]"
              >
                {acquereur.telephone}
              </a>
            </div>
          )}

          {unreadCount > 0 && (
            <div className="flex items-center justify-center gap-2 py-2 px-3 bg-red-50 border border-red-200 rounded-md mb-2">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                <span className="text-xs font-semibold text-red-700">
                  {unreadCount} message{unreadCount > 1 ? 's' : ''} non lu{unreadCount > 1 ? 's' : ''}
                </span>
              </div>
            </div>
          )}

          <Button
            size="sm"
            onClick={() => setShowEspaceClient(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white w-full mt-1 relative"
          >
            <MessageSquare className="w-4 h-4 mr-2" />
            Espace Client
            {unreadCount > 0 && (
              <Badge className="absolute -top-2 -right-2 bg-red-500 text-white border-2 border-white h-6 w-6 p-0 flex items-center justify-center rounded-full text-xs">
                {unreadCount}
              </Badge>
            )}
          </Button>

          {(acquereur.budget_min || acquereur.budget_max || acquereur.budget) && (
            <div className="pt-3 border-t border-slate-100">
              <div className="flex items-center gap-2 mb-2">
                <Euro className="w-4 h-4 text-[#F59E0B]" />
                <span className="text-sm font-semibold text-slate-700">Budget</span>
              </div>
              {acquereur.budget_min || acquereur.budget_max ? (
                <p className="text-lg font-bold text-[#1E40AF]">
                  {acquereur.budget_min ? acquereur.budget_min.toLocaleString('fr-FR') : '...'} - {acquereur.budget_max ? acquereur.budget_max.toLocaleString('fr-FR') : '...'} €
                </p>
              ) : (
                <p className="text-2xl font-bold text-[#1E40AF]">
                  {acquereur.budget.toLocaleString('fr-FR')} €
                </p>
              )}
            </div>
          )}

          {partenaire && (
            <div className="pt-3 border-t border-slate-100">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-4 h-4 text-[#F59E0B]" />
                <span className="text-sm font-semibold text-slate-700">Partenaire</span>
              </div>
              <p className="text-sm text-slate-600">{partenaire.nom || partenaire.nom_societe}</p>
            </div>
          )}

          {acquereur.accord_bancaire && (
            <div className="pt-3 border-t border-slate-100">
              <p className="text-xs text-slate-500 mb-2">Accord bancaire</p>
              <Badge className={accordBancaireColors[acquereur.accord_bancaire]}>
                {accordBancaireLabels[acquereur.accord_bancaire]}
              </Badge>
            </div>
          )}

          <div className="pt-3 border-t border-slate-100">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-[#F59E0B]" />
                <span className="text-sm font-semibold text-slate-700">Documents</span>
              </div>
              <span className="text-xs font-medium text-slate-600">
                {documentsCount} / {totalDocuments}
              </span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2">
              <div 
                className="bg-[#F59E0B] h-2 rounded-full transition-all" 
                style={{ width: `${(documentsCount / totalDocuments) * 100}%` }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <EspaceClientModal
        acquereur={acquereur}
        isOpen={showEspaceClient}
        onClose={() => setShowEspaceClient(false)}
      />
    </motion.div>
  );
}
