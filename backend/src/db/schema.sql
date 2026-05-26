-- ============================================================
-- ARIS — Accident Response Intelligence System
-- Database Schema
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─────────────────────────────────────────────────────────────
-- USERS
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        VARCHAR(100)  NOT NULL,
  email       VARCHAR(255)  NOT NULL UNIQUE,
  password    VARCHAR(255)  NOT NULL,
  role        VARCHAR(20)   NOT NULL DEFAULT 'operator'
                CHECK (role IN ('admin', 'operator', 'viewer')),
  phone       VARCHAR(20),
  created_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role  ON users(role);

-- ─────────────────────────────────────────────────────────────
-- CAMERAS
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS cameras (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        VARCHAR(100)  NOT NULL,
  location    VARCHAR(255)  NOT NULL,
  city        VARCHAR(100)  NOT NULL,
  latitude    DECIMAL(10,7) NOT NULL,
  longitude   DECIMAL(10,7) NOT NULL,
  status      VARCHAR(20)   NOT NULL DEFAULT 'active'
                CHECK (status IN ('active', 'inactive', 'maintenance')),
  stream_url  TEXT,
  created_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cameras_city   ON cameras(city);
CREATE INDEX IF NOT EXISTS idx_cameras_status ON cameras(status);

-- ─────────────────────────────────────────────────────────────
-- ACCIDENTS
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS accidents (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  camera_id       UUID REFERENCES cameras(id) ON DELETE SET NULL,
  severity        VARCHAR(20)   NOT NULL
                    CHECK (severity IN ('critical', 'high', 'medium', 'low')),
  status          VARCHAR(20)   NOT NULL DEFAULT 'detected'
                    CHECK (status IN ('detected', 'responding', 'resolved')),
  latitude        DECIMAL(10,7),
  longitude       DECIMAL(10,7),
  location_name   VARCHAR(255),
  description     TEXT,
  image_url       TEXT,
  vehicle_count   INTEGER       DEFAULT 0,
  detected_at     TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  resolved_at     TIMESTAMPTZ,
  created_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_accidents_camera_id   ON accidents(camera_id);
CREATE INDEX IF NOT EXISTS idx_accidents_severity    ON accidents(severity);
CREATE INDEX IF NOT EXISTS idx_accidents_status      ON accidents(status);
CREATE INDEX IF NOT EXISTS idx_accidents_detected_at ON accidents(detected_at DESC);

-- ─────────────────────────────────────────────────────────────
-- ALERTS
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS alerts (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  accident_id       UUID REFERENCES accidents(id) ON DELETE CASCADE,
  type              VARCHAR(20)   NOT NULL
                      CHECK (type IN ('email', 'sms', 'system')),
  recipient_name    VARCHAR(100),
  recipient_contact VARCHAR(255),
  status            VARCHAR(20)   NOT NULL DEFAULT 'pending'
                      CHECK (status IN ('sent', 'failed', 'pending')),
  sent_at           TIMESTAMPTZ,
  created_at        TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_alerts_accident_id ON alerts(accident_id);
CREATE INDEX IF NOT EXISTS idx_alerts_status      ON alerts(status);
CREATE INDEX IF NOT EXISTS idx_alerts_type        ON alerts(type);

-- ─────────────────────────────────────────────────────────────
-- EMERGENCY CONTACTS
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS emergency_contacts (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name                VARCHAR(150)  NOT NULL,
  type                VARCHAR(20)   NOT NULL
                        CHECK (type IN ('police', 'hospital', 'ambulance', 'fire')),
  phone               VARCHAR(20)   NOT NULL,
  email               VARCHAR(255),
  city                VARCHAR(100)  NOT NULL,
  latitude            DECIMAL(10,7),
  longitude           DECIMAL(10,7),
  response_time_avg   INTEGER,      -- minutes
  created_at          TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ec_city ON emergency_contacts(city);
CREATE INDEX IF NOT EXISTS idx_ec_type ON emergency_contacts(type);

-- ─────────────────────────────────────────────────────────────
-- INCIDENTS
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS incidents (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  accident_id     UUID REFERENCES accidents(id) ON DELETE CASCADE,
  responder_name  VARCHAR(100),
  response_time   INTEGER,  -- minutes
  notes           TEXT,
  resolved_at     TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_incidents_accident_id ON incidents(accident_id);

-- ─────────────────────────────────────────────────────────────
-- Auto-update updated_at trigger
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE OR REPLACE TRIGGER update_cameras_updated_at
  BEFORE UPDATE ON cameras
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE TRIGGER update_accidents_updated_at
  BEFORE UPDATE ON accidents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE TRIGGER update_emergency_contacts_updated_at
  BEFORE UPDATE ON emergency_contacts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE TRIGGER update_incidents_updated_at
  BEFORE UPDATE ON incidents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
