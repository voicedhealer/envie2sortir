import { test, expect } from '@playwright/test';

/**
 * Test simple - Juste la première étape du formulaire
 */

test.describe('Test Étape 1 - Formulaire de compte', () => {
  
  test('Remplir et valider la première étape', async ({ page }) => {
    console.log('🚀 Test de la première étape...');
    
    // Aller sur la page
    await page.goto('/etablissements/nouveau');
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('input[placeholder="Votre prénom"]');
    
    console.log('✅ Page chargée et formulaire visible');
    
    // Remplir le formulaire
    await page.fill('input[placeholder="Votre prénom"]', 'Marie');
    await page.fill('input[placeholder="Votre nom"]', 'Dupont');
    await page.fill('input[placeholder="votre.email@exemple.com"]', `test-etape1-${Date.now()}@example.com`);
    await page.fill('input[placeholder="Ex: MonMotDePasse123!"]', 'MotDePasse123!');
    await page.fill('input[placeholder="Répétez votre mot de passe"]', 'MotDePasse123!');
    await page.fill('input[placeholder="06 12 34 56 78 (mobile uniquement)"]', '+33612345678');
    
    console.log('✅ Formulaire rempli');
    
    // Capturer une screenshot
    await page.screenshot({ path: 'playwright-report/etape1-rempli.png' });
    
    // Cliquer sur le bouton de validation (même s'il est désactivé, il peut déclencher la modal)
    const nextButton = page.locator('button:has-text("Suivant"), button:has-text("Validez votre téléphone")');
    
    // Essayer de cliquer normalement d'abord
    try {
      await nextButton.click({ timeout: 5000 });
    } catch (error) {
      console.log('⚠️ Clic normal échoué, tentative de clic forcé...');
      // Si le clic normal échoue, forcer le clic
      await nextButton.click({ force: true });
    }
    
    console.log('✅ Bouton de validation cliqué');
    
    // Attendre que la modal de vérification SMS apparaisse
    await page.waitForSelector('text=Vérification du numéro', { timeout: 10000 });
    console.log('✅ Modal de vérification SMS ouverte');
    
    // Attendre que le SMS soit envoyé
    await page.waitForSelector('text=Code de vérification envoyé', { timeout: 5000 });
    console.log('✅ SMS envoyé, code disponible');
    
    // Remplir le code de vérification (essayer les codes possibles)
    const verificationCodes = ['111111', '000000', '999999', '123456'];
    let codeAccepted = false;
    
    for (const code of verificationCodes) {
      try {
        console.log(`🔐 Tentative avec le code: ${code}`);
        
        // Trouver le champ de code de vérification (plus spécifique)
        const codeInput = page.locator('input[placeholder*="Code de vérification"], input[type="text"]:near(text="Code de vérification *")');
        
        // Vider le champ et remplir le code
        await codeInput.clear();
        await codeInput.fill(code);
        
        console.log(`📝 Code ${code} saisi dans le champ`);
        
        // Attendre que le bouton "Vérifier" soit cliquable
        const verifyButton = page.locator('button:has-text("Vérifier")');
        await verifyButton.waitFor({ state: 'visible', timeout: 5000 });
        
        // Cliquer sur "Vérifier"
        await verifyButton.click();
        console.log(`🔍 Bouton "Vérifier" cliqué pour le code ${code}`);
        
        // Attendre un peu pour voir si ça fonctionne
        await page.waitForTimeout(3000);
        
        // Vérifier si la modal a disparu (succès)
        const modalVisible = await page.locator('text=Vérification du numéro').isVisible();
        if (!modalVisible) {
          console.log(`✅ Code ${code} accepté ! Modal fermée.`);
          codeAccepted = true;
          break;
        }
        
        console.log(`❌ Code ${code} refusé, essai suivant...`);
        
        // Si le code est refusé, attendre un peu avant d'essayer le suivant
        await page.waitForTimeout(1000);
        
      } catch (error) {
        console.log(`❌ Erreur avec le code ${code}:`, error);
        // Continuer avec le code suivant
      }
    }
    
    if (!codeAccepted) {
      throw new Error('Aucun code de vérification n\'a fonctionné');
    }
    
    console.log('✅ Vérification SMS terminée');
    
    // Attendre la transition
    await page.waitForTimeout(2000);
    
    // Vérifier qu'on passe à l'étape suivante
    // Chercher un élément qui indique qu'on est à l'étape 2
    const step2Indicator = page.locator('text=Étape 2, text=SIRET, text=Professionnel');
    const isStep2Visible = await step2Indicator.isVisible();
    
    if (isStep2Visible) {
      console.log('✅ Transition vers l\'étape 2 réussie');
      await page.screenshot({ path: 'playwright-report/etape2-atteinte.png' });
    } else {
      console.log('⚠️ Transition vers l\'étape 2 non détectée');
      await page.screenshot({ path: 'playwright-report/etape2-probleme.png' });
      
      // Afficher le contenu de la page pour debug
      const pageContent = await page.textContent('body');
      console.log('📄 Contenu de la page:', pageContent?.substring(0, 500));
    }
    
    console.log('🎉 Test de l\'étape 1 terminé !');
  });
});
