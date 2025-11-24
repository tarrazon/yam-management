import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface NotificationPayload {
  partenaire_nom: string;
  partenaire_prenom: string;
  lot_numero: string;
  residence_nom: string;
  acquereur_nom?: string;
  acquereur_prenom?: string;
  date_debut: string;
  date_fin: string;
}

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

    const payload: NotificationPayload = await req.json();

    const { data: notificationEmails, error: emailsError } = await supabase
      .from("notification_emails")
      .select("email")
      .eq("active", true);

    if (emailsError) {
      throw new Error(`Error fetching notification emails: ${emailsError.message}`);
    }

    if (!notificationEmails || notificationEmails.length === 0) {
      return new Response(
        JSON.stringify({ message: "No active notification emails configured" }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const resendApiKey = Deno.env.get("RESEND_API_KEY");

    if (!resendApiKey) {
      throw new Error("RESEND_API_KEY not configured");
    }

    const acquereurInfo = payload.acquereur_nom && payload.acquereur_prenom
      ? `${payload.acquereur_nom} ${payload.acquereur_prenom}`
      : "Non renseigné";

    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
            }
            .header {
              background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
              color: white;
              padding: 30px;
              text-align: center;
              border-radius: 8px 8px 0 0;
            }
            .content {
              background: #f8fafc;
              padding: 30px;
              border: 1px solid #e2e8f0;
            }
            .info-box {
              background: white;
              padding: 20px;
              border-radius: 8px;
              margin: 15px 0;
              box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            }
            .label {
              font-weight: bold;
              color: #475569;
              margin-bottom: 5px;
            }
            .value {
              color: #1e293b;
              font-size: 16px;
            }
            .footer {
              background: #1e293b;
              color: #94a3b8;
              padding: 20px;
              text-align: center;
              font-size: 12px;
              border-radius: 0 0 8px 8px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1 style="margin: 0;">🏢 Nouvelle Option sur Lot</h1>
          </div>
          <div class="content">
            <p>Une nouvelle option a été posée par un partenaire.</p>

            <div class="info-box">
              <div class="label">Partenaire</div>
              <div class="value">${payload.partenaire_prenom} ${payload.partenaire_nom}</div>
            </div>

            <div class="info-box">
              <div class="label">Résidence</div>
              <div class="value">${payload.residence_nom}</div>
            </div>

            <div class="info-box">
              <div class="label">Lot n°</div>
              <div class="value">${payload.lot_numero}</div>
            </div>

            <div class="info-box">
              <div class="label">Acquéreur</div>
              <div class="value">${acquereurInfo}</div>
            </div>

            <div class="info-box">
              <div class="label">Période d'option</div>
              <div class="value">
                Du ${new Date(payload.date_debut).toLocaleDateString('fr-FR')}
                au ${new Date(payload.date_fin).toLocaleDateString('fr-FR')}
              </div>
            </div>
          </div>
          <div class="footer">
            <p style="margin: 0;">Y'am Asset Management - Gestion LMNP</p>
            <p style="margin: 5px 0 0 0;">Cette notification a été générée automatiquement</p>
          </div>
        </body>
      </html>
    `;

    const emailText = `
Nouvelle Option sur Lot

Une nouvelle option a été posée par un partenaire.

Partenaire: ${payload.partenaire_prenom} ${payload.partenaire_nom}
Résidence: ${payload.residence_nom}
Lot n°: ${payload.lot_numero}
Acquéreur: ${acquereurInfo}
Période d'option: Du ${new Date(payload.date_debut).toLocaleDateString('fr-FR')} au ${new Date(payload.date_fin).toLocaleDateString('fr-FR')}

Y'am Asset Management - Gestion LMNP
    `;

    const emailPromises = notificationEmails.map((item) =>
      fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${resendApiKey}`,
        },
        body: JSON.stringify({
          from: "Y'am Asset Management <noreply@yam-management.fr>",
          to: [item.email],
          subject: `Nouvelle option - ${payload.residence_nom} - Lot ${payload.lot_numero}`,
          html: emailHtml,
          text: emailText,
        }),
      })
    );

    const results = await Promise.allSettled(emailPromises);

    const successful = results.filter(r => r.status === "fulfilled").length;
    const failed = results.filter(r => r.status === "rejected").length;

    return new Response(
      JSON.stringify({
        success: true,
        message: `Notifications envoyées: ${successful} réussies, ${failed} échouées`,
        sent_to: notificationEmails.length,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error sending notifications:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});