import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-api-key',
};

interface InviteeRequest {
  invitation_link_id: string;
  name: string;
  is_attending?: boolean;
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
    const body: InviteeRequest = await req.json();
    const { invitation_link_id, name, is_attending } = body;

    // Validate required fields
    if (!invitation_link_id || !name) {
      console.error('Missing required fields:', { invitation_link_id, name });
      return new Response(
        JSON.stringify({ 
          error: 'Missing required fields: invitation_link_id and name are required' 
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Validate name
    if (typeof name !== 'string' || name.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: 'name must be a non-empty string' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    if (name.length > 200) {
      return new Response(
        JSON.stringify({ error: 'name must be less than 200 characters' }),
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

    // Verify invitation link exists
    const { data: link, error: linkError } = await supabase
      .from('invitation_links')
      .select('id, wedding_id')
      .eq('id', invitation_link_id)
      .single();

    if (linkError || !link) {
      console.error('Invitation link not found:', linkError);
      return new Response(
        JSON.stringify({ error: 'Invitation link not found' }),
        {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Prepare invitee data for insertion
    const inviteeData = {
      invitation_link_id,
      name: name.trim(),
      is_attending: is_attending ?? null,
    };

    console.log(`Inserting invitee ${name} for link ${invitation_link_id}`);

    // Insert invitee into the database
    const { data: insertedInvitee, error: insertError } = await supabase
      .from('invitees')
      .insert([inviteeData])
      .select()
      .single();

    if (insertError) {
      console.error('Error creating invitee:', insertError);
      return new Response(
        JSON.stringify({ 
          error: 'Failed to create invitee', 
          details: insertError.message 
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    console.log(`Successfully created invitee: ${insertedInvitee?.id}`);

    // Return success response
    return new Response(
      JSON.stringify({
        success: true,
        invitee: insertedInvitee,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Unexpected error in n8n-create-invitees:', error);
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
