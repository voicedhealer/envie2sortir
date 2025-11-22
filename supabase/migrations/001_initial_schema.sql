-- ============================================
-- Migration Supabase - Schéma Initial
-- ============================================
-- Ce fichier crée toutes les tables nécessaires
-- pour la migration de envie2sortir vers Supabase
-- ============================================

-- Extension pour générer des UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- ENUMS
-- ============================================

CREATE TYPE user_role AS ENUM ('user', 'admin');
CREATE TYPE establishment_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE subscription_plan AS ENUM ('FREE', 'PREMIUM');
CREATE TYPE admin_action_type AS ENUM ('APPROVE', 'REJECT', 'PENDING', 'DELETE', 'RESTORE', 'UPDATE');
CREATE TYPE conversation_status AS ENUM ('open', 'closed');
CREATE TYPE sender_type AS ENUM ('PROFESSIONAL', 'ADMIN');

-- ============================================
-- TABLES PRINCIPALES
-- ============================================

-- Users (Utilisateurs simples)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT,
    first_name TEXT,
    last_name TEXT,
    name TEXT,
    phone TEXT,
    preferences JSONB,
    newsletter_opt_in BOOLEAN DEFAULT true,
    provider TEXT,
    provider_id TEXT,
    avatar TEXT,
    is_verified BOOLEAN DEFAULT false,
    favorite_city TEXT,
    role user_role DEFAULT 'user',
    karma_points INTEGER DEFAULT 0,
    gamification_badges JSONB,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Professionals (Propriétaires d'établissements)
CREATE TABLE professionals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    siret TEXT UNIQUE NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    phone TEXT NOT NULL,
    company_name TEXT NOT NULL,
    legal_status TEXT NOT NULL,
    subscription_plan subscription_plan DEFAULT 'FREE',
    siret_verified BOOLEAN DEFAULT false,
    siret_verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Professional Update Requests
CREATE TABLE professional_update_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    professional_id UUID NOT NULL REFERENCES professionals(id) ON DELETE CASCADE,
    field_name TEXT NOT NULL,
    old_value TEXT NOT NULL,
    new_value TEXT NOT NULL,
    verification_token TEXT,
    is_email_verified BOOLEAN DEFAULT false,
    sms_code TEXT,
    sms_code_expiry TIMESTAMPTZ,
    is_sms_verified BOOLEAN DEFAULT false,
    status TEXT DEFAULT 'pending',
    rejection_reason TEXT,
    requested_at TIMESTAMPTZ DEFAULT now(),
    reviewed_at TIMESTAMPTZ,
    reviewed_by TEXT,
    CONSTRAINT fk_professional FOREIGN KEY (professional_id) REFERENCES professionals(id) ON DELETE CASCADE
);

-- Establishments (Établissements)
CREATE TABLE establishments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    address TEXT NOT NULL,
    city TEXT,
    postal_code TEXT,
    country TEXT DEFAULT 'France',
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    phone TEXT,
    whatsapp_phone TEXT,
    messenger_url TEXT,
    email TEXT,
    website TEXT,
    instagram TEXT,
    facebook TEXT,
    tiktok TEXT,
    youtube TEXT,
    activities JSONB,
    specialites TEXT DEFAULT '',
    mots_cles_recherche TEXT,
    services JSONB,
    ambiance JSONB,
    payment_methods JSONB,
    horaires_ouverture JSONB,
    prix_moyen DOUBLE PRECISION,
    capacite_max INTEGER,
    accessibilite BOOLEAN DEFAULT false,
    parking BOOLEAN DEFAULT false,
    terrasse BOOLEAN DEFAULT false,
    status establishment_status DEFAULT 'pending',
    subscription subscription_plan DEFAULT 'FREE',
    owner_id UUID UNIQUE NOT NULL REFERENCES professionals(id) ON DELETE CASCADE,
    rejection_reason TEXT,
    rejected_at TIMESTAMPTZ,
    last_modified_at TIMESTAMPTZ,
    views_count INTEGER DEFAULT 0,
    clicks_count INTEGER DEFAULT 0,
    avg_rating DOUBLE PRECISION,
    total_comments INTEGER DEFAULT 0,
    image_url TEXT,
    price_max DOUBLE PRECISION,
    price_min DOUBLE PRECISION,
    informations_pratiques JSONB,
    google_place_id TEXT,
    google_business_url TEXT,
    enriched BOOLEAN DEFAULT false,
    smart_enrichment_data JSONB,
    google_rating DOUBLE PRECISION,
    google_review_count INTEGER,
    envie_tags JSONB,
    the_fork_link TEXT,
    uber_eats_link TEXT,
    enrichment_data JSONB,
    price_level INTEGER,
    specialties JSONB,
    atmosphere JSONB,
    accessibility JSONB,
    accessibility_details JSONB,
    detailed_services JSONB,
    clientele_info JSONB,
    detailed_payments JSONB,
    children_services JSONB,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT fk_owner FOREIGN KEY (owner_id) REFERENCES professionals(id) ON DELETE CASCADE
);

