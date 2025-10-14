import '@testing-library/jest-dom';

// Polyfill pour les Web APIs manquantes dans l'environnement Jest
if (typeof global.TextEncoder === 'undefined') {
    const { TextEncoder, TextDecoder } = require('util');
    global.TextEncoder = TextEncoder;
    global.TextDecoder = TextDecoder;
}
  
if (typeof Request === 'undefined') {
    global.Request = require('next/dist/server/web/spec-extension/request').Request;
}
  
if (typeof Response === 'undefined') {
    global.Response = require('next/dist/server/web/spec-extension/response').Response;
}
  
if (typeof Headers === 'undefined') {
    global.Headers = require('next/dist/server/web/spec-extension/headers').Headers;
}
  
if (typeof ReadableStream === 'undefined') {
    global.ReadableStream = require('next/dist/compiled/@edge-runtime/primitives/streams').ReadableStream;
}

// Configuration globale pour les tests Jest
const originalConsoleError = console.error;
beforeAll(() => {
  console.error = (...args) => {
    // Ignorer les avertissements React
    if (typeof args[0] === 'string' && /Warning: ReactDOM.render is no longer supported in React 18./.test(args[0])) {
      return;
    }
    // Ignorer les avertissements d'état non enveloppés
    if (typeof args[0] === 'string' && /Warning: An update to %s inside a test was not wrapped in act\(...\)/.test(args[0])) {
        return;
    }
    // Ignorer les avertissements de clés manquantes
    if (typeof args[0] === 'string' && /Warning: Each child in a list should have a unique "key" prop./.test(args[0])) {
        return;
    }
    originalConsoleError(...args);
  };
});

afterAll(() => {
  console.error = originalConsoleError;
});
