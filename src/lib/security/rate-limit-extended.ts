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
  max: 10, // 10 uploads par minute (augmenté de 5 à 10)
});

export const imageManagementRateLimit = createRateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // 30 actions de gestion d'images par minute (définir principale, supprimer, etc.)
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
  max: 200, // 200 lectures d'images par minute (plus permissif pour les établissements)
});
