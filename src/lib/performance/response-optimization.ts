import { NextResponse } from 'next/server';
import { gzip, brotliCompress } from 'zlib';
import { promisify } from 'util';

const gzipAsync = promisify(gzip);
const brotliAsync = promisify(brotliCompress);

interface CompressionOptions {
  level?: number;
  threshold?: number; // Taille minimale pour compresser
}

interface PaginationOptions {
  page: number;
  limit: number;
  total: number;
}

interface OptimizedResponseOptions {
  enableCompression?: boolean;
  compressionOptions?: CompressionOptions;
  enablePagination?: boolean;
  cacheControl?: string;
  etag?: string;
}

export class ResponseOptimizer {
  private static readonly DEFAULT_COMPRESSION_OPTIONS: Required<CompressionOptions> = {
    level: 6,
    threshold: 1024 // 1KB minimum
  };

  /**
   * Optimise une réponse JSON avec compression et autres optimisations
   */
  static async optimizeResponse<T>(
    data: T,
    options: OptimizedResponseOptions = {}
  ): Promise<NextResponse> {
    const {
      enableCompression = true,
      compressionOptions = {},
      enablePagination = false,
      cacheControl = 'public, max-age=300', // 5 minutes par défaut
      etag
    } = options;

    // Sérialiser les données
    const jsonString = JSON.stringify(data);
    const originalSize = Buffer.byteLength(jsonString, 'utf8');

    let response: NextResponse;
    let compressedData: Buffer | null = null;

    // Compression si activée et taille suffisante
    if (enableCompression && originalSize >= (compressionOptions.threshold || this.DEFAULT_COMPRESSION_OPTIONS.threshold)) {
      try {
        compressedData = await this.compressData(jsonString, compressionOptions);
      } catch (error) {
        console.warn('Compression failed, using uncompressed response:', error);
      }
    }

    // Créer la réponse
    if (compressedData && compressedData.length < originalSize) {
      response = new NextResponse(compressedData);
      response.headers.set('Content-Encoding', 'gzip');
      response.headers.set('Content-Type', 'application/json');
    } else {
      response = NextResponse.json(data);
    }

    // Ajouter les headers d'optimisation
    this.addOptimizationHeaders(response, {
      originalSize,
      compressedSize: compressedData?.length || originalSize,
      cacheControl,
      etag
    });

    return response;
  }

  /**
   * Crée une réponse paginée optimisée
   */
  static async createPaginatedResponse<T>(
    data: T[],
    pagination: PaginationOptions,
    options: OptimizedResponseOptions = {}
  ): Promise<NextResponse> {
    const { page, limit, total } = pagination;
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    const paginatedData = {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage,
        hasPrevPage,
        nextPage: hasNextPage ? page + 1 : null,
        prevPage: hasPrevPage ? page - 1 : null
      }
    };

