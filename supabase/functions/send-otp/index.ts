import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { Resend } from "https://esm.sh/resend@4.0.0";
import * as bcrypt from "https://deno.land/x/bcrypt@v0.4.1/mod.ts";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface OTPRequest {
  email: string;
  userName?: string;
}

// Generate 6-digit OTP
function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Rate limiting configuration
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour
const MAX_REQUESTS_PER_EMAIL = 5; // Max 5 OTP requests per email per hour
const MAX_REQUESTS_PER_IP = 10; // Max 10 OTP requests per IP per hour

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, userName }: OTPRequest = await req.json();

    if (!email) {
      return new Response(
        JSON.stringify({ error: "Email is required" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ error: "Invalid email format" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Get IP address for rate limiting
    const clientIP = req.headers.get("x-forwarded-for")?.split(',')[0].trim() || 
                     req.headers.get("x-real-ip") || 
                     "unknown";

    console.log(`OTP request from IP: ${clientIP}, Email: ${email}`);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Check rate limiting by email
    const emailRateLimitTime = new Date(Date.now() - RATE_LIMIT_WINDOW_MS).toISOString();
    const { data: emailRequests, error: emailCheckError } = await supabase
      .from("otp_codes")
      .select("id")
      .eq("email", email.toLowerCase())
      .gte("created_at", emailRateLimitTime);

    if (emailCheckError) {
      console.error("Error checking email rate limit:", emailCheckError);
    }

    if (emailRequests && emailRequests.length >= MAX_REQUESTS_PER_EMAIL) {
      console.warn(`Rate limit exceeded for email: ${email}`);
      return new Response(
        JSON.stringify({ 
          error: "Too many requests. Please try again later.",
          retryAfter: "1 hour"
        }),
        {
          status: 429,
          headers: { 
            "Content-Type": "application/json", 
            "Retry-After": "3600",
            ...corsHeaders 
          },
        }
      );
    }

    console.log("Generating OTP for:", email);

    // Generate OTP code
    const otpCode = generateOTP();
    
    // Hash the OTP before storing (security best practice)
    const hashedOtp = await bcrypt.hash(otpCode);
    
    // Calculate expiration time (5 minutes from now)
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();

    // Store hashed OTP in database (never store plain text OTPs)
    const { error: dbError } = await supabase
      .from("otp_codes")
      .insert({
        email: email.toLowerCase(),
        hashed_otp: hashedOtp,
        expires_at: expiresAt,
        used: false,
      });

    if (dbError) {
      console.error("Database error:", dbError);
      return new Response(
        JSON.stringify({ error: "Failed to process request" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    console.log("OTP stored, sending email to:", email);

    const emailResponse = await resend.emails.send({
      from: "Wedding Invites <onboarding@resend.dev>",
      to: [email],
      subject: "Your Login Verification Code",
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { text-align: center; padding: 20px 0; }
              .code-box { background: #f4f4f4; border: 2px solid #e0e0e0; border-radius: 8px; padding: 20px; text-align: center; margin: 30px 0; }
              .code { font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #000; }
              .footer { text-align: center; color: #666; font-size: 14px; margin-top: 30px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🎊 Wedding Invites</h1>
              </div>
              <h2>Hello${userName ? ` ${userName}` : ''}!</h2>
              <p>You requested to log in to your account. Please use the verification code below:</p>
              <div class="code-box">
                <div class="code">${otpCode}</div>
              </div>
              <p>This code will expire in 5 minutes for security reasons.</p>
              <p>If you didn't request this code, please ignore this email.</p>
              <div class="footer">
                <p>Best regards,<br>The Wedding Invites Team</p>
              </div>
            </div>
          </body>
        </html>
      `,
    });

    console.log("OTP email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error sending OTP email:", error);
    return new Response(
      JSON.stringify({ error: "An error occurred while processing your request" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
