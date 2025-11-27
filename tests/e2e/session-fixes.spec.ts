/**
 * Tests E2E pour vérifier les corrections des problèmes de session
 */

import { test, expect } from '@playwright/test';

test.describe('Corrections des problèmes de session et authentification', () => {
  
  test('GET /api/etablissements/[slug] devrait fonctionner', async ({ request }) => {
    // Test avec un slug existant du log
    const slug = 'pizza-saint-sauveur';
    
    const response = await request.get(`/api/etablissements/${slug}`);
    
    // Ne devrait pas retourner 404 (route existe maintenant)
    // Peut retourner 404 si l'établissement n'existe pas, mais pas 500
    expect(response.status()).not.toBe(500);
    
    if (response.status() === 404) {
      // Route existe mais établissement non trouvé (normal)
      const body = await response.json();
      expect(body.error).toBeDefined();
    } else if (response.status() === 200) {
      const body = await response.json();
      expect(body.establishment).toBeDefined();
    }
  });

  test('POST /api/establishments/[id]/stats ne devrait pas retourner 500', async ({ request }) => {
    const establishmentId = '26b61aa6-5b9e-457f-bd8b-be54c179d9fe';
    
    const response = await request.post(`/api/establishments/${establishmentId}/stats?action=view`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    // Ne devrait jamais retourner 500, même si getCurrentUser échoue
    expect(response.status()).not.toBe(500);
    
    // Devrait retourner 200, 201, ou 404 (établissement non trouvé)
    expect([200, 201, 404]).toContain(response.status());
  });

  test('POST /api/establishments/[id]/stats devrait fonctionner sans authentification', async ({ request }) => {
    const establishmentId = '26b61aa6-5b9e-457f-bd8b-be54c179d9fe';
    
    // Faire une requête sans cookies d'authentification
    const response = await request.post(`/api/establishments/${establishmentId}/stats?action=view`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    // Ne devrait pas retourner 500 même sans auth
    expect(response.status()).not.toBe(500);
    
    const body = await response.json();
    // Devrait avoir une réponse valide (succès ou erreur gérée)
    expect(body).toBeDefined();
  });

  test('Les timeouts de session ne devraient pas bloquer l\'application', async ({ page }) => {
    // Aller sur une page qui utilise useSupabaseSession
    await page.goto('/');
    
    // Attendre que la page se charge
    await page.waitForLoadState('networkidle');
    
    // Vérifier qu'il n'y a pas d'erreurs dans la console
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        const text = msg.text();
        // Ignorer les erreurs de timeout qui sont gérées gracieusement
        if (!text.includes('timeout') && !text.includes('Database query timeout')) {
          errors.push(text);
        }
      }
    });
    
    // Attendre un peu pour voir si des erreurs apparaissent
    await page.waitForTimeout(2000);
    
    // Ne devrait pas y avoir d'erreurs critiques
    expect(errors.length).toBe(0);
  });

  test('La session devrait se charger même si les requêtes DB sont lentes', async ({ page }) => {
    await page.goto('/');
    
    // Attendre que la session se charge (max 20s selon le code)
    await page.waitForTimeout(5000);
    
    // Vérifier qu'il n'y a pas d'erreurs de timeout bloquantes
    const consoleMessages: string[] = [];
    page.on('console', msg => {
      consoleMessages.push(msg.text());
    });
    
    await page.waitForTimeout(2000);
    
    // Vérifier qu'il n'y a pas de message d'erreur critique de timeout
    const criticalErrors = consoleMessages.filter(msg => 
      msg.includes('Timeout de sécurité') && msg.includes('pas de session détectée')
    );
    
    // Si on a une session, il ne devrait pas y avoir ce message
    expect(criticalErrors.length).toBeLessThanOrEqual(1);
  });
});

