-- Correction des politiques RLS pour messages avec fonction de sécurité
-- Le problème : la politique RLS essaie de lire la table users mais RLS bloque cette lecture
-- Solution : créer une fonction security definer qui peut lire users en contournant RLS

-- ÉTAPE 1 : Supprimer d'abord toutes les anciennes politiques qui utilisent la fonction
DROP POLICY IF EXISTS "Professionals and admins can view messages" ON messages;

-- ÉTAPE 2 : Maintenant on peut supprimer la fonction en toute sécurité
DROP FUNCTION IF EXISTS is_user_admin(TEXT);

-- ÉTAPE 3 : Créer une fonction pour vérifier si l'utilisateur est admin
-- Cette fonction utilise SECURITY DEFINER pour contourner RLS lors de la vérification
-- Elle s'exécute avec les privilèges du créateur (postgres/superuser) et peut donc lire users
CREATE OR REPLACE FUNCTION is_user_admin(user_id TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
BEGIN
  -- Vérifier si l'utilisateur est admin en contournant RLS
  RETURN EXISTS (
    SELECT 1 FROM users
    WHERE users.id::text = user_id::text
    AND users.role = 'admin'
  );
END;
$$;

-- ÉTAPE 4 : Donner les permissions d'exécution à tous les utilisateurs authentifiés
GRANT EXECUTE ON FUNCTION is_user_admin(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION is_user_admin(TEXT) TO anon;

-- Créer une nouvelle politique qui utilise la fonction de sécurité
CREATE POLICY "Professionals and admins can view messages"
    ON messages FOR SELECT
    USING (
        -- Les admins peuvent voir tous les messages (via fonction qui contourne RLS)
        is_user_admin(auth.uid()::text)
        OR
        -- Les professionnels peuvent voir les messages de leurs conversations
        conversation_id IN (
            SELECT id FROM conversations
            WHERE professional_id::text = auth.uid()::text
        )
    );

-- La politique INSERT reste la même (déjà correcte)
-- Pas besoin de la modifier

