# Guide : Migrer votre Première Route

## 🎯 Objectif

Migrer une route simple pour comprendre le processus, puis continuer avec les autres.

## 📋 Route Recommandée : GET /api/etablissements/[slug]

Cette route est idéale pour commencer car :
- Elle est simple (lecture uniquement)
- Elle est importante (affichage des établissements)
- Elle utilise des relations (bon exemple)

## 🔄 Étapes de Migration

### 1. Ouvrir la Route Actuelle

Fichier : `src/app/api/etablissements/[slug]/route.ts`

### 2. Identifier les Requêtes Prisma

Chercher toutes les utilisations de `prisma.` dans le fichier.

### 3. Remplacer par Supabase

**Exemple de transformation** :

**Avant (Prisma)** :
```typescript
const establishment = await prisma.establishment.findUnique({
  where: { slug },
  include: {
    owner: {
      select: {
        id: true,
        firstName: true,
        lastName: true,
        companyName: true
      }
    },
    images: {
      orderBy: { ordre: 'asc' }
    },
    events: {
      where: {
        startDate: { gte: new Date() }
      },
      orderBy: { startDate: 'asc' },
      take: 10
    }
  }
});
```

**Après (Supabase)** :
```typescript
const supabase = createClient();

const { data: establishment, error } = await supabase
  .from('establishments')
  .select(`
    *,
    owner:professionals!establishments_owner_id_fkey (
      id,
      first_name,
      last_name,
      company_name
    ),
    images (
      *
    ),
    events (
      *
    )
  `)
  .eq('slug', slug)
  .eq('status', 'approved')
  .single();

if (error || !establishment) {
  return NextResponse.json(
    { error: 'Établissement non trouvé' },
    { status: 404 }
  );
}

// Filtrer les événements à venir (Supabase ne supporte pas where dans les relations)
const now = new Date().toISOString();
establishment.events = establishment.events?.filter(
  (event: any) => event.start_date >= now
).slice(0, 10) || [];

// Trier les images
establishment.images = establishment.images?.sort(
  (a: any, b: any) => a.ordre - b.ordre
) || [];
```

### 4. Adapter les Noms de Colonnes

**Important** : Supabase utilise `snake_case`, Prisma utilise `camelCase`

- `firstName` → `first_name`
- `lastName` → `last_name`
- `createdAt` → `created_at`
- `updatedAt` → `updated_at`
- `ownerId` → `owner_id`
- etc.

### 5. Gérer les Erreurs

**Avant** :
```typescript
if (!establishment) {
  return NextResponse.json({ error: 'Not found' }, { status: 404 });
}
```

**Après** :
```typescript
if (error || !establishment) {
  return NextResponse.json(
    { error: error?.message || 'Not found' },
    { status: error ? 500 : 404 }
  );
}
```

### 6. Tester la Route

```bash
# Démarrer le serveur
npm run dev

# Tester dans un autre terminal
curl http://localhost:3000/api/etablissements/votre-slug-test
```

### 7. Vérifier dans Supabase

- Aller dans Supabase Dashboard > Table Editor
- Vérifier que les données sont bien récupérées
- Vérifier les logs dans Supabase Dashboard > Logs

## ✅ Checklist

- [ ] Import de `createClient` ajouté
- [ ] Toutes les requêtes Prisma remplacées
- [ ] Noms de colonnes adaptés (snake_case)
- [ ] Gestion d'erreurs ajoutée
- [ ] Relations adaptées (select avec syntaxe Supabase)
- [ ] Filtres et tris adaptés
- [ ] Route testée manuellement
- [ ] Pas d'erreurs dans la console
- [ ] Données correctement retournées

## 🐛 Dépannage

### Erreur "relation does not exist"
- Vérifier que les migrations sont appliquées
- Vérifier le nom de la table (snake_case)

### Erreur "permission denied"
- Vérifier les RLS policies
- Vérifier que l'utilisateur est authentifié si nécessaire

### Données manquantes
- Vérifier les relations (syntaxe Supabase)
- Vérifier les noms de colonnes

## 📝 Exemple Complet

Voir `docs/EXEMPLE_MIGRATION_API.md` pour des exemples complets de routes migrées.

## 🚀 Après la Première Route

Une fois la première route migrée et testée :
1. Noter les patterns récurrents
2. Créer des helpers si nécessaire
3. Continuer avec les autres routes
4. Tester régulièrement

