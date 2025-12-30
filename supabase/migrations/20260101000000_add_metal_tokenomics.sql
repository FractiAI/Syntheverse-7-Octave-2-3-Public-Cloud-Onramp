-- ============================================
-- 2026-01-01: Metal Tokenomics (Gold/Silver/Copper)
-- ============================================
-- Introduces per-metal genesis supplies and per-epoch balances per metal.
--
-- Initial Supply:
-- - 45T  SYNTHG (Gold)
-- - 22.5T SYNTHS (Silver)
-- - 22.5T SYNTHC (Copper)
--
-- Epoch distribution (halving cadence):
-- - Founder:   50.0%
-- - Pioneer:   25.0%
-- - Community: 12.5%
-- - Ecosystem: 12.5%

-- 1) Extend tokenomics table with per-metal supplies and distributed totals
ALTER TABLE IF EXISTS tokenomics
  ADD COLUMN IF NOT EXISTS total_supply_gold numeric(20,0) NOT NULL DEFAULT '45000000000000',
  ADD COLUMN IF NOT EXISTS total_supply_silver numeric(20,0) NOT NULL DEFAULT '22500000000000',
  ADD COLUMN IF NOT EXISTS total_supply_copper numeric(20,0) NOT NULL DEFAULT '22500000000000',
  ADD COLUMN IF NOT EXISTS total_distributed_gold numeric(20,0) NOT NULL DEFAULT '0',
  ADD COLUMN IF NOT EXISTS total_distributed_silver numeric(20,0) NOT NULL DEFAULT '0',
  ADD COLUMN IF NOT EXISTS total_distributed_copper numeric(20,0) NOT NULL DEFAULT '0';

-- Ensure main record exists (backward compatible)
INSERT INTO tokenomics (
  id,
  total_supply,
  total_distributed,
  total_supply_gold,
  total_supply_silver,
  total_supply_copper,
  total_distributed_gold,
  total_distributed_silver,
  total_distributed_copper,
  current_epoch,
  founder_halving_count
)
VALUES (
  'main',
  '90000000000000',
  '0',
  '45000000000000',
  '22500000000000',
  '22500000000000',
  '0',
  '0',
  '0',
  'founder',
  0
)
ON CONFLICT (id) DO NOTHING;

-- 2) Create per-epoch balances per metal
CREATE TABLE IF NOT EXISTS epoch_metal_balances (
  id text PRIMARY KEY NOT NULL,
  epoch text NOT NULL,
  metal text NOT NULL,
  balance numeric(20,0) NOT NULL,
  threshold numeric(20,0) NOT NULL,
  distribution_amount numeric(20,0) NOT NULL,
  distribution_percent numeric(5,2) NOT NULL,
  updated_at timestamp DEFAULT now() NOT NULL,
  CONSTRAINT epoch_metal_balances_epoch_metal_unique UNIQUE (epoch, metal)
);

CREATE INDEX IF NOT EXISTS idx_epoch_metal_balances_epoch ON epoch_metal_balances(epoch);
CREATE INDEX IF NOT EXISTS idx_epoch_metal_balances_metal ON epoch_metal_balances(metal);

-- 3) Seed epoch balances for each metal (only if missing)
-- Gold supply: 45T
INSERT INTO epoch_metal_balances (id, epoch, metal, balance, threshold, distribution_amount, distribution_percent)
VALUES
  ('epoch_founder_gold',    'founder',   'gold',   '22500000000000', '0', '22500000000000', 50.0),
  ('epoch_pioneer_gold',    'pioneer',   'gold',   '11250000000000', '0', '11250000000000', 25.0),
  ('epoch_community_gold',  'community', 'gold',   '5625000000000',  '0', '5625000000000',  12.5),
  ('epoch_ecosystem_gold',  'ecosystem', 'gold',   '5625000000000',  '0', '5625000000000',  12.5)
ON CONFLICT (id) DO NOTHING;

-- Silver supply: 22.5T
INSERT INTO epoch_metal_balances (id, epoch, metal, balance, threshold, distribution_amount, distribution_percent)
VALUES
  ('epoch_founder_silver',   'founder',   'silver', '11250000000000', '0', '11250000000000', 50.0),
  ('epoch_pioneer_silver',   'pioneer',   'silver', '5625000000000',  '0', '5625000000000',  25.0),
  ('epoch_community_silver', 'community', 'silver', '2812500000000',  '0', '2812500000000',  12.5),
  ('epoch_ecosystem_silver', 'ecosystem', 'silver', '2812500000000',  '0', '2812500000000',  12.5)
ON CONFLICT (id) DO NOTHING;

-- Copper supply: 22.5T
INSERT INTO epoch_metal_balances (id, epoch, metal, balance, threshold, distribution_amount, distribution_percent)
VALUES
  ('epoch_founder_copper',   'founder',   'copper', '11250000000000', '0', '11250000000000', 50.0),
  ('epoch_pioneer_copper',   'pioneer',   'copper', '5625000000000',  '0', '5625000000000',  25.0),
  ('epoch_community_copper', 'community', 'copper', '2812500000000',  '0', '2812500000000',  12.5),
  ('epoch_ecosystem_copper', 'ecosystem', 'copper', '2812500000000',  '0', '2812500000000',  12.5)
ON CONFLICT (id) DO NOTHING;


