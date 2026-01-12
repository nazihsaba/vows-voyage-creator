import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const status = url.searchParams.get('status');
    const weddingId = url.searchParams.get('weddingId');

    if (!status || !weddingId) {
      return new Response(
        JSON.stringify({ error: 'Missing status or weddingId' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log(`Payment callback received: status=${status}, weddingId=${weddingId}`);

    if (status === 'success') {
      // Update wedding status to published and mark payment as successful
      const { error } = await supabase
        .from('weddings')
        .update({ 
          status: 'published',
          payment_status: 'paid'
        })
        .eq('id', weddingId);

      if (error) {
        console.error('Error updating wedding after successful payment:', error);
        return new Response(
          JSON.stringify({ error: 'Failed to update wedding status' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log(`Wedding ${weddingId} published successfully after payment`);
    } else {
      // Mark payment as failed
      await supabase
        .from('weddings')
        .update({ payment_status: 'failed' })
        .eq('id', weddingId);

      console.log(`Payment failed for wedding ${weddingId}`);
    }

    return new Response(
      JSON.stringify({ success: true, status }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in whish-payment-callback:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});