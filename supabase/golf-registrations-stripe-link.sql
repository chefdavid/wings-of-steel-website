-- Add Stripe payment intent ID linkage to golf_registrations.
-- Safe / additive: no destructive operations, no data loss.
-- Run once in Supabase SQL editor.

ALTER TABLE golf_registrations
  ADD COLUMN IF NOT EXISTS stripe_payment_intent_id TEXT;

CREATE INDEX IF NOT EXISTS idx_golf_registrations_stripe_pi
  ON golf_registrations(stripe_payment_intent_id);

-- Allow the service role (used by Netlify functions) to update rows.
-- The existing public read + insert policies are preserved.
-- Public clients still cannot UPDATE (no anon UPDATE policy exists),
-- so payment_status changes flow only through trusted server code.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'golf_registrations'
      AND policyname = 'Service role can update golf registrations'
  ) THEN
    CREATE POLICY "Service role can update golf registrations"
      ON golf_registrations
      FOR UPDATE
      USING (auth.role() = 'service_role')
      WITH CHECK (auth.role() = 'service_role');
  END IF;
END $$;
