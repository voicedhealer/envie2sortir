-- Migration pour augmenter la taille du champ ip_address
-- Résout l'erreur 'value too long for type character varying(45)'

ALTER TABLE professional_inquiries 
ALTER COLUMN ip_address TYPE VARCHAR(128);

COMMENT ON COLUMN professional_inquiries.ip_address IS 'Adresse IP pour le rate limiting et la sécurité (première IP de x-forwarded-for)';

