# Recréation du compte Administrateur

## 📋 Instructions

### 1. Exécuter le script SQL

1. Ouvrir le **Dashboard Supabase** → **SQL Editor**
2. Ouvrir le fichier `scripts/recreate-admin-account.sql`
3. Copier tout le contenu du script
4. Coller dans l'éditeur SQL de Supabase
5. Cliquer sur **Run** (ou `Cmd/Ctrl + Enter`)

### 2. Vérifier la création

Le script affichera des messages de confirmation dans les logs SQL :
- ✅ Compte admin créé avec succès
- ID de l'utilisateur
- Rôles configurés (app_metadata et user_metadata)

### 3. Nettoyer le navigateur

**IMPORTANT** : Avant de vous connecter, vider complètement les données du navigateur :

#### Chrome/Edge :
1. Ouvrir les DevTools (`F12`)
2. Onglet **Application** (ou **Stockage**)
3. **Cookies** → Supprimer tous les cookies `sb-xxx-auth-token`
4. **Local Storage** → Supprimer toutes les entrées
5. **Session Storage** → Supprimer toutes les entrées

#### Firefox :
1. Ouvrir les DevTools (`F12`)
2. Onglet **Stockage**
3. **Cookies** → Supprimer tous les cookies `sb-xxx-auth-token`
4. **Stockage local** → Supprimer toutes les entrées
5. **Stockage de session** → Supprimer toutes les entrées

#### Safari :
1. Ouvrir les DevTools (`Cmd + Option + I`)
2. Onglet **Stockage**
3. Même procédure que Firefox

### 4. Se connecter

1. Aller sur `/auth`
2. Sélectionner **Admin** comme type de compte
3. Email : `envie2sortir.fr@gmail.com`
4. Mot de passe : `Admin123!Secure`
5. Cliquer sur **Connexion**

### 5. Changer le mot de passe (recommandé)

Après la première connexion, changer le mot de passe via :
- Le profil utilisateur dans l'interface admin
- Ou via l'API Supabase Auth

## 🔍 Vérification manuelle (optionnel)

Si vous voulez vérifier manuellement dans Supabase :

```sql
-- Vérifier le compte créé
SELECT 
    id,
    email,
    raw_app_meta_data->>'role' as app_role,
    raw_user_meta_data->>'role' as user_role,
    email_confirmed_at,
    created_at
FROM auth.users
WHERE email = 'envie2sortir.fr@gmail.com';
```

Résultat attendu :
- `app_role` : `admin`
- `user_role` : `admin`
- `email_confirmed_at` : Date de création

## ⚠️ Dépannage

### Erreur : "extension pgcrypto does not exist"
Le script active automatiquement l'extension. Si l'erreur persiste, exécuter manuellement :
```sql
CREATE EXTENSION IF NOT EXISTS pgcrypto;
```

### Erreur : "duplicate key value violates unique constraint"
L'ancien compte n'a pas été supprimé. Vérifier et supprimer manuellement :
```sql
SELECT id, email FROM auth.users WHERE email = 'envie2sortir.fr@gmail.com';
DELETE FROM auth.users WHERE email = 'envie2sortir.fr@gmail.com';
```

### Le compte est créé mais la connexion échoue
1. Vérifier que les cookies ont bien été supprimés
2. Vérifier que le mot de passe est correct : `Admin123!Secure`
3. Vérifier les logs du navigateur (Console) pour les erreurs
4. Vérifier les logs serveur pour les erreurs d'authentification

## 📝 Notes

- Le script supprime **uniquement** le compte avec l'email `envie2sortir.fr@gmail.com`
- Les autres comptes ne sont pas affectés
- Le mot de passe par défaut est temporaire et doit être changé après la première connexion
- Les métadonnées sont configurées pour que le rôle soit `admin` à la fois dans `app_metadata` et `user_metadata`








