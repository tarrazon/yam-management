import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, FileCode, RefreshCw, Copy, Check } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { createPageUrl } from "@/utils";

export default function ExportXML() {
  const [xmlContent, setXmlContent] = useState("");
  const [copied, setCopied] = useState(false);

  const { data: lots = [], isLoading, refetch } = useQuery({
    queryKey: ['lots_export'],
    queryFn: () => base44.entities.LotLMNP.list(),
  });

  const { data: residences = [] } = useQuery({
    queryKey: ['residences_export'],
    queryFn: () => base44.entities.ResidenceGestion.list(),
  });

  useEffect(() => {
    if (lots.length > 0) {
      generateXML();
    }
  }, [lots, residences]);

  const generateXML = () => {
    // Filtrer uniquement les lots publiés sur WordPress
    const lotsPublies = lots.filter(lot => lot.en_ligne_wordpress === true);

    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<lots>\n';
    xml += `  <generated_date>${new Date().toISOString()}</generated_date>\n`;
    xml += `  <total_lots>${lotsPublies.length}</total_lots>\n`;

    lotsPublies.forEach(lot => {
      const residence = residences.find(r => r.id === lot.residence_id);
      
      xml += '  <lot>\n';
      xml += `    <reference><![CDATA[${lot.reference || ''}]]></reference>\n`;
      xml += `    <statut>${lot.statut || ''}</statut>\n`;
      
      // Résidence
      xml += '    <residence>\n';
      xml += `      <nom><![CDATA[${lot.residence_nom || ''}]]></nom>\n`;
      xml += `      <ville><![CDATA[${residence?.ville || ''}]]></ville>\n`;
      xml += `      <code_postal>${residence?.code_postal || ''}</code_postal>\n`;
      xml += `      <adresse><![CDATA[${residence?.adresse || ''}]]></adresse>\n`;
      xml += `      <type>${lot.type_residence || ''}</type>\n`;
      xml += '    </residence>\n';

      // Caractéristiques
      xml += '    <caracteristiques>\n';
      xml += `      <typologie>${lot.typologie || ''}</typologie>\n`;
      xml += `      <surface>${lot.surface || 0}</surface>\n`;
      xml += `      <etage>${lot.etage || ''}</etage>\n`;
      xml += `      <orientation>${lot.orientation || ''}</orientation>\n`;
      xml += `      <mobilier_inclus>${lot.mobilier_inclus ? 'oui' : 'non'}</mobilier_inclus>\n`;
      xml += '    </caracteristiques>\n';

      // Financier
      xml += '    <financier>\n';
      xml += `      <prix_net_vendeur>${lot.prix_net_vendeur || 0}</prix_net_vendeur>\n`;
      xml += `      <honoraires>${lot.honoraires || 0}</honoraires>\n`;
      xml += `      <prix_fai>${lot.prix_fai || 0}</prix_fai>\n`;
      xml += `      <loyer_mensuel>${lot.loyer_mensuel || 0}</loyer_mensuel>\n`;
      xml += `      <rentabilite>${lot.rentabilite || 0}</rentabilite>\n`;
      xml += '    </financier>\n';

      // Description
      if (lot.description) {
        xml += `    <description><![CDATA[${lot.description}]]></description>\n`;
      }

      // Photos
      if (lot.photos && lot.photos.length > 0) {
        xml += '    <photos>\n';
        lot.photos.forEach((photo, index) => {
          xml += `      <photo position="${index + 1}">${photo}</photo>\n`;
        });
        xml += '    </photos>\n';
      }

      // Gestionnaire
      if (lot.gestionnaire_nom) {
        xml += '    <gestionnaire>\n';
        xml += `      <nom><![CDATA[${lot.gestionnaire_nom}]]></nom>\n`;
        xml += `      <contact>${lot.gestionnaire_contact || ''}</contact>\n`;
        xml += '    </gestionnaire>\n';
      }

      // Dates
      xml += '    <dates>\n';
      if (lot.date_mise_en_ligne) {
        xml += `      <mise_en_ligne>${lot.date_mise_en_ligne}</mise_en_ligne>\n`;
      }
      xml += `      <derniere_modification>${lot.updated_date || ''}</derniere_modification>\n`;
      xml += '    </dates>\n';

      xml += '  </lot>\n';
    });

    xml += '</lots>';

    setXmlContent(xml);
  };

  const downloadXML = () => {
    const blob = new Blob([xmlContent], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `lots_wordpress_${new Date().toISOString().split('T')[0]}.xml`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(xmlContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Erreur lors de la copie:', err);
    }
  };

  const lotsPublies = lots.filter(lot => lot.en_ligne_wordpress === true);

  return (
    <div className="p-6 md:p-8 bg-[#F9FAFB] min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <FileCode className="w-8 h-8 text-[#1E40AF]" />
            <h1 className="text-3xl font-bold text-[#1E40AF] tracking-tight">Export XML pour WordPress</h1>
          </div>
          <p className="text-slate-500">
            {lotsPublies.length} lots publiés disponibles pour l'export
          </p>
        </div>

        {/* Informations */}
        <Card className="mb-6 bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-lg text-blue-900">📋 Comment utiliser ce flux XML</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-blue-800 space-y-2">
            <p>✅ <strong>Option 1 - Import manuel :</strong> Téléchargez le fichier XML et importez-le dans WordPress</p>
            <p>✅ <strong>Option 2 - API REST :</strong> Utilisez l'API Base44 directement depuis WordPress (recommandé pour synchronisation automatique)</p>
            <p>💡 Seuls les lots marqués "Publié sur WordPress" sont inclus dans l'export</p>
            <p>🔄 Le flux se génère automatiquement avec les données les plus récentes à chaque ouverture de cette page</p>
          </CardContent>
        </Card>

        {/* Statistiques */}
        <div className="grid md:grid-cols-3 gap-6 mb-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-500">Total lots</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-[#1E40AF]">{lots.length}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-500">Lots publiés</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-green-600">{lotsPublies.length}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-500">Disponibles</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-[#F59E0B]">
                {lotsPublies.filter(l => l.statut === 'disponible').length}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Actions</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <Button
              onClick={() => refetch()}
              disabled={isLoading}
              className="bg-[#1E40AF] hover:bg-[#1E3A8A]"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Actualiser les données
            </Button>
            <Button
              onClick={downloadXML}
              disabled={!xmlContent || isLoading}
              className="bg-green-600 hover:bg-green-700"
            >
              <Download className="w-4 h-4 mr-2" />
              Télécharger XML
            </Button>
            <Button
              onClick={copyToClipboard}
              disabled={!xmlContent || isLoading}
              variant="outline"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 mr-2 text-green-600" />
                  Copié !
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 mr-2" />
                  Copier XML
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Prévisualisation XML */}
        <Card>
          <CardHeader>
            <CardTitle>Prévisualisation du flux XML</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-12">
                <RefreshCw className="w-8 h-8 animate-spin text-[#1E40AF] mx-auto mb-4" />
                <p className="text-slate-500">Chargement des données...</p>
              </div>
            ) : xmlContent ? (
              <div className="relative">
                <Textarea
                  value={xmlContent}
                  readOnly
                  className="font-mono text-xs h-96 resize-none"
                />
              </div>
            ) : (
              <div className="text-center py-12">
                <FileCode className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-400">Aucun lot publié pour le moment</p>
                <p className="text-sm text-slate-500 mt-2">
                  Cochez "Publié sur WordPress" dans l'onglet Publication d'un lot pour l'inclure dans l'export
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Guide d'intégration WordPress - Version complète avec plugin */}
        <Card className="mt-6 bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
          <CardHeader>
            <CardTitle className="text-green-900">🔌 Plugin WordPress Complet - Prêt à l'emploi</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="bg-white p-4 rounded-lg border border-green-200">
              <h3 className="font-semibold text-green-900 mb-3">📦 Ce que fait le plugin :</h3>
              <ul className="space-y-2 text-green-800">
                <li>✅ <strong>Synchronisation automatique</strong> toutes les 2 heures</li>
                <li>✅ <strong>Bouton de sync manuelle</strong> dans l'admin WordPress</li>
                <li>✅ <strong>Custom Post Type "Lots LMNP"</strong> avec toutes les métadonnées</li>
                <li>✅ <strong>Import automatique des photos</strong></li>
                <li>✅ <strong>Taxonomies</strong> pour résidences et statuts</li>
                <li>✅ <strong>Filtre automatique</strong> : seuls les lots "Publié sur WordPress" sont importés</li>
              </ul>
            </div>

            <div className="bg-white p-4 rounded-lg border border-green-200">
              <h3 className="font-semibold text-green-900 mb-3">📥 Télécharger le plugin complet</h3>
              <p className="text-slate-600 mb-3">
                J'ai développé un plugin WordPress professionnel et prêt à l'emploi avec 5 fichiers PHP :
              </p>
              
              <div className="bg-slate-50 p-3 rounded border border-slate-200 font-mono text-xs mb-3">
                wp-content/plugins/crm-lmnp-sync/<br/>
                ├── crm-lmnp-sync.php (fichier principal)<br/>
                ├── includes/<br/>
                │   ├── class-crm-api.php<br/>
                │   ├── class-lot-post-type.php<br/>
                │   └── class-sync-manager.php<br/>
                └── admin/<br/>
                &nbsp;&nbsp;&nbsp;&nbsp;└── settings-page.php
              </div>

              <Button
                onClick={() => window.open(createPageUrl("WordPressPluginGuide"), '_blank')}
                className="bg-green-600 hover:bg-green-700 w-full"
              >
                <FileCode className="w-4 h-4 mr-2" />
                Voir le guide complet et télécharger le plugin
              </Button>
            </div>

            <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
              <h3 className="font-semibold text-amber-900 mb-2">⚡ Installation rapide (3 étapes)</h3>
              <ol className="list-decimal list-inside space-y-2 text-amber-800 ml-2">
                <li>Téléchargez tous les fichiers PHP depuis le guide complet</li>
                <li>Créez le dossier <code className="bg-white px-1 rounded">crm-lmnp-sync</code> dans <code className="bg-white px-1 rounded">wp-content/plugins/</code></li>
                <li>Activez le plugin et configurez votre Token API Base44</li>
              </ol>
              <p className="text-amber-700 mt-3 text-xs">
                ⏱️ Le plugin se synchronise automatiquement toutes les 2 heures !
              </p>
            </div>

            <div className="pt-3 border-t">
              <h3 className="font-semibold text-slate-700 mb-2">Option alternative : Import Manuel</h3>
              <ol className="list-decimal list-inside space-y-1 text-slate-600 ml-4">
                <li>Téléchargez le fichier XML ci-dessus</li>
                <li>Installez un plugin d'import XML dans WordPress (ex: WP All Import)</li>
                <li>Importez le fichier téléchargé</li>
                <li>Répétez manuellement quand nécessaire</li>
              </ol>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}