import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-api-key',
};

interface InviteeRequest {
  invitation_link_id: string;
  invitees: Array<{
    name: string;
    is_attending?: boolean;
  }>;
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
    const { invitation_link_id, invitees } = body;

    // Validate required fields
    if (!invitation_link_id || !invitees || !Array.isArray(invitees)) {
      console.error('Missing required fields:', { invitation_link_id, invitees });
      return new Response(
        JSON.stringify({ 
          error: 'Missing required fields: invitation_link_id and invitees array are required' 
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Validate invitees array
    if (invitees.length === 0) {
      return new Response(
        JSON.stringify({ error: 'invitees array cannot be empty' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Validate each invitee
    for (const invitee of invitees) {
      if (!invitee.name || typeof invitee.name !== 'string') {
        return new Response(
          JSON.stringify({ error: 'Each invitee must have a valid name' }),
          {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }
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

    // Prepare invitees data for insertion
    const inviteesData = invitees.map(invitee => ({
      invitation_link_id,
      name: invitee.name,
      is_attending: invitee.is_attending ?? null,
    }));

    console.log(`Inserting ${inviteesData.length} invitees for link ${invitation_link_id}`);

    // Insert invitees into the database
    const { data: insertedInvitees, error: insertError } = await supabase
      .from('invitees')
      .insert(inviteesData)
      .select();

    if (insertError) {
      console.error('Error creating invitees:', insertError);
      return new Response(
        JSON.stringify({ 
          error: 'Failed to create invitees', 
          details: insertError.message 
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    console.log(`Successfully created ${insertedInvitees?.length || 0} invitees`);

    // Return success response
    return new Response(
      JSON.stringify({
        success: true,
        created_count: insertedInvitees?.length || 0,
        invitees: insertedInvitees,
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
