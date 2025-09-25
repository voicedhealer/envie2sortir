import { ResponseOptimizer, calculatePagination, getPaginationOffset } from '../../src/lib/performance/response-optimization';

// Mock NextResponse
jest.mock('next/server', () => ({
  NextResponse: jest.fn().mockImplementation((data) => ({
    headers: new Map(),
    status: 200,
    data
  }))
}));

// Mock zlib
jest.mock('zlib', () => ({
  gzip: jest.fn((data, options, callback) => {
    if (callback) {
      callback(null, Buffer.from('compressed-data'));
    }
    return Promise.resolve(Buffer.from('compressed-data'));
  }),
  brotliCompress: jest.fn((data, options, callback) => {
    if (callback) {
      callback(null, Buffer.from('brotli-data'));
    }
    return Promise.resolve(Buffer.from('brotli-data'));
  }),
  constants: {
    BROTLI_PARAM_QUALITY: 'quality'
  }
}));

describe('Response Optimization', () => {
  describe('Basic Response Optimization', () => {
    test('should optimize response with compression', async () => {
      const data = { message: 'test', items: Array(1000).fill('data') };
      
      const response = await ResponseOptimizer.optimizeResponse(data, {
        enableCompression: true
      });
      
      expect(response).toBeDefined();
      expect(response.headers).toBeDefined();
    });

    test('should optimize response without compression', async () => {
      const data = { message: 'test' };
      
      const response = await ResponseOptimizer.optimizeResponse(data, {
        enableCompression: false
      });
      
      expect(response).toBeDefined();
    });

    test('should add optimization headers', async () => {
      const data = { message: 'test' };
      
      const response = await ResponseOptimizer.optimizeResponse(data, {
        cacheControl: 'public, max-age=300',
        etag: '"test-etag"'
      });
      
      expect(response.headers).toBeDefined();
    });
  });

  describe('Paginated Response', () => {
    test('should create paginated response', async () => {
      const data = Array(20).fill({ id: 1, name: 'test' });
      const pagination = {
        page: 1,
        limit: 10,
        total: 100
      };
      
      const response = await ResponseOptimizer.createPaginatedResponse(
        data,
        pagination
      );
      
      expect(response).toBeDefined();
    });

    test('should handle pagination metadata correctly', async () => {
      const data = Array(5).fill({ id: 1, name: 'test' });
      const pagination = {
        page: 2,
        limit: 10,
        total: 25
      };
      
      const response = await ResponseOptimizer.createPaginatedResponse(
        data,
        pagination
      );
      
      expect(response).toBeDefined();
    });
  });

  describe('ETag Generation', () => {
    test('should generate consistent ETags', () => {
      const content = 'test content';
      const etag1 = ResponseOptimizer.generateETag(content);
      const etag2 = ResponseOptimizer.generateETag(content);
      
      expect(etag1).toBe(etag2);
      expect(etag1).toMatch(/^"[a-f0-9]+"$/);
    });

    test('should generate different ETags for different content', () => {
      const etag1 = ResponseOptimizer.generateETag('content 1');
      const etag2 = ResponseOptimizer.generateETag('content 2');
      
      expect(etag1).not.toBe(etag2);
    });
  });

  describe('Compression Support Detection', () => {
    test('should detect gzip support', () => {
      const request = new Request('http://localhost', {
        headers: { 'accept-encoding': 'gzip, deflate' }
      });
      
      expect(ResponseOptimizer.supportsCompression(request)).toBe(true);
    });

    test('should detect brotli support', () => {
      const request = new Request('http://localhost', {
        headers: { 'accept-encoding': 'br, gzip' }
      });
      
      expect(ResponseOptimizer.supportsCompression(request)).toBe(true);
    });

    test('should detect no compression support', () => {
      const request = new Request('http://localhost', {
        headers: { 'accept-encoding': 'identity' }
      });
      
      expect(ResponseOptimizer.supportsCompression(request)).toBe(false);
    });
  });

  describe('Cache Headers', () => {
    test('should generate public cache headers', () => {
      const headers = ResponseOptimizer.getCacheHeaders(3600, true);
      
      expect(headers['Cache-Control']).toContain('public');
      expect(headers['Cache-Control']).toContain('max-age=3600');
      expect(headers).toHaveProperty('Expires');
    });

    test('should generate private cache headers', () => {
      const headers = ResponseOptimizer.getCacheHeaders(600, false);
      
      expect(headers['Cache-Control']).toContain('private');
      expect(headers['Cache-Control']).toContain('max-age=600');
    });
  });
});

describe('Pagination Utilities', () => {
  describe('calculatePagination', () => {
    test('should calculate pagination correctly', () => {
      const result = calculatePagination(2, 10, 100);
      
      expect(result).toEqual({
        page: 2,
        limit: 10,
        total: 100
      });
    });

    test('should handle invalid page numbers', () => {
      const result = calculatePagination(-1, 10, 100);
      
      expect(result.page).toBe(1);
    });

    test('should handle invalid limit', () => {
      const result = calculatePagination(1, 150, 100); // Limit too high
      
      expect(result.limit).toBe(100); // Should be capped at 100
    });

    test('should handle negative total', () => {
      const result = calculatePagination(1, 10, -5);
      
      expect(result.total).toBe(0);
    });
  });

  describe('getPaginationOffset', () => {
    test('should calculate offset correctly', () => {
      expect(getPaginationOffset(1, 10)).toBe(0);
      expect(getPaginationOffset(2, 10)).toBe(10);
      expect(getPaginationOffset(3, 10)).toBe(20);
    });

    test('should handle invalid page numbers', () => {
      expect(getPaginationOffset(-1, 10)).toBe(0);
      expect(getPaginationOffset(0, 10)).toBe(0);
    });

    test('should handle invalid limit', () => {
      expect(getPaginationOffset(2, -5)).toBe(1);
    });
  });
});