-- Events (Événements)
CREATE TABLE events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    establishment_id UUID NOT NULL REFERENCES establishments(id) ON DELETE CASCADE,
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ,
    price DOUBLE PRECISION,
    price_unit TEXT,
    max_capacity INTEGER,
    is_recurring BOOLEAN DEFAULT false,
    modality TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT fk_establishment FOREIGN KEY (establishment_id) REFERENCES establishments(id) ON DELETE CASCADE
);

-- User Comments (Commentaires/Avis)
CREATE TABLE user_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content TEXT NOT NULL,
    rating INTEGER NOT NULL,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    establishment_id UUID NOT NULL REFERENCES establishments(id) ON DELETE CASCADE,
    establishment_reply TEXT,
    replied_at TIMESTAMPTZ,
    is_reported BOOLEAN DEFAULT false,
    report_reason TEXT,
    reported_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_establishment FOREIGN KEY (establishment_id) REFERENCES establishments(id) ON DELETE CASCADE
);

-- User Favorites
CREATE TABLE user_favorites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    establishment_id UUID NOT NULL REFERENCES establishments(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_establishment FOREIGN KEY (establishment_id) REFERENCES establishments(id) ON DELETE CASCADE,
    UNIQUE(user_id, establishment_id)
);

-- User Likes
CREATE TABLE user_likes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    establishment_id UUID NOT NULL REFERENCES establishments(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_establishment FOREIGN KEY (establishment_id) REFERENCES establishments(id) ON DELETE CASCADE,
    UNIQUE(user_id, establishment_id)
);

-- Etablissement Tags
CREATE TABLE etablissement_tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    etablissement_id UUID NOT NULL REFERENCES establishments(id) ON DELETE CASCADE,
    tag TEXT NOT NULL,
    type_tag TEXT NOT NULL,
    poids INTEGER DEFAULT 5,
    created_at TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT fk_establishment FOREIGN KEY (etablissement_id) REFERENCES establishments(id) ON DELETE CASCADE
);

-- Daily Deals (Bons plans)
CREATE TABLE daily_deals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    establishment_id UUID NOT NULL REFERENCES establishments(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    original_price DOUBLE PRECISION,
    discounted_price DOUBLE PRECISION,
    image_url TEXT,
    pdf_url TEXT,
    date_debut TIMESTAMPTZ NOT NULL,
    date_fin TIMESTAMPTZ NOT NULL,
    heure_debut TEXT,
    heure_fin TEXT,
    is_active BOOLEAN DEFAULT true,
    is_dismissed JSONB,
    modality TEXT,
    is_recurring BOOLEAN DEFAULT false,
    recurrence_type TEXT,
    recurrence_days JSONB,
    recurrence_end_date TIMESTAMPTZ,
    short_title TEXT,
    short_description TEXT,
    promo_url TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT fk_establishment FOREIGN KEY (establishment_id) REFERENCES establishments(id) ON DELETE CASCADE
);

-- Deal Engagements
CREATE TABLE deal_engagements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    deal_id UUID NOT NULL REFERENCES daily_deals(id) ON DELETE CASCADE,
    establishment_id UUID NOT NULL REFERENCES establishments(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    user_ip TEXT NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT now(),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT fk_deal FOREIGN KEY (deal_id) REFERENCES daily_deals(id) ON DELETE CASCADE,
    CONSTRAINT fk_establishment FOREIGN KEY (establishment_id) REFERENCES establishments(id) ON DELETE CASCADE,
    UNIQUE(deal_id, user_ip)
);

-- Event Engagements
CREATE TABLE event_engagements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT fk_event FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
    CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(event_id, user_id)
);

-- Featured Promotions
CREATE TABLE featured_promotions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    establishment_id UUID NOT NULL REFERENCES establishments(id) ON DELETE CASCADE,
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ,
    discount DOUBLE PRECISION,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT fk_establishment FOREIGN KEY (establishment_id) REFERENCES establishments(id) ON DELETE CASCADE
);

