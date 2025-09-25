# 🔒 Modules de Sécurité

Ce dossier contient tous les modules de sécurité pour l'application Envie2Sortir.

## 📁 Structure

```
security/
├── index.ts                    # Point d'entrée principal
├── rate-limit-extended.ts     # Rate limiting avancé
├── csrf.ts                    # Protection CSRF
├── sanitization.ts            # Sanitisation des données
├── file-validation.ts         # Validation des fichiers
├── security-middleware.ts     # Middleware de sécurité
└── README.md                  # Ce fichier
```

## 🚀 Utilisation Rapide

### Import des modules

```typescript
// Import de tous les modules
import { 
  apiRateLimit, 
  generateCSRFToken, 
  sanitizeInput, 
  validateFile,
  applySecurityMiddleware 
} from '@/lib/security';

// Ou import spécifique
import { IMAGE_VALIDATION } from '@/lib/security/file-validation';
```

### Configuration

```typescript
import { SECURITY_CONFIG } from '@/lib/security';

// Accès aux configurations
const maxRequests = SECURITY_CONFIG.RATE_LIMITS.API.max;
const maxFileSize = SECURITY_CONFIG.MAX_FILE_SIZES.IMAGE;
```

## 🛡️ Modules Disponibles

### 1. Rate Limiting (`rate-limit-extended.ts`)

- **apiRateLimit** : 100 requêtes / 15 minutes
- **searchRateLimit** : 20 requêtes / minute  
- **uploadRateLimit** : 5 fichiers / minute
- **authRateLimit** : 10 tentatives / 15 minutes
- **adminRateLimit** : 5 tentatives / 15 minutes

### 2. Protection CSRF (`csrf.ts`)

- **generateCSRFToken()** : Génère un token CSRF
- **validateCSRFToken()** : Valide un token CSRF
- **cleanupExpiredTokens()** : Nettoie les tokens expirés

### 3. Sanitisation (`sanitization.ts`)

- **sanitizeInput()** : Nettoie les entrées utilisateur
- **sanitizeHTML()** : Nettoie le HTML
- **sanitizeEmail()** : Nettoie les emails
- **sanitizePhone()** : Nettoie les numéros de téléphone

### 4. Validation des Fichiers (`file-validation.ts`)

- **validateFile()** : Valide un fichier uploadé
- **IMAGE_VALIDATION** : Configuration pour les images
- **DOCUMENT_VALIDATION** : Configuration pour les documents

### 5. Middleware (`security-middleware.ts`)

- **applySecurityMiddleware()** : Applique le middleware de sécurité
- **sanitizeRequestBody()** : Nettoie le body des requêtes

## 📋 Exemples d'Usage

### API avec Rate Limiting

```typescript
import { applySecurityMiddleware } from '@/lib/security';

export async function GET(request: NextRequest) {
  const securityResponse = await applySecurityMiddleware(request, '/api/example');
  if (securityResponse) return securityResponse;
  
  // Votre logique ici
}
```

### Upload de Fichier Sécurisé

```typescript
import { validateFile, IMAGE_VALIDATION } from '@/lib/security';

const validation = validateFile(file, IMAGE_VALIDATION);
if (!validation.valid) {
  throw new Error(validation.error);
}
```

### Formulaire avec CSRF

```typescript
import { generateCSRFToken, validateCSRFToken } from '@/lib/security';

// Côté client
const token = generateCSRFToken(sessionId);

// Côté serveur
const isValid = validateCSRFToken(sessionId, token);
```

## 🧪 Tests

Les tests sont disponibles dans `tests/security/` :

```bash
# Exécuter tous les tests de sécurité
npm test tests/security/

# Test spécifique
npm test tests/security/sanitization.test.ts
```

## 📚 Documentation

- **Documentation principale** : `docs/SECURITY.md`
- **Exemples d'intégration** : `docs/SECURITY_INTEGRATION_EXAMPLES.md`
- **Script de test** : `scripts/test-security.js`

## ⚙️ Configuration

Les configurations sont centralisées dans `SECURITY_CONFIG` :

```typescript
export const SECURITY_CONFIG = {
  RATE_LIMITS: { /* ... */ },
  CSRF_TOKEN_EXPIRY: 3600000,
  MAX_FILE_SIZES: { /* ... */ },
  ALLOWED_TYPES: { /* ... */ },
  ALLOWED_EXTENSIONS: { /* ... */ }
};
```

## 🔄 Mise à Jour

Pour ajouter de nouveaux modules de sécurité :

1. Créer le fichier dans ce dossier
2. Exporter les fonctions dans `index.ts`
3. Ajouter les tests dans `tests/security/`
4. Mettre à jour la documentation

## 🚨 Support

Pour toute question sur les modules de sécurité :

- Consulter la documentation dans `docs/`
- Vérifier les tests dans `tests/security/`
- Utiliser le script de test : `node scripts/test-security.js`

---

*Dernière mise à jour : Janvier 2025*
