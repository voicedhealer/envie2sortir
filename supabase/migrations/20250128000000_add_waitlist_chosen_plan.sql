-- Migration pour ajouter le plan choisi en waitlist
-- Permet de stocker le plan (free ou premium) choisi lors de l'inscription en waitlist
-- et le type d'abonnement (monthly ou annual) pour le basculement au moment de l'activation

-- Ajouter la colonne waitlist_chosen_plan pour stocker le plan choisi (free ou premium)
ALTER TABLE professionals 
ADD COLUMN IF NOT EXISTS waitlist_chosen_plan TEXT CHECK (waitlist_chosen_plan IN ('free', 'premium') OR waitlist_chosen_plan IS NULL);

-- Ajouter la colonne waitlist_chosen_plan_type pour stocker le type d'abonnement (monthly ou annual)
ALTER TABLE professionals 
ADD COLUMN IF NOT EXISTS waitlist_chosen_plan_type TEXT CHECK (waitlist_chosen_plan_type IN ('monthly', 'annual') OR waitlist_chosen_plan_type IS NULL);

-- Commentaires pour la documentation
COMMENT ON COLUMN professionals.waitlist_chosen_plan IS 'Plan choisi lors de l''inscription en waitlist (free ou premium)';
COMMENT ON COLUMN professionals.waitlist_chosen_plan_type IS 'Type d''abonnement choisi pour le plan premium (monthly ou annual)';




