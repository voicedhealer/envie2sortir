# Coexistence Prisma et Supabase

## 🎯 Objectif

Permettre à Prisma (SQLite local) et Supabase (PostgreSQL cloud) de coexister dans le même projet, pour une migration progressive sans casser l'existant.

## ✅ État Actuel

### Prisma (Intact)
- ✅ Base de données SQLite : `prisma/dev.db` (non modifiée)
- ✅ Schéma Prisma : `prisma/schema.prisma` (non modifié)
- ✅ Client Prisma : `src/lib/prisma.ts` (fonctionne toujours)
- ✅ Toutes vos données de dev/demo sont préservées

### Supabase (Nouveau)
- ✅ Migrations SQL créées (mais pas encore appliquées)
- ✅ Clients Supabase créés
- ✅ Configuration prête

## 🔄 Stratégie de Migration Progressive

### Option 1 : Migration Route par Route (Recommandé)

Migrer les API routes une par une, en gardant Prisma pour le reste :

```typescript
// Exemple : src/app/api/etablissements/[slug]/route.ts

// AVANT (Prisma)
import { prisma } from '@/lib/prisma';
const data = await prisma.establishment.findUnique({ where: { slug } });

// APRÈS (Supabase)
import { createClient } from '@/lib/supabase/server';
const supabase = createClient();
const { data } = await supabase.from('establishments').select('*').eq('slug', slug).single();
```

**Avantages** :
- Migration progressive
- Pas de rupture
- Tests à chaque étape
- Rollback facile

### Option 2 : Feature Flag

Utiliser une variable d'environnement pour basculer :

```typescript
// src/lib/db.ts
const USE_SUPABASE = process.env.USE_SUPABASE === 'true';

if (USE_SUPABASE) {
  // Utiliser Supabase
  export const db = createSupabaseClient();
} else {
  // Utiliser Prisma
  export const db = createPrismaClient();
}
```

### Option 3 : Dual Mode

Garder les deux systèmes en parallèle :

```typescript
// Pour les nouvelles fonctionnalités : Supabase
// Pour l'existant : Prisma
// Migration progressive fonctionnalité par fonctionnalité
```

## 📁 Structure des Fichiers

### Fichiers Prisma (Non Modifiés)
```
prisma/
├── schema.prisma          ✅ Intact
├── dev.db                 ✅ Intact (vos données sont là)
└── migrations/            ✅ Intact
```

### Fichiers Supabase (Nouveaux)
```
supabase/
├── migrations/            ✅ Nouveau
│   ├── 001_initial_schema.sql
│   ├── 002_rls_policies.sql
│   └── 003_storage_setup.sql
├── seed.sql               ✅ Nouveau
└── config.toml             ✅ Nouveau

src/lib/supabase/          ✅ Nouveau
├── client.ts
├── server.ts
├── middleware.ts
└── helpers.ts
```

## 🔧 Configuration

### Variables d'Environnement

Votre `.env.local` peut contenir les deux :

```env
# ============================================
# PRISMA (GARDÉ POUR DEV/DEMOS)
# ============================================
DATABASE_URL=file:./prisma/dev.db

# ============================================
# SUPABASE (NOUVEAU)
# ============================================
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# ============================================
# NEXTAUTH (GARDÉ POUR COMPATIBILITÉ)
# ============================================
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret
```

### Les Deux Systèmes Fonctionnent en Parallèle

- **Prisma** : Continue de fonctionner avec votre code existant
- **Supabase** : Prêt pour le nouveau code migré

## 🧪 Tester les Deux Systèmes

### Tester Prisma (Existant)

```bash
# Vérifier que Prisma fonctionne toujours
npx prisma studio
# Ouvrira l'interface graphique avec vos données
```

### Tester Supabase (Nouveau)

```bash
# Appliquer les migrations Supabase
# Via Dashboard Supabase > SQL Editor
# Ou via CLI : supabase db push

# Tester la connexion
# Créer un fichier test-supabase.ts
```

## 📝 Plan de Migration Recommandé

### Phase 1 : Préparation ✅ (FAIT)
- [x] Schéma Supabase créé
- [x] Clients Supabase créés
- [x] Documentation complète

### Phase 2 : Migration Progressive (À FAIRE)
1. **Commencer par les routes simples**
   - [ ] Routes de lecture (GET)
   - [ ] Routes d'authentification
   - [ ] Routes de recherche

2. **Continuer avec les routes complexes**
   - [ ] Routes CRUD établissements
   - [ ] Routes upload
   - [ ] Routes admin

3. **Finaliser**
   - [ ] Migrer le middleware
   - [ ] Migrer les composants
   - [ ] Tests complets

### Phase 3 : Validation (À FAIRE)
- [ ] Tous les tests passent
- [ ] Toutes les fonctionnalités vérifiées
- [ ] Performance validée

## ⚠️ Points d'Attention

### 1. Ne Pas Supprimer Prisma
- ✅ La base `prisma/dev.db` reste intacte
- ✅ Le schéma `prisma/schema.prisma` reste intact
- ✅ Le client Prisma continue de fonctionner

### 2. Migration Progressive
- Migrer route par route
- Tester chaque route migrée
- Garder Prisma pour le reste

### 3. Données Séparées
- **Prisma** : Vos données de dev/demo locales
- **Supabase** : Nouvelles données (tables vides au début)

## 🔄 Basculer Vers Supabase

Quand vous êtes prêt à utiliser Supabase pour une route :

1. **Appliquer les migrations Supabase** (si pas encore fait)
2. **Migrer le code de la route** (voir `docs/EXEMPLE_MIGRATION_API.md`)
3. **Tester la route**
4. **Continuer avec la route suivante**

## 📊 Comparaison

| Aspect | Prisma (SQLite) | Supabase (PostgreSQL) |
|--------|----------------|----------------------|
| **Localisation** | Local (`prisma/dev.db`) | Cloud (Supabase) |
| **Type** | SQLite | PostgreSQL |
| **Données** | Vos données de dev | Tables vides (pour l'instant) |
| **Usage** | Dev/Demos | Production (après migration) |
| **État** | ✅ Fonctionne | ✅ Prêt à utiliser |

## ✅ Checklist

- [x] Prisma intact et fonctionnel
- [x] Supabase configuré et prêt
- [ ] Migrations Supabase appliquées
- [ ] Première route migrée et testée
- [ ] Documentation à jour

## 🆘 Questions Fréquentes

**Q : Est-ce que je peux utiliser les deux en même temps ?**  
R : Oui ! Vous pouvez avoir certaines routes qui utilisent Prisma et d'autres Supabase.

**Q : Est-ce que mes données Prisma sont en danger ?**  
R : Non, elles sont intactes. Aucun fichier Prisma n'a été modifié.

**Q : Quand dois-je migrer vers Supabase ?**  
R : Quand vous êtes prêt. La migration peut se faire progressivement, route par route.

**Q : Puis-je revenir en arrière ?**  
R : Oui, tant que vous gardez Prisma, vous pouvez toujours revenir en arrière.

