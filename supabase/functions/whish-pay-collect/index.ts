import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface WhishCollectRequest {
  weddingId: string;
  amount: number;
  currency: "USD" | "LBP";
  invoice: string;
}

interface WhishCollectResponse {
  status: boolean;
  code: string | null;
  dialog: { title?: string; message?: string } | null;
  extra: unknown;
  data: {
    collectUrl?: string;
  };
}

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const channel = Deno.env.get("WHISH_PAY_CHANNEL");
    const secret = Deno.env.get("WHISH_PAY_SECRET");
    const websiteUrl = Deno.env.get("WHISH_PAY_WEBSITE_URL");

    if (!channel || !secret || !websiteUrl) {
      throw new Error("Whish Pay credentials not configured");
    }

    const { weddingId, amount, currency, invoice }: WhishCollectRequest = await req.json();

    if (!weddingId || !amount || !currency) {
      return new Response(JSON.stringify({ error: "Missing required fields: weddingId, amount, currency" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Create Supabase client for auth verification
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify user auth
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Not authenticated" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Invalid authentication token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Verify ownership of the wedding
    const { data: wedding, error: weddingError } = await supabase
      .from("weddings")
      .select("id, user_id, slug, bride_name, groom_name")
      .eq("id", weddingId)
      .single();

    if (weddingError || !wedding) {
      return new Response(JSON.stringify({ error: "Wedding not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (wedding.user_id !== user.id) {
      return new Response(JSON.stringify({ error: "Not authorized to publish this event" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Generate unique external ID using timestamp
    const externalId = Date.now();

    // Base URL for callbacks/redirects
    const baseUrl = `https://${websiteUrl}`;

    // Whish API base URL (sandbox for testing, use api.whish.money for production)
    // const whishApiBase = "https://api.whish.money/itel-service/api";
    const whishApiBase = "https://api.whish.money/itel-service/api";

    // Supabase functions URL for server-to-server callbacks
    const callbackBaseUrl = supabaseUrl.replace(".supabase.co", ".supabase.co/functions/v1");

    // Call Whish Pay API for Whish Balance payments (POST /payment/whish)
    const collectResponse = await fetch(`${whishApiBase}/payment/whish`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        channel: channel,
        secret: secret,
        websiteUrl: websiteUrl,
        "User-Agent": "Whish/1.0 (https://aureainvites.com; support@aureainvites.com)",
      },
      body: JSON.stringify({
        amount: amount,
        currency: currency,
        invoice: invoice || `Event publishing fee for ${wedding.bride_name} & ${wedding.groom_name}`,
        externalId: externalId,
        successCallbackUrl: `${callbackBaseUrl}/whish-payment-callback?status=success&weddingId=${weddingId}`,
        failureCallbackUrl: `${callbackBaseUrl}/whish-payment-callback?status=failed&weddingId=${weddingId}`,
        successRedirectUrl: `${baseUrl}/dashboard/my-events?payment=success&weddingId=${weddingId}`,
        failureRedirectUrl: `${baseUrl}/dashboard/my-events?payment=failed&weddingId=${weddingId}`,
      }),
    });

    const whishResult: WhishCollectResponse = await collectResponse.json();

    console.log("Whish Collect API response:", JSON.stringify(whishResult));

    if (!whishResult.status || !whishResult.data?.collectUrl) {
      return new Response(
        JSON.stringify({
          error: "Failed to create payment link",
          details: whishResult.dialog?.message || whishResult.code || "Unknown error",
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Store payment reference in the wedding record for tracking
    await supabase
      .from("weddings")
      .update({
        payment_external_id: externalId.toString(),
        payment_status: "pending",
      })
      .eq("id", weddingId);

    return new Response(
      JSON.stringify({
        success: true,
        collectUrl: whishResult.data.collectUrl,
        externalId: externalId,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error) {
    console.error("Error in whish-pay-collect:", error);
    const errorMessage = error instanceof Error ? error.message : "Internal server error";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
