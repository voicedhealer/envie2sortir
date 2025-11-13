-- ============================================
-- Row Level Security (RLS) Policies
-- ============================================
-- Sécurisation des données avec RLS
-- Chaque utilisateur n'a accès qu'à ses propres données
-- ou aux données publiques selon son rôle
-- ============================================

-- ============================================
-- USERS
-- ============================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Tous peuvent voir les profils publics (email, name, avatar, etc.)
CREATE POLICY "Users are viewable by everyone"
    ON users FOR SELECT
    USING (true);

-- Uniquement son propre profil peut être modifié
CREATE POLICY "Users can update own profile"
    ON users FOR UPDATE
    USING (auth.uid()::text = id::text);

-- N'importe qui peut créer un compte
CREATE POLICY "Anyone can create a user account"
    ON users FOR INSERT
    WITH CHECK (true);

-- Uniquement son propre compte peut être supprimé (ou admin)
CREATE POLICY "Users can delete own account"
    ON users FOR DELETE
    USING (
        auth.uid()::text = id::text OR
        EXISTS (
            SELECT 1 FROM users
            WHERE id::text = auth.uid()::text
            AND role = 'admin'
        )
    );

-- ============================================
-- PROFESSIONALS
-- ============================================

ALTER TABLE professionals ENABLE ROW LEVEL SECURITY;

-- Tous peuvent voir les infos publiques des professionnels
CREATE POLICY "Professionals are viewable by everyone"
    ON professionals FOR SELECT
    USING (true);

-- Uniquement son propre profil peut être modifié
CREATE POLICY "Professionals can update own profile"
    ON professionals FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE auth.users.id::text = professionals.id::text
            AND auth.users.id = auth.uid()
        )
    );

-- N'importe qui peut créer un compte professionnel
CREATE POLICY "Anyone can create a professional account"
    ON professionals FOR INSERT
    WITH CHECK (true);

-- Uniquement son propre compte peut être supprimé (ou admin)
CREATE POLICY "Professionals can delete own account"
    ON professionals FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE auth.users.id::text = professionals.id::text
            AND auth.users.id = auth.uid()
        ) OR
        EXISTS (
            SELECT 1 FROM users
            WHERE id::text = auth.uid()::text
            AND role = 'admin'
        )
    );

-- ============================================
-- ESTABLISHMENTS
-- ============================================

ALTER TABLE establishments ENABLE ROW LEVEL SECURITY;

-- Tous peuvent voir les établissements approuvés
-- Les propriétaires et admins peuvent voir tous leurs établissements
CREATE POLICY "Establishments are viewable by everyone if approved"
    ON establishments FOR SELECT
    USING (
        status = 'approved' OR
        owner_id::text IN (
            SELECT id::text FROM professionals
            WHERE id::text IN (
                SELECT id::text FROM auth.users WHERE id = auth.uid()
            )
        ) OR
        EXISTS (
            SELECT 1 FROM users
            WHERE id::text = auth.uid()::text
            AND role = 'admin'
        )
    );

-- Uniquement les professionnels peuvent créer des établissements
CREATE POLICY "Only professionals can create establishments"
    ON establishments FOR INSERT
    WITH CHECK (
        owner_id::text IN (
            SELECT id::text FROM professionals
            WHERE id::text IN (
                SELECT id::text FROM auth.users WHERE id = auth.uid()
            )
        )
    );

-- Uniquement le propriétaire ou un admin peut modifier
CREATE POLICY "Only owner or admin can update establishments"
    ON establishments FOR UPDATE
    USING (
        owner_id::text IN (
            SELECT id::text FROM professionals
            WHERE id::text IN (
                SELECT id::text FROM auth.users WHERE id = auth.uid()
            )
        ) OR
        EXISTS (
            SELECT 1 FROM users
            WHERE id::text = auth.uid()::text
            AND role = 'admin'
        )
    );

