import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const url = new URL(req.url);
    const format = url.searchParams.get("format") || "json";
    const tables = url.searchParams.get("tables")?.split(",") || "all";

    const allTables = [
      "profiles",
      "residences_gestion",
      "gestionnaires",
      "lots_lmnp",
      "partenaires",
      "acquereurs",
      "vendeurs",
      "notaires",
      "contacts_residence",
      "options_lot",
      "suivi_dossier",
      "workflow_steps",
      "workflow_progress",
      "appels_de_fond",
      "galerie_photos",
      "faq_items",
      "notification_emails",
      "messages_admin",
      "messages_partenaires",
      "views_stats",
    ];

    const tablesToExport = tables === "all" ? allTables : tables;

    const exportData: Record<string, any> = {
      export_date: new Date().toISOString(),
      database: "yam-management",
      tables: {},
    };

    for (const tableName of tablesToExport) {
      try {
        const { data, error, count } = await supabase
          .from(tableName)
          .select("*", { count: "exact" });

        if (error) {
          console.error(`Erreur lors de l'export de ${tableName}:`, error);
          exportData.tables[tableName] = {
            error: error.message,
            count: 0,
            data: [],
          };
        } else {
          exportData.tables[tableName] = {
            count: count || 0,
            data: data || [],
          };
        }
      } catch (err) {
        console.error(`Exception lors de l'export de ${tableName}:`, err);
        exportData.tables[tableName] = {
          error: err.message,
          count: 0,
          data: [],
        };
      }
    }

    if (format === "csv") {
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

      return new Response(csvContent, {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="yam_database_export_${new Date().toISOString().split('T')[0]}.csv"`,
        },
      });
    }

    if (format === "sql") {
      let sqlContent = `-- YAM Management - Database Export
-- Export Date: ${exportData.export_date}
-- Database: ${exportData.database}

`;

      for (const [tableName, tableData] of Object.entries(exportData.tables)) {
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

      return new Response(sqlContent, {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "text/plain",
          "Content-Disposition": `attachment; filename="yam_database_export_${new Date().toISOString().split('T')[0]}.sql"`,
        },
      });
    }

    const totalRecords = Object.values(exportData.tables).reduce(
      (sum: number, table: any) => sum + (table.count || 0),
      0
    );

    return new Response(
      JSON.stringify({
        success: true,
        export_date: exportData.export_date,
        database: exportData.database,
        total_tables: tablesToExport.length,
        total_records: totalRecords,
        tables: exportData.tables,
      }, null, 2),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Erreur lors de l'export:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});
