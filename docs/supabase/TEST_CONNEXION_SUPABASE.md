# Tester la Connexion Supabase

## 🧪 Script de Test

Un script de test a été créé pour vérifier que votre configuration Supabase fonctionne.

### Exécuter le Test

```bash
# Installer dotenv si nécessaire
npm install dotenv

# Exécuter le script de test
npx tsx scripts/test-supabase-connection.ts
```

### Ce que le Script Vérifie

1. **Variables d'environnement** : Vérifie que `NEXT_PUBLIC_SUPABASE_URL` et `NEXT_PUBLIC_SUPABASE_ANON_KEY` sont définies
2. **Connexion** : Teste la connexion à la base de données
3. **Authentification** : Vérifie que le service d'authentification est accessible
4. **Storage** : Vérifie que le service de stockage est accessible

### Résultats Attendus

#### ✅ Si Tout Fonctionne
```
✅ Variables d'environnement trouvées
✅ Connexion réussie !
✅ Service d'authentification accessible
✅ Service de stockage accessible

🎉 Configuration Supabase valide !
```

#### ⚠️ Si les Tables N'Existent Pas Encore
C'est normal si vous n'avez pas encore appliqué les migrations SQL :
```
⚠️  Les tables n'existent pas encore (normal si migrations pas appliquées)
💡 Appliquez les migrations SQL dans Supabase Dashboard > SQL Editor
```

#### ❌ Si Erreur de Configuration
```
❌ ERREUR: NEXT_PUBLIC_SUPABASE_URL n'est pas définie
💡 Ajoutez: NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
```

## 🔧 Dépannage

### Erreur "NEXT_PUBLIC_SUPABASE_URL n'est pas définie"
- Vérifier que `.env.local` existe dans la racine du projet
- Vérifier que la variable est bien écrite (sans espaces, sans guillemets)
- Redémarrer le terminal après modification de `.env.local`

### Erreur "Invalid API key"
- Vérifier que la clé est correctement copiée (pas d'espaces avant/après)
- Vérifier que vous utilisez la clé "anon" (pas "service_role")
- Vérifier que le projet Supabase est actif (pas en pause)

### Erreur de Connexion
- Vérifier votre connexion internet
- Vérifier que l'URL du projet est correcte
- Vérifier que le projet Supabase n'est pas en pause

## 📝 Prochaines Étapes

Une fois le test réussi :

1. **Appliquer les migrations SQL**
   - Aller dans Supabase Dashboard > SQL Editor
   - Exécuter les fichiers dans l'ordre :
     - `supabase/migrations/001_initial_schema.sql`
     - `supabase/migrations/002_rls_policies.sql`
     - `supabase/migrations/003_storage_setup.sql`

2. **Tester à nouveau**
   - Relancer le script de test
   - Vérifier que les tables sont créées

3. **Commencer la migration du code**
   - Voir `docs/EXEMPLE_MIGRATION_API.md`

