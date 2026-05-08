-- Photo gallery storage. Holds compressed JPEGs uploaded by the
-- import-tournament-gallery script. Public-read so the site can
-- serve images directly from the Supabase CDN; anon write so the
-- import script (run locally with the anon key) can upload without
-- needing service-role credentials in the script's env.
--
-- Layout in the bucket:
--   <tournament-slug>/<game-slug>/<photo>.jpg            (large, ~2400px)
--   _thumbs/<tournament-slug>/<game-slug>/<photo>.jpg    (thumbnail, ~400px)
--
-- Run once, then use scripts/import-tournament-gallery.mjs to populate.

INSERT INTO storage.buckets (id, name, public)
VALUES ('gallery', 'gallery', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "Public read gallery" ON storage.objects;
DROP POLICY IF EXISTS "Anon insert gallery" ON storage.objects;
DROP POLICY IF EXISTS "Anon update gallery" ON storage.objects;
DROP POLICY IF EXISTS "Anon delete gallery" ON storage.objects;

CREATE POLICY "Public read gallery" ON storage.objects
  FOR SELECT USING (bucket_id = 'gallery');

CREATE POLICY "Anon insert gallery" ON storage.objects
  FOR INSERT TO anon WITH CHECK (bucket_id = 'gallery');

CREATE POLICY "Anon update gallery" ON storage.objects
  FOR UPDATE TO anon USING (bucket_id = 'gallery') WITH CHECK (bucket_id = 'gallery');

CREATE POLICY "Anon delete gallery" ON storage.objects
  FOR DELETE TO anon USING (bucket_id = 'gallery');
