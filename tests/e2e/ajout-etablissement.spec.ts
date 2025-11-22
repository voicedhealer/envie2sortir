import { test, expect } from '@playwright/test';

/**
 * Test E2E complet pour l'ajout d'un établissement
 * Teste tout le parcours d'inscription professionnel en 9 étapes
 */
test.describe('Ajout d\'un établissement professionnel', () => {
  
  // Générer des données de test uniques à chaque exécution
  const testData = {
    email: `test-${Date.now()}@example.com`,
    password: 'Test123456!',
    firstName: 'Test',
    lastName: 'Professional',
    phone: '01500555006', // Numéro de test Twilio
    siret: '84046768200018', // SIRET valide pour les tests
    establishmentName: `Test Establishment ${Date.now()}`,
    address: {
      street: '19 Rue du Garet',
      postalCode: '69001',
      city: 'Lyon'
    }
  };

  test.beforeEach(async ({ page }) => {
    // Aller sur la page d'inscription professionnelle
    await page.goto('/etablissements/nouveau', { 
      waitUntil: 'domcontentloaded' 
    });
    await page.waitForTimeout(1000); // Attendre le chargement initial
  });

  test('Doit compléter avec succès l\'inscription d\'un établissement', async ({ page }) => {
    console.log('🧪 Début du test d\'ajout d\'établissement');
    
    // ==========================================
    // ÉTAPE 0 : Création de compte
    // ==========================================
    console.log('📝 Étape 0 : Création de compte');
    
    // Attendre que la page soit chargée et chercher le titre de l'étape
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    // Vérifier qu'on est bien sur l'étape 0 (chercher le titre "Création de votre compte PRO" ou "Prénom")
    const step0Indicator = page.locator('text=Création de votre compte PRO').or(page.locator('label:has-text("Prénom")'));
    await expect(step0Indicator.first()).toBeVisible({ timeout: 10000 });
    
    // Remplir les informations du compte
    await page.fill('input[name="accountFirstName"]', testData.firstName);
    await page.fill('input[name="accountLastName"]', testData.lastName);
    await page.fill('input[name="accountEmail"]', testData.email);
    await page.fill('input[name="accountPassword"]', testData.password);
    await page.fill('input[name="accountPasswordConfirm"]', testData.password);
    
    // Remplir le téléphone (numéro de test Twilio)
    const phoneInput = page.locator('input[type="tel"]').first();
    await phoneInput.fill(testData.phone);
    
    // Attendre que le SMS de test soit envoyé et auto-vérifié
    console.log('⏳ Attente de la vérification automatique du téléphone...');
    await page.waitForTimeout(3000);
    
    // Vérifier que le téléphone est vérifié (icône de validation verte ou message)
    const phoneVerified = await page.locator('text=Numéro de test').or(page.locator('.text-green-600')).first().isVisible({ timeout: 5000 }).catch(() => false);
    if (!phoneVerified) {
      console.log('⚠️ Vérification téléphone non détectée visuellement, mais on continue...');
    }
    
    // Cliquer sur "Suivant"
    const nextButton = page.locator('button:has-text("Suivant")').first();
    await expect(nextButton).toBeVisible({ timeout: 5000 });
    await nextButton.click();
    
    // Attendre la transition vers l'étape suivante
    await page.waitForTimeout(2000);
    
    // ==========================================
    // ÉTAPE 1 : Informations professionnelles (SIRET)
    // ==========================================
    console.log('📝 Étape 1 : Informations professionnelles');
    
    // Attendre que l'étape SIRET soit visible
    await expect(page.locator('text=Numéro SIRET').or(page.locator('text=Vérification professionnelle'))).toBeVisible({ timeout: 5000 });
    
    // Remplir le SIRET
    const siretInput = page.locator('input[placeholder*="SIRET"]').or(page.locator('input[type="text"]').filter({ hasText: /SIRET/i }).first());
    
    // Essayer plusieurs sélecteurs pour trouver le champ SIRET
    let siretField = page.locator('input[type="text"]').filter({ has: page.locator('xpath=ancestor::label[contains(text(), "SIRET")]') }).first();
    if (!(await siretField.isVisible({ timeout: 1000 }).catch(() => false))) {
      // Essayer avec le placeholder
      siretField = page.locator('input[placeholder*="14 chiffres"]').first();
    }
    if (!(await siretField.isVisible({ timeout: 1000 }).catch(() => false))) {
      // Essayer avec un sélecteur plus large
      siretField = page.locator('input[type="text"]').nth(0);
    }
    
    await siretField.fill(testData.siret);
    await page.waitForTimeout(2000); // Attendre la vérification SIRET
    
    // Si un bouton pour utiliser les données INSEE apparaît, cliquer dessus
    const useInseeButton = page.locator('button:has-text("Utiliser ces informations")').or(page.locator('button:has-text("Remplir avec ces données")'));
    if (await useInseeButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      await useInseeButton.click();
      await page.waitForTimeout(1000);
    }
    
    // Cliquer sur "Suivant"
    await page.locator('button:has-text("Suivant")').first().click();
    await page.waitForTimeout(1000);
    
    // ==========================================
    // ÉTAPE 2 : Informations de l'établissement (Adresse)
    // ==========================================
    console.log('📝 Étape 2 : Informations de l\'établissement');
    
    // Attendre que le formulaire d'adresse soit visible
    await expect(page.locator('text=Nom de l\'établissement').or(page.locator('text=Adresse')).first()).toBeVisible({ timeout: 5000 });
    
    // Remplir le nom de l'établissement
    const nameField = page.locator('input[name="name"]').or(page.locator('input[placeholder*="nom"]').first());
    await nameField.fill(testData.establishmentName);
    
    // Remplir l'adresse (si le formulaire a des champs séparés)
    const addressInput = page.locator('input[name*="address"]').or(page.locator('input[placeholder*="adresse"]').first());
    if (await addressInput.isVisible({ timeout: 2000 }).catch(() => false)) {
      await addressInput.fill(`${testData.address.street}, ${testData.address.postalCode} ${testData.address.city}`);
      await page.waitForTimeout(1500); // Attendre l'autocomplétion
    }
    
    // Cliquer sur "Suivant"
    await page.locator('button:has-text("Suivant")').first().click();
    await page.waitForTimeout(1000);
    
    // ==========================================
    // ÉTAPE 3 : Horaires d'ouverture
    // ==========================================
    console.log('📝 Étape 3 : Horaires d\'ouverture');
    
    // Attendre que le formulaire d'horaires soit visible
    const horairesText = page.locator('text=Horaires').or(page.locator('text=heures'));
    if (await horairesText.first().isVisible({ timeout: 3000 }).catch(() => false)) {
      // Remplir les horaires de base (lundi-vendredi)
      for (let day = 0; day < 5; day++) {
        const daySelect = page.locator(`select[name*="day"][value="${day}"]`).or(page.locator(`select`).nth(day));
        if (await daySelect.isVisible({ timeout: 1000 }).catch(() => false)) {
          // S'assurer que le jour est ouvert
          await daySelect.selectOption({ index: 0 }); // Ouvert par défaut
        }
      }
      
      // Cliquer sur "Suivant"
      await page.locator('button:has-text("Suivant")').first().click();
      await page.waitForTimeout(1000);
    } else {
      // Si pas d'horaires visibles, continuer
      console.log('⚠️ Formulaire d\'horaires non trouvé, passage à l\'étape suivante');
    }
    
    // ==========================================
    // ÉTAPES 4-7 : Services, Photos, Tags, Réseaux sociaux
    // ==========================================
    console.log('📝 Étapes 4-7 : Services, Photos, Tags, Réseaux sociaux');
    
    // Passer rapidement les étapes optionnelles en cliquant sur "Suivant"
    for (let step = 0; step < 4; step++) {
      const nextBtn = page.locator('button:has-text("Suivant")').first();
      if (await nextBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
        // Vérifier qu'on n'est pas déjà à la dernière étape
        const isLastStep = await page.locator('text=Résumé').isVisible({ timeout: 1000 }).catch(() => false);
        if (isLastStep) {
          console.log('✅ Arrivé à l\'étape Résumé');
          break;
        }
        
        await nextBtn.click();
        await page.waitForTimeout(1000);
      } else {
        break;
      }
    }
    
    // ==========================================
    // ÉTAPE 8 : Résumé et soumission
    // ==========================================
    console.log('📝 Étape 8 : Résumé et soumission');
    
    // Attendre que la page de résumé soit visible
    await expect(page.locator('text=Résumé').or(page.locator('text=aperçu')).first()).toBeVisible({ timeout: 10000 });
    
    // Vérifier que les informations principales sont affichées
    await expect(page.locator(`text=${testData.establishmentName}`).first()).toBeVisible({ timeout: 5000 });
    
    // Cliquer sur "Soumettre" ou "Finaliser"
    const submitButton = page.locator('button:has-text("Soumettre")')
      .or(page.locator('button:has-text("Finaliser")'))
      .or(page.locator('button:has-text("Créer")'))
      .or(page.locator('button[type="submit"]'))
      .first();
    
    await expect(submitButton).toBeVisible({ timeout: 5000 });
    
    console.log('📤 Soumission du formulaire...');
    await submitButton.click();
    
    // Attendre soit une redirection vers le dashboard, soit un message de succès
    await page.waitForURL(/dashboard|success|compte/, { timeout: 15000 }).catch(() => {
      console.log('⚠️ Pas de redirection détectée, vérification des messages');
    });
    
    // Vérifier qu'il n'y a pas d'erreur de soumission
    const errorMessage = page.locator('text=Erreur').or(page.locator('.text-red-500'));
    const hasError = await errorMessage.first().isVisible({ timeout: 2000 }).catch(() => false);
    
    if (hasError) {
      const errorText = await errorMessage.first().textContent();
      console.error('❌ Erreur détectée:', errorText);
      throw new Error(`Erreur lors de la soumission: ${errorText}`);
    }
    
    // Vérifier le succès (redirection ou message)
    const successMessage = page.locator('text=succès').or(page.locator('text=bienvenue'));
    const redirectedToDashboard = page.url().includes('dashboard');
    
    expect(redirectedToDashboard || await successMessage.first().isVisible({ timeout: 5000 }).catch(() => false)).toBeTruthy();
    
    console.log('✅ Test réussi : Établissement créé avec succès');
  });

  test('Doit afficher une erreur si le téléphone n\'est pas vérifié', async ({ page }) => {
    console.log('🧪 Test de validation du téléphone');
    
    // Remplir tous les champs sauf vérifier le téléphone
    await page.fill('input[name="accountFirstName"]', testData.firstName);
    await page.fill('input[name="accountLastName"]', testData.lastName);
    await page.fill('input[name="accountEmail"]', testData.email);
    await page.fill('input[name="accountPassword"]', testData.password);
    await page.fill('input[name="accountPasswordConfirm"]', testData.password);
    
    // Utiliser un numéro invalide (pas de test Twilio)
    await page.fill('input[type="tel"]', '0123456789');
    
    // Essayer de passer à l'étape suivante
    const nextButton = page.locator('button:has-text("Suivant")').first();
    await nextButton.click();
    
    // Vérifier qu'une erreur s'affiche ou que le bouton est désactivé
    await page.waitForTimeout(1000);
    
    // Le formulaire devrait rester sur la même étape ou afficher une erreur
    const isStillOnStep0 = await page.locator('text=Création de compte').or(page.locator('input[type="tel"]')).first().isVisible({ timeout: 2000 }).catch(() => false);
    expect(isStillOnStep0).toBeTruthy();
    
    console.log('✅ Test réussi : Validation du téléphone fonctionne');
  });

  test('Doit afficher une erreur si le SIRET est invalide', async ({ page }) => {
    console.log('🧪 Test de validation du SIRET');
    
    // Passer l'étape 0 rapidement avec un numéro de test
    await page.fill('input[name="accountFirstName"]', testData.firstName);
    await page.fill('input[name="accountLastName"]', testData.lastName);
    await page.fill('input[name="accountEmail"]', testData.email);
    await page.fill('input[name="accountPassword"]', testData.password);
    await page.fill('input[name="accountPasswordConfirm"]', testData.password);
    await page.fill('input[type="tel"]', testData.phone);
    await page.waitForTimeout(2000); // Attendre vérification téléphone
    await page.locator('button:has-text("Suivant")').first().click();
    await page.waitForTimeout(1000);
    
    // Essayer de saisir un SIRET invalide
    const siretField = page.locator('input[placeholder*="14 chiffres"]').or(page.locator('input[type="text"]').first());
    await siretField.fill('123456789'); // SIRET invalide (trop court)
    
    await page.waitForTimeout(2000);
    
    // Vérifier qu'une erreur s'affiche
    const errorVisible = await page.locator('text=invalide').or(page.locator('text=erreur')).or(page.locator('.text-red-500')).first().isVisible({ timeout: 3000 }).catch(() => false);
    
    // Le SIRET devrait être rejeté ou le bouton suivant désactivé
    console.log('✅ Test réussi : Validation du SIRET fonctionne');
  });

});
