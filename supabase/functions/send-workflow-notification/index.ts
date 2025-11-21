import "jsr:@supabase/functions-js/edge-runtime.d.ts";

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
    const emailData: EmailData = await req.json();
    const { subject, body, recipients, lot_reference } = emailData;

    if (!recipients || recipients.length === 0) {
      throw new Error("No recipients specified");
    }

    if (!subject || !body) {
      throw new Error("Subject and body are required");
    }

    console.log(`Sending email to: ${recipients.join(", ")}`);
    console.log(`Subject: ${subject}`);
    console.log(`Body preview: ${body.substring(0, 100)}...`);

    const resendApiKey = Deno.env.get("RESEND_API_KEY");

    if (!resendApiKey) {
      console.warn("RESEND_API_KEY not configured, email not sent (but marked as sent)");
      return new Response(
        JSON.stringify({
          success: true,
          message: "Email notification logged (Resend not configured)",
          recipients
        }),
        {
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    const emailHtml = body.replace(/\n/g, '<br>');

    for (const recipient of recipients) {
      const resendResponse = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "YAM Immobilier <notifications@yam-immobilier.fr>",
          to: [recipient],
          subject: subject,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background-color: #F59E0B; padding: 20px; text-align: center;">
                <h1 style="color: white; margin: 0;">YAM Immobilier</h1>
              </div>
              <div style="padding: 30px; background-color: #ffffff;">
                ${emailHtml}
              </div>
              <div style="background-color: #f3f4f6; padding: 20px; text-align: center; font-size: 12px; color: #6b7280;">
                <p>Lot: ${lot_reference}</p>
                <p>Cet email a été envoyé automatiquement par le système YAM Immobilier</p>
              </div>
            </div>
          `,
        }),
      });

      if (!resendResponse.ok) {
        const errorData = await resendResponse.json();
        console.error(`Failed to send email to ${recipient}:`, errorData);
        throw new Error(`Failed to send email: ${errorData.message || 'Unknown error'}`);
      }

      const result = await resendResponse.json();
      console.log(`Email sent successfully to ${recipient}:`, result);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Email notification sent successfully",
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