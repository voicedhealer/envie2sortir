-- Migration: Fix RLS policies for daily_deals
-- Problème: Les policies essayaient d'accéder à la table users sans permission
-- Solution: Simplifier les policies pour ne vérifier que les professionals

-- Supprimer les anciennes policies
DROP POLICY IF EXISTS "Active deals are viewable by everyone" ON daily_deals;
DROP POLICY IF EXISTS "Only establishment owners can create deals" ON daily_deals;
DROP POLICY IF EXISTS "Only owner or admin can update deals" ON daily_deals;
DROP POLICY IF EXISTS "Only owner or admin can delete deals" ON daily_deals;

-- Tous peuvent voir les bons plans actifs
CREATE POLICY "Active deals are viewable by everyone"
    ON daily_deals FOR SELECT
    USING (
        is_active = true OR
        establishment_id IN (
            SELECT id FROM establishments
            WHERE owner_id = auth.uid()
        )
    );

-- Uniquement les propriétaires peuvent créer
CREATE POLICY "Only establishment owners can create deals"
    ON daily_deals FOR INSERT
    WITH CHECK (
        establishment_id IN (
            SELECT id FROM establishments
            WHERE owner_id = auth.uid()
        )
    );

-- Uniquement le propriétaire peut modifier
CREATE POLICY "Only owner can update deals"
    ON daily_deals FOR UPDATE
    USING (
        establishment_id IN (
            SELECT id FROM establishments
            WHERE owner_id = auth.uid()
        )
    );

-- Uniquement le propriétaire peut supprimer
CREATE POLICY "Only owner can delete deals"
    ON daily_deals FOR DELETE
    USING (
        establishment_id IN (
            SELECT id FROM establishments
            WHERE owner_id = auth.uid()
        )
    );

