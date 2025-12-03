-- ============================================
-- Table pour stocker l'historique des statistiques professionnelles
-- ============================================

-- Créer la table professional_stats_snapshots
CREATE TABLE IF NOT EXISTS professional_stats_snapshots (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  snapshot_date DATE NOT NULL,
  snapshot_timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Vue d'ensemble
  total_establishments INTEGER NOT NULL DEFAULT 0,
  premium_count INTEGER NOT NULL DEFAULT 0,
  free_count INTEGER NOT NULL DEFAULT 0,
  conversion_rate NUMERIC(5, 2) NOT NULL DEFAULT 0,
  
  -- Nouveaux établissements
  new_this_week INTEGER NOT NULL DEFAULT 0,
  new_this_month INTEGER NOT NULL DEFAULT 0,
  new_last_month INTEGER NOT NULL DEFAULT 0,
  new_growth NUMERIC(5, 2) NOT NULL DEFAULT 0,
  
  -- Recettes
  revenue_current_month NUMERIC(10, 2) NOT NULL DEFAULT 0,
  revenue_last_month NUMERIC(10, 2) NOT NULL DEFAULT 0,
  revenue_growth NUMERIC(5, 2) NOT NULL DEFAULT 0,
  
  -- Données détaillées (JSONB pour flexibilité)
  monthly_evolution JSONB,
  weekly_evolution JSONB,
  top_categories JSONB,
  monthly_revenue JSONB,
  weekly_revenue JSONB,
  
  -- Métadonnées
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by TEXT -- ID de l'admin qui a créé le snapshot (optionnel)
);

-- Index pour les requêtes par date
CREATE INDEX IF NOT EXISTS idx_professional_stats_snapshots_date 
  ON professional_stats_snapshots(snapshot_date DESC);

CREATE INDEX IF NOT EXISTS idx_professional_stats_snapshots_timestamp 
  ON professional_stats_snapshots(snapshot_timestamp DESC);

-- Index pour les requêtes par période
CREATE INDEX IF NOT EXISTS idx_professional_stats_snapshots_date_range 
  ON professional_stats_snapshots(snapshot_date DESC, snapshot_timestamp DESC);

-- Contrainte d'unicité : un seul snapshot par jour
CREATE UNIQUE INDEX IF NOT EXISTS idx_professional_stats_snapshots_unique_date 
  ON professional_stats_snapshots(snapshot_date);

-- Commentaires pour documentation
COMMENT ON TABLE professional_stats_snapshots IS 'Snapshots quotidiens des statistiques professionnelles pour l''historique';
COMMENT ON COLUMN professional_stats_snapshots.snapshot_date IS 'Date du snapshot (sans heure)';
COMMENT ON COLUMN professional_stats_snapshots.snapshot_timestamp IS 'Timestamp exact du snapshot';
COMMENT ON COLUMN professional_stats_snapshots.monthly_evolution IS 'Évolution mensuelle des établissements (JSON)';
COMMENT ON COLUMN professional_stats_snapshots.weekly_evolution IS 'Évolution hebdomadaire des établissements (JSON)';
COMMENT ON COLUMN professional_stats_snapshots.top_categories IS 'Top 10 des catégories (JSON)';
COMMENT ON COLUMN professional_stats_snapshots.monthly_revenue IS 'Recettes mensuelles (JSON)';
COMMENT ON COLUMN professional_stats_snapshots.weekly_revenue IS 'Recettes hebdomadaires (JSON)';

-- RLS : Seuls les admins peuvent lire et écrire
ALTER TABLE professional_stats_snapshots ENABLE ROW LEVEL SECURITY;

-- Policy pour les admins (lecture et écriture)
CREATE POLICY "Allow admin read for professional_stats_snapshots"
  ON professional_stats_snapshots
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND (users.role = 'admin' OR (auth.jwt() ->> 'role')::text = 'admin')
    )
  );

CREATE POLICY "Allow admin insert for professional_stats_snapshots"
  ON professional_stats_snapshots
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND (users.role = 'admin' OR (auth.jwt() ->> 'role')::text = 'admin')
    )
  );

CREATE POLICY "Allow admin update for professional_stats_snapshots"
  ON professional_stats_snapshots
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND (users.role = 'admin' OR (auth.jwt() ->> 'role')::text = 'admin')
    )
  );

CREATE POLICY "Allow admin delete for professional_stats_snapshots"
  ON professional_stats_snapshots
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND (users.role = 'admin' OR (auth.jwt() ->> 'role')::text = 'admin')
    )
  );

