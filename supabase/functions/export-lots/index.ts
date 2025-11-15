import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.81.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
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
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: req.headers.get("Authorization")! },
        },
      }
    );

    const { data: { user } } = await supabaseClient.auth.getUser();
    
    if (!user) {
      return new Response(
        JSON.stringify({ error: "Non authentifié" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const url = new URL(req.url);
    const format = url.searchParams.get("format") || "json";
    const statut = url.searchParams.get("statut");
    const residence_id = url.searchParams.get("residence_id");
    const partenaire_id = url.searchParams.get("partenaire_id");

    let query = supabaseClient
      .from("lots_lmnp")
      .select(`
        *,
        residences_gestion (
          nom,
          ville,
          code_postal,
          adresse
        ),
        acquereurs_lmnp (
          nom,
          prenom,
          email,
          telephone
        ),
        partenaires (
          nom,
          prenom,
          societe
        )
      `);

    if (statut) {
      query = query.eq("statut", statut);
    }

    if (residence_id) {
      query = query.eq("residence_id", residence_id);
    }

    if (partenaire_id) {
      query = query.eq("partenaire_id", partenaire_id);
    }

    const { data: lots, error } = await query.order("created_at", { ascending: false });

    if (error) {
      return new Response(
        JSON.stringify({ error: error.message }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (format === "csv") {
      const csvLines = [];
      
      const headers = [
        "Reference",
        "Type",
        "Residence",
        "Ville",
        "Statut",
        "Prix HT",
        "Prix TTC",
        "Surface",
        "Etage",
        "Nb Pieces",
        "Acquereur",
        "Partenaire",
        "Date Creation"
      ];
      csvLines.push(headers.join(","));

      lots.forEach((lot: any) => {
        const row = [
          lot.reference || "",
          lot.type_lot || "",
          lot.residences_gestion?.nom || "",
          lot.residences_gestion?.ville || "",
          lot.statut || "",
          lot.prix_ht || "",
          lot.prix_ttc || "",
          lot.surface || "",
          lot.etage || "",
          lot.nombre_pieces || "",
          lot.acquereurs_lmnp ? `${lot.acquereurs_lmnp.prenom} ${lot.acquereurs_lmnp.nom}` : "",
          lot.partenaires ? (lot.partenaires.societe || `${lot.partenaires.prenom} ${lot.partenaires.nom}`) : "",
          lot.created_at ? new Date(lot.created_at).toLocaleDateString("fr-FR") : ""
        ];
        csvLines.push(row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(","));
      });

      const csv = csvLines.join("\n");

      return new Response(csv, {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="export-lots-${new Date().toISOString().split('T')[0]}.csv"`,
        },
      });
    }

    return new Response(
      JSON.stringify({
        success: true,
        count: lots.length,
        data: lots,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