    return this.optimizeResponse(paginatedData, {
      ...options,
      enablePagination: true
    });
  }

  /**
   * Compresse les données avec gzip ou brotli
   */
  private static async compressData(
    data: string,
    options: CompressionOptions = {}
  ): Promise<Buffer> {
    const opts = { ...this.DEFAULT_COMPRESSION_OPTIONS, ...options };
    
    try {
      // Essayer brotli en premier (meilleure compression)
      const brotliData = await brotliAsync(Buffer.from(data, 'utf8'), {
        params: {
          [require('zlib').constants.BROTLI_PARAM_QUALITY]: opts.level
        }
      });
      
      // Si brotli est plus efficace, l'utiliser
      if (brotliData.length < data.length * 0.9) {
        return brotliData;
      }
    } catch (error) {
      // Fallback sur gzip si brotli échoue
    }

    // Utiliser gzip comme fallback
    return gzipAsync(data, { level: opts.level });
  }

  /**
   * Ajoute les headers d'optimisation à la réponse
   */
  private static addOptimizationHeaders(
    response: NextResponse,
    stats: {
      originalSize: number;
      compressedSize: number;
      cacheControl: string;
      etag?: string;
    }
  ): void {
    // Cache Control
    response.headers.set('Cache-Control', stats.cacheControl);

    // ETag pour la validation de cache
    if (stats.etag) {
      response.headers.set('ETag', stats.etag);
    } else {
      // Générer un ETag basé sur le contenu
      const etag = `"${Buffer.from(stats.compressedSize.toString()).toString('base64')}"`;
      response.headers.set('ETag', etag);
    }

    // Headers de compression
    if (stats.compressedSize < stats.originalSize) {
      response.headers.set('X-Original-Size', stats.originalSize.toString());
      response.headers.set('X-Compressed-Size', stats.compressedSize.toString());
      response.headers.set('X-Compression-Ratio', 
        (stats.compressedSize / stats.originalSize).toFixed(2)
      );
    }

    // Headers de sécurité et performance
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('Vary', 'Accept-Encoding');
  }

  /**
   * Génère un ETag basé sur le contenu
   */
  static generateETag(content: string): string {
    const crypto = require('crypto');
    const hash = crypto.createHash('md5').update(content).digest('hex');
    return `"${hash}"`;
  }

  /**
   * Vérifie si la requête supporte la compression
   */
  static supportsCompression(request: Request): boolean {
    const acceptEncoding = request.headers.get('accept-encoding') || '';
    return acceptEncoding.includes('gzip') || acceptEncoding.includes('br');
  }

  /**
   * Optimise les headers de la requête pour la mise en cache
   */
  static getCacheHeaders(
    ttl: number = 300,
    isPublic: boolean = true
  ): Record<string, string> {
    const visibility = isPublic ? 'public' : 'private';
    return {
      'Cache-Control': `${visibility}, max-age=${ttl}, s-maxage=${ttl}`,
      'Expires': new Date(Date.now() + ttl * 1000).toUTCString()
    };
  }
}

// Fonctions utilitaires pour la pagination
export function calculatePagination(
  page: number,
  limit: number,
  total: number
): PaginationOptions {
  const validPage = Math.max(1, page);
  const validLimit = Math.min(Math.max(1, limit), 100); // Limite max de 100
  const validTotal = Math.max(0, total);

  return {
    page: validPage,
    limit: validLimit,
    total: validTotal
  };
}

export function getPaginationOffset(page: number, limit: number): number {
  return (Math.max(1, page) - 1) * Math.max(1, limit);
}

// Configuration des réponses par type d'endpoint
export const RESPONSE_CONFIGS = {
  // Endpoints de catégories (cache long)
  categories: {
    cacheControl: 'public, max-age=3600, s-maxage=3600', // 1 heure
    enableCompression: true,
    enablePagination: false
  },
  
  // Endpoints d'établissements (cache moyen)
  establishments: {
    cacheControl: 'public, max-age=1800, s-maxage=1800', // 30 minutes
    enableCompression: true,
    enablePagination: true
  },
  
  // Endpoints de recherche (cache court)
  search: {
    cacheControl: 'public, max-age=300, s-maxage=300', // 5 minutes
    enableCompression: true,
    enablePagination: true
  },
  
  // Endpoints d'authentification (pas de cache)
  auth: {
    cacheControl: 'no-cache, no-store, must-revalidate',
    enableCompression: false,
    enablePagination: false
  },
  
  // Endpoints d'administration (cache privé)
  admin: {
    cacheControl: 'private, max-age=600', // 10 minutes
    enableCompression: true,
    enablePagination: true
  }
} as const;

// Fonction utilitaire pour optimiser avec une configuration prédéfinie
export async function optimizeWithConfig<T>(
  data: T,
  configKey: keyof typeof RESPONSE_CONFIGS,
  additionalOptions: Partial<OptimizedResponseOptions> = {}
): Promise<NextResponse> {
  const config = RESPONSE_CONFIGS[configKey];
  return ResponseOptimizer.optimizeResponse(data, {
    ...config,
    ...additionalOptions
  });
}
