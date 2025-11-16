import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Hash OTP using SHA-256 to compare with stored hash
async function hashOTP(otp: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(otp);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, code } = await req.json();

    // Sanitize and validate inputs
    if (!email || !code || typeof email !== 'string' || typeof code !== 'string') {
      return new Response(
        JSON.stringify({ error: "Email and code are required" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const sanitizedEmail = email.toLowerCase().trim();
    const sanitizedCode = code.trim();

    // Validate code format (6 digits)
    if (!/^\d{6}$/.test(sanitizedCode)) {
      return new Response(
        JSON.stringify({ success: false, error: "Invalid code format" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log("Verifying OTP for:", sanitizedEmail);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Hash the provided OTP to compare with stored hash
    const hashedCode = await hashOTP(sanitizedCode);

    // Find valid OTP by comparing hashed values
    const { data: otpData, error: fetchError } = await supabase
      .from("otp_codes")
      .select("*")
      .eq("email", sanitizedEmail)
      .eq("code", hashedCode) // Compare hashed OTP
      .eq("used", false)
      .gt("expires_at", new Date().toISOString())
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (fetchError || !otpData) {
      console.log("Invalid or expired OTP for:", sanitizedEmail);
      return new Response(
        JSON.stringify({ success: false, error: "Invalid or expired verification code" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Mark OTP as used (one-time use)
    await supabase
      .from("otp_codes")
      .update({ used: true })
      .eq("id", otpData.id);

    // Check if user exists
    const { data: userData } = await supabase.auth.admin.listUsers();
    let user = userData.users.find(u => u.email?.toLowerCase() === sanitizedEmail);

    // Create user if doesn't exist
    if (!user) {
      console.log("Creating new user for:", sanitizedEmail);
      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        email: sanitizedEmail,
        email_confirm: true,
      });

      if (createError || !newUser.user) {
        console.error("Failed to create user:", createError);
        return new Response(
          JSON.stringify({ success: false, error: "Failed to create account" }),
          { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }
      user = newUser.user;

      // Create profile entry
      await supabase
        .from("profiles")
        .insert({
          id: user.id,
          email: sanitizedEmail,
        });
    }

    // Generate session using magic link
    const { data: sessionData, error: sessionError } = await supabase.auth.admin.generateLink({
      type: 'magiclink',
      email: sanitizedEmail,
    });

    if (sessionError || !sessionData) {
      console.error("Failed to create session:", sessionError);
      return new Response(
        JSON.stringify({ success: false, error: "Failed to create session" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log("OTP verified successfully for:", sanitizedEmail);

    // SECURITY: Return only necessary data, never expose sensitive information
    return new Response(
      JSON.stringify({
        success: true,
        session: sessionData,
        user: { id: user.id, email: user.email }
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error in verify-otp function:", error);
    return new Response(
      JSON.stringify({ success: false, error: "An error occurred while verifying code" }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);