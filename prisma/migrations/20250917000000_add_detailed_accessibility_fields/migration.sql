-- Migration pour ajouter les champs d'accessibilité détaillée et services complémentaires

-- Ajouter les champs pour l'accessibilité détaillée
ALTER TABLE establishments ADD COLUMN accessibilityDetails TEXT; -- JSON pour les détails d'accessibilité
ALTER TABLE establishments ADD COLUMN detailedServices TEXT;     -- JSON pour les services détaillés  
ALTER TABLE establishments ADD COLUMN clienteleInfo TEXT;        -- JSON pour les informations clientèle
ALTER TABLE establishments ADD COLUMN detailedPayments TEXT;     -- JSON pour les moyens de paiement détaillés
ALTER TABLE establishments ADD COLUMN childrenServices TEXT;     -- JSON pour les services enfants

-- Commentaires pour documenter les nouveaux champs
-- accessibilityDetails: {"wheelchair_restrooms": true, "hearing_loop": true, "accessible_parking": true}
-- detailedServices: {"gender_neutral_restrooms": true, "pool": true, "wifi": true}
-- clienteleInfo: {"lgbtq_friendly": true, "transgender_safe": true}
-- detailedPayments: {"credit_cards": true, "debit_cards": true, "nfc_payments": true, "restaurant_vouchers": true}
-- childrenServices: {"child_friendly_activities": true, "changing_tables": true}
