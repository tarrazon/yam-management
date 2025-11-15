import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Copy, Check, Code, Download, Key, FileJson, FileSpreadsheet } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Separator } from "@/components/ui/separator";

export default function APIDocumentation() {
  const { session } = useAuth();
  const [copiedEndpoint, setCopiedEndpoint] = useState(null);

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const apiEndpoint = `${supabaseUrl}/functions/v1/export-lots`;

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedEndpoint(id);
    setTimeout(() => setCopiedEndpoint(null), 2000);
  };

  const examples = [
    {
      id: "all",
      title: "Tous les lots",
      url: `${apiEndpoint}`,
      description: "Récupère tous les lots auxquels vous avez accès",
    },
    {
      id: "disponible",
      title: "Lots disponibles",
      url: `${apiEndpoint}?statut=disponible`,
      description: "Filtre uniquement les lots avec le statut 'disponible'",
    },
    {
      id: "residence",
      title: "Lots d'une résidence",
      url: `${apiEndpoint}?residence_id=UUID_RESIDENCE`,
      description: "Filtre les lots par résidence (remplacer UUID_RESIDENCE)",
    },
    {
      id: "csv",
      title: "Export CSV",
      url: `${apiEndpoint}?format=csv`,
      description: "Télécharge les données au format CSV",
    },
    {
      id: "combined",
      title: "Combinaison de filtres",
      url: `${apiEndpoint}?statut=disponible&format=csv`,
      description: "Combine plusieurs paramètres (statut + format)",
    },
  ];

  const curlExample = `curl -X GET "${apiEndpoint}?statut=disponible" \\
  -H "Authorization: Bearer VOTRE_TOKEN" \\
  -H "Content-Type: application/json"`;

  const jsExample = `const response = await fetch('${apiEndpoint}?statut=disponible', {
  method: 'GET',
  headers: {
    'Authorization': 'Bearer VOTRE_TOKEN',
    'Content-Type': 'application/json'
  }
});

const data = await response.json();
console.log(data);`;

  const pythonExample = `import requests

url = "${apiEndpoint}"
headers = {
    "Authorization": "Bearer VOTRE_TOKEN",
    "Content-Type": "application/json"
}
params = {
    "statut": "disponible"
}

response = requests.get(url, headers=headers, params=params)
data = response.json()
print(data)`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
              <Code className="w-8 h-8 text-[#1E40AF]" />
              Documentation API
            </h1>
            <p className="text-slate-600 mt-2">
              API REST pour exporter les lots en JSON ou CSV
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="w-5 h-5 text-[#F59E0B]" />
              Authentification
            </CardTitle>
            <CardDescription>
              Toutes les requêtes API nécessitent une authentification via token Bearer
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-slate-600 mb-2">
                Vous devez inclure votre token d'authentification dans l'en-tête de chaque requête :
              </p>
              <div className="bg-slate-900 text-slate-100 p-4 rounded-lg font-mono text-sm">
                Authorization: Bearer VOTRE_TOKEN
              </div>
            </div>

            {session?.access_token && (
              <div>
                <p className="text-sm font-semibold text-slate-700 mb-2">Votre token actuel :</p>
                <div className="bg-amber-50 border border-amber-200 p-3 rounded-lg flex items-center justify-between">
                  <code className="text-xs text-slate-700 break-all flex-1">
                    {session.access_token}
                  </code>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => copyToClipboard(session.access_token, "token")}
                    className="ml-2 flex-shrink-0"
                  >
                    {copiedEndpoint === "token" ? (
                      <Check className="w-4 h-4 text-green-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </div>
                <p className="text-xs text-amber-700 mt-2">
                  ⚠️ Ce token expire. Ne le partagez jamais publiquement.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="w-5 h-5 text-[#1E40AF]" />
              Endpoint d'export
            </CardTitle>
            <CardDescription>
              URL de base pour l'export des lots
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-slate-900 text-slate-100 p-4 rounded-lg font-mono text-sm flex items-center justify-between">
              <span className="break-all">{apiEndpoint}</span>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => copyToClipboard(apiEndpoint, "endpoint")}
                className="ml-2 text-white hover:bg-slate-800"
              >
                {copiedEndpoint === "endpoint" ? (
                  <Check className="w-4 h-4 text-green-400" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </div>
            <div className="mt-4 flex gap-2">
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                GET
              </Badge>
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                Authentification requise
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Paramètres de requête</CardTitle>
            <CardDescription>
              Paramètres optionnels pour filtrer et formater les résultats
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="border-l-4 border-blue-500 pl-4">
                <div className="flex items-center gap-2 mb-1">
                  <code className="bg-slate-100 px-2 py-1 rounded text-sm font-semibold">format</code>
                  <Badge variant="secondary" className="text-xs">optionnel</Badge>
                </div>
                <p className="text-sm text-slate-600">
                  Format de sortie : <code className="bg-slate-100 px-1 rounded">json</code> (défaut) ou <code className="bg-slate-100 px-1 rounded">csv</code>
                </p>
              </div>

              <div className="border-l-4 border-blue-500 pl-4">
                <div className="flex items-center gap-2 mb-1">
                  <code className="bg-slate-100 px-2 py-1 rounded text-sm font-semibold">statut</code>
                  <Badge variant="secondary" className="text-xs">optionnel</Badge>
                </div>
                <p className="text-sm text-slate-600">
                  Filtre par statut : <code className="bg-slate-100 px-1 rounded">disponible</code>, <code className="bg-slate-100 px-1 rounded">sous_option</code>, <code className="bg-slate-100 px-1 rounded">reserve</code>, <code className="bg-slate-100 px-1 rounded">vendu</code>
                </p>
              </div>

              <div className="border-l-4 border-blue-500 pl-4">
                <div className="flex items-center gap-2 mb-1">
                  <code className="bg-slate-100 px-2 py-1 rounded text-sm font-semibold">residence_id</code>
                  <Badge variant="secondary" className="text-xs">optionnel</Badge>
                </div>
                <p className="text-sm text-slate-600">
                  UUID de la résidence pour filtrer les lots d'une résidence spécifique
                </p>
              </div>

              <div className="border-l-4 border-blue-500 pl-4">
                <div className="flex items-center gap-2 mb-1">
                  <code className="bg-slate-100 px-2 py-1 rounded text-sm font-semibold">partenaire_id</code>
                  <Badge variant="secondary" className="text-xs">optionnel</Badge>
                </div>
                <p className="text-sm text-slate-600">
                  UUID du partenaire pour filtrer les lots d'un partenaire spécifique
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Exemples de requêtes</CardTitle>
            <CardDescription>
              URLs prêtes à l'emploi pour différents cas d'usage
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {examples.map((example) => (
              <div key={example.id} className="border rounded-lg p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-slate-900">{example.title}</h4>
                  {example.id.includes("csv") ? (
                    <FileSpreadsheet className="w-5 h-5 text-green-600" />
                  ) : (
                    <FileJson className="w-5 h-5 text-blue-600" />
                  )}
                </div>
                <p className="text-sm text-slate-600">{example.description}</p>
                <div className="bg-slate-50 p-3 rounded font-mono text-xs break-all flex items-start justify-between gap-2">
                  <span className="flex-1">{example.url}</span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => copyToClipboard(example.url, example.id)}
                    className="flex-shrink-0"
                  >
                    {copiedEndpoint === example.id ? (
                      <Check className="w-4 h-4 text-green-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Exemples de code</CardTitle>
            <CardDescription>
              Intégrez l'API dans vos applications
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
            <CardTitle>Réponse JSON</CardTitle>
            <CardDescription>
              Structure de la réponse en format JSON
            </CardDescription>
          </CardHeader>
          <CardContent>
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
