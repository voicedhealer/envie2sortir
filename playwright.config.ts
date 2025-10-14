import { defineConfig, devices } from '@playwright/test';

/**
 * Configuration Playwright pour les tests E2E
 * Documentation: https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  // Dossier où se trouvent les tests
  testDir: './tests/e2e',
  
  // Fichier de setup global
  globalSetup: require.resolve('./tests/e2e/global-setup.ts'),

  // Durée maximale d'un test (30 secondes)
  timeout: 30 * 1000,
  
  // Nombre de tentatives si un test échoue
  retries: 2,
  
  // Nombre de tests en parallèle
  workers: 1, // 1 seul worker pour éviter les conflits de base de données
  
  // Reporter : affichage des résultats
  reporter: [
    ['html', { outputFolder: 'playwright-report' }], // Rapport HTML
    ['list'], // Liste dans le terminal
  ],
  
  // Options par défaut pour tous les tests
  use: {
    // URL de base de votre application
    baseURL: 'http://localhost:3001',
    
    // Capturer une trace en cas d'échec
    trace: 'on-first-retry',
    
    // Capturer une capture d'écran en cas d'échec
    screenshot: 'only-on-failure',
    
    // Capturer une vidéo en cas d'échec
    video: 'retain-on-failure',
  },

  // Configuration des navigateurs de test
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    
    // Décommentez pour tester sur mobile
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
  ],

  // Lancer le serveur de développement avant les tests
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3001',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});

