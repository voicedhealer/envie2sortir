# 🎯 Stratégie des Environnements

## 📊 Architecture Finale

```
┌─────────────────────────────────────┐
│  DÉVELOPPEMENT / DÉMONSTRATION      │
│  Prisma + SQLite (local)            │
│  prisma/dev.db                      │
│  ✅ TOUJOURS UTILISÉ POUR LES DEMOS │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│  PRODUCTION                         │
│  Supabase PostgreSQL                │
│  Branche "main"                     │
│  ⚠️  UNIQUEMENT POUR LA PRODUCTION   │
└─────────────────────────────────────┘
```

## 🔒 Règles Importantes

### ✅ Ce qu'on Fait

1. **Développement/Démo** : Toujours utiliser Prisma local
   - Base : `prisma/dev.db`
   - Routes non migrées : Utilisent Prisma
   - Démonstrations : Utilisent Prisma

2. **Production** : Utiliser Supabase
   - Base : Supabase PostgreSQL (branche main)
   - Routes migrées : Utilisent Supabase
   - Données de production uniquement

3. **Tests** : Créer des données de test dans Supabase si nécessaire
   - **IMPORTANT** : Les effacer après les tests
   - Utiliser le script de nettoyage

### ❌ Ce qu'on NE Fait PAS

1. **NE PAS** importer les données de démo dans Supabase production
2. **NE PAS** utiliser Supabase pour les démonstrations
3. **NE PAS** laisser des données de test dans Supabase production
4. **NE PAS** modifier les données de production sans précaution

## 🧪 Tester les Routes Migrées

### Option 1 : Créer des Données de Test Minimales

```bash
# Créer quelques données de test dans Supabase
# (via SQL Editor ou script)
# PUIS les effacer après les tests
```

### Option 2 : Tester avec des Données Vides

Les routes migrées fonctionnent même avec une base vide :
- `/api/categories` → Retourne `[]` (normal)
- `/api/recherche/envie` → Retourne `[]` (normal)
- `/api/etablissements/[slug]` → Retourne 404 (normal)

### Option 3 : Tester avec l'API d'Inscription

```bash
# Créer un compte de test via l'API
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Test",
    "lastName": "User",
    "email": "test@example.com",
    "password": "test123456",
    "acceptTerms": true
  }'
```

## 🧹 Nettoyer les Données de Test

### Script de Nettoyage

Un script est disponible pour nettoyer les données de test :

```bash
npm run cleanup:test-data
```

Ce script supprime :
- Les utilisateurs de test (email contenant "test")
- Les établissements de test
- Les données associées

## 📝 Workflow Recommandé

### Pour les Démonstrations

1. **Utiliser Prisma local** (`prisma/dev.db`)
2. **Routes non migrées** : Fonctionnent avec Prisma
3. **Aucun risque** : Base locale, pas de connexion Supabase

### Pour Tester les Routes Migrées

1. **Créer des données de test minimales** dans Supabase (si nécessaire)
2. **Tester les routes migrées**
3. **Nettoyer immédiatement** avec le script de nettoyage

### Pour la Production

1. **Utiliser Supabase** (branche main)
2. **Routes migrées** : Utilisent Supabase
3. **Données de production uniquement**
4. **Aucune donnée de test**

## ⚠️ Précautions

1. **Vérifier l'environnement** avant d'exécuter des scripts
2. **Ne jamais** exécuter de scripts de suppression sur la production sans vérification
3. **Backup** : Toujours faire un backup avant des opérations importantes
4. **Variables d'environnement** : Vérifier qu'on utilise les bonnes clés

## 🎯 Résumé

- ✅ **Démo** : Prisma local (toujours)
- ✅ **Production** : Supabase (routes migrées uniquement)
- ✅ **Tests** : Données minimales dans Supabase, puis nettoyage
- ❌ **Pas de branche demo** (payant)
- ❌ **Pas d'import de données de démo** dans Supabase production

