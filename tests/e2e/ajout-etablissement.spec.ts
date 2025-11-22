import { test, expect } from '@playwright/test';

test.describe('Ajout d\'un établissement professionnel', () => {
  test.beforeEach(async ({ page }) => {
    // Intercepter les erreurs de console pour le débogage
    page.on('console', (message) => {
      if (message.type() === 'error') {
        console.log(`⚠️ Console error: ${message.text()}`);
      }
    });

    page.on('pageerror', (exception) => {
      console.error(`[Page Error] ${exception}`);
    });

    page.on('requestfailed', (request) => {
      console.error(`[Request Failed] ${request.url()} - ${request.failure()?.errorText}`);
    });
  });

  test('Doit compléter avec succès l\'inscription d\'un établissement', async ({ page }) => {
    const testData = {
      accountFirstName: 'Jean',
      accountLastName: 'Dupont',
      accountEmail: `test-e2e-${Date.now()}@example.com`,
      accountPassword: 'TestSecure123!',
      accountPasswordConfirm: 'TestSecure123!',
      phone: '01500555006', // Numéro de test Twilio
      siret: '84046768200018',
      establishmentName: 'Le Bistrot Test E2E',
      address: {
        street: '123 Rue de Test',
        postalCode: '75001',
        city: 'Paris'
      }
    };

    // Navigation vers la page d'inscription
    await page.goto('/etablissements/nouveau', {
      waitUntil: 'networkidle',
      timeout: 60000
    });

    // Attendre que le formulaire soit prêt
    await expect(page.locator('[data-testid="establishment-form"]')).toBeVisible({ timeout: 30000 });

    // Fermer le modal de bienvenue s'il existe
    const welcomeModalClose = page.locator('button[aria-label*="fermer" i]')
      .or(page.locator('button:has-text("✕")'))
      .or(page.locator('button:has-text("X")'))
      .or(page.locator('[role="dialog"] button').first());
    
    if (await welcomeModalClose.first().isVisible({ timeout: 5000 }).catch(() => false)) {
      await welcomeModalClose.first().click();
      await expect(page.locator('[data-testid="establishment-form"]')).toBeVisible();
    }

    // ==========================================
    // ÉTAPE 0 : Création de compte
    // ==========================================
    await expect(page.locator('[data-testid="form-step-0"]')).toBeVisible();

    // Remplir les informations du compte
    await page.getByTestId('form-account-firstname').fill(testData.accountFirstName);
    await page.getByTestId('form-account-lastname').fill(testData.accountLastName);
    await page.getByTestId('form-account-email').fill(testData.accountEmail);
    
    // Attendre que la vérification d'email soit terminée
    await expect(
      page.locator('text=✓').or(page.locator('.text-green-600'))
    ).toBeVisible({ timeout: 10000 }).catch(() => {});

    await page.getByTestId('form-account-password').fill(testData.accountPassword);
    await page.getByTestId('form-account-password-confirm').fill(testData.accountPasswordConfirm);

    // Intercepter la réponse de l'API pour récupérer le code de vérification
    // Il faut créer la promesse AVANT de remplir le téléphone
    const phoneVerificationResponsePromise = page.waitForResponse(
      (response) => response.url().includes('/api/verify-phone') && 
                   response.request().method() === 'POST' &&
                   response.status() === 200,
      { timeout: 15000 }
    );

    // Remplir le téléphone (numéro de test Twilio)
    // Cela déclenchera l'envoi automatique du SMS
    await page.getByTestId('form-account-phone').fill(testData.phone);

    // Attendre la réponse de l'API pour récupérer le code
    const phoneVerificationResponse = await phoneVerificationResponsePromise;
    const phoneVerificationData = await phoneVerificationResponse.json();
    const verificationCode = phoneVerificationData.debugCode || phoneVerificationData.devCode || '';

    // Attendre que le modal de vérification s'ouvre automatiquement
    const phoneModal = page.locator('[role="dialog"]').filter({ hasText: /vérification|code/i });
    await expect(phoneModal).toBeVisible({ timeout: 10000 });

    // Trouver l'input pour le code de vérification
    const codeInput = phoneModal.locator('input[type="text"]')
      .or(phoneModal.locator('input[placeholder*="code" i]'))
      .or(phoneModal.locator('input[pattern*="\\d"]'))
      .first();
    
    await expect(codeInput).toBeVisible({ timeout: 5000 });

    // Entrer le code de vérification récupéré depuis l'API
    if (!verificationCode) {
      throw new Error('Code de vérification non trouvé dans la réponse API');
    }
    await codeInput.fill(verificationCode);

    // Cliquer sur le bouton de vérification
    const verifyButton = phoneModal.locator('button:has-text("Valider")')
      .or(phoneModal.locator('button:has-text("Vérifier")'))
      .or(phoneModal.locator('button[type="submit"]'))
      .or(phoneModal.locator('button').filter({ hasText: /valider|vérifier/i }))
      .first();
    
    await expect(verifyButton).toBeVisible({ timeout: 5000 });
    await verifyButton.click();

    // Attendre que le modal se ferme et que le téléphone soit vérifié
    await expect(phoneModal).not.toBeVisible({ timeout: 10000 });

    // Attendre que le bouton "Suivant" soit activé
    await expect(page.getByTestId('form-button-next')).toBeEnabled({ timeout: 10000 });

    // Cliquer sur "Suivant" pour passer à l'étape 1
    await page.getByTestId('form-button-next').click();

    // ==========================================
    // ÉTAPE 1 : Informations professionnelles (SIRET)
    // ==========================================
    await expect(page.locator('[data-testid="form-step-1"]')).toBeVisible({ timeout: 10000 });

    // Remplir le SIRET
    await page.getByTestId('form-siret').fill(testData.siret);

    // Attendre que la vérification SIRET soit terminée (vérifier que le bouton suivant n'est plus désactivé)
    await expect(page.getByTestId('form-button-next')).toBeEnabled({ timeout: 15000 });

    // Si un bouton pour utiliser les données INSEE apparaît, cliquer dessus
    const useInseeButton = page.locator('button:has-text("Utiliser ces informations")')
      .or(page.locator('button:has-text("Remplir avec ces données")'));
    
    if (await useInseeButton.isVisible({ timeout: 5000 }).catch(() => false)) {
      await useInseeButton.click();
    }

    // Cliquer sur "Suivant"
    await page.getByTestId('form-button-next').click();

    // ==========================================
    // ÉTAPE 2 : Enrichissement (peut être ignorée)
    // ==========================================
    // Si on est à l'étape d'enrichissement, passer directement
    if (await page.locator('[data-testid="form-step-2"]').isVisible({ timeout: 3000 }).catch(() => false)) {
      // Chercher un bouton "Passer" ou "Ignorer" ou simplement "Suivant"
      const skipButton = page.locator('button:has-text("Passer")')
        .or(page.locator('button:has-text("Ignorer")'))
        .or(page.locator('button:has-text("Suivant")'));
      
      if (await skipButton.first().isVisible({ timeout: 3000 }).catch(() => false)) {
        await skipButton.first().click();
      }
    }

    // ==========================================
    // ÉTAPE 3 : Informations de l'établissement
    // ==========================================
    await expect(page.locator('[data-testid="form-step-3"]')).toBeVisible({ timeout: 10000 });

    // Remplir le nom de l'établissement
    await page.getByTestId('form-establishment-name').fill(testData.establishmentName);

    // Remplir l'adresse (rechercher le champ d'adresse)
    const addressInput = page.locator('input[placeholder*="adresse" i]')
      .or(page.locator('input[placeholder*="rue" i]'))
      .or(page.locator('input[type="text"]').filter({ hasNot: page.locator('[data-testid*="name"]') }))
      .first();
    
    if (await addressInput.isVisible({ timeout: 5000 }).catch(() => false)) {
      await addressInput.fill(`${testData.address.street}, ${testData.address.postalCode} ${testData.address.city}`);
      // Attendre l'autocomplétion
      await page.waitForTimeout(2000); // Attente pour l'autocomplétion Google
    }

    // Cliquer sur "Suivant"
    await page.getByTestId('form-button-next').click();

    // ==========================================
    // ÉTAPES 4-7 : Services, Tags, Réseaux sociaux, Abonnement
    // ==========================================
    // Passer rapidement les étapes optionnelles en cliquant sur "Suivant"
    // Maximum 10 tentatives pour éviter une boucle infinie
    for (let step = 0; step < 10; step++) {
      // Vérifier si on est arrivé à l'étape Résumé (step 8)
      const summaryStep = page.locator('[data-testid="form-step-8"]')
        .or(page.locator('[data-testid="form-summary-step"]'));
      
      if (await summaryStep.isVisible({ timeout: 2000 }).catch(() => false)) {
        break;
      }

      // Vérifier si le bouton "Suivant" existe toujours
      const nextButton = page.getByTestId('form-button-next');
      if (!(await nextButton.isVisible({ timeout: 2000 }).catch(() => false))) {
        // Si pas de bouton "Suivant", on est peut-être déjà au Résumé
        const submitButton = page.getByTestId('form-button-submit');
        if (await submitButton.isVisible({ timeout: 2000 }).catch(() => false)) {
          break;
        }
        // Sinon, prendre une capture pour debug
        await page.screenshot({ path: `test-stuck-step${step + 4}.png`, fullPage: true });
        break;
      }

      // Cliquer sur "Suivant"
      await nextButton.click();
      
      // Attendre que l'étape suivante soit chargée (vérifier qu'on a changé d'étape)
      await page.waitForTimeout(1000); // Mini-attente pour la transition
    }

    // ==========================================
    // ÉTAPE 8 : Résumé et soumission
    // ==========================================
    // Attendre que l'étape Résumé soit visible
    await expect(
      page.locator('[data-testid="form-step-8"]')
        .or(page.locator('[data-testid="form-summary-step"]'))
        .or(page.locator('[data-testid="summary-header"]'))
    ).toBeVisible({ timeout: 15000 });

    // Vérifier que les informations principales sont affichées
    await expect(page.locator(`text=${testData.establishmentName}`).first()).toBeVisible({ timeout: 5000 });

    // Cliquer sur le bouton de soumission
    const submitButton = page.getByTestId('form-button-submit');
    await expect(submitButton).toBeVisible({ timeout: 10000 });
    await expect(submitButton).toBeEnabled({ timeout: 10000 });

    // Intercepter la réponse de l'API pour vérifier le succès
    const responsePromise = page.waitForResponse(
      (response) => response.url().includes('/api/professional-registration') && response.status() < 400,
      { timeout: 30000 }
    );

    await submitButton.click();

    // Attendre la réponse de l'API
    const response = await responsePromise;
    expect(response.ok()).toBeTruthy();

    // Attendre soit une redirection vers le dashboard, soit un message de succès
    await Promise.race([
      page.waitForURL(/dashboard|etablissements|success/, { timeout: 20000 }).catch(() => null),
      expect(page.locator('text=succès').or(page.locator('text=Félicitations')).or(page.locator('text=bienvenue'))).toBeVisible({ timeout: 10000 }).catch(() => null)
    ]);

    // Vérifier qu'il n'y a pas d'erreur de soumission
    const errorMessage = page.locator('.text-red-500').or(page.locator('[role="alert"]'));
    const hasError = await errorMessage.first().isVisible({ timeout: 3000 }).catch(() => false);
    
    if (hasError) {
      const errorText = await errorMessage.first().textContent().catch(() => 'Erreur inconnue');
      throw new Error(`Erreur lors de la soumission: ${errorText}`);
    }

    // Vérifier le succès (redirection ou message)
    const redirectedToDashboard = page.url().includes('dashboard') || page.url().includes('etablissements');
    const successMessage = page.locator('text=succès').or(page.locator('text=Félicitations')).or(page.locator('text=bienvenue'));
    const hasSuccessMessage = await successMessage.first().isVisible({ timeout: 5000 }).catch(() => false);
    
    expect(redirectedToDashboard || hasSuccessMessage).toBeTruthy();
  });
});
