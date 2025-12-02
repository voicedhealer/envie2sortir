# Tests d'authentification - Guide manuel

## 🧪 Tests à effectuer dans le navigateur

### Prérequis
1. Le serveur doit être démarré : `npm run dev`
2. Vider les cookies et le localStorage du navigateur
3. Ouvrir la console du navigateur (F12)

---

## Test 1 : Connexion Admin ✅

### Étapes :
1. Aller sur `http://localhost:3001/auth`
2. Sélectionner **Admin** comme type de compte
3. Entrer les identifiants :
   - Email : `envie2sortir.fr@gmail.com`
   - Mot de passe : `Admin123!Secure`
4. Cliquer sur **Connexion**

### Résultat attendu :
- ✅ Le bouton affiche "Connexion..." pendant le chargement
- ✅ La connexion réussit (pas d'erreur)
- ✅ **Redirection automatique vers `/admin`** (pas de boucle)
- ✅ La page `/admin` se charge correctement

### Vérifications dans la console :
```
✅ Connexion réussie via API route: {id: '...', role: 'admin'}
🔄 [Auth] Rafraîchissement de la session...
✅ [Auth] Redirection vers: /admin
🚀 [Auth] Exécution de la redirection vers: /admin
```

### Vérifications dans les cookies (Application > Cookies) :
- ✅ `sb-qzmduszbsmxitsvciwzq-auth-token` présent
- ✅ Cookie avec `Path=/`
- ✅ Cookie avec `SameSite=Lax`
- ✅ Cookie **SANS** `Secure` (normal en dev)
- ✅ Cookie **SANS** `HttpOnly` (nécessaire pour Supabase)

---

## Test 2 : Persistance de la session ✅

### Étapes :
1. Après la connexion réussie, **recharger la page** (F5)
2. Vérifier que vous restez connecté

### Résultat attendu :
- ✅ Pas de redirection vers `/auth`
- ✅ Reste sur `/admin`
- ✅ La session persiste après le rechargement

### Vérifications dans la console :
```
🍪 [Middleware] Cookies entrants: ['sb-qzmduszbsmxitsvciwzq-auth-token']
👑 [Middleware] Admin détecté sur /auth, redirection vers /admin
```

---

## Test 3 : Redirection depuis /auth ✅

### Étapes :
1. Être connecté en tant qu'admin
2. Aller manuellement sur `http://localhost:3001/auth`
3. Vérifier la redirection

### Résultat attendu :
- ✅ Redirection automatique vers `/admin`
- ✅ Pas de boucle de redirection

### Vérifications dans la console :
```
👑 [Middleware] Admin détecté sur /auth, redirection vers /admin
```

---

## Test 4 : Déconnexion ✅

### Étapes :
1. Être connecté en tant qu'admin
2. Cliquer sur **Déconnexion** (si disponible)
3. Ou supprimer manuellement les cookies

### Résultat attendu :
- ✅ Redirection vers `/auth` ou `/`
- ✅ Les cookies Supabase sont supprimés
- ✅ Plus d'accès à `/admin`

---

## Test 5 : Connexion avec mauvais mot de passe ❌

### Étapes :
1. Aller sur `http://localhost:3001/auth`
2. Sélectionner **Admin**
3. Entrer un mauvais mot de passe
4. Cliquer sur **Connexion**

### Résultat attendu :
- ✅ Message d'erreur affiché : "Email ou mot de passe incorrect"
- ✅ Pas de redirection
- ✅ Reste sur la page `/auth`

---

## Test 6 : Connexion avec mauvais rôle ❌

### Étapes :
1. Aller sur `http://localhost:3001/auth`
2. Sélectionner **Utilisateur** (au lieu d'Admin)
3. Entrer les identifiants admin
4. Cliquer sur **Connexion**

### Résultat attendu :
- ✅ Message d'erreur affiché : "Ce compte est un compte administrateur, mais vous avez sélectionné 'utilisateur'"
- ✅ Pas de redirection
- ✅ Reste sur la page `/auth`

---

## 🐛 Problèmes courants et solutions

### Problème : Boucle de redirection infinie
**Symptômes** : Redirection entre `/auth` et `/admin` en boucle

**Solutions** :
1. Vider tous les cookies du navigateur
2. Vérifier que les cookies Supabase ont `httpOnly: false`
3. Vérifier que `secure: false` en développement
4. Vérifier les logs du middleware

### Problème : Session perdue après rechargement
**Symptômes** : Redirection vers `/auth` après F5

**Solutions** :
1. Vérifier que les cookies sont bien présents dans Application > Cookies
2. Vérifier que les cookies ont `Path=/`
3. Vérifier que `sameSite: 'lax'`
4. Vérifier les logs du middleware pour voir si les cookies sont reçus

### Problème : Cookie non défini
**Symptômes** : `⚠️ Aucun cookie Supabase trouvé`

**Solutions** :
1. Vérifier que l'API `/api/auth/login` retourne bien les cookies
2. Vérifier les headers `Set-Cookie` dans l'onglet Network
3. Vérifier que le domaine du cookie est correct (pas de domaine spécifique en dev)

---

## 📋 Checklist de vérification

- [ ] Connexion admin réussit
- [ ] Redirection vers `/admin` fonctionne
- [ ] Pas de boucle de redirection
- [ ] Session persiste après rechargement
- [ ] Cookies Supabase présents et correctement configurés
- [ ] Middleware détecte correctement l'admin
- [ ] Redirection depuis `/auth` vers `/admin` fonctionne
- [ ] Messages d'erreur appropriés pour les cas d'échec

---

## 🔍 Commandes utiles pour le débogage

### Dans la console du navigateur :
```javascript
// Vérifier les cookies
document.cookie

// Vérifier le localStorage
localStorage.getItem('sb-qzmduszbsmxitsvciwzq-auth-token')

// Vérifier la session Supabase
// (nécessite d'importer le client Supabase)
```

### Dans les DevTools > Network :
1. Filtrer par "login"
2. Vérifier la requête POST vers `/api/auth/login`
3. Vérifier les headers `Set-Cookie` dans la réponse
4. Vérifier le status code (200 = succès)

---

## ✅ Critères de succès

Tous les tests doivent passer pour considérer l'authentification comme fonctionnelle :

1. ✅ Connexion admin réussit
2. ✅ Redirection automatique vers `/admin`
3. ✅ Pas de boucle de redirection
4. ✅ Session persiste après rechargement
5. ✅ Cookies correctement configurés
6. ✅ Middleware fonctionne correctement





