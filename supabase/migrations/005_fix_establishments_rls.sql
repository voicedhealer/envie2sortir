-- ============================================
-- Correction des politiques RLS pour establishments
-- ============================================
-- Le problème : La politique vérifie la table 'users' pour les admins,
-- ce qui échoue pour les professionnels car ils n'ont pas accès à cette table.
-- Solution : Simplifier la politique pour vérifier directement owner_id = auth.uid()
-- ============================================

-- Supprimer les anciennes politiques
DROP POLICY IF EXISTS "Establishments are viewable by everyone if approved" ON establishments;
DROP POLICY IF EXISTS "Only owner or admin can update establishments" ON establishments;
DROP POLICY IF EXISTS "Only owner or admin can delete establishments" ON establishments;

-- Nouvelle politique SELECT : Plus simple et efficace
-- Les propriétaires peuvent voir leurs propres établissements (même non approuvés)
-- Tous peuvent voir les établissements approuvés
CREATE POLICY "Establishments are viewable by owner or if approved"
    ON establishments FOR SELECT
    USING (
        -- Les établissements approuvés sont visibles par tous
        status = 'approved' OR
        -- Les propriétaires peuvent voir leurs propres établissements
        owner_id = auth.uid()
    );

-- Nouvelle politique UPDATE : Le propriétaire peut modifier son établissement
CREATE POLICY "Only owner can update establishments"
    ON establishments FOR UPDATE
    USING (owner_id = auth.uid())
    WITH CHECK (owner_id = auth.uid());

-- Nouvelle politique DELETE : Le propriétaire peut supprimer son établissement
CREATE POLICY "Only owner can delete establishments"
    ON establishments FOR DELETE
    USING (owner_id = auth.uid());

-- Note : Pour les admins, on peut créer une politique séparée si nécessaire
-- ou utiliser le client admin dans les routes API admin

