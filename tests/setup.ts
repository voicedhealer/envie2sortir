// Configuration globale pour les tests Jest

// Mock des modules Node.js si nécessaire
if (typeof global.TextEncoder === 'undefined') {
  const { TextEncoder, TextDecoder } = require('util');
  global.TextEncoder = TextEncoder;
  global.TextDecoder = TextDecoder;
}

// Configuration des timeouts
jest.setTimeout(10000);

// Suppression des warnings console pendant les tests
const originalConsoleWarn = console.warn;
const originalConsoleError = console.error;

beforeAll(() => {
  console.warn = (...args: any[]) => {
    // Ignorer les warnings spécifiques pendant les tests
    if (args[0]?.includes?.('DeprecationWarning')) return;
    originalConsoleWarn(...args);
  };
  
  console.error = (...args: any[]) => {
    // Ignorer les erreurs spécifiques pendant les tests
    if (args[0]?.includes?.('ExperimentalWarning')) return;
    originalConsoleError(...args);
  };
});

afterAll(() => {
  console.warn = originalConsoleWarn;
  console.error = originalConsoleError;
});
