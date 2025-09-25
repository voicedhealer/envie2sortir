import { DatabaseOptimizer, createOptimizedPrismaClient } from '../../src/lib/performance/database-optimization';
import { PrismaClient } from '@prisma/client';

// Mock PrismaClient
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    establishment: {
      findMany: jest.fn(),
      count: jest.fn(),
      groupBy: jest.fn(),
      deleteMany: jest.fn()
    },
    event: {
      findMany: jest.fn(),
      count: jest.fn(),
      deleteMany: jest.fn()
    },
    user: {
      count: jest.fn(),
      deleteMany: jest.fn()
    },
    review: {
      deleteMany: jest.fn()
    },
    $queryRawUnsafe: jest.fn(),
    $disconnect: jest.fn()
  }))
}));

describe('Database Optimization', () => {
  let optimizer: DatabaseOptimizer;
  let mockPrisma: jest.Mocked<PrismaClient>;

  beforeEach(() => {
    mockPrisma = new PrismaClient() as jest.Mocked<PrismaClient>;
    optimizer = new DatabaseOptimizer(mockPrisma);
  });

  describe('Optimized Establishments Query', () => {
    test('should query establishments with basic filters', async () => {
      const mockData = [
        { id: '1', name: 'Test Establishment', city: 'Paris' }
      ];
      
      mockPrisma.establishment.findMany.mockResolvedValue(mockData);
      mockPrisma.establishment.count.mockResolvedValue(1);

      const result = await optimizer.getOptimizedEstablishments({
        page: 1,
        limit: 10
      });

      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('pagination');
      expect(result.data).toEqual(mockData);
      expect(result.pagination.page).toBe(1);
      expect(result.pagination.limit).toBe(10);
    });

    test('should apply city filter', async () => {
      mockPrisma.establishment.findMany.mockResolvedValue([]);
      mockPrisma.establishment.count.mockResolvedValue(0);

      await optimizer.getOptimizedEstablishments({
        city: 'Paris'
      });

      expect(mockPrisma.establishment.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            city: expect.objectContaining({
              contains: 'Paris',
              mode: 'insensitive'
            })
          })
        })
      );
    });

    test('should apply category filter', async () => {
      mockPrisma.establishment.findMany.mockResolvedValue([]);
      mockPrisma.establishment.count.mockResolvedValue(0);

      await optimizer.getOptimizedEstablishments({
        category: 'restaurant'
      });

      expect(mockPrisma.establishment.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            category: 'restaurant'
          })
        })
      );
    });

    test('should apply tags filter', async () => {
      mockPrisma.establishment.findMany.mockResolvedValue([]);
      mockPrisma.establishment.count.mockResolvedValue(0);

      await optimizer.getOptimizedEstablishments({
        tags: ['tag1', 'tag2']
      });

      expect(mockPrisma.establishment.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            tags: expect.objectContaining({
              hasSome: ['tag1', 'tag2']
            })
          })
        })
      );
    });
  });

  describe('Search Optimization', () => {
    test('should search establishments with query', async () => {
      const mockResults = [
        { id: '1', name: 'Test Restaurant' }
      ];
      
      mockPrisma.establishment.findMany.mockResolvedValue(mockResults);

      const result = await optimizer.searchEstablishmentsOptimized('restaurant');

      expect(result).toEqual(mockResults);
      expect(mockPrisma.establishment.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            AND: expect.arrayContaining([
              expect.objectContaining({
                OR: expect.arrayContaining([
                  expect.objectContaining({
                    name: expect.objectContaining({
                      contains: 'restaurant',
                      mode: 'insensitive'
                    })
                  })
                ])
              })
            ])
          })
        })
      );
    });
  });

  describe('Random Establishments', () => {
    test('should get random establishments', async () => {
      const mockData = [
        { id: '1', name: 'Random Establishment' }
      ];
      
      mockPrisma.establishment.count.mockResolvedValue(50);
      mockPrisma.establishment.findMany.mockResolvedValue(mockData);

      const result = await optimizer.getRandomEstablishmentsOptimized(5);

      expect(result).toEqual(mockData);
      expect(mockPrisma.establishment.count).toHaveBeenCalled();
      expect(mockPrisma.establishment.findMany).toHaveBeenCalled();
    });

    test('should handle empty results', async () => {
      mockPrisma.establishment.count.mockResolvedValue(0);

      const result = await optimizer.getRandomEstablishmentsOptimized(5);

      expect(result).toEqual([]);
      expect(mockPrisma.establishment.findMany).not.toHaveBeenCalled();
    });
  });

  describe('Categories Optimization', () => {
    test('should get categories with counts', async () => {
      const mockCategories = [
        { category: 'restaurant', _count: { id: 10 } },
        { category: 'bar', _count: { id: 5 } }
      ];
      
      mockPrisma.establishment.groupBy.mockResolvedValue(mockCategories);

      const result = await optimizer.getCategoriesOptimized();

      expect(result).toEqual(mockCategories);
      expect(mockPrisma.establishment.groupBy).toHaveBeenCalledWith(
        expect.objectContaining({
          by: ['category'],
          _count: { id: true },
          where: { isActive: true }
        })
      );
    });
  });

  describe('Events Optimization', () => {
    test('should get upcoming events', async () => {
      const mockEvents = [
        {
          id: '1',
          title: 'Test Event',
          startDate: new Date(),
          establishment: { id: '1', name: 'Test Establishment' }
        }
      ];
      
      mockPrisma.event.findMany.mockResolvedValue(mockEvents);

      const result = await optimizer.getUpcomingEventsOptimized();

      expect(result).toEqual(mockEvents);
      expect(mockPrisma.event.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            startDate: expect.objectContaining({
              gte: expect.any(Date)
            })
          })
        })
      );
    });
  });

  describe('Statistics Optimization', () => {
    test('should get optimized statistics', async () => {
      const mockStats = {
        totalEstablishments: 100,
        totalEvents: 50,
        totalUsers: 200,
        topCategories: [{ category: 'restaurant', _count: { id: 10 } }],
        topCities: [{ city: 'Paris', _count: { id: 20 } }]
      };

      // Mock all the parallel queries
      mockPrisma.establishment.count
        .mockResolvedValueOnce(100) // totalEstablishments
        .mockResolvedValueOnce(0); // cleanupOldData
      
      mockPrisma.event.count
        .mockResolvedValueOnce(50) // totalEvents
        .mockResolvedValueOnce(0); // cleanupOldData
      
      mockPrisma.user.count
        .mockResolvedValueOnce(200) // totalUsers
        .mockResolvedValueOnce(0); // cleanupOldData
      
      mockPrisma.establishment.groupBy
        .mockResolvedValueOnce([{ category: 'restaurant', _count: { id: 10 } }]) // categoriesStats
        .mockResolvedValueOnce([{ city: 'Paris', _count: { id: 20 } }]); // citiesStats

      const result = await optimizer.getStatisticsOptimized();

      expect(result.totalEstablishments).toBe(100);
      expect(result.totalEvents).toBe(50);
      expect(result.totalUsers).toBe(200);
      expect(result.topCategories).toHaveLength(1);
      expect(result.topCities).toHaveLength(1);
    });
  });

  describe('Query Performance Analysis', () => {
    test('should analyze query performance', async () => {
      mockPrisma.$queryRawUnsafe.mockResolvedValue([{ id: 1, name: 'test' }]);

      const result = await optimizer.analyzeQueryPerformance(
        'SELECT * FROM establishments LIMIT 1'
      );

      expect(result).toHaveProperty('success', true);
      expect(result).toHaveProperty('executionTime');
      expect(result).toHaveProperty('resultCount', 1);
      expect(result).toHaveProperty('performance');
    });

    test('should handle query errors', async () => {
      mockPrisma.$queryRawUnsafe.mockRejectedValue(new Error('Query failed'));

      const result = await optimizer.analyzeQueryPerformance(
        'INVALID SQL'
      );

      expect(result).toHaveProperty('success', false);
      expect(result).toHaveProperty('error', 'Query failed');
    });
  });

  describe('Data Cleanup', () => {
    test('should cleanup old data', async () => {
      mockPrisma.event.deleteMany.mockResolvedValue({ count: 5 });
      mockPrisma.review.deleteMany.mockResolvedValue({ count: 2 });
      mockPrisma.user.deleteMany.mockResolvedValue({ count: 1 });

      const result = await optimizer.cleanupOldData();

      expect(result).toEqual({
        deletedEvents: 5,
        deletedReviews: 2,
        deletedUsers: 1
      });
    });
  });

  describe('Suggested Indexes', () => {
    test('should provide suggested indexes', () => {
      const indexes = DatabaseOptimizer.getSuggestedIndexes();

      expect(indexes).toHaveLength(15); // Should have 15 suggested indexes
      expect(indexes[0]).toContain('CREATE INDEX');
      expect(indexes.some(index => index.includes('establishment'))).toBe(true);
      expect(indexes.some(index => index.includes('event'))).toBe(true);
      expect(indexes.some(index => index.includes('user'))).toBe(true);
    });
  });

  describe('Optimized Prisma Client', () => {
    test('should create optimized client', () => {
      const client = createOptimizedPrismaClient();
      
      expect(client).toBeInstanceOf(DatabaseOptimizer);
    });
  });
});
