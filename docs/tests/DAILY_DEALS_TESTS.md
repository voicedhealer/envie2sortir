# 📋 Documentation des Tests - Fonctionnalité Bons Plans

## 🎯 Vue d'ensemble

Cette documentation décrit l'ensemble des tests créés pour valider la fonctionnalité **Bons Plans du Jour** sur toutes les couches de l'application.

## 📊 Statistiques de couverture

| Type de test | Fichiers | Scénarios | Statut |
|-------------|----------|-----------|--------|
| **Tests API** | 1 | 15 | ✅ |
| **Tests Composants** | 2 | 50 | ✅ |
| **Tests Pages** | 1 | 30 | ✅ |
| **Tests E2E** | 1 | 25+ | ✅ |
| **TOTAL** | **5** | **120+** | ✅ |

---

## 🧪 1. Tests API - `/api/deals/all`

**Fichier :** `src/__tests__/daily-deals-api.test.ts`

### Objectif
Valider le bon fonctionnement de l'endpoint API qui récupère tous les bons plans actifs.

### Scénarios testés (15)

#### ✅ Cas nominal
1. Récupération des deals avec limite par défaut (12)
2. Récupération de tous les deals (limit=0)
3. Tri par date de création (plus récents en premier)

#### ✅ Filtrage
4. Filtrer les deals inactifs
5. Exclure les deals expirés
6. Exclure les deals pas encore commencés

#### ✅ Cas limites et erreurs
7. Retourner un tableau vide si aucun deal actif
8. Gérer les erreurs de base de données
9. Gérer un limit invalide (négatif)
10. Gérer un limit personnalisé

#### ✅ Validation des données
11. Inclure toutes les informations nécessaires du deal
12. Gérer les champs optionnels null
13. Inclure les informations de l'établissement
14. Valider la structure JSON retournée
15. Compter correctement le nombre total de deals

### Commande d'exécution
```bash
npm run test:unit -- daily-deals-api.test.ts
```

---

## 🎨 2. Tests Composant - `DailyDealCard`

**Fichier :** `src/__tests__/components/DailyDealCard.test.tsx`

### Objectif
Valider le comportement de la carte bon plan avec redirection vs modal selon le contexte.

### Scénarios testés (25)

#### ✅ Affichage de base
1. Afficher les informations principales du deal
2. Afficher le badge "BON PLAN DU JOUR"
3. Afficher l'image si fournie
4. Calculer et afficher le pourcentage de réduction
5. Afficher les horaires si fournis
6. Gérer l'absence d'image

#### ✅ Comportement modal (page établissement)
7. Appeler onClick quand redirectToEstablishment=false
8. Ne pas rediriger si redirectToEstablishment=false

#### ✅ Comportement redirection (landing page)
9. Rediriger vers la page établissement quand redirectToEstablishment=true
10. Ne pas appeler onClick si redirectToEstablishment=true
11. Gérer l'absence d'establishmentId

#### ✅ Effet flip de la carte
12. Afficher le bouton "Voir les détails"
13. Flipper la carte au clic sur "Voir les détails"
14. Ne pas déclencher onClick/redirection quand la carte est flippée
15. Afficher le lien promoUrl sur le verso si fourni
16. Retourner au recto au clic sur "Retour"

#### ✅ Système d'engagement (likes/dislikes)
17. Afficher les boutons d'engagement
18. Envoyer un like au clic sur "Intéressé"
19. Envoyer un dislike au clic sur "Pas intéressé"
20. Ne pas déclencher onClick/redirection lors du clic sur engagement
21. Désactiver les boutons pendant l'envoi

#### ✅ Formatage et troncature
22. Tronquer la description si trop longue (>80 caractères)
23. Ne pas tronquer une description courte
24. Formater correctement la date en français
25. Formater correctement les prix en euros

### Commande d'exécution
```bash
npm run test:unit -- DailyDealCard.test.tsx
```

---

## 🎠 3. Tests Composant - `DailyDealsCarousel`

**Fichier :** `src/__tests__/components/DailyDealsCarousel.test.tsx`

### Objectif
Valider le carousel des bons plans sur la landing page avec navigation et affichage.

### Scénarios testés (25)

#### ✅ Chargement et affichage
1. Afficher un indicateur de chargement initialement
2. Charger et afficher les deals depuis l'API
3. Afficher maximum 12 deals
4. Ne rien afficher si aucun deal disponible
5. Gérer les erreurs de chargement

#### ✅ Interface utilisateur
6. Afficher le titre de la section
7. Afficher la description de la section
8. Afficher l'icône Tag
9. Avoir un fond dégradé orange-blanc-rose

#### ✅ Bouton "Voir tous"
10. Afficher le bouton si 12 deals ou plus
11. Ne pas afficher le bouton si moins de 12 deals
12. Le bouton devrait pointer vers /bons-plans

