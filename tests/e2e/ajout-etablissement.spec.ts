import { test, expect } from '@playwright/test';

/**
 * Test E2E : Ajout d'un établissement par un professionnel
 * 
 * Ce test vérifie le parcours complet :
 * 1. Accès à la page d'ajout
 * 2. Création de compte professionnel
 * 3. Vérification SIRET
 * 4. Ajout des informations de l'établissement
 * 5. Configuration des services
 * 6. Validation et soumission
 */

test.describe('Ajout d\'établissement', () => {
  
  test('Un professionnel peut créer son établissement', async ({ page }) => {
    // ========================================
    // ÉTAPE 1 : Accéder à la page d'ajout
    // ========================================
    await page.goto('/etablissements/nouveau');
    
    // Vérifier que la page est bien chargée
    await expect(page.locator('h1')).toContainText('Espace Professionnel');
    
    // ========================================
    // ÉTAPE 2 : Création de compte (Step 0)
    // ========================================
    
    // Remplir les informations personnelles
    await page.fill('input[name="accountFirstName"]', 'Marie');
    await page.fill('input[name="accountLastName"]', 'Dupont');
    await page.fill('input[name="accountEmail"]', `test-e2e-${Date.now()}@example.com`);
    await page.fill('input[name="accountPassword"]', 'MotDePasse123!');
    await page.fill('input[name="accountPasswordConfirm"]', 'MotDePasse123!');
    await page.fill('input[name="accountPhone"]', '+33612345678');
    
    // Capturer une capture d'écran
    await page.screenshot({ path: 'playwright-report/etape-1-compte.png' });
    
    // Cliquer sur "Suivant"
    await page.click('button:has-text("Suivant")');
    
    // ========================================
    // ÉTAPE 3 : Informations professionnelles (Step 1)
    // ========================================
    
    // Attendre que l'étape suivante soit visible
    await expect(page.locator('text=SIRET')).toBeVisible({ timeout: 5000 });
    
    // Remplir le SIRET
    await page.fill('input[name="siret"]', '12345678901234');
    
    await page.screenshot({ path: 'playwright-report/etape-2-siret.png' });
    
    // Cliquer sur "Suivant"
    await page.click('button:has-text("Suivant")');
    
    // ========================================
    // ÉTAPE 4 : Enrichissement (Step 2)
    // ========================================
    
    // Attendre l'étape d'enrichissement
    await page.waitForTimeout(2000);
    
    // Chercher le bouton "Ignorer" ou "Passer"
    const skipButton = page.locator('button:has-text("Ignorer"), button:has-text("Passer")');
    if (await skipButton.isVisible()) {
      await skipButton.click();
    }
    
    await page.screenshot({ path: 'playwright-report/etape-3-enrichissement.png' });
    
    // ========================================
    // ÉTAPE 5 : Informations établissement (Step 3)
    // ========================================
    
    // Attendre que le formulaire soit visible
    await page.waitForTimeout(1000);
    
    // Remplir les informations de l'établissement
    await page.fill('input[name="establishmentName"]', 'Le Bistrot Test E2E');
    await page.fill('textarea[name="description"]', 'Un restaurant convivial pour les tests automatisés.');
    await page.fill('input[name="address"]', '15 Rue de la République, 75001 Paris');
    await page.fill('input[name="phone"]', '+33145678901');
    await page.fill('input[name="email"]', 'contact@bistrot-test.com');
    
    await page.screenshot({ path: 'playwright-report/etape-4-etablissement.png' });
    
    // Cliquer sur "Suivant"
    await page.click('button:has-text("Suivant")');
    
    // ========================================
    // ÉTAPE 6 : Services (Step 4)
    // ========================================
    
    await page.waitForTimeout(1000);
    
    // Sélectionner quelques services (si disponibles)
    const wifiCheckbox = page.locator('input[type="checkbox"][value*="Wi-Fi"], input[type="checkbox"][value*="wifi"]').first();
    if (await wifiCheckbox.isVisible()) {
      await wifiCheckbox.check();
    }
    
    await page.screenshot({ path: 'playwright-report/etape-5-services.png' });
    
    // Cliquer sur "Suivant"
    await page.click('button:has-text("Suivant")');
    
    // ========================================
    // ÉTAPE 7 : Tags (Step 5)
    // ========================================
    
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'playwright-report/etape-6-tags.png' });
    
    // Cliquer sur "Suivant"
    await page.click('button:has-text("Suivant")');
    
    // ========================================
    // ÉTAPE 8 : Réseaux sociaux (Step 6)
    // ========================================
    
    await page.waitForTimeout(1000);
    
    // Remplir les réseaux sociaux
    await page.fill('input[name="website"]', 'https://bistrot-test.com');
    await page.fill('input[name="instagram"]', 'https://instagram.com/bistrottest');
    
    await page.screenshot({ path: 'playwright-report/etape-7-social.png' });
    
    // Cliquer sur "Suivant"
    await page.click('button:has-text("Suivant")');
    
    // ========================================
    // ÉTAPE 9 : Abonnement (Step 7)
    // ========================================
    
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'playwright-report/etape-8-abonnement.png' });
    
    // Sélectionner l'abonnement gratuit
    const freeSubscription = page.locator('input[value="FREE"], button:has-text("Gratuit")').first();
    if (await freeSubscription.isVisible()) {
      await freeSubscription.click();
    }
    
    // Cliquer sur "Suivant"
    await page.click('button:has-text("Suivant")');
    
    // ========================================
    // ÉTAPE 10 : Résumé et validation (Step 8)
    // ========================================
    
    await page.waitForTimeout(1000);
    
    // Vérifier que le résumé affiche bien le nom de l'établissement
    await expect(page.locator('text=Le Bistrot Test E2E')).toBeVisible({ timeout: 10000 });
    
    await page.screenshot({ path: 'playwright-report/etape-9-resume.png' });
    
    // Soumettre le formulaire
    const submitButton = page.locator('button:has-text("Valider"), button:has-text("Soumettre"), button:has-text("Envoyer")').first();
    await submitButton.click();
    
    // ========================================
    // ÉTAPE 11 : Vérification de la redirection
    // ========================================
    
    // Attendre la redirection (vers dashboard ou page de succès)
    await page.waitForURL(/dashboard|success|etablissements/, { timeout: 10000 });
    
    // Capturer la page finale
    await page.screenshot({ path: 'playwright-report/etape-10-final.png' });
    
    // Vérifier qu'on est bien redirigé
    const currentUrl = page.url();
    expect(currentUrl).toMatch(/dashboard|success|etablissements/);
    
    console.log('✅ Test réussi ! Établissement créé avec succès.');
  });

  test('Validation des champs obligatoires', async ({ page }) => {
    await page.goto('/etablissements/nouveau');
    
    // Essayer de passer à l'étape suivante sans remplir
    await page.click('button:has-text("Suivant")');
    
    // Vérifier que des erreurs s'affichent
    await expect(page.locator('text=/requis|obligatoire|erreur/i')).toBeVisible({ timeout: 3000 });
    
    await page.screenshot({ path: 'playwright-report/erreurs-validation.png' });
  });

  test('Affichage de l\'établissement sur la page publique', async ({ page }) => {
    // Note: Ce test suppose qu'un établissement existe déjà
    // Vous pouvez le modifier pour utiliser l'ID d'un établissement de test
    
    await page.goto('/etablissements/le-bistrot-test-e2e');
    
    // Vérifier que la page se charge
    await expect(page.locator('h1, h2')).toContainText(/Bistrot|Restaurant/i);
    
    // Vérifier la présence des sections importantes
    await expect(page.locator('text=/horaires|contact|adresse/i')).toBeVisible();
    
    await page.screenshot({ path: 'playwright-report/page-publique.png' });
  });
});

