# Guide de Débogage - Inscription Établissement

## 🔍 Comment Voir les Erreurs Détaillées

### 1. Console du Navigateur

Ouvrez la console du navigateur (F12 ou Cmd+Option+I sur Mac) et regardez dans l'onglet **Console**. Les erreurs détaillées sont maintenant affichées avec :
- `❌ Erreur API:` - La réponse complète de l'API
- `❌ Détails:` - Le message d'erreur détaillé
- `❌ Stack:` - La stack trace (en mode développement)

### 2. Logs du Serveur Next.js

Les logs du serveur s'affichent dans le terminal où vous avez lancé `npm run dev`. Vous devriez voir :
- `❌ Erreur inscription professionnelle:` - L'erreur complète
- `❌ Error message:` - Le message d'erreur
- `❌ Error details:` - Les détails de l'erreur Supabase

### 3. Erreurs Courantes et Solutions

#### Erreur : "Configuration Supabase manquante"
**Solution** : Vérifiez que `.env.local` contient :
```env
NEXT_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

#### Erreur : "Un compte avec cet email existe déjà"
**Solution** : L'email est déjà utilisé. Connectez-vous avec ce compte ou utilisez un autre email.

#### Erreur : "Ce SIRET est déjà utilisé"
**Solution** : Le SIRET est déjà enregistré. Connectez-vous avec le compte existant.

#### Erreur : "Erreur lors de la vérification de l'email"
**Solution** : Problème de connexion à Supabase. Vérifiez :
1. Que Supabase est accessible
2. Que les clés API sont correctes
3. Que la base de données est bien configurée

#### Erreur : "Erreur de validation des données"
**Solution** : Un champ requis est manquant ou invalide. Vérifiez :
- Tous les champs obligatoires sont remplis
- Les formats de données sont corrects (email, téléphone, etc.)

### 4. Tester la Connexion Supabase

Pour vérifier que Supabase fonctionne, testez cette route :
```bash
curl http://localhost:3000/api/monitoring/health
```

Elle devrait retourner `{"status":"healthy"}`.

### 5. Vérifier les Logs Détaillés

Si vous ne voyez pas les erreurs dans la console du navigateur, vérifiez :
1. Que vous êtes en mode développement (`NODE_ENV=development`)
2. Que la console du navigateur n'est pas filtrée (afficher toutes les erreurs)
3. Que les logs du serveur sont visibles dans le terminal

### 6. Problèmes de Migration

Si l'erreur vient de la migration Prisma → Supabase :
1. Vérifiez que toutes les migrations Supabase sont appliquées
2. Vérifiez que le schéma de la base de données correspond au code
3. Vérifiez que les RLS policies permettent les insertions

### 7. Contact Support

Si le problème persiste :
1. Copiez les logs complets (console navigateur + serveur)
2. Notez les étapes pour reproduire l'erreur
3. Vérifiez que toutes les variables d'environnement sont configurées

