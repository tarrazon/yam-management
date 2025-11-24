import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Copy, Check, Code, Download, Key, FileJson, FileSpreadsheet, Mail, Users, MessageSquare, Calendar, Workflow } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Separator } from "@/components/ui/separator";

export default function APIDocumentation() {
  const { session } = useAuth();
  const [copiedEndpoint, setCopiedEndpoint] = useState(null);

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const apiEndpoint = `${supabaseUrl}/functions/v1`;

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedEndpoint(id);
    setTimeout(() => setCopiedEndpoint(null), 2000);
  };

  const endpoints = [
    {
      category: "Export de données",
      icon: Download,
      color: "blue",
      items: [
        {
          id: "export-lots",
          title: "Export des lots",
          method: "GET",
          url: `${apiEndpoint}/export-lots`,
          description: "Exporte la liste des lots LMNP en JSON ou CSV",
          params: [
            { name: "format", type: "string", required: false, description: "Format de sortie : 'json' (défaut) ou 'csv'" },
            { name: "statut", type: "string", required: false, description: "Filtre par statut : 'disponible', 'sous_option', 'reserve', 'vendu'" },
            { name: "residence_id", type: "uuid", required: false, description: "UUID de la résidence" },
            { name: "partenaire_id", type: "uuid", required: false, description: "UUID du partenaire" },
          ],
          examples: [
            { title: "Tous les lots", url: `${apiEndpoint}/export-lots` },
            { title: "Lots disponibles", url: `${apiEndpoint}/export-lots?statut=disponible` },
            { title: "Export CSV", url: `${apiEndpoint}/export-lots?format=csv` },
          ]
        }
      ]
    },
    {
      category: "Gestion des utilisateurs",
      icon: Users,
      color: "purple",
      items: [
        {
          id: "create-user",
          title: "Créer un utilisateur",
          method: "POST",
          url: `${apiEndpoint}/create-user`,
          description: "Crée un nouvel utilisateur dans le système avec profil et permissions",
          bodyExample: {
            email: "utilisateur@exemple.com",
            password: "MotDePasseSecurise123!",
            role_custom: "partenaire",
            nom: "Dupont",
            prenom: "Jean",
            telephone: "+33612345678"
          }
        },
        {
          id: "reset-password",
          title: "Réinitialiser mot de passe",
          method: "POST",
          url: `${apiEndpoint}/send-password-reset`,
          description: "Envoie un email de réinitialisation de mot de passe",
          bodyExample: {
            email: "utilisateur@exemple.com"
          }
        },
        {
          id: "reset-password-token",
          title: "Valider nouveau mot de passe",
          method: "POST",
          url: `${apiEndpoint}/reset-password-with-token`,
          description: "Réinitialise le mot de passe avec un token valide",
          bodyExample: {
            token: "TOKEN_RECU_PAR_EMAIL",
            password: "NouveauMotDePasse123!"
          }
        }
      ]
    },
    {
      category: "Notifications par email",
      icon: Mail,
      color: "orange",
      items: [
        {
          id: "send-birthday",
          title: "Emails d'anniversaire",
          method: "POST",
          url: `${apiEndpoint}/send-birthday-emails`,
          description: "Envoie automatiquement des emails d'anniversaire aux clients (à planifier en CRON)",
          auth: "Service role required"
        },
        {
          id: "send-option",
          title: "Notification d'option",
          method: "POST",
          url: `${apiEndpoint}/send-option-notification`,
          description: "Envoie une notification email lors de la pose d'une option sur un lot",
          bodyExample: {
            option_id: "uuid-option",
            lot_reference: "LOT-001",
            residence_nom: "Résidence du Parc",
            partenaire_nom: "Dupont",
            partenaire_prenom: "Jean",
            commercial_email: "commercial@exemple.com"
          }
        },
        {
          id: "send-workflow",
          title: "Notification workflow",
          method: "POST",
          url: `${apiEndpoint}/send-workflow-notification`,
          description: "Envoie un email dans le cadre d'un workflow automatisé",
          bodyExample: {
            lot_id: "uuid-lot",
            step_name: "signature_compromis",
            recipient_email: "destinataire@exemple.com",
            template_variables: {
              nom_acquereur: "Martin",
              reference_lot: "LOT-001",
              date_signature: "2024-01-15"
            }
          }
        }
      ]
    },
    {
      category: "Automatisations",
      icon: Workflow,
      color: "green",
      items: [
        {
          id: "expire-options",
          title: "Expiration des options",
          method: "POST",
          url: `${apiEndpoint}/expire-options-cron`,
          description: "Expire automatiquement les options dépassées et libère les lots (à planifier en CRON)",
          auth: "Service role required"
        }
      ]
    }
  ];

  const curlExample = `# Export des lots disponibles en CSV
curl -X GET "${apiEndpoint}/export-lots?statut=disponible&format=csv" \\
  -H "Authorization: Bearer VOTRE_TOKEN" \\
  -H "Content-Type: application/json"

# Créer un nouvel utilisateur
curl -X POST "${apiEndpoint}/create-user" \\
  -H "Authorization: Bearer VOTRE_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{
    "email": "nouveau@exemple.com",
    "password": "SecurePass123!",
    "role_custom": "partenaire",
    "nom": "Dupont",
    "prenom": "Jean"
  }'

# Envoyer un email de réinitialisation
curl -X POST "${apiEndpoint}/send-password-reset" \\
  -H "Authorization: Bearer VOTRE_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{"email": "utilisateur@exemple.com"}'`;

  const jsExample = `// Export des lots disponibles
const exportLots = async () => {
  const response = await fetch('${apiEndpoint}/export-lots?statut=disponible', {
    method: 'GET',
    headers: {
      'Authorization': 'Bearer VOTRE_TOKEN',
      'Content-Type': 'application/json'
    }
  });
  const data = await response.json();
  return data;
};

// Créer un utilisateur
const createUser = async (userData) => {
  const response = await fetch('${apiEndpoint}/create-user', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer VOTRE_TOKEN',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      email: userData.email,
      password: userData.password,
      role_custom: 'partenaire',
      nom: userData.nom,
      prenom: userData.prenom
    })
  });
  return await response.json();
};

// Réinitialiser un mot de passe
const resetPassword = async (email) => {
  const response = await fetch('${apiEndpoint}/send-password-reset', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer VOTRE_TOKEN',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ email })
  });
  return await response.json();
};`;

  const pythonExample = `import requests

# Configuration
BASE_URL = "${apiEndpoint}"
HEADERS = {
    "Authorization": "Bearer VOTRE_TOKEN",
    "Content-Type": "application/json"
}

# Export des lots disponibles
def export_lots(statut="disponible", format="json"):
    url = f"{BASE_URL}/export-lots"
    params = {"statut": statut, "format": format}
    response = requests.get(url, headers=HEADERS, params=params)
    return response.json()

# Créer un utilisateur
def create_user(email, password, role, nom, prenom):
    url = f"{BASE_URL}/create-user"
    data = {
        "email": email,
        "password": password,
        "role_custom": role,
        "nom": nom,
        "prenom": prenom
    }
    response = requests.post(url, headers=HEADERS, json=data)
    return response.json()

# Réinitialiser un mot de passe
def reset_password(email):
    url = f"{BASE_URL}/send-password-reset"
    data = {"email": email}
    response = requests.post(url, headers=HEADERS, json=data)
    return response.json()

# Utilisation
lots = export_lots(statut="disponible")
print(f"Nombre de lots: {lots.get('count')}")`;

  const getMethodColor = (method) => {
    const colors = {
      GET: "bg-green-50 text-green-700 border-green-200",
      POST: "bg-blue-50 text-blue-700 border-blue-200",
      PUT: "bg-orange-50 text-orange-700 border-orange-200",
      DELETE: "bg-red-50 text-red-700 border-red-200"
    };
    return colors[method] || "bg-slate-50 text-slate-700 border-slate-200";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
              <Code className="w-8 h-8 text-[#1E40AF]" />
              Documentation API YAM
            </h1>
            <p className="text-slate-600 mt-2">
              API REST complète pour l'intégration avec la plateforme YAM Management
            </p>
          </div>
        </div>

        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <Key className="w-5 h-5 text-amber-600 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-amber-900 mb-2">Authentification requise</h3>
                <p className="text-sm text-amber-800 mb-3">
                  Toutes les requêtes API nécessitent un token Bearer dans l'en-tête Authorization :
                </p>
                <div className="bg-slate-900 text-slate-100 p-3 rounded-lg font-mono text-sm mb-3">
                  Authorization: Bearer VOTRE_TOKEN
                </div>
                {session?.access_token && (
                  <div>
                    <p className="text-sm font-semibold text-amber-900 mb-2">Votre token actuel :</p>
                    <div className="bg-white border border-amber-200 p-3 rounded-lg flex items-center justify-between">
                      <code className="text-xs text-slate-700 break-all flex-1 mr-2">
                        {session.access_token}
                      </code>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyToClipboard(session.access_token, "token")}
                        className="flex-shrink-0"
                      >
                        {copiedEndpoint === "token" ? (
                          <Check className="w-4 h-4 text-green-600" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                    <p className="text-xs text-amber-700 mt-2">
                      ⚠️ Ce token expire après un certain temps. Ne le partagez jamais publiquement.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {endpoints.map((category, idx) => {
          const Icon = category.icon;
          return (
            <Card key={idx}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon className={`w-5 h-5 text-${category.color}-600`} />
                  {category.category}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {category.items.map((endpoint) => (
                  <div key={endpoint.id} className="border rounded-lg p-5 space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold text-lg text-slate-900">{endpoint.title}</h4>
                          <Badge variant="outline" className={getMethodColor(endpoint.method)}>
                            {endpoint.method}
                          </Badge>
                          {endpoint.auth === "Service role required" && (
                            <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                              Service Role
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-slate-600 mb-3">{endpoint.description}</p>
                        <div className="bg-slate-50 p-3 rounded font-mono text-xs break-all flex items-center justify-between">
                          <span className="flex-1">{endpoint.url}</span>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => copyToClipboard(endpoint.url, endpoint.id)}
                            className="ml-2 flex-shrink-0"
                          >
                            {copiedEndpoint === endpoint.id ? (
                              <Check className="w-4 h-4 text-green-600" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>

                    {endpoint.params && (
                      <div className="space-y-3 border-t pt-4">
                        <h5 className="font-semibold text-sm text-slate-700">Paramètres</h5>
                        {endpoint.params.map((param, pidx) => (
                          <div key={pidx} className="border-l-4 border-blue-500 pl-4">
                            <div className="flex items-center gap-2 mb-1">
                              <code className="bg-slate-100 px-2 py-1 rounded text-sm font-semibold">
                                {param.name}
                              </code>
                              <Badge variant="secondary" className="text-xs">{param.type}</Badge>
                              {!param.required && (
                                <Badge variant="outline" className="text-xs">optionnel</Badge>
                              )}
                            </div>
                            <p className="text-sm text-slate-600">{param.description}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {endpoint.bodyExample && (
                      <div className="space-y-2 border-t pt-4">
                        <h5 className="font-semibold text-sm text-slate-700">Exemple de body</h5>
                        <div className="bg-slate-900 text-slate-100 p-3 rounded-lg font-mono text-xs overflow-x-auto">
                          <pre>{JSON.stringify(endpoint.bodyExample, null, 2)}</pre>
                        </div>
                      </div>
                    )}

                    {endpoint.examples && (
                      <div className="space-y-2 border-t pt-4">
                        <h5 className="font-semibold text-sm text-slate-700">Exemples d'utilisation</h5>
                        {endpoint.examples.map((ex, eidx) => (
                          <div key={eidx} className="bg-slate-50 p-3 rounded space-y-1">
                            <p className="text-xs font-semibold text-slate-700">{ex.title}</p>
                            <div className="flex items-center justify-between gap-2">
                              <code className="text-xs break-all flex-1">{ex.url}</code>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => copyToClipboard(ex.url, `${endpoint.id}-ex-${eidx}`)}
                                className="flex-shrink-0"
                              >
                                {copiedEndpoint === `${endpoint.id}-ex-${eidx}` ? (
                                  <Check className="w-3 h-3 text-green-600" />
                                ) : (
                                  <Copy className="w-3 h-3" />
                                )}
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          );
        })}

        <Card>
          <CardHeader>
            <CardTitle>Exemples de code</CardTitle>
            <CardDescription>
              Intégrez l'API dans vos applications avec ces exemples
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="curl" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="curl">cURL</TabsTrigger>
                <TabsTrigger value="javascript">JavaScript</TabsTrigger>
                <TabsTrigger value="python">Python</TabsTrigger>
              </TabsList>

              <TabsContent value="curl" className="space-y-2">
                <div className="bg-slate-900 text-slate-100 p-4 rounded-lg font-mono text-xs overflow-x-auto">
                  <pre>{curlExample}</pre>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => copyToClipboard(curlExample, "curl")}
                  className="w-full"
                >
                  {copiedEndpoint === "curl" ? (
                    <>
                      <Check className="w-4 h-4 mr-2 text-green-600" />
                      Copié !
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-2" />
                      Copier le code
                    </>
                  )}
                </Button>
              </TabsContent>

              <TabsContent value="javascript" className="space-y-2">
                <div className="bg-slate-900 text-slate-100 p-4 rounded-lg font-mono text-xs overflow-x-auto">
                  <pre>{jsExample}</pre>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => copyToClipboard(jsExample, "js")}
                  className="w-full"
                >
                  {copiedEndpoint === "js" ? (
                    <>
                      <Check className="w-4 h-4 mr-2 text-green-600" />
                      Copié !
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-2" />
                      Copier le code
                    </>
                  )}
                </Button>
              </TabsContent>

              <TabsContent value="python" className="space-y-2">
                <div className="bg-slate-900 text-slate-100 p-4 rounded-lg font-mono text-xs overflow-x-auto">
                  <pre>{pythonExample}</pre>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => copyToClipboard(pythonExample, "python")}
                  className="w-full"
                >
                  {copiedEndpoint === "python" ? (
                    <>
                      <Check className="w-4 h-4 mr-2 text-green-600" />
                      Copié !
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-2" />
                      Copier le code
                    </>
                  )}
                </Button>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Exemples de réponses</CardTitle>
            <CardDescription>
              Structures de réponses typiques de l'API
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold text-sm mb-2">Réponse réussie (Export de lots)</h4>
              <div className="bg-slate-900 text-slate-100 p-4 rounded-lg font-mono text-xs overflow-x-auto">
                <pre>{`{
  "success": true,
  "count": 42,
  "data": [
    {
      "id": "uuid-123",
      "reference": "LOT001",
      "type_lot": "T2",
      "statut": "disponible",
      "prix_ht": 150000,
      "prix_ttc": 165000,
      "surface": 45.5,
      "etage": 2,
      "nombre_pieces": 2,
      "residences_gestion": {
        "nom": "Résidence du Marais",
        "ville": "Paris",
        "code_postal": "75004",
        "adresse": "15 rue des Archives"
      },
      "acquereurs_lmnp": null,
      "partenaires": {
        "nom": "Dupont",
        "prenom": "Jean",
        "societe": "Immobilier Partners"
      }
    }
  ]
}`}</pre>
              </div>
            </div>

            <Separator />

            <div>
              <h4 className="font-semibold text-sm mb-2">Réponse d'erreur</h4>
              <div className="bg-slate-900 text-slate-100 p-4 rounded-lg font-mono text-xs overflow-x-auto">
                <pre>{`{
  "success": false,
  "error": "Authentication required",
  "message": "Token d'authentification invalide ou expiré"
}`}</pre>
              </div>
            </div>

            <Separator />

            <div>
              <h4 className="font-semibold text-sm mb-2">Réponse de création d'utilisateur</h4>
              <div className="bg-slate-900 text-slate-100 p-4 rounded-lg font-mono text-xs overflow-x-auto">
                <pre>{`{
  "success": true,
  "message": "Utilisateur créé avec succès",
  "user": {
    "id": "uuid-456",
    "email": "nouveau@exemple.com",
    "role_custom": "partenaire"
  },
  "profile": {
    "id": "uuid-789",
    "nom": "Dupont",
    "prenom": "Jean",
    "telephone": "+33612345678"
  }
}`}</pre>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <MessageSquare className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h3 className="font-semibold text-blue-900 mb-2">Besoin d'aide ?</h3>
                <p className="text-sm text-blue-800">
                  Pour toute question concernant l'API ou pour signaler un problème, contactez l'équipe technique YAM.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
