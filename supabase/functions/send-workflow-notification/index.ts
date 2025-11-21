import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface EmailData {
  lot_id: string;
  step_code: string;
  subject: string;
  body: string;
  recipients: string[];
  lot_reference: string;
  residence_nom: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    console.log('[send-workflow-notification] Received request');
    const emailData: EmailData = await req.json();
    console.log('[send-workflow-notification] Parsed email data:', JSON.stringify(emailData, null, 2));

    const { subject, body, recipients, lot_reference, residence_nom } = emailData;

    if (!recipients || recipients.length === 0) {
      console.error('[send-workflow-notification] No recipients specified');
      throw new Error("No recipients specified");
    }

    if (!subject || !body) {
      console.error('[send-workflow-notification] Subject or body missing', { subject: !!subject, body: !!body });
      throw new Error("Subject and body are required");
    }

    console.log(`[send-workflow-notification] Sending email to: ${recipients.join(", ")}`);
    console.log(`[send-workflow-notification] Subject: ${subject}`);
    console.log(`[send-workflow-notification] Body preview: ${body.substring(0, 100)}...`);

    const resendApiKey = Deno.env.get("RESEND_API_KEY");

    if (!resendApiKey) {
      throw new Error("RESEND_API_KEY not configured");
    }

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
              background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%);
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
            .message-box {
              background: white;
              padding: 20px;
              border-radius: 8px;
              margin: 15px 0;
              box-shadow: 0 1px 3px rgba(0,0,0,0.1);
              white-space: pre-line;
            }
            .info-box {
              background: #fef3c7;
              padding: 15px;
              border-radius: 8px;
              margin: 15px 0;
              border-left: 4px solid #F59E0B;
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
            <h1 style="margin: 0;">🏢 YAM Immobilier</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">${residence_nom}</p>
          </div>
          <div class="content">
            <div class="info-box">
              <strong>Lot ${lot_reference}</strong>
            </div>
            <div class="message-box">
              ${body}
            </div>
          </div>
          <div class="footer">
            <p style="margin: 0;">YAM Immobilier - Gestion LMNP</p>
            <p style="margin: 5px 0 0 0;">Cette notification a été générée automatiquement</p>
          </div>
        </body>
      </html>
    `;

    const emailText = `
${residence_nom}
Lot ${lot_reference}

${body}

YAM Immobilier - Gestion LMNP
    `;

    const emailPromises = recipients.map(async (recipient) => {
      console.log(`[send-workflow-notification] Sending to ${recipient}...`);
      const resendResponse = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${resendApiKey}`,
        },
        body: JSON.stringify({
          from: "YAM Immobilier <onboarding@resend.dev>",
          to: [recipient],
          subject: subject,
          html: emailHtml,
          text: emailText,
        }),
      });

      const resendResult = await resendResponse.json();
      console.log(`[send-workflow-notification] Resend API response for ${recipient}:`, {
        status: resendResponse.status,
        statusText: resendResponse.statusText,
        result: resendResult
      });

      if (!resendResponse.ok) {
        console.error(`[send-workflow-notification] Resend API error for ${recipient}:`, resendResult);
        throw new Error(`Failed to send to ${recipient}: ${JSON.stringify(resendResult)}`);
      }

      return { recipient, result: resendResult };
    });

    const results = await Promise.allSettled(emailPromises);

    console.log('[send-workflow-notification] Email promises results:', results);

    const successful = results.filter(r => r.status === "fulfilled").length;
    const failed = results.filter(r => r.status === "rejected").length;

    if (failed > 0) {
      console.error(`[send-workflow-notification] Some emails failed to send: ${failed} failed out of ${recipients.length}`);
      results.forEach((result, index) => {
        if (result.status === "rejected") {
          console.error(`[send-workflow-notification] Email ${index} to ${recipients[index]} failed:`, result.reason);
        }
      });
    }

    console.log(`[send-workflow-notification] Success: ${successful} emails sent, ${failed} failed`);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Emails envoyés: ${successful} réussis, ${failed} échoués`,
        sent_to: recipients.length,
        recipients
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("[send-workflow-notification] Error:", error);
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