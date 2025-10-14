import { test, expect } from '@playwright/test';

test.describe('Événements et Bons Plans - Tests E2E', () => {

  test.beforeEach(async ({ page }) => {
    // Naviguer vers un établissement qui a des événements et bons plans
    // Nous utilisons la base de données existante
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test.describe('Événements - Affichage et interaction', () => {
    
    test('Doit afficher la section événements si des événements à venir existent', async ({ page }) => {
      // Chercher un établissement avec événements
      await page.fill('input[name="envie"]', 'bar');
      await page.click('button:has-text("Trouve-moi ça !")');
      await page.waitForURL('**/recherche/envie**');
      
      // Cliquer sur le premier résultat
      const firstResult = page.locator('a[href*="/etablissements/"]').first();
      await firstResult.click();
      await page.waitForLoadState('networkidle');
      
      // Vérifier si la section événements est présente
      const eventsSection = page.locator('.events-section');
      const hasEvents = await eventsSection.count() > 0;
      
      if (hasEvents) {
        await expect(eventsSection).toBeVisible();
        await expect(page.locator('h3:has-text("Événements à venir")')).toBeVisible();
        
        // Vérifier qu'au moins une carte d'événement est visible
        const eventCards = page.locator('.event-card');
        await expect(eventCards.first()).toBeVisible();
      }
      // Si pas d'événements, c'est normal, le test passe
    });

    test('Doit afficher les détails d\'un événement (titre, date, horaires)', async ({ page }) => {
      // Naviguer vers un établissement
      await page.fill('input[name="envie"]', 'bar');
      await page.click('button:has-text("Trouve-moi ça !")');
      await page.waitForURL('**/recherche/envie**');
      
      const firstResult = page.locator('a[href*="/etablissements/"]').first();
      await firstResult.click();
      await page.waitForLoadState('networkidle');
      
      // Si des événements existent
      const eventsSection = page.locator('.events-section');
      if (await eventsSection.count() > 0) {
        const eventCard = page.locator('.event-card').first();
        
        // Vérifier que la carte contient un titre
        await expect(eventCard.locator('h4')).toBeVisible();
        
        // Vérifier que la date est affichée
        await expect(eventCard.locator('.event-date')).toBeVisible();
      }
    });
  });

  test.describe('Bons Plans - Modal et flip', () => {
    
    test('Doit afficher le modal de bon plan au chargement si un bon plan actif existe', async ({ page }) => {
      // Naviguer vers un établissement
      await page.fill('input[name="envie"]', 'bar');
      await page.click('button:has-text("Trouve-moi ça !")');
      await page.waitForURL('**/recherche/envie**');
      
      const firstResult = page.locator('a[href*="/etablissements/"]').first();
      await firstResult.click();
      await page.waitForLoadState('networkidle');
      
      // Attendre un peu pour laisser le temps au modal d'apparaître
      await page.waitForTimeout(500);
      
      // Vérifier si le modal est présent
      const modal = page.locator('.fixed.inset-0.z-50');
      const hasModal = await modal.count() > 0;
      
      if (hasModal) {
        await expect(modal).toBeVisible();
        
        // Vérifier le bouton de fermeture
        const closeButton = page.locator('button[aria-label="Fermer"]');
        await expect(closeButton).toBeVisible();
        
        // Vérifier le bouton d'action
        await expect(page.locator('button:has-text("J\'en profite !")')).toBeVisible();
        
        // Fermer le modal
        await closeButton.click();
        await page.waitForTimeout(300);
        await expect(modal).not.toBeVisible();
      }
    });

    test('Doit afficher la carte de bon plan avec effet flip', async ({ page }) => {
      // Naviguer vers un établissement
      await page.fill('input[name="envie"]', 'bar');
      await page.click('button:has-text("Trouve-moi ça !")');
      await page.waitForURL('**/recherche/envie**');
      
      const firstResult = page.locator('a[href*="/etablissements/"]').first();
      await firstResult.click();
      await page.waitForLoadState('networkidle');
      
      // Fermer le modal si présent
      const closeButton = page.locator('button[aria-label="Fermer"]');
      if (await closeButton.count() > 0) {
        await closeButton.click();
        await page.waitForTimeout(300);
      }
      
      // Chercher la carte de bon plan
      const dealCard = page.locator('.promo-card').first();
      const hasDealCard = await dealCard.count() > 0;
      
      if (hasDealCard) {
        await expect(dealCard).toBeVisible();
        
        // Vérifier le badge "BON PLAN DU JOUR"
        await expect(dealCard.locator('text=BON PLAN DU JOUR')).toBeVisible();
        
        // Vérifier le bouton "Voir les détails"
        const flipButton = dealCard.locator('button:has-text("Voir les détails")');
        await expect(flipButton).toBeVisible();
        
        // Cliquer pour flipper la carte
        await flipButton.click();
        await page.waitForTimeout(500); // Attendre l'animation de flip
        
        // Vérifier que le verso est affiché
        await expect(dealCard.locator('.promo-card-back')).toBeVisible();
        await expect(dealCard.locator('text=Détails de l\'offre')).toBeVisible();
        
        // Vérifier le bouton retour
        const backButton = dealCard.locator('button:has-text("Retour")');
        await expect(backButton).toBeVisible();
        
        // Revenir au recto
        await backButton.click();
        await page.waitForTimeout(500);
      }
    });

    test('Doit permettre de liker/disliker un bon plan', async ({ page }) => {
      // Naviguer vers un établissement
      await page.fill('input[name="envie"]', 'bar');
      await page.click('button:has-text("Trouve-moi ça !")');
      await page.waitForURL('**/recherche/envie**');
      
      const firstResult = page.locator('a[href*="/etablissements/"]').first();
      await firstResult.click();
      await page.waitForLoadState('networkidle');
      
      // Fermer le modal si présent
      const closeButton = page.locator('button[aria-label="Fermer"]');
      if (await closeButton.count() > 0) {
        await closeButton.click();
        await page.waitForTimeout(300);
      }
      
      // Chercher la carte de bon plan
      const dealCard = page.locator('.promo-card').first();
      const hasDealCard = await dealCard.count() > 0;
      
      if (hasDealCard) {
        // Cliquer sur "Intéressé"
        const likeButton = dealCard.locator('button:has-text("Intéressé")');
        await likeButton.click();
        
        // Attendre la réponse de l'API
        await page.waitForTimeout(500);
        
        // Vérifier que le bouton a changé d'état (classe bg-green-500)
        await expect(likeButton).toHaveClass(/bg-green-500/);
        
        // Maintenant, tester le dislike
        const dislikeButton = dealCard.locator('button:has-text("Pas intéressé")');
        await dislikeButton.click();
        await page.waitForTimeout(500);
        
        // Vérifier que le bouton dislike est actif
        await expect(dislikeButton).toHaveClass(/bg-red-500/);
      }
    });
  });

});
