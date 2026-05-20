
CREATE OR REPLACE FUNCTION pg_temp.fix_title(s text) RETURNS text AS $$
DECLARE
  parts text[];
  i int;
  result text := '';
  trimmed text;
BEGIN
  IF s IS NULL THEN RETURN NULL; END IF;
  trimmed := btrim(s);
  IF trimmed = '' THEN RETURN s; END IF;
  parts := regexp_split_to_array(trimmed, '\s+');
  FOR i IN 1..array_length(parts,1) LOOP
    IF i > 1 THEN result := result || ' '; END IF;
    result := result || upper(substr(parts[i],1,1)) || lower(substr(parts[i],2));
  END LOOP;
  RETURN result;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

UPDATE public.weddings
SET groom_name = pg_temp.fix_title(groom_name),
    bride_name = pg_temp.fix_title(bride_name),
    groom_family = CASE WHEN groom_family IS NULL OR groom_family = '' THEN groom_family ELSE pg_temp.fix_title(groom_family) END,
    bride_family = CASE WHEN bride_family IS NULL OR bride_family = '' THEN bride_family ELSE pg_temp.fix_title(bride_family) END
WHERE groom_name IS NOT NULL OR bride_name IS NOT NULL;

UPDATE public.invitees
SET name = pg_temp.fix_title(name)
WHERE name IS NOT NULL AND name <> '';

UPDATE public.invitation_links
SET link_name = pg_temp.fix_title(link_name)
WHERE link_name IS NOT NULL AND link_name <> '';
