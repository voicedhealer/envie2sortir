# Guide de test manuel du tracking des clics

Ce guide vous permet de tester manuellement que tous les éléments de la page de détails sont correctement trackés.

## Prérequis

1. Avoir un établissement Premium avec des données
2. Accéder à la page de détails de l'établissement
3. Ouvrir la console du navigateur (F12)
4. Ouvrir l'onglet Network pour voir les requêtes

## Tests à effectuer

### 1. Actions rapides

#### Test Itinéraire
- [ ] Cliquer sur le bouton "Itinéraire"
- [ ] Vérifier dans la console Network qu'une requête POST est envoyée à `/api/analytics/track`
- [ ] Vérifier que le body contient :
  ```json
  {
    "establishmentId": "...",
    "elementType": "button",
    "elementId": "directions",
    "elementName": "Itinéraire",
    "action": "click",
    "sectionContext": "actions_rapides"
  }
  ```

#### Test Consulter le menu
- [ ] Cliquer sur "Consulter le menu"
- [ ] Vérifier la requête avec `elementId: "menu"`

#### Test Contacter
- [ ] Cliquer sur "Contacter"
- [ ] Vérifier la requête avec `elementId: "contact"`
- [ ] Ouvrir le dropdown et cliquer sur chaque option (Appeler, WhatsApp, Messenger, Email)
- [ ] Vérifier que chaque option envoie une requête avec `elementType: "contact"`

#### Test Favoris
- [ ] Cliquer sur le bouton favoris (cœur)
- [ ] Vérifier la requête avec `elementId: "favorite"`

#### Test Partager
- [ ] Cliquer sur "Partager"
- [ ] Vérifier la requête avec `elementId: "share"`

#### Test Laisser un avis
- [ ] Cliquer sur "Laisser un avis"
- [ ] Vérifier la requête avec `elementId: "review"`

### 2. Sections principales

- [ ] Ouvrir une section (ex: "Horaires")
- [ ] Vérifier une requête avec `elementType: "section"`, `action: "open"`
- [ ] Fermer la section
- [ ] Vérifier une requête avec `action: "close"`

### 3. Liens externes

- [ ] Cliquer sur un lien Instagram/Facebook/etc.
- [ ] Vérifier la requête avec `elementType: "link"`

### 4. Galerie photo

- [ ] Cliquer sur une image de la galerie
- [ ] Vérifier la requête avec `elementType: "image"` ou `elementType: "gallery"`

### 5. Vérification dans le dashboard

1. Aller dans le dashboard professionnel
2. Ouvrir l'onglet Analytics
3. Vérifier que les interactions apparaissent dans :
   - Vue d'ensemble : Total des interactions
   - Vue détaillée : Top 10 des éléments populaires
   - Les statistiques par type doivent inclure tous les types trackés

### 6. Vérification des données

Dans le dashboard Analytics, vérifier :

- [ ] Le total des interactions correspond au nombre de clics effectués
- [ ] Les éléments trackés apparaissent dans "Top 10 des éléments populaires"
- [ ] Les statistiques par type montrent les bons types (button, contact, section, link, etc.)
- [ ] Les statistiques horaires montrent les bonnes heures
- [ ] Les sections trackées apparaissent dans "Sections les plus consultées"

## Checklist complète

- [ ] Itinéraire tracké
- [ ] Menu tracké
- [ ] Contact tracké (bouton principal)
- [ ] Appeler tracké (dropdown)
- [ ] WhatsApp tracké (dropdown)
- [ ] Messenger tracké (dropdown)
- [ ] Email tracké (dropdown)
- [ ] Favoris tracké
- [ ] Partager tracké
- [ ] Laisser un avis tracké
- [ ] Sections ouvertes/fermées trackées
- [ ] Liens externes trackés
- [ ] Galerie trackée
- [ ] Données visibles dans le dashboard Analytics

## Commandes utiles

Pour vérifier les données dans la base :

```sql
-- Voir les derniers clics trackés
SELECT * FROM click_analytics 
WHERE establishment_id = 'VOTRE_ESTABLISHMENT_ID'
ORDER BY timestamp DESC
LIMIT 20;

-- Compter les clics par type
SELECT element_type, COUNT(*) 
FROM click_analytics 
WHERE establishment_id = 'VOTRE_ESTABLISHMENT_ID'
GROUP BY element_type;

-- Voir les éléments les plus cliqués
SELECT element_type, element_id, element_name, COUNT(*) as count
FROM click_analytics 
WHERE establishment_id = 'VOTRE_ESTABLISHMENT_ID'
GROUP BY element_type, element_id, element_name
ORDER BY count DESC
LIMIT 10;
```

