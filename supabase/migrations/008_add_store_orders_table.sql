-- Captures the schema for store_orders, the table backing the Printify
-- store checkout flow. The table was originally created live; this migration
-- lets a fresh project rebuild it. Idempotent so it's safe to re-run.

CREATE TABLE IF NOT EXISTS store_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_intent_id text NOT NULL UNIQUE,
  status text NOT NULL DEFAULT 'pending',
  customer_email text NOT NULL,
  shipping_address jsonb NOT NULL,
  line_items jsonb NOT NULL,
  subtotal_cents integer NOT NULL DEFAULT 0,
  shipping_cents integer NOT NULL DEFAULT 0,
  tax_cents integer NOT NULL DEFAULT 0,
  donation_amount_cents integer NOT NULL DEFAULT 0,
  fee_cover_cents integer NOT NULL DEFAULT 0,
  total_cents integer NOT NULL DEFAULT 0,
  printify_order_id text,
  printify_response jsonb,
  error_message text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS store_orders_status_idx ON store_orders (status);
CREATE INDEX IF NOT EXISTS store_orders_created_at_idx ON store_orders (created_at DESC);

ALTER TABLE store_orders ENABLE ROW LEVEL SECURITY;

-- No public policies: only the service role (used by Netlify functions)
-- should read/write this table. The service role bypasses RLS by design.
