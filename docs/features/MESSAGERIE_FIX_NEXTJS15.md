# Fix : Erreur Next.js 15 - Params dynamiques

## Problème

Lors de la déconnexion (ou n'importe quelle navigation), une erreur apparaissait dans le terminal :

```
Error: Route "/api/messaging/conversations/[id]/read" used `params.id`. 
`params` should be awaited before using its properties.
```

## Cause

Next.js 15 a introduit un changement dans la façon dont les paramètres dynamiques sont gérés dans les routes API. Les `params` doivent maintenant être `await`és avant d'accéder à leurs propriétés.

### Ancienne signature (Next.js 14)

```typescript
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const conversation = await prisma.conversation.findUnique({
    where: { id: params.id },  // ❌ Erreur dans Next.js 15
  });
}
```

### Nouvelle signature (Next.js 15)

```typescript
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }  // Promise !
) {
  const { id } = await params;  // ✅ Await requis
  
  const conversation = await prisma.conversation.findUnique({
    where: { id },  // ✅ Utiliser la variable
  });
}
```

## Fichiers corrigés

### Routes API

1. ✅ `/api/messaging/conversations/[id]/route.ts`
2. ✅ `/api/messaging/conversations/[id]/messages/route.ts`
3. ✅ `/api/messaging/conversations/[id]/read/route.ts`
4. ✅ `/api/messaging/conversations/[id]/status/route.ts`

### Tests

1. ✅ `src/__tests__/messaging/messaging-api-security.test.ts`
2. ✅ `src/__tests__/messaging/messaging-integration.test.ts`
3. ✅ `src/__tests__/messaging/messaging-performance.test.ts`

## Changements appliqués

### Dans les routes API

**Avant** :
```typescript
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const conversation = await prisma.conversation.findUnique({
    where: { id: params.id },
  });
}
```

**Après** :
```typescript
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  
  const conversation = await prisma.conversation.findUnique({
    where: { id },
  });
}
```

### Dans les tests

**Avant** :
```typescript
const response = await getConversation(request, {
  params: { id: "conv123" },
});
```

**Après** :
```typescript
const response = await getConversation(request, {
  params: Promise.resolve({ id: "conv123" }),
});
```

## Vérification

L'erreur ne devrait plus apparaître dans le terminal lors de la déconnexion ou de la navigation.

### Test rapide

```bash
# 1. Démarrer le serveur
npm run dev

# 2. Se connecter en tant qu'admin
# 3. Se déconnecter
# 4. Vérifier le terminal : aucune erreur !
```

### Exécuter les tests

```bash
# Tests de messagerie
npm run test:messaging

# Tous les tests devraient passer
```

## Ressources

- [Next.js 15 - Dynamic APIs](https://nextjs.org/docs/messages/sync-dynamic-apis)
- [Next.js 15 - Route Handlers](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)

## Note

Ce changement est obligatoire pour Next.js 15+. Il fait partie d'une migration vers des APIs plus prédictibles et sécurisées.

---

**Statut** : ✅ Corrigé  
**Date** : Octobre 2025  
**Version Next.js** : 15.4.7