-- Uniquement le propriétaire ou un admin peut supprimer
CREATE POLICY "Only owner or admin can delete establishments"
    ON establishments FOR DELETE
    USING (
        owner_id::text IN (
            SELECT id::text FROM professionals
            WHERE id::text IN (
                SELECT id::text FROM auth.users WHERE id = auth.uid()
            )
        ) OR
        EXISTS (
            SELECT 1 FROM users
            WHERE id::text = auth.uid()::text
            AND role = 'admin'
        )
    );

-- ============================================
-- EVENTS
-- ============================================

ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Tous peuvent voir les événements
CREATE POLICY "Events are viewable by everyone"
    ON events FOR SELECT
    USING (true);

-- Uniquement les propriétaires d'établissements peuvent créer
CREATE POLICY "Only establishment owners can create events"
    ON events FOR INSERT
    WITH CHECK (
        establishment_id IN (
            SELECT id FROM establishments
            WHERE owner_id::text IN (
                SELECT id::text FROM professionals
                WHERE id::text IN (
                    SELECT id::text FROM auth.users WHERE id = auth.uid()
                )
            )
        )
    );

-- Uniquement le propriétaire ou un admin peut modifier
CREATE POLICY "Only owner or admin can update events"
    ON events FOR UPDATE
    USING (
        establishment_id IN (
            SELECT id FROM establishments
            WHERE owner_id::text IN (
                SELECT id::text FROM professionals
                WHERE id::text IN (
                    SELECT id::text FROM auth.users WHERE id = auth.uid()
                )
            )
        ) OR
        EXISTS (
            SELECT 1 FROM users
            WHERE id::text = auth.uid()::text
            AND role = 'admin'
        )
    );

-- Uniquement le propriétaire ou un admin peut supprimer
CREATE POLICY "Only owner or admin can delete events"
    ON events FOR DELETE
    USING (
        establishment_id IN (
            SELECT id FROM establishments
            WHERE owner_id::text IN (
                SELECT id::text FROM professionals
                WHERE id::text IN (
                    SELECT id::text FROM auth.users WHERE id = auth.uid()
                )
            )
        ) OR
        EXISTS (
            SELECT 1 FROM users
            WHERE id::text = auth.uid()::text
            AND role = 'admin'
        )
    );

-- ============================================
-- USER COMMENTS
-- ============================================

ALTER TABLE user_comments ENABLE ROW LEVEL SECURITY;

-- Tous peuvent voir les commentaires
CREATE POLICY "Comments are viewable by everyone"
    ON user_comments FOR SELECT
    USING (true);

-- Uniquement les utilisateurs authentifiés peuvent créer
CREATE POLICY "Authenticated users can create comments"
    ON user_comments FOR INSERT
    WITH CHECK (
        auth.uid() IS NOT NULL AND
        user_id::text = auth.uid()::text
    );

-- Uniquement l'auteur ou un admin peut modifier
CREATE POLICY "Only author or admin can update comments"
    ON user_comments FOR UPDATE
    USING (
        user_id::text = auth.uid()::text OR
        EXISTS (
            SELECT 1 FROM users
            WHERE id::text = auth.uid()::text
            AND role = 'admin'
        )
    );

-- Uniquement l'auteur ou un admin peut supprimer
CREATE POLICY "Only author or admin can delete comments"
    ON user_comments FOR DELETE
    USING (
        user_id::text = auth.uid()::text OR
        EXISTS (
            SELECT 1 FROM users
            WHERE id::text = auth.uid()::text
            AND role = 'admin'
        )
    );

-- ============================================
-- USER FAVORITES
-- ============================================

ALTER TABLE user_favorites ENABLE ROW LEVEL SECURITY;

-- Uniquement ses propres favoris
CREATE POLICY "Users can only see own favorites"
    ON user_favorites FOR SELECT
    USING (user_id::text = auth.uid()::text);

