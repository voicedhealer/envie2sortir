# 🔧 Corrections : Cookies Supabase Non Détectés dans le Middleware

## 🐛 Problème Identifié

**Symptôme** : Les cookies Supabase ne sont pas détectés dans le middleware après la connexion
```
🍪 [Middleware] Cookies entrants: []
🍪 Cookies Supabase trouvés: 0 []
⚠️ Aucun cookie Supabase trouvé. Tous les cookies: [ '__next_hmr_refresh_hash__' ]
👤 getUser result: {
  hasUser: false,
  userId: undefined,
  error: 'Auth session missing!',
  errorCode: 400
}
```

**Cause** :
1. Double appel à `getUser()` dans le middleware (ligne 82 et ligne 110)
2. Logs insuffisants pour déboguer le problème des cookies
3. Pas de vérification si les cookies sont vides lors de la définition

---

## ✅ Corrections Appliquées

### 1. **`src/lib/supabase/middleware.ts`**

#### Suppression du Double Appel à `getUser()`
```typescript
// ❌ AVANT : Double appel
await supabase.auth.getUser(); // Ligne 82
// ...
const { data: { user }, error: getUserError } = await supabase.auth.getUser(); // Ligne 110

// ✅ APRÈS : Un seul appel
const getUserResult = await supabase.auth.getUser();
const user = getUserResult.data?.user;
const getUserError = getUserResult.error;
```

#### Amélioration des Logs
```typescript
// ✅ Logs détaillés pour les cookies
const allCookies = request.cookies.getAll();
const supabaseCookies = allCookies.filter(c => c.name.startsWith('sb-'));
console.log('🍪 [Middleware] Cookies entrants:', supabaseCookies.map(c => c.name));
console.log('🍪 Cookies Supabase trouvés:', supabaseCookies.length, supabaseCookies.map(c => c.name));

if (supabaseCookies.length === 0) {
  console.log('⚠️ Aucun cookie Supabase trouvé. Tous les cookies:', allCookies.map(c => c.name));
}

// ✅ Logs pour getUser()
if (getUserError) {
  console.log('👤 getUser result:', {
    hasUser: !!user,
    userId: user?.id,
    error: getUserError.message,
    errorCode: getUserError.status
  });
}
```

### 2. **`src/app/api/auth/login/route.ts`**

#### Amélioration de la Définition des Cookies
```typescript
// ✅ Vérification que la valeur n'est pas vide
if (!value || value.trim() === '') {
  console.warn('⚠️ [API Login] Cookie vide détecté:', name);
}

// ✅ Logs améliorés
console.log('🍪 [API Login] Setting cookie:', name, 'value length:', value?.length || 0);
```

#### Options de Cookie Optimisées
```typescript
const cookieOptions = {
  path: '/',
  sameSite: 'lax' as const,
  httpOnly: false, // ✅ Nécessaire pour que le client JS puisse lire
  maxAge: options?.maxAge || 60 * 60 * 24 * 7, // 1 semaine
  secure: process.env.NODE_ENV === 'production', // ✅ false en dev
  // ✅ Pas de domaine défini (fonctionne pour localhost)
  ...(options?.expires && { expires: options.expires }),
};
```

---

## 🔍 Diagnostic

### Vérifications à Effectuer

1. **Vérifier que les cookies sont définis lors de la connexion**
   - Ouvrir DevTools > Application > Cookies
   - Se connecter
   - Vérifier que les cookies `sb-*-auth-token` sont présents

2. **Vérifier que les cookies sont envoyés avec les requêtes**
   - Ouvrir DevTools > Network
   - Faire une requête après connexion
   - Vérifier l'onglet "Headers" > "Request Headers" > "Cookie"
   - Vérifier que les cookies `sb-*` sont présents

3. **Vérifier les logs du middleware**
   - Regarder les logs du serveur
   - Vérifier que `🍪 Cookies Supabase trouvés:` montre au moins 1 cookie
   - Si 0, vérifier que les cookies sont bien définis dans l'API de login

### Causes Possibles

1. **Cookies non définis** : Les cookies ne sont pas créés lors de la connexion
   - Vérifier les logs : `🍪 [API Login] Setting cookies: X cookies`
   - Vérifier que `cookiesToReturn` n'est pas vide

