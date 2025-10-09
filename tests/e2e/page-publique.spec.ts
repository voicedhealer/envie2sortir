import { test, expect } from '@playwright/test';

/**
 * Test E2E : Page publique d'un établissement
 * 
 * Vérifie que toutes les informations s'affichent correctement
 */

test.describe('Page publique établissement', () => {
  
  test('Affichage complet des informations', async ({ page }) => {
    // Aller sur une page d'établissement (à adapter avec un ID réel)
    await page.goto('/etablissements/test-etablissement');
    
    // Attendre le chargement
    await page.waitForLoadState('networkidle');
    
    // ========================================
    // Vérifier les informations de base
    // ========================================
    
    // Nom de l'établissement
    await expect(page.locator('h1')).toBeVisible();
    
    // Description
    await expect(page.locator('text=/description|présentation/i')).toBeVisible();
    
    // ========================================
    // Vérifier les coordonnées
    // ========================================
    
    // Adresse
    await expect(page.locator('text=/adresse|rue/i')).toBeVisible();
    
    // Téléphone
    const phoneLink = page.locator('a[href^="tel:"]');
    if (await phoneLink.count() > 0) {
      await expect(phoneLink.first()).toBeVisible();
    }
    
    // ========================================
    // Vérifier les horaires
    // ========================================
    
    const horaireSection = page.locator('text=/horaires|ouverture/i');
    if (await horaireSection.isVisible()) {
      // Cliquer pour déplier si nécessaire
      await horaireSection.click();
      await page.waitForTimeout(500);
      
      // Vérifier les jours de la semaine
      await expect(page.locator('text=/lundi|mardi|mercredi/i')).toBeVisible();
    }
    
    // ========================================
    // Vérifier les boutons d'action
    // ========================================
    
    // Bouton appeler
    const callButton = page.locator('button:has-text("Appeler"), a:has-text("Appeler")');
    if (await callButton.count() > 0) {
      await expect(callButton.first()).toBeVisible();
    }
    
    // Bouton WhatsApp
    const whatsappButton = page.locator('a[href*="wa.me"], a[href*="whatsapp"]');
    if (await whatsappButton.count() > 0) {
      await expect(whatsappButton.first()).toBeVisible();
    }
    
    // ========================================
    // Vérifier les réseaux sociaux
    // ========================================
    
    const instagramLink = page.locator('a[href*="instagram.com"]');
    if (await instagramLink.count() > 0) {
      await expect(instagramLink.first()).toBeVisible();
    }
    
    const facebookLink = page.locator('a[href*="facebook.com"]');
    if (await facebookLink.count() > 0) {
      await expect(facebookLink.first()).toBeVisible();
    }
    
    // Capturer la page complète
    await page.screenshot({ 
      path: 'playwright-report/page-publique-complete.png',
      fullPage: true 
    });
  });

  test('Navigation et interactions', async ({ page }) => {
    await page.goto('/etablissements/test-etablissement');
    
    // ========================================
    // Test de l'accordéon horaires
    // ========================================
    
    const horaireToggle = page.locator('button:has-text("Horaires"), div:has-text("Horaires")').first();
    
    if (await horaireToggle.isVisible()) {
      // Cliquer pour ouvrir
      await horaireToggle.click();
      await page.waitForTimeout(500);
      
      // Vérifier que le contenu est visible
      await expect(page.locator('text=/lundi|mardi/i')).toBeVisible();
      
      // Cliquer pour fermer
      await horaireToggle.click();
      await page.waitForTimeout(500);
    }
    
    // ========================================
    // Test du clic sur le téléphone
    // ========================================
    
    const phoneLink = page.locator('a[href^="tel:"]').first();
    if (await phoneLink.isVisible()) {
      // Vérifier que le lien a le bon format
      const href = await phoneLink.getAttribute('href');
      expect(href).toMatch(/^tel:\+?[0-9]+$/);
    }
    
    await page.screenshot({ path: 'playwright-report/interactions.png' });
  });

  test('Responsive - Version mobile', async ({ page }) => {
    // Configurer la taille d'écran mobile
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto('/etablissements/test-etablissement');
    await page.waitForLoadState('networkidle');
    
    // Vérifier que le contenu s'affiche correctement
    await expect(page.locator('h1')).toBeVisible();
    
    // Vérifier les boutons d'action mobile
    const actionButtons = page.locator('button, a').filter({ hasText: /appeler|whatsapp|email/i });
    if (await actionButtons.count() > 0) {
      await expect(actionButtons.first()).toBeVisible();
    }
    
    await page.screenshot({ 
      path: 'playwright-report/mobile-view.png',
      fullPage: true 
    });
  });
});

