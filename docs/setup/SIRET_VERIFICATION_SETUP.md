# Configuration API INSEE pour la vérification SIRET

## Variables d'environnement requises

Ajoutez ces variables à votre fichier `.env.local` :

```bash
# Configuration API INSEE
# Obtenez vos clés sur https://api.insee.fr/
INSEE_CONSUMER_KEY=your_consumer_key_here
INSEE_CONSUMER_SECRET=your_consumer_secret_here
NEXT_PUBLIC_INSEE_API_URL=https://api.insee.fr/entreprises/sirene/V3
```

## Comment obtenir les clés API INSEE

1. **Créer un compte** : Rendez-vous sur [https://api.insee.fr/](https://api.insee.fr/)
2. **S'inscrire** : Créez un compte avec votre email professionnel
3. **Générer les clés** : Dans votre espace, générez une clé consumer et un secret
4. **Configurer** : Ajoutez les clés dans votre fichier `.env.local`

## Fonctionnalités implémentées

### ✅ Vérification SIRET
- Validation du format (14 chiffres + clé de contrôle)
- Vérification de l'existence dans la base INSEE
- Récupération automatique des informations d'entreprise

### ✅ Informations récupérées
- Raison sociale
- Statut juridique (avec libellé)
- Adresse complète
- Activité principale (code + libellé)
- Date de création

### ✅ Intégration dans le formulaire
- Vérification automatique lors de la saisie
- Pré-remplissage des champs avec les données INSEE
- Gestion des erreurs et cas d'échec
- Interface utilisateur intuitive

## Endpoints API utilisés

- `POST /api/siret/verify` : Vérification d'un numéro SIRET
- `GET /api/insee/siret/{siret}` : Récupération des données INSEE

## Gestion des erreurs

- SIRET invalide (format incorrect)
- SIRET inexistant dans la base INSEE
- Erreurs de connexion à l'API INSEE
- Limites de taux d'API INSEE

## Tests recommandés

Utilisez des numéros SIRET de test pour valider le fonctionnement :
- Format invalide : `1234567890123` (13 chiffres)
- SIRET inexistant : `12345678901234` (clé de contrôle invalide)
- SIRET valide : Utilisez un vrai numéro SIRET d'entreprise française
