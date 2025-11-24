-- ============================================
-- Table pour stocker les codes SMS de vérification
-- ============================================
-- Cette table stocke temporairement les codes SMS
-- pour la vérification des modifications de profil professionnel
-- ============================================

CREATE TABLE IF NOT EXISTS sms_verification_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    code TEXT NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES professionals(id) ON DELETE CASCADE
);

-- Index pour les recherches rapides
CREATE INDEX IF NOT EXISTS idx_sms_verification_codes_user_id ON sms_verification_codes(user_id);
CREATE INDEX IF NOT EXISTS idx_sms_verification_codes_expires_at ON sms_verification_codes(expires_at);

-- Supprimer automatiquement les codes expirés (via un job périodique ou trigger)
-- Pour l'instant, on les supprime manuellement lors de la vérification

-- RLS : Les professionnels peuvent seulement lire leurs propres codes
ALTER TABLE sms_verification_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Professionals can manage their own SMS codes"
    ON sms_verification_codes
    FOR ALL
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

