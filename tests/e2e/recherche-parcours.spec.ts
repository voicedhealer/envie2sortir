import { test, expect } from '@playwright/test';

test.describe('Parcours de recherche par envie', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('Recherche simple et vérification des résultats', async ({ page }) => {
    await page.fill('input[placeholder="Bar à bière, billard, fléchettes..."]', 'pizza');
    await page.click('button:has-text("Rechercher")');
    await page.waitForURL('**/recherche/envie**');

    await expect(page.locator('h1')).toContainText('Résultats de recherche pour "pizza"');
    const results = await page.locator('.establishment-card').count();
    expect(results).toBeGreaterThan(0);
  });

  test('Recherche avec géolocalisation "Autour de moi"', async ({ context, page }) => {
    await context.grantPermissions(['geolocation']);
    await context.setGeolocation({ latitude: 47.3220, longitude: 5.0415 });

    await page.click('button:has-text("Autour de moi")');
    await page.click('button:has-text("Rechercher")');
    await page.waitForURL('**/recherche/envie**');

    await expect(page.locator('h1')).toContainText('Résultats de recherche');
    const results = await page.locator('.establishment-card').count();
    expect(results).toBeGreaterThan(0);
  });
  
  test('Changement de rayon et mise à jour des résultats', async ({ page }) => {
    await page.fill('input[placeholder="Bar à bière, billard, fléchettes..."]', 'bar');
    await page.click('button:has-text("Rechercher")');
    await page.waitForURL('**/recherche/envie**');
    
    const initialResults = await page.locator('.establishment-card').count();
    
    await page.click('label:has-text("50 km")');
    await page.click('button:has-text("Rechercher")');
    await page.waitForURL('**/recherche/envie**');

    const newResults = await page.locator('.establishment-card').count();
    expect(newResults).toBeGreaterThanOrEqual(initialResults);
  });

  test('Navigation vers la page détail d\'un établissement', async ({ page }) => {
    await page.fill('input[placeholder="Bar à bière, billard, fléchettes..."]', 'bar');
    await page.click('button:has-text("Rechercher")');
    await page.waitForURL('**/recherche/envie**');

    await page.locator('.establishment-card a').first().click();
    await page.waitForURL('**/etablissements/**');

    await expect(page.locator('h1.establishment-name')).toBeVisible();
  });
});
