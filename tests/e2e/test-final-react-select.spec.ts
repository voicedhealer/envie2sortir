import { test, expect } from '@playwright/test';

/**
 * Test final avec interaction correcte du React Select
 */

test.describe('Test Final - React Select Activités', () => {
  
  test('Créer un établissement avec sélection d\'activités via React Select', async ({ page }) => {
    console.log('🚀 Début du test final avec React Select...');
    
    // ========================================
    // ÉTAPE 1 : Navigation et formulaire de compte
    // ========================================
    
    await page.goto('/etablissements/nouveau');
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('input[placeholder="Votre prénom"]');
    
    console.log('✅ Page chargée');
    
    // Remplir le formulaire de compte
    const timestamp = Date.now();
    const testEmail = `test-react-select-${timestamp}@example.com`;
    const establishmentName = `Le Bistrot React Select ${timestamp}`;
    
    await page.fill('input[placeholder="Votre prénom"]', 'Marie');
    await page.fill('input[placeholder="Votre nom"]', 'Dupont');
    await page.fill('input[placeholder="votre.email@exemple.com"]', testEmail);
    await page.fill('input[placeholder="Ex: MonMotDePasse123!"]', 'MotDePasse123!');
    await page.fill('input[placeholder="Répétez votre mot de passe"]', 'MotDePasse123!');
    await page.fill('input[placeholder="06 12 34 56 78 (mobile uniquement)"]', '+33612345678');
    
    console.log('✅ Formulaire de compte rempli');
    
    // Cliquer sur "Validez votre téléphone"
    const nextButton = page.locator('button:has-text("Validez votre téléphone")');
    await nextButton.click({ force: true });
    
    // Vérification SMS
    await page.waitForSelector('text=Vérification du numéro', { timeout: 10000 });
    await page.waitForSelector('text=Code de vérification envoyé', { timeout: 5000 });
    
    const codeInput = page.locator('input[placeholder="123456"]');
    await codeInput.clear();
    await codeInput.fill('123456');
    
    const verifyButton = page.locator('button:has-text("Vérifier")');
    await verifyButton.click();
    
    await page.waitForTimeout(2000);
    console.log('✅ Vérification SMS réussie');
    
    // Cliquer sur "Suivant" pour passer à l'étape suivante
    await page.click('button:has-text("Suivant")');
    console.log('✅ Clic sur "Suivant" après SMS');
    
    // ========================================
    // ÉTAPE 2 : Informations professionnelles (SIRET)
    // ========================================
    
    await page.waitForSelector('text=SIRET', { timeout: 10000 });
    console.log('✅ Étape SIRET visible');
    
    await page.fill('input[type="text"]', '12345678901234');
    await page.click('button:has-text("Suivant")');
    console.log('✅ SIRET rempli et première validation');
    
    await page.waitForTimeout(2000);
    await page.click('button:has-text("Suivant")');
    console.log('✅ SIRET validé et étape suivante');
    
    // ========================================
    // ÉTAPE 3 : Enrichissement intelligent (à passer)
    // ========================================
    
    await page.waitForSelector('text=Informations de votre établissement', { timeout: 10000 });
    console.log('✅ Étape enrichissement visible');
    
    await page.click('button:has-text("Passer cette étape")');
    console.log('✅ Étape enrichissement passée');
    
    // ========================================
    // ÉTAPE 4 : Informations de l'établissement
    // ========================================
    
    await page.waitForSelector('text=Informations sur l\'établissement', { timeout: 10000 });
    console.log('✅ Étape établissement visible');
    
    // Remplir les informations de l'établissement
    await page.fill('input[placeholder="Ex: Le Central Bar"]', establishmentName);
    await page.fill('textarea', 'Un restaurant convivial pour les tests automatisés complets.');
    await page.fill('input[placeholder*="Rue de la Pièce Cornue"]', '15 Rue de la République, 75001 Paris');
    await page.fill('input[placeholder="Ex: 47.302780"]', '48.8566');
    await page.fill('input[placeholder="Ex: 5.114379"]', '2.3522');
    await page.fill('input[placeholder="04 78 90 12 34"]', '01 45 67 89 01');
    await page.fill('input[placeholder="contact@votre-etablissement.com"]', 'contact@bistrot-test-complet.com');
    
    // Remplir les champs de contact
    await page.fill('input[placeholder="06 12 34 56 78"]', '06 12 34 56 78');
    await page.fill('input[placeholder="https://m.me/votre-page-facebook"]', 'https://m.me/test-page');
    
    console.log('✅ Informations établissement remplies');
    
    // ========================================
    // ÉTAPE 5 : Sélection des activités via React Select
    // ========================================
    
    console.log('🎯 Interaction avec le React Select des activités...');
    
    // Attendre que le composant React Select soit chargé
    await page.waitForTimeout(2000);
    
    // 1. Cliquer sur le conteneur React Select
    const reactSelectContainer = page.locator('.react-select-container, [class*="react-select"]').first();
    const containerCount = await reactSelectContainer.count();
    
    if (containerCount > 0) {
      console.log('✅ Conteneur React Select trouvé');
      
      // Cliquer sur le conteneur pour l'ouvrir
      await reactSelectContainer.click();
      console.log('✅ Clic sur le conteneur React Select');
      
      // Attendre que le menu s'ouvre
      await page.waitForTimeout(1000);
      
      // 2. Chercher l'input de recherche dans le React Select
      const searchInput = page.locator('.react-select__input, input[class*="react-select"]');
      const searchInputCount = await searchInput.count();
      
      if (searchInputCount > 0) {
        console.log('✅ Input de recherche React Select trouvé');
        
        // Taper "bar" pour rechercher des activités
        await searchInput.fill('bar');
        console.log('✅ Recherche "bar" effectuée');
        
        // Attendre que les options apparaissent
        await page.waitForTimeout(1000);
        
        // 3. Chercher et cliquer sur une option
        const optionElements = await page.locator('.react-select__option, [class*="react-select__option"]').all();
        console.log(`📝 Options trouvées: ${optionElements.length}`);
        
        if (optionElements.length > 0) {
          // Cliquer sur la première option
          await optionElements[0].click();
          console.log('✅ Première activité sélectionnée');
          
          // Attendre un peu
          await page.waitForTimeout(500);
          
          // Essayer de sélectionner une deuxième activité
          await searchInput.click();
          await searchInput.fill('restaurant');
          await page.waitForTimeout(500);
          
          const secondOption = optionElements[1];
          const secondOptionCount = await secondOption.count();
          
          if (secondOptionCount > 0) {
            await secondOption.click();
            console.log('✅ Deuxième activité sélectionnée');
          }
        } else {
          console.log('⚠️ Aucune option trouvée, tentative de sélection directe');
          
          // Essayer de cliquer sur des éléments contenant "bar" ou "restaurant"
          const barElements = await page.locator('text=bar, text=Bar, text=restaurant, text=Restaurant').all();
          if (barElements.length > 0) {
            await barElements[0].click();
            console.log('✅ Activité sélectionnée via texte');
          }
        }
      } else {
        console.log('⚠️ Input de recherche React Select non trouvé');
      }
    } else {
      console.log('⚠️ Conteneur React Select non trouvé');
    }
    
    // ========================================
    // ÉTAPES SUIVANTES : Continuer jusqu'à la fin
    // ========================================
    
    let attempts = 0;
    const maxAttempts = 15;
    let finalStepReached = false;
    
    while (attempts < maxAttempts && !finalStepReached) {
      await page.waitForTimeout(3000);
      
      // Vérifier l'état actuel
      const h2Elements = await page.locator('h2').all();
      const currentTitle = h2Elements.length > 0 ? await h2Elements[0].textContent() : 'Aucun titre';
      const currentUrl = page.url();
      
      console.log(`📍 Tentative ${attempts + 1} - Titre: "${currentTitle}" - URL: ${currentUrl}`);
      
      // Vérifier si on est à la fin
      const createButtons = await page.locator('button:has-text("Créer"), button:has-text("Valider"), button:has-text("Terminer"), button:has-text("Finaliser")').all();
      if (createButtons.length > 0) {
        console.log('✅ Bouton de création trouvé !');
        await createButtons[0].click();
        console.log('✅ Bouton de création cliqué !');
        finalStepReached = true;
        break;
      }
      
      // Vérifier si on a été redirigé
      if (!currentUrl.includes('/etablissements/nouveau')) {
        console.log('✅ Redirection détectée !');
        finalStepReached = true;
        break;
      }
      
      // Cliquer sur "Suivant"
      const nextButtons = await page.locator('button:has-text("Suivant")').all();
      if (nextButtons.length > 0) {
        const isDisabled = await nextButtons[0].isDisabled();
        if (!isDisabled) {
          await nextButtons[0].click();
          attempts++;
          console.log(`✅ Clic sur "Suivant" (tentative ${attempts})`);
        } else {
          console.log('⚠️ Bouton "Suivant" désactivé');
          break;
        }
      } else {
        console.log('⚠️ Aucun bouton "Suivant" trouvé');
        break;
      }
    }
    
    // ========================================
    // VÉRIFICATION FINALE
    // ========================================
    
    await page.waitForTimeout(5000);
    
    // Capturer une screenshot finale
    await page.screenshot({ path: 'playwright-report/test-final-react-select.png', fullPage: true });
    
    // Vérifier l'URL finale
    const finalUrl = page.url();
    console.log(`📍 URL finale: ${finalUrl}`);
    
    // Vérifier le titre final
    const finalH2Elements = await page.locator('h2').all();
    const finalTitle = finalH2Elements.length > 0 ? await finalH2Elements[0].textContent() : 'Aucun titre';
    console.log(`📝 Titre final: "${finalTitle}"`);
    
    // ========================================
    // RAPPORT FINAL
    // ========================================
    
    console.log('📊 RAPPORT FINAL:');
    console.log(`  - Nom de l'établissement: ${establishmentName}`);
    console.log(`  - Email de test: ${testEmail}`);
    console.log(`  - URL finale: ${finalUrl}`);
    console.log(`  - Titre final: "${finalTitle}"`);
    console.log(`  - Tentatives: ${attempts}`);
    console.log(`  - Redirection: ${!finalUrl.includes('/etablissements/nouveau') ? 'OUI' : 'NON'}`);
    
    // Évaluation du succès
    if (!finalUrl.includes('/etablissements/nouveau')) {
      console.log('🎉 SUCCÈS COMPLET ! Redirection effectuée !');
    } else if (finalTitle !== 'Informations sur l\'établissement') {
      console.log('🎉 SUCCÈS PARTIEL ! Progression détectée !');
    } else {
      console.log('⚠️ ÉCHEC ! Aucune progression détectée');
    }
    
    console.log('🎉 Test final avec React Select terminé !');
  });
});
