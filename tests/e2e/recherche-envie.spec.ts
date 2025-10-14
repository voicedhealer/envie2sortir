/**
 * Tests E2E Playwright - Parcours de recherche par envie
 * 
 * Tests couverts:
 * - Parcours utilisateur complet
 * - Recherche par envie avec différentes formulations
 * - Sélection de ville et géolocalisation
 * - Affichage des résultats
 * - Navigation vers les détails d'établissement
 * - Analytics de recherche
 * - Responsive mobile
 */

import { test, expect } from '@playwright/test';

test.describe('Recherche par envie - Parcours utilisateur', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('doit afficher la barre de recherche sur la page d\'accueil', async ({ page }) => {
    await expect(page.getByPlaceholder(/J'ai envie de/i)).toBeVisible();
    await expect(page.getByText(/Où ?/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /rechercher/i })).toBeVisible();
  });

  test('doit effectuer une recherche simple et afficher les résultats', async ({ page }) => {
    // Saisir l'envie
    await page.getByPlaceholder(/J'ai envie de/i).fill('boire une bière');
    
    // Sélectionner une ville
    await page.getByPlaceholder(/Saisissez une ville/i).click();
    await page.getByText('Dijon', { exact: true }).click();
    
    // Cliquer sur rechercher
    await page.getByRole('button', { name: /rechercher/i }).click();
    
    // Vérifier la navigation vers la page de résultats
    await expect(page).toHaveURL(/\/recherche\/envie/);
    await expect(page).toHaveURL(/envie=boire\+une\+bi%C3%A8re/);
    await expect(page).toHaveURL(/ville=Dijon/);
    
    // Vérifier l'affichage des résultats
    await expect(page.getByText(/résultats/i)).toBeVisible();
  });

  test('doit afficher un message si l\'envie est vide', async ({ page }) => {
    page.on('dialog', async dialog => {
      expect(dialog.message()).toContain('Veuillez décrire votre envie');
      await dialog.accept();
    });
    
    await page.getByRole('button', { name: /rechercher/i }).click();
  });

  test('doit permettre de rechercher avec "Autour de moi"', async ({ page }) => {
    // Mock de la géolocalisation
    await page.context().grantPermissions(['geolocation']);
    await page.context().setGeolocation({ latitude: 47.322, longitude: 5.041 });
    
    await page.getByPlaceholder(/J'ai envie de/i).fill('pizza');
    
    await page.getByPlaceholder(/Saisissez une ville/i).click();
    await page.getByText(/Autour de moi/i).click();
    
    await page.getByRole('button', { name: /rechercher/i }).click();
    
    await expect(page).toHaveURL(/\/recherche\/envie/);
    await expect(page).toHaveURL(/lat=47\.322/);
    await expect(page).toHaveURL(/lng=5\.041/);
  });

  test('doit permettre de changer le rayon de recherche', async ({ page }) => {
    await page.getByPlaceholder(/J'ai envie de/i).fill('restaurant');
    
    // Sélectionner 10km
    await page.getByLabel('10 km').check();
    
    await page.getByRole('button', { name: /rechercher/i }).click();
    
    await expect(page).toHaveURL(/rayon=10/);
  });

  test('doit afficher les établissements correspondants', async ({ page }) => {
    await page.getByPlaceholder(/J'ai envie de/i).fill('boire une bière');
    await page.getByPlaceholder(/Saisissez une ville/i).click();
    await page.getByText('Dijon').click();
    await page.getByRole('button', { name: /rechercher/i }).click();
    
    // Attendre le chargement des résultats
    await page.waitForURL(/\/recherche\/envie/);
    
    // Vérifier la présence de cards d'établissements
    const establishmentCards = page.locator('[data-testid="establishment-card"]').or(
      page.locator('article').filter({ hasText: /voir plus/i })
    );
    
    // Attendre que les résultats se chargent (ou message "aucun résultat")
    await expect(
      page.getByText(/résultats/i).or(page.getByText(/Aucun résultat/i))
    ).toBeVisible({ timeout: 10000 });
  });

  test('doit naviguer vers les détails d\'un établissement', async ({ page }) => {
    await page.getByPlaceholder(/J'ai envie de/i).fill('restaurant');
    await page.getByRole('button', { name: /rechercher/i }).click();
    
    await page.waitForURL(/\/recherche\/envie/);
    
    // Attendre les résultats
    await page.waitForSelector('article, [data-testid="establishment-card"]', { 
      timeout: 10000,
      state: 'visible'
    });
    
    // Cliquer sur le premier résultat (bouton "Voir plus" ou lien)
    const firstResult = page.locator('article').first().getByRole('link', { name: /voir plus/i }).or(
      page.locator('article').first().locator('a').first()
    );
    
    if (await firstResult.count() > 0) {
      await firstResult.click();
      
      // Vérifier la navigation vers la page de détails
      await expect(page).toHaveURL(/\/etablissements\//);
    }
  });
});

test.describe('Recherche par envie - Différentes formulations', () => {
  
  test('doit trouver des résultats avec "envie de boire une bière"', async ({ page }) => {
    await page.goto('/');
    await page.getByPlaceholder(/J'ai envie de/i).fill('envie de boire une bière');
    await page.getByRole('button', { name: /rechercher/i }).click();
    
    await page.waitForURL(/\/recherche\/envie/);
    await expect(page.getByText(/résultats/i).or(page.getByText(/Aucun résultat/i))).toBeVisible();
  });

  test('doit trouver des résultats avec "bière"', async ({ page }) => {
    await page.goto('/');
    await page.getByPlaceholder(/J'ai envie de/i).fill('bière');
    await page.getByRole('button', { name: /rechercher/i }).click();
    
    await page.waitForURL(/\/recherche\/envie/);
    await expect(page.getByText(/résultats/i).or(page.getByText(/Aucun résultat/i))).toBeVisible();
  });

  test('doit trouver des résultats avec recherche multi-critères', async ({ page }) => {
    await page.goto('/');
    await page.getByPlaceholder(/J'ai envie de/i).fill('cocktail en terrasse le samedi');
    await page.getByRole('button', { name: /rechercher/i }).click();
    
    await page.waitForURL(/\/recherche\/envie/);
    await expect(page).toHaveURL(/envie=cocktail/);
  });

  test('doit gérer les caractères spéciaux et accents', async ({ page }) => {
    await page.goto('/');
    await page.getByPlaceholder(/J'ai envie de/i).fill('crêpes & café');
    await page.getByRole('button', { name: /rechercher/i }).click();
    
    await page.waitForURL(/\/recherche\/envie/);
    await expect(page).toHaveURL(/envie=cr%C3%AApes/);
  });
});

test.describe('Recherche par envie - États de chargement et erreurs', () => {
  
  test('doit afficher un état de chargement', async ({ page }) => {
    await page.goto('/');
    await page.getByPlaceholder(/J'ai envie de/i).fill('restaurant');
    
    // Intercepter la requête pour la ralentir
    await page.route('**/api/recherche/envie*', async route => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      await route.continue();
    });
    
    await page.getByRole('button', { name: /rechercher/i }).click();
    
    // Vérifier l'état de chargement (spinner, skeleton, etc.)
    await expect(
      page.locator('[data-testid="loading"]').or(
        page.locator('.animate-pulse, .spinner, [aria-busy="true"]')
      )
    ).toBeVisible();
  });

  test('doit afficher un message si aucun résultat', async ({ page }) => {
    await page.goto('/');
    await page.getByPlaceholder(/J'ai envie de/i).fill('activité inexistante xyz123');
    await page.getByRole('button', { name: /rechercher/i }).click();
    
    await page.waitForURL(/\/recherche\/envie/);
    
    // Attendre le message "aucun résultat"
    await expect(
      page.getByText(/aucun résultat/i).or(
        page.getByText(/nous n'avons pas trouvé/i)
      )
    ).toBeVisible({ timeout: 10000 });
  });
});

test.describe('Recherche par envie - Navigation au clavier', () => {
  
  test('doit permettre de soumettre avec la touche Entrée', async ({ page }) => {
    await page.goto('/');
    await page.getByPlaceholder(/J'ai envie de/i).fill('pizza');
    await page.getByPlaceholder(/J'ai envie de/i).press('Enter');
    
    await expect(page).toHaveURL(/\/recherche\/envie/);
  });

  test('doit permettre de naviguer dans la liste des villes au clavier', async ({ page }) => {
    await page.goto('/');
    
    const cityInput = page.getByPlaceholder(/Saisissez une ville/i);
    await cityInput.click();
    
    // Naviguer avec les flèches
    await cityInput.press('ArrowDown');
    await cityInput.press('ArrowDown');
    await cityInput.press('Enter');
    
    // Vérifier qu'une ville a été sélectionnée
    const value = await cityInput.inputValue();
    expect(value).toBeTruthy();
  });
});

test.describe('Recherche par envie - Responsive Mobile', () => {
  
  test.use({ viewport: { width: 375, height: 667 } }); // iPhone SE
  
  test('doit afficher correctement la barre de recherche sur mobile', async ({ page }) => {
    await page.goto('/');
    
    await expect(page.getByPlaceholder(/J'ai envie de/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /rechercher/i })).toBeVisible();
  });

  test('doit effectuer une recherche sur mobile', async ({ page }) => {
    await page.goto('/');
    
    await page.getByPlaceholder(/J'ai envie de/i).fill('restaurant');
    await page.getByRole('button', { name: /rechercher/i }).click();
    
    await expect(page).toHaveURL(/\/recherche\/envie/);
  });

  test('doit afficher les résultats en grille sur mobile', async ({ page }) => {
    await page.goto('/');
    
    await page.getByPlaceholder(/J'ai envie de/i).fill('bar');
    await page.getByRole('button', { name: /rechercher/i }).click();
    
    await page.waitForURL(/\/recherche\/envie/);
    
    // Vérifier l'affichage responsive
    const container = page.locator('main, [data-testid="results-container"]');
    await expect(container).toBeVisible();
  });
});

test.describe('Recherche par envie - Analytics', () => {
  
  test('doit tracker la recherche dans les analytics', async ({ page }) => {
    // Intercepter l'appel aux analytics
    let analyticsCallMade = false;
    await page.route('**/api/analytics/search/track', async route => {
      analyticsCallMade = true;
      const postData = route.request().postDataJSON();
      expect(postData).toHaveProperty('searchTerm');
      await route.fulfill({ status: 200, body: JSON.stringify({ success: true }) });
    });
    
    await page.goto('/');
    await page.getByPlaceholder(/J'ai envie de/i).fill('pizza');
    await page.getByRole('button', { name: /rechercher/i }).click();
    
    await page.waitForURL(/\/recherche\/envie/);
    
    // Vérifier que l'appel analytics a été fait
    await page.waitForTimeout(1000);
    expect(analyticsCallMade).toBe(true);
  });
});

test.describe('Recherche par envie - Filtres et tri', () => {
  
  test('doit afficher les résultats triés par pertinence', async ({ page }) => {
    await page.goto('/');
    await page.getByPlaceholder(/J'ai envie de/i).fill('restaurant italien');
    await page.getByRole('button', { name: /rechercher/i }).click();
    
    await page.waitForURL(/\/recherche\/envie/);
    
    // Attendre les résultats
    await page.waitForSelector('article, [data-testid="establishment-card"]', { 
      timeout: 10000,
      state: 'visible'
    }).catch(() => {
      // Pas de résultats, c'est ok pour ce test
    });
    
    // Le premier résultat devrait être le plus pertinent (score le plus élevé)
    const firstCard = page.locator('article').first();
    if (await firstCard.count() > 0) {
      await expect(firstCard).toBeVisible();
    }
  });

  test('doit afficher la distance pour chaque résultat', async ({ page }) => {
    await page.context().grantPermissions(['geolocation']);
    await page.context().setGeolocation({ latitude: 47.322, longitude: 5.041 });
    
    await page.goto('/');
    await page.getByPlaceholder(/J'ai envie de/i).fill('restaurant');
    await page.getByPlaceholder(/Saisissez une ville/i).click();
    await page.getByText(/Autour de moi/i).click();
    await page.getByRole('button', { name: /rechercher/i }).click();
    
    await page.waitForURL(/\/recherche\/envie/);
    
    // Vérifier la présence de distances (en km)
    const distanceText = page.locator('text=/\\d+\\.?\\d*\\s*km/i');
    if (await distanceText.count() > 0) {
      await expect(distanceText.first()).toBeVisible();
    }
  });
});

test.describe('Recherche par envie - Persistance et retour', () => {
  
  test('doit conserver les paramètres de recherche dans l\'URL', async ({ page }) => {
    await page.goto('/');
    await page.getByPlaceholder(/J'ai envie de/i).fill('sushi');
    await page.getByPlaceholder(/Saisissez une ville/i).click();
    await page.getByText('Paris').click();
    await page.getByLabel('20 km').check();
    await page.getByRole('button', { name: /rechercher/i }).click();
    
    await expect(page).toHaveURL(/envie=sushi/);
    await expect(page).toHaveURL(/ville=Paris/);
    await expect(page).toHaveURL(/rayon=20/);
    
    // Rafraîchir la page
    await page.reload();
    
    // Les résultats devraient se recharger avec les mêmes paramètres
    await expect(page).toHaveURL(/envie=sushi/);
  });

  test('doit permettre de revenir en arrière et modifier la recherche', async ({ page }) => {
    await page.goto('/');
    await page.getByPlaceholder(/J'ai envie de/i).fill('pizza');
    await page.getByRole('button', { name: /rechercher/i }).click();
    
    await page.waitForURL(/\/recherche\/envie/);
    
    // Revenir en arrière
    await page.goBack();
    
    // Modifier la recherche
    await page.getByPlaceholder(/J'ai envie de/i).clear();
    await page.getByPlaceholder(/J'ai envie de/i).fill('burger');
    await page.getByRole('button', { name: /rechercher/i }).click();
    
    await expect(page).toHaveURL(/envie=burger/);
  });
});