-- Images
CREATE TABLE images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    url TEXT NOT NULL,
    alt_text TEXT,
    is_primary BOOLEAN DEFAULT false,
    is_card_image BOOLEAN DEFAULT false,
    ordre INTEGER DEFAULT 0,
    establishment_id UUID NOT NULL REFERENCES establishments(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT fk_establishment FOREIGN KEY (establishment_id) REFERENCES establishments(id) ON DELETE CASCADE
);

-- Establishment Menus
CREATE TABLE establishment_menus (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    file_url TEXT NOT NULL,
    file_name TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    mime_type TEXT DEFAULT 'application/pdf',
    "order" INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    establishment_id UUID NOT NULL REFERENCES establishments(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT fk_establishment FOREIGN KEY (establishment_id) REFERENCES establishments(id) ON DELETE CASCADE
);

-- Pricing
CREATE TABLE pricing (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    price DOUBLE PRECISION NOT NULL,
    establishment_id UUID NOT NULL REFERENCES establishments(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT fk_establishment FOREIGN KEY (establishment_id) REFERENCES establishments(id) ON DELETE CASCADE
);

-- Tariffs
CREATE TABLE tariffs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    price DOUBLE PRECISION NOT NULL,
    establishment_id UUID NOT NULL REFERENCES establishments(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT fk_establishment FOREIGN KEY (establishment_id) REFERENCES establishments(id) ON DELETE CASCADE
);

-- Admin Actions
CREATE TABLE admin_actions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    establishment_id UUID NOT NULL REFERENCES establishments(id) ON DELETE CASCADE,
    action admin_action_type NOT NULL,
    reason TEXT,
    previous_status TEXT,
    new_status TEXT,
    details JSONB,
    created_at TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT fk_admin FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_establishment FOREIGN KEY (establishment_id) REFERENCES establishments(id) ON DELETE CASCADE
);

-- Click Analytics
CREATE TABLE click_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    establishment_id UUID NOT NULL REFERENCES establishments(id) ON DELETE CASCADE,
    element_type TEXT NOT NULL,
    element_id TEXT NOT NULL,
    element_name TEXT,
    action TEXT NOT NULL,
    section_context TEXT,
    user_agent TEXT,
    referrer TEXT,
    timestamp TIMESTAMPTZ DEFAULT now(),
    country TEXT,
    city TEXT,
    hour INTEGER,
    day_of_week TEXT,
    time_slot TEXT,
    CONSTRAINT fk_establishment FOREIGN KEY (establishment_id) REFERENCES establishments(id) ON DELETE CASCADE
);

-- Search Analytics
CREATE TABLE search_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    search_term TEXT NOT NULL,
    result_count INTEGER DEFAULT 0,
    clicked_establishment_id TEXT,
    clicked_establishment_name TEXT,
    user_agent TEXT,
    referrer TEXT,
    timestamp TIMESTAMPTZ DEFAULT now(),
    country TEXT,
    city TEXT,
    searched_city TEXT
);

-- Establishment Learning Patterns
CREATE TABLE establishment_learning_patterns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    detected_type TEXT NOT NULL,
    corrected_type TEXT,
    google_types TEXT NOT NULL,
    keywords TEXT NOT NULL,
    confidence DOUBLE PRECISION NOT NULL,
    is_corrected BOOLEAN DEFAULT false,
    corrected_by TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Conversations (Messagerie)
CREATE TABLE conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subject TEXT NOT NULL,
    status conversation_status DEFAULT 'open',
    professional_id UUID NOT NULL REFERENCES professionals(id) ON DELETE CASCADE,
    admin_id UUID REFERENCES users(id) ON DELETE SET NULL,
    last_message_at TIMESTAMPTZ DEFAULT now(),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT fk_professional FOREIGN KEY (professional_id) REFERENCES professionals(id) ON DELETE CASCADE,
    CONSTRAINT fk_admin FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Messages
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    sender_id TEXT NOT NULL,
    sender_type sender_type NOT NULL,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT fk_conversation FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE
);

-- Location Preferences
CREATE TABLE location_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    city_id TEXT NOT NULL,
    city_name TEXT NOT NULL,
    city_latitude DOUBLE PRECISION NOT NULL,
    city_longitude DOUBLE PRECISION NOT NULL,
    city_region TEXT,
    search_radius INTEGER DEFAULT 20,
    mode TEXT DEFAULT 'manual',
    use_current_location BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ============================================
