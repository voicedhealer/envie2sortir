# 🔒 Exemples d'Intégration de la Sécurité

## Vue d'ensemble

Ce document montre comment intégrer les nouveaux modules de sécurité dans les APIs existantes d'Envie2Sortir.

## 🚀 Intégration dans les APIs

### 1. Rate Limiting

```typescript
// src/app/api/example/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { applySecurityMiddleware, searchRateLimit } from '@/lib/security';

export async function GET(request: NextRequest) {
  // Appliquer le middleware de sécurité
  const securityResponse = await applySecurityMiddleware(request, '/api/example');
  if (securityResponse) return securityResponse;
  
  // Votre logique métier ici
  return NextResponse.json({ success: true });
}
```

### 2. Protection CSRF

```typescript
// src/app/api/form-submit/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { validateCSRFToken } from '@/lib/security';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const sessionId = request.headers.get('x-session-id');
  const csrfToken = request.headers.get('x-csrf-token');
  
  if (!validateCSRFToken(sessionId || '', csrfToken || '')) {
    return NextResponse.json(
      { error: 'Token CSRF invalide' },
      { status: 403 }
    );
  }
  
  // Traitement sécurisé
  return NextResponse.json({ success: true });
}
```

### 3. Sanitisation des Données

```typescript
// src/app/api/establishment/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { sanitizeRequestBody, sanitizeEmail, sanitizePhone } from '@/lib/security';

export async function POST(request: NextRequest) {
  const body = await request.json();
  
  // Sanitisation automatique
  const sanitizedBody = sanitizeRequestBody(body);
  
  // Sanitisation spécialisée
  sanitizedBody.email = sanitizeEmail(sanitizedBody.email);
  sanitizedBody.phone = sanitizePhone(sanitizedBody.phone);
  
  // Traitement sécurisé
  return NextResponse.json({ success: true });
}
```

### 4. Validation des Fichiers

```typescript
// src/app/api/upload/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { validateFile, IMAGE_VALIDATION } from '@/lib/security';

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const file = formData.get('file') as File;
  
  // Validation du fichier
  const validation = validateFile(file, IMAGE_VALIDATION);
  if (!validation.valid) {
    return NextResponse.json(
      { error: validation.error },
      { status: 400 }
    );
  }
  
  // Traitement sécurisé du fichier
  return NextResponse.json({ success: true });
}
```

## 🔧 Configuration des Headers de Sécurité

### Middleware Next.js

```typescript
// src/middleware.ts (ajout aux headers existants)
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  
  // Headers de sécurité
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  
  return response;
}
```

## 🛡️ Utilisation dans les Composants React

### Génération de Tokens CSRF

```typescript
// src/components/SecureForm.tsx
import { useEffect, useState } from 'react';
import { generateCSRFToken } from '@/lib/security';

export function SecureForm() {
  const [csrfToken, setCsrfToken] = useState('');
  
  useEffect(() => {
    const sessionId = getSessionId(); // Votre logique de session
    const token = generateCSRFToken(sessionId);
    setCsrfToken(token);
  }, []);
  
  const handleSubmit = async (formData: FormData) => {
    const response = await fetch('/api/form-submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': csrfToken,
        'X-Session-Id': getSessionId()
      },
      body: JSON.stringify(Object.fromEntries(formData))
    });
  };
  
  return (
    <form>
      <input type="hidden" name="csrf_token" value={csrfToken} />
      {/* Autres champs du formulaire */}
    </form>
  );
}
```

### Validation des Fichiers côté Client

```typescript
// src/components/SecureFileUpload.tsx
import { validateFile, IMAGE_VALIDATION } from '@/lib/security';

export function SecureFileUpload() {
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    // Validation côté client
    const validation = validateFile(file, IMAGE_VALIDATION);
    if (!validation.valid) {
      alert(validation.error);
      event.target.value = '';
      return;
    }
    
    // Traitement du fichier
  };
  
  return (
    <input
      type="file"
      accept="image/jpeg,image/png,image/webp"
      onChange={handleFileChange}
    />
  );
}
```

## 📊 Monitoring et Logs

### Logs de Sécurité

```typescript
// src/lib/security/security-logger.ts
export function logSecurityEvent(event: string, details: any) {
  console.log(`[SECURITY] ${new Date().toISOString()} - ${event}:`, details);
  
  // En production, envoyer vers un service de monitoring
  if (process.env.NODE_ENV === 'production') {
    // Envoyer vers Sentry, DataDog, etc.
  }
}

// Utilisation dans les APIs
import { logSecurityEvent } from '@/lib/security/security-logger';

export async function POST(request: NextRequest) {
  const securityResponse = await applySecurityMiddleware(request, '/api/example');
  if (securityResponse) {
    logSecurityEvent('RATE_LIMIT_EXCEEDED', {
      ip: request.ip,
      endpoint: '/api/example',
      userAgent: request.headers.get('user-agent')
    });
    return securityResponse;
  }
  
  // Log des tentatives d'upload suspectes
  logSecurityEvent('FILE_UPLOAD', {
    ip: request.ip,
    fileType: file.type,
    fileSize: file.size
  });
}
```

## 🔄 Migration Progressive

### Étape 1 : APIs Critiques
Commencer par sécuriser les APIs les plus sensibles :
- Authentification (`/api/auth/*`)
- Upload de fichiers (`/api/upload/*`)
- Administration (`/api/admin/*`)

### Étape 2 : APIs Publiques
Ajouter la protection aux APIs publiques :
- Recherche (`/api/recherche/*`)
- Établissements (`/api/etablissements/*`)

### Étape 3 : Composants Frontend
Intégrer la sécurité dans les composants :
- Formulaires avec CSRF
- Upload de fichiers avec validation
- Sanitisation des inputs utilisateur

## ✅ Checklist de Déploiement

- [ ] Headers de sécurité configurés
- [ ] Rate limiting actif sur toutes les APIs
- [ ] Tokens CSRF sur les formulaires sensibles
- [ ] Validation des fichiers uploadés
- [ ] Sanitisation des données utilisateur
- [ ] Logs de sécurité configurés
- [ ] Tests de sécurité passants
- [ ] Documentation mise à jour

---

*Pour toute question sur l'intégration, consulter la documentation principale dans `docs/SECURITY.md`*
