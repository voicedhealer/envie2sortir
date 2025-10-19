/**
 * Configuration de test Jest
 */

// Ajouter les matchers de testing-library
import '@testing-library/jest-dom';

// Mock des modules Next.js
jest.mock('next/server', () => ({
  NextRequest: jest.fn(),
  NextResponse: {
    json: jest.fn((data, options) => ({
      json: () => Promise.resolve(data),
      status: options?.status || 200
    }))
  }
}));

// Mock de Prisma
jest.mock('../lib/prisma', () => ({
  prisma: {
    establishment: {
      findMany: jest.fn()
    }
  }
}));

// Mock des variables d'environnement
process.env.NODE_ENV = 'test';
