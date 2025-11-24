# Configuration Stripe pour les Abonnements Professionnels

Ce document explique comment configurer Stripe pour gérer les abonnements Premium des professionnels.

## 📋 Prérequis

1. Un compte Stripe (https://stripe.com)
2. Accès au dashboard Stripe
3. Accès à votre projet Supabase

## 🔑 Variables d'environnement à ajouter

Ajoutez les variables suivantes dans votre fichier `.env.local` :

```env
# Clés API Stripe (Mode Test)
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Price IDs (pas Product IDs !)
# Pour trouver les Price IDs : Dashboard Stripe > Produits > Cliquez sur votre produit > Section "Tarifs"
STRIPE_PRICE_ID_MONTHLY=price_1SVcwNC4obkBPREX8NqiiJVY  # Plan mensuel à 29,90€
STRIPE_PRICE_ID_ANNUAL=price_1SVd46C4obkBPREXX7Yb9o0C   # Plan annuel à 305€ (-15%)

# Secret du webhook
STRIPE_WEBHOOK_SECRET=whsec_...
```

## 📝 Étapes de configuration

### 1. Obtenir les clés API Stripe (Mode Test)

1. Connectez-vous à votre [Dashboard Stripe](https://dashboard.stripe.com)
2. Assurez-vous d'être en **mode Test** (bascule en haut à droite)
3. Allez dans **Développeurs** > **Clés API**
4. Copiez :
   - **Clé secrète** → `STRIPE_SECRET_KEY` (commence par `sk_test_`)
   - **Clé publiable** → `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (commence par `pk_test_`)

### 2. Trouver les Price IDs (IMPORTANT)

⚠️ **Attention** : Vous avez besoin des **Price IDs** (commencent par `price_`), pas des **Product IDs** (commencent par `prod_`).

1. Allez dans **Produits** dans votre Dashboard Stripe
2. Cliquez sur votre produit (ex: "Plan Premium Mensuel")
3. Dans la section **Tarifs**, vous verrez les prix associés
4. Cliquez sur le prix (ex: "29,90 € / mois")
5. Dans l'URL ou dans les détails, vous trouverez l'**ID du prix** (commence par `price_`)
6. Répétez pour le plan annuel

**Exemple** :
- Product ID : `prod_TSY2thLTgIqAad` ❌ (ne pas utiliser)
- Price ID : `price_1ABC123...` ✅ (à utiliser)

### 3. Configurer le webhook Stripe

1. Allez dans **Développeurs** > **Webhooks**
2. Cliquez sur **Ajouter un endpoint**
3. **URL du endpoint** : `https://votre-domaine.com/api/stripe/webhook`
   - Pour le développement local, utilisez [Stripe CLI](https://stripe.com/docs/stripe-cli) :
     ```bash
     stripe listen --forward-to localhost:3000/api/stripe/webhook
     ```
     Le secret sera affiché dans la console (commence par `whsec_`)
4. Sélectionnez les événements à écouter :
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Cliquez sur **Ajouter un endpoint**
6. Copiez le **Secret de signature** (commence par `whsec_`) → `STRIPE_WEBHOOK_SECRET`

### 4. Ajouter les colonnes Stripe dans Supabase

Exécutez cette migration SQL dans votre Supabase Dashboard (SQL Editor) :

```sql
-- Ajouter les colonnes Stripe à la table professionals
ALTER TABLE professionals
ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT,
ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT;

-- Créer un index pour les recherches rapides
CREATE INDEX IF NOT EXISTS idx_professionals_stripe_customer_id 
ON professionals(stripe_customer_id);

CREATE INDEX IF NOT EXISTS idx_professionals_stripe_subscription_id 
ON professionals(stripe_subscription_id);
```

Ou utilisez le fichier `docs/supabase-migration-stripe.sql`

## 🧪 Tester l'intégration

### Cartes de test Stripe

Utilisez ces cartes pour tester les paiements :

- **Succès** : `4242 4242 4242 4242`
- **Échec** : `4000 0000 0000 0002`
- **3D Secure** : `4000 0025 0000 3155`

Date d'expiration : n'importe quelle date future (ex: 12/25)
CVC : n'importe quel code à 3 chiffres (ex: 123)

### Tester le flux complet

1. Inscrivez-vous en tant que professionnel
2. Sélectionnez le plan Premium
3. Complétez le formulaire
4. Vous serez redirigé vers Stripe Checkout
5. Utilisez une carte de test
6. Vérifiez que l'abonnement est activé dans le dashboard

## 💡 Plans disponibles

Le système supporte maintenant deux plans :

- **Plan Mensuel** : 29,90€/mois
- **Plan Annuel** : 305€/an (-15% de réduction, soit 25,42€/mois)

Les utilisateurs peuvent choisir leur plan lors de l'abonnement depuis la page `/dashboard/subscription`.

## 🔄 Passage en production

Quand vous êtes prêt pour la production :

1. Basculez en **mode Live** dans Stripe
2. Obtenez les nouvelles clés API (Live)
3. Remplacez les variables d'environnement :
   - `STRIPE_SECRET_KEY` → clé Live (commence par `sk_live_`)
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` → clé Live (commence par `pk_live_`)
4. Créez de nouveaux produits/prix en mode Live
5. Configurez le webhook avec l'URL de production
6. Mettez à jour `STRIPE_PRICE_ID_MONTHLY` et `STRIPE_PRICE_ID_ANNUAL` avec les nouveaux prix Live

## 📚 Documentation supplémentaire

- [Documentation Stripe](https://stripe.com/docs)
- [Stripe Checkout](https://stripe.com/docs/payments/checkout)
- [Stripe Webhooks](https://stripe.com/docs/webhooks)
- [Stripe Testing](https://stripe.com/docs/testing)
- [Différence entre Product ID et Price ID](https://stripe.com/docs/api/prices)

## ⚠️ Notes importantes

- **Ne commitez jamais** les clés API dans Git
- Utilisez toujours les clés de test en développement
- Les webhooks doivent être configurés pour chaque environnement (dev/prod)
- Le secret du webhook est différent pour chaque endpoint
- **Utilisez les Price IDs, pas les Product IDs** pour créer des sessions de checkout
