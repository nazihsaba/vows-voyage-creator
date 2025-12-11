import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.77.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-api-key',
};

interface CreateInviteesRequest {
  invitation_link_id: string;
  invitees: Array<{ name: string }>;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate API key
    const apiKey = req.headers.get('x-api-key');
    const expectedApiKey = Deno.env.get('N8N_API_KEY');

    if (!apiKey || apiKey !== expectedApiKey) {
      console.error('Unauthorized: Invalid or missing API key');
      return new Response(
        JSON.stringify({ error: 'Unauthorized', message: 'Invalid or missing API key' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse request body
    const body: CreateInviteesRequest = await req.json();
    const { invitation_link_id, invitees } = body;

    // Validate required fields
    if (!invitation_link_id || !invitees || !Array.isArray(invitees) || invitees.length === 0) {
      return new Response(
        JSON.stringify({ 
          error: 'Validation error', 
          message: 'Missing required fields: invitation_link_id and invitees array (must not be empty)' 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Supabase client with service role key
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('Validating invitation_link_id:', invitation_link_id);

    // Verify invitation link exists
    const { data: invitationLink, error: linkError } = await supabase
      .from('invitation_links')
      .select('id')
      .eq('id', invitation_link_id)
      .single();

    if (linkError || !invitationLink) {
      console.error('Invitation link not found:', linkError);
      return new Response(
        JSON.stringify({ 
          error: 'Invalid request', 
          message: 'The requested resource could not be found' 
        }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Prepare invitees for insertion
    const inviteeRecords = invitees.map(invitee => ({
      invitation_link_id,
      name: invitee.name.trim(),
    }));

    console.log('Inserting invitees:', inviteeRecords);

    // Insert invitees
    const { data: insertedInvitees, error: insertError } = await supabase
      .from('invitees')
      .insert(inviteeRecords)
      .select();

    if (insertError) {
      console.error('Error inserting invitees:', insertError);
      return new Response(
        JSON.stringify({ 
          error: 'Server error', 
          message: 'Failed to create invitees'
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Successfully created invitees:', insertedInvitees);

    // Return success response
    return new Response(
      JSON.stringify({
        success: true,
        message: 'Invitees created successfully',
        count: insertedInvitees.length,
        data: insertedInvitees
      }),
      { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Unexpected error in create-invitees function:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error', 
        message: 'An error occurred processing your request'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
