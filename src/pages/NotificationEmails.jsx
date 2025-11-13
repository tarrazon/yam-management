import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { Plus, Trash2, Mail, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import DeleteConfirmDialog from '@/components/common/DeleteConfirmDialog';

export default function NotificationEmails() {
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    description: '',
    active: true,
  });
  const [submitting, setSubmitting] = useState(false);
  const [deleteEmail, setDeleteEmail] = useState(null);

  useEffect(() => {
    loadEmails();
  }, []);

  const loadEmails = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('notification_emails')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setEmails(data || []);
    } catch (error) {
      console.error('Error loading notification emails:', error);
      toast.error('Erreur lors du chargement des emails');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email) {
      toast.error('L\'email est requis');
      return;
    }

    try {
      setSubmitting(true);
      const { data: { user } } = await supabase.auth.getUser();

      const { error } = await supabase
        .from('notification_emails')
        .insert({
          email: formData.email,
          description: formData.description,
          active: formData.active,
          created_by: user.id,
        });

      if (error) throw error;

      toast.success('Email ajouté avec succès');
      setShowAddDialog(false);
      setFormData({ email: '', description: '', active: true });
      loadEmails();
    } catch (error) {
      console.error('Error adding email:', error);
      toast.error(error.message || 'Erreur lors de l\'ajout de l\'email');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (id, currentActive) => {
    try {
      const { error } = await supabase
        .from('notification_emails')
        .update({ active: !currentActive })
        .eq('id', id);

      if (error) throw error;

      toast.success('Statut mis à jour');
      loadEmails();
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Erreur lors de la mise à jour');
    }
  };

  const handleDelete = async () => {
    if (!deleteEmail) return;

    try {
      const { error } = await supabase
        .from('notification_emails')
        .delete()
        .eq('id', deleteEmail.id);

      if (error) throw error;

      toast.success('Email supprimé');
      setDeleteEmail(null);
      loadEmails();
    } catch (error) {
      console.error('Error deleting email:', error);
      toast.error('Erreur lors de la suppression');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Emails de notification</h1>
          <p className="text-gray-500 mt-1">
            Gérez les emails qui recevront les notifications de prise d'option
          </p>
        </div>
        <Button onClick={() => setShowAddDialog(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Ajouter un email
        </Button>
      </div>

      <div className="grid gap-4">
        {emails.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Mail className="h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-500 text-center">
                Aucun email de notification configuré
              </p>
              <Button
                onClick={() => setShowAddDialog(true)}
                variant="outline"
                className="mt-4"
              >
                Ajouter le premier email
              </Button>
            </CardContent>
          </Card>
        ) : (
          emails.map((email) => (
            <Card key={email.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2">
                      <Mail className="h-5 w-5" />
                      {email.email}
                    </CardTitle>
                    {email.description && (
                      <CardDescription className="mt-2">
                        {email.description}
                      </CardDescription>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <Label htmlFor={`active-${email.id}`} className="text-sm">
                        {email.active ? 'Actif' : 'Inactif'}
                      </Label>
                      <Switch
                        id={`active-${email.id}`}
                        checked={email.active}
                        onCheckedChange={() => handleToggleActive(email.id, email.active)}
                      />
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setDeleteEmail(email)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))
        )}
      </div>

      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ajouter un email de notification</DialogTitle>
            <DialogDescription>
              Cet email recevra une notification à chaque prise d'option par un partenaire
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="exemple@email.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Note ou description de ce contact..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  id="active"
                  checked={formData.active}
                  onCheckedChange={(checked) => setFormData({ ...formData, active: checked })}
                />
                <Label htmlFor="active">Activer les notifications</Label>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowAddDialog(false)}
                disabled={submitting}
              >
                Annuler
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Ajouter
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <DeleteConfirmDialog
        open={!!deleteEmail}
        onOpenChange={() => setDeleteEmail(null)}
        onConfirm={handleDelete}
        title="Supprimer cet email"
        description={`Êtes-vous sûr de vouloir supprimer l'email ${deleteEmail?.email} ? Cette action est irréversible.`}
      />
    </div>
  );
}
