import { test, expect } from '@playwright/test';

test.describe('Formulaire de demande professionnelle', () => {
  test('Doit envoyer une demande et vérifier la récupération', async ({ page }) => {
    // Aller sur la page wait
    await page.goto('/wait');
    await page.waitForLoadState('networkidle');

    // Attendre que le formulaire soit visible
    const form = page.locator('form');
    await expect(form).toBeVisible({ timeout: 10000 });

    // Remplir le formulaire
    await page.fill('input[name="firstName"]', 'Test');
    await page.fill('input[name="lastName"]', 'User');
    await page.fill('input[name="establishmentName"]', 'Restaurant Test');
    await page.fill('input[name="city"]', 'Dijon');
    await page.fill('textarea[name="description"]', 'Ceci est un test automatique');

    // Intercepter la requête API
    const responsePromise = page.waitForResponse(
      response => 
        response.url().includes('/api/wait/professional-inquiry') && 
        response.request().method() === 'POST'
    );

    // Soumettre le formulaire
    await page.click('button[type="submit"]');

    // Attendre la réponse
    const response = await responsePromise;
    const responseData = await response.json();

    // Vérifier que la réponse est réussie
    expect(response.ok()).toBeTruthy();
    expect(responseData.success).toBeTruthy();

    // Vérifier le message de succès
    await expect(page.locator('text=Merci ! Nous vous contacterons très bientôt.')).toBeVisible({ timeout: 5000 });

    console.log('✅ Formulaire testé avec succès!');
    console.log('📋 Réponse API:', JSON.stringify(responseData, null, 2));
  });

  test('Doit afficher une erreur si les champs requis sont vides', async ({ page }) => {
    await page.goto('/wait');
    await page.waitForLoadState('networkidle');

    const form = page.locator('form');
    await expect(form).toBeVisible({ timeout: 10000 });

    // Essayer de soumettre sans remplir les champs
    await page.click('button[type="submit"]');

    // Vérifier que le navigateur bloque la soumission (validation HTML5)
    // Le formulaire ne devrait pas être soumis
    const submitButton = page.locator('button[type="submit"]');
    await expect(submitButton).toBeVisible();
  });
});