-- INDEXES
-- ============================================

-- Users
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- Professionals
CREATE INDEX idx_professionals_email ON professionals(email);
CREATE INDEX idx_professionals_siret ON professionals(siret);

-- Establishments
CREATE INDEX idx_establishments_slug ON establishments(slug);
CREATE INDEX idx_establishments_owner_id ON establishments(owner_id);
CREATE INDEX idx_establishments_status ON establishments(status);
CREATE INDEX idx_establishments_city ON establishments(city);
-- Index géographique (nécessite l'extension PostGIS)
-- CREATE INDEX idx_establishments_location ON establishments USING GIST (ST_MakePoint(longitude, latitude));
-- Alternative sans PostGIS : index composite sur latitude/longitude
CREATE INDEX idx_establishments_lat_lng ON establishments(latitude, longitude);

-- Events
CREATE INDEX idx_events_establishment_id ON events(establishment_id);
CREATE INDEX idx_events_start_date ON events(start_date);

-- User Comments
CREATE INDEX idx_user_comments_user_id ON user_comments(user_id);
CREATE INDEX idx_user_comments_establishment_id ON user_comments(establishment_id);
CREATE INDEX idx_user_comments_rating ON user_comments(rating);

-- User Favorites
CREATE INDEX idx_user_favorites_user_id ON user_favorites(user_id);
CREATE INDEX idx_user_favorites_establishment_id ON user_favorites(establishment_id);

-- User Likes
CREATE INDEX idx_user_likes_user_id ON user_likes(user_id);
CREATE INDEX idx_user_likes_establishment_id ON user_likes(establishment_id);

-- Daily Deals
CREATE INDEX idx_daily_deals_establishment_active ON daily_deals(establishment_id, is_active, date_debut, date_fin);

-- Deal Engagements
CREATE INDEX idx_deal_engagements_deal_type ON deal_engagements(deal_id, type);
CREATE INDEX idx_deal_engagements_establishment_type ON deal_engagements(establishment_id, type);
CREATE INDEX idx_deal_engagements_timestamp ON deal_engagements(timestamp);

-- Event Engagements
CREATE INDEX idx_event_engagements_event_id ON event_engagements(event_id);
CREATE INDEX idx_event_engagements_user_id ON event_engagements(user_id);

-- Click Analytics
CREATE INDEX idx_click_analytics_establishment_element ON click_analytics(establishment_id, element_type);
CREATE INDEX idx_click_analytics_timestamp ON click_analytics(timestamp);
CREATE INDEX idx_click_analytics_hour_day ON click_analytics(hour, day_of_week);

-- Search Analytics
CREATE INDEX idx_search_analytics_search_term ON search_analytics(search_term);
CREATE INDEX idx_search_analytics_timestamp ON search_analytics(timestamp);
CREATE INDEX idx_search_analytics_clicked_establishment ON search_analytics(clicked_establishment_id);

-- Conversations
CREATE INDEX idx_conversations_professional_status ON conversations(professional_id, status);
CREATE INDEX idx_conversations_admin_status ON conversations(admin_id, status);
CREATE INDEX idx_conversations_last_message_at ON conversations(last_message_at);

-- Messages
CREATE INDEX idx_messages_conversation_created ON messages(conversation_id, created_at);
CREATE INDEX idx_messages_sender ON messages(sender_id, sender_type);

-- ============================================
-- TRIGGERS pour updated_at
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_professionals_updated_at BEFORE UPDATE ON professionals
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_establishments_updated_at BEFORE UPDATE ON establishments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_comments_updated_at BEFORE UPDATE ON user_comments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_daily_deals_updated_at BEFORE UPDATE ON daily_deals
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_deal_engagements_updated_at BEFORE UPDATE ON deal_engagements
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_featured_promotions_updated_at BEFORE UPDATE ON featured_promotions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_establishment_menus_updated_at BEFORE UPDATE ON establishment_menus
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pricing_updated_at BEFORE UPDATE ON pricing
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tariffs_updated_at BEFORE UPDATE ON tariffs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_conversations_updated_at BEFORE UPDATE ON conversations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_location_preferences_updated_at BEFORE UPDATE ON location_preferences
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_establishment_learning_patterns_updated_at BEFORE UPDATE ON establishment_learning_patterns
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

