import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import LotCard from "../components/lots/LotCard";
import LotForm from "../components/lots/LotForm";
import { motion, AnimatePresence } from "framer-motion";

export default function Lots() {
  const [showForm, setShowForm] = useState(false);
  const [editingLot, setEditingLot] = useState(null);
  const [filter, setFilter] = useState("all");
  const queryClient = useQueryClient();

  const { data: lots = [], isLoading } = useQuery({
    queryKey: ['lots'],
    queryFn: () => base44.entities.Lot.list('-created_at'),
  });

  const { data: residences = [] } = useQuery({
    queryKey: ['residences'],
    queryFn: () => base44.entities.Residence.list(),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Lot.create(data),
    onSuccess: () => {
      queryClient.refetchQueries({ queryKey: ['lots'] });
      setShowForm(false);
      setEditingLot(null);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Lot.update(id, data),
    onSuccess: () => {
      queryClient.refetchQueries({ queryKey: ['lots'] });
      setShowForm(false);
      setEditingLot(null);
    },
  });

  const handleSubmit = (data) => {
    const residence = residences.find(r => r.id === data.residence_id);
    const enrichedData = {
      ...data,
      residence_nom: residence?.nom || ""
    };

    if (editingLot) {
      updateMutation.mutate({ id: editingLot.id, data: enrichedData });
    } else {
      createMutation.mutate(enrichedData);
    }
  };

  const handleEdit = (lot) => {
    setEditingLot(lot);
    setShowForm(true);
  };

  const filteredLots = filter === "all" 
    ? lots 
    : lots.filter(lot => lot.statut === filter);

  const stats = {
    disponible: lots.filter(l => l.statut === 'disponible').length,
    reserve: lots.filter(l => l.statut === 'reserve').length,
    vendu: lots.filter(l => l.statut === 'vendu').length,
  };

  return (
    <div className="p-6 md:p-8 bg-[#FAFBFC] min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-[#0F172A] tracking-tight">Lots</h1>
            <p className="text-slate-500 mt-1">
              {stats.disponible} disponibles · {stats.reserve} réservés · {stats.vendu} vendus
            </p>
          </div>
          <Button
            onClick={() => setShowForm(!showForm)}
            className="bg-[#0F172A] hover:bg-[#1E293B] text-white shadow-lg"
          >
            <Plus className="w-5 h-5 mr-2" />
            Nouveau lot
          </Button>
        </div>

        <div className="mb-6">
          <Tabs value={filter} onValueChange={setFilter}>
            <TabsList className="bg-white shadow-sm">
              <TabsTrigger value="all">Tous ({lots.length})</TabsTrigger>
              <TabsTrigger value="disponible">Disponibles ({stats.disponible})</TabsTrigger>
              <TabsTrigger value="reserve">Réservés ({stats.reserve})</TabsTrigger>
              <TabsTrigger value="vendu">Vendus ({stats.vendu})</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <AnimatePresence>
          {showForm && (
            <LotForm
              lot={editingLot}
              residences={residences}
              onSubmit={handleSubmit}
              onCancel={() => {
                setShowForm(false);
                setEditingLot(null);
              }}
              isLoading={createMutation.isPending || updateMutation.isPending}
            />
          )}
        </AnimatePresence>

        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-80 bg-white rounded-xl animate-pulse" />
            ))}
          </div>
        ) : filteredLots.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-slate-400 text-lg">
              {filter === "all" ? "Aucun lot pour le moment" : `Aucun lot ${filter}`}
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {filteredLots.map((lot) => (
                <LotCard
                  key={lot.id}
                  lot={lot}
                  onEdit={handleEdit}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}