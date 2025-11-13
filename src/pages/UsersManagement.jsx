
import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
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
import { Users, Shield, UserCheck, Search, Edit, Handshake, Save, X, Mail, Send, Clock, CheckCircle, AlertCircle, UserPlus, Trash2, Copy, Check, Link as LinkIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function UsersManagement() {
  const { profile: currentUser } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [editingUser, setEditingUser] = useState(null);
  const [editFormData, setEditFormData] = useState(null);
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [deletingUser, setDeletingUser] = useState(null);
  const [inviteFormData, setInviteFormData] = useState({
    email: "",
    nom_entreprise: "",
    contact_principal: "",
    type_partenaire: "cgp",
    message_personnalise: "",
  });
  const [invitationSuccess, setInvitationSuccess] = useState(null); // New state for success message
  const [copied, setCopied] = useState(false); // New state for copy button
  const [isSending, setIsSending] = useState(false);
  const queryClient = useQueryClient();

  console.log('UsersManagement - currentUser from AuthContext:', currentUser);

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: () => base44.entities.User.list('-created_date'),
  });

  const { data: partenaires = [] } = useQuery({
    queryKey: ['partenaires_list'],
    queryFn: () => base44.entities.Partenaire.list(),
  });

  const { data: invitations = [] } = useQuery({
    queryKey: ['invitations_partenaires'],
    queryFn: () => base44.entities.InvitationPartenaire.list('-created_date'),
  });

  const updateUserMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.User.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setEditingUser(null);
      setEditFormData(null);
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: (id) => base44.entities.User.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setDeletingUser(null);
    },
  });

  const createInvitationMutation = useMutation({
    mutationFn: (data) => base44.entities.InvitationPartenaire.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invitations_partenaires'] });
    },
  });

  const handleOpenEditDialog = (user) => {
    setEditingUser(user);
    setEditFormData({
      role_custom: user.role_custom || 'admin',
      partenaire_id: user.partenaire_id || '',
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

  const handleSendInvitation = async () => {
    setIsSending(true);
    try {
      // Créer l'invitation dans la base
      const invitation = await createInvitationMutation.mutateAsync({
        ...inviteFormData,
        statut: 'en_attente',
        date_invitation: new Date().toISOString(),
        invite_par: currentUser.email,
      });

      const typeLabels = {
        cgp: "Conseiller en Gestion de Patrimoine",
        plateforme: "Plateforme",
        courtier: "Courtier",
        notaire: "Notaire",
        diffuseur_web: "Diffuseur Web",
        autre: "Partenaire"
      };

      // Lien d'inscription (pas de connexion)
      const signupUrl = `${window.location.origin}?signup=true`;

      // Générer le message d'invitation à copier
      const invitationMessage = `Bonjour ${inviteFormData.contact_principal || inviteFormData.nom_entreprise},

Vous êtes invité(e) à rejoindre notre plateforme Yam Management en tant que partenaire ${typeLabels[inviteFormData.type_partenaire]}.

${inviteFormData.message_personnalise ? `\n${inviteFormData.message_personnalise}\n` : ''}
🎯 En tant que partenaire, vous aurez accès à :
• Notre portefeuille complet de lots LMNP disponibles
• Un espace dédié pour gérer vos acquéreurs
• Un système d'options exclusif pour réserver des biens
• Un suivi en temps réel de vos commissions

👉 Pour créer votre compte et accéder à votre espace partenaire :
1. Créez votre compte sur : ${signupUrl}
2. Utilisez impérativement l'adresse email : ${inviteFormData.email}
3. Après votre inscription, vous serez guidé pour compléter votre profil

📞 Besoin d'aide ? Contactez-nous à ${currentUser.email}

Cordialement,
L'équipe Yam Management`.trim();

      // Montrer le message de succès avec le texte à copier
      setInvitationSuccess({
        email: inviteFormData.email,
        message: invitationMessage,
      });

      // Réinitialiser le formulaire
      setInviteFormData({
        email: "",
        nom_entreprise: "",
        contact_principal: "",
        type_partenaire: "cgp",
        message_personnalise: "",
      });
      setShowInviteDialog(false);
    } catch (error) {
      console.error("Erreur lors de la création de l'invitation:", error);
      alert('❌ Erreur lors de la création de l\'invitation');
    } finally {
      setIsSending(false);
    }
  };

  const copyInvitationMessage = () => {
    if (invitationSuccess) {
      navigator.clipboard.writeText(invitationSuccess.message);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const filteredUsers = users.filter(u => 
    !searchTerm || 
    u.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    total: users.length,
    admins: users.filter(u => (u.role_custom || 'admin') === 'admin').length,
    commerciaux: users.filter(u => u.role_custom === 'commercial').length,
    partenaires: users.filter(u => u.role_custom === 'partenaire').length,
    invitationsEnAttente: invitations.filter(i => i.statut === 'en_attente').length,
  };

  // Vérifier que l'utilisateur actuel est admin
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
              {stats.total} utilisateurs · {stats.admins} admins · {stats.commerciaux} commerciaux · {stats.partenaires} partenaires
            </p>
          </div>
          <Button 
            onClick={() => setShowInviteDialog(true)}
            className="bg-[#F59E0B] hover:bg-[#D97706]"
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Inviter un partenaire
          </Button>
        </div>

        <Tabs defaultValue="users" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="users">
              <Users className="w-4 h-4 mr-2" />
              Utilisateurs ({stats.total})
            </TabsTrigger>
            <TabsTrigger value="invitations">
              <Mail className="w-4 h-4 mr-2" />
              Invitations ({invitations.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            {/* Statistiques */}
            <div className="grid md:grid-cols-4 gap-6 mb-8">
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
            </div>

            {/* Barre de recherche */}
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

            {/* Liste des utilisateurs */}
            <Card>
              <CardHeader>
                <CardTitle>Utilisateurs du système</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
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
                                'bg-amber-100'
                              }`}>
                                {userRole === 'admin' ? (
                                  <Shield className="w-6 h-6 text-purple-600" />
                                ) : userRole === 'commercial' ? (
                                  <UserCheck className="w-6 h-6 text-green-600" />
                                ) : (
                                  <Handshake className="w-6 h-6 text-amber-600" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-slate-700 truncate">{user.full_name}</p>
                                <p className="text-sm text-slate-500 truncate">{user.email}</p>
                                {userRole === 'partenaire' && partenaireNom && (
                                  <p className="text-xs text-amber-600 truncate">→ {partenaireNom}</p>
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
                                      : 'bg-amber-100 text-amber-800'
                                  }>
                                    {userRole === 'admin' ? 'Administrateur' : userRole === 'commercial' ? 'Commercial' : 'Partenaire'}
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

            {/* Légende */}
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
                    <p className="text-sm text-slate-500">Accès aux lots disponibles, ses acquéreurs, et système d'options (durée et nombre configurables)</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="invitations">
            <Card>
              <CardHeader>
                <CardTitle>Invitations envoyées</CardTitle>
              </CardHeader>
              <CardContent>
                {invitations.length === 0 ? (
                  <div className="text-center py-12">
                    <Mail className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-400">Aucune invitation envoyée</p>
                    <Button 
                      onClick={() => setShowInviteDialog(true)}
                      className="mt-4 bg-[#F59E0B] hover:bg-[#D97706]"
                    >
                      Envoyer votre première invitation
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {invitations.map((invitation) => {
                      const statusConfig = {
                        en_attente: { icon: Clock, color: "bg-yellow-100 text-yellow-800", label: "En attente" },
                        inscrit: { icon: CheckCircle, color: "bg-blue-100 text-blue-800", label: "Inscrit" },
                        actif: { icon: CheckCircle, color: "bg-green-100 text-green-800", label: "Actif" },
                      };
                      const config = statusConfig[invitation.statut];
                      const Icon = config.icon;

                      return (
                        <div key={invitation.id} className="p-4 bg-white border border-slate-200 rounded-lg">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <p className="font-semibold text-slate-700">{invitation.nom_entreprise}</p>
                                <Badge className={config.color}>
                                  <Icon className="w-3 h-3 mr-1" />
                                  {config.label}
                                </Badge>
                              </div>
                              <p className="text-sm text-slate-600 mb-1">{invitation.email}</p>
                              {invitation.contact_principal && (
                                <p className="text-xs text-slate-500">Contact: {invitation.contact_principal}</p>
                              )}
                              <p className="text-xs text-slate-400 mt-2">
                                Créée le {new Date(invitation.date_invitation).toLocaleDateString('fr-FR')} par {invitation.invite_par}
                              </p>
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {invitation.type_partenaire.toUpperCase()}
                            </Badge>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Dialog d'édition */}
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
                    </SelectContent>
                  </Select>
                </div>

                {editFormData.role_custom === 'partenaire' && (
                  <>
                    <div className="space-y-2">
                      <Label>Partenaire associé *</Label>
                      <Select
                        value={editFormData.partenaire_id}
                        onValueChange={(value) => setEditFormData({...editFormData, partenaire_id: value})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner un partenaire" />
                        </SelectTrigger>
                        <SelectContent>
                          {partenaires.map(p => (
                            <SelectItem key={p.id} value={p.id}>{p.nom}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
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
                onClick={handleSaveUser}
                className="bg-[#1E40AF] hover:bg-[#1E3A8A]"
                disabled={editFormData?.role_custom === 'partenaire' && !editFormData?.partenaire_id}
              >
                <Save className="w-4 h-4 mr-2" />
                Enregistrer
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Dialog de confirmation de suppression */}
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
                  <p className="font-semibold text-slate-700 mb-1">{deletingUser.full_name}</p>
                  <p className="text-sm text-slate-600">{deletingUser.email}</p>
                  <p className="text-xs text-red-600 mt-3">
                    ⚠️ Cette action est irréversible. L'utilisateur perdra immédiatement l'accès à la plateforme.
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

        {/* Dialog d'invitation */}
        <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
          <DialogContent className="sm:max-w-xl bg-white">
            <DialogHeader>
              <DialogTitle className="text-slate-900 flex items-center gap-2">
                <Mail className="w-5 h-5 text-[#F59E0B]" />
                Inviter un nouveau partenaire
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Email du partenaire <span className="text-red-500">*</span></Label>
                <Input
                  type="email"
                  required
                  placeholder="contact@entreprise.fr"
                  value={inviteFormData.email}
                  onChange={(e) => setInviteFormData({...inviteFormData, email: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <Label>Nom de l'entreprise / Cabinet <span className="text-red-500">*</span></Label>
                <Input
                  required
                  placeholder="Ex: Cabinet Patrimoine Conseil"
                  value={inviteFormData.nom_entreprise}
                  onChange={(e) => setInviteFormData({...inviteFormData, nom_entreprise: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <Label>Nom du contact principal</Label>
                <Input
                  placeholder="Ex: Jean Dupont"
                  value={inviteFormData.contact_principal}
                  onChange={(e) => setInviteFormData({...inviteFormData, contact_principal: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <Label>Type de partenaire <span className="text-red-500">*</span></Label>
                <Select
                  value={inviteFormData.type_partenaire}
                  onValueChange={(value) => setInviteFormData({...inviteFormData, type_partenaire: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="cgp">Conseiller en Gestion de Patrimoine (CGP)</SelectItem>
                    <SelectItem value="plateforme">Plateforme</SelectItem>
                    <SelectItem value="courtier">Courtier</SelectItem>
                    <SelectItem value="notaire">Notaire</SelectItem>
                    <SelectItem value="diffuseur_web">Diffuseur Web</SelectItem>
                    <SelectItem value="autre">Autre</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Message personnalisé (optionnel)</Label>
                <Textarea
                  placeholder="Ajoutez un message personnalisé qui sera inclus dans l'email d'invitation..."
                  value={inviteFormData.message_personnalise}
                  onChange={(e) => setInviteFormData({...inviteFormData, message_personnalise: e.target.value})}
                  className="min-h-[100px]"
                />
              </div>

              <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                <div className="flex gap-2 mb-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-amber-800 font-semibold">
                    Information importante
                  </p>
                </div>
                <p className="text-sm text-amber-700">
                  Un message d'invitation sera généré que vous pourrez <strong>copier et envoyer manuellement</strong> à <strong>{inviteFormData.email || "l'adresse email"}</strong>.
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowInviteDialog(false)} disabled={isSending}>
                <X className="w-4 h-4 mr-2" />
                Annuler
              </Button>
              <Button
                onClick={handleSendInvitation}
                className="bg-[#F59E0B] hover:bg-[#D97706]"
                disabled={!inviteFormData.email || !inviteFormData.nom_entreprise || isSending}
              >
                {isSending ? (
                  <>
                    <Clock className="w-4 h-4 mr-2 animate-spin" />
                    Création...
                  </>
                ) : (
                  <>
                    <LinkIcon className="w-4 h-4 mr-2" />
                    Générer l'invitation
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Dialog de succès avec message à copier */}
        <Dialog open={!!invitationSuccess} onOpenChange={(open) => !open && setInvitationSuccess(null)}>
          <DialogContent className="sm:max-w-2xl bg-white">
            <DialogHeader>
              <DialogTitle className="text-slate-900 flex items-center gap-2">
                <CheckCircle className="w-6 h-6 text-green-600" />
                Invitation créée avec succès !
              </DialogTitle>
              <DialogDescription className="text-slate-600 pt-2">
                L'invitation a été enregistrée dans le système. Copiez le message ci-dessous et envoyez-le manuellement à votre partenaire.
              </DialogDescription>
            </DialogHeader>
            {invitationSuccess && (
              <div className="space-y-4 py-4">
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-sm text-green-800 font-semibold mb-2">
                    📧 Destinataire : {invitationSuccess.email}
                  </p>
                  <p className="text-xs text-green-700">
                    Envoyez ce message par email, SMS, WhatsApp ou tout autre moyen de communication.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Message d'invitation à envoyer :</Label>
                  <div className="relative">
                    <Textarea
                      value={invitationSuccess.message}
                      readOnly
                      className="min-h-[300px] font-mono text-xs bg-slate-50"
                    />
                    <Button
                      onClick={copyInvitationMessage}
                      className={`absolute top-2 right-2 ${copied ? 'bg-green-600' : 'bg-[#1E40AF]'} hover:bg-[#1E3A8A]`}
                      size="sm"
                    >
                      {copied ? (
                        <>
                          <Check className="w-4 h-4 mr-1" />
                          Copié !
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4 mr-1" />
                          Copier
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm text-blue-800">
                    💡 <strong>Astuce :</strong> Une fois envoyé, le partenaire devra s'inscrire sur la plateforme avec l'adresse email indiquée. Vous pourrez ensuite l'associer à son compte depuis l'onglet "Utilisateurs".
                  </p>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button 
                onClick={() => setInvitationSuccess(null)}
                className="bg-[#1E40AF] hover:bg-[#1E3A8A]"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Terminé
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
