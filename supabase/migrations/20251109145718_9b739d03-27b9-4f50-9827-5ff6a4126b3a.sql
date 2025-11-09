-- Update otp_codes table structure for secure OTP storage
ALTER TABLE public.otp_codes 
  DROP COLUMN IF EXISTS code,
  ADD COLUMN IF NOT EXISTS hashed_otp TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_otp_codes_email ON public.otp_codes(email);
CREATE INDEX IF NOT EXISTS idx_otp_codes_expires_at ON public.otp_codes(expires_at);

-- Update cleanup function to run automatically
CREATE OR REPLACE FUNCTION public.cleanup_expired_otps()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = 'public'
AS $$
  DELETE FROM public.otp_codes 
  WHERE expires_at < NOW();
$$;

-- Create a trigger to clean up expired OTPs periodically
-- This will clean up when new OTPs are inserted
CREATE OR REPLACE FUNCTION public.trigger_cleanup_expired_otps()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  DELETE FROM public.otp_codes WHERE expires_at < NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS cleanup_otps_on_insert ON public.otp_codes;
CREATE TRIGGER cleanup_otps_on_insert
  BEFORE INSERT ON public.otp_codes
  FOR EACH STATEMENT
  EXECUTE FUNCTION public.trigger_cleanup_expired_otps();