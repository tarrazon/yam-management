import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ReservationCard from "../components/reservations/ReservationCard";
import ReservationForm from "../components/reservations/ReservationForm";
import { motion, AnimatePresence } from "framer-motion";

export default function Reservations() {
  const [showForm, setShowForm] = useState(false);
  const [editingReservation, setEditingReservation] = useState(null);
  const [filter, setFilter] = useState("all");
  const queryClient = useQueryClient();

  const { data: reservations = [], isLoading } = useQuery({
    queryKey: ['reservations'],
    queryFn: () => base44.entities.Reservation.list('-created_at'),
  });

  const { data: lots = [] } = useQuery({
    queryKey: ['lots'],
    queryFn: () => base44.entities.Lot.list(),
  });

  const { data: clients = [] } = useQuery({
    queryKey: ['clients'],
    queryFn: () => base44.entities.Client.list(),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Reservation.create(data),
    onSuccess: () => {
      queryClient.refetchQueries({ queryKey: ['reservations'] });
      setShowForm(false);
      setEditingReservation(null);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Reservation.update(id, data),
    onSuccess: () => {
      queryClient.refetchQueries({ queryKey: ['reservations'] });
      setShowForm(false);
      setEditingReservation(null);
    },
  });

  const handleSubmit = (data) => {
    const lot = lots.find(l => l.id === data.lot_id);
    const client = clients.find(c => c.id === data.client_id);
    
    const enrichedData = {
      ...data,
      lot_numero: lot?.numero_lot || "",
      residence_nom: lot?.residence_nom || "",
      client_nom: client ? `${client.prenom} ${client.nom}` : "",
    };

    if (editingReservation) {
      updateMutation.mutate({ id: editingReservation.id, data: enrichedData });
    } else {
      createMutation.mutate(enrichedData);
    }
  };

  const handleEdit = (reservation) => {
    setEditingReservation(reservation);
    setShowForm(true);
  };

  const filteredReservations = filter === "all" 
    ? reservations 
    : reservations.filter(res => res.statut === filter);

  const stats = {
    en_attente: reservations.filter(r => r.statut === 'en_attente').length,
    confirmee: reservations.filter(r => r.statut === 'confirmee').length,
    vendu: reservations.filter(r => r.statut === 'vendu').length,
    annulee: reservations.filter(r => r.statut === 'annulee').length,
  };

  return (
    <div className="p-6 md:p-8 bg-[#FAFBFC] min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-[#0F172A] tracking-tight">Réservations</h1>
            <p className="text-slate-500 mt-1">
              {stats.confirmee} confirmées · {stats.vendu} vendues · {stats.en_attente} en attente
            </p>
          </div>
          <Button
            onClick={() => setShowForm(!showForm)}
            className="bg-[#0F172A] hover:bg-[#1E293B] text-white shadow-lg"
          >
            <Plus className="w-5 h-5 mr-2" />
            Nouvelle réservation
          </Button>
        </div>

        <div className="mb-6">
          <Tabs value={filter} onValueChange={setFilter}>
            <TabsList className="bg-white shadow-sm">
              <TabsTrigger value="all">Toutes ({reservations.length})</TabsTrigger>
              <TabsTrigger value="en_attente">En attente ({stats.en_attente})</TabsTrigger>
              <TabsTrigger value="confirmee">Confirmées ({stats.confirmee})</TabsTrigger>
              <TabsTrigger value="vendu">Vendues ({stats.vendu})</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <AnimatePresence>
          {showForm && (
            <ReservationForm
              reservation={editingReservation}
              lots={lots}
              clients={clients}
              onSubmit={handleSubmit}
              onCancel={() => {
                setShowForm(false);
                setEditingReservation(null);
              }}
              isLoading={createMutation.isPending || updateMutation.isPending}
            />
          )}
        </AnimatePresence>

        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-72 bg-white rounded-xl animate-pulse" />
            ))}
          </div>
        ) : filteredReservations.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-slate-400 text-lg">
              {filter === "all" ? "Aucune réservation pour le moment" : `Aucune réservation ${filter}`}
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {filteredReservations.map((reservation) => (
                <ReservationCard
                  key={reservation.id}
                  reservation={reservation}
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