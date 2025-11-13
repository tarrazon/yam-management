import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ClientCard from "../components/clients/ClientCard";
import ClientForm from "../components/clients/ClientForm";
import { motion, AnimatePresence } from "framer-motion";

export default function Clients() {
  const [showForm, setShowForm] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [filter, setFilter] = useState("all");
  const queryClient = useQueryClient();

  const { data: clients = [], isLoading } = useQuery({
    queryKey: ['clients'],
    queryFn: () => base44.entities.Client.list('-created_at'),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Client.create(data),
    onSuccess: () => {
      queryClient.refetchQueries({ queryKey: ['clients'] });
      setShowForm(false);
      setEditingClient(null);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Client.update(id, data),
    onSuccess: () => {
      queryClient.refetchQueries({ queryKey: ['clients'] });
      setShowForm(false);
      setEditingClient(null);
    },
  });

  const handleSubmit = (data) => {
    if (editingClient) {
      updateMutation.mutate({ id: editingClient.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (client) => {
    setEditingClient(client);
    setShowForm(true);
  };

  const filteredClients = filter === "all" 
    ? clients 
    : clients.filter(client => client.type === filter);

  const stats = {
    prospect: clients.filter(c => c.type === 'prospect').length,
    acheteur: clients.filter(c => c.type === 'acheteur').length,
  };

  return (
    <div className="p-6 md:p-8 bg-[#FAFBFC] min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-[#0F172A] tracking-tight">Clients</h1>
            <p className="text-slate-500 mt-1">
              {stats.prospect} prospects · {stats.acheteur} acheteurs
            </p>
          </div>
          <Button
            onClick={() => setShowForm(!showForm)}
            className="bg-[#0F172A] hover:bg-[#1E293B] text-white shadow-lg"
          >
            <Plus className="w-5 h-5 mr-2" />
            Nouveau client
          </Button>
        </div>

        <div className="mb-6">
          <Tabs value={filter} onValueChange={setFilter}>
            <TabsList className="bg-white shadow-sm">
              <TabsTrigger value="all">Tous ({clients.length})</TabsTrigger>
              <TabsTrigger value="prospect">Prospects ({stats.prospect})</TabsTrigger>
              <TabsTrigger value="acheteur">Acheteurs ({stats.acheteur})</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <AnimatePresence>
          {showForm && (
            <ClientForm
              client={editingClient}
              onSubmit={handleSubmit}
              onCancel={() => {
                setShowForm(false);
                setEditingClient(null);
              }}
              isLoading={createMutation.isPending || updateMutation.isPending}
            />
          )}
        </AnimatePresence>

        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 bg-white rounded-xl animate-pulse" />
            ))}
          </div>
        ) : filteredClients.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-slate-400 text-lg">
              {filter === "all" ? "Aucun client pour le moment" : `Aucun ${filter}`}
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {filteredClients.map((client) => (
                <ClientCard
                  key={client.id}
                  client={client}
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