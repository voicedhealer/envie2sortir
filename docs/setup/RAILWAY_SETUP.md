# Configuration Railway pour Envie2Sortir

## Variables d'environnement requises

Pour que le build fonctionne sur Railway, vous devez configurer les variables d'environnement suivantes dans votre projet Railway :

### Variables Supabase (obligatoires)

1. **NEXT_PUBLIC_SUPABASE_URL**
   - URL de votre projet Supabase
   - Format : `https://xxxxx.supabase.co`

2. **NEXT_PUBLIC_SUPABASE_ANON_KEY**
   - Clé anonyme (publique) de votre projet Supabase
   - Trouvable dans : Supabase Dashboard > Settings > API > Project API keys > `anon` `public`

3. **SUPABASE_SERVICE_ROLE_KEY** (optionnel mais recommandé)
   - Clé de service (privée) pour les opérations admin
   - Trouvable dans : Supabase Dashboard > Settings > API > Project API keys > `service_role` `secret`
   - ⚠️ **Ne jamais exposer côté client !**

### Comment configurer sur Railway

1. Allez dans votre projet Railway
2. Cliquez sur l'onglet **"Variables"**
3. Ajoutez chaque variable d'environnement :
   - Cliquez sur **"New Variable"**
   - Entrez le nom de la variable (ex: `NEXT_PUBLIC_SUPABASE_URL`)
   - Entrez la valeur
   - Cliquez sur **"Add"**

### Variables optionnelles

Si vous utilisez d'autres services, vous pouvez aussi configurer :

- `STRIPE_SECRET_KEY` - Pour les paiements Stripe
- `STRIPE_WEBHOOK_SECRET` - Pour les webhooks Stripe
- `TWILIO_ACCOUNT_SID` - Pour l'envoi de SMS
- `TWILIO_AUTH_TOKEN` - Pour l'envoi de SMS
- `TWILIO_PHONE_NUMBER` - Numéro Twilio pour SMS

### Vérification

Après avoir ajouté les variables :
1. Redéployez votre application
2. Vérifiez les logs de build pour confirmer qu'il n'y a plus d'erreur "Missing Supabase environment variables"

## Notes importantes

- Les variables `NEXT_PUBLIC_*` sont exposées côté client et doivent être publiques
- Ne jamais commiter les valeurs réelles dans le code
- Railway redéploie automatiquement quand vous poussez sur la branche configurée
- Si le build échoue, vérifiez que toutes les variables sont bien définies dans Railway

