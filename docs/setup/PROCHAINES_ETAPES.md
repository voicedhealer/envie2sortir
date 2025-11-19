# Prochaines Étapes - Migration Supabase

## ✅ Ce qui est Fait

1. **Schéma Supabase** ✅
   - Toutes les tables créées (19+ tables)
   - Tous les indexes créés
   - Tous les triggers créés
   - Tous les enums créés

2. **Sécurité RLS** ✅
   - 50+ policies RLS appliquées
   - Sécurité par utilisateur et rôle
   - Protection des données sensibles

3. **Storage** ✅
   - 5 buckets créés (establishments, events, deals, menus, avatars)
   - Policies Storage configurées
   - Limites de taille configurées

4. **Configuration** ✅
   - Clients Supabase créés
   - Variables d'environnement configurées
   - Test de connexion réussi

## 🎯 Prochaines Étapes

### Phase 1 : Migration Progressive du Code (Recommandé)

#### Option A : Commencer par les Routes Simples

**1. Routes de Lecture (GET) - Plus Faciles**
- [ ] `GET /api/etablissements` - Liste des établissements
- [ ] `GET /api/etablissements/[slug]` - Détail d'un établissement
- [ ] `GET /api/categories` - Liste des catégories
- [ ] `GET /api/recherche/envie` - Recherche "envie de"

**2. Routes d'Authentification**
- [ ] `POST /api/auth/register` - Inscription
- [ ] `POST /api/auth/login` - Connexion
- [ ] `GET /api/auth/[...nextauth]` - NextAuth (à migrer vers Supabase Auth)

**3. Routes CRUD**
- [ ] `POST /api/etablissements` - Créer un établissement
- [ ] `PUT /api/etablissements/[slug]` - Modifier un établissement
- [ ] `DELETE /api/etablissements/[slug]` - Supprimer un établissement

**4. Routes Upload**
- [ ] `POST /api/upload/image` - Upload d'images
- [ ] `POST /api/upload/optimized-image` - Upload optimisé
- [ ] `POST /api/upload/deal-media` - Upload médias bons plans

**5. Routes Complexes**
- [ ] Routes dashboard
- [ ] Routes admin
- [ ] Routes messaging
- [ ] Routes analytics

#### Option B : Migration par Fonctionnalité

1. **Fonctionnalité Recherche** (prioritaire pour EnvieSearchBar)
   - Migrer toutes les routes de recherche
   - Tester la barre de recherche

2. **Fonctionnalité Authentification**
   - Migrer vers Supabase Auth
   - Adapter le middleware
   - Tester inscription/connexion

3. **Fonctionnalité Établissements**
   - Migrer CRUD établissements
   - Migrer upload images
   - Tester création/modification

## 📝 Guide de Migration d'une Route

### Exemple : Migration d'une Route GET

**Avant (Prisma)** :
```typescript
import { prisma } from '@/lib/prisma';

export async function GET() {
  const data = await prisma.establishment.findMany({
    where: { status: 'approved' }
  });
  return NextResponse.json(data);
}
```

**Après (Supabase)** :
```typescript
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('establishments')
    .select('*')
    .eq('status', 'approved');
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  
  return NextResponse.json(data);
}
```

### Checklist pour Chaque Route Migrée

- [ ] Remplacer `prisma` par `createClient()`
- [ ] Adapter la requête Prisma → Supabase
- [ ] Gérer les erreurs Supabase
- [ ] Tester la route manuellement
- [ ] Vérifier les permissions RLS
- [ ] Documenter les changements

## 🧪 Tests à Effectuer

### Tests Manuels par Scénario

1. **Inscription Utilisateur**
   - [ ] Créer un compte utilisateur
   - [ ] Vérifier que l'utilisateur est créé dans `users`
   - [ ] Vérifier la session

2. **Inscription Professionnel**
   - [ ] Créer un compte professionnel
   - [ ] Vérifier SIRET
   - [ ] Vérifier création dans `professionals`

3. **Recherche EnvieSearchBar**
   - [ ] Recherche "envie de restaurant"
   - [ ] Recherche "envie de bar"
   - [ ] Vérifier les résultats
   - [ ] Vérifier les filtres

4. **Création Établissement**
   - [ ] Créer un établissement (en tant que pro)
   - [ ] Vérifier le statut "pending"
   - [ ] Upload d'images
   - [ ] Vérifier dans Supabase

5. **Sécurité RLS**
   - [ ] Tester qu'un utilisateur ne peut pas modifier l'établissement d'un autre
   - [ ] Tester qu'un admin peut tout voir
   - [ ] Tester que les données publiques sont accessibles

## 🔄 Stratégie de Migration Recommandée

### Semaine 1 : Routes de Lecture
- Migrer toutes les routes GET
- Tester la recherche
- Vérifier l'affichage des données

### Semaine 2 : Authentification
- Migrer vers Supabase Auth
- Adapter le middleware
- Tester inscription/connexion

### Semaine 3 : CRUD Établissements
- Migrer création/modification
- Migrer upload images
- Tester le workflow complet

### Semaine 4 : Routes Avancées
- Migrer dashboard
- Migrer admin
- Migrer messaging

## 📚 Ressources

- **Exemples de code** : `docs/EXEMPLE_MIGRATION_API.md`
- **Guide Auth** : `docs/SUPABASE_AUTH_MIGRATION.md`
- **Guide Storage** : `docs/SUPABASE_STORAGE_SETUP.md`
- **Helpers** : `src/lib/supabase/helpers.ts`

## ⚠️ Points d'Attention

1. **Migration Progressive** : Garder Prisma pour les routes non migrées
2. **Tests** : Tester chaque route après migration
3. **RLS** : Les policies sont automatiquement appliquées
4. **Rollback** : Toujours possible tant que Prisma est intact

## 🎯 Objectif Final

- [ ] Toutes les API routes migrées
- [ ] Tous les composants adaptés
- [ ] Tous les tests passent
- [ ] Performance validée
- [ ] Documentation à jour

