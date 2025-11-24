import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Mail, Edit, Save, X, AlertCircle, Cake, Play } from 'lucide-react';
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
  const [specialTemplates, setSpecialTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingStep, setEditingStep] = useState(null);
  const [editingSpecial, setEditingSpecial] = useState(null);
  const [formData, setFormData] = useState({
    email_subject: '',
    email_body: '',
    send_email: false,
  });
  const [specialFormData, setSpecialFormData] = useState({
    email_subject: '',
    email_body: '',
    is_active: false,
  });
  const [submitting, setSubmitting] = useState(false);
  const [testingBirthday, setTestingBirthday] = useState(false);

  useEffect(() => {
    loadSteps();
    loadSpecialTemplates();
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

  const loadSpecialTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('email_templates_special')
        .select('*')
        .order('code', { ascending: true });

      if (error) throw error;
      setSpecialTemplates(data || []);
    } catch (error) {
      console.error('Error loading special templates:', error);
      toast.error('Erreur lors du chargement des templates spéciaux');
    }
  };

  const getDefaultTemplate = (stepCode) => {
    const templates = {
      signature_mission: {
        subject: 'Signature lettre de mission - Lot {{lot_reference}}',
        body: `Bonjour,

Nous vous confirmons la signature de la lettre de mission pour le lot {{lot_reference}} de la résidence {{residence_nom}}.

Prochaines étapes :
- Collecte des documents nécessaires
- Lancement du processus de vente

{{notes}}

Cordialement,
L'équipe YAM Management`
      },
      relance_docs_vendeurs: {
        subject: 'Relance documents vendeur - Lot {{lot_reference}}',
        body: `Bonjour {{vendeur_nom}},

Nous vous rappelons qu'il nous manque encore certains documents pour finaliser le dossier de vente du lot {{lot_reference}} ({{residence_nom}}).

Documents manquants :
{{documents_manquants}}

Merci de nous les transmettre dans les meilleurs délais afin de ne pas retarder le processus.

{{notes}}

Cordialement,
L'équipe YAM Management`
      },
      option: {
        subject: 'Option posée sur le lot {{lot_reference}}',
        body: `Bonjour,

Une option a été posée sur le lot {{lot_reference}} de la résidence {{residence_nom}}.

Acquéreur : {{acquereur_nom}}
Date d'option : {{date}}

{{notes}}

Cordialement,
L'équipe YAM Management`
      },
      reservation: {
        subject: 'Réservation confirmée - Lot {{lot_reference}}',
        body: `Bonjour {{acquereur_nom}},

Nous avons le plaisir de vous confirmer la réservation du lot {{lot_reference}} de la résidence {{residence_nom}}.

Prochaines étapes :
- Réception des documents requis
- Préparation du compromis de vente
- Signature du compromis

Documents à nous fournir :
{{documents_manquants}}

{{notes}}

Nous vous contacterons prochainement pour la suite des démarches.

Cordialement,
L'équipe YAM Management`
      },
      relance_syndic: {
        subject: 'Relance syndic - Lot {{lot_reference}}',
        body: `Bonjour,

Nous vous relançons concernant les documents nécessaires du syndic pour le lot {{lot_reference}} ({{residence_nom}}).

Documents en attente :
- Procès-verbaux d'assemblée générale
- État des charges
- Carnet d'entretien

{{notes}}

Merci de nous transmettre ces éléments dans les plus brefs délais.

Cordialement,
L'équipe YAM Management`
      },
      relance_service_proprio: {
        subject: 'Relance service propriétaire - Lot {{lot_reference}}',
        body: `Bonjour,

Nous vous relançons concernant les informations nécessaires du service propriétaire pour le lot {{lot_reference}} ({{residence_nom}}).

{{notes}}

Merci de nous transmettre ces éléments rapidement.

Cordialement,
L'équipe YAM Management`
      },
      relance_cgp: {
        subject: 'Relance CGP - Lot {{lot_reference}}',
        body: `Bonjour,

Nous vous relançons concernant le dossier de financement pour le lot {{lot_reference}} ({{residence_nom}}).

Acquéreur : {{acquereur_nom}}

{{notes}}

Merci de nous tenir informés de l'avancement.

Cordialement,
L'équipe YAM Management`
      },
      compromis_signe: {
        subject: 'Compromis de vente signé - Lot {{lot_reference}}',
        body: `Bonjour,

Nous avons le plaisir de vous informer que le compromis de vente pour le lot {{lot_reference}} ({{residence_nom}}) a été signé.

Acquéreur : {{acquereur_nom}}
Date de signature : {{date}}

Prochaines étapes :
- Délai de rétractation (10 jours)
- Obtention du financement
- Préparation de l'acte authentique

{{notes}}

Cordialement,
L'équipe YAM Management`
      },
      acte_authentique: {
        subject: 'Acte authentique signé - Lot {{lot_reference}}',
        body: `Bonjour,

Nous avons le plaisir de vous informer que l'acte authentique pour le lot {{lot_reference}} ({{residence_nom}}) a été signé.

Acquéreur : {{acquereur_nom}}
Date de signature : {{date}}

Félicitations pour cette acquisition !

{{notes}}

Nous vous remercions pour votre confiance.

Cordialement,
L'équipe YAM Management`
      }
    };

    return templates[stepCode] || {
      subject: 'Étape {{step_label}} complétée - Lot {{lot_reference}}',
      body: `Bonjour,

L'étape {{step_label}} a été complétée pour le lot {{lot_reference}} de la résidence {{residence_nom}}.

{{notes}}

Cordialement,
L'équipe YAM Management`
    };
  };

  const handleEdit = (step) => {
    setEditingStep(step);
    const defaultTemplate = getDefaultTemplate(step.code);
    setFormData({
      email_subject: step.email_subject || defaultTemplate.subject,
      email_body: step.email_body || defaultTemplate.body,
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

  const handleEditSpecial = (template) => {
    setEditingSpecial(template);
    setSpecialFormData({
      email_subject: template.email_subject,
      email_body: template.email_body,
      is_active: template.is_active,
    });
  };

  const handleSubmitSpecial = async (e) => {
    e.preventDefault();

    if (!specialFormData.email_subject || !specialFormData.email_body) {
      toast.error('Le sujet et le corps de l\'email sont requis');
      return;
    }

    try {
      setSubmitting(true);

      const { error } = await supabase
        .from('email_templates_special')
        .update({
          email_subject: specialFormData.email_subject,
          email_body: specialFormData.email_body,
          is_active: specialFormData.is_active,
          updated_at: new Date().toISOString(),
        })
        .eq('id', editingSpecial.id);

      if (error) throw error;

      toast.success('Template spécial mis à jour avec succès');
      setEditingSpecial(null);
      loadSpecialTemplates();
    } catch (error) {
      console.error('Error updating special template:', error);
      toast.error('Erreur lors de la mise à jour du template');
    } finally {
      setSubmitting(false);
    }
  };

  const handleTestBirthdayEmail = async () => {
    try {
      setTestingBirthday(true);

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      const response = await fetch(`${supabaseUrl}/functions/v1/send-birthday-emails`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseAnonKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      });

      const result = await response.json();

      if (result.success) {
        toast.success(`Test terminé: ${result.sent || 0} email(s) envoyé(s)`);
      } else {
        toast.error(`Erreur: ${result.error || 'Erreur inconnue'}`);
      }
    } catch (error) {
      console.error('Error testing birthday email:', error);
      toast.error('Erreur lors du test');
    } finally {
      setTestingBirthday(false);
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
            Templates d'emails
          </h1>
          <p className="text-slate-500 mt-2">
            Configurez les emails automatiques envoyés par le système
          </p>
        </div>

        <Tabs defaultValue="workflow" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="workflow">Workflow dossier</TabsTrigger>
            <TabsTrigger value="special">
              <Cake className="w-4 h-4 mr-2" />
              Templates spéciaux
            </TabsTrigger>
          </TabsList>

          <TabsContent value="workflow" className="mt-6">
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
          </TabsContent>

          <TabsContent value="special" className="mt-6">
            <div className="grid gap-4">
              {specialTemplates.map((template) => (
                <Card key={template.id} className="border-none shadow-md">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="flex items-center gap-2">
                          <Cake className="w-5 h-5 text-amber-600" />
                          {template.label}
                          {template.is_active && (
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                              Activé
                            </Badge>
                          )}
                        </CardTitle>
                        <CardDescription className="mt-2">
                          {template.description}
                        </CardDescription>
                        <CardDescription className="mt-1">
                          {template.email_subject && (
                            <span className="text-slate-600">
                              Sujet: <span className="font-medium">{template.email_subject}</span>
                            </span>
                          )}
                        </CardDescription>
                      </div>
                      <div className="flex gap-2">
                        {template.code === 'birthday' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleTestBirthdayEmail}
                            disabled={testingBirthday}
                          >
                            {testingBirthday ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                                Test...
                              </>
                            ) : (
                              <>
                                <Play className="w-4 h-4 mr-2" />
                                Tester
                              </>
                            )}
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditSpecial(template)}
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          Éditer
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  {template.email_body && (
                    <CardContent>
                      <div className="bg-white rounded-lg p-4 border border-slate-200">
                        <p className="text-xs font-semibold text-slate-600 mb-2">Aperçu du message:</p>
                        <p className="text-sm text-slate-700 whitespace-pre-wrap line-clamp-3">
                          {template.email_body}
                        </p>
                      </div>
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={!!editingStep} onOpenChange={() => setEditingStep(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-white">
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
                    className="bg-white"
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

      <Dialog open={!!editingSpecial} onOpenChange={() => setEditingSpecial(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-white">
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center gap-2">
              <Cake className="w-6 h-6 text-amber-600" />
              {editingSpecial?.label}
            </DialogTitle>
            <DialogDescription>
              {editingSpecial?.description}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmitSpecial} className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200">
              <div>
                <Label className="text-base font-semibold">Activer ce template</Label>
                <p className="text-sm text-slate-500 mt-1">
                  Les emails seront envoyés automatiquement selon le déclencheur configuré
                </p>
              </div>
              <Switch
                checked={specialFormData.is_active}
                onCheckedChange={(checked) => setSpecialFormData({ ...specialFormData, is_active: checked })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="special_email_subject">Sujet de l'email *</Label>
              <Input
                id="special_email_subject"
                value={specialFormData.email_subject}
                onChange={(e) => setSpecialFormData({ ...specialFormData, email_subject: e.target.value })}
                placeholder="Ex: Joyeux anniversaire {{prenom}} !"
                required
                className="bg-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="special_email_body">Corps de l'email *</Label>
              <Textarea
                id="special_email_body"
                value={specialFormData.email_body}
                onChange={(e) => setSpecialFormData({ ...specialFormData, email_body: e.target.value })}
                rows={10}
                placeholder="Bonjour {{prenom}} {{nom}},&#10;&#10;Toute l'équipe vous souhaite un très joyeux anniversaire !&#10;&#10;Cordialement"
                required
                className="font-mono text-sm bg-white"
              />
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                Variables disponibles pour ce template
              </h4>
              <div className="text-sm text-blue-800 space-y-1">
                {editingSpecial?.variables_available && (() => {
                  const vars = typeof editingSpecial.variables_available === 'string'
                    ? JSON.parse(editingSpecial.variables_available)
                    : editingSpecial.variables_available;

                  if (Array.isArray(vars)) {
                    return vars.map((variable) => (
                      <p key={variable}>
                        <code className="bg-blue-100 px-1 rounded">{`{{${variable}}}`}</code> - {variable === 'prenom' ? 'Prénom de l\'acquéreur' : variable === 'nom' ? 'Nom de l\'acquéreur' : 'Email de l\'acquéreur'}
                      </p>
                    ));
                  } else if (typeof vars === 'object') {
                    return Object.entries(vars).map(([key, description]) => (
                      <p key={key}>
                        <code className="bg-blue-100 px-1 rounded">{`{{${key}}}`}</code> - {description}
                      </p>
                    ));
                  }
                  return null;
                })()}
              </div>
            </div>

            {editingSpecial?.code === 'birthday' && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <h4 className="font-semibold text-amber-900 mb-2 flex items-center gap-2">
                  <Cake className="w-4 h-4" />
                  Déclenchement automatique
                </h4>
                <p className="text-sm text-amber-800">
                  Cet email sera envoyé automatiquement chaque jour à 8h00 du matin aux acquéreurs dont c'est l'anniversaire.
                  Un CRON job vérifie quotidiennement les dates de naissance.
                </p>
              </div>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditingSpecial(null)}
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
