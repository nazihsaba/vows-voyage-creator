import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface WhishBalanceResponse {
  status: boolean;
  code: string | null;
  dialog: { title?: string; message?: string } | null;
  extra: unknown;
  data: {
    balance?: number;
    currency?: string;
  };
}

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const channel = Deno.env.get('WHISH_PAY_CHANNEL');
    const secret = Deno.env.get('WHISH_PAY_SECRET');
    const websiteUrl = Deno.env.get('WHISH_PAY_WEBSITE_URL');

    if (!channel || !secret || !websiteUrl) {
      throw new Error('Whish Pay credentials not configured');
    }

    // Create Supabase client for auth verification
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify user auth
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Not authenticated' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid authentication token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Whish API base URL (sandbox for testing, use api.whish.money for production)
    const whishApiBase = 'https://api.sandbox.whish.money/itel-service/api';

    // Call Whish Balance API (GET /balance)
    const balanceResponse = await fetch(`${whishApiBase}/balance`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'channel': channel,
        'secret': secret,
        'websiteUrl': websiteUrl,
        'User-Agent': 'Whish/1.0 (https://aureainvites.com; support@aureainvites.com)',
      },
    });

    const whishResult: WhishBalanceResponse = await balanceResponse.json();

    console.log('Whish Balance API response:', JSON.stringify(whishResult));

    if (!whishResult.status) {
      return new Response(
        JSON.stringify({ 
          error: 'Failed to fetch balance',
          details: whishResult.dialog?.message || whishResult.code || 'Unknown error'
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        balance: whishResult.data?.balance || 0,
        currency: whishResult.data?.currency || 'USD'
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in whish-get-balance:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
