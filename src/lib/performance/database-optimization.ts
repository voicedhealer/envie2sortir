import { PrismaClient } from '@prisma/client';

// Extensions Prisma pour l'optimisation
export class DatabaseOptimizer {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  /**
   * Optimise les requêtes d'établissements avec pagination et filtres
   */
  async getOptimizedEstablishments(options: {
    page?: number;
    limit?: number;
    city?: string;
    category?: string;
    tags?: string[];
    sortBy?: 'name' | 'createdAt' | 'rating';
    sortOrder?: 'asc' | 'desc';
  } = {}) {
    const {
      page = 1,
      limit = 20,
      city,
      category,
      tags = [],
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = options;

    const offset = (page - 1) * limit;

    // Construction de la requête optimisée
    const where: any = {
      isActive: true
    };

    if (city) {
      where.city = {
        contains: city,
        mode: 'insensitive'
      };
    }

    if (category) {
      where.category = category;
    }

    if (tags.length > 0) {
      where.tags = {
        hasSome: tags
      };
    }

    const orderBy: any = {};
    orderBy[sortBy] = sortOrder;

    // Requête optimisée avec sélection des champs nécessaires
    const [establishments, total] = await Promise.all([
      this.prisma.establishment.findMany({
        where,
        select: {
          id: true,
          name: true,
          slug: true,
          description: true,
          city: true,
          category: true,
          tags: true,
          imageUrl: true,
          rating: true,
          createdAt: true,
          // Relations optimisées
          _count: {
            select: {
              events: true,
              reviews: true
            }
          }
        },
        orderBy,
        skip: offset,
        take: limit
      }),
      this.prisma.establishment.count({ where })
    ]);

    return {
      data: establishments,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page * limit < total,
        hasPrevPage: page > 1
      }
    };
  }