#### ✅ Navigation du carousel
13. Afficher les boutons de navigation si plus de 3 deals
14. Ne pas afficher les boutons de navigation si 3 deals ou moins
15. Avoir un container scrollable
16. Appeler scrollBy au clic sur la flèche gauche
17. Appeler scrollBy au clic sur la flèche droite

#### ✅ Affichage des cartes
18. Afficher chaque deal dans une DailyDealCard
19. Passer redirectToEstablishment=true aux cartes
20. Chaque carte devrait avoir une largeur fixe de 350px

#### ✅ Responsive design
21. Masquer le bouton "Voir tous" desktop sur mobile
22. Avoir un bouton "Voir tous" mobile séparé

#### ✅ États du composant
23. Ne rien rendre avant le montage (isMounted=false)
24. Masquer le spinner après le chargement
25. Intégration complète (chargement → affichage → navigation)

### Commande d'exécution
```bash
npm run test:unit -- DailyDealsCarousel.test.tsx
```

---

## 📄 4. Tests Page - `/bons-plans`

**Fichier :** `src/__tests__/bons-plans-page.test.tsx`

### Objectif
Valider l'affichage et le fonctionnement de la page dédiée à tous les bons plans.

### Scénarios testés (30)

#### ✅ Chargement et affichage
1. Afficher un indicateur de chargement initialement
2. Charger tous les deals depuis l'API
3. Afficher tous les deals dans une grille
4. Gérer les erreurs de chargement

#### ✅ Header de la page
5. Afficher le titre "Tous les bons plans"
6. Afficher le compteur de deals
7. Afficher "1 offre disponible" au singulier
8. Afficher un bouton retour
9. Afficher l'icône Tag

#### ✅ État vide - Aucun bon plan
10. Afficher un message si aucun deal disponible
11. Afficher une icône et un bouton retour dans l'état vide

#### ✅ Grille des bons plans
12. Utiliser une grille responsive (1, 2, 3 colonnes)
13. Chaque deal devrait avoir redirectToEstablishment=true

#### ✅ Message de fin de liste
14. Afficher un message quand tous les deals sont affichés
15. Afficher un lien retour dans le message de fin

#### ✅ Section CTA professionnels
16. Afficher la section CTA si des deals existent
17. Ne pas afficher la section CTA si aucun deal
18. Le bouton CTA devrait pointer vers /etablissements/nouveau

#### ✅ Design et style
19. Avoir un fond dégradé
20. Avoir une hauteur minimale plein écran
21. Le header devrait avoir une bordure

#### ✅ Responsive
22. Masquer le séparateur vertical sur mobile
23. Adapter la taille du titre sur mobile

#### ✅ Gestion des données
24. Gérer un grand nombre de deals (100+)
25. Gérer des deals sans tous les champs optionnels
26. Afficher correctement le pluriel/singulier
27. Formater les prix et dates
28. Gérer les images manquantes
29. Gérer les erreurs réseau
30. Intégration complète (header → grille → CTA)

### Commande d'exécution
```bash
npm run test:unit -- bons-plans-page.test.tsx
```

---

## 🌐 5. Tests E2E - Parcours utilisateur complet

**Fichier :** `tests/e2e/daily-deals-integration.spec.ts`

### Objectif
Tester le parcours utilisateur complet depuis la landing page jusqu'à la page établissement via les bons plans.

### Scénarios testés (25+)

#### ✅ Landing Page - Section Bons Plans
1. Afficher la section "Bons plans du jour" sur la landing page
2. Afficher des cartes de bons plans dans le carousel
3. Afficher les informations principales d'un deal
4. Naviguer dans le carousel avec les flèches
5. Afficher le bouton "Voir tous les bons plans" si 12 deals ou plus

#### ✅ Redirection vers page établissement
6. Rediriger vers la page établissement au clic sur une carte
7. Ne pas rediriger lors du clic sur les boutons d'engagement

#### ✅ Page /bons-plans
8. Accéder à la page /bons-plans via le bouton "Voir tous"
9. Afficher tous les deals sur la page /bons-plans
10. Afficher une grille de deals sur /bons-plans
11. Pouvoir revenir à l'accueil depuis /bons-plans
12. Rediriger vers établissement depuis /bons-plans
13. Gérer l'état vide (aucun deal)

#### ✅ Effet flip des cartes
14. Flipper la carte au clic sur "Voir les détails"
15. Retourner au recto au clic sur "Retour"
16. Ne pas rediriger quand la carte est flippée

#### ✅ Système d'engagement
17. Pouvoir liker un bon plan
18. Pouvoir disliker un bon plan

#### ✅ Responsive
19. Être responsive sur mobile (375px)
20. Être responsive sur tablette (768px)

#### ✅ Parcours utilisateur complets
21. **Parcours long :** Landing → Carousel → Voir tous → Deal → Établissement
22. **Parcours court :** Landing → Deal (direct) → Établissement

### Commande d'exécution
```bash
# Tous les tests E2E Daily Deals
npm run test:e2e -- daily-deals-integration.spec.ts

# Mode headed (avec navigateur visible)
npm run test:e2e -- daily-deals-integration.spec.ts --headed

# Sur un navigateur spécifique
npm run test:e2e -- daily-deals-integration.spec.ts --project=chromium
```

