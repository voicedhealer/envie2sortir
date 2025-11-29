# 🚀 Guide de configuration du système de Waitlist Premium

## Étape 4 : Variables d'environnement

Ajoutez ces variables dans votre fichier `.env.local` :

```env
# Date de lancement officiel (format: YYYY-MM-DD)
LAUNCH_DATE=2026-03-15

# Clé API admin pour protéger les routes d'activation
# Générer une clé forte : openssl rand -hex 32
ADMIN_API_KEY=votre-cle-secrete-tres-longue-et-aleatoire

# Configuration Resend pour les emails
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxx
RESEND_FROM_EMAIL=noreply@envie2sortir.fr
```

### Comment obtenir les clés :

1. **ADMIN_API_KEY** : 
   ```bash
   openssl rand -hex 32
   ```
   Ou utilisez un générateur de clé aléatoire en ligne.

2. **RESEND_API_KEY** :
   - Allez sur https://resend.com
   - Créez un compte (gratuit jusqu'à 3000 emails/mois)
   - Allez dans "API Keys"
   - Créez une nouvelle clé
   - Copiez la clé (commence par `re_`)

3. **RESEND_FROM_EMAIL** :
   - Utilisez votre domaine vérifié dans Resend
   - Ou utilisez `onboarding@resend.dev` pour les tests

## Étape 5 : Migration Supabase

### Option A : Via Supabase Dashboard (Recommandé)

1. Allez sur https://supabase.com/dashboard
2. Sélectionnez votre projet
3. Allez dans **SQL Editor**
4. Copiez le contenu de `supabase/migrations/20250127000000_add_waitlist_system.sql`
5. Collez-le dans l'éditeur SQL
6. Cliquez sur **Run**

### Option B : Via Supabase CLI

```bash
# Si vous avez Supabase CLI installé
supabase db push
```

### Vérification

Après la migration, vérifiez que :
- La colonne `premium_activation_date` existe dans la table `professionals`
- La table `subscription_logs` a été créée
- Les contraintes CHECK sont en place

Vous pouvez vérifier dans Supabase Dashboard > Table Editor.

## Étape 6 : Test du système

### 1. Ajouter un professionnel en waitlist (depuis l'admin)

1. Connectez-vous en tant qu'admin
2. Allez sur `/admin/waitlist`
3. Cliquez sur "Ajouter un professionnel"
4. Remplissez le formulaire avec les données du professionnel
5. Le mot de passe sera généré automatiquement si vous ne le remplissez pas
6. Cliquez sur "Créer en waitlist"

### 2. Vérifier dans Supabase

- Allez dans Supabase Dashboard > Table Editor > `professionals`
- Vérifiez que le nouveau professionnel a `subscription_plan = 'WAITLIST_BETA'`
- Vérifiez que l'établissement associé a `subscription = 'WAITLIST_BETA'`
- Vérifiez qu'un log a été créé dans `subscription_logs`

### 3. Tester le panel admin

1. Connectez-vous en tant qu'admin
2. Allez sur `/admin` ou `/admin/waitlist`
3. Vous devriez voir le "Panel d'activation du lancement"
4. Vérifiez que le compteur de waitlist s'affiche
5. La liste des professionnels en waitlist doit s'afficher

### 4. Tester l'activation (⚠️ Attention : crée des abonnements Stripe)

⚠️ **IMPORTANT** : Ne testez l'activation que si vous êtes sûr, car cela va :
- Créer des abonnements Stripe réels
- Convertir tous les WAITLIST_BETA en PREMIUM
- Démarrer la facturation

Pour tester en mode sandbox :
1. Assurez-vous d'utiliser les clés Stripe de test
2. Créez quelques comptes de test en waitlist
3. Testez l'activation

## 🎉 C'est prêt !

Votre système de waitlist est maintenant opérationnel. Les professionnels peuvent :
- S'inscrire à la waitlist via `/wait`
- Bénéficier du premium gratuitement jusqu'au lancement
- Être automatiquement activés quand vous déclenchez le lancement

## 📝 Notes importantes

- Les emails ne seront envoyés qu'en production si `RESEND_API_KEY` est configuré
- En développement, les emails sont loggés dans la console
- La date de lancement peut être modifiée dans `LAUNCH_DATE`
- Les professionnels en waitlist ont accès à toutes les fonctionnalités premium

