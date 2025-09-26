import { createRateLimit } from '../rate-limit';

// Rate limiters pour toutes les APIs
export const apiRateLimit = createRateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requêtes par 15 minutes
});

export const searchRateLimit = createRateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 20, // 20 recherches par minute
});

export const uploadRateLimit = createRateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5, // 5 uploads par minute
});

export const authRateLimit = createRateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 tentatives max
});

export const adminRateLimit = createRateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 tentatives max
});

export const imagesReadRateLimit = createRateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 60, // 60 lectures d'images par minute
});
