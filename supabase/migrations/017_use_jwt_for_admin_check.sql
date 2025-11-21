-- Migration 017: Utiliser les métadonnées JWT pour vérifier le rôle admin
-- Cela évite de lire la table users qui a ses propres RLS

-- ÉTAPE 1: Supprimer l'ancienne politique
DROP POLICY IF EXISTS "Professionals and admins can view messages" ON messages;

-- ÉTAPE 2: Supprimer l'ancienne fonction qui lit users
DROP FUNCTION IF EXISTS is_user_admin(TEXT);

-- ÉTAPE 3: Créer une nouvelle politique qui utilise les métadonnées JWT
-- Les métadonnées JWT sont accessibles via auth.jwt() et ne sont pas soumises aux RLS
CREATE POLICY "Professionals and admins can view messages"
    ON messages FOR SELECT
    USING (
        -- Les admins peuvent voir tous les messages (via JWT metadata)
        COALESCE(
            (auth.jwt() -> 'app_metadata' ->> 'role')::text = 'admin',
            false
        )
        OR
        -- Les professionnels peuvent voir les messages de leurs conversations
        conversation_id IN (
            SELECT id FROM conversations
            WHERE professional_id::text = auth.uid()::text
        )
    );

-- ÉTAPE 4: Créer un trigger pour synchroniser le rôle dans app_metadata
-- Ce trigger s'exécute quand un utilisateur change de rôle dans la table users
CREATE OR REPLACE FUNCTION sync_user_role_to_jwt()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Mettre à jour les app_metadata de l'utilisateur avec son nouveau rôle
  -- Cela permettra d'accéder au rôle via auth.jwt() sans lire la table users
  UPDATE auth.users
  SET raw_app_meta_data = 
    COALESCE(raw_app_meta_data, '{}'::jsonb) || 
    jsonb_build_object('role', NEW.role)
  WHERE id = NEW.id::uuid;
  
  RETURN NEW;
END;
$$;

-- ÉTAPE 5: Créer le trigger sur INSERT et UPDATE de users
DROP TRIGGER IF EXISTS sync_user_role_trigger ON users;
CREATE TRIGGER sync_user_role_trigger
  AFTER INSERT OR UPDATE OF role ON users
  FOR EACH ROW
  EXECUTE FUNCTION sync_user_role_to_jwt();

-- ÉTAPE 6: Synchroniser les rôles existants dans les métadonnées JWT
-- Pour tous les utilisateurs existants, mettre à jour leurs app_metadata
DO $$
DECLARE
  user_record RECORD;
BEGIN
  FOR user_record IN 
    SELECT u.id, u.role 
    FROM users u
  LOOP
    UPDATE auth.users
    SET raw_app_meta_data = 
      COALESCE(raw_app_meta_data, '{}'::jsonb) || 
      jsonb_build_object('role', user_record.role)
    WHERE id = user_record.id::uuid;
  END LOOP;
END $$;

-- ÉTAPE 7: Vérifier que tout fonctionne
-- Cette requête affiche les rôles des utilisateurs dans auth.users
-- SELECT id, email, raw_app_meta_data->>'role' as role FROM auth.users WHERE raw_app_meta_data->>'role' = 'admin';