2. **Cookies non envoyés** : Les cookies sont définis mais pas envoyés avec les requêtes
   - Vérifier le domaine/path des cookies
   - Vérifier que `sameSite: 'lax'` est correct
   - Vérifier que `secure: false` en dev

3. **Cookies expirés** : Les cookies sont définis mais expirent immédiatement
   - Vérifier `maxAge` ou `expires`
   - Vérifier que la date d'expiration est dans le futur

---

## 🧪 Tests à Effectuer

### Test 1 : Vérification des Cookies après Connexion
1. Ouvrir DevTools > Application > Cookies
2. Se connecter avec un compte admin
3. Vérifier que les cookies `sb-*-auth-token` sont présents
4. Vérifier que les cookies ont :
   - `Path: /`
   - `SameSite: Lax`
   - `Secure: false` (en dev)
   - `HttpOnly: false`

### Test 2 : Vérification dans le Middleware
1. Se connecter
2. Naviguer vers une page protégée (ex: `/admin`)
3. Vérifier les logs du serveur :
   ```
   🍪 [Middleware] Cookies entrants: ['sb-xxx-auth-token']
   🍪 Cookies Supabase trouvés: 1 ['sb-xxx-auth-token']
   ```
4. Si 0 cookies trouvés, vérifier les logs de l'API de login

### Test 3 : Vérification de la Session
1. Se connecter
2. Naviguer vers `/admin`
3. Vérifier que la session est détectée :
   ```
   👤 getUser result: {
     hasUser: true,
     userId: '...',
     ...
   }
   ```
4. Vérifier que la page admin s'affiche correctement

---

## 📊 Résultats Attendus

### Avant les Corrections
- ❌ Double appel à `getUser()` (inefficace)
- ❌ Logs insuffisants pour déboguer
- ❌ Cookies non détectés dans le middleware
- ❌ Erreur "Auth session missing!"

### Après les Corrections
- ✅ Un seul appel à `getUser()` (efficace)
- ✅ Logs détaillés pour le débogage
- ✅ Cookies correctement détectés
- ✅ Session correctement récupérée

---

## 🔧 Actions Supplémentaires si le Problème Persiste

### Si les Cookies Ne Sont Toujours Pas Détectés

1. **Vérifier le Domaine**
   - En dev, ne pas définir de domaine (fonctionne pour localhost)
   - En prod, vérifier que le domaine correspond au domaine du site

2. **Vérifier SameSite**
   - `sameSite: 'lax'` fonctionne pour la plupart des cas
   - Si problème de CORS, essayer `sameSite: 'none'` avec `secure: true`

3. **Vérifier le Path**
   - `path: '/'` permet aux cookies d'être envoyés pour toutes les routes
   - Vérifier que le path correspond aux routes protégées

4. **Vérifier HttpOnly**
   - `httpOnly: false` est nécessaire pour que Supabase puisse lire les cookies côté client
   - Si sécurité requise, utiliser `httpOnly: true` mais gérer différemment

5. **Vérifier Secure**
   - En dev (localhost) : `secure: false`
   - En prod (HTTPS) : `secure: true`

---

## 📝 Notes Techniques

### Pourquoi `httpOnly: false` ?
Supabase utilise les cookies pour stocker les tokens d'authentification. Le client JavaScript doit pouvoir lire ces cookies pour synchroniser la session. Si `httpOnly: true`, le client JS ne peut pas lire les cookies.

### Pourquoi Pas de Domaine en Dev ?
En développement sur `localhost`, ne pas définir de domaine permet aux cookies de fonctionner correctement. Définir `domain: 'localhost'` peut causer des problèmes.

### Pourquoi `sameSite: 'lax'` ?
`sameSite: 'lax'` permet aux cookies d'être envoyés avec les requêtes GET cross-site (comme les redirections), mais pas avec les requêtes POST cross-site. C'est un bon compromis entre sécurité et fonctionnalité.

---

## ✅ Checklist Finale

- [x] Double appel à `getUser()` supprimé
- [x] Logs améliorés pour le débogage
- [x] Vérification des cookies vides ajoutée
- [ ] Tests manuels effectués
- [ ] Cookies détectés dans le middleware
- [ ] Session correctement récupérée




