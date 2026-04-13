import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Not authenticated" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Parse request
    const { weddingId, email, password } = await req.json();
    if (!weddingId || !email || !password) {
      return new Response(
        JSON.stringify({ error: "weddingId, email, and password are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Create admin client
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Create user client to verify caller
    const supabaseUser = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const {
      data: { user: caller },
    } = await supabaseUser.auth.getUser();
    if (!caller) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Verify caller owns the wedding
    const { data: wedding, error: weddingErr } = await supabaseAdmin
      .from("weddings")
      .select("id, user_id")
      .eq("id", weddingId)
      .single();

    if (weddingErr || !wedding) {
      return new Response(JSON.stringify({ error: "Wedding not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (wedding.user_id !== caller.id) {
      return new Response(JSON.stringify({ error: "You don't own this event" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check existing shares count
    const { count } = await supabaseAdmin
      .from("wedding_shares")
      .select("id", { count: "exact", head: true })
      .eq("wedding_id", weddingId);

    if ((count ?? 0) >= 1) {
      return new Response(
        JSON.stringify({ error: "This event is already shared with another user (max 2 users)" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if target user exists
    let targetUserId: string | null = null;

    // Look up by email in profiles
    const { data: existingProfile } = await supabaseAdmin
      .from("profiles")
      .select("id, email")
      .eq("email", normalizedEmail)
      .maybeSingle();

    if (existingProfile) {
      targetUserId = existingProfile.id;
    } else {
      // Create new user
      const { data: newUser, error: createErr } = await supabaseAdmin.auth.admin.createUser({
        email: normalizedEmail,
        password,
        email_confirm: true,
        user_metadata: { first_name: "", last_name: "" },
      });

      if (createErr) {
        return new Response(
          JSON.stringify({ error: `Failed to create user: ${createErr.message}` }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      targetUserId = newUser.user.id;
    }

    // Prevent sharing with self
    if (targetUserId === caller.id) {
      return new Response(
        JSON.stringify({ error: "You cannot share an event with yourself" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Insert share (unique constraint prevents duplicates)
    const { error: shareErr } = await supabaseAdmin
      .from("wedding_shares")
      .insert({ wedding_id: weddingId, shared_with_user_id: targetUserId });

    if (shareErr) {
      if (shareErr.code === "23505") {
        return new Response(
          JSON.stringify({ error: "This event is already shared with this user" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      throw shareErr;
    }

    return new Response(
      JSON.stringify({ success: true, message: "Event shared successfully" }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("share-event error:", err);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
