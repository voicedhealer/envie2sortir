import { ImageOptimizer, optimizeWithPreset, IMAGE_PRESETS } from '../../src/lib/performance/image-optimization';

// Mock sharp pour les tests
jest.mock('sharp', () => {
  const mockSharp = jest.fn(() => ({
    resize: jest.fn().mockReturnThis(),
    jpeg: jest.fn().mockReturnThis(),
    png: jest.fn().mockReturnThis(),
    webp: jest.fn().mockReturnThis(),
    avif: jest.fn().mockReturnThis(),
    toBuffer: jest.fn().mockResolvedValue(Buffer.from('optimized-image')),
    metadata: jest.fn().mockResolvedValue({
      width: 1920,
      height: 1080,
      format: 'jpeg'
    })
  }));

  return mockSharp;
});

describe('Image Optimization', () => {
  const mockImageBuffer = Buffer.from('mock-image-data');

  describe('Basic Optimization', () => {
    test('should optimize image with default options', async () => {
      const result = await ImageOptimizer.optimize(mockImageBuffer);
      
      expect(result).toEqual({
        buffer: Buffer.from('optimized-image'),
        format: 'webp',
        size: 15, // 'optimized-image'.length
        dimensions: {
          width: 1920,
          height: 1080
        }
      });
    });

    test('should optimize image with custom options', async () => {
      const options = {
        width: 800,
        height: 600,
        quality: 90,
        format: 'jpeg' as const
      };

      const result = await ImageOptimizer.optimize(mockImageBuffer, options);
      
      expect(result.format).toBe('jpeg');
    });

    test('should handle optimization errors', async () => {
      const sharp = require('sharp');
      sharp.mockImplementationOnce(() => {
        throw new Error('Sharp error');
      });

      await expect(
        ImageOptimizer.optimize(mockImageBuffer, { format: 'invalid' as any })
      ).rejects.toThrow('Erreur lors de l\'optimisation de l\'image');
    });
  });

  describe('Responsive Images', () => {
    test('should generate multiple image variants', async () => {
      const variants = await ImageOptimizer.generateResponsiveImages(mockImageBuffer);
      
      expect(variants).toHaveProperty('thumbnail');
      expect(variants).toHaveProperty('small');
      expect(variants).toHaveProperty('medium');
      expect(variants).toHaveProperty('large');
      expect(variants).toHaveProperty('xlarge');

      // Check that all variants have the expected structure
      Object.values(variants).forEach(variant => {
        expect(variant).toHaveProperty('buffer');
        expect(variant).toHaveProperty('format');
        expect(variant).toHaveProperty('size');
        expect(variant).toHaveProperty('dimensions');
      });
    });
  });

  describe('Web Optimization', () => {
    test('should optimize for web with webp and fallback', async () => {
      const result = await ImageOptimizer.optimizeForWeb(mockImageBuffer);
      
      expect(result).toHaveProperty('webp');
      expect(result).toHaveProperty('fallback');
      expect(result.webp.format).toBe('webp');
      expect(result.fallback.format).toBe('jpeg');
    });
  });

  describe('Optimization Validation', () => {
    test('should check if image is already optimized', async () => {
      const isOptimized = await ImageOptimizer.isOptimized(
        mockImageBuffer,
        'jpeg',
        1024 * 1024, // 1MB
        1920,
        1080
      );
      
      expect(typeof isOptimized).toBe('boolean');
    });
  });

  describe('Optimization Statistics', () => {
    test('should calculate optimization stats', async () => {
      const originalBuffer = Buffer.alloc(1000);
      const optimizedBuffer = Buffer.alloc(500);
      
      const stats = await ImageOptimizer.getOptimizationStats(originalBuffer, optimizedBuffer);
      
      expect(stats).toEqual({
        originalSize: 1000,
        optimizedSize: 500,
        compressionRatio: 0.5,
        spaceSaved: 500,
        spaceSavedPercent: 50
      });
    });
  });

  describe('Image Presets', () => {
    test('should have all required presets', () => {
      expect(IMAGE_PRESETS).toHaveProperty('profile');
      expect(IMAGE_PRESETS).toHaveProperty('establishment');
      expect(IMAGE_PRESETS).toHaveProperty('thumbnail');
      expect(IMAGE_PRESETS).toHaveProperty('event');
      expect(IMAGE_PRESETS).toHaveProperty('highQuality');
    });

    test('should optimize with preset', async () => {
      const result = await optimizeWithPreset(mockImageBuffer, 'profile');
      
      expect(result).toHaveProperty('buffer');
      expect(result).toHaveProperty('format');
      expect(result.format).toBe('webp');
    });
  });
});
