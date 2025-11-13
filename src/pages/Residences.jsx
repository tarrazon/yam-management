import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import ResidenceCard from "../components/residences/ResidenceCard";
import ResidenceForm from "../components/residences/ResidenceForm";
import { motion, AnimatePresence } from "framer-motion";

export default function Residences() {
  const [showForm, setShowForm] = useState(false);
  const [editingResidence, setEditingResidence] = useState(null);
  const queryClient = useQueryClient();

  const { data: residences = [], isLoading } = useQuery({
    queryKey: ['residences'],
    queryFn: () => base44.entities.Residence.list('-created_at'),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Residence.create(data),
    onSuccess: () => {
      queryClient.refetchQueries({ queryKey: ['residences'] });
      setShowForm(false);
      setEditingResidence(null);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Residence.update(id, data),
    onSuccess: () => {
      queryClient.refetchQueries({ queryKey: ['residences'] });
      setShowForm(false);
      setEditingResidence(null);
    },
  });

  const handleSubmit = (data) => {
    if (editingResidence) {
      updateMutation.mutate({ id: editingResidence.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (residence) => {
    setEditingResidence(residence);
    setShowForm(true);
  };

  return (
    <div className="p-6 md:p-8 bg-[#FAFBFC] min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[#0F172A] tracking-tight">Résidences</h1>
            <p className="text-slate-500 mt-1">Gérez vos programmes immobiliers</p>
          </div>
          <Button
            onClick={() => setShowForm(!showForm)}
            className="bg-[#0F172A] hover:bg-[#1E293B] text-white shadow-lg"
          >
            <Plus className="w-5 h-5 mr-2" />
            Nouvelle résidence
          </Button>
        </div>

        <AnimatePresence>
          {showForm && (
            <ResidenceForm
              residence={editingResidence}
              onSubmit={handleSubmit}
              onCancel={() => {
                setShowForm(false);
                setEditingResidence(null);
              }}
              isLoading={createMutation.isPending || updateMutation.isPending}
            />
          )}
        </AnimatePresence>

        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-96 bg-white rounded-xl animate-pulse" />
            ))}
          </div>
        ) : residences.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-slate-400 text-lg">Aucune résidence pour le moment</p>
            <p className="text-slate-400 text-sm mt-2">Créez votre première résidence</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {residences.map((residence) => (
                <ResidenceCard
                  key={residence.id}
                  residence={residence}
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