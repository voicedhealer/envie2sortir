# Guide : Création d'un compte administrateur

Pour vous connecter en tant qu'admin, vous devez créer un compte dans Supabase Auth ET définir le rôle 'admin' dans la table `users`.

## Méthode 1 : Via l'interface Supabase (Recommandée)

### Étape 1 : Créer un utilisateur dans Supabase Auth

1. Allez dans votre dashboard Supabase
2. Naviguez vers **Authentication** > **Users**
3. Cliquez sur **Add user** > **Create new user**
4. Remplissez :
   - **Email** : votre email (ex: `admin@envie2sortir.com`)
   - **Password** : votre mot de passe
   - **Auto Confirm User** : ✅ Cochez cette case
5. Cliquez sur **Create user**
6. **Notez l'UUID** de l'utilisateur créé (visible dans la liste des users)

### Étape 2 : Créer l'enregistrement dans la table `users`

⚠️ **IMPORTANT** : L'ID dans la table `users` doit être **exactement le même** que l'UUID de l'utilisateur créé dans Supabase Auth.

1. Allez dans **Table Editor** > **users**
2. Cliquez sur **Insert** > **Insert row**
3. Remplissez les champs :
   - **id** : L'UUID que vous avez noté à l'étape 1 (⚠️ **CRITIQUE** : doit correspondre exactement à l'UUID de Supabase Auth)
   - **email** : Le même email que dans Supabase Auth (doit correspondre exactement)
   - **first_name** : Votre prénom
   - **last_name** : Votre nom
   - **name** : Votre nom complet
   - **role** : `admin` (⚠️ Important : sélectionnez 'admin' dans le menu déroulant)
   - **is_verified** : `true`
4. Cliquez sur **Save**

### Étape 3 : Vérifier

1. Allez dans **Table Editor** > **users**
2. Filtrez par `role = 'admin'`
3. Vous devriez voir votre utilisateur avec le rôle admin

## Méthode 2 : Via SQL (Alternative)

### Étape 1 : Créer l'utilisateur dans Supabase Auth (comme dans la Méthode 1)

### Étape 2 : Exécuter le script SQL

1. Allez dans **SQL Editor** dans Supabase
2. Exécutez ce script en remplaçant les valeurs :

```sql
-- Remplacez ces valeurs :
-- - 'VOTRE_UUID_AUTH' par l'UUID de l'utilisateur créé dans Supabase Auth
-- - 'VOTRE_EMAIL@exemple.com' par votre email
-- - 'Votre Prénom' et 'Votre Nom' par vos informations

INSERT INTO users (
    id,
    email,
    first_name,
    last_name,
    name,
    role,
    is_verified,
    created_at,
    updated_at
) VALUES (
    'VOTRE_UUID_AUTH',  -- UUID de l'utilisateur créé dans Supabase Auth
    'VOTRE_EMAIL@exemple.com',
    'Votre Prénom',
    'Votre Nom',
    'Votre Prénom Votre Nom',
    'admin',
    true,
    now(),
    now()
) ON CONFLICT (email) DO UPDATE SET role = 'admin';
```

### Étape 3 : Mettre à jour un utilisateur existant (si vous avez déjà un compte)

Si vous avez déjà créé un compte utilisateur normal et que vous voulez le transformer en admin :

```sql
-- Remplacez 'VOTRE_EMAIL@exemple.com' par l'email de votre compte
UPDATE users 
SET role = 'admin', 
    is_verified = true,
    updated_at = now()
WHERE email = 'VOTRE_EMAIL@exemple.com';
```

## Méthode 3 : Créer directement avec mot de passe hashé (Avancé)

Si vous préférez créer l'utilisateur directement dans la table `users` avec un mot de passe hashé :

1. Générez un hash bcrypt de votre mot de passe (utilisez https://bcrypt-generator.com/ ou Node.js)
2. Exécutez ce script SQL :

```sql
INSERT INTO users (
    email,
    password_hash,
    first_name,
    last_name,
    name,
    role,
    is_verified,
    created_at,
    updated_at
) VALUES (
    'admin@envie2sortir.com',
    'VOTRE_HASH_MOT_DE_PASSE',  -- Hash bcrypt de votre mot de passe
    'Admin',
    'Envie2Sortir',
    'Admin Envie2Sortir',
    'admin',
    true,
    now(),
    now()
) ON CONFLICT (email) DO UPDATE SET role = 'admin';
```

⚠️ **Note** : Cette méthode nécessite aussi de créer l'utilisateur dans Supabase Auth pour que l'authentification fonctionne correctement.

## Vérification

Après avoir créé votre compte admin, vérifiez que tout fonctionne :

1. Allez sur votre site : `/auth`
2. Sélectionnez le rôle **Admin**
3. Connectez-vous avec votre email et mot de passe
4. Vous devriez être redirigé vers `/admin`

## Dépannage

### Erreur : "Access Denied" ou redirection vers `/auth`

- Vérifiez que le champ `role` dans la table `users` est bien défini à `'admin'` (pas `'user'`)
- Vérifiez que l'email dans la table `users` correspond exactement à l'email dans Supabase Auth
- Vérifiez que l'UUID dans la table `users` correspond à l'UUID dans Supabase Auth (si vous utilisez la Méthode 1)

### Erreur : "User not found"

- Vérifiez que l'utilisateur existe bien dans Supabase Auth
- Vérifiez que l'enregistrement existe dans la table `users`

### Erreur : "Invalid credentials"

- Vérifiez que le mot de passe est correct
- Si vous utilisez la Méthode 3, vérifiez que le hash bcrypt est correct

## Notes importantes

- Le système utilise **Supabase Auth** pour l'authentification, donc vous devez créer l'utilisateur dans Supabase Auth
- Le rôle `'admin'` doit être défini dans la table `users` pour accéder au dashboard admin
- ⚠️ **CRITIQUE** : L'ID (UUID) dans la table `users` doit être **exactement le même** que l'UUID de l'utilisateur dans Supabase Auth
- L'email dans Supabase Auth et dans la table `users` doit correspondre exactement
- Le système vérifie l'utilisateur en comparant `authUser.id` (de Supabase Auth) avec `users.id` (de la table users)

