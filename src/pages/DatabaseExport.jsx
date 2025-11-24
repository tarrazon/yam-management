import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Database, Download, FileJson, FileSpreadsheet, FileCode, CheckCircle2, AlertCircle, Loader2, FolderArchive, Upload, HardDrive } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

export default function DatabaseExport() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [exportResult, setExportResult] = useState(null);
  const [selectedTables, setSelectedTables] = useState("all");
  const [progress, setProgress] = useState({ current: 0, total: 0, table: "" });
  const [storageLoading, setStorageLoading] = useState(false);
  const [storageProgress, setStorageProgress] = useState({ current: 0, total: 0, file: "" });

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const apiEndpoint = `${supabaseUrl}/functions/v1/export-database`;

  const availableTables = [
    { id: "profiles", name: "Profils utilisateurs", icon: "👤" },
    { id: "partenaires", name: "Partenaires", icon: "🤝" },
    { id: "acquereurs", name: "Acquéreurs", icon: "👥" },
    { id: "vendeurs", name: "Vendeurs", icon: "💰" },
    { id: "notaires", name: "Notaires", icon: "⚖️" },
    { id: "residences_gestion", name: "Résidences de gestion", icon: "🏢" },
    { id: "residences", name: "Résidences (ancien)", icon: "🏘️" },
    { id: "gestionnaires", name: "Gestionnaires", icon: "💼" },
    { id: "gestionnaires_residences", name: "Liaisons gestionnaires-résidences", icon: "🔗" },
    { id: "lots_lmnp", name: "Lots LMNP", icon: "🏠" },
    { id: "lots", name: "Lots (ancien)", icon: "🏘️" },
    { id: "contacts_residence", name: "Contacts résidence", icon: "📞" },
    { id: "options_lot", name: "Options sur lots", icon: "⏰" },
    { id: "workflow_steps", name: "Étapes workflow", icon: "🔄" },
    { id: "lot_workflow_progress", name: "Progression workflow lots", icon: "📊" },
    { id: "appels_de_fond", name: "Appels de fond", icon: "💵" },
    { id: "galerie_photos", name: "Galerie photos", icon: "🖼️" },
    { id: "faq", name: "FAQ", icon: "❓" },
    { id: "dossiers_vente", name: "Dossiers de vente", icon: "📁" },
    { id: "reservations", name: "Réservations", icon: "📅" },
    { id: "clients", name: "Clients (ancien)", icon: "👤" },
    { id: "notification_emails", name: "Emails de notification", icon: "📧" },
    { id: "email_templates_special", name: "Templates emails spéciaux", icon: "📝" },
    { id: "messages_admin", name: "Messages admin", icon: "💬" },
    { id: "messages_partenaires", name: "Messages partenaires", icon: "📨" },
    { id: "notifications_commerciales", name: "Notifications commerciales", icon: "🔔" },
    { id: "vues_stats", name: "Statistiques de vues", icon: "📈" },
    { id: "password_reset_tokens", name: "Tokens reset mot de passe", icon: "🔐" },
  ];

  const [checkedTables, setCheckedTables] = useState(
    availableTables.reduce((acc, table) => ({ ...acc, [table.id]: true }), {})
  );

  const handleExport = async (format) => {
    console.log("1️⃣ Export demandé pour le format:", format);

    if (!user) {
      console.error("❌ Pas d'utilisateur connecté");
      toast.error("Vous devez être connecté pour exporter");
      return;
    }

    console.log("2️⃣ Utilisateur connecté:", user.email);

    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError || !session) {
      console.error("❌ Erreur lors de la récupération de la session:", sessionError);
      toast.error("Erreur d'authentification");
      return;
    }

    console.log("3️⃣ Session récupérée avec succès, token présent:", !!session.access_token);

    try {
      console.log("4️⃣ Avant setLoading(true)");
      setLoading(true);
      console.log("5️⃣ Après setLoading(true)");

      console.log("6️⃣ Avant setExportResult(null)");
      setExportResult(null);
      console.log("7️⃣ Après setExportResult(null)");

      console.log("8️⃣ Avant setProgress");
      setProgress({ current: 0, total: 0, table: "" });
      console.log("9️⃣ Après setProgress - Début du traitement des tables...");

      const allTables = availableTables.map(t => t.id);
      const tablesToExport = selectedTables === "all"
        ? allTables
        : Object.keys(checkedTables).filter(key => checkedTables[key]);

      console.log("Tables à exporter:", tablesToExport);

      if (tablesToExport.length === 0) {
        toast.error("Veuillez sélectionner au moins une table");
        setLoading(false);
        return;
      }

      setProgress({ current: 0, total: tablesToExport.length, table: "" });

      const exportData = {
        export_date: new Date().toISOString(),
        database: "yam-management",
        tables: {},
      };

      let totalRecords = 0;

      console.log(`Début de l'export de ${tablesToExport.length} table(s):`, tablesToExport);

      for (let i = 0; i < tablesToExport.length; i++) {
        const tableName = tablesToExport[i];
        setProgress({ current: i + 1, total: tablesToExport.length, table: tableName });

        try {
          console.log(`[${i + 1}/${tablesToExport.length}] Récupération de la table: ${tableName}...`);

          const { data, error, count } = await supabase
            .from(tableName)
            .select("*", { count: "exact" })
            .limit(10000);

          if (error) {
            console.error(`❌ Erreur pour ${tableName}:`, error);
            exportData.tables[tableName] = {
              error: error.message,
              count: 0,
              data: [],
            };
          } else {
            console.log(`✓ ${tableName}: ${count} enregistrement(s), ${data?.length || 0} exporté(s)`);
            exportData.tables[tableName] = {
              count: count || 0,
              exported: data?.length || 0,
              data: data || [],
            };
            totalRecords += count || 0;
          }
        } catch (err) {
          console.error(`❌ Exception pour ${tableName}:`, err);
          exportData.tables[tableName] = {
            error: err.message,
            count: 0,
            data: [],
          };
        }
      }

      console.log(`Export terminé: ${totalRecords} enregistrements au total`);

      if (format === "json") {
        const jsonData = {
          success: true,
          export_date: exportData.export_date,
          database: exportData.database,
          total_tables: tablesToExport.length,
          total_records: totalRecords,
          tables: exportData.tables,
        };

        setExportResult(jsonData);

        const blob = new Blob([JSON.stringify(jsonData, null, 2)], { type: "application/json" });
        const downloadUrl = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = downloadUrl;
        link.download = `yam_export_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(downloadUrl);

        toast.success(`Export réussi ! ${totalRecords} enregistrements dans ${tablesToExport.length} table(s)`);
      } else if (format === "csv") {
        let csvContent = "# YAM Management - Database Export\n";
        csvContent += `# Export Date: ${exportData.export_date}\n\n`;

        for (const [tableName, tableData] of Object.entries(exportData.tables)) {
          csvContent += `\n## Table: ${tableName} (${tableData.count} rows)\n`;

          if (tableData.error) {
            csvContent += `# ERROR: ${tableData.error}\n`;
            continue;
          }

          if (tableData.data.length > 0) {
            const headers = Object.keys(tableData.data[0]);
            csvContent += headers.join(",") + "\n";

            for (const row of tableData.data) {
              const values = headers.map((header) => {
                const value = row[header];
                if (value === null || value === undefined) return "";
                if (typeof value === "object") return JSON.stringify(value).replace(/"/g, '""');
                return `"${String(value).replace(/"/g, '""')}"`;
              });
              csvContent += values.join(",") + "\n";
            }
          }
        }

        const blob = new Blob([csvContent], { type: "text/csv" });
        const downloadUrl = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = downloadUrl;
        link.download = `yam_export_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(downloadUrl);

        toast.success(`Export CSV réussi ! ${totalRecords} enregistrements`);
      } else if (format === "sql") {
        console.log("Génération du fichier SQL...");
        let sqlContent = `-- YAM Management - Database Export\n`;
        sqlContent += `-- Export Date: ${exportData.export_date}\n`;
        sqlContent += `-- Database: ${exportData.database}\n\n`;

        for (const [tableName, tableData] of Object.entries(exportData.tables)) {
          console.log(`Génération SQL pour ${tableName}...`);
          sqlContent += `\n-- Table: ${tableName} (${tableData.count} rows)\n`;

          if (tableData.error) {
            sqlContent += `-- ERROR: ${tableData.error}\n`;
            continue;
          }

          if (tableData.data.length > 0) {
            for (const row of tableData.data) {
              const columns = Object.keys(row);
              const values = columns.map((col) => {
                const value = row[col];
                if (value === null || value === undefined) return "NULL";
                if (typeof value === "object") return `'${JSON.stringify(value).replace(/'/g, "''")}'`;
                if (typeof value === "string") return `'${value.replace(/'/g, "''")}'`;
                if (typeof value === "boolean") return value ? "TRUE" : "FALSE";
                return value;
              });

              sqlContent += `INSERT INTO ${tableName} (${columns.join(", ")}) VALUES (${values.join(", ")});\n`;
            }
          }
        }

        console.log("Création du blob et téléchargement...");
        const blob = new Blob([sqlContent], { type: "text/plain" });
        const downloadUrl = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = downloadUrl;
        link.download = `yam_export_${new Date().toISOString().split('T')[0]}.sql`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(downloadUrl);

        console.log("✓ Téléchargement SQL terminé");
        toast.success(`Export SQL réussi ! ${totalRecords} enregistrements`);
      }
    } catch (error) {
      console.error("❌ Erreur GLOBALE lors de l'export:", error);
      console.error("Stack trace:", error.stack);
      toast.error(`Erreur lors de l'export: ${error.message}`);
    } finally {
      setLoading(false);
      setProgress({ current: 0, total: 0, table: "" });
    }
  };

  const handleExportDocuments = async () => {
    if (!user) {
      toast.error("Vous devez être connecté");
      return;
    }

    setStorageLoading(true);
    setStorageProgress({ current: 0, total: 0, file: "" });

    try {
      const { data: filesList, error: listError } = await supabase.storage
        .from('documents')
        .list('', {
          limit: 10000,
          offset: 0,
        });

      if (listError) throw listError;

      if (!filesList || filesList.length === 0) {
        toast.info("Aucun document à exporter");
        setStorageLoading(false);
        return;
      }

      const exportData = {
        export_date: new Date().toISOString(),
        bucket: 'documents',
        total_files: filesList.length,
        files: []
      };

      setStorageProgress({ current: 0, total: filesList.length, file: "Récupération des fichiers..." });

      for (let i = 0; i < filesList.length; i++) {
        const file = filesList[i];
        setStorageProgress({ current: i + 1, total: filesList.length, file: file.name });

        try {
          const { data: fileData, error: downloadError } = await supabase.storage
            .from('documents')
            .download(file.name);

          if (downloadError) {
            console.error(`Erreur téléchargement ${file.name}:`, downloadError);
            exportData.files.push({
              name: file.name,
              path: file.name,
              error: downloadError.message
            });
            continue;
          }

          const reader = new FileReader();
          const base64Promise = new Promise((resolve) => {
            reader.onloadend = () => resolve(reader.result);
            reader.readAsDataURL(fileData);
          });

          const base64Data = await base64Promise;

          exportData.files.push({
            name: file.name,
            path: file.name,
            size: file.metadata?.size || fileData.size,
            mimetype: file.metadata?.mimetype || fileData.type,
            data: base64Data,
            created_at: file.created_at,
            updated_at: file.updated_at
          });
        } catch (err) {
          console.error(`Erreur traitement ${file.name}:`, err);
          exportData.files.push({
            name: file.name,
            path: file.name,
            error: err.message
          });
        }
      }

      const jsonContent = JSON.stringify(exportData, null, 2);
      const blob = new Blob([jsonContent], { type: "application/json" });
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = `yam_documents_export_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);

      const successCount = exportData.files.filter(f => !f.error).length;
      const errorCount = exportData.files.filter(f => f.error).length;

      toast.success(`Export documents réussi ! ${successCount} fichiers exportés${errorCount > 0 ? `, ${errorCount} erreurs` : ''}`);
    } catch (error) {
      console.error("Erreur export documents:", error);
      toast.error(`Erreur: ${error.message}`);
    } finally {
      setStorageLoading(false);
      setStorageProgress({ current: 0, total: 0, file: "" });
    }
  };

  const handleImportDocuments = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!user) {
      toast.error("Vous devez être connecté");
      return;
    }

    setStorageLoading(true);
    setStorageProgress({ current: 0, total: 0, file: "" });

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const importData = JSON.parse(e.target.result);

          if (!importData.files || !Array.isArray(importData.files)) {
            throw new Error("Format de fichier invalide");
          }

          const filesToImport = importData.files.filter(f => !f.error && f.data);
          setStorageProgress({ current: 0, total: filesToImport.length, file: "Import en cours..." });

          let successCount = 0;
          let errorCount = 0;

          for (let i = 0; i < filesToImport.length; i++) {
            const fileInfo = filesToImport[i];
            setStorageProgress({ current: i + 1, total: filesToImport.length, file: fileInfo.name });

            try {
              const base64Response = await fetch(fileInfo.data);
              const blob = await base64Response.blob();

              const { error: uploadError } = await supabase.storage
                .from('documents')
                .upload(fileInfo.path, blob, {
                  contentType: fileInfo.mimetype,
                  upsert: true
                });

              if (uploadError) {
                console.error(`Erreur upload ${fileInfo.name}:`, uploadError);
                errorCount++;
              } else {
                successCount++;
              }
            } catch (err) {
              console.error(`Erreur traitement ${fileInfo.name}:`, err);
              errorCount++;
            }
          }

          toast.success(`Import terminé ! ${successCount} fichiers importés${errorCount > 0 ? `, ${errorCount} erreurs` : ''}`);
        } catch (error) {
          console.error("Erreur parsing fichier:", error);
          toast.error(`Erreur: ${error.message}`);
        } finally {
          setStorageLoading(false);
          setStorageProgress({ current: 0, total: 0, file: "" });
        }
      };

      reader.readAsText(file);
    } catch (error) {
      console.error("Erreur import documents:", error);
      toast.error(`Erreur: ${error.message}`);
      setStorageLoading(false);
      setStorageProgress({ current: 0, total: 0, file: "" });
    }

    event.target.value = '';
  };

  const toggleTable = (tableId) => {
    setCheckedTables(prev => ({
      ...prev,
      [tableId]: !prev[tableId]
    }));
  };

  const selectAll = () => {
    setCheckedTables(
      availableTables.reduce((acc, table) => ({ ...acc, [table.id]: true }), {})
    );
  };

  const deselectAll = () => {
    setCheckedTables(
      availableTables.reduce((acc, table) => ({ ...acc, [table.id]: false }), {})
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
              <Database className="w-8 h-8 text-[#1E40AF]" />
              Export des données
            </h1>
            <p className="text-slate-600 mt-2">
              Exportez l'intégralité ou une partie de vos données en plusieurs formats
            </p>
          </div>
        </div>

        <Alert className="border-amber-200 bg-amber-50">
          <AlertCircle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-800">
            <div className="space-y-1">
              <div>L'export contient toutes les données sensibles. Assurez-vous de stocker les fichiers en sécurité.</div>
              <div className="text-sm">L'export est effectué directement depuis votre navigateur et est limité à 10 000 enregistrements par table.</div>
            </div>
          </AlertDescription>
        </Alert>

        <Card>
          <CardHeader>
            <CardTitle>Sélection des tables</CardTitle>
            <CardDescription>
              Choisissez les tables à exporter
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant={selectedTables === "all" ? "default" : "outline"}
                onClick={() => setSelectedTables("all")}
                className={selectedTables === "all" ? "bg-[#1E40AF] text-white hover:bg-[#1E40AF]/90" : ""}
              >
                <Database className="w-4 h-4 mr-2" />
                Toutes les tables
              </Button>
              <Button
                variant={selectedTables === "custom" ? "default" : "outline"}
                onClick={() => setSelectedTables("custom")}
                className={selectedTables === "custom" ? "bg-[#1E40AF] text-white hover:bg-[#1E40AF]/90" : ""}
              >
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Sélection personnalisée
              </Button>
            </div>

            {selectedTables === "custom" && (
              <div className="space-y-4 pt-4 border-t">
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={selectAll}>
                    Tout sélectionner
                  </Button>
                  <Button size="sm" variant="outline" onClick={deselectAll}>
                    Tout désélectionner
                  </Button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {availableTables.map((table) => (
                    <div
                      key={table.id}
                      className="flex items-center space-x-2 border rounded-lg p-3 hover:bg-slate-50 transition-colors"
                    >
                      <Checkbox
                        id={table.id}
                        checked={checkedTables[table.id]}
                        onCheckedChange={() => toggleTable(table.id)}
                      />
                      <label
                        htmlFor={table.id}
                        className="text-sm font-medium leading-none cursor-pointer flex-1 flex items-center gap-2"
                      >
                        <span>{table.icon}</span>
                        <span>{table.name}</span>
                      </label>
                    </div>
                  ))}
                </div>

                <div className="text-sm text-slate-600">
                  {Object.values(checkedTables).filter(Boolean).length} table(s) sélectionnée(s)
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Format d'export</CardTitle>
            <CardDescription>
              Choisissez le format de votre fichier d'export
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button
                variant="outline"
                className="h-32 flex flex-col items-center justify-center gap-3 hover:border-blue-500 hover:bg-blue-50 transition-all cursor-pointer text-slate-900"
                onClick={() => handleExport("json")}
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                ) : (
                  <FileJson className="w-8 h-8 text-blue-600" />
                )}
                <div className="text-center">
                  <div className="font-semibold text-slate-900">Format JSON</div>
                  <div className="text-xs text-slate-600">Structuré et lisible</div>
                </div>
              </Button>

              <Button
                variant="outline"
                className="h-32 flex flex-col items-center justify-center gap-3 hover:border-green-500 hover:bg-green-50 transition-all cursor-pointer text-slate-900"
                onClick={() => handleExport("csv")}
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="w-8 h-8 animate-spin text-green-600" />
                ) : (
                  <FileSpreadsheet className="w-8 h-8 text-green-600" />
                )}
                <div className="text-center">
                  <div className="font-semibold text-slate-900">Format CSV</div>
                  <div className="text-xs text-slate-600">Compatible Excel</div>
                </div>
              </Button>

              <Button
                variant="outline"
                className="h-32 flex flex-col items-center justify-center gap-3 hover:border-slate-500 hover:bg-slate-50 transition-all cursor-pointer text-slate-900"
                onClick={() => handleExport("sql")}
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="w-8 h-8 animate-spin text-slate-600" />
                ) : (
                  <FileCode className="w-8 h-8 text-slate-600" />
                )}
                <div className="text-center">
                  <div className="font-semibold text-slate-900">Format SQL</div>
                  <div className="text-xs text-slate-600">Pour restauration</div>
                </div>
              </Button>
            </div>

            {loading && progress.total > 0 && (
              <div className="mt-6 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">
                    Export en cours... {progress.current}/{progress.total}
                  </span>
                  <span className="text-slate-900 font-medium">
                    {progress.table}
                  </span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2.5">
                  <div
                    className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                    style={{ width: `${(progress.current / progress.total) * 100}%` }}
                  ></div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {exportResult && (
          <Card className="border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-900">
                <CheckCircle2 className="w-5 h-5" />
                Export réussi
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white p-3 rounded-lg border border-green-200">
                  <div className="text-2xl font-bold text-green-700">
                    {exportResult.total_tables}
                  </div>
                  <div className="text-xs text-slate-600">Tables exportées</div>
                </div>
                <div className="bg-white p-3 rounded-lg border border-green-200">
                  <div className="text-2xl font-bold text-green-700">
                    {exportResult.total_records}
                  </div>
                  <div className="text-xs text-slate-600">Enregistrements</div>
                </div>
                <div className="bg-white p-3 rounded-lg border border-green-200 col-span-2">
                  <div className="text-sm font-semibold text-slate-700 truncate">
                    {new Date(exportResult.export_date).toLocaleString('fr-FR')}
                  </div>
                  <div className="text-xs text-slate-600">Date d'export</div>
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg border border-green-200 max-h-64 overflow-y-auto">
                <h4 className="font-semibold text-sm text-slate-700 mb-2">Détails par table</h4>
                <div className="space-y-2">
                  {Object.entries(exportResult.tables).map(([tableName, tableData]) => (
                    <div key={tableName} className="flex items-center justify-between text-sm border-b pb-2">
                      <span className="font-mono text-slate-700">{tableName}</span>
                      <Badge variant={tableData.error ? "destructive" : "secondary"}>
                        {tableData.error ? "Erreur" : `${tableData.count} lignes`}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-orange-100/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <HardDrive className="w-6 h-6 text-orange-600" />
              Sauvegarde des documents et fichiers
            </CardTitle>
            <CardDescription>
              Exportez et importez tous vos documents du bucket Supabase Storage (photos, PDF, documents)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert className="border-orange-300 bg-orange-100">
              <AlertCircle className="h-4 w-4 text-orange-700" />
              <AlertDescription className="text-orange-900">
                <div className="space-y-1">
                  <div className="font-medium">Protection contre la perte de données</div>
                  <div className="text-sm">Cette fonctionnalité permet de sauvegarder tous vos fichiers uploadés (documents acquereurs, photos lots, etc.) en cas de piratage, corruption ou suppression accidentelle.</div>
                </div>
              </AlertDescription>
            </Alert>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button
                variant="outline"
                size="lg"
                className="h-auto flex flex-col items-center justify-center gap-3 p-6 hover:border-orange-500 hover:bg-orange-50 transition-all text-slate-900"
                onClick={handleExportDocuments}
                disabled={storageLoading}
              >
                {storageLoading ? (
                  <Loader2 className="w-10 h-10 animate-spin text-orange-600" />
                ) : (
                  <Download className="w-10 h-10 text-orange-600" />
                )}
                <div className="text-center">
                  <div className="font-semibold text-lg">Exporter les documents</div>
                  <div className="text-sm text-slate-600 mt-1">
                    Télécharger tous les fichiers en JSON
                  </div>
                </div>
              </Button>

              <label className="cursor-pointer">
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportDocuments}
                  className="hidden"
                  disabled={storageLoading}
                />
                <div
                  className={`h-full flex flex-col items-center justify-center gap-3 p-6 border-2 border-dashed rounded-lg transition-all ${
                    storageLoading
                      ? 'border-slate-300 bg-slate-100'
                      : 'border-orange-300 hover:border-orange-500 hover:bg-orange-50'
                  }`}
                >
                  {storageLoading ? (
                    <Loader2 className="w-10 h-10 animate-spin text-orange-600" />
                  ) : (
                    <Upload className="w-10 h-10 text-orange-600" />
                  )}
                  <div className="text-center">
                    <div className="font-semibold text-lg text-slate-900">Importer les documents</div>
                    <div className="text-sm text-slate-600 mt-1">
                      Restaurer depuis un fichier JSON
                    </div>
                  </div>
                </div>
              </label>
            </div>

            {storageLoading && storageProgress.total > 0 && (
              <div className="space-y-2 p-4 bg-white rounded-lg border border-orange-200">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600 font-medium">
                    Traitement en cours... {storageProgress.current}/{storageProgress.total}
                  </span>
                  <span className="text-slate-900">
                    {Math.round((storageProgress.current / storageProgress.total) * 100)}%
                  </span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-3">
                  <div
                    className="bg-orange-600 h-3 rounded-full transition-all duration-300"
                    style={{ width: `${(storageProgress.current / storageProgress.total) * 100}%` }}
                  ></div>
                </div>
                {storageProgress.file && (
                  <div className="text-xs text-slate-600 truncate">
                    {storageProgress.file}
                  </div>
                )}
              </div>
            )}

            <div className="bg-white p-4 rounded-lg border border-orange-200">
              <h4 className="font-semibold text-sm text-slate-900 mb-3 flex items-center gap-2">
                <FolderArchive className="w-4 h-4 text-orange-600" />
                Informations importantes
              </h4>
              <ul className="space-y-2 text-sm text-slate-600">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Les fichiers sont encodés en Base64 dans le JSON</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>L'import remplace les fichiers existants (upsert)</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Limite : 10 000 fichiers par export</span>
                </li>
                <li className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                  <span className="text-amber-700">Le fichier JSON peut être volumineux selon le nombre de documents</span>
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recommandations</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-slate-600">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Effectuez des exports réguliers (quotidiens ou hebdomadaires)</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Stockez les exports dans un emplacement sécurisé avec chiffrement</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Testez la restauration des backups périodiquement</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Conservez plusieurs versions d'exports (rotation sur 30 jours minimum)</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
