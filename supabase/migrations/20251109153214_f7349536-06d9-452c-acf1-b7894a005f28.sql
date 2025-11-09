-- Create a simple OTP codes table for custom OTP system
CREATE TABLE IF NOT EXISTS public.otp_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  code text NOT NULL,
  expires_at timestamp with time zone NOT NULL,
  used boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.otp_codes ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert OTP codes (for signup)
CREATE POLICY "Anyone can insert OTP codes"
ON public.otp_codes
FOR INSERT
WITH CHECK (true);

-- Allow anyone to select their own OTP codes
CREATE POLICY "Anyone can select OTP codes"
ON public.otp_codes
FOR SELECT
USING (true);

-- Allow anyone to update OTP codes (mark as used)
CREATE POLICY "Anyone can update OTP codes"
ON public.otp_codes
FOR UPDATE
USING (true);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_otp_codes_email_expires 
ON public.otp_codes(email, expires_at DESC) 
WHERE used = false;

-- Auto-cleanup function for expired OTPs
CREATE OR REPLACE FUNCTION cleanup_expired_otps()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  DELETE FROM public.otp_codes 
  WHERE expires_at < NOW() OR (used = true AND created_at < NOW() - INTERVAL '1 day');
$$;