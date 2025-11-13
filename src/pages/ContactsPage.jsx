
import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, X } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ContactResidenceCard from "../components/contacts-residence/ContactResidenceCard";
import ContactResidenceForm from "../components/contacts-residence/ContactResidenceForm";
import DeleteConfirmDialog from "../components/common/DeleteConfirmDialog";
import { motion, AnimatePresence } from "framer-motion";

export default function ContactsPage() {
  const [showForm, setShowForm] = useState(false);
  const [editingContact, setEditingContact] = useState(null);
  const [deletingContact, setDeletingContact] = useState(null);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState(null); // Added error state
  const queryClient = useQueryClient();

  const { data: contacts = [], isLoading } = useQuery({
    queryKey: ['contacts_residence'],
    queryFn: () => base44.entities.ContactResidence.list('-created_date'),
  });

  const { data: residences = [] } = useQuery({
    queryKey: ['residences_gestion'],
    queryFn: () => base44.entities.ResidenceGestion.list(),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.ContactResidence.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts_residence'] });
      setShowForm(false);
      setEditingContact(null);
      setError(null); // Clear error on success
    },
    onError: (error) => {
      console.error("Error creating contact:", error);
      setError(error.message || "Une erreur est survenue lors de la création du contact");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.ContactResidence.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts_residence'] });
      setShowForm(false);
      setEditingContact(null);
      setError(null); // Clear error on success
    },
    onError: (error) => {
      console.error("Error updating contact:", error);
      setError(error.message || "Une erreur est survenue lors de la modification du contact");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.ContactResidence.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts_residence'] });
      setDeletingContact(null);
      setError(null); // Clear error on success
    },
    onError: (error) => {
      console.error("Error deleting contact:", error);
      setError(error.message || "Une erreur est survenue lors de la suppression du contact");
    },
  });

  const handleSubmit = (data) => {
    const residence = residences.find(r => r.id === data.residence_id);
    const enrichedData = {
      ...data,
      residence_nom: residence?.nom || "",
    };

    if (editingContact) {
      updateMutation.mutate({ id: editingContact.id, data: enrichedData });
    } else {
      createMutation.mutate(enrichedData);
    }
  };

  const handleEdit = (contact) => {
    setEditingContact(contact);
    setShowForm(true);
  };

  const handleDelete = (contact) => {
    setDeletingContact(contact);
  };

  const filteredContacts = contacts
    .filter(c => filter === "all" || c.type_contact === filter)
    .filter(c =>
      !searchTerm ||
      c.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.residence_nom?.toLowerCase().includes(searchTerm.toLowerCase())
    );

  const stats = {
    gestionnaire_site: contacts.filter(c => c.type_contact === 'gestionnaire_site').length,
    syndic: contacts.filter(c => c.type_contact === 'syndic').length,
    association_copro: contacts.filter(c => c.type_contact === 'association_copro').length,
    mairie: contacts.filter(c => c.type_contact === 'mairie').length,
  };

  return (
    <div className="p-6 md:p-8 bg-[#F9FAFB] min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-[#1E40AF] tracking-tight">Contacts Résidences</h1>
            <p className="text-slate-500 mt-1">
              {stats.gestionnaire_site} gestionnaires · {stats.syndic} syndics · {stats.mairie} mairies
            </p>
          </div>
          <Button
            onClick={() => setShowForm(!showForm)}
            className="bg-[#1E40AF] hover:bg-[#1E3A8A] text-white shadow-lg"
          >
            <Plus className="w-5 h-5 mr-2" />
            Nouveau contact
          </Button>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-lg">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <X className="w-5 h-5 text-red-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-red-800 mb-1">Erreur</h3>
                <p className="text-sm text-red-700">{error}</p>
              </div>
              <button
                onClick={() => setError(null)}
                className="text-red-400 hover:text-red-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
            <Input
              placeholder="Rechercher un contact..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Tabs value={filter} onValueChange={setFilter}>
            <TabsList className="bg-white shadow-sm">
              <TabsTrigger value="all">Tous ({contacts.length})</TabsTrigger>
              <TabsTrigger value="gestionnaire_site">Gestionnaires ({stats.gestionnaire_site})</TabsTrigger>
              <TabsTrigger value="syndic">Syndics ({stats.syndic})</TabsTrigger>
              <TabsTrigger value="mairie">Mairies ({stats.mairie})</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <AnimatePresence>
          {showForm && (
            <ContactResidenceForm
              contact={editingContact}
              residences={residences}
              onSubmit={handleSubmit}
              onCancel={() => {
                setShowForm(false);
                setEditingContact(null);
                setError(null); // Clear error on form cancel
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
        ) : filteredContacts.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-slate-400 text-lg">
              {searchTerm ? "Aucun contact trouvé" : "Aucun contact pour le moment"}
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {filteredContacts.map((contact) => (
                <ContactResidenceCard
                  key={contact.id}
                  contact={contact}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))}
            </AnimatePresence>
          </div>
        )}

        <DeleteConfirmDialog
          open={!!deletingContact}
          onOpenChange={() => {
            setDeletingContact(null);
            setError(null); // Clear error on dialog close
          }}
          onConfirm={() => deletingContact && deleteMutation.mutate(deletingContact.id)}
          title="Supprimer ce contact ?"
          description="Cette action supprimera définitivement le contact de la base de données."
          itemName={deletingContact ? `${deletingContact.nom} - ${deletingContact.residence_nom}` : ""}
          warningMessage="Cette action est irréversible."
          isDeleting={deleteMutation.isPending}
        />
      </div>
    </div>
  );
}
