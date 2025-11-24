
import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { supabase } from "@/lib/supabase";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Shield, UserCheck, Search, Edit, Handshake, Save, X, Mail, Send, Clock, CheckCircle, AlertCircle, UserPlus, Trash2, Copy, Check, Link as LinkIcon, ShoppingCart } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function UsersManagement() {
  const { profile: currentUser } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [editingUser, setEditingUser] = useState(null);
  const [editFormData, setEditFormData] = useState(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [deletingUser, setDeletingUser] = useState(null);
  const [createFormData, setCreateFormData] = useState({
    email: "",
    password: "",
    nom: "",
    prenom: "",
    role_custom: "commercial",
    partenaire_id: "",
    acquereur_id: "",
  });
  const [isCreating, setIsCreating] = useState(false);
  const queryClient = useQueryClient();

  const { data: users = [], isLoading, error: usersError } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      try {
        const result = await base44.entities.User.list('-created_at');
        return result;
      } catch (err) {
        console.error('Error loading users:', err);
        throw err;
      }
    },
  });

  const { data: partenaires = [] } = useQuery({
    queryKey: ['partenaires_list'],
    queryFn: () => base44.entities.Partenaire.list(),
  });

  const { data: acquereurs = [] } = useQuery({
    queryKey: ['acquereurs_list'],
    queryFn: () => base44.entities.Acquereur.list(),
  });

  const updateUserMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      const { role_custom, partenaire_id } = data;
      const profileData = { role_custom, partenaire_id };

      await base44.entities.User.update(id, profileData);

      if (role_custom === 'partenaire' && partenaire_id) {
        const { options_max, duree_option_jours } = data;
        const partenaireData = {};

        if (options_max !== undefined) partenaireData.options_max = options_max;
        if (duree_option_jours !== undefined) partenaireData.duree_option_jours = duree_option_jours;

        if (Object.keys(partenaireData).length > 0) {
          const { error: partenaireError } = await supabase
            .from('partenaires')
            .update(partenaireData)
            .eq('id', partenaire_id);

          if (partenaireError) {
            console.error('Erreur mise à jour partenaire:', partenaireError);
            throw partenaireError;
          }
        }
      }
    },
    onSuccess: () => {
      queryClient.refetchQueries({ queryKey: ['users'] });
      queryClient.refetchQueries({ queryKey: ['partenaires_list'] });
      setEditingUser(null);
      setEditFormData(null);
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: (id) => base44.entities.User.delete(id),
    onSuccess: () => {
      queryClient.refetchQueries({ queryKey: ['users'] });
      setDeletingUser(null);
    },
  });

  const createUserMutation = useMutation({
    mutationFn: async (userData) => {
      const { data: { session } } = await supabase.auth.getSession();

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-user`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erreur lors de la création de l\'utilisateur');
      }

      return await response.json();
    },
    onSuccess: () => {
      queryClient.refetchQueries({ queryKey: ['users'] });
      setShowCreateDialog(false);
      setCreateFormData({
        email: "",
        password: "",
        nom: "",
        prenom: "",
        role_custom: "commercial",
        partenaire_id: "",
        acquereur_id: "",
      });
    },
  });

  const handleOpenEditDialog = (user) => {
    setEditingUser(user);
    setEditFormData({
      role_custom: user.role_custom || 'admin',
      partenaire_id: user.partenaire_id ? String(user.partenaire_id) : '',
      options_max: user.options_max || 3,
      duree_option_jours: user.duree_option_jours || 5,
    });
  };

  const handleSaveUser = () => {
    updateUserMutation.mutate({
      id: editingUser.id,
      data: editFormData
    });
  };

  const handleDeleteUser = () => {
    if (deletingUser) {
      deleteUserMutation.mutate(deletingUser.id);
    }
  };

  const handleCreateUser = async () => {
    setIsCreating(true);
    try {
      await createUserMutation.mutateAsync(createFormData);
      alert('✅ Utilisateur créé avec succès');
    } catch (error) {
      console.error("Erreur lors de la création de l'utilisateur:", error);
      alert(`❌ ${error.message}`);
    } finally {
      setIsCreating(false);
    }
  };

  const filteredUsers = users.filter(u =>
    !searchTerm ||
    u.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.prenom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    total: users.length,
    admins: users.filter(u => (u.role_custom || 'admin') === 'admin').length,
    commerciaux: users.filter(u => u.role_custom === 'commercial').length,
    partenaires: users.filter(u => u.role_custom === 'partenaire').length,
    acquereurs: users.filter(u => u.role_custom === 'acquereur').length,
  };

  if (!currentUser || currentUser?.role_custom !== 'admin') {
    return (
      <div className="p-6 md:p-8 bg-[#F9FAFB] min-h-screen">
        <div className="max-w-7xl mx-auto">
          <Card>
            <CardContent className="p-12 text-center">
              <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-slate-700 mb-2">Accès refusé</h2>
              <p className="text-slate-500">Vous n'avez pas les permissions nécessaires pour accéder à cette page.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 bg-[#F9FAFB] min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex justify-between items-start">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Users className="w-8 h-8 text-[#1E40AF]" />
              <h1 className="text-3xl font-bold text-[#1E40AF] tracking-tight">Gestion des utilisateurs</h1>
            </div>
            <p className="text-slate-500">
              {stats.total} utilisateurs · {stats.admins} admins · {stats.commerciaux} commerciaux · {stats.partenaires} partenaires · {stats.acquereurs} acquéreurs
            </p>
          </div>
          <Button
            onClick={() => setShowCreateDialog(true)}
            className="bg-[#1E40AF] hover:bg-[#1E3A8A]"
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Créer un utilisateur
          </Button>
        </div>

        <div className="w-full">
            <div className="grid md:grid-cols-5 gap-6 mb-8">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-slate-500">Total utilisateurs</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-[#1E40AF]" />
                    <p className="text-3xl font-bold text-[#1E40AF]">{stats.total}</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-slate-500">Administrateurs</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-purple-600" />
                    <p className="text-3xl font-bold text-purple-600">{stats.admins}</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-slate-500">Commerciaux</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <UserCheck className="w-5 h-5 text-green-600" />
                    <p className="text-3xl font-bold text-green-600">{stats.commerciaux}</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-slate-500">Partenaires</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <Handshake className="w-5 h-5 text-amber-600" />
                    <p className="text-3xl font-bold text-amber-600">{stats.partenaires}</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-slate-500">Acquéreurs</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <ShoppingCart className="w-5 h-5 text-blue-600" />
                    <p className="text-3xl font-bold text-blue-600">{stats.acquereurs}</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <Input
                  placeholder="Rechercher un utilisateur..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Utilisateurs du système</CardTitle>
              </CardHeader>
              <CardContent>
                {usersError ? (
                  <div className="text-center py-12">
                    <p className="text-red-500 mb-2">Erreur lors du chargement des utilisateurs</p>
                    <p className="text-sm text-slate-500">{usersError.message}</p>
                  </div>
                ) : isLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-20 bg-slate-100 rounded-lg animate-pulse" />
                    ))}
                  </div>
                ) : filteredUsers.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-slate-400">Aucun utilisateur trouvé</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <AnimatePresence>
                      {filteredUsers.map((user) => {
                        const userRole = user.role_custom || 'admin';
                        const partenaireNom = partenaires.find(p => p.id === user.partenaire_id)?.nom;
                        const acquereurNom = acquereurs.find(a => a.user_id === user.id);
                        const isCurrentUser = user.id === currentUser?.id;

                        return (
                          <motion.div
                            key={user.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-lg hover:shadow-md transition-shadow"
                          >
                            <div className="flex items-center gap-4 flex-1">
                              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                                userRole === 'admin' ? 'bg-purple-100' :
                                userRole === 'commercial' ? 'bg-green-100' :
                                userRole === 'acquereur' ? 'bg-blue-100' :
                                'bg-amber-100'
                              }`}>
                                {userRole === 'admin' ? (
                                  <Shield className="w-6 h-6 text-purple-600" />
                                ) : userRole === 'commercial' ? (
                                  <UserCheck className="w-6 h-6 text-green-600" />
                                ) : userRole === 'acquereur' ? (
                                  <ShoppingCart className="w-6 h-6 text-blue-600" />
                                ) : (
                                  <Handshake className="w-6 h-6 text-amber-600" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-slate-700 truncate">{user.prenom} {user.nom}</p>
                                <p className="text-sm text-slate-500 truncate">{user.email}</p>
                                {userRole === 'partenaire' && partenaireNom && (
                                  <p className="text-xs text-amber-600 truncate">→ {partenaireNom}</p>
                                )}
                                {userRole === 'acquereur' && acquereurNom && (
                                  <p className="text-xs text-blue-600 truncate">→ {acquereurNom.nom} {acquereurNom.prenom}</p>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-3">
                              {isCurrentUser ? (
                                <Badge className="bg-blue-100 text-blue-800">Vous</Badge>
                              ) : (
                                <>
                                  <Badge className={
                                    userRole === 'admin'
                                      ? 'bg-purple-100 text-purple-800'
                                      : userRole === 'commercial'
                                      ? 'bg-green-100 text-green-800'
                                      : userRole === 'acquereur'
                                      ? 'bg-blue-100 text-blue-800'
                                      : 'bg-amber-100 text-amber-800'
                                  }>
                                    {userRole === 'admin' ? 'Administrateur' : userRole === 'commercial' ? 'Commercial' : userRole === 'acquereur' ? 'Acquéreur' : 'Partenaire'}
                                  </Badge>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleOpenEditDialog(user)}
                                    title="Modifier l'utilisateur"
                                  >
                                    <Edit className="w-4 h-4 text-slate-500" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setDeletingUser(user)}
                                    title="Supprimer l'utilisateur"
                                    className="hover:bg-red-50"
                                  >
                                    <Trash2 className="w-4 h-4 text-red-500" />
                                  </Button>
                                </>
                              )}
                            </div>
                          </motion.div>
                        );
                      })}
                    </AnimatePresence>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-sm">Rôles et permissions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-purple-600 mt-0.5" />
                  <div>
                    <p className="font-semibold text-slate-700">Administrateur</p>
                    <p className="text-sm text-slate-500">Accès complet à toutes les fonctionnalités du CRM</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <UserCheck className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="font-semibold text-slate-700">Commercial</p>
                    <p className="text-sm text-slate-500">Accès restreint : peut uniquement gérer les partenaires qu'il a créés</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Handshake className="w-5 h-5 text-amber-600 mt-0.5" />
                  <div>
                    <p className="font-semibold text-slate-700">Partenaire</p>
                    <p className="text-sm text-slate-500">Accès aux lots disponibles, ses acquéreurs, et système d'options</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <ShoppingCart className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="font-semibold text-slate-700">Acquéreur</p>
                    <p className="text-sm text-slate-500">Accès restreint à son espace client : suivi du dossier, documents, appels de fond, messagerie et FAQ</p>
                  </div>
                </div>
              </CardContent>
            </Card>
        </div>

        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogContent className="sm:max-w-xl bg-white max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-slate-900 flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-[#1E40AF]" />
                Créer un nouvel utilisateur
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Prénom <span className="text-red-500">*</span></Label>
                  <Input
                    required
                    placeholder="Jean"
                    value={createFormData.prenom}
                    onChange={(e) => setCreateFormData({...createFormData, prenom: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Nom <span className="text-red-500">*</span></Label>
                  <Input
                    required
                    placeholder="Dupont"
                    value={createFormData.nom}
                    onChange={(e) => setCreateFormData({...createFormData, nom: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Email <span className="text-red-500">*</span></Label>
                <Input
                  type="email"
                  required
                  placeholder="jean.dupont@example.com"
                  value={createFormData.email}
                  onChange={(e) => setCreateFormData({...createFormData, email: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <Label>Mot de passe <span className="text-red-500">*</span></Label>
                <Input
                  type="password"
                  required
                  placeholder="Minimum 6 caractères"
                  value={createFormData.password}
                  onChange={(e) => setCreateFormData({...createFormData, password: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <Label>Rôle <span className="text-red-500">*</span></Label>
                <Select
                  value={createFormData.role_custom}
                  onValueChange={(value) => setCreateFormData({...createFormData, role_custom: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="admin">
                      <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4" />
                        <span>Administrateur</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="commercial">
                      <div className="flex items-center gap-2">
                        <UserCheck className="w-4 h-4" />
                        <span>Commercial</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="partenaire">
                      <div className="flex items-center gap-2">
                        <Handshake className="w-4 h-4" />
                        <span>Partenaire</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="acquereur">
                      <div className="flex items-center gap-2">
                        <ShoppingCart className="w-4 h-4" />
                        <span>Acquéreur</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {createFormData.role_custom === 'partenaire' && (
                <div className="space-y-2">
                  <Label>Partenaire associé <span className="text-red-500">*</span></Label>
                  <Select
                    value={createFormData.partenaire_id || undefined}
                    onValueChange={(value) => setCreateFormData({...createFormData, partenaire_id: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un partenaire" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      {partenaires.map(p => (
                        <SelectItem key={p.id} value={String(p.id)}>
                          {p.prenom} {p.nom}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {createFormData.role_custom === 'acquereur' && (
                <div className="space-y-2">
                  <Label>Acquéreur associé <span className="text-red-500">*</span></Label>
                  <Select
                    value={createFormData.acquereur_id}
                    onValueChange={(value) => setCreateFormData({...createFormData, acquereur_id: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un acquéreur" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      {acquereurs.map(a => (
                        <SelectItem key={a.id} value={a.id}>{a.nom} {a.prenom} - {a.email}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-slate-500">L'acquéreur pourra accéder à son espace client pour suivre son dossier</p>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreateDialog(false)} disabled={isCreating}>
                <X className="w-4 h-4 mr-2" />
                Annuler
              </Button>
              <Button
                onClick={handleCreateUser}
                className="bg-[#1E40AF] hover:bg-[#1E3A8A]"
                disabled={!createFormData.email || !createFormData.password || !createFormData.nom || !createFormData.prenom || isCreating || (createFormData.role_custom === 'acquereur' && !createFormData.acquereur_id)}
              >
                {isCreating ? (
                  <>
                    <Clock className="w-4 h-4 mr-2 animate-spin" />
                    Création...
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Créer l'utilisateur
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={!!editingUser} onOpenChange={(open) => !open && setEditingUser(null)}>
          <DialogContent className="sm:max-w-md bg-white">
            <DialogHeader>
              <DialogTitle className="text-slate-900">Modifier l'utilisateur</DialogTitle>
            </DialogHeader>
            {editFormData && (
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Rôle</Label>
                  <Select
                    value={editFormData.role_custom}
                    onValueChange={(value) => setEditFormData({...editFormData, role_custom: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">
                        <div className="flex items-center gap-2">
                          <Shield className="w-4 h-4" />
                          <span>Administrateur</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="commercial">
                        <div className="flex items-center gap-2">
                          <UserCheck className="w-4 h-4" />
                          <span>Commercial</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="partenaire">
                        <div className="flex items-center gap-2">
                          <Handshake className="w-4 h-4" />
                          <span>Partenaire</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="acquereur">
                        <div className="flex items-center gap-2">
                          <ShoppingCart className="w-4 h-4" />
                          <span>Acquéreur</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {editFormData.role_custom === 'partenaire' && (
                  <>
                    <div className="space-y-2">
                      <Label>Partenaire associé *</Label>
                      <Select
                        value={editFormData.partenaire_id && String(editFormData.partenaire_id)}
                        onValueChange={(value) => {
                          console.log('Partenaire sélectionné:', value);
                          setEditFormData({...editFormData, partenaire_id: value});
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner un partenaire" />
                        </SelectTrigger>
                        <SelectContent>
                          {partenaires.map(p => (
                            <SelectItem key={p.id} value={String(p.id)}>
                              {p.prenom} {p.nom}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {editFormData.partenaire_id && (
                        <p className="text-xs text-green-600">Partenaire sélectionné</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label>Nombre max d'options simultanées</Label>
                      <Input
                        type="number"
                        min="1"
                        max="10"
                        value={editFormData.options_max}
                        onChange={(e) => setEditFormData({...editFormData, options_max: parseInt(e.target.value)})}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Durée d'une option (jours)</Label>
                      <Input
                        type="number"
                        min="1"
                        max="30"
                        value={editFormData.duree_option_jours}
                        onChange={(e) => setEditFormData({...editFormData, duree_option_jours: parseInt(e.target.value)})}
                      />
                    </div>
                  </>
                )}
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditingUser(null)}>
                <X className="w-4 h-4 mr-2" />
                Annuler
              </Button>
              <Button
                onClick={() => {
                  console.log('Tentative de sauvegarde avec:', editFormData);
                  handleSaveUser();
                }}
                className="bg-[#1E40AF] hover:bg-[#1E3A8A]"
                disabled={
                  updateUserMutation.isPending ||
                  (editFormData?.role_custom === 'partenaire' && !editFormData?.partenaire_id)
                }
              >
                <Save className="w-4 h-4 mr-2" />
                {updateUserMutation.isPending ? 'Enregistrement...' : 'Enregistrer'}
              </Button>
              {editFormData?.role_custom === 'partenaire' && !editFormData?.partenaire_id && (
                <p className="text-xs text-red-500 w-full text-center">Veuillez sélectionner un partenaire</p>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={!!deletingUser} onOpenChange={(open) => !open && setDeletingUser(null)}>
          <DialogContent className="sm:max-w-md bg-white">
            <DialogHeader>
              <DialogTitle className="text-slate-900 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-500" />
                Confirmer la suppression
              </DialogTitle>
              <DialogDescription className="text-slate-600 pt-2">
                Êtes-vous sûr de vouloir supprimer cet utilisateur ?
              </DialogDescription>
            </DialogHeader>
            {deletingUser && (
              <div className="py-4">
                <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                  <p className="font-semibold text-slate-700 mb-1">{deletingUser.prenom} {deletingUser.nom}</p>
                  <p className="text-sm text-slate-600">{deletingUser.email}</p>
                  <p className="text-xs text-red-600 mt-3">
                    Cette action est irréversible. L'utilisateur perdra immédiatement l'accès à la plateforme.
                  </p>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeletingUser(null)}>
                <X className="w-4 h-4 mr-2" />
                Annuler
              </Button>
              <Button
                onClick={handleDeleteUser}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Supprimer définitivement
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

      </div>
    </div>
  );
}
