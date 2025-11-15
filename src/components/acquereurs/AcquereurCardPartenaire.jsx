import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Mail, Phone, User, Euro, Eye, Edit, AlertCircle, Users } from "lucide-react";
import { useDocumentsManquants } from "@/hooks/useDocumentsManquants";

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

export default function AcquereurCardPartenaire({ acquereur, lot, onView, onEdit }) {
  const { documentsManquantsAcquereur } = useDocumentsManquants(lot || {});

  return (
    <Card className="border-none shadow-lg hover:shadow-xl transition-shadow">
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

        {lot && documentsManquantsAcquereur.length > 0 && (
          <div className="pt-3 border-t">
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-xs text-blue-700 font-bold flex items-center gap-2">
                <Users className="w-4 h-4" />
                {documentsManquantsAcquereur.length} document{documentsManquantsAcquereur.length > 1 ? 's' : ''} manquant{documentsManquantsAcquereur.length > 1 ? 's' : ''}
              </p>
              <p className="text-xs text-blue-600 mt-1">
                Cliquez pour voir le détail
              </p>
            </div>
          </div>
        )}

        <div className="pt-3 border-t flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 gap-2"
            onClick={() => onView(acquereur)}
          >
            <Eye className="w-4 h-4" />
            Voir
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1 gap-2"
            onClick={() => onEdit(acquereur)}
          >
            <Edit className="w-4 h-4" />
            Modifier
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
