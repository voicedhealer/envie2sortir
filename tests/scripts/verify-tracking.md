# Vérification du tracking - Checklist complète

## Tests automatiques

Les tests unitaires vérifient que :
- ✅ L'API `/api/analytics/track` (POST) enregistre correctement les clics
- ✅ L'API `/api/analytics/track` (GET) récupère correctement les statistiques
- ✅ Tous les types d'éléments sont trackés (button, contact, section, link, etc.)
- ✅ Les métadonnées (heure, jour, etc.) sont incluses

**Exécuter les tests :**
```bash
npm test -- src/__tests__/analytics/click-tracking.test.ts
```

## Tests manuels - Checklist

### 1. Actions rapides (EstablishmentActions)

Ouvrir la page de détails d'un établissement et vérifier dans la console Network :

- [ ] **Itinéraire** : Requête POST avec `elementId: "directions"`
- [ ] **Consulter le menu** : Requête POST avec `elementId: "menu"`
- [ ] **Contacter** : Requête POST avec `elementId: "contact"`
  - [ ] **Appeler** (dropdown) : Requête avec `elementType: "contact"`, `elementId: "phone-dropdown"`
  - [ ] **WhatsApp** (dropdown) : Requête avec `elementId: "whatsapp"`
  - [ ] **Messenger** (dropdown) : Requête avec `elementId: "messenger"`
  - [ ] **Email** (dropdown) : Requête avec `elementId: "email"`
- [ ] **Favoris** : Requête POST avec `elementId: "favorite"`
- [ ] **Partager** : Requête POST avec `elementId: "share"`
- [ ] **Laisser un avis** : Requête POST avec `elementId: "review"`

### 2. Sections (EstablishmentMainSections)

- [ ] **Ouverture de section** : Requête avec `elementType: "section"`, `action: "open"`
- [ ] **Fermeture de section** : Requête avec `action: "close"`
- [ ] **Clic sur sous-section** : Requête avec `elementType: "subsection"`

### 3. Liens externes (EstablishmentInfo)

- [ ] **Instagram** : Requête avec `elementType: "link"`, `elementId: "instagram"`
- [ ] **Facebook** : Requête avec `elementId: "facebook"`
- [ ] **TikTok** : Requête avec `elementId: "tiktok"`
- [ ] **YouTube** : Requête avec `elementId: "youtube"`
- [ ] **Site web** : Requête avec `elementId: "website"`

### 4. Horaires (EstablishmentInfo)

- [ ] **Consultation des horaires** : Requête avec `elementType: "schedule"`
- [ ] **Expansion des horaires** : Requête avec `action: "expand"`

### 5. Galerie photo (PhotoGallery)

- [ ] **Clic sur image** : Requête avec `elementType: "image"` ou `"gallery"`

### 6. Vérification dans le Dashboard Analytics

Aller dans `/dashboard` → Onglet **Analytics** :

#### Vue d'ensemble
- [ ] Le **Total des interactions** correspond aux clics effectués
- [ ] Les **Top éléments** incluent les éléments cliqués
- [ ] Les **Statistiques par type** montrent les bons types
- [ ] Les **Statistiques horaires** sont correctes

#### Vue détaillée
- [ ] **Top 10 des éléments populaires** inclut tous les éléments trackés
- [ ] Les **Sections les plus consultées** apparaissent
- [ ] Les **Contacts les plus utilisés** apparaissent
- [ ] Les **Liens sociaux** apparaissent avec les bons compteurs

### 7. Vérification dans la base de données

```sql
-- Vérifier que les données sont bien enregistrées
SELECT 
  element_type,
  element_id,
  element_name,
  COUNT(*) as count,
  MAX(timestamp) as dernier_clic
FROM click_analytics 
WHERE establishment_id = 'VOTRE_ESTABLISHMENT_ID'
  AND timestamp >= NOW() - INTERVAL '1 day'
GROUP BY element_type, element_id, element_name
ORDER BY count DESC;

-- Vérifier les actions rapides spécifiquement
SELECT * FROM click_analytics 
WHERE establishment_id = 'VOTRE_ESTABLISHMENT_ID'
  AND section_context = 'actions_rapides'
  AND timestamp >= NOW() - INTERVAL '1 day'
ORDER BY timestamp DESC;
```

## Script de test automatique

Un script de test est disponible dans `tests/scripts/test-tracking-integration.ts`.

Pour l'utiliser :
1. Ouvrir la console du navigateur sur une page de détails
2. Copier le contenu du script
3. Exécuter `testTrackingIntegration()`

## Résolution des problèmes

### Les données n'apparaissent pas dans le dashboard

1. Vérifier que l'établissement a le plan **PREMIUM**
2. Vérifier que les requêtes POST sont bien envoyées (console Network)
3. Vérifier que les requêtes retournent `{ success: true }`
4. Vérifier dans la base de données que les données sont enregistrées

### Certains éléments ne sont pas trackés

1. Vérifier que le composant utilise `useClickTracking` ou un hook dérivé
2. Vérifier que `trackClick` est appelé dans le handler d'événement
3. Vérifier la console pour les erreurs JavaScript

### Les statistiques sont incorrectes

1. Vérifier que la période sélectionnée correspond
2. Vérifier que les données ne sont pas filtrées par erreur
3. Vérifier que le groupement par élément fonctionne correctement

