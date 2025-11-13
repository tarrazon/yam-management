import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { TrendingUp } from "lucide-react";

export default function SalesChartCRM({ lots }) {
  const getMonthlyData = () => {
    const monthlyStats = {};
    
    // Utiliser les lots vendus avec leur date de signature
    lots.filter(lot => lot.statut === 'vendu' || lot.date_signature_acte || lot.date_signature_compromis).forEach(lot => {
      const date = lot.date_signature_acte || lot.date_signature_compromis || lot.updated_at;
      if (date) {
        const month = new Date(date).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' });
        if (!monthlyStats[month]) {
          monthlyStats[month] = { compromis: 0, vendus: 0 };
        }
        if (lot.statut === 'vendu') {
          monthlyStats[month].vendus += 1;
        } else if (lot.statut === 'compromis') {
          monthlyStats[month].compromis += 1;
        }
      }
    });

    // Inclure aussi les lots en cours (compromis, réservés)
    lots.filter(lot => ['compromis', 'reserve'].includes(lot.statut)).forEach(lot => {
      const date = lot.date_signature_compromis || lot.updated_at;
      if (date) {
        const month = new Date(date).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' });
        if (!monthlyStats[month]) {
          monthlyStats[month] = { compromis: 0, vendus: 0 };
        }
        monthlyStats[month].compromis += 1;
      }
    });

    return Object.entries(monthlyStats)
      .map(([month, data]) => ({
        mois: month,
        compromis: data.compromis,
        vendus: data.vendus,
      }))
      .sort((a, b) => {
        const dateA = new Date(a.mois);
        const dateB = new Date(b.mois);
        return dateA - dateB;
      })
      .slice(-6);
  };

  const data = getMonthlyData();

  return (
    <Card className="border-none shadow-lg bg-white">
      <CardHeader className="border-b border-slate-100">
        <CardTitle className="text-xl font-bold text-[#1E40AF] flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-[#F59E0B]" />
          Évolution des ventes
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        {data.length === 0 ? (
          <div className="flex items-center justify-center h-64 text-slate-400">
            Pas encore de données
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis 
                dataKey="mois" 
                tick={{ fill: '#64748B', fontSize: 12 }}
                stroke="#CBD5E1"
              />
              <YAxis 
                tick={{ fill: '#64748B', fontSize: 12 }}
                stroke="#CBD5E1"
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#FFF',
                  border: 'none',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Legend />
              <Bar dataKey="compromis" fill="#F59E0B" radius={[8, 8, 0, 0]} name="Compromis" />
              <Bar dataKey="vendus" fill="#10B981" radius={[8, 8, 0, 0]} name="Vendus" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}