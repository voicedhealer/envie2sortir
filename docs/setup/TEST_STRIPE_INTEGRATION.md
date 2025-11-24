# Guide de Test - Intégration Stripe

Ce guide vous permet de tester rapidement l'intégration Stripe pour les abonnements Premium.

## ✅ Vérification préalable

Avant de tester, assurez-vous que :

1. ✅ Les variables d'environnement sont configurées dans `.env.local` :
   - `STRIPE_SECRET_KEY`
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
   - `STRIPE_PRICE_ID_MONTHLY`
   - `STRIPE_PRICE_ID_ANNUAL`
   - `STRIPE_WEBHOOK_SECRET`

2. ✅ La migration Supabase a été exécutée (colonnes `stripe_customer_id` et `stripe_subscription_id`)

3. ✅ Le serveur de développement est redémarré après l'ajout des variables d'environnement

## 🧪 Tests à effectuer

### Test 1 : Vérifier la configuration Stripe

1. Démarrez votre serveur de développement :
   ```bash
   npm run dev
   ```

2. Vérifiez que Stripe est bien configuré en consultant les logs au démarrage
   - Aucune erreur concernant les variables Stripe manquantes

### Test 2 : Inscription avec plan Premium

1. Allez sur la page d'inscription professionnelle
2. Remplissez le formulaire
3. **Sélectionnez le plan Premium**
4. Complétez l'inscription
5. **Résultat attendu** : Redirection vers Stripe Checkout

### Test 3 : Paiement avec carte de test

Dans Stripe Checkout, utilisez une carte de test :

**Carte de test pour succès :**
- Numéro : `4242 4242 4242 4242`
- Date d'expiration : `12/25` (ou toute date future)
- CVC : `123` (ou n'importe quel code à 3 chiffres)
- Code postal : `75001` (ou n'importe quel code postal)

**Résultat attendu** :
- Paiement accepté
- Redirection vers `/dashboard/subscription?success=true`
- Abonnement Premium activé dans votre compte

### Test 4 : Gestion de l'abonnement

1. Connectez-vous au dashboard professionnel
2. Cliquez sur "Gérer l'abonnement" dans le header
3. Vérifiez que :
   - Le statut Premium est affiché
   - Les dates de période sont correctes
   - Vous pouvez annuler/réactiver l'abonnement

### Test 5 : Choix entre mensuel et annuel

1. Si vous n'avez pas d'abonnement, allez sur `/dashboard/subscription`
2. Vérifiez que vous pouvez choisir entre :
   - Plan Mensuel (29,90€/mois)
   - Plan Annuel (305€/an, -15%)
3. Sélectionnez un plan et testez le checkout

### Test 6 : Webhook Stripe (en local)

1. Démarrez Stripe CLI dans un terminal séparé :
   ```bash
   stripe listen --forward-to localhost:3000/api/stripe/webhook
   ```

2. Effectuez un paiement de test
3. Vérifiez dans la console Stripe CLI que les événements sont reçus :
   - `checkout.session.completed`
   - `customer.subscription.created`

4. Vérifiez dans votre base Supabase que :
   - `stripe_customer_id` est rempli dans la table `professionals`
   - `stripe_subscription_id` est rempli
   - `subscription_plan` est passé à `PREMIUM`

## 🐛 Dépannage

### Erreur : "Stripe n'est pas configuré"

**Solution** : Vérifiez que toutes les variables d'environnement sont présentes dans `.env.local` et redémarrez le serveur.

### Erreur : "Price ID not found"

**Solution** : Vérifiez que `STRIPE_PRICE_ID_MONTHLY` et `STRIPE_PRICE_ID_ANNUAL` sont corrects et commencent par `price_`.

### Le webhook ne fonctionne pas

**Solution** :
1. Vérifiez que Stripe CLI est en cours d'exécution (en local)
2. Vérifiez que `STRIPE_WEBHOOK_SECRET` est correct
3. Vérifiez les logs du serveur pour voir les erreurs

### L'abonnement n'est pas activé après le paiement

**Solution** :
1. Vérifiez que le webhook est bien configuré
2. Vérifiez dans Stripe Dashboard > Webhooks que les événements sont bien reçus
3. Vérifiez les logs de votre serveur pour voir si le webhook est traité

## 📊 Vérification dans Stripe Dashboard

1. Allez dans **Clients** : Vous devriez voir le client créé
2. Allez dans **Abonnements** : Vous devriez voir l'abonnement actif
3. Allez dans **Paiements** : Vous devriez voir le paiement réussi
4. Allez dans **Webhooks** : Vous devriez voir les événements reçus

## ✅ Checklist finale

- [ ] Inscription Premium fonctionne
- [ ] Redirection vers Stripe Checkout fonctionne
- [ ] Paiement avec carte de test fonctionne
- [ ] Webhook reçoit les événements
- [ ] Abonnement activé dans Supabase
- [ ] Page de gestion d'abonnement fonctionne
- [ ] Choix entre mensuel/annuel fonctionne
- [ ] Annulation d'abonnement fonctionne

Une fois tous ces tests passés, votre intégration Stripe est opérationnelle ! 🎉

