-- ============================================
-- Correction RLS: Permettre aux admins de voir et modifier tous les établissements
-- ============================================
-- Problème: Les admins ne peuvent pas voir les établissements en "pending"
--           et ne peuvent pas les mettre à jour
-- Solution: Ajouter une condition pour vérifier si l'utilisateur est admin
-- ============================================

-- 1. Supprimer l'ancienne politique SELECT
DROP POLICY IF EXISTS "Establishments are viewable by owner or if approved" ON establishments;

-- 2. Créer la nouvelle politique SELECT avec accès admin
CREATE POLICY "Establishments are viewable by owner, admin or if approved"
    ON establishments FOR SELECT
    USING (
        -- Les établissements approuvés sont visibles par tous
        status = 'approved' 
        OR
        -- Les propriétaires peuvent voir leurs propres établissements
        owner_id = auth.uid()
        OR
        -- Les admins peuvent voir tous les établissements
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id::text = auth.uid()::text
            AND users.role = 'admin'
        )
    );

-- 3. Supprimer l'ancienne politique UPDATE
DROP POLICY IF EXISTS "Only owner can update establishments" ON establishments;

-- 4. Créer la nouvelle politique UPDATE avec accès admin
CREATE POLICY "Only owner or admin can update establishments"
    ON establishments FOR UPDATE
    USING (
        -- Les propriétaires peuvent modifier leurs établissements
        owner_id = auth.uid()
        OR
        -- Les admins peuvent modifier tous les établissements
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id::text = auth.uid()::text
            AND users.role = 'admin'
        )
    )
    WITH CHECK (
        -- Les propriétaires peuvent modifier leurs établissements
        owner_id = auth.uid()
        OR
        -- Les admins peuvent modifier tous les établissements
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id::text = auth.uid()::text
            AND users.role = 'admin'
        )
    );

-- 5. Supprimer l'ancienne politique DELETE
DROP POLICY IF EXISTS "Only owner can delete establishments" ON establishments;

-- 6. Créer la nouvelle politique DELETE avec accès admin
CREATE POLICY "Only owner or admin can delete establishments"
    ON establishments FOR DELETE
    USING (
        -- Les propriétaires peuvent supprimer leurs établissements
        owner_id = auth.uid()
        OR
        -- Les admins peuvent supprimer tous les établissements
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id::text = auth.uid()::text
            AND users.role = 'admin'
        )
    );

