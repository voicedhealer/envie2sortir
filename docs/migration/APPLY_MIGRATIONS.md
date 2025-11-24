# Guide d'application des migrations Supabase

## 🚨 Important : Aucune table n'existe encore

Vous devez appliquer **toutes les migrations** dans l'ordre pour créer la base de données complète.

## Méthode recommandée : Supabase CLI

```bash
# Depuis la racine du projet
supabase db push
```

## Méthode alternative : Interface Supabase

### Étape 1 : Accéder au SQL Editor
1. Allez sur https://supabase.com/dashboard
2. Sélectionnez votre projet
3. Cliquez sur "SQL Editor" dans le menu de gauche

### Étape 2 : Appliquer les migrations dans l'ordre

**Migration 001 - Schéma initial (OBLIGATOIRE EN PREMIER)**
```sql
-- Copiez-collez le contenu de: supabase/migrations/001_initial_schema.sql
-- Cette migration crée toutes les tables de base
```

**Migration 002 - Politiques RLS**
```sql
-- Copiez-collez le contenu de: supabase/migrations/002_rls_policies.sql
```

**Migration 003 - Configuration Storage**
```sql
-- Copiez-collez le contenu de: supabase/migrations/003_storage_setup.sql
```

**Continuez avec toutes les autres migrations dans l'ordre :**
- 004_make_password_hash_nullable.sql
- 005_fix_establishments_rls.sql
- 006_enable_rls_additional_tables.sql
- 007_add_images_bucket.sql
- 008_fix_professionals_rls.sql
- 009_create_sms_verification_codes.sql
- 010_fix_daily_deals_rls.sql
- 011_create_admin_user.sql
- 012_create_security_events_table.sql
- 013_fix_admin_establishments_access.sql
- 014_fix_click_analytics_rls.sql
- 015_fix_messages_rls.sql
- 016_fix_messages_rls_with_function.sql
- 016_verify_function_and_policy.sql
- 017_use_jwt_for_admin_check.sql
- 018_fix_jwt_policy_alternative.sql
- 019_final_fix_messages_rls.sql
- 020_rpc_unread_count.sql
- **021_create_contact_messages.sql** (dernière - pour le formulaire de contact)

### Étape 3 : Vérifier que tout fonctionne

Après avoir appliqué toutes les migrations, vérifiez que les tables existent :

```sql
-- Dans le SQL Editor, exécutez :
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

Vous devriez voir toutes les tables, y compris `contact_messages`.

## ⚠️ Erreurs courantes

### "relation does not exist"
- **Cause** : Les migrations n'ont pas été appliquées dans l'ordre
- **Solution** : Commencez par la migration 001, puis continuez dans l'ordre

### "permission denied"
- **Cause** : Problème de RLS (Row Level Security)
- **Solution** : Assurez-vous d'avoir appliqué toutes les migrations RLS (002, 005, 006, etc.)

### "duplicate key value"
- **Cause** : Migration déjà appliquée partiellement
- **Solution** : Vérifiez l'état des migrations dans Supabase Dashboard > Database > Migrations

## 📝 Vérification finale

Une fois toutes les migrations appliquées, testez le formulaire de contact :
1. Allez sur `/contact`
2. Remplissez le formulaire
3. Envoyez le message
4. Vérifiez dans Supabase que le message apparaît dans la table `contact_messages`