-- Uniquement les utilisateurs authentifiés peuvent créer
CREATE POLICY "Authenticated users can create favorites"
    ON user_favorites FOR INSERT
    WITH CHECK (
        auth.uid() IS NOT NULL AND
        user_id::text = auth.uid()::text
    );

-- Uniquement ses propres favoris peuvent être supprimés
CREATE POLICY "Users can delete own favorites"
    ON user_favorites FOR DELETE
    USING (user_id::text = auth.uid()::text);

-- ============================================
-- USER LIKES
-- ============================================

ALTER TABLE user_likes ENABLE ROW LEVEL SECURITY;

-- Uniquement ses propres likes
CREATE POLICY "Users can only see own likes"
    ON user_likes FOR SELECT
    USING (user_id::text = auth.uid()::text);

-- Uniquement les utilisateurs authentifiés peuvent créer
CREATE POLICY "Authenticated users can create likes"
    ON user_likes FOR INSERT
    WITH CHECK (
        auth.uid() IS NOT NULL AND
        user_id::text = auth.uid()::text
    );

-- Uniquement ses propres likes peuvent être supprimés
CREATE POLICY "Users can delete own likes"
    ON user_likes FOR DELETE
    USING (user_id::text = auth.uid()::text);

-- ============================================
-- EVENT ENGAGEMENTS
-- ============================================

ALTER TABLE event_engagements ENABLE ROW LEVEL SECURITY;

-- Tous peuvent voir les engagements (pour stats)
CREATE POLICY "Event engagements are viewable by everyone"
    ON event_engagements FOR SELECT
    USING (true);

-- Uniquement les utilisateurs authentifiés peuvent créer
CREATE POLICY "Authenticated users can create event engagements"
    ON event_engagements FOR INSERT
    WITH CHECK (
        auth.uid() IS NOT NULL AND
        user_id::text = auth.uid()::text
    );

-- Uniquement ses propres engagements peuvent être modifiés
CREATE POLICY "Users can update own event engagements"
    ON event_engagements FOR UPDATE
    USING (user_id::text = auth.uid()::text);

-- Uniquement ses propres engagements peuvent être supprimés
CREATE POLICY "Users can delete own event engagements"
    ON event_engagements FOR DELETE
    USING (user_id::text = auth.uid()::text);

-- ============================================
-- IMAGES
-- ============================================

ALTER TABLE images ENABLE ROW LEVEL SECURITY;

-- Tous peuvent voir les images
CREATE POLICY "Images are viewable by everyone"
    ON images FOR SELECT
    USING (true);

-- Uniquement les propriétaires d'établissements peuvent créer
CREATE POLICY "Only establishment owners can create images"
    ON images FOR INSERT
    WITH CHECK (
        establishment_id IN (
            SELECT id FROM establishments
            WHERE owner_id::text IN (
                SELECT id::text FROM professionals
                WHERE id::text IN (
                    SELECT id::text FROM auth.users WHERE id = auth.uid()
                )
            )
        )
    );

-- Uniquement le propriétaire ou un admin peut modifier
CREATE POLICY "Only owner or admin can update images"
    ON images FOR UPDATE
    USING (
        establishment_id IN (
            SELECT id FROM establishments
            WHERE owner_id::text IN (
                SELECT id::text FROM professionals
                WHERE id::text IN (
                    SELECT id::text FROM auth.users WHERE id = auth.uid()
                )
            )
        ) OR
        EXISTS (
            SELECT 1 FROM users
            WHERE id::text = auth.uid()::text
            AND role = 'admin'
        )
    );

-- Uniquement le propriétaire ou un admin peut supprimer
CREATE POLICY "Only owner or admin can delete images"
    ON images FOR DELETE
    USING (
        establishment_id IN (
            SELECT id FROM establishments
            WHERE owner_id::text IN (
                SELECT id::text FROM professionals
                WHERE id::text IN (
                    SELECT id::text FROM auth.users WHERE id = auth.uid()
                )
            )
        ) OR
        EXISTS (
            SELECT 1 FROM users
            WHERE id::text = auth.uid()::text
            AND role = 'admin'
        )
    );

