import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const status = url.searchParams.get('status');
    const weddingId = url.searchParams.get('weddingId');
    const paymentType = url.searchParams.get('type') || 'publish'; // 'publish' or 'venue'

    if (!status || !weddingId) {
      return new Response(
        JSON.stringify({ error: 'Missing status or weddingId' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log(`Payment callback received: status=${status}, weddingId=${weddingId}, type=${paymentType}`);

    if (paymentType === 'venue') {
      // Handle venue feature payment
      if (status === 'success') {
        const { error } = await supabase
          .from('weddings')
          .update({ venue_payment_status: 'paid' })
          .eq('id', weddingId);

        if (error) {
          console.error('Error updating venue payment status:', error);
          return new Response(
            JSON.stringify({ error: 'Failed to update venue payment status' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        console.log(`Venue feature unlocked for wedding ${weddingId}`);
      } else {
        await supabase
          .from('weddings')
          .update({ venue_payment_status: 'failed' })
          .eq('id', weddingId);
        console.log(`Venue payment failed for wedding ${weddingId}`);
      }
    } else {
      // Handle publish payment (original logic)
      if (status === 'success') {
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
        await supabase
          .from('weddings')
          .update({ payment_status: 'failed' })
          .eq('id', weddingId);
        console.log(`Payment failed for wedding ${weddingId}`);
      }
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
