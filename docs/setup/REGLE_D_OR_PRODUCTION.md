# ⚠️ Règles d'Or pour la Production Supabase

## 🔒 Principe Fondamental

**Supabase = Production uniquement**  
**Prisma local = Démonstrations et développement**

## ✅ Ce qu'on Fait

### Pour les Démonstrations
- ✅ Utiliser **Prisma local** (`prisma/dev.db`)
- ✅ Routes non migrées fonctionnent avec Prisma
- ✅ Aucun risque, base locale

### Pour Tester les Routes Migrées
- ✅ Créer des données de test **minimales** dans Supabase si nécessaire
- ✅ Tester rapidement
- ✅ **Nettoyer immédiatement** avec `npm run cleanup:test-data`

### Pour la Production
- ✅ Utiliser Supabase (branche main)
- ✅ Routes migrées uniquement
- ✅ Données de production uniquement

## ❌ Ce qu'on NE Fait JAMAIS

1. ❌ **NE PAS** importer les données de démo dans Supabase production
2. ❌ **NE PAS** utiliser Supabase pour les démonstrations
3. ❌ **NE PAS** laisser des données de test dans Supabase
4. ❌ **NE PAS** modifier les données de production sans précaution
5. ❌ **NE PAS** exécuter de scripts de suppression sans vérification

## 🧹 Nettoyage Obligatoire

### Après Chaque Test

Si vous créez des données de test dans Supabase :

```bash
# Nettoyer immédiatement
npm run cleanup:test-data
```

### Ce qui est Nettoyé

Le script supprime automatiquement :
- Utilisateurs avec email contenant "test", "demo", "example.com"
- Professionnels de test
- Établissements de test
- Tags et images associés

## 📋 Checklist Avant Toute Opération Supabase

- [ ] Vérifier qu'on est sur la bonne base (production)
- [ ] Vérifier les variables d'environnement
- [ ] Faire un backup si nécessaire
- [ ] Tester d'abord avec des données minimales
- [ ] Nettoyer après les tests

## 🎯 Workflow Sécurisé

### 1. Développement Local
```bash
# Utiliser Prisma local
DATABASE_URL=file:./prisma/dev.db
npm run dev
```

### 2. Test des Routes Migrées
```bash
# Créer des données de test minimales dans Supabase
# Tester les routes
# NETTOYER immédiatement
npm run cleanup:test-data
```

### 3. Production
```bash
# Utiliser Supabase production
# Routes migrées uniquement
# Données de production uniquement
```

## ⚠️ Avertissements

### Avant d'Exécuter un Script

1. **Vérifier l'environnement** : Êtes-vous sur la bonne base ?
2. **Vérifier les variables** : Les bonnes clés API ?
3. **Faire un backup** : Si opération importante
4. **Tester d'abord** : Avec des données minimales

### Scripts de Nettoyage

- ✅ `cleanup:test-data` : Sûr, ne supprime que les données de test
- ⚠️ Scripts personnalisés : Vérifier avant d'exécuter

## 📝 Documentation

- `docs/STRATEGIE_ENVIRONNEMENTS.md` : Stratégie complète
- `docs/REGLE_D_OR_PRODUCTION.md` : Ce fichier (règles d'or)

## 🎯 Résumé

**Règle d'or** : 
- **Prisma local** = Démo (toujours)
- **Supabase** = Production (routes migrées uniquement)
- **Données de test** = Créer → Tester → Nettoyer immédiatement