  /**
   * Optimise les requêtes de recherche avec index full-text
   */
  async searchEstablishmentsOptimized(query: string, options: {
    limit?: number;
    city?: string;
    category?: string;
  } = {}) {
    const { limit = 20, city, category } = options;

    const where: any = {
      AND: [
        {
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } },
            { tags: { has: query } }
          ]
        },
        { isActive: true }
      ]
    };

    if (city) {
      where.AND.push({ city: { contains: city, mode: 'insensitive' } });
    }

    if (category) {
      where.AND.push({ category });
    }

    return this.prisma.establishment.findMany({
      where,
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        city: true,
        category: true,
        tags: true,
        imageUrl: true,
        rating: true
      },
      take: limit,
      orderBy: {
        rating: 'desc'
      }
    });
  }

  /**
   * Optimise les requêtes d'établissements aléatoires
   */
  async getRandomEstablishmentsOptimized(count: number = 10, filters: {
    city?: string;
    category?: string;
  } = {}) {
    const { city, category } = filters;

    const where: any = {
      isActive: true
    };

    if (city) {
      where.city = { contains: city, mode: 'insensitive' };
    }

    if (category) {
      where.category = category;
    }

    // Utiliser une approche optimisée pour les résultats aléatoires
    const total = await this.prisma.establishment.count({ where });
    
    if (total === 0) {
      return [];
    }

    const randomOffset = Math.floor(Math.random() * Math.max(0, total - count));
    
    return this.prisma.establishment.findMany({
      where,
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        city: true,
        category: true,
        tags: true,
        imageUrl: true,
        rating: true
      },
      skip: randomOffset,
      take: count,
      orderBy: {
        rating: 'desc'
      }
    });
  }

  /**
   * Optimise les requêtes de catégories avec mise en cache
   */
  async getCategoriesOptimized() {
    return this.prisma.establishment.groupBy({
      by: ['category'],
      _count: {
        id: true
      },
      where: {
        isActive: true
      },
      orderBy: {
        _count: {
          id: 'desc'
        }
      }
    });
  }

  /**
   * Optimise les requêtes d'événements avec jointures
   */
  async getUpcomingEventsOptimized(options: {
    limit?: number;
    establishmentId?: string;
    city?: string;
  } = {}) {
    const { limit = 20, establishmentId, city } = options;

    const where: any = {
      startDate: {
        gte: new Date()
      },
      establishment: {
        isActive: true
      }
    };

    if (establishmentId) {
      where.establishmentId = establishmentId;
    }

    if (city) {
      where.establishment = {
        ...where.establishment,
        city: { contains: city, mode: 'insensitive' }
      };
    }

    return this.prisma.event.findMany({
      where,
      select: {
        id: true,
        title: true,
        description: true,
        startDate: true,
        endDate: true,
        price: true,
        establishment: {
          select: {
            id: true,
            name: true,
            slug: true,
            city: true,
            imageUrl: true
          }
        }
      },
      orderBy: {
        startDate: 'asc'
      },
      take: limit
    });
  }

  /**
   * Optimise les requêtes de statistiques
   */
  async getStatisticsOptimized() {
    const [
      totalEstablishments,
      totalEvents,
      totalUsers,
      categoriesStats,
      citiesStats
    ] = await Promise.all([
      this.prisma.establishment.count({
        where: { isActive: true }
      }),
      this.prisma.event.count({
        where: {
          startDate: { gte: new Date() }
        }
      }),
      this.prisma.user.count(),
      this.prisma.establishment.groupBy({
        by: ['category'],
        _count: { id: true },
        where: { isActive: true }
      }),
      this.prisma.establishment.groupBy({
        by: ['city'],
        _count: { id: true },
        where: { isActive: true },
        orderBy: { _count: { id: 'desc' } },
        take: 10
      })
    ]);

    return {
      totalEstablishments,
      totalEvents,
      totalUsers,
      topCategories: categoriesStats,
      topCities: citiesStats
    };
  }

  /**
   * Optimise les requêtes avec des index suggérés
   */
  static getSuggestedIndexes(): string[] {
    return [
      // Index pour les établissements
      'CREATE INDEX IF NOT EXISTS idx_establishment_active ON Establishment(isActive);',
      'CREATE INDEX IF NOT EXISTS idx_establishment_city ON Establishment(city);',
      'CREATE INDEX IF NOT EXISTS idx_establishment_category ON Establishment(category);',
      'CREATE INDEX IF NOT EXISTS idx_establishment_rating ON Establishment(rating DESC);',
      'CREATE INDEX IF NOT EXISTS idx_establishment_created ON Establishment(createdAt DESC);',
      
      // Index composite pour les recherches
      'CREATE INDEX IF NOT EXISTS idx_establishment_search ON Establishment(isActive, city, category);',
      'CREATE INDEX IF NOT EXISTS idx_establishment_name ON Establishment(name);',
      
      // Index pour les événements
      'CREATE INDEX IF NOT EXISTS idx_event_start_date ON Event(startDate);',
      'CREATE INDEX IF NOT EXISTS idx_event_establishment ON Event(establishmentId);',
      'CREATE INDEX IF NOT EXISTS idx_event_upcoming ON Event(startDate, establishmentId) WHERE startDate >= NOW();',
      
      // Index pour les utilisateurs
      'CREATE INDEX IF NOT EXISTS idx_user_email ON User(email);',
      'CREATE INDEX IF NOT EXISTS idx_user_created ON User(createdAt);',
      
      // Index pour les reviews
      'CREATE INDEX IF NOT EXISTS idx_review_establishment ON Review(establishmentId);',
      'CREATE INDEX IF NOT EXISTS idx_review_user ON Review(userId);',
      'CREATE INDEX IF NOT EXISTS idx_review_rating ON Review(rating);'
    ];
  }

  /**
   * Analyse les performances d'une requête
   */
  async analyzeQueryPerformance(query: string, params: any[] = []) {
    const startTime = Date.now();
    
    try {
      const result = await this.prisma.$queryRawUnsafe(query, ...params);
      const executionTime = Date.now() - startTime;
      
      return {
        success: true,
        executionTime,
        resultCount: Array.isArray(result) ? result.length : 1,
        performance: executionTime < 100 ? 'excellent' : 
                    executionTime < 500 ? 'good' : 
                    executionTime < 1000 ? 'acceptable' : 'slow'
      };
    } catch (error) {
      const executionTime = Date.now() - startTime;
      
      return {
        success: false,
        executionTime,
        error: error.message
      };
    }
  }

  /**
   * Nettoie les données obsolètes
   */
  async cleanupOldData() {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [
      deletedEvents,
      deletedReviews,
      deletedUsers
    ] = await Promise.all([
      // Supprimer les événements passés de plus de 30 jours
      this.prisma.event.deleteMany({
        where: {
          endDate: { lt: thirtyDaysAgo }
        }
      }),
      
      // Supprimer les reviews de comptes supprimés
      this.prisma.review.deleteMany({
        where: {
          user: null
        }
      }),
      
      // Supprimer les utilisateurs inactifs de plus de 30 jours
      this.prisma.user.deleteMany({
        where: {
          AND: [
            { lastLoginAt: { lt: thirtyDaysAgo } },
            { createdAt: { lt: thirtyDaysAgo } }
          ]
        }
      })
    ]);

    return {
      deletedEvents: deletedEvents.count,
      deletedReviews: deletedReviews.count,
      deletedUsers: deletedUsers.count
    };
  }
}

// Fonction utilitaire pour créer une instance optimisée
export function createOptimizedPrismaClient(): DatabaseOptimizer {
  const prisma = new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    datasources: {
      db: {
        url: process.env.DATABASE_URL
      }
    }
  });

  return new DatabaseOptimizer(prisma);
}
