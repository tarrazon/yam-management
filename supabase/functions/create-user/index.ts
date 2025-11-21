import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
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
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    const { email, password, nom, prenom, role_custom, partenaire_id, acquereur_id } = await req.json();

    // Créer l'utilisateur avec Supabase Auth Admin
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        nom,
        prenom,
      },
    });

    if (authError) throw authError;

    // Créer le profil
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .insert({
        id: authData.user.id,
        email,
        nom,
        prenom,
        role_custom,
        partenaire_id: partenaire_id || null,
      });

    if (profileError) throw profileError;

    // Si c'est un acquéreur, lier le user_id à l'acquéreur
    if (role_custom === 'acquereur' && acquereur_id) {
      const { error: acquereurError } = await supabaseAdmin
        .from('acquereurs')
        .update({ user_id: authData.user.id })
        .eq('id', acquereur_id);

      if (acquereurError) throw acquereurError;
    }

    return new Response(
      JSON.stringify({ success: true, user: authData.user }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});