import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface VerifyOTPRequest {
  email: string;
  code: string;
  markAsUsed?: boolean; // Optional flag to mark OTP as used
}

// Hash OTP using Web Crypto API (same method as send-otp)
async function hashOTP(otp: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(otp);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, code, markAsUsed = true }: VerifyOTPRequest = await req.json();

    if (!email || !code) {
      return new Response(
        JSON.stringify({ error: "Email and code are required" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    console.log("Verifying OTP for:", email);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Find all unused OTPs for this email that haven't expired
    const { data: otpRecords, error: fetchError } = await supabase
      .from("otp_codes")
      .select("*")
      .eq("email", email.toLowerCase())
      .eq("used", false)
      .gt("expires_at", new Date().toISOString())
      .order("created_at", { ascending: false });
    
    if (fetchError) {
      console.error("Database error:", fetchError);
      throw new Error("Failed to verify OTP");
    }

    // Find matching OTP by comparing hashed values
    let otpData = null;
    if (otpRecords && otpRecords.length > 0) {
      const codeHash = await hashOTP(code);
      for (const record of otpRecords) {
        if (codeHash === record.hashed_otp) {
          otpData = record;
          break;
        }
      }
    }

    if (!otpData) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Invalid or expired OTP code" 
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Mark OTP as used
    if (markAsUsed) {
      const { error: updateError } = await supabase
        .from("otp_codes")
        .update({ used: true })
        .eq("id", otpData.id);

      if (updateError) {
        console.error("Failed to mark OTP as used:", updateError);
      }
    }

    console.log("OTP verified successfully for:", email);
    
    // Create or get user account and generate session
    let userId = otpData.user_id;
    
    // If no user_id linked to OTP, check if user exists or create new one
    if (!userId) {
      const { data: existingUser } = await supabase.auth.admin.listUsers();
      const user = existingUser?.users?.find(u => u.email === email.toLowerCase());
      
      if (user) {
        userId = user.id;
      } else {
        // Create new user with OTP verification (passwordless)
        const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
          email: email.toLowerCase(),
          email_confirm: true,
          user_metadata: { auth_method: 'otp' }
        });

        if (createError) {
          console.error("Failed to create user:", createError);
          throw new Error("Failed to create user account");
        }
        
        userId = newUser.user.id;
      }
      
      // Link OTP to user
      await supabase
        .from("otp_codes")
        .update({ user_id: userId })
        .eq("id", otpData.id);
    }
    
    // Generate session token for the user
    const { data: sessionData, error: sessionError } = await supabase.auth.admin.generateLink({
      type: 'magiclink',
      email: email.toLowerCase(),
    });

    if (sessionError) {
      console.error("Failed to generate session:", sessionError);
      throw new Error("Failed to create session");
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        message: "OTP verified successfully",
        session: sessionData,
        user_id: userId
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error verifying OTP:", error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message 
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
