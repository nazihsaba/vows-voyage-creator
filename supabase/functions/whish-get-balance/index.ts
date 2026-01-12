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
    balances?: Array<{ currency: string; balance: number }>;
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

    // Call Whish Account Info API (GET /account/info) - this endpoint returns balance info
    const balanceResponse = await fetch(`${whishApiBase}/account/info`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'channel': channel,
        'secret': secret,
        'websiteUrl': websiteUrl,
        'User-Agent': 'Whish/1.0 (https://aureainvites.com; support@aureainvites.com)',
      },
    });

    // First get response as text to check what we're receiving
    const responseText = await balanceResponse.text();
    console.log('Whish API raw response:', responseText);

    // Check if response is HTML (error page)
    if (responseText.startsWith('<!') || responseText.startsWith('<html')) {
      console.error('Whish API returned HTML instead of JSON');
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Balance API not available',
          balance: null,
          currency: 'USD'
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse as JSON
    let whishResult: WhishBalanceResponse;
    try {
      whishResult = JSON.parse(responseText);
    } catch {
      console.error('Failed to parse Whish response as JSON');
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Invalid response from payment provider',
          balance: null,
          currency: 'USD'
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Whish Balance API parsed response:', JSON.stringify(whishResult));

    if (!whishResult.status) {
      return new Response(
        JSON.stringify({ 
          success: false,
          error: whishResult.dialog?.message || whishResult.code || 'Failed to fetch balance',
          balance: null,
          currency: 'USD'
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Handle different response structures
    let balance = 0;
    let currency = 'USD';
    
    if (whishResult.data?.balance !== undefined) {
      balance = whishResult.data.balance;
      currency = whishResult.data.currency || 'USD';
    } else if (whishResult.data?.balances && Array.isArray(whishResult.data.balances)) {
      // Find USD balance first, or use the first available
      const usdBalance = whishResult.data.balances.find(b => b.currency === 'USD');
      if (usdBalance) {
        balance = usdBalance.balance;
        currency = 'USD';
      } else if (whishResult.data.balances.length > 0) {
        balance = whishResult.data.balances[0].balance;
        currency = whishResult.data.balances[0].currency;
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        balance: balance,
        currency: currency
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in whish-get-balance:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return new Response(
      JSON.stringify({ 
        success: false,
        error: errorMessage,
        balance: null,
        currency: 'USD'
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
