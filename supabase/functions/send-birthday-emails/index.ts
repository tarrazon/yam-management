import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

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
    console.log('[send-birthday-emails] Starting birthday email job');

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const resendApiKey = Deno.env.get("RESEND_API_KEY");

    if (!resendApiKey) {
      throw new Error("RESEND_API_KEY not configured");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Récupérer le template d'anniversaire
    const { data: template, error: templateError } = await supabase
      .from('email_templates_special')
      .select('*')
      .eq('code', 'birthday')
      .eq('is_active', true)
      .maybeSingle();

    if (templateError) {
      console.error('[send-birthday-emails] Error fetching template:', templateError);
      throw templateError;
    }

    if (!template) {
      console.log('[send-birthday-emails] Birthday template not found or inactive');
      return new Response(
        JSON.stringify({ success: true, message: 'Birthday template not active', sent: 0 }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log('[send-birthday-emails] Template loaded:', template.code);

    // Obtenir la date d'aujourd'hui (jour et mois uniquement)
    const today = new Date();
    const todayMonth = today.getMonth() + 1; // JavaScript months are 0-indexed
    const todayDay = today.getDate();

    console.log(`[send-birthday-emails] Checking for birthdays on ${todayDay}/${todayMonth}`);

    // Récupérer les acquéreurs dont c'est l'anniversaire aujourd'hui
    const { data: acquereurs, error: acquereurError } = await supabase
      .from('acquereurs')
      .select('id, prenom, nom, email, date_naissance')
      .not('date_naissance', 'is', null)
      .not('email', 'is', null);

    if (acquereurError) {
      console.error('[send-birthday-emails] Error fetching acquéreurs:', acquereurError);
      throw acquereurError;
    }

    console.log(`[send-birthday-emails] Found ${acquereurs?.length || 0} acquéreurs with birthdate`);

    // Filtrer ceux dont c'est l'anniversaire aujourd'hui
    const birthdayAcquereurs = (acquereurs || []).filter(acq => {
      if (!acq.date_naissance) return false;
      const birthDate = new Date(acq.date_naissance);
      const birthMonth = birthDate.getMonth() + 1;
      const birthDay = birthDate.getDate();
      return birthMonth === todayMonth && birthDay === todayDay;
    });

    console.log(`[send-birthday-emails] ${birthdayAcquereurs.length} acquéreurs have birthday today`);

    if (birthdayAcquereurs.length === 0) {
      return new Response(
        JSON.stringify({ success: true, message: 'No birthdays today', sent: 0 }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Envoyer les emails
    const emailPromises = birthdayAcquereurs.map(async (acq) => {
      try {
        // Remplacer les variables dans le sujet et le corps
        let subject = template.email_subject
          .replace(/{{prenom}}/g, acq.prenom || '')
          .replace(/{{nom}}/g, acq.nom || '');

        let body = template.email_body
          .replace(/{{prenom}}/g, acq.prenom || '')
          .replace(/{{nom}}/g, acq.nom || '')
          .replace(/{{email}}/g, acq.email || '');

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
                  background: linear-gradient(135deg, #1E40AF 0%, #1E3A8A 100%);
                  color: white;
                  padding: 40px;
                  text-align: center;
                  border-radius: 8px 8px 0 0;
                }
                .birthday-icon {
                  font-size: 60px;
                  margin: 20px 0;
                }
                .content {
                  background: #f8fafc;
                  padding: 40px;
                  border: 1px solid #e2e8f0;
                }
                .message-box {
                  background: white;
                  padding: 30px;
                  border-radius: 8px;
                  margin: 20px 0;
                  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                  white-space: pre-line;
                  text-align: center;
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
                <div class="birthday-icon">🎂🎉</div>
                <h1 style="margin: 0; font-size: 32px;">Joyeux Anniversaire !</h1>
              </div>
              <div class="content">
                <div class="message-box">
                  ${body.replace(/\n/g, '<br>')}
                </div>
              </div>
              <div class="footer">
                <p style="margin: 0;">Y'am Asset Management - Gestion LMNP</p>
                <p style="margin: 5px 0 0 0;">© ${today.getFullYear()} Y'am Asset Management. Tous droits réservés.</p>
              </div>
            </body>
          </html>
        `;

        console.log(`[send-birthday-emails] Sending birthday email to ${acq.email}`);

        const resendResponse = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${resendApiKey}`,
          },
          body: JSON.stringify({
            from: "Y'am Asset Management <noreply@yam-management.fr>",
            to: [acq.email],
            subject: subject,
            html: emailHtml,
            text: body,
          }),
        });

        const resendResult = await resendResponse.json();
        console.log(`[send-birthday-emails] Email sent to ${acq.email}:`, resendResult);

        if (!resendResponse.ok) {
          throw new Error(`Failed to send to ${acq.email}: ${JSON.stringify(resendResult)}`);
        }

        return { success: true, email: acq.email, acquereur: `${acq.prenom} ${acq.nom}` };
      } catch (error) {
        console.error(`[send-birthday-emails] Error sending to ${acq.email}:`, error);
        return { success: false, email: acq.email, error: error.message };
      }
    });

    const results = await Promise.allSettled(emailPromises);
    const successful = results.filter(r => r.status === "fulfilled" && r.value.success).length;
    const failed = results.filter(r => r.status === "rejected" || (r.status === "fulfilled" && !r.value.success)).length;

    console.log(`[send-birthday-emails] Completed: ${successful} sent, ${failed} failed`);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Birthday emails processed: ${successful} sent, ${failed} failed`,
        sent: successful,
        failed: failed,
        total: birthdayAcquereurs.length
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("[send-birthday-emails] Error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
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
