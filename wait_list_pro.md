Parfait ! Voici le **prompt optimisé pour le code existant de envie2sortir.fr** :

***

## 📋 PROMPT POUR CURSOR IA (Adapté au code existant)

```
Tu es un développeur Full-Stack expert. Je veux que tu implémente un système de WAITLIST PREMIUM 
pour les PROFESSIONNELS qui veulent ajouter leurs établissements en premium AVANT le lancement officiel 
de envie2sortir.fr.

CONTEXTE :
- Site : envie2sortir.fr (plateforme de découverte d'activités/loisirs)
- Database : Supabase PostgreSQL (les tables professionals, establishments sont dans Supabase)
- ORM : Supabase Client (pas Prisma pour les requêtes, mais Prisma schema peut servir de référence)
- Utilisateurs cibles : Professionnels avec établissements
- Objectif : Permettre aux pros de s'inscrire en waitlist, les mettre en premium GRATUITEMENT jusqu'au lancement, 
  puis déclencher les paiements Stripe quand l'admin active les abonnements
- Condition de lancement : Suffisamment d'établissements + aucun bug critique après tests

REQUIREMENTS :

1. SCHEMA DATABASE (Supabase PostgreSQL)
   - MODIFIE la table "professionals" dans Supabase :
     * Vérifie si stripe_customer_id existe (sinon : ALTER TABLE professionals ADD COLUMN stripe_customer_id TEXT)
     * Vérifie si stripe_subscription_id existe (sinon : ALTER TABLE professionals ADD COLUMN stripe_subscription_id TEXT)
     * Ajoute premium_activation_date (TIMESTAMP WITH TIME ZONE) : 
       ALTER TABLE professionals ADD COLUMN IF NOT EXISTS premium_activation_date TIMESTAMP WITH TIME ZONE
     * Le champ subscription_plan existe déjà (type TEXT), accepter 'WAITLIST_BETA' comme valeur
     * Créer un CHECK constraint ou utiliser un enum PostgreSQL si nécessaire
   
   - MODIFIE la table "establishments" dans Supabase :
     * Le champ subscription existe déjà (type TEXT), accepter 'WAITLIST_BETA' comme valeur
   
   - CRÉE la table subscription_logs (pour tracker les changements de statut) :
     CREATE TABLE IF NOT EXISTS subscription_logs (
       id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
       professional_id TEXT NOT NULL REFERENCES professionals(id) ON DELETE CASCADE,
       old_status TEXT,
       new_status TEXT NOT NULL,
       reason TEXT,
       changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
     );
     CREATE INDEX IF NOT EXISTS idx_subscription_logs_professional_id ON subscription_logs(professional_id);
     CREATE INDEX IF NOT EXISTS idx_subscription_logs_changed_at ON subscription_logs(changed_at DESC);
   
   - CRÉE une migration Supabase : supabase/migrations/XXX_add_waitlist_system.sql

2. MIGRATION SUPABASE
   - Crée le fichier de migration dans supabase/migrations/
   - Applique avec : supabase db push (ou via Supabase Dashboard)
   - Vérifie avec : SELECT * FROM professionals LIMIT 1;

3. VARIABLES D'ENVIRONNEMENT (.env.local)
   - Ajoute ces variables si elles n'existent pas :
     * LAUNCH_DATE=2026-03-15 (date de lancement officiel)
     * ADMIN_API_KEY=[generate-strong-random-key] (pour protéger les routes admin)
     * RESEND_API_KEY=[your-resend-key] (pour les emails transactionnels)
     * RESEND_FROM_EMAIL=noreply@envie2sortir.fr
   - Les variables Stripe existent déjà (STRIPE_SECRET_KEY, STRIPE_PUBLISHABLE_KEY, etc.)

4. FONCTIONS UTILITAIRES (lib/launch.ts)
   - isLaunchActive() : boolean - vérifie si LAUNCH_DATE est atteinte
   - getDaysUntilLaunch() : number - nombre de jours restants
   - getTimeUntilLaunch() : { days, hours, minutes } - décompte détaillé
   - formatLaunchDate() : string - formatage de la date pour affichage

5. API ROUTES (Next.js App Router)

   POST /api/professionals/waitlist/join
   - Body : { email, firstName, lastName, establishmentName, phone, siret, companyName, legalStatus, password }
   - Validation : email, phone, siret (format valide)
   - Action : 
     * Utilise createClient() de @/lib/supabase/server
     * Vérifie si le Professional existe déjà (par email ou SIRET) via Supabase :
       const { data: existingPro } = await supabase
         .from('professionals')
         .select('id')
         .or(`email.eq.${email},siret.eq.${siret}`)
         .single();
     * Si existe : retourne erreur "Déjà inscrit"
     * Si n'existe pas :
       - Utilise signUpProfessional() de @/lib/supabase/auth-actions pour créer le compte
         (modifier pour accepter subscriptionPlan = 'WAITLIST_BETA')
       - OU crée directement via Supabase :
         const { data: newPro } = await supabase
           .from('professionals')
           .insert({
             email, first_name: firstName, last_name: lastName,
             phone, siret, company_name: companyName, legal_status: legalStatus,
             subscription_plan: 'WAITLIST_BETA',
             password_hash: hashedPassword
           })
           .select()
           .single();
       - Crée Establishment avec subscription = 'WAITLIST_BETA' et status = 'pending'
       - Log dans subscription_logs :
         await supabase
           .from('subscription_logs')
           .insert({
             professional_id: newPro.id,
             old_status: null,
             new_status: 'WAITLIST_BETA',
             reason: 'waitlist_join'
           });
       - Envoie email de confirmation (via Resend ou console.log en dev)
   - Response : { success, message, professionalId }
   - Rate limit : 3 requests par IP par heure (utilise lib/security si disponible)

   GET /api/professionals/waitlist/status/[professionalId]
   - Retourne : { 
       status: 'WAITLIST_BETA' | 'PREMIUM' | 'FREE',
       daysUntilLaunch: number,
       premiumActivationDate: string | null,
       message: string,
       isLaunchActive: boolean
     }

   POST /api/professionals/waitlist/checkout
   - Body : { professionalId }
   - Si LAUNCH_DATE pas atteinte :
     * Retourne message "Inscription confirmée, en attente du lancement. Vous bénéficiez du premium gratuitement jusqu'au lancement."
   - Si LAUNCH_DATE atteinte :
     * Redirige vers Stripe checkout (utilise lib/stripe/config.ts)
     * Crée Stripe Customer si pas déjà créé
     * Crée Stripe Subscription
     * Met à jour Professional avec stripeCustomerId, stripeSubscriptionId
     * Met à jour subscriptionPlan à 'PREMIUM'
     * Log dans SubscriptionLog

   POST /api/admin/launch-activation
   - Authentification : vérifie ADMIN_API_KEY (header Authorization: Bearer {ADMIN_API_KEY})
     OU utilise isAdmin() de @/lib/supabase/helpers si l'utilisateur est connecté
   - Action :
     * Utilise createClientAdmin() de @/lib/supabase/auth-actions pour avoir les privilèges admin
     * Récupère tous les Professional avec subscription_plan = 'WAITLIST_BETA' (via Supabase)
       const { data: waitlistPros } = await adminClient
         .from('professionals')
         .select('*')
         .eq('subscription_plan', 'WAITLIST_BETA');
     * Boucle sur chaque pro :
       - Crée Stripe Customer si pas déjà créé (stripe_customer_id est null)
       - Crée Stripe Subscription (utilise STRIPE_PRICE_ID_MONTHLY par défaut)
       - Met à jour Professional via Supabase :
         await adminClient
           .from('professionals')
           .update({
             subscription_plan: 'PREMIUM',
             stripe_customer_id: customer.id,
             stripe_subscription_id: subscription.id,
             premium_activation_date: new Date().toISOString()
           })
           .eq('id', pro.id);
       - Met à jour Establishment associé : subscription = 'PREMIUM'
         await adminClient
           .from('establishments')
           .update({ subscription: 'PREMIUM' })
           .eq('owner_id', pro.id);
       - Log dans subscription_logs :
         await adminClient
           .from('subscription_logs')
           .insert({
             professional_id: pro.id,
             old_status: 'WAITLIST_BETA',
             new_status: 'PREMIUM',
             reason: 'launch_activation'
           });
       - Envoie email "🎉 Tu es maintenant premium" (via Resend)
     * Retourne : { success, count, errors: [] }
   - Sécurité : log IP + timestamp + user pour audit trail

   POST /api/webhooks/stripe (déjà existant, à adapter)
   - Le webhook existe déjà dans src/app/api/stripe/webhook/route.ts
   - Ajouter la gestion du cas 'WAITLIST_BETA' si nécessaire
   - S'assurer que les événements payment_intent.succeeded et invoice.payment_succeeded 
     mettent bien à jour le statut premium

6. EMAILS TRANSACTIONNELS (Resend)
   - Installer Resend : npm install resend
   - Créer lib/emails/waitlist-join.tsx :
     * Template React Email
     * Merci pour inscription
     * Affiche les X jours avant le lancement
     * Lien vers le dashboard
   
   - Créer lib/emails/launch-ready.tsx :
     * Template React Email
     * 🎉 Le site est lancé !
     * Lien pour passer au premium (si pas déjà activé automatiquement)
     * Détails de l'abonnement

   - Créer lib/emails/send-email.ts :
     * Fonction utilitaire pour envoyer des emails via Resend
     * Gère les erreurs et le fallback en dev (console.log)

7. COMPOSANTS REACT

   components/WaitlistSignupForm.tsx
   - Form avec : email, firstName, lastName, establishmentName, phone, siret, companyName, legalStatus, password
   - Validation côté client (Zod si disponible)
   - Loading state + success message
   - Affiche le décompte "X jours avant le lancement" (utilise lib/launch.ts)
   - Redirige vers /dashboard après inscription réussie

   components/PremiumBadge.tsx
   - Badge "Beta Premium" si subscriptionPlan = 'WAITLIST_BETA'
   - Badge "Premium" si subscriptionPlan = 'PREMIUM'
   - Badge "Gratuit" si subscriptionPlan = 'FREE'
   - Utilise les couleurs du site (#ff751f, #ff1fa9, #ff3a3a)

   components/AdminLaunchPanel.tsx
   - Affiche LAUNCH_DATE actuelle (depuis .env)
   - Compteur : nombre de pros en waitlist (subscriptionPlan = 'WAITLIST_BETA')
   - Bouton "Activer le lancement" avec modal de confirmation
   - Historique des activations (logs depuis SubscriptionLog)
   - Affiche les erreurs si certaines activations ont échoué

   components/CountdownTimer.tsx
   - Affiche : "X jours, Y heures, Z minutes avant le lancement"
   - Met à jour en temps réel (useEffect + setInterval)
   - Utilise lib/launch.ts pour les calculs

8. INTÉGRATION STRIPE
   - Utilise les fonctions existantes dans lib/stripe/config.ts
   - Ne crée PAS de paiements avant le launch pour les waitlist_beta
   - Au launch (via /api/admin/launch-activation) : 
     * Crée Stripe Subscription pour chaque waitlist_beta
     * Utilise STRIPE_PRICE_ID_MONTHLY par défaut
     * Le webhook existant gérera les confirmations de paiement

9. SÉCURITÉ
   - /api/admin/launch-activation protégée par ADMIN_API_KEY (header Authorization: Bearer {key})
     OU isAdmin() si l'utilisateur est connecté
   - Valide tous les emails avec regex ou Zod
   - Rate limit sur /api/professionals/waitlist/join (3 requests par IP par heure)
     Utilise lib/security si disponible, sinon implémente un rate limiter simple
   - Logging détaillé pour audit trail (console.log avec timestamps)

10. TYPES TYPESCRIPT (types/waitlist.ts)
    - ProfessionalStatus = 'FREE' | 'PREMIUM' | 'WAITLIST_BETA'
    - WaitlistJoinRequest = { email, firstName, lastName, establishmentName, phone, siret, companyName, legalStatus, password }
    - WaitlistStatusResponse = { status, daysUntilLaunch, premiumActivationDate, message, isLaunchActive }
    - LaunchActivationResult = { success: boolean, count: number, errors: Array<{ professionalId: string, error: string }> }

11. INTÉGRATION AVEC LE CODE EXISTANT
    - Utilise Supabase Client (createClient de @/lib/supabase/server) pour TOUTES les requêtes DB
    - Les tables professionals et establishments sont dans Supabase PostgreSQL
    - Respecte les patterns existants dans src/app/api/ (ex: src/app/api/professional-registration/route.ts)
    - Utilise les helpers existants (@/lib/supabase/helpers pour isAdmin, requireEstablishment, etc.)
    - Les établissements en WAITLIST_BETA doivent avoir accès aux fonctionnalités premium
      (modifier lib/subscription-utils.ts pour considérer WAITLIST_BETA comme premium)
    - Utilise le client admin Supabase pour les opérations nécessitant des privilèges élevés
      (comme dans src/lib/supabase/auth-actions.ts avec getAdminClient())

TECH STACK CONFIRME :
✅ Database : Supabase PostgreSQL (tables professionals, establishments, etc.)
✅ Client DB : Supabase Client (@supabase/supabase-js)
✅ Framework : Next.js 15+ (App Router)
✅ Paiements : Stripe (déjà configuré)
✅ Emails : Resend (à installer)
✅ Auth : Supabase Auth (déjà configuré)

LIVRABLES ATTENDUS :
✅ Migration Supabase créée (supabase/migrations/XXX_add_waitlist_system.sql)
✅ Colonnes ajoutées à la table professionals (stripe_customer_id, stripe_subscription_id, premium_activation_date)
✅ Table subscription_logs créée dans Supabase
✅ .env.example complété avec nouvelles variables
✅ lib/launch.ts avec fonctions utilitaires
✅ 4 API routes complètes + typées (join, status, checkout, launch-activation) utilisant Supabase Client
✅ 4 composants React réutilisables
✅ Templates emails (Resend)
✅ Types TypeScript stricts
✅ Intégration Stripe complète
✅ Modification de lib/subscription-utils.ts pour gérer WAITLIST_BETA
✅ Documentation inline

PRIORITÉ :
1️⃣ Migration Supabase (colonnes professionals + table subscription_logs)
2️⃣ API routes (waitlist/join et admin/launch-activation) utilisant Supabase Client
3️⃣ Modification subscription-utils.ts pour considérer WAITLIST_BETA comme premium
4️⃣ Composants React
5️⃣ Emails (Resend)
```

***

## 🎯 Commandes à exécuter après

```bash
# 1. Installer Resend
npm install resend

# 2. Après que Cursor génère le code
# Applique la migration Supabase (via Dashboard ou CLI)
supabase db push

# OU via le Dashboard Supabase :
# - Va dans Database > Migrations
# - Upload le fichier supabase/migrations/XXX_add_waitlist_system.sql

# 3. Vérifie que les colonnes sont bien créées
# Via Supabase Dashboard > Table Editor > professionals
# Vérifie : stripe_customer_id, stripe_subscription_id, premium_activation_date

# 4. Vérifie la table subscription_logs
# Via Supabase Dashboard > Table Editor > subscription_logs
```

***

## ✅ Checklist après génération par Cursor

- [ ] Migration Supabase créée et appliquée (colonnes professionals + table subscription_logs)
- [ ] Variables d'env complétées (LAUNCH_DATE, ADMIN_API_KEY, RESEND_API_KEY)
- [ ] lib/subscription-utils.ts modifié pour considérer WAITLIST_BETA comme premium
- [ ] API routes testées avec Postman/cURL (utilisant Supabase Client)
- [ ] Emails générés et testés (ou console.log en dev)
- [ ] Composants React intégrés dans la page /wait
- [ ] Stripe testé en mode sandbox
- [ ] Admin panel testable localement
- [ ] Les établissements WAITLIST_BETA ont accès aux fonctionnalités premium
- [ ] Vérification dans Supabase Dashboard que les données sont bien stockées
