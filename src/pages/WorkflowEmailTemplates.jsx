import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Mail, Edit, Save, X, AlertCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export default function WorkflowEmailTemplates() {
  const [steps, setSteps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingStep, setEditingStep] = useState(null);
  const [formData, setFormData] = useState({
    email_subject: '',
    email_body: '',
    send_email: false,
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadSteps();
  }, []);

  const loadSteps = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('workflow_steps')
        .select('*')
        .order('order_index', { ascending: true });

      if (error) throw error;
      setSteps(data || []);
    } catch (error) {
      console.error('Error loading workflow steps:', error);
      toast.error('Erreur lors du chargement des étapes');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (step) => {
    setEditingStep(step);
    setFormData({
      email_subject: step.email_subject || '',
      email_body: step.email_body || '',
      send_email: step.send_email || false,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.send_email && (!formData.email_subject || !formData.email_body)) {
      toast.error('Le sujet et le corps de l\'email sont requis');
      return;
    }

    try {
      setSubmitting(true);

      const { error } = await supabase
        .from('workflow_steps')
        .update({
          email_subject: formData.email_subject || null,
          email_body: formData.email_body || null,
          send_email: formData.send_email,
        })
        .eq('id', editingStep.id);

      if (error) throw error;

      toast.success('Template d\'email mis à jour avec succès');
      setEditingStep(null);
      loadSteps();
    } catch (error) {
      console.error('Error updating template:', error);
      toast.error('Erreur lors de la mise à jour du template');
    } finally {
      setSubmitting(false);
    }
  };

  const getVariablesHelp = () => {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
        <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          Variables disponibles
        </h4>
        <div className="text-sm text-blue-800 space-y-1">
          <p><code className="bg-blue-100 px-1 rounded">{'{{lot_reference}}'}</code> - Référence du lot</p>
          <p><code className="bg-blue-100 px-1 rounded">{'{{residence_nom}}'}</code> - Nom de la résidence</p>
          <p><code className="bg-blue-100 px-1 rounded">{'{{acquereur_nom}}'}</code> - Nom de l'acquéreur</p>
          <p><code className="bg-blue-100 px-1 rounded">{'{{vendeur_nom}}'}</code> - Nom du vendeur</p>
          <p><code className="bg-blue-100 px-1 rounded">{'{{partenaire_nom}}'}</code> - Nom du partenaire</p>
          <p><code className="bg-blue-100 px-1 rounded">{'{{date}}'}</code> - Date actuelle</p>
          <p><code className="bg-blue-100 px-1 rounded">{'{{step_label}}'}</code> - Libellé de l'étape</p>
          <p><code className="bg-blue-100 px-1 rounded">{'{{notes}}'}</code> - Notes de l'étape</p>
          <p><code className="bg-blue-100 px-1 rounded">{'{{documents_manquants}}'}</code> - Liste des documents manquants (pour relances)</p>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1E40AF] mx-auto"></div>
          <p className="mt-4 text-slate-600">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 bg-[#F9FAFB] min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#1E40AF] flex items-center gap-3">
            <Mail className="w-8 h-8" />
            Templates d'emails du dossier
          </h1>
          <p className="text-slate-500 mt-2">
            Configurez les emails automatiques envoyés lors de la complétion des étapes du dossier
          </p>
        </div>

        <div className="grid gap-4">
          {steps.map((step) => (
            <Card key={step.id} className="border-none shadow-md">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2">
                      {step.label}
                      {step.is_automatic && (
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          Auto
                        </Badge>
                      )}
                      {step.send_email && (
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                          <Mail className="w-3 h-3 mr-1" />
                          Email activé
                        </Badge>
                      )}
                    </CardTitle>
                    <CardDescription className="mt-1">
                      {step.send_email && step.email_subject ? (
                        <span className="text-slate-600">
                          Sujet: <span className="font-medium">{step.email_subject}</span>
                        </span>
                      ) : (
                        <span className="text-slate-400">Aucun email configuré</span>
                      )}
                    </CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(step)}
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Éditer
                  </Button>
                </div>
              </CardHeader>
              {step.send_email && step.email_body && (
                <CardContent>
                  <div className="bg-white rounded-lg p-4 border border-slate-200">
                    <p className="text-xs font-semibold text-slate-600 mb-2">Aperçu du message:</p>
                    <p className="text-sm text-slate-700 whitespace-pre-wrap line-clamp-3">
                      {step.email_body}
                    </p>
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      </div>

      <Dialog open={!!editingStep} onOpenChange={() => setEditingStep(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">
              Configurer l'email - {editingStep?.label}
            </DialogTitle>
            <DialogDescription>
              Personnalisez le template d'email envoyé lors de la complétion de cette étape
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200">
              <div>
                <Label className="text-base font-semibold">Envoyer un email automatiquement</Label>
                <p className="text-sm text-slate-500 mt-1">
                  Active l'envoi d'email quand cette étape est complétée
                </p>
              </div>
              <Switch
                checked={formData.send_email}
                onCheckedChange={(checked) => setFormData({ ...formData, send_email: checked })}
              />
            </div>

            {formData.send_email && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="email_subject">Sujet de l'email *</Label>
                  <Input
                    id="email_subject"
                    value={formData.email_subject}
                    onChange={(e) => setFormData({ ...formData, email_subject: e.target.value })}
                    placeholder="Ex: Étape {{step_label}} complétée pour le lot {{lot_reference}}"
                    required={formData.send_email}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email_body">Corps de l'email *</Label>
                  <Textarea
                    id="email_body"
                    value={formData.email_body}
                    onChange={(e) => setFormData({ ...formData, email_body: e.target.value })}
                    rows={10}
                    placeholder="Bonjour,&#10;&#10;L'étape {{step_label}} a été complétée pour le lot {{lot_reference}} de la résidence {{residence_nom}}.&#10;&#10;Notes: {{notes}}&#10;&#10;Cordialement"
                    required={formData.send_email}
                    className="font-mono text-sm bg-white"
                  />
                </div>

                {getVariablesHelp()}
              </>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditingStep(null)}
                disabled={submitting}
              >
                <X className="w-4 h-4 mr-2" />
                Annuler
              </Button>
              <Button
                type="submit"
                disabled={submitting}
                className="bg-[#F59E0B] hover:bg-[#D97706] text-white"
              >
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Enregistrement...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Enregistrer
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
