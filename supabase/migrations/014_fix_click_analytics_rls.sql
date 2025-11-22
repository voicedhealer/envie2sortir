-- ============================================
-- Correction RLS pour click_analytics
-- ============================================
-- S'assurer que la politique permet bien aux admins de voir toutes les analytics
-- ============================================

-- Supprimer l'ancienne politique si elle existe
DROP POLICY IF EXISTS "Click analytics are viewable by establishment owners and admins" ON click_analytics;
DROP POLICY IF EXISTS "Admins can view all click analytics" ON click_analytics;

-- Créer une nouvelle politique claire et optimisée pour les admins
CREATE POLICY "Click analytics are viewable by establishment owners and admins"
    ON click_analytics FOR SELECT
    USING (
        -- Les propriétaires peuvent voir les analytics de leurs établissements
        establishment_id IN (
            SELECT id FROM establishments
            WHERE owner_id = auth.uid()
        ) 
        OR
        -- Les admins peuvent voir toutes les analytics
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id::text = auth.uid()::text
            AND users.role = 'admin'
        )
    );

