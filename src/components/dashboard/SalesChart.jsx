import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { TrendingUp } from "lucide-react";

export default function SalesChart({ reservations }) {
  const getMonthlyData = () => {
    const monthlyStats = {};
    
    reservations.forEach(res => {
      if (res.statut === 'vendu' && res.date_reservation) {
        const month = new Date(res.date_reservation).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' });
        if (!monthlyStats[month]) {
          monthlyStats[month] = 0;
        }
        monthlyStats[month] += res.montant || 0;
      }
    });

    return Object.entries(monthlyStats)
      .map(([month, total]) => ({
        mois: month,
        ventes: total / 1000
      }))
      .slice(-6);
  };

  const data = getMonthlyData();

  return (
    <Card className="border-none shadow-lg bg-white">
      <CardHeader className="border-b border-slate-100">
        <CardTitle className="text-xl font-bold text-[#0F172A] flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-[#D4AF37]" />
          Évolution des ventes
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        {data.length === 0 ? (
          <div className="flex items-center justify-center h-64 text-slate-400">
            Pas encore de données de vente
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
                label={{ value: 'k€', angle: -90, position: 'insideLeft', fill: '#64748B' }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#FFF',
                  border: 'none',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
                formatter={(value) => [`${value.toFixed(0)}k€`, 'Ventes']}
              />
              <Bar dataKey="ventes" fill="#D4AF37" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}