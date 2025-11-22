-- ============================================
-- Migration : Table des événements de sécurité
-- ============================================
-- Cette table permet de logger les tentatives de connexion,
-- les requêtes bloquées, et autres événements de sécurité
-- ============================================

CREATE TABLE IF NOT EXISTS security_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type TEXT NOT NULL CHECK (type IN ('failed_login', 'blocked_request', 'suspicious_activity', 'rate_limit_exceeded')),
    ip_address TEXT NOT NULL,
    user_agent TEXT,
    email TEXT,
    details JSONB,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Index pour les requêtes fréquentes
CREATE INDEX idx_security_events_type ON security_events(type);
CREATE INDEX idx_security_events_ip ON security_events(ip_address);
CREATE INDEX idx_security_events_created_at ON security_events(created_at DESC);
CREATE INDEX idx_security_events_email ON security_events(email) WHERE email IS NOT NULL;

-- RLS : Seuls les admins peuvent lire les événements de sécurité
ALTER TABLE security_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view security events"
    ON security_events
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role = 'admin'
        )
    );

-- Fonction pour nettoyer les anciens événements (plus de 90 jours)
CREATE OR REPLACE FUNCTION cleanup_old_security_events()
RETURNS void AS $$
BEGIN
    DELETE FROM security_events
    WHERE created_at < NOW() - INTERVAL '90 days';
END;
$$ LANGUAGE plpgsql;

