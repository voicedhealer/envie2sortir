# Résolution : Email Déjà Utilisé

## 🔍 Problème

L'erreur "Cet email est déjà utilisé" apparaît lors de l'inscription d'un établissement.

## 💡 Causes Possibles

1. **Tentative d'inscription précédente** : Une tentative précédente a créé un compte partiel (Auth mais pas de professional, ou vice versa)
2. **Migration password_hash non appliquée** : Si la migration n'a pas été appliquée, les tentatives précédentes ont échoué mais ont laissé des traces
3. **Compte existant** : Vous avez déjà un compte avec cet email

## ✅ Solutions

### Solution 1 : Nettoyer les Comptes de Test (Recommandé)

1. **Vérifier les comptes existants** :
   ```bash
   npm run cleanup:test-professionals
   ```

2. **Supprimer les comptes de test** :
   ```bash
   npm run cleanup:test-professionals -- --delete
   ```

3. **Réessayer l'inscription**

### Solution 2 : Appliquer la Migration password_hash

Si vous ne l'avez pas encore fait :

1. **Aller sur le Dashboard Supabase** : https://supabase.com/dashboard
2. **SQL Editor** → **New query**
3. **Exécuter** :
   ```sql
   ALTER TABLE professionals 
   ALTER COLUMN password_hash DROP NOT NULL;
   ```
4. **Réessayer l'inscription**

### Solution 3 : Utiliser un Autre Email

Si vous voulez simplement tester, utilisez un autre email :
- `test1@example.com`
- `test2@example.com`
- etc.

### Solution 4 : Se Connecter avec le Compte Existant

Si vous avez déjà un compte :
1. Allez sur la page de connexion
2. Connectez-vous avec votre email et mot de passe
3. Si vous avez oublié le mot de passe, utilisez "Mot de passe oublié"

## 🔍 Vérification

Pour vérifier si un compte existe vraiment :

1. **Dashboard Supabase** → **Authentication** → **Users**
2. Cherchez votre email
3. Si trouvé, vous pouvez :
   - Supprimer le compte
   - Réinitialiser le mot de passe
   - Vérifier les détails

## 📝 Note

Le script `cleanup:test-professionals` supprime :
- Les professionnels avec l'email de test
- Les établissements associés
- Les comptes Auth correspondants

**⚠️ Attention** : Ce script supprime définitivement les données. Utilisez-le uniquement pour les comptes de test.

