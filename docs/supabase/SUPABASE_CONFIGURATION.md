# Configuration Supabase

Ce guide explique comment configurer les variables d'environnement Supabase nécessaires pour la branche `migration-supabase`.

## Variables d'environnement requises

Pour que l'application fonctionne avec Supabase, vous devez configurer les variables suivantes dans votre fichier `.env.local` :

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre-clé-anon-publique
SUPABASE_SERVICE_ROLE_KEY=votre-clé-service-role-secrète
```

## Où trouver ces valeurs

### 1. NEXT_PUBLIC_SUPABASE_URL
- Allez sur [supabase.com](https://supabase.com)
- Connectez-vous à votre projet
- Allez dans **Settings** → **API**
- Copiez l'**URL du projet** (ex: `https://xxxxx.supabase.co`)

### 2. NEXT_PUBLIC_SUPABASE_ANON_KEY
- Dans la même page **Settings** → **API**
- Copiez la clé **anon/public** (c'est la clé publique, elle peut être exposée côté client)

### 3. SUPABASE_SERVICE_ROLE_KEY
- Toujours dans **Settings** → **API**
- Copiez la clé **service_role** (⚠️ **ATTENTION** : Cette clé est secrète et ne doit JAMAIS être exposée côté client)
- Cette clé permet d'effectuer des opérations administratives (création de comptes, suppression d'utilisateurs, etc.)

## Configuration du fichier .env.local

1. Créez un fichier `.env.local` à la racine du projet (s'il n'existe pas déjà)
2. Ajoutez les variables ci-dessus avec vos valeurs réelles
3. Redémarrez le serveur de développement (`npm run dev`)

## Vérification de la configuration

Pour vérifier que votre configuration est correcte, vous pouvez :

1. Vérifier les logs du serveur au démarrage
2. Tester la création d'un établissement depuis l'interface
3. Vérifier que les erreurs "Configuration Supabase manquante" ont disparu

## Sécurité

⚠️ **IMPORTANT** :
- Ne commitez JAMAIS le fichier `.env.local` dans Git
- La clé `SUPABASE_SERVICE_ROLE_KEY` est très sensible et doit rester secrète
- Les variables `NEXT_PUBLIC_*` sont exposées côté client, mais `SUPABASE_SERVICE_ROLE_KEY` ne doit jamais être préfixée avec `NEXT_PUBLIC_`

## Dépannage

### Erreur : "Configuration Supabase manquante"
- Vérifiez que toutes les variables sont définies dans `.env.local`
- Vérifiez que les noms des variables sont exactement comme indiqué ci-dessus
- Redémarrez le serveur après avoir modifié `.env.local`

### Erreur : "cookies() should be awaited"
- Cette erreur a été corrigée dans le code
- Assurez-vous d'avoir la dernière version du code
- Redémarrez le serveur

## Migration depuis Prisma

Si vous migrez depuis Prisma vers Supabase, assurez-vous que :
1. Les tables Supabase sont créées (via les migrations dans `/supabase/migrations`)
2. Les données sont migrées si nécessaire
3. Les variables d'environnement sont correctement configurées





