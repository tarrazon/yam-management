import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { User, Edit, Mail, Phone, Euro } from "lucide-react";
import { motion } from "framer-motion";

const typeColors = {
  prospect: "bg-blue-100 text-blue-800 border-blue-200",
  acheteur: "bg-green-100 text-green-800 border-green-200",
};

const typeLabels = {
  prospect: "Prospect",
  acheteur: "Acheteur",
};

export default function ClientCard({ client, onEdit }) {
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
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#D4AF37] to-[#B8941F] flex items-center justify-center flex-shrink-0">
                <User className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-bold text-[#0F172A] truncate">
                  {client.prenom} {client.nom}
                </h3>
                <Badge className={`${typeColors[client.type]} border mt-1`}>
                  {typeLabels[client.type]}
                </Badge>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onEdit(client)}
              className="hover:bg-slate-100 flex-shrink-0"
            >
              <Edit className="w-4 h-4 text-slate-500" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-6 space-y-3">
          {client.email && (
            <div className="flex items-center gap-3 text-sm">
              <Mail className="w-4 h-4 text-slate-400 flex-shrink-0" />
              <a 
                href={`mailto:${client.email}`}
                className="text-slate-600 hover:text-[#D4AF37] truncate"
              >
                {client.email}
              </a>
            </div>
          )}

          {client.telephone && (
            <div className="flex items-center gap-3 text-sm">
              <Phone className="w-4 h-4 text-slate-400 flex-shrink-0" />
              <a 
                href={`tel:${client.telephone}`}
                className="text-slate-600 hover:text-[#D4AF37]"
              >
                {client.telephone}
              </a>
            </div>
          )}

          {(client.budget_min || client.budget_max) && (
            <div className="pt-3 border-t border-slate-100">
              <div className="flex items-center gap-2 text-sm">
                <Euro className="w-4 h-4 text-[#D4AF37]" />
                <span className="font-semibold text-slate-700">
                  Budget: {client.budget_min ? `${(client.budget_min / 1000).toFixed(0)}k` : '?'} - {client.budget_max ? `${(client.budget_max / 1000).toFixed(0)}k€` : '?'}
                </span>
              </div>
            </div>
          )}

          {client.preferences && (
            <div className="pt-3 border-t border-slate-100">
              <p className="text-xs text-slate-500 line-clamp-2">
                {client.preferences}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}