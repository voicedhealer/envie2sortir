-- ============================================
-- Activation RLS sur les tables restantes
-- et création des politiques associées
-- ============================================

-- ============================================
-- PROFESSIONAL UPDATE REQUESTS
-- ============================================
ALTER TABLE professional_update_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Professional requests viewable by owner or admin"
    ON professional_update_requests FOR SELECT
    USING (
        professional_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM users
            WHERE id = auth.uid()
            AND role = 'admin'
        )
    );

CREATE POLICY "Professionals can create update requests"
    ON professional_update_requests FOR INSERT
    WITH CHECK (professional_id = auth.uid());

CREATE POLICY "Professionals can update own requests"
    ON professional_update_requests FOR UPDATE
    USING (
        professional_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM users
            WHERE id = auth.uid()
            AND role = 'admin'
        )
    )
    WITH CHECK (
        professional_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM users
            WHERE id = auth.uid()
            AND role = 'admin'
        )
    );

CREATE POLICY "Professionals can delete own requests"
    ON professional_update_requests FOR DELETE
    USING (
        professional_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM users
            WHERE id = auth.uid()
            AND role = 'admin'
        )
    );

-- ============================================
-- ETABLISSEMENT TAGS
-- ============================================
ALTER TABLE etablissement_tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tags viewable when establishment approved or owner"
    ON etablissement_tags FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM establishments e
            WHERE e.id = etablissement_tags.etablissement_id
            AND (
                e.status = 'approved' OR
                e.owner_id = auth.uid()
            )
        )
    );

CREATE POLICY "Only owner can create establishment tags"
    ON etablissement_tags FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM establishments e
            WHERE e.id = etablissement_tags.etablissement_id
            AND e.owner_id = auth.uid()
        )
    );

CREATE POLICY "Only owner can update establishment tags"
    ON etablissement_tags FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM establishments e
            WHERE e.id = etablissement_tags.etablissement_id
            AND e.owner_id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM establishments e
            WHERE e.id = etablissement_tags.etablissement_id
            AND e.owner_id = auth.uid()
        )
    );

CREATE POLICY "Only owner can delete establishment tags"
    ON etablissement_tags FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM establishments e
            WHERE e.id = etablissement_tags.etablissement_id
            AND e.owner_id = auth.uid()
        )
    );

-- ============================================
-- DEAL ENGAGEMENTS
-- ============================================
ALTER TABLE deal_engagements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Deal engagements viewable by establishment owners"
    ON deal_engagements FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM establishments e
            WHERE e.id = deal_engagements.establishment_id
            AND e.owner_id = auth.uid()
        )
    );

CREATE POLICY "Public can create deal engagements"
    ON deal_engagements FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Public can update deal engagements"
    ON deal_engagements FOR UPDATE
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Owners can delete deal engagements"
    ON deal_engagements FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM establishments e
            WHERE e.id = deal_engagements.establishment_id
            AND e.owner_id = auth.uid()
        )
    );

-- ============================================
-- FEATURED PROMOTIONS
-- ============================================
ALTER TABLE featured_promotions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Featured promotions viewable if approved or owner"
    ON featured_promotions FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM establishments e
            WHERE e.id = featured_promotions.establishment_id
            AND (
                e.status = 'approved' OR
                e.owner_id = auth.uid()
            )
        )
    );

CREATE POLICY "Only owner can create featured promotions"
    ON featured_promotions FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM establishments e
            WHERE e.id = featured_promotions.establishment_id
            AND e.owner_id = auth.uid()
        )
    );

CREATE POLICY "Only owner can update featured promotions"
    ON featured_promotions FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM establishments e
            WHERE e.id = featured_promotions.establishment_id
            AND e.owner_id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM establishments e
            WHERE e.id = featured_promotions.establishment_id
            AND e.owner_id = auth.uid()
        )
    );

CREATE POLICY "Only owner can delete featured promotions"
    ON featured_promotions FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM establishments e
            WHERE e.id = featured_promotions.establishment_id
            AND e.owner_id = auth.uid()
        )
    );

