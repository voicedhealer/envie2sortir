-- Migration pour ajouter le système de waitlist premium
-- Permet aux professionnels de s'inscrire en waitlist et d'avoir accès au premium gratuitement
-- jusqu'au lancement officiel où les paiements Stripe seront activés

-- 1. Ajouter la colonne premium_activation_date à la table professionals
-- Cette colonne stocke la date à laquelle le premium a été activé (après le lancement)
ALTER TABLE professionals 
ADD COLUMN IF NOT EXISTS premium_activation_date TIMESTAMP WITH TIME ZONE;

-- Commentaire pour la documentation
COMMENT ON COLUMN professionals.premium_activation_date IS 'Date d''activation du premium après le lancement officiel';

-- 2. Créer la table subscription_logs pour tracker les changements de statut
CREATE TABLE IF NOT EXISTS subscription_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  professional_id UUID NOT NULL REFERENCES professionals(id) ON DELETE CASCADE,
  old_status TEXT, -- Ancien statut (FREE, PREMIUM, WAITLIST_BETA, ou NULL)
  new_status TEXT NOT NULL, -- Nouveau statut
  reason TEXT, -- Raison du changement : 'waitlist_join', 'launch_activation', 'payment_success', 'admin_activation', etc.
  changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour les recherches
CREATE INDEX IF NOT EXISTS idx_subscription_logs_professional_id 
  ON subscription_logs(professional_id);

CREATE INDEX IF NOT EXISTS idx_subscription_logs_changed_at 
  ON subscription_logs(changed_at DESC);

CREATE INDEX IF NOT EXISTS idx_subscription_logs_new_status 
  ON subscription_logs(new_status);

-- Index composite pour les requêtes fréquentes
CREATE INDEX IF NOT EXISTS idx_subscription_logs_professional_status 
  ON subscription_logs(professional_id, new_status);

-- RLS (Row Level Security) - Permettre la lecture aux professionnels concernés et aux admins
ALTER TABLE subscription_logs ENABLE ROW LEVEL SECURITY;

-- Policy pour permettre la lecture aux professionnels de leurs propres logs
CREATE POLICY "Allow professionals to read their own subscription logs"
  ON subscription_logs
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM professionals
      WHERE professionals.id = subscription_logs.professional_id
      AND professionals.id = (
        SELECT id FROM professionals 
        WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
        LIMIT 1
      )
    )
  );

-- Policy pour permettre la lecture aux admins
CREATE POLICY "Allow admin read for subscription logs"
  ON subscription_logs
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Policy pour permettre l'insertion aux admins et au système (via service role)
CREATE POLICY "Allow admin and system insert for subscription logs"
  ON subscription_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Commentaires pour la documentation
COMMENT ON TABLE subscription_logs IS 'Historique des changements de statut d''abonnement des professionnels';
COMMENT ON COLUMN subscription_logs.professional_id IS 'ID du professionnel concerné';
COMMENT ON COLUMN subscription_logs.old_status IS 'Ancien statut (FREE, PREMIUM, WAITLIST_BETA, ou NULL)';
COMMENT ON COLUMN subscription_logs.new_status IS 'Nouveau statut (FREE, PREMIUM, WAITLIST_BETA)';
COMMENT ON COLUMN subscription_logs.reason IS 'Raison du changement : waitlist_join, launch_activation, payment_success, admin_activation, etc.';
COMMENT ON COLUMN subscription_logs.changed_at IS 'Date et heure du changement';

-- 3. Ajouter 'WAITLIST_BETA' à l'enum subscription_plan
-- subscription_plan est un ENUM PostgreSQL, il faut ajouter la valeur à l'enum
DO $$
BEGIN
  -- Vérifier si la valeur existe déjà dans l'enum
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum 
    WHERE enumlabel = 'WAITLIST_BETA' 
    AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'subscription_plan')
  ) THEN
    -- Ajouter la valeur à l'enum
    ALTER TYPE subscription_plan ADD VALUE 'WAITLIST_BETA';
  END IF;
END $$;

-- Note: establishments.subscription utilise aussi le même enum subscription_plan
-- donc pas besoin de le modifier séparément

