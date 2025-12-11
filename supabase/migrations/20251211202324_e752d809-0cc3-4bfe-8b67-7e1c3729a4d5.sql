-- CRITICAL FIX: Remove public access to otp_codes table
-- This table should ONLY be accessed by server-side functions using service role

-- Drop all existing public policies
DROP POLICY IF EXISTS "Anyone can insert OTP codes" ON public.otp_codes;
DROP POLICY IF EXISTS "Anyone can select OTP codes" ON public.otp_codes;
DROP POLICY IF EXISTS "Anyone can update OTP codes" ON public.otp_codes;

-- The otp_codes table should have NO public RLS policies
-- All OTP operations should go through edge functions with service role key
-- This completely locks down the table from client-side access