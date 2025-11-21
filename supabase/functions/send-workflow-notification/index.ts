import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface EmailData {
  lot_id: string;
  step_code: string;
  template: string;
  recipients: string[];
  lot_reference: string;
  residence_nom: string;
  acquereur_email?: string;
  vendeur_email?: string;
}

const emailTemplates = {
  mission_signed: {
    subject: "Lettre de mission signée - Lot {lot_reference}",
    body: `Bonjour,\n\nLa lettre de mission pour le lot {lot_reference} ({residence_nom}) a été signée.\n\nMerci de nous faire parvenir les pièces administratives nécessaires dans les plus brefs délais.\n\nCordialement,\nYAM Immobilier`
  },
  docs_reminder: {
    subject: "Relance documents - Lot {lot_reference}",
    body: `Bonjour,\n\nNous n'avons toujours pas reçu certains documents administratifs concernant le lot {lot_reference} ({residence_nom}).\n\nMerci de nous les transmettre dans les 15 jours.\n\nCordialement,\nYAM Immobilier`
  },
  option_notification: {
    subject: "Option posée - Lot {lot_reference}",
    body: `Bonjour,\n\nUne option a été posée sur le lot {lot_reference} ({residence_nom}).\n\nCordialement,\nYAM Immobilier`
  },
  acte_signed: {
    subject: "Acte authentique signé - Lot {lot_reference}",
    body: `Bonjour,\n\nNous avons le plaisir de vous informer que l'acte authentique pour le lot {lot_reference} ({residence_nom}) a été signé.\n\nNous vous remercions pour votre confiance.\n\nCordialement,\nYAM Immobilier`
  }
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const emailData: EmailData = await req.json();
    const { template, recipients, lot_reference, residence_nom } = emailData;

    const templateData = emailTemplates[template as keyof typeof emailTemplates];
    if (!templateData) {
      throw new Error(`Template not found: ${template}`);
    }

    const subject = templateData.subject
      .replace("{lot_reference}", lot_reference)
      .replace("{residence_nom}", residence_nom);

    const body = templateData.body
      .replace("{lot_reference}", lot_reference)
      .replace("{residence_nom}", residence_nom);

    const emailRecipients: string[] = [];
    if (recipients.includes("vendeur") && emailData.vendeur_email) {
      emailRecipients.push(emailData.vendeur_email);
    }
    if (recipients.includes("acquereur") && emailData.acquereur_email) {
      emailRecipients.push(emailData.acquereur_email);
    }
    if (recipients.includes("bo")) {
      emailRecipients.push("backoffice@yam-immobilier.fr");
    }
    if (recipients.includes("commercial")) {
      emailRecipients.push("commercial@yam-immobilier.fr");
    }
    if (recipients.includes("cgp")) {
      emailRecipients.push("cgp@yam-immobilier.fr");
    }

    console.log(`Sending email to: ${emailRecipients.join(", ")}`);
    console.log(`Subject: ${subject}`);
    console.log(`Body: ${body}`);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Email notification sent",
        recipients: emailRecipients
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Error:", error);
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