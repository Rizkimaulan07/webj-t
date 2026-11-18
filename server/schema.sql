CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  identifier TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  address TEXT NOT NULL,
  city_id TEXT NOT NULL,
  postal_code TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS addresses_user_id_label_idx
  ON addresses (user_id, label);

CREATE TABLE IF NOT EXISTS shipments (
  awb TEXT PRIMARY KEY,
  owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  service TEXT NOT NULL,
  origin TEXT NOT NULL,
  destination TEXT NOT NULL,
  receiver_masked TEXT NOT NULL,
  weight_kg NUMERIC NOT NULL,
  created_at TIMESTAMPTZ NOT NULL,
  payload JSONB NOT NULL
);

CREATE INDEX IF NOT EXISTS shipments_owner_id_created_at_idx
  ON shipments (owner_id, created_at DESC);

CREATE TABLE IF NOT EXISTS tracking_events (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  awb TEXT NOT NULL REFERENCES shipments(awb) ON DELETE CASCADE,
  event_time TIMESTAMPTZ NOT NULL,
  title TEXT NOT NULL,
  location TEXT NOT NULL,
  done BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE INDEX IF NOT EXISTS tracking_events_awb_time_idx
  ON tracking_events (awb, event_time);
