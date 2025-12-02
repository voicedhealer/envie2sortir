-- ============================================
-- Correction de la politique RLS pour etablissement_tags
-- Le problème : owner_id pointe vers professionals.id, pas auth.users.id
-- ============================================

-- Supprimer l'ancienne politique
DROP POLICY IF EXISTS "Tags viewable when establishment approved or owner" ON etablissement_tags;
DROP POLICY IF EXISTS "Only owner can create establishment tags" ON etablissement_tags;
DROP POLICY IF EXISTS "Only owner can update establishment tags" ON etablissement_tags;
DROP POLICY IF EXISTS "Only owner can delete establishment tags" ON etablissement_tags;

-- Recréer les politiques avec la bonne logique
CREATE POLICY "Tags viewable when establishment approved or owner"
    ON etablissement_tags FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM establishments e
            WHERE e.id = etablissement_tags.etablissement_id
            AND (
                e.status = 'approved' OR
                e.owner_id IN (
                    SELECT id FROM professionals
                    WHERE id IN (
                        SELECT id FROM auth.users WHERE id = auth.uid()
                    )
                ) OR
                EXISTS (
                    SELECT 1 FROM users
                    WHERE id = auth.uid()
                    AND role = 'admin'
                )
            )
        )
    );

CREATE POLICY "Only owner can create establishment tags"
    ON etablissement_tags FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM establishments e
            WHERE e.id = etablissement_tags.etablissement_id
            AND e.owner_id IN (
                SELECT id FROM professionals
                WHERE id IN (
                    SELECT id FROM auth.users WHERE id = auth.uid()
                )
            )
        ) OR
        EXISTS (
            SELECT 1 FROM users
            WHERE id = auth.uid()
            AND role = 'admin'
        )
    );

CREATE POLICY "Only owner can update establishment tags"
    ON etablissement_tags FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM establishments e
            WHERE e.id = etablissement_tags.etablissement_id
            AND e.owner_id IN (
                SELECT id FROM professionals
                WHERE id IN (
                    SELECT id FROM auth.users WHERE id = auth.uid()
                )
            )
        ) OR
        EXISTS (
            SELECT 1 FROM users
            WHERE id = auth.uid()
            AND role = 'admin'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM establishments e
            WHERE e.id = etablissement_tags.etablissement_id
            AND e.owner_id IN (
                SELECT id FROM professionals
                WHERE id IN (
                    SELECT id FROM auth.users WHERE id = auth.uid()
                )
            )
        ) OR
        EXISTS (
            SELECT 1 FROM users
            WHERE id = auth.uid()
            AND role = 'admin'
        )
    );

CREATE POLICY "Only owner can delete establishment tags"
    ON etablissement_tags FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM establishments e
            WHERE e.id = etablissement_tags.etablissement_id
            AND e.owner_id IN (
                SELECT id FROM professionals
                WHERE id IN (
                    SELECT id FROM auth.users WHERE id = auth.uid()
                )
            )
        ) OR
        EXISTS (
            SELECT 1 FROM users
            WHERE id = auth.uid()
            AND role = 'admin'
        )
    );

