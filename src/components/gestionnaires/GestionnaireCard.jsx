import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Building2, Mail, Phone, MapPin, Edit, Trash2, Home } from "lucide-react";

export default function GestionnaireCard({ gestionnaire, onEdit, onDelete, residences = [] }) {
  return (
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-3 flex-1">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Building2 className="w-6 h-6 text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-bold text-[#1E40AF] truncate">
                {gestionnaire.nom_societe}
              </h3>
              {gestionnaire.contact_principal && (
                <p className="text-sm text-slate-600 mt-1">
                  Contact: {gestionnaire.contact_principal}
                </p>
              )}
            </div>
          </div>
          <div className="flex gap-1 flex-shrink-0 ml-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onEdit(gestionnaire)}
              className="hover:bg-blue-100 hover:text-blue-700"
            >
              <Edit className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(gestionnaire)}
              className="hover:bg-red-100 hover:text-red-700"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="space-y-2 mb-4">
          {gestionnaire.email && (
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Mail className="w-4 h-4 text-slate-400" />
              <a
                href={`mailto:${gestionnaire.email}`}
                className="hover:text-blue-600 transition-colors"
              >
                {gestionnaire.email}
              </a>
            </div>
          )}

          {gestionnaire.telephone && (
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Phone className="w-4 h-4 text-slate-400" />
              <a
                href={`tel:${gestionnaire.telephone}`}
                className="hover:text-blue-600 transition-colors"
              >
                {gestionnaire.telephone}
              </a>
            </div>
          )}

          {gestionnaire.adresse && (
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <MapPin className="w-4 h-4 text-slate-400" />
              <span className="truncate">{gestionnaire.adresse}</span>
            </div>
          )}
        </div>

        {residences.length > 0 && (
          <div className="pt-4 border-t border-slate-200">
            <div className="flex items-center gap-2 mb-2">
              <Home className="w-4 h-4 text-slate-400" />
              <span className="text-sm font-medium text-slate-700">
                Résidences gérées ({residences.length})
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {residences.map((residence) => (
                <Badge
                  key={residence.id}
                  variant="secondary"
                  className="text-xs"
                >
                  {residence.nom}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
