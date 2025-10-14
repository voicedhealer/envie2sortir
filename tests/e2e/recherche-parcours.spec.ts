import { test, expect } from '@playwright/test';

test.describe('Parcours de recherche par envie', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Attendre que la page soit complètement chargée
    await page.waitForLoadState('networkidle');
  });

  test('Doit afficher la barre de recherche sur la page d\'accueil', async ({ page }) => {
    // Vérifier que tous les éléments du formulaire de recherche sont visibles
    await expect(page.locator('form:has(button:has-text("Trouve-moi ça !"))')).toBeVisible();
    await expect(page.locator('button:has-text("Trouve-moi ça !")')).toBeVisible();
    await expect(page.locator('input[name="envie"]')).toBeVisible();
    await expect(page.locator('input[name="city"]')).toBeVisible();
    await expect(page.locator('select[aria-label="Sélectionner le rayon de recherche"]')).toBeVisible();
  });

  test('Doit effectuer une recherche simple par envie', async ({ page }) => {
    // Remplir le champ envie (cibler par name="envie")
    await page.fill('input[name="envie"]', 'pizza');
    
    // Cliquer sur le bouton de recherche
    await page.click('button:has-text("Trouve-moi ça !")');
    
    // Attendre la redirection vers la page de résultats
    await page.waitForURL('**/recherche/envie**');
    
    // Vérifier que nous sommes sur la page de résultats
    await expect(page).toHaveURL(/recherche\/envie/);
    
    // Vérifier que le paramètre envie est bien passé
    const url = page.url();
    expect(url).toContain('envie=pizza');
  });

  test('Doit afficher un message d\'erreur si l\'envie est vide', async ({ page }) => {
    // Créer un listener pour capturer le dialog
    page.on('dialog', async dialog => {
      expect(dialog.message()).toContain('Veuillez décrire votre envie');
      await dialog.accept();
    });
    
    // Essayer de soumettre sans remplir le champ
    await page.click('button:has-text("Trouve-moi ça !")');
    
    // On ne devrait PAS être redirigé
    await expect(page).toHaveURL('/');
  });

  test('Doit permettre de sélectionner une ville', async ({ page }) => {
    // Remplir le champ envie
    await page.fill('input[name="envie"]', 'bar');
    
    // Cliquer sur le champ ville pour ouvrir le dropdown
    await page.click('input[name="city"]');
    
    // Attendre que le dropdown s'affiche
    await expect(page.locator('button:has-text("Paris, France")')).toBeVisible();
    
    // Sélectionner Paris
    await page.click('button:has-text("Paris, France")');
    
    // Vérifier que la ville est sélectionnée
    const cityInput = page.locator('input[name="city"]');
    await expect(cityInput).toHaveValue('Paris, France');
    
    // Soumettre la recherche
    await page.click('button:has-text("Trouve-moi ça !")');
    
    // Vérifier que le paramètre ville est bien passé
    await page.waitForURL('**/recherche/envie**');
    const url = page.url();
    expect(url).toContain('ville=Paris');
  });

  test('Doit permettre d\'utiliser la géolocalisation', async ({ context, page }) => {
    // Accorder les permissions de géolocalisation
    await context.grantPermissions(['geolocation']);
    await context.setGeolocation({ latitude: 47.3220, longitude: 5.0415 });

    // Remplir le champ envie
    await page.fill('input[name="envie"]', 'billard');
    
    // Cliquer sur le champ ville
    await page.click('input[name="city"]');
    
    // Cliquer sur "Autour de moi"
    await page.click('button:has-text("Autour de moi")');
    
    // Vérifier que "Autour de moi" est sélectionné
    const cityInput = page.locator('input[name="city"]');
    await expect(cityInput).toHaveValue('Autour de moi');
    
    // Soumettre la recherche
    await page.click('button:has-text("Trouve-moi ça !")');
    
    // Vérifier que les coordonnées GPS sont bien passées
    await page.waitForURL('**/recherche/envie**');
    const url = page.url();
    expect(url).toContain('lat=47.322');
    expect(url).toContain('lng=5.0415');
  });

  test('Doit permettre de changer le rayon de recherche', async ({ page }) => {
    // Remplir le champ envie
    await page.fill('input[name="envie"]', 'bar');
    
    // Changer le rayon de recherche
    await page.selectOption('select[aria-label="Sélectionner le rayon de recherche"]', '10');
    
    // Soumettre la recherche
    await page.click('button:has-text("Trouve-moi ça !")');
    
    // Vérifier que le rayon est bien passé
    await page.waitForURL('**/recherche/envie**');
    const url = page.url();
    expect(url).toContain('rayon=10');
  });
});
