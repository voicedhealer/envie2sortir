import { test, expect } from '@playwright/test';

/**
 * Test final pour la vérification SMS
 */

test.describe('Test Final - Vérification SMS', () => {
  
  test('Compléter la vérification SMS avec succès', async ({ page }) => {
    console.log('🚀 Test final de vérification SMS...');
    
    // Aller sur la page
    await page.goto('/etablissements/nouveau');
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('input[placeholder="Votre prénom"]');
    
    console.log('✅ Page chargée');
    
    // Remplir le formulaire
    await page.fill('input[placeholder="Votre prénom"]', 'Marie');
    await page.fill('input[placeholder="Votre nom"]', 'Dupont');
    await page.fill('input[placeholder="votre.email@exemple.com"]', `test-final-${Date.now()}@example.com`);
    await page.fill('input[placeholder="Ex: MonMotDePasse123!"]', 'MotDePasse123!');
    await page.fill('input[placeholder="Répétez votre mot de passe"]', 'MotDePasse123!');
    await page.fill('input[placeholder="06 12 34 56 78 (mobile uniquement)"]', '+33612345678');
    
    console.log('✅ Formulaire rempli');
    
    // Cliquer sur le bouton avec force
    const nextButton = page.locator('button:has-text("Validez votre téléphone")');
    await nextButton.click({ force: true });
    
    console.log('✅ Clic forcé effectué');
    
    // Attendre que la modal s'ouvre
    await page.waitForSelector('text=Vérification du numéro', { timeout: 10000 });
    console.log('✅ Modal de vérification ouverte');
    
    // Attendre que le SMS soit envoyé
    await page.waitForSelector('text=Code de vérification envoyé', { timeout: 5000 });
    console.log('✅ SMS envoyé');
    
    // Tester les codes de vérification (commencer par 123456 qui est dans le placeholder)
    const verificationCodes = ['123456', '111111', '000000', '999999'];
    let success = false;
    
    for (const code of verificationCodes) {
      try {
        console.log(`🔐 Test du code: ${code}`);
        
        // Trouver le champ de code (celui avec le placeholder qui contient le code)
        const codeInput = page.locator('input[placeholder="123456"]');
        
        // Vérifier que le champ existe
        const inputCount = await codeInput.count();
        console.log(`🔍 Nombre de champs de code trouvés: ${inputCount}`);
        
        if (inputCount === 0) {
          console.log('❌ Aucun champ de code trouvé dans la modal');
          continue;
        }
        
        // Vider et remplir le champ
        await codeInput.clear();
        await codeInput.fill(code);
        
        // Vérifier que la valeur a été saisie
        const inputValue = await codeInput.inputValue();
        console.log(`📝 Code saisi: "${inputValue}" (attendu: "${code}")`);
        
        if (inputValue !== code) {
          console.log('❌ Le code n\'a pas été saisi correctement');
          continue;
        }
        
        // Attendre que le bouton "Vérifier" soit activé
        const verifyButton = page.locator('button:has-text("Vérifier")');
        
        // Attendre que le bouton ne soit plus désactivé
        await verifyButton.waitFor({ state: 'visible', timeout: 5000 });
        
        // Vérifier si le bouton est activé
        const isDisabled = await verifyButton.getAttribute('disabled');
        if (isDisabled === null) {
          console.log(`✅ Bouton "Vérifier" activé pour le code ${code}`);
          
          // Cliquer sur "Vérifier"
          await verifyButton.click();
          console.log(`🔍 Bouton "Vérifier" cliqué pour le code ${code}`);
          
          // Attendre un peu pour voir si ça fonctionne
          await page.waitForTimeout(3000);
          
          // Vérifier si la modal a disparu (succès)
          const modalVisible = await page.locator('text=Vérification du numéro').isVisible();
          if (!modalVisible) {
            console.log(`🎉 Code ${code} accepté ! Modal fermée.`);
            success = true;
            break;
          } else {
            console.log(`❌ Code ${code} refusé, modal toujours visible`);
          }
        } else {
          console.log(`⚠️ Bouton "Vérifier" toujours désactivé pour le code ${code}`);
        }
        
      } catch (error) {
        console.log(`❌ Erreur avec le code ${code}:`, error.message);
      }
    }
    
    if (success) {
      console.log('🎉 Vérification SMS réussie !');
      
      // Capturer une screenshot de succès
      await page.screenshot({ path: 'playwright-report/verification-sms-succes.png' });
      
      // Vérifier qu'on passe à l'étape suivante
      await page.waitForTimeout(2000);
      const step2Indicator = page.locator('text=SIRET, text=Professionnel, text=Étape 2');
      const isStep2Visible = await step2Indicator.isVisible();
      
      if (isStep2Visible) {
        console.log('✅ Transition vers l\'étape 2 réussie');
      } else {
        console.log('⚠️ Transition vers l\'étape 2 non détectée');
      }
      
    } else {
      console.log('❌ Aucun code de vérification n\'a fonctionné');
      await page.screenshot({ path: 'playwright-report/verification-sms-echec.png' });
      throw new Error('Échec de la vérification SMS');
    }
    
    console.log('🎉 Test final terminé !');
  });
});
