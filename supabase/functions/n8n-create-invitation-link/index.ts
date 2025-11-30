import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-api-key',
};

interface InvitationLinkRequest {
  wedding_id: string;
  link_name: string;
  number_of_persons?: number;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate API Key
    const apiKey = req.headers.get('x-api-key');
    const validApiKey = Deno.env.get('N8N_API_KEY');

    if (!apiKey || apiKey !== validApiKey) {
      console.error('Invalid or missing API key');
      return new Response(
        JSON.stringify({ error: 'Unauthorized: Invalid API key' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Parse request body
    const body: InvitationLinkRequest = await req.json();
    const { wedding_id, link_name, number_of_persons = 1 } = body;

    // Validate required fields
    if (!wedding_id || !link_name) {
      console.error('Missing required fields:', { wedding_id, link_name });
      return new Response(
        JSON.stringify({ error: 'Missing required fields: wedding_id and link_name are required' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Validate field lengths
    if (link_name.length > 200) {
      return new Response(
        JSON.stringify({ error: 'link_name must be less than 200 characters' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    if (number_of_persons < 1 || number_of_persons > 100) {
      return new Response(
        JSON.stringify({ error: 'number_of_persons must be between 1 and 100' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Initialize Supabase client with service role
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify wedding exists
    const { data: wedding, error: weddingError } = await supabase
      .from('weddings')
      .select('id')
      .eq('id', wedding_id)
      .single();

    if (weddingError || !wedding) {
      console.error('Wedding not found:', weddingError);
      return new Response(
        JSON.stringify({ error: 'Wedding not found' }),
        {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Generate slug for the link
    const generateSlug = () => {
      return Math.random().toString(36).substring(2, 15) + 
             Math.random().toString(36).substring(2, 15);
    };

    const slug = generateSlug();

    // Prepare the data to be returned to n8n
    // n8n will handle the actual database insertion
    const linkData = {
      wedding_id,
      link_name,
      unique_slug: slug,
      number_of_persons,
    };

    console.log('Link data validated and prepared for n8n:', linkData);

    // Return success response with the link data for n8n to create
    return new Response(
      JSON.stringify({
        success: true,
        link_data: linkData,
        url: `${supabaseUrl.replace('https://zpwnpxkznlgdgkticiem.supabase.co', 'https://your-domain.com')}/invite/${slug}`
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Unexpected error in n8n-create-invitation-link:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
