
import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Building2, User, Phone, Mail, MapPin, Briefcase, CheckCircle, Loader2 } from "lucide-react";
import { createPageUrl } from "@/utils";

export default function OnboardingPartenaire() {
  const [currentUser, setCurrentUser] = useState(null);
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  
  const [formData, setFormData] = useState({
    nom: "",
    contact_principal: "",
    email: "",
    telephone: "",
    adresse: "",
    type_partenaire: "cgp",
    zone_activite: "",
    specialite: "",
    statut: "actif",
  });

  useEffect(() => {
    base44.auth.me()
      .then((user) => {
        setCurrentUser(user);
        
        // Si l'utilisateur a déjà un partenaire_id, rediriger vers le dashboard
        if (user.partenaire_id) {
          window.location.href = createPageUrl("PartenairesDashboard");
        }
        
        // Pré-remplir le formulaire avec les données existantes
        if (user.email) {
          setFormData(prev => ({
            ...prev,
            email: user.email,
            contact_principal: user.full_name || "",
          }));
        }
      })
      .catch((error) => {
        console.error("Failed to fetch user:", error);
        setCurrentUser(null); // Explicitly set to null if fetching fails
      })
      .finally(() => setIsLoadingUser(false));
  }, []);

  const createPartenaireMutation = useMutation({
    mutationFn: (data) => base44.entities.Partenaire.create(data),
  });

  const updateUserMutation = useMutation({
    mutationFn: (data) => base44.auth.updateMe(data),
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // 1. Créer le partenaire
      const partenaireData = {
        ...formData,
        email: formData.email || currentUser.email,
        convention_signee: false,
        nombre_leads: 0,
        nombre_ventes: 0,
        ca_genere: 0,
      };

      const partenaire = await createPartenaireMutation.mutateAsync(partenaireData);

      // 2. Mettre à jour l'utilisateur
      await updateUserMutation.mutateAsync({
        partenaire_id: partenaire.id,
        role_custom: 'partenaire',
        onboarding_completed: true,
        options_max: 3,
        duree_option_jours: 5,
      });

      // 3. Recharger les données de l'utilisateur pour s'assurer que currentUser est à jour
      const updatedUser = await base44.auth.me();
      setCurrentUser(updatedUser);

      // 4. Afficher le message de succès
      setStep(3);

      // 5. Rediriger vers le dashboard partenaire après 2 secondes
      setTimeout(() => {
        window.location.href = createPageUrl("PartenairesDashboard");
      }, 2000);

    } catch (error) {
      console.error("Erreur lors de l'onboarding:", error);
      alert("Une erreur s'est produite. Veuillez réessayer.");
      setIsLoading(false);
    }
  };

  if (isLoadingUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1E40AF] via-[#1E3A8A] to-[#1E2A6A] flex items-center justify-center p-6">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-white animate-spin mx-auto mb-4" />
          <p className="text-white text-lg">Chargement de votre profil...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1E40AF] via-[#1E3A8A] to-[#1E2A6A] flex items-center justify-center p-6">
        <Card className="border-none shadow-2xl max-w-md">
          <CardContent className="text-center py-12">
            <p className="text-slate-600 mb-4">Impossible de charger votre profil ou vous n'êtes pas connecté.</p>
            <Button onClick={() => base44.auth.logout()} className="bg-[#1E40AF]">
              Se reconnecter
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1E40AF] via-[#1E3A8A] to-[#1E2A6A] flex items-center justify-center p-6">
      <div className="max-w-3xl w-full">
        {step === 1 && (
          <Card className="border-none shadow-2xl">
            <CardHeader className="text-center pb-6 pt-8">
              <div className="w-20 h-20 bg-gradient-to-br from-[#1E40AF] to-[#1E3A8A] rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Building2 className="w-10 h-10 text-white" />
              </div>
              <CardTitle className="text-3xl font-bold text-[#1E40AF] mb-2">
                Bienvenue sur Y'am Asset Management ! 🎉
              </CardTitle>
              <p className="text-slate-600 text-lg">
                Bonjour <span className="font-semibold text-[#1E40AF]">{currentUser.full_name}</span>
              </p>
              <p className="text-slate-500 mt-4">
                Pour commencer, nous avons besoin de quelques informations pour créer votre profil partenaire.
              </p>
            </CardHeader>
            <CardContent className="pb-8">
              <div className="space-y-4 mb-6">
                <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-lg">
                  <CheckCircle className="w-6 h-6 text-blue-600 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-blue-900">Accès à tous les lots disponibles</p>
                    <p className="text-sm text-blue-700">Consultez notre portefeuille LMNP</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 bg-green-50 rounded-lg">
                  <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-green-900">Gestion de vos acquéreurs</p>
                    <p className="text-sm text-green-700">Suivez vos clients en temps réel</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 bg-amber-50 rounded-lg">
                  <CheckCircle className="w-6 h-6 text-amber-600 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-amber-900">Système d'options</p>
                    <p className="text-sm text-amber-700">Réservez des lots pour vos clients</p>
                  </div>
                </div>
              </div>
              <Button 
                onClick={() => setStep(2)} 
                className="w-full bg-[#1E40AF] hover:bg-[#1E3A8A] text-lg py-6"
              >
                Commencer la configuration
              </Button>
            </CardContent>
          </Card>
        )}

        {step === 2 && (
          <Card className="border-none shadow-2xl">
            <CardHeader className="border-b border-slate-100 pb-6">
              <CardTitle className="text-2xl font-bold text-[#1E40AF] flex items-center gap-3">
                <User className="w-7 h-7" />
                Vos informations de partenaire
              </CardTitle>
              <p className="text-slate-500 mt-2">
                Renseignez les informations de votre entreprise ou de votre activité
              </p>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Informations principales */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-[#F59E0B]" />
                      Nom de votre entreprise / Cabinet <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      required
                      placeholder="Ex: Cabinet Patrimoine Conseil"
                      value={formData.nom}
                      onChange={(e) => handleInputChange('nom', e.target.value)}
                      className="border-slate-300 focus:border-[#1E40AF]"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <User className="w-4 h-4 text-[#F59E0B]" />
                      Nom du contact principal
                    </Label>
                    <Input
                      placeholder="Ex: Jean Dupont"
                      value={formData.contact_principal}
                      onChange={(e) => handleInputChange('contact_principal', e.target.value)}
                      className="border-slate-300 focus:border-[#1E40AF]"
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-[#F59E0B]" />
                        Email
                      </Label>
                      <Input
                        type="email"
                        placeholder={currentUser.email}
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className="border-slate-300 focus:border-[#1E40AF]"
                      />
                      <p className="text-xs text-slate-500">Par défaut: {currentUser.email}</p>
                    </div>

                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-[#F59E0B]" />
                        Téléphone
                      </Label>
                      <Input
                        type="tel"
                        placeholder="Ex: 06 12 34 56 78"
                        value={formData.telephone}
                        onChange={(e) => handleInputChange('telephone', e.target.value)}
                        className="border-slate-300 focus:border-[#1E40AF]"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-[#F59E0B]" />
                      Adresse
                    </Label>
                    <Input
                      placeholder="Ex: 12 rue de la République, 75001 Paris"
                      value={formData.adresse}
                      onChange={(e) => handleInputChange('adresse', e.target.value)}
                      className="border-slate-300 focus:border-[#1E40AF]"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Briefcase className="w-4 h-4 text-[#F59E0B]" />
                      Type de partenaire <span className="text-red-500">*</span>
                    </Label>
                    <Select 
                      value={formData.type_partenaire} 
                      onValueChange={(value) => handleInputChange('type_partenaire', value)}
                    >
                      <SelectTrigger className="border-slate-300">
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
                    <Label>Zone d'activité</Label>
                    <Input
                      placeholder="Ex: Île-de-France, National..."
                      value={formData.zone_activite}
                      onChange={(e) => handleInputChange('zone_activite', e.target.value)}
                      className="border-slate-300 focus:border-[#1E40AF]"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Spécialité</Label>
                    <Textarea
                      placeholder="Ex: Investissement LMNP, Défiscalisation, Patrimoine immobilier..."
                      value={formData.specialite}
                      onChange={(e) => handleInputChange('specialite', e.target.value)}
                      className="border-slate-300 focus:border-[#1E40AF] min-h-[80px]"
                    />
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep(1)}
                    className="flex-1"
                    disabled={isLoading}
                  >
                    Retour
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 bg-[#1E40AF] hover:bg-[#1E3A8A]"
                    disabled={isLoading || !formData.nom}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Création en cours...
                      </>
                    ) : (
                      "Créer mon compte partenaire"
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {step === 3 && (
          <Card className="border-none shadow-2xl">
            <CardContent className="text-center py-12">
              <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
                <CheckCircle className="w-14 h-14 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-green-600 mb-3">
                Félicitations ! 🎉
              </h2>
              <p className="text-lg text-slate-700 mb-2">
                Votre compte partenaire a été créé avec succès
              </p>
              <p className="text-slate-500">
                Redirection vers votre espace partenaire...
              </p>
              <div className="mt-6">
                <Loader2 className="w-8 h-8 text-[#1E40AF] animate-spin mx-auto" />
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
