import { apiRateLimit, searchRateLimit } from '../../src/lib/security/rate-limit-extended';

describe('Rate Limiting', () => {
  test('API rate limit should work', async () => {
    const request = new Request('http://localhost:3000/api/test');
    const result = await apiRateLimit(request);
    expect(result.success).toBe(true);
  });

  test('Search rate limit should work', async () => {
    const request = new Request('http://localhost:3000/api/search');
    const result = await searchRateLimit(request);
    expect(result.success).toBe(true);
  });
});
