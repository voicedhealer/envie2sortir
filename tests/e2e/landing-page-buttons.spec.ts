import { test, expect } from '@playwright/test';

test.describe('Boutons de la page d\'accueil - Premier clic', () => {
  
  test('Clic sur "Créer un compte gratuitement" dès l\'ouverture de la page', async ({ page }) => {
    console.log('🧪 Test : Navigation vers page d\'accueil');
    
    // Aller sur la page d'accueil
    await page.goto('http://localhost:3000', { 
      waitUntil: 'domcontentloaded' // Ne pas attendre que tout soit chargé
    });
    
    console.log('🧪 Test : Attente de 100ms (simulation utilisateur rapide)');
    // Attendre seulement 100ms (utilisateur très rapide)
    await page.waitForTimeout(100);
    
    console.log('🧪 Test : Recherche du bouton "Créer un compte"');
    // Chercher le bouton dans la section DailyDealsCarousel
    const createAccountButton = page.locator('text=Créer un compte gratuitement').first();
    
    // Vérifier que le bouton est visible
    await expect(createAccountButton).toBeVisible({ timeout: 5000 });
    
    console.log('🧪 Test : Clic sur le bouton (premier clic)');
    // Cliquer sur le bouton
    await createAccountButton.click();
    
    console.log('🧪 Test : Vérification de la navigation vers /auth');
    // Vérifier qu'on est bien redirigé vers /auth
    await expect(page).toHaveURL(/.*\/auth/, { timeout: 5000 });
    
    console.log('✅ Test réussi : Premier clic a fonctionné');
  });

  test('Clic sur "Ajoutez mon établissement" dès l\'ouverture de la page', async ({ page }) => {
    console.log('🧪 Test : Navigation vers page d\'accueil');
    
    // Aller sur la page d'accueil
    await page.goto('http://localhost:3000', { 
      waitUntil: 'domcontentloaded'
    });
    
    console.log('🧪 Test : Attente de 100ms (simulation utilisateur rapide)');
    await page.waitForTimeout(100);
    
    console.log('🧪 Test : Recherche du bouton "Ajoutez mon établissement"');
    // Chercher le bouton dans la section EventsCarousel
    const addEstablishmentButton = page.locator('text=Ajoutez mon établissement et créez un événement').first();
    
    // Vérifier que le bouton est visible
    await expect(addEstablishmentButton).toBeVisible({ timeout: 10000 });
    
    console.log('🧪 Test : Clic sur le bouton (premier clic)');
    // Cliquer sur le bouton
    await addEstablishmentButton.click();
    
    console.log('🧪 Test : Vérification de la navigation vers /etablissements/nouveau');
    // Vérifier qu'on est bien redirigé vers /etablissements/nouveau
    await expect(page).toHaveURL(/.*\/etablissements\/nouveau/, { timeout: 5000 });
    
    console.log('✅ Test réussi : Premier clic a fonctionné');
  });

  test('Clic immédiat (0ms) sur "Créer un compte" - Cas extrême', async ({ page }) => {
    console.log('🧪 Test : Navigation vers page d\'accueil');
    
    // Aller sur la page d'accueil
    await page.goto('http://localhost:3000', { 
      waitUntil: 'domcontentloaded'
    });
    
    console.log('🧪 Test : Clic IMMÉDIAT sans attente');
    // CLIC IMMÉDIAT dès que le DOM est chargé (pas d'attente)
    const createAccountButton = page.locator('text=Créer un compte gratuitement').first();
    
    // Attendre que le bouton existe dans le DOM
    await createAccountButton.waitFor({ state: 'attached', timeout: 5000 });
    
    // Cliquer IMMÉDIATEMENT (même si pas complètement visible)
    await createAccountButton.click({ force: true, timeout: 1000 });
    
    console.log('🧪 Test : Vérification de la navigation vers /auth');
    // Vérifier qu'on est bien redirigé vers /auth
    await expect(page).toHaveURL(/.*\/auth/, { timeout: 5000 });
    
    console.log('✅ Test réussi : Clic immédiat a fonctionné');
  });

  test('Attendre stabilisation complète puis cliquer - Test de contrôle', async ({ page }) => {
    console.log('🧪 Test : Navigation vers page d\'accueil');
    
    // Aller sur la page d'accueil
    await page.goto('http://localhost:3000', { 
      waitUntil: 'networkidle' // Attendre que tout soit chargé
    });
    
    console.log('🧪 Test : Attente de 2 secondes (page complètement chargée)');
    // Attendre 2 secondes pour être sûr que tout est stabilisé
    await page.waitForTimeout(2000);
    
    console.log('🧪 Test : Recherche du bouton');
    const createAccountButton = page.locator('text=Créer un compte gratuitement').first();
    
    await expect(createAccountButton).toBeVisible();
    
    console.log('🧪 Test : Clic après stabilisation');
    await createAccountButton.click();
    
    console.log('🧪 Test : Vérification de la navigation');
    await expect(page).toHaveURL(/.*\/auth/, { timeout: 5000 });
    
    console.log('✅ Test réussi : Clic après stabilisation a fonctionné');
  });

});

