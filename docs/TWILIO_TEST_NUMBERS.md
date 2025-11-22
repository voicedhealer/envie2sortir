# Utilisation des numéros de test Twilio

## Numéros de test disponibles

Twilio fournit des numéros de test spéciaux qui permettent de tester les SMS **sans frais** et **sans envoi réel**. Ces numéros peuvent être utilisés même si Twilio n'est pas complètement configuré.

### Numéros de test

- **`+15005550006`** - SMS envoyé avec succès (recommandé pour les tests)
- **`+15005550007`** - Simulation d'erreur lors de l'envoi
- **`+15005550008`** - Simulation de numéro invalide

## Configuration

### Option 1 : Mode test activé

Ajoutez dans votre fichier `.env` :

```env
TWILIO_TEST_MODE=true
```

Avec ce mode activé, tous les numéros de test seront automatiquement reconnus et simulés sans envoi réel.

### Option 2 : Utilisation directe des numéros de test

Vous pouvez utiliser directement les numéros de test dans le formulaire d'inscription ou de modification :

- Utilisez **`01500555006`** (format français recommandé) ou **`+15005550006`** pour tester un envoi réussi
- Les numéros de test sont maintenant **automatiquement reconnus** par le formulaire
- Le code de vérification sera affiché dans les logs et dans l'interface (en mode développement)

## Exemple d'utilisation

### Pour l'inscription d'un professionnel

1. Dans le formulaire d'inscription, entrez le numéro de test : `+15005550006` ou `01500555006`
2. Cliquez sur "Envoyer le SMS"
3. Le code de vérification sera affiché :
   - Dans la console du serveur
   - Dans l'interface si en mode développement (bannière jaune avec le code)
4. Entrez le code pour valider

### Pour la modification des données personnelles

1. Dans le dashboard professionnel, modifiez un champ sensible (email, SIRET, etc.)
2. Un modal de vérification SMS s'ouvre
3. Utilisez le numéro de test déjà enregistré dans votre profil professionnel
4. Le code sera affiché dans les logs et dans l'interface

## Logs en mode test

Quand vous utilisez un numéro de test, vous verrez dans les logs :

```
🧪 [Twilio TEST] SMS de test à +15005550006
🔐 [Twilio TEST] Code de vérification: 123456
📝 [Twilio TEST] Message: Votre code de vérification Envie2Sortir est : 123456. Valide pendant 10 minutes.
✅ [Twilio TEST] SMS simulé avec succès (pas d'envoi réel)
```

## Notes importantes

- **Pas de frais** : Les numéros de test sont gratuits
- **Pas d'envoi réel** : Aucun SMS n'est envoyé aux numéros de test
- **Codes visibles** : Les codes sont affichés dans les logs et l'interface pour faciliter les tests
- **Validation fonctionne** : La vérification SMS fonctionne normalement même avec les numéros de test

## Variables d'environnement

```env
# Configuration Twilio (requis pour la production)
TWILIO_ACCOUNT_SID=votre_account_sid
TWILIO_AUTH_TOKEN=votre_auth_token
TWILIO_PHONE_NUMBER=votre_numero_twilio

# Mode test (optionnel)
TWILIO_TEST_MODE=true
```

## Migration vers la production

Quand vous êtes prêt pour la production :

1. Retirez `TWILIO_TEST_MODE=true` de votre `.env`
2. Assurez-vous que `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN` et `TWILIO_PHONE_NUMBER` sont configurés
3. Les vrais numéros de téléphone recevront des SMS réels

