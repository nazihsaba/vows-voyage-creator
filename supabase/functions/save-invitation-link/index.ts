import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.77.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-api-key',
};

interface SaveInvitationRequest {
  wedding_id: string;
  link_name: string;
  unique_slug: string;
  number_of_persons: number;
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
    const body: SaveInvitationRequest = await req.json();
    const { wedding_id, link_name, unique_slug, number_of_persons } = body;

    // Validate required fields
    if (!wedding_id || !link_name || !unique_slug || !number_of_persons) {
      return new Response(
        JSON.stringify({ 
          error: 'Validation error', 
          message: 'Missing required fields: wedding_id, link_name, unique_slug, number_of_persons' 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate number_of_persons is a positive integer
    if (typeof number_of_persons !== 'number' || number_of_persons < 1) {
      return new Response(
        JSON.stringify({ 
          error: 'Validation error', 
          message: 'number_of_persons must be a positive integer' 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('Validating wedding_id:', wedding_id);

    // Verify wedding exists and get its slug
    const { data: wedding, error: weddingError } = await supabase
      .from('weddings')
      .select('id, slug')
      .eq('id', wedding_id)
      .single();

    if (weddingError || !wedding) {
      console.error('Wedding not found:', weddingError);
      return new Response(
        JSON.stringify({ 
          error: 'Wedding not found', 
          message: `No wedding found with id: ${wedding_id}` 
        }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Sanitize link_name for URL (remove spaces and special characters)
    const sanitizedLinkName = link_name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    // Generate invitation URL using number_of_persons
    const baseUrl = Deno.env.get('SUPABASE_URL')?.replace('https://zpwnpxkznlgdgkticiem.supabase.co', 'https://vows-voyage-creator.lovable.app') || 'https://vows-voyage-creator.lovable.app';
    const invitation_url = `${baseUrl}/invite/${wedding.slug}/${sanitizedLinkName}/${number_of_persons}`;
    
    console.log('Generated invitation URL:', invitation_url);

    // Note: Duplicate slugs are now allowed in invitation_links table

    console.log('Inserting invitation link with slug:', unique_slug);

    // Insert invitation link
    const { data: invitationLink, error: insertError } = await supabase
      .from('invitation_links')
      .insert({
        wedding_id,
        link_name,
        unique_slug,
        number_of_persons,
        invitation_url
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error inserting invitation link:', insertError);
      return new Response(
        JSON.stringify({ 
          error: 'Database error', 
          message: 'Failed to save invitation link',
          details: insertError.message 
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Successfully created invitation link:', invitationLink);

    // Return success response
    return new Response(
      JSON.stringify({
        success: true,
        message: 'Invitation link saved successfully',
        link_id: invitationLink.id,
        data: {
          id: invitationLink.id,
          wedding_id: invitationLink.wedding_id,
          link_name: invitationLink.link_name,
          unique_slug: invitationLink.unique_slug,
          number_of_persons: invitationLink.number_of_persons,
          invitation_url: invitationLink.invitation_url
        }
      }),
      { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Unexpected error in save-invitation-link function:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error', 
        message: errorMessage 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