-- ============================================
-- DAILY DEALS
-- ============================================

ALTER TABLE daily_deals ENABLE ROW LEVEL SECURITY;

-- Tous peuvent voir les bons plans actifs
CREATE POLICY "Active deals are viewable by everyone"
    ON daily_deals FOR SELECT
    USING (
        is_active = true OR
        establishment_id IN (
            SELECT id FROM establishments
            WHERE owner_id::text IN (
                SELECT id::text FROM professionals
                WHERE id::text IN (
                    SELECT id::text FROM auth.users WHERE id = auth.uid()
                )
            )
        ) OR
        EXISTS (
            SELECT 1 FROM users
            WHERE id::text = auth.uid()::text
            AND role = 'admin'
        )
    );

-- Uniquement les propriétaires peuvent créer
CREATE POLICY "Only establishment owners can create deals"
    ON daily_deals FOR INSERT
    WITH CHECK (
        establishment_id IN (
            SELECT id FROM establishments
            WHERE owner_id::text IN (
                SELECT id::text FROM professionals
                WHERE id::text IN (
                    SELECT id::text FROM auth.users WHERE id = auth.uid()
                )
            )
        )
    );

-- Uniquement le propriétaire ou un admin peut modifier
CREATE POLICY "Only owner or admin can update deals"
    ON daily_deals FOR UPDATE
    USING (
        establishment_id IN (
            SELECT id FROM establishments
            WHERE owner_id::text IN (
                SELECT id::text FROM professionals
                WHERE id::text IN (
                    SELECT id::text FROM auth.users WHERE id = auth.uid()
                )
            )
        ) OR
        EXISTS (
            SELECT 1 FROM users
            WHERE id::text = auth.uid()::text
            AND role = 'admin'
        )
    );

-- Uniquement le propriétaire ou un admin peut supprimer
CREATE POLICY "Only owner or admin can delete deals"
    ON daily_deals FOR DELETE
    USING (
        establishment_id IN (
            SELECT id FROM establishments
            WHERE owner_id::text IN (
                SELECT id::text FROM professionals
                WHERE id::text IN (
                    SELECT id::text FROM auth.users WHERE id = auth.uid()
                )
            )
        ) OR
        EXISTS (
            SELECT 1 FROM users
            WHERE id::text = auth.uid()::text
            AND role = 'admin'
        )
    );

-- ============================================
-- CONVERSATIONS
-- ============================================

ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

-- Uniquement le professionnel concerné ou un admin peut voir
CREATE POLICY "Professionals and admins can view conversations"
    ON conversations FOR SELECT
    USING (
        professional_id::text IN (
            SELECT id::text FROM professionals
            WHERE id::text IN (
                SELECT id::text FROM auth.users WHERE id = auth.uid()
            )
        ) OR
        EXISTS (
            SELECT 1 FROM users
            WHERE id::text = auth.uid()::text
            AND role = 'admin'
        )
    );

-- Uniquement les professionnels peuvent créer
CREATE POLICY "Only professionals can create conversations"
    ON conversations FOR INSERT
    WITH CHECK (
        professional_id::text IN (
            SELECT id::text FROM professionals
            WHERE id::text IN (
                SELECT id::text FROM auth.users WHERE id = auth.uid()
            )
        )
    );

-- Uniquement le professionnel concerné ou un admin peut modifier
CREATE POLICY "Professionals and admins can update conversations"
    ON conversations FOR UPDATE
    USING (
        professional_id::text IN (
            SELECT id::text FROM professionals
            WHERE id::text IN (
                SELECT id::text FROM auth.users WHERE id = auth.uid()
            )
        ) OR
        EXISTS (
            SELECT 1 FROM users
            WHERE id::text = auth.uid()::text
            AND role = 'admin'
        )
    );