---

## 🚀 Commandes rapides

### Exécuter tous les tests Daily Deals
```bash
# Tests unitaires uniquement
npm run test:unit -- daily-deals

# Tests E2E uniquement
npm run test:e2e -- daily-deals-integration

# Tous les tests (unitaires + E2E)
npm run test:all
```

### Exécuter avec couverture
```bash
npm run test:coverage -- daily-deals
```

### Mode watch (développement)
```bash
npm run test:watch -- daily-deals
```

---

## 📈 Matrice de couverture par fonctionnalité

| Fonctionnalité | API | Composant | Page | E2E | Couverture |
|----------------|-----|-----------|------|-----|------------|
| **Récupération des deals** | ✅ | ✅ | ✅ | ✅ | 100% |
| **Affichage carousel** | - | ✅ | - | ✅ | 100% |
| **Navigation carousel** | - | ✅ | - | ✅ | 100% |
| **Redirection établissement** | - | ✅ | - | ✅ | 100% |
| **Modal sur page établissement** | - | ✅ | - | ✅ | 100% |
| **Page /bons-plans** | - | - | ✅ | ✅ | 100% |
| **Effet flip cartes** | - | ✅ | - | ✅ | 100% |
| **Système d'engagement** | - | ✅ | - | ✅ | 100% |
| **Filtrage deals actifs** | ✅ | - | - | ✅ | 100% |
| **Responsive design** | - | ✅ | ✅ | ✅ | 100% |
| **Gestion erreurs** | ✅ | ✅ | ✅ | - | 100% |
| **État vide** | ✅ | ✅ | ✅ | ✅ | 100% |

---

## 🎯 Cas d'usage validés

### ✅ Utilisateur final
- [x] Voir les bons plans sur la landing page
- [x] Naviguer dans le carousel de bons plans
- [x] Cliquer sur un bon plan et être redirigé vers l'établissement
- [x] Voir tous les bons plans disponibles
- [x] Liker/disliker un bon plan
- [x] Voir les détails d'un bon plan (effet flip)
- [x] Navigation fluide entre toutes les pages

### ✅ Professionnel
- [x] Les bons plans créés apparaissent sur la landing
- [x] Les bons plans créés apparaissent dans /bons-plans
- [x] Les bons plans redirigent vers la page de l'établissement
- [x] Le système d'engagement fonctionne correctement

### ✅ Système
- [x] L'API retourne les bons plans actifs uniquement
- [x] Les deals expirés sont filtrés
- [x] Les deals inactifs sont masqués
- [x] La pagination fonctionne (limit)
- [x] Les erreurs sont gérées gracieusement
- [x] Le responsive fonctionne sur tous les appareils

---

## 🐛 Guide de débogage

### Les tests API échouent
```bash
# Vérifier la connexion à la base de données
npm run prisma:studio

# Vérifier les données de test
npm run test:debug -- daily-deals-api
```

### Les tests composants échouent
```bash
# Mode debug avec affichage détaillé
npm run test:debug -- DailyDealCard

# Vérifier les mocks
DEBUG=* npm run test:unit -- DailyDealCard
```

### Les tests E2E échouent
```bash
# Mode headed pour voir le navigateur
npm run test:e2e -- daily-deals-integration --headed

# Mode debug avec trace
npm run test:e2e -- daily-deals-integration --debug

# Prendre des screenshots en cas d'échec
npm run test:e2e -- daily-deals-integration --screenshot=on
```

---

## 📝 Maintenance des tests

### Ajouter de nouveaux tests

1. **Pour l'API :** Ajouter dans `daily-deals-api.test.ts`
2. **Pour les composants :** Ajouter dans les fichiers respectifs dans `src/__tests__/components/`
3. **Pour les pages :** Ajouter dans `bons-plans-page.test.tsx`
4. **Pour E2E :** Ajouter dans `daily-deals-integration.spec.ts`

### Mettre à jour les tests existants

Lors de modifications de la fonctionnalité :
1. Identifier les tests impactés
2. Mettre à jour les assertions
3. Vérifier que tous les tests passent
4. Mettre à jour cette documentation si nécessaire

---

## ✅ Checklist de validation

Avant chaque déploiement, vérifier que :

- [ ] Tous les tests unitaires passent
- [ ] Tous les tests E2E passent
- [ ] La couverture de code est > 80%
- [ ] Pas de régression sur les tests existants
- [ ] Les nouveaux cas d'usage sont testés
- [ ] La documentation est à jour

---

## 📞 Support

En cas de problème avec les tests :
1. Consulter cette documentation
2. Vérifier les logs de CI/CD
3. Exécuter les tests en mode debug
4. Consulter les fichiers de test pour les détails d'implémentation

---

**Dernière mise à jour :** 17 Octobre 2025  
**Version :** 1.0.0  
**Auteur :** Équipe de développement Envie2Sortir

