-- Migration pour rendre password_hash nullable dans la table professionals
-- Avec Supabase Auth, le mot de passe est géré par Auth, pas dans notre table

-- Rendre password_hash nullable dans professionals
ALTER TABLE professionals 
ALTER COLUMN password_hash DROP NOT NULL;

-- Optionnel : Ajouter un commentaire pour expliquer
COMMENT ON COLUMN professionals.password_hash IS 'Déprécié : Le mot de passe est maintenant géré par Supabase Auth. Cette colonne est conservée pour compatibilité avec les anciennes données.';

