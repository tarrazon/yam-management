import { createClient } from 'npm:@supabase/supabase-js@2.81.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Appeler la fonction PostgreSQL pour expirer les options
    const { data, error } = await supabase.rpc('force_expire_all_old_options');

    if (error) {
      console.error('Erreur lors de l\'expiration des options:', error);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: error.message,
          timestamp: new Date().toISOString()
        }),
        {
          status: 500,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    // Récupérer les statistiques
    const result = data && data.length > 0 ? data[0] : { expired_count: 0, lots_reset_count: 0 };

    console.log(`Options expirées: ${result.expired_count}, Lots remis en disponible: ${result.lots_reset_count}`);

    return new Response(
      JSON.stringify({
        success: true,
        expired_options: result.expired_count || 0,
        lots_reset: result.lots_reset_count || 0,
        timestamp: new Date().toISOString(),
        message: `${result.expired_count || 0} option(s) expirée(s) et ${result.lots_reset_count || 0} lot(s) remis en disponible`
      }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Erreur inattendue:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message,
        timestamp: new Date().toISOString()
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});