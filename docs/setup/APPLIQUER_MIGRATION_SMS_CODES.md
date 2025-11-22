# Guide : Appliquer la migration pour les codes SMS

## Problème résolu

Le stockage des codes SMS en mémoire (Map) ne fonctionnait pas car Next.js exécute les routes API dans des workers séparés, et la Map n'est pas partagée entre les workers.

**Solution** : Utilisation de Supabase pour stocker les codes SMS temporairement dans une table dédiée.

## Migration à appliquer

Fichier : `supabase/migrations/009_create_sms_verification_codes.sql`

## Étapes pour appliquer la migration

### Option 1 : Via Supabase Dashboard (Recommandé)

1. Connectez-vous à votre projet Supabase : https://supabase.com/dashboard
2. Allez dans **SQL Editor**
3. Cliquez sur **New query**
4. Copiez-collez le contenu de `supabase/migrations/009_create_sms_verification_codes.sql`
5. Cliquez sur **Run** (ou `Cmd/Ctrl + Enter`)

### Option 2 : Via Supabase CLI

```bash
npx supabase db push
```

## Vérification

Après avoir appliqué la migration, vérifiez que la table existe :

1. Dans Supabase Dashboard, allez dans **Table Editor**
2. Vous devriez voir la table `sms_verification_codes`

## Fonctionnement

- Les codes SMS sont maintenant stockés dans Supabase au lieu d'une Map en mémoire
- Chaque code a une expiration (10 minutes)
- Les codes expirés sont automatiquement filtrés lors de la récupération
- Les codes sont supprimés après vérification réussie
- Les anciens codes sont supprimés lorsqu'un nouveau code est généré pour le même utilisateur

## Test

1. Demandez un nouveau code SMS
2. Vérifiez les logs du terminal - vous devriez voir "💾 [SMS Store] Code stocké dans Supabase"
3. Entrez le code - il devrait être trouvé et vérifié avec succès

