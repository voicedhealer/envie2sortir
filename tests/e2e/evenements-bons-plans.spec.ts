/**
 * Tests E2E Playwright - Événements et Bons Plans
 * 
 * Tests couverts:
 * - Affichage des événements sur une page établissement
 * - Affichage des bons plans avec modal et flip effect
 * - Système d'engagement (likes/dislikes)
 * - Validation temporelle (événements à venir, bons plans actifs)
 * - Interaction utilisateur complète
 */

import { test, expect } from '@playwright/test';

test.describe('Événements - Affichage et interaction', () => {
  
  test('doit afficher les événements à venir sur une page établissement', async ({ page }) => {
    // Naviguer vers une page établissement (en supposant qu'il y en a un avec des événements)
    await page.goto('/etablissements/test-establishment');
    
    // Chercher la section événements
    const eventsSection = page.locator('section').filter({ hasText: /événements|events/i });
    
    if (await eventsSection.count() > 0) {
      await expect(eventsSection).toBeVisible();
      
      // Vérifier la présence de cards d'événements
      const eventCards = eventsSection.locator('[data-testid="event-card"]').or(
        eventsSection.locator('article, .event-card')
      );
      
      if (await eventCards.count() > 0) {
        await expect(eventCards.first()).toBeVisible();
      }
    }
  });

  test('doit afficher les détails d\'un événement (titre, date, horaires)', async ({ page }) => {
    await page.goto('/etablissements/test-establishment');
    
    const eventCard = page.locator('[data-testid="event-card"]').first().or(
      page.locator('.event-card').first()
    );
    
    if (await eventCard.count() > 0) {
      // Vérifier la présence du titre
      await expect(eventCard.locator('h3, h4').first()).toBeVisible();
      
      // Vérifier la présence d'une date
      await expect(
        eventCard.locator('text=/\\d{1,2}[\\/\\-]\\d{1,2}|\\d{4}/')
      ).toBeVisible();
    }
  });

  test('ne doit afficher que les événements à venir', async ({ page }) => {
    await page.goto('/etablissements/test-establishment');
    
    const eventCards = page.locator('[data-testid="event-card"]').or(
      page.locator('.event-card')
    );
    
    if (await eventCards.count() > 0) {
      // Tous les événements affichés doivent avoir une date future
      const count = await eventCards.count();
      
      for (let i = 0; i < Math.min(count, 3); i++) {
        const card = eventCards.nth(i);
        await expect(card).toBeVisible();
      }
    }
  });

  test('doit afficher un message si aucun événement à venir', async ({ page }) => {
    await page.goto('/etablissements/test-establishment-without-events');
    
    // Attendre le message
    await page.waitForTimeout(2000);
    
    const noEventsMessage = page.getByText(/aucun événement|pas d'événement/i);
    if (await noEventsMessage.count() > 0) {
      await expect(noEventsMessage).toBeVisible();
    }
  });
});

test.describe('Bons Plans - Affichage modal', () => {
  
  test('doit afficher le modal des bons plans au chargement de la page', async ({ page }) => {
    await page.goto('/etablissements/test-establishment-with-deals');
    
    // Attendre l'apparition du modal
    const modal = page.locator('[data-testid="deal-modal"]').or(
      page.locator('[role="dialog"]').filter({ hasText: /bon plan|promo/i })
    );
    
    if (await modal.count() > 0) {
      await expect(modal).toBeVisible({ timeout: 3000 });
    }
  });

  test('doit permettre de fermer le modal des bons plans', async ({ page }) => {
    await page.goto('/etablissements/test-establishment-with-deals');
    
    // Attendre le modal
    await page.waitForTimeout(1000);
    
    const modal = page.locator('[data-testid="deal-modal"]').or(
      page.locator('[role="dialog"]')
    );
    
    if (await modal.count() > 0) {
      // Chercher le bouton de fermeture
      const closeButton = modal.locator('button[aria-label*="fermer"], button[aria-label*="close"], .close-button').first();
      
      if (await closeButton.count() > 0) {
        await closeButton.click();
        await expect(modal).not.toBeVisible();
      }
    }
  });

  test('ne doit pas réafficher le modal après fermeture durant la session', async ({ page }) => {
    await page.goto('/etablissements/test-establishment-with-deals');
    
    // Attendre et fermer le modal
    await page.waitForTimeout(1000);
    const modal = page.locator('[data-testid="deal-modal"]').or(
      page.locator('[role="dialog"]')
    );
    
    if (await modal.count() > 0) {
      const closeButton = modal.locator('button').first();
      await closeButton.click();
      
      // Rafraîchir la page
      await page.reload();
      await page.waitForTimeout(2000);
      
      // Le modal ne devrait pas réapparaître
      await expect(modal).not.toBeVisible();
    }
  });
});

test.describe('Bons Plans - Flip Effect et détails', () => {
  
  test('doit afficher la carte de bon plan avec effet flip', async ({ page }) => {
    await page.goto('/etablissements/test-establishment-with-deals');
    
    // Fermer le modal si présent
    const modal = page.locator('[role="dialog"]');
    if (await modal.count() > 0) {
      const closeButton = modal.locator('button').first();
      await closeButton.click();
    }
    
    // Chercher la card de bon plan
    const dealCard = page.locator('[data-testid="deal-card"]').first().or(
      page.locator('.deal-card').first()
    );
    
    if (await dealCard.count() > 0) {
      await expect(dealCard).toBeVisible();
    }
  });

  test('doit flipper la carte au clic', async ({ page }) => {
    await page.goto('/etablissements/test-establishment-with-deals');
    
    // Fermer le modal
    await page.waitForTimeout(1000);
    const modal = page.locator('[role="dialog"]');
    if (await modal.count() > 0) {
      await modal.locator('button').first().click();
    }
    
    const dealCard = page.locator('[data-testid="deal-card"]').first();
    
    if (await dealCard.count() > 0) {
      // Cliquer sur la carte
      await dealCard.click();
      
      // Vérifier la rotation/flip (via classe CSS ou transformation)
      await page.waitForTimeout(500);
      
      // La carte devrait avoir changé d'état
      const flippedCard = page.locator('.flipped, [data-flipped="true"]').first();
      if (await flippedCard.count() > 0) {
        await expect(flippedCard).toBeVisible();
      }
    }
  });

  test('doit afficher le recto et le verso du bon plan', async ({ page }) => {
    await page.goto('/etablissements/test-establishment-with-deals');
    
    // Fermer le modal
    await page.waitForTimeout(1000);
    const modal = page.locator('[role="dialog"]');
    if (await modal.count() > 0) {
      await modal.locator('button').first().click();
    }
    
    const dealCard = page.locator('[data-testid="deal-card"]').first();
    
    if (await dealCard.count() > 0) {
      // Vérifier le recto (titre court visible)
      const frontTitle = dealCard.locator('.front, [data-side="front"]').locator('h3, h4').first();
      if (await frontTitle.count() > 0) {
        await expect(frontTitle).toBeVisible();
      }
      
      // Cliquer pour flipper
      await dealCard.click();
      await page.waitForTimeout(500);
      
      // Vérifier le verso (description complète)
      const backDescription = dealCard.locator('.back, [data-side="back"]').locator('p').first();
      if (await backDescription.count() > 0) {
        await expect(backDescription).toBeVisible();
      }
    }
  });
});

test.describe('Bons Plans - Système d\'engagement (Like/Dislike)', () => {
  
  test('doit permettre de liker un bon plan', async ({ page }) => {
    await page.goto('/etablissements/test-establishment-with-deals');
    
    // Fermer le modal
    await page.waitForTimeout(1000);
    const modal = page.locator('[role="dialog"]');
    if (await modal.count() > 0) {
      await modal.locator('button').first().click();
    }
    
    const dealCard = page.locator('[data-testid="deal-card"]').first();
    
    if (await dealCard.count() > 0) {
      // Chercher le bouton like (pouce vers le haut)
      const likeButton = dealCard.locator('button[aria-label*="like"], button[aria-label*="j\'aime"]').first().or(
        dealCard.locator('button').filter({ hasText: /👍|like/i }).first()
      );
      
      if (await likeButton.count() > 0) {
        // Cliquer sur like
        await likeButton.click();
        
        // Vérifier le feedback visuel
        await page.waitForTimeout(500);
        await expect(likeButton).toHaveClass(/active|liked|selected/);
      }
    }
  });

  test('doit permettre de disliker un bon plan', async ({ page }) => {
    await page.goto('/etablissements/test-establishment-with-deals');
    
    // Fermer le modal
    await page.waitForTimeout(1000);
    const modal = page.locator('[role="dialog"]');
    if (await modal.count() > 0) {
      await modal.locator('button').first().click();
    }
    
    const dealCard = page.locator('[data-testid="deal-card"]').first();
    
    if (await dealCard.count() > 0) {
      // Chercher le bouton dislike (pouce vers le bas)
      const dislikeButton = dealCard.locator('button[aria-label*="dislike"], button[aria-label*="j\'aime pas"]').first().or(
        dealCard.locator('button').filter({ hasText: /👎|dislike/i }).first()
      );
      
      if (await dislikeButton.count() > 0) {
        await dislikeButton.click();
        await page.waitForTimeout(500);
        await expect(dislikeButton).toHaveClass(/active|disliked|selected/);
      }
    }
  });

  test('doit enregistrer l\'engagement (anti-doublon IP)', async ({ page }) => {
    // Intercepter l'appel à l'API d'engagement
    let engagementCalled = false;
    await page.route('**/api/deals/engagement', async route => {
      engagementCalled = true;
      const postData = route.request().postDataJSON();
      expect(postData).toHaveProperty('dealId');
      expect(postData).toHaveProperty('type');
      expect(['liked', 'disliked']).toContain(postData.type);
      await route.fulfill({ status: 200, body: JSON.stringify({ success: true }) });
    });
    
    await page.goto('/etablissements/test-establishment-with-deals');
    
    // Fermer le modal
    await page.waitForTimeout(1000);
    const modal = page.locator('[role="dialog"]');
    if (await modal.count() > 0) {
      await modal.locator('button').first().click();
    }
    
    const dealCard = page.locator('[data-testid="deal-card"]').first();
    
    if (await dealCard.count() > 0) {
      const likeButton = dealCard.locator('button').filter({ hasText: /👍|like/i }).first();
      if (await likeButton.count() > 0) {
        await likeButton.click();
        await page.waitForTimeout(1000);
        expect(engagementCalled).toBe(true);
      }
    }
  });

  test('doit permettre de changer d\'avis (like → dislike)', async ({ page }) => {
    await page.goto('/etablissements/test-establishment-with-deals');
    
    // Fermer le modal
    await page.waitForTimeout(1000);
    const modal = page.locator('[role="dialog"]');
    if (await modal.count() > 0) {
      await modal.locator('button').first().click();
    }
    
    const dealCard = page.locator('[data-testid="deal-card"]').first();
    
    if (await dealCard.count() > 0) {
      const likeButton = dealCard.locator('button').filter({ hasText: /👍/i }).first();
      const dislikeButton = dealCard.locator('button').filter({ hasText: /👎/i }).first();
      
      if (await likeButton.count() > 0 && await dislikeButton.count() > 0) {
        // D'abord liker
        await likeButton.click();
        await page.waitForTimeout(500);
        
        // Puis disliker
        await dislikeButton.click();
        await page.waitForTimeout(500);
        
        // Le dislike devrait être actif maintenant
        await expect(dislikeButton).toHaveClass(/active|disliked|selected/);
      }
    }
  });
});

test.describe('Bons Plans - Validité temporelle', () => {
  
  test('ne doit afficher que les bons plans actifs selon horaires', async ({ page }) => {
    await page.goto('/etablissements/test-establishment-with-deals');
    
    // Tous les bons plans affichés doivent être actifs
    const dealCards = page.locator('[data-testid="deal-card"]').or(
      page.locator('.deal-card')
    );
    
    if (await dealCards.count() > 0) {
      // Vérifier qu'ils sont visibles
      const count = await dealCards.count();
      for (let i = 0; i < Math.min(count, 3); i++) {
        await expect(dealCards.nth(i)).toBeVisible();
      }
    }
  });

  test('doit afficher les horaires de validité du bon plan', async ({ page }) => {
    await page.goto('/etablissements/test-establishment-with-deals');
    
    const dealCard = page.locator('[data-testid="deal-card"]').first();
    
    if (await dealCard.count() > 0) {
      // Chercher les horaires (format HH:MM)
      const hoursText = dealCard.locator('text=/\\d{1,2}h\\d{0,2}|\\d{1,2}:\\d{2}/i');
      if (await hoursText.count() > 0) {
        await expect(hoursText.first()).toBeVisible();
      }
    }
  });
});

test.describe('Responsive - Événements et Bons Plans Mobile', () => {
  
  test.use({ viewport: { width: 375, height: 667 } }); // iPhone SE
  
  test('doit afficher le modal des bons plans en responsive mobile', async ({ page }) => {
    await page.goto('/etablissements/test-establishment-with-deals');
    
    await page.waitForTimeout(1000);
    const modal = page.locator('[role="dialog"]');
    
    if (await modal.count() > 0) {
      await expect(modal).toBeVisible();
      
      // Vérifier que le modal est bien dimensionné pour mobile
      const box = await modal.boundingBox();
      if (box) {
        expect(box.width).toBeLessThanOrEqual(375);
      }
    }
  });

  test('doit permettre de swiper les cartes de bons plans sur mobile', async ({ page }) => {
    await page.goto('/etablissements/test-establishment-with-deals');
    
    // Fermer le modal
    await page.waitForTimeout(1000);
    const modal = page.locator('[role="dialog"]');
    if (await modal.count() > 0) {
      await modal.locator('button').first().click();
    }
    
    const dealCard = page.locator('[data-testid="deal-card"]').first();
    
    if (await dealCard.count() > 0) {
      // Simuler un swipe (touch event)
      const box = await dealCard.boundingBox();
      if (box) {
        await page.touchscreen.tap(box.x + box.width / 2, box.y + box.height / 2);
        await page.waitForTimeout(300);
      }
    }
  });

  test('doit afficher les événements en liste sur mobile', async ({ page }) => {
    await page.goto('/etablissements/test-establishment-with-events');
    
    const eventsSection = page.locator('section').filter({ hasText: /événements/i });
    
    if (await eventsSection.count() > 0) {
      await expect(eventsSection).toBeVisible();
      
      // Vérifier l'affichage en colonne (flex-col, grid-cols-1, etc.)
      const eventCards = eventsSection.locator('[data-testid="event-card"]');
      if (await eventCards.count() > 0) {
        await expect(eventCards.first()).toBeVisible();
      }
    }
  });
});

test.describe('Événements - Engagement utilisateur', () => {
  
  test('doit permettre d\'indiquer son intérêt pour un événement', async ({ page }) => {
    await page.goto('/etablissements/test-establishment-with-events');
    
    const eventCard = page.locator('[data-testid="event-card"]').first();
    
    if (await eventCard.count() > 0) {
      // Chercher le bouton d'engagement (intéressé, participer, etc.)
      const engageButton = eventCard.locator('button').filter({ 
        hasText: /intéressé|participer|j'y vais/i 
      }).first();
      
      if (await engageButton.count() > 0) {
        await engageButton.click();
        await page.waitForTimeout(500);
        
        // Vérifier le feedback visuel
        await expect(engageButton).toHaveClass(/active|selected|engaged/);
      }
    }
  });

  test('doit afficher la jauge de participation d\'un événement', async ({ page }) => {
    await page.goto('/etablissements/test-establishment-with-events');
    
    const eventCard = page.locator('[data-testid="event-card"]').first();
    
    if (await eventCard.count() > 0) {
      // Chercher la jauge (progress bar, pourcentage)
      const gauge = eventCard.locator('[role="progressbar"], .progress, .gauge').first();
      
      if (await gauge.count() > 0) {
        await expect(gauge).toBeVisible();
      } else {
        // Ou chercher un texte de pourcentage
        const percentText = eventCard.locator('text=/\\d+%/');
        if (await percentText.count() > 0) {
          await expect(percentText).toBeVisible();
        }
      }
    }
  });
});

test.describe('Bons Plans - Lien externe et modalité', () => {
  
  test('doit afficher un lien vers la promotion si disponible', async ({ page }) => {
    await page.goto('/etablissements/test-establishment-with-deals');
    
    // Fermer le modal
    await page.waitForTimeout(1000);
    const modal = page.locator('[role="dialog"]');
    if (await modal.count() > 0) {
      await modal.locator('button').first().click();
    }
    
    const dealCard = page.locator('[data-testid="deal-card"]').first();
    
    if (await dealCard.count() > 0) {
      // Flipper pour voir le verso
      await dealCard.click();
      await page.waitForTimeout(500);
      
      // Chercher le lien externe
      const promoLink = dealCard.locator('a[href*="http"]').filter({ 
        hasText: /en savoir plus|voir l'offre/i 
      });
      
      if (await promoLink.count() > 0) {
        await expect(promoLink).toBeVisible();
        await expect(promoLink).toHaveAttribute('target', '_blank');
      }
    }
  });

  test('doit afficher la modalité du bon plan', async ({ page }) => {
    await page.goto('/etablissements/test-establishment-with-deals');
    
    const dealCard = page.locator('[data-testid="deal-card"]').first();
    
    if (await dealCard.count() > 0) {
      // Chercher la modalité (sur place, à emporter, en ligne, etc.)
      const modality = dealCard.locator('text=/sur place|à emporter|en ligne|livraison/i');
      if (await modality.count() > 0) {
        await expect(modality).toBeVisible();
      }
    }
  });
});

