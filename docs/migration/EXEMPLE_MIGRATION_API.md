# Exemple de Migration d'API Route

Ce document montre comment migrer une API route de Prisma vers Supabase.

## Exemple : GET /api/etablissements/[slug]

### Avant (Prisma)

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  
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
      },
      comments: {
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatar: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 10
      }
    }
  });
  
  if (!establishment) {
    return NextResponse.json(
      { error: 'Établissement non trouvé' },
      { status: 404 }
    );
  }
  
  return NextResponse.json(establishment);
}
```

### Après (Supabase)

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const supabase = createClient();
  
  // Récupérer l'établissement avec relations
  const { data: establishment, error: establishmentError } = await supabase
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
      ),
      comments:user_comments (
        *,
        user:users (
          id,
          first_name,
          last_name,
          avatar
        )
      )
    `)
    .eq('slug', slug)
    .eq('status', 'approved') // RLS devrait gérer ça, mais on filtre aussi
    .single();
  
  if (establishmentError || !establishment) {
    return NextResponse.json(
      { error: 'Établissement non trouvé' },
      { status: 404 }
    );
  }
  
  // Filtrer les événements à venir (Supabase ne supporte pas les where dans les relations)
  const now = new Date().toISOString();
  establishment.events = establishment.events?.filter(
    (event: any) => event.start_date >= now
  ).slice(0, 10) || [];
  
  // Trier les images
  establishment.images = establishment.images?.sort(
    (a: any, b: any) => a.ordre - b.ordre
  ) || [];
  
  // Trier les commentaires
  establishment.comments = establishment.comments?.sort(
    (a: any, b: any) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  ).slice(0, 10) || [];
  
  return NextResponse.json(establishment);
}
```

## Exemple : POST /api/etablissements

### Avant (Prisma)

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user || session.user.userType !== 'professional') {
    return NextResponse.json(
      { error: 'Non autorisé' },
      { status: 401 }
    );
  }
  
  const body = await request.json();
  
  // Vérifier que le professionnel n'a pas déjà un établissement
  const existing = await prisma.establishment.findUnique({
    where: { ownerId: session.user.id }
  });
  
  if (existing) {
    return NextResponse.json(
      { error: 'Vous avez déjà un établissement' },
      { status: 400 }
    );
  }
  
  const establishment = await prisma.establishment.create({
    data: {
      name: body.name,
      slug: body.slug,
      description: body.description,
      address: body.address,
      city: body.city,
      postalCode: body.postalCode,
      ownerId: session.user.id,
      status: 'pending'
    }
  });
  
  return NextResponse.json(establishment);
}
```

### Après (Supabase)

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/supabase/helpers';

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  
  if (!user || user.userType !== 'professional') {
    return NextResponse.json(
      { error: 'Non autorisé' },
      { status: 401 }
    );
  }
  
  const body = await request.json();
  const supabase = createClient();
  
  // Vérifier que le professionnel n'a pas déjà un établissement
  const { data: existing } = await supabase
    .from('establishments')
    .select('id')
    .eq('owner_id', user.id)
    .single();
  
  if (existing) {
    return NextResponse.json(
      { error: 'Vous avez déjà un établissement' },
      { status: 400 }
    );
  }
  
  const { data: establishment, error } = await supabase
    .from('establishments')
    .insert({
      name: body.name,
      slug: body.slug,
      description: body.description,
      address: body.address,
      city: body.city,
      postal_code: body.postalCode,
      owner_id: user.id,
      status: 'pending'
    })
    .select()
    .single();
  
  if (error) {
    console.error('Error creating establishment:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création' },
      { status: 500 }
    );
  }
  
  return NextResponse.json(establishment);
}
```

## Points Clés de la Migration

### 1. Remplacement de Prisma par Supabase

**Avant** :
```typescript
import { prisma } from '@/lib/prisma';
const data = await prisma.table.findUnique({ where: { id } });
```

**Après** :
```typescript
import { createClient } from '@/lib/supabase/server';
const supabase = createClient();
const { data } = await supabase.from('table').select('*').eq('id', id).single();
```

### 2. Authentification

**Avant** :
```typescript
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
const session = await getServerSession(authOptions);
```

**Après** :
```typescript
import { getCurrentUser } from '@/lib/supabase/helpers';
const user = await getCurrentUser();
```

### 3. Relations

**Avant** :
```typescript
include: {
  owner: { select: { ... } },
  images: { ... }
}
```

**Après** :
```typescript
.select(`
  *,
  owner:professionals!establishments_owner_id_fkey (...),
  images (...)
`)
```

### 4. Filtres et Tri

**Avant** :
```typescript
where: { status: 'approved' },
orderBy: { createdAt: 'desc' },
take: 10
```

**Après** :
```typescript
.eq('status', 'approved')
.order('created_at', { ascending: false })
.limit(10)
```

### 5. Gestion d'Erreurs

**Avant** :
```typescript
const data = await prisma.table.findUnique({ where: { id } });
if (!data) { ... }
```

**Après** :
```typescript
const { data, error } = await supabase
  .from('table')
  .select('*')
  .eq('id', id)
  .single();

if (error || !data) { ... }
```

## Checklist de Migration

Pour chaque API route :

- [ ] Remplacer `prisma` par `createClient()`
- [ ] Adapter les requêtes Prisma vers Supabase
- [ ] Remplacer `getServerSession` par `getCurrentUser`
- [ ] Adapter les relations (include → select)
- [ ] Adapter les filtres (where → eq/gt/lt/etc.)
- [ ] Adapter les tris (orderBy → order)
- [ ] Adapter la pagination (take/skip → limit/range)
- [ ] Gérer les erreurs Supabase
- [ ] Tester la route
- [ ] Vérifier les permissions RLS

## Notes Importantes

1. **RLS** : Les policies RLS sont automatiquement appliquées, pas besoin de vérifier manuellement
2. **Noms de colonnes** : Supabase utilise snake_case, Prisma utilisait camelCase
3. **Relations** : Utiliser la syntaxe Supabase avec les clés étrangères
4. **Types** : Générer les types TypeScript avec `supabase gen types`

