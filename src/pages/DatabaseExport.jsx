import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Database, Download, FileJson, FileSpreadsheet, FileCode, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

export default function DatabaseExport() {
  const { session } = useAuth();
  const [loading, setLoading] = useState(false);
  const [exportResult, setExportResult] = useState(null);
  const [selectedTables, setSelectedTables] = useState("all");

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const apiEndpoint = `${supabaseUrl}/functions/v1/export-database`;

  const availableTables = [
    { id: "profiles", name: "Profils utilisateurs", icon: "👤" },
    { id: "residences_gestion", name: "Résidences", icon: "🏢" },
    { id: "gestionnaires", name: "Gestionnaires", icon: "💼" },
    { id: "lots_lmnp", name: "Lots LMNP", icon: "🏠" },
    { id: "partenaires", name: "Partenaires", icon: "🤝" },
    { id: "acquereurs", name: "Acquéreurs", icon: "👥" },
    { id: "vendeurs", name: "Vendeurs", icon: "💰" },
    { id: "notaires", name: "Notaires", icon: "⚖️" },
    { id: "contacts_residence", name: "Contacts résidence", icon: "📞" },
    { id: "options_lot", name: "Options sur lots", icon: "⏰" },
    { id: "suivi_dossier", name: "Suivi de dossier", icon: "📋" },
    { id: "workflow_steps", name: "Étapes workflow", icon: "🔄" },
    { id: "workflow_progress", name: "Progression workflow", icon: "📊" },
    { id: "appels_de_fond", name: "Appels de fond", icon: "💵" },
    { id: "galerie_photos", name: "Galerie photos", icon: "🖼️" },
    { id: "faq_items", name: "FAQ", icon: "❓" },
    { id: "notification_emails", name: "Emails de notification", icon: "📧" },
    { id: "messages_admin", name: "Messages admin", icon: "💬" },
    { id: "messages_partenaires", name: "Messages partenaires", icon: "📨" },
    { id: "views_stats", name: "Statistiques de vues", icon: "📈" },
  ];

  const [checkedTables, setCheckedTables] = useState(
    availableTables.reduce((acc, table) => ({ ...acc, [table.id]: true }), {})
  );

  const handleExport = async (format) => {
    console.log("Export demandé pour le format:", format);

    if (!session?.access_token) {
      toast.error("Vous devez être connecté pour exporter");
      return;
    }

    setLoading(true);
    setExportResult(null);

    try {
      const allTables = availableTables.map(t => t.id);
      const tablesToExport = selectedTables === "all"
        ? allTables
        : Object.keys(checkedTables).filter(key => checkedTables[key]);

      if (tablesToExport.length === 0) {
        toast.error("Veuillez sélectionner au moins une table");
        setLoading(false);
        return;
      }

      const exportData = {
        export_date: new Date().toISOString(),
        database: "yam-management",
        tables: {},
      };

      let totalRecords = 0;

      console.log(`Début de l'export de ${tablesToExport.length} table(s):`, tablesToExport);

      for (const tableName of tablesToExport) {
        try {
          console.log(`Récupération de la table: ${tableName}...`);
          const { data, error, count } = await supabase
            .from(tableName)
            .select("*", { count: "exact" })
            .limit(10000);

          if (error) {
            console.error(`Erreur pour ${tableName}:`, error);
            exportData.tables[tableName] = {
              error: error.message,
              count: 0,
              data: [],
            };
          } else {
            console.log(`✓ ${tableName}: ${count} enregistrement(s)`);
            exportData.tables[tableName] = {
              count: count || 0,
              exported: data?.length || 0,
              data: data || [],
            };
            totalRecords += count || 0;
          }
        } catch (err) {
          console.error(`Exception pour ${tableName}:`, err);
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
      console.error("Erreur lors de l'export:", error);
      toast.error(`Erreur lors de l'export: ${error.message}`);
    } finally {
      setLoading(false);
    }
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
              Export de la base de données
            </h1>
            <p className="text-slate-600 mt-2">
              Exportez l'intégralité ou une partie de votre base de données en plusieurs formats
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
