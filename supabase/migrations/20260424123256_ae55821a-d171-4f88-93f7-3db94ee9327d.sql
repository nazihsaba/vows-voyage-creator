-- 1. Add country_code column (nullable, no default to keep legacy rows distinguishable)
ALTER TABLE public.invitation_links
ADD COLUMN IF NOT EXISTS country_code text;

-- 2. Backfill: split existing phone_number values that contain a leading '+<digits>' country code.
--    Strategy: take the leading '+' followed by 1-4 digits as the country code, the rest as the phone.
--    Only applies when phone_number starts with '+' and country_code is not yet set.
UPDATE public.invitation_links
SET
  country_code = substring(phone_number FROM '^(\+\d{1,4})'),
  phone_number = regexp_replace(phone_number, '^\+\d{1,4}', '')
WHERE phone_number IS NOT NULL
  AND phone_number ~ '^\+\d{1,4}'
  AND country_code IS NULL;

-- 3. For any remaining rows that have a phone_number without a leading '+', leave country_code NULL
--    so the UI can prompt the user to set it. No destructive change.
