# Exemple de configuration Stripe - Variables d'environnement

## 📝 Variables à ajouter dans `.env.local`

```env
# ============================================
# STRIPE CONFIGURATION
# ============================================

# Clés API Stripe (Mode Test)
# Obtenues depuis : Dashboard Stripe > Développeurs > Clés API
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Price IDs des plans Premium
# ⚠️ IMPORTANT : Ce sont les Price IDs (commencent par price_), pas les Product IDs !
# Pour les trouver : Dashboard Stripe > Produits > Cliquez sur le produit > Section "Tarifs"
STRIPE_PRICE_ID_MONTHLY=price_1SVcwNC4obkBPREX8NqiiJVY  # Plan mensuel à 29,90€
STRIPE_PRICE_ID_ANNUAL=price_1SVd46C4obkBPREXX7Yb9o0C   # Plan annuel à 305€ (-15%)

# Secret du webhook Stripe
# Obtenu depuis : Dashboard Stripe > Développeurs > Webhooks > Votre endpoint
# Pour le développement local avec Stripe CLI : whsec_... (affiché dans la console)
STRIPE_WEBHOOK_SECRET=whsec_...
```

## 🔍 Où trouver ces valeurs

### 1. Clés API Stripe
- Dashboard Stripe > **Développeurs** > **Clés API**
- Mode Test activé (bascule en haut à droite)
- Copiez la **Clé secrète** (sk_test_...) et la **Clé publiable** (pk_test_...)

### 2. Price IDs
- Dashboard Stripe > **Produits**
- Cliquez sur votre produit (ex: "Plan Premium Mensuel")
- Dans la section **Tarifs**, cliquez sur le prix
- L'ID du prix est visible dans l'URL ou les détails (commence par `price_`)

**Vos Price IDs configurés :**
- Plan mensuel : `price_1SVcwNC4obkBPREX8NqiiJVY` (29,90€/mois)
- Plan annuel : `price_1SVd46C4obkBPREXX7Yb9o0C` (305€/an)

### 3. Secret du webhook
- Dashboard Stripe > **Développeurs** > **Webhooks**
- Créez un endpoint pointant vers : `https://votre-domaine.com/api/stripe/webhook`
- Ou utilisez Stripe CLI en local : `stripe listen --forward-to localhost:3000/api/stripe/webhook`
- Le secret commence par `whsec_`

## ⚠️ Notes importantes

- Ne commitez **JAMAIS** ce fichier dans Git (il est déjà dans `.gitignore`)
- Utilisez les clés de **test** en développement
- Les Price IDs sont déjà configurés pour vos produits Stripe
- Le webhook doit être configuré pour chaque environnement (dev/prod)

