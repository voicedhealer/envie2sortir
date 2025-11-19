# Guide de Test des Routes Migrées

## 🚀 Démarrage Rapide

### 1. Démarrer le serveur Next.js

Dans un premier terminal :

```bash
npm run dev
```

Attendez que le serveur soit prêt (message `Ready in X ms`).

### 2. Lancer les tests

Dans un deuxième terminal :

```bash
npm run test:routes
```

## 📊 Ce que teste le script

Le script `test-routes-supabase.ts` teste automatiquement :

### Routes Publiques ✅
- `/api/monitoring/health` - Santé de l'application
- `/api/monitoring/liveness` - Vérification de disponibilité
- `/api/monitoring/readiness` - Vérification de préparation
- `/api/categories` - Liste des catégories
- `/api/establishments/all` - Liste des établissements
- `/api/establishments/random` - Établissements aléatoires
- `/api/events/upcoming` - Événements à venir
- `/api/deals/all` - Tous les deals actifs

### Routes d'Authentification 🔐
- `/api/auth/verify-establishment` - Vérification d'établissement

### Routes Admin 👑
- `/api/admin/stats` - Statistiques admin
- `/api/admin/pending-count` - Compteur d'éléments en attente
- `/api/admin/metrics` - Métriques système
- `/api/admin/professionals` - Liste des professionnels

### Routes de Recherche 🔍
- `/api/recherche/envie` - Recherche "envie de"
- `/api/recherche/filtered` - Recherche filtrée

### Routes Newsletter 📧
- `/api/newsletter/subscribe` - Inscription newsletter

### Routes Analytics 📊
- `/api/analytics/search/track` - Tracking des recherches

## 📋 Interprétation des Résultats

### ✅ Succès
- Status 200-299 : Route fonctionne correctement
- Status 401/403 : Route protégée (normal si non authentifié)

### ❌ Erreurs
- Status 500 : Erreur serveur (vérifier les logs)
- Status 404 : Route non trouvée
- Erreur réseau : Serveur non accessible

## 🔧 Dépannage

### Le serveur ne démarre pas
```bash
# Vérifier que le port 3000 est libre
lsof -ti:3000 | xargs kill -9

# Redémarrer
npm run dev
```

### Erreurs de connexion Supabase
```bash
# Vérifier la configuration
npm run test:supabase
```

### Routes retournent 401/403
C'est normal pour les routes protégées. Le script teste que :
- La route existe
- Elle retourne une erreur d'authentification appropriée

## 📈 Rapport de Test

Le script génère un rapport détaillé avec :
- Nombre de succès/erreurs
- Détails de chaque test
- Temps de réponse
- Codes de statut HTTP

## 🎯 Tests Manuels

Pour tester manuellement une route spécifique :

```bash
# Test GET
curl http://localhost:3000/api/categories

# Test POST
curl -X POST http://localhost:3000/api/newsletter/subscribe \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "firstName": "Test"}'
```

## 📝 Notes

- Les routes nécessitant une authentification retourneront 401/403 (normal)
- Certaines routes nécessitent des données en base (peuvent retourner des listes vides)
- Le script teste la disponibilité, pas la logique métier complète
