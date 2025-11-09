-- Clean up old custom OTP system tables and functions
-- These are no longer needed since we're using Supabase's built-in OTP

-- Drop the custom OTP codes table
DROP TABLE IF EXISTS public.otp_codes CASCADE;

-- Drop the cleanup functions that were used for the custom OTP system
DROP FUNCTION IF EXISTS public.cleanup_expired_otps() CASCADE;
DROP FUNCTION IF EXISTS public.trigger_cleanup_expired_otps() CASCADE;

-- Note: Supabase's built-in OTP system handles everything automatically
-- including email sending, OTP generation, verification, and expiration