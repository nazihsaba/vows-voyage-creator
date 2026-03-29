import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.77.0';
import * as XLSX from 'https://esm.sh/xlsx@0.18.5';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface InviteeRow {
  DisplayName?: string;
  invitees?: string;
  nbOfPersons?: number;
  side?: string;
  'Link Name'?: string;
  'Number Of Guests'?: number;
  'Guest Name'?: string;
  Side?: string;
  'Table Number'?: number;
  tableNumber?: number;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Processing invitees file upload');

    // Parse multipart form data
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const weddingId = formData.get('weddingId') as string;
    const weddingSlug = formData.get('weddingSlug') as string;

    if (!file || !weddingId || !weddingSlug) {
      return new Response(
        JSON.stringify({ 
          error: 'Missing required fields', 
          message: 'File, weddingId, and weddingSlug are required' 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Processing file: ${file.name} for wedding ${weddingId}`);

    // Read file as ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    const data = new Uint8Array(arrayBuffer);

    // Parse Excel file
    const workbook = XLSX.read(data, { type: 'array' });
    const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows: InviteeRow[] = XLSX.utils.sheet_to_json(firstSheet);

    console.log(`Found ${rows.length} rows in Excel file`);

    if (rows.length === 0) {
      return new Response(
        JSON.stringify({ 
          error: 'Empty file', 
          message: 'The Excel file contains no data' 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Verify wedding exists
    const { data: wedding, error: weddingError } = await supabase
      .from('weddings')
      .select('id')
      .eq('id', weddingId)
      .single();

    if (weddingError || !wedding) {
      console.error('Wedding not found:', weddingError);
      return new Response(
        JSON.stringify({ 
          error: 'Invalid request', 
          message: 'The requested resource could not be found' 
        }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Group invitees by DisplayName
    const groupedInvitees = rows.reduce((acc, row) => {
      const displayName = row.DisplayName?.trim();
      const inviteeName = row.invitees?.trim();
      const nbOfPersons = row.nbOfPersons || 1;

      // Skip rows without DisplayName
      if (!displayName) {
        console.warn('Skipping row without DisplayName:', row);
        return acc;
      }

      // Initialize the group if it doesn't exist
      if (!acc[displayName]) {
        acc[displayName] = {
          guests: [],
          totalPersons: nbOfPersons,
        };
      }

      // Add invitee name if present
      if (inviteeName) {
        acc[displayName].guests.push(inviteeName);
      }

      return acc;
    }, {} as Record<string, { guests: string[]; totalPersons: number }>);

    console.log(`Grouped into ${Object.keys(groupedInvitees).length} invitation links`);

    // Create invitation links and invitees
    let createdCount = 0;
    let failedCount = 0;

    for (const [displayName, linkData] of Object.entries(groupedInvitees)) {
      try {
        // Generate unique slug
        const baseSlug = displayName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
        const uniqueSlug = `${weddingSlug}-${baseSlug}-${Date.now()}-${createdCount}`;

        const guestCount = linkData.guests.length > 0 ? linkData.guests.length : linkData.totalPersons;
        console.log(`Creating link: ${displayName} with ${guestCount} person(s)`);

        // Create invitation link
        const { data: invitationLink, error: linkError } = await supabase
          .from('invitation_links')
          .insert({
            wedding_id: weddingId,
            link_name: displayName,
            unique_slug: uniqueSlug,
            number_of_persons: guestCount,
          })
          .select()
          .single();

        if (linkError) {
          console.error(`Error creating link ${displayName}:`, linkError);
          failedCount++;
          continue;
        }

        // Create invitees if guest names are provided
        if (linkData.guests.length > 0) {
          const inviteeRecords = linkData.guests.map(name => ({
            invitation_link_id: invitationLink.id,
            name: name,
          }));

          const { error: inviteeError } = await supabase
            .from('invitees')
            .insert(inviteeRecords);

          if (inviteeError) {
            console.error(`Error creating invitees for ${displayName}:`, inviteeError);
            failedCount++;
            continue;
          }
        } else {
          // If no individual guest names, create placeholder invitees based on nbOfPersons
          const placeholderInvitees = Array.from({ length: linkData.totalPersons }, (_, i) => ({
            invitation_link_id: invitationLink.id,
            name: `Guest ${i + 1}`,
          }));

          const { error: inviteeError } = await supabase
            .from('invitees')
            .insert(placeholderInvitees);

          if (inviteeError) {
            console.error(`Error creating placeholder invitees for ${displayName}:`, inviteeError);
            failedCount++;
            continue;
          }
        }

        createdCount++;
        console.log(`Successfully created link: ${displayName}`);
      } catch (error) {
        console.error(`Error processing link ${displayName}:`, error);
        failedCount++;
      }
    }

    console.log(`Processing complete: ${createdCount} succeeded, ${failedCount} failed`);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Successfully processed ${createdCount} invitation links`,
        details: {
          created: createdCount,
          failed: failedCount,
          total: Object.keys(groupedInvitees).length,
        }
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Unexpected error processing file:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error', 
        message: 'An error occurred processing your request' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
