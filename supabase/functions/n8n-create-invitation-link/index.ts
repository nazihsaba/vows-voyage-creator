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
  unique_slug?: string;
  side?: string | null;
  phone_number?: string | number | null;
  country_code?: string | null;
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
    const { wedding_id, link_name, number_of_persons = 1, unique_slug, side = null, phone_number = null, country_code = null } = body;

    // Normalize phone + country code. Backward compatible:
    //  - If country_code provided, use it as-is and phone_number stays as digits.
    //  - If only phone_number provided and it starts with +<digits>, auto-split into country_code.
    let normalizedPhone: string | null = null;
    let normalizedCountryCode: string | null = null;
    const rawPhone = phone_number != null ? String(phone_number).trim() : '';
    if (rawPhone.length > 0 && rawPhone !== '0') {
      normalizedPhone = rawPhone;
      const rawCc = country_code != null ? String(country_code).trim() : '';
      if (rawCc.length > 0) {
        normalizedCountryCode = rawCc;
      } else {
        const match = rawPhone.match(/^(\+\d{1,4})(.*)$/);
        if (match) {
          normalizedCountryCode = match[1];
          normalizedPhone = match[2] || rawPhone;
        }
      }
    }

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
        JSON.stringify({ error: 'Invalid request' }),
        {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Use provided slug or generate one
    const slug = unique_slug || (Math.random().toString(36).substring(2, 15) + 
             Math.random().toString(36).substring(2, 15));

    // Create the invitation link in the database
    const linkData = {
      wedding_id,
      link_name,
      unique_slug: slug,
      number_of_persons,
      side,
      phone_number: normalizedPhone,
    };

    const { data: insertedLink, error: insertError } = await supabase
      .from('invitation_links')
      .insert([linkData])
      .select()
      .single();

    if (insertError || !insertedLink) {
      console.error('Error creating invitation link:', insertError);
      return new Response(
        JSON.stringify({ error: 'Failed to create invitation link' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    console.log('Invitation link created successfully:', insertedLink);

    // Return success response with the link data including the link_id
    return new Response(
      JSON.stringify({
        success: true,
        link_id: insertedLink.id,
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
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
