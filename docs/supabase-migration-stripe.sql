-- Migration Supabase : Ajout des colonnes Stripe pour les abonnements
-- À exécuter dans le SQL Editor de Supabase

-- Ajouter les colonnes Stripe à la table professionals
ALTER TABLE professionals
ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT,
ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT;

-- Créer des index pour les recherches rapides
CREATE INDEX IF NOT EXISTS idx_professionals_stripe_customer_id 
ON professionals(stripe_customer_id);

CREATE INDEX IF NOT EXISTS idx_professionals_stripe_subscription_id 
ON professionals(stripe_subscription_id);

-- Commentaires pour documentation
COMMENT ON COLUMN professionals.stripe_customer_id IS 'ID du client Stripe associé au professionnel';
COMMENT ON COLUMN professionals.stripe_subscription_id IS 'ID de l''abonnement Stripe actif';

