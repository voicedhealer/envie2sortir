import { generateCSRFToken, validateCSRFToken } from '../../src/lib/security/csrf';

describe('CSRF Protection', () => {
  test('should generate and validate CSRF token', () => {
    const sessionId = 'test-session-123';
    const token = generateCSRFToken(sessionId);
    
    expect(token).toBeDefined();
    expect(token.length).toBe(64); // 32 bytes in hex = 64 chars
    expect(validateCSRFToken(sessionId, token)).toBe(true);
  });

  test('should reject invalid CSRF token', () => {
    const sessionId = 'test-session-123';
    const validToken = generateCSRFToken(sessionId);
    const invalidToken = 'invalid-token';
    
    expect(validateCSRFToken(sessionId, invalidToken)).toBe(false);
    expect(validateCSRFToken('different-session', validToken)).toBe(false);
  });
});