-- ============================================
-- ESTABLISHMENT MENUS
-- ============================================
ALTER TABLE establishment_menus ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Menus viewable if establishment approved or owner"
    ON establishment_menus FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM establishments e
            WHERE e.id = establishment_menus.establishment_id
            AND (
                e.status = 'approved' OR
                e.owner_id = auth.uid()
            )
        )
    );

CREATE POLICY "Only owner can create establishment menus"
    ON establishment_menus FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM establishments e
            WHERE e.id = establishment_menus.establishment_id
            AND e.owner_id = auth.uid()
        )
    );

CREATE POLICY "Only owner can update establishment menus"
    ON establishment_menus FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM establishments e
            WHERE e.id = establishment_menus.establishment_id
            AND e.owner_id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM establishments e
            WHERE e.id = establishment_menus.establishment_id
            AND e.owner_id = auth.uid()
        )
    );

CREATE POLICY "Only owner can delete establishment menus"
    ON establishment_menus FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM establishments e
            WHERE e.id = establishment_menus.establishment_id
            AND e.owner_id = auth.uid()
        )
    );

-- ============================================
-- PRICING
-- ============================================
ALTER TABLE pricing ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Pricing viewable by establishment owner"
    ON pricing FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM establishments e
            WHERE e.id = pricing.establishment_id
            AND e.owner_id = auth.uid()
        )
    );

CREATE POLICY "Only owner can create pricing"
    ON pricing FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM establishments e
            WHERE e.id = pricing.establishment_id
            AND e.owner_id = auth.uid()
        )
    );

CREATE POLICY "Only owner can update pricing"
    ON pricing FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM establishments e
            WHERE e.id = pricing.establishment_id
            AND e.owner_id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM establishments e
            WHERE e.id = pricing.establishment_id
            AND e.owner_id = auth.uid()
        )
    );

CREATE POLICY "Only owner can delete pricing"
    ON pricing FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM establishments e
            WHERE e.id = pricing.establishment_id
            AND e.owner_id = auth.uid()
        )
    );

-- ============================================
-- TARIFFS
-- ============================================
ALTER TABLE tariffs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tariffs viewable by establishment owner"
    ON tariffs FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM establishments e
            WHERE e.id = tariffs.establishment_id
            AND e.owner_id = auth.uid()
        )
    );

CREATE POLICY "Only owner can create tariffs"
    ON tariffs FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM establishments e
            WHERE e.id = tariffs.establishment_id
            AND e.owner_id = auth.uid()
        )
    );

CREATE POLICY "Only owner can update tariffs"
    ON tariffs FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM establishments e
            WHERE e.id = tariffs.establishment_id
            AND e.owner_id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM establishments e
            WHERE e.id = tariffs.establishment_id
            AND e.owner_id = auth.uid()
        )
    );

CREATE POLICY "Only owner can delete tariffs"
    ON tariffs FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM establishments e
            WHERE e.id = tariffs.establishment_id
            AND e.owner_id = auth.uid()
        )
    );

-- ============================================
-- ESTABLISHMENT LEARNING PATTERNS
-- ============================================
ALTER TABLE establishment_learning_patterns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only admins can read learning patterns"
    ON establishment_learning_patterns FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE id = auth.uid()
            AND role = 'admin'
        )
    );

CREATE POLICY "Only admins can insert learning patterns"
    ON establishment_learning_patterns FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM users
            WHERE id = auth.uid()
            AND role = 'admin'
        )
    );

CREATE POLICY "Only admins can update learning patterns"
    ON establishment_learning_patterns FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE id = auth.uid()
            AND role = 'admin'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM users
            WHERE id = auth.uid()
            AND role = 'admin'
        )
    );

CREATE POLICY "Only admins can delete learning patterns"
    ON establishment_learning_patterns FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE id = auth.uid()
            AND role = 'admin'
        )
    );