-- ============================================
-- MESSAGES
-- ============================================

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Uniquement le professionnel concerné ou un admin peut voir
CREATE POLICY "Professionals and admins can view messages"
    ON messages FOR SELECT
    USING (
        conversation_id IN (
            SELECT id FROM conversations
            WHERE professional_id::text IN (
                SELECT id::text FROM professionals
                WHERE id::text IN (
                    SELECT id::text FROM auth.users WHERE id = auth.uid()
                )
            ) OR
            EXISTS (
                SELECT 1 FROM users
                WHERE id::text = auth.uid()::text
                AND role = 'admin'
            )
        )
    );

-- Uniquement le professionnel concerné ou un admin peut créer
CREATE POLICY "Professionals and admins can create messages"
    ON messages FOR INSERT
    WITH CHECK (
        conversation_id IN (
            SELECT id FROM conversations
            WHERE professional_id::text IN (
                SELECT id::text FROM professionals
                WHERE id::text IN (
                    SELECT id::text FROM auth.users WHERE id = auth.uid()
                )
            ) OR
            EXISTS (
                SELECT 1 FROM users
                WHERE id::text = auth.uid()::text
                AND role = 'admin'
            )
        )
    );

-- ============================================
-- ADMIN ACTIONS
-- ============================================

ALTER TABLE admin_actions ENABLE ROW LEVEL SECURITY;

-- Uniquement les admins peuvent voir
CREATE POLICY "Only admins can view admin actions"
    ON admin_actions FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE id::text = auth.uid()::text
            AND role = 'admin'
        )
    );

-- Uniquement les admins peuvent créer
CREATE POLICY "Only admins can create admin actions"
    ON admin_actions FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM users
            WHERE id::text = auth.uid()::text
            AND role = 'admin'
        )
    );

-- ============================================
-- LOCATION PREFERENCES
-- ============================================

ALTER TABLE location_preferences ENABLE ROW LEVEL SECURITY;

-- Uniquement ses propres préférences
CREATE POLICY "Users can only see own location preferences"
    ON location_preferences FOR SELECT
    USING (user_id::text = auth.uid()::text);

-- Uniquement les utilisateurs authentifiés peuvent créer
CREATE POLICY "Authenticated users can create location preferences"
    ON location_preferences FOR INSERT
    WITH CHECK (
        auth.uid() IS NOT NULL AND
        user_id::text = auth.uid()::text
    );

-- Uniquement ses propres préférences peuvent être modifiées
CREATE POLICY "Users can update own location preferences"
    ON location_preferences FOR UPDATE
    USING (user_id::text = auth.uid()::text);

-- Uniquement ses propres préférences peuvent être supprimées
CREATE POLICY "Users can delete own location preferences"
    ON location_preferences FOR DELETE
    USING (user_id::text = auth.uid()::text);

-- ============================================
-- ANALYTICS (Public read, no write for users)
-- ============================================

-- Click Analytics - Lecture publique, écriture uniquement via API server-side
ALTER TABLE click_analytics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Click analytics are viewable by establishment owners and admins"
    ON click_analytics FOR SELECT
    USING (
        establishment_id IN (
            SELECT id FROM establishments
            WHERE owner_id::text IN (
                SELECT id::text FROM professionals
                WHERE id::text IN (
                    SELECT id::text FROM auth.users WHERE id = auth.uid()
                )
            )
        ) OR
        EXISTS (
            SELECT 1 FROM users
            WHERE id::text = auth.uid()::text
            AND role = 'admin'
        )
    );

-- Search Analytics - Lecture publique, écriture uniquement via API server-side
ALTER TABLE search_analytics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Search analytics are viewable by admins"
    ON search_analytics FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE id::text = auth.uid()::text
            AND role = 'admin'
        )
    );

