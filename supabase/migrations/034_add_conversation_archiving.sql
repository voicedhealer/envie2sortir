-- ============================================
-- Migration: Ajout de l'archivage automatique des conversations
-- ============================================

-- Ajouter le champ closed_at pour tracker quand une conversation a été fermée
ALTER TABLE conversations
ADD COLUMN IF NOT EXISTS closed_at TIMESTAMPTZ;

-- Créer un index sur closed_at pour optimiser les requêtes d'archivage
CREATE INDEX IF NOT EXISTS idx_conversations_closed_at ON conversations(closed_at) WHERE closed_at IS NOT NULL;

-- Fonction pour mettre à jour closed_at quand le statut passe à 'closed'
CREATE OR REPLACE FUNCTION update_conversation_closed_at()
RETURNS TRIGGER AS $$
BEGIN
  -- Si le statut passe à 'closed' et que closed_at n'est pas encore défini
  IF NEW.status = 'closed' AND OLD.status != 'closed' AND NEW.closed_at IS NULL THEN
    NEW.closed_at = NOW();
  -- Si le statut passe à 'open', réinitialiser closed_at
  ELSIF NEW.status = 'open' AND OLD.status = 'closed' THEN
    NEW.closed_at = NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour mettre à jour automatiquement closed_at
DROP TRIGGER IF EXISTS trigger_update_conversation_closed_at ON conversations;
CREATE TRIGGER trigger_update_conversation_closed_at
  BEFORE UPDATE ON conversations
  FOR EACH ROW
  EXECUTE FUNCTION update_conversation_closed_at();

-- Fonction pour supprimer automatiquement les conversations fermées depuis plus de 45 jours
CREATE OR REPLACE FUNCTION archive_old_closed_conversations()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  -- Supprimer les conversations fermées depuis plus de 45 jours
  -- Les messages seront supprimés automatiquement grâce à ON DELETE CASCADE
  WITH deleted AS (
    DELETE FROM conversations
    WHERE status = 'closed'
      AND closed_at IS NOT NULL
      AND closed_at < NOW() - INTERVAL '45 days'
    RETURNING id
  )
  SELECT COUNT(*) INTO deleted_count FROM deleted;
  
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Commentaire pour documentation
COMMENT ON FUNCTION archive_old_closed_conversations() IS 
  'Supprime automatiquement les conversations fermées depuis plus de 45 jours. Retourne le nombre de conversations supprimées.';

-- Mettre à jour les conversations déjà fermées pour définir closed_at
-- Utiliser updated_at comme approximation si disponible
UPDATE conversations
SET closed_at = COALESCE(updated_at, created_at)
WHERE status = 'closed' AND closed_at IS NULL;

