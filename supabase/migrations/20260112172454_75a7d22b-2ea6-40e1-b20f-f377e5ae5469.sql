-- Add payment tracking columns to weddings table
ALTER TABLE public.weddings 
ADD COLUMN IF NOT EXISTS payment_external_id TEXT,
ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'none';

-- Add index for payment lookups
CREATE INDEX IF NOT EXISTS idx_weddings_payment_external_id ON public.weddings(payment_external_id);

-- Add comment for documentation
COMMENT ON COLUMN public.weddings.payment_external_id IS 'External ID used for Whish Pay payment tracking';
COMMENT ON COLUMN public.weddings.payment_status IS 'Payment status: none, pending, paid, failed';