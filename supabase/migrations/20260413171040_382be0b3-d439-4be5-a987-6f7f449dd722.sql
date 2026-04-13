
-- Trigger function to enforce max 1 share per wedding
CREATE OR REPLACE FUNCTION public.enforce_single_share()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF (SELECT count(*) FROM public.wedding_shares WHERE wedding_id = NEW.wedding_id) >= 1 THEN
    RAISE EXCEPTION 'This event can only be shared with one account';
  END IF;
  RETURN NEW;
END;
$$;

-- Attach trigger before insert
CREATE TRIGGER enforce_single_share_trigger
BEFORE INSERT ON public.wedding_shares
FOR EACH ROW
EXECUTE FUNCTION public.enforce_single_share();
