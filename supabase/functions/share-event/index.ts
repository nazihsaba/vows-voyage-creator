import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const ShareRequestSchema = z.object({
  weddingId: z.string().uuid("Invalid wedding ID"),
  email: z.string().email("Invalid email address").max(255),
  password: z.string().min(6).max(128).optional(),
});

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

    // Validate input
    const body = await req.json();
    const parsed = ShareRequestSchema.safeParse(body);
    if (!parsed.success) {
      return new Response(
        JSON.stringify({ error: parsed.error.flatten().fieldErrors }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { weddingId, email, password } = parsed.data;
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

    // Check existing shares count (defense in depth — trigger also enforces this)
    const { count } = await supabaseAdmin
      .from("wedding_shares")
      .select("id", { count: "exact", head: true })
      .eq("wedding_id", weddingId);

    if ((count ?? 0) >= 1) {
      return new Response(
        JSON.stringify({ error: "This event is already shared with another user (max 1 share)" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Look up target user via auth.users (avoids profile trigger race condition)
    let targetUserId: string | null = null;
    let userCreated = false;

    const { data: listData } = await supabaseAdmin.auth.admin.listUsers({
      page: 1,
      perPage: 1,
    });

    // Use admin API to find user by email directly
    const { data: usersData } = await supabaseAdmin.auth.admin.listUsers();
    const existingUser = usersData?.users?.find(
      (u) => u.email?.toLowerCase() === normalizedEmail
    );

    if (existingUser) {
      targetUserId = existingUser.id;
    } else {
      // Create new user — password is required for new accounts
      if (!password) {
        return new Response(
          JSON.stringify({ error: "Password is required when creating a new account", needsPassword: true }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

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
      userCreated = true;
    }

    // Prevent sharing with self
    if (targetUserId === caller.id) {
      return new Response(
        JSON.stringify({ error: "You cannot share an event with yourself" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Insert share (unique constraint + trigger prevent duplicates and over-sharing)
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
      // Trigger violation
      if (shareErr.message?.includes("only be shared with one")) {
        return new Response(
          JSON.stringify({ error: "This event can only be shared with one account" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      throw shareErr;
    }

    const message = userCreated
      ? "Event shared successfully. A new account was created for this email."
      : "Event shared successfully with the existing user.";

    return new Response(
      JSON.stringify({ success: true, message }),
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
