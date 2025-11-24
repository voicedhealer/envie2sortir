-- ============================================
-- Correction des politiques RLS pour professionals
-- ============================================
-- Permet aux professionnels de lire leurs propres données
-- Nécessaire pour que le client Supabase côté navigateur puisse
-- récupérer les infos du professionnel connecté
-- ============================================

-- Activer RLS si ce n'est pas déjà fait
ALTER TABLE professionals ENABLE ROW LEVEL SECURITY;

-- Supprimer les anciennes politiques si elles existent
DROP POLICY IF EXISTS "Professionals can read their own data" ON professionals;
DROP POLICY IF EXISTS "Professionals can update their own data" ON professionals;
DROP POLICY IF EXISTS "Anyone can create a professional account" ON professionals;

-- Politique SELECT : Un professionnel peut lire ses propres données
CREATE POLICY "Professionals can read their own data"
    ON professionals FOR SELECT
    USING (id = auth.uid());

-- Politique UPDATE : Un professionnel peut mettre à jour ses propres données
CREATE POLICY "Professionals can update their own data"
    ON professionals FOR UPDATE
    USING (id = auth.uid())
    WITH CHECK (id = auth.uid());

-- Politique INSERT : Permettre la création de comptes professionnels
-- (nécessaire pour l'inscription)
CREATE POLICY "Anyone can create a professional account"
    ON professionals FOR INSERT
    WITH CHECK (id = auth.uid());

-- Note : Les opérations admin utilisent le service role key qui bypass RLS

