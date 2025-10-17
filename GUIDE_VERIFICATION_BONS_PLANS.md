# 🎯 Guide de Vérification - Fonctionnalité Bons Plans

## 🚀 Étapes de Vérification Complète

### ✅ Étape 1 : Vérification visuelle en développement

L'application est maintenant lancée en mode développement. Voici comment vérifier que tout fonctionne :

#### 1.1 - Page d'accueil (Landing Page)

1. **Ouvrir** http://localhost:3000 dans ton navigateur

2. **Scroller** jusqu'à la section "Bons plans du jour" (entre "Comment ça marche ?" et "Ce qu'ils disent de nous")

3. **Vérifier** que :
   - ✅ Le titre "Bons plans du jour" s'affiche
   - ✅ La description "Profitez des offres exclusives près de chez vous" s'affiche
   - ✅ Des cartes de bons plans sont visibles (avec le badge "🎯 BON PLAN DU JOUR")
   - ✅ Les boutons fléchés apparaissent au survol (si + de 3 deals)
   - ✅ Le bouton "Voir tous les bons plans" est visible (si 12+ deals)

4. **Tester la navigation du carousel** :
   - Survole la section
   - Clique sur les flèches gauche/droite
   - Vérifie que le scroll est fluide

5. **Tester l'engagement** :
   - Clique sur le bouton "Intéressé" d'une carte
   - Vérifie que le bouton change de couleur (vert)
   - Clique sur "Pas intéressé" d'une autre carte
   - Vérifie que le bouton change de couleur (rouge)

6. **Tester l'effet flip** :
   - Clique sur "Voir les détails" d'une carte
   - Vérifie que la carte se retourne
   - Vérifie que les détails s'affichent au verso
   - Clique sur "Retour"
   - Vérifie que la carte revient au recto

7. **Tester la redirection** :
   - Clique sur une carte (en dehors des boutons)
   - Vérifie que tu es redirigé vers la page `/etablissement/[id]`

---

#### 1.2 - Page "Tous les bons plans" (/bons-plans)

1. **Naviguer** vers http://localhost:3000/bons-plans

2. **Vérifier** que :
   - ✅ Le titre "Tous les bons plans" s'affiche
   - ✅ Le compteur d'offres s'affiche (ex: "25 offres disponibles")
   - ✅ Le bouton "Retour" est visible et fonctionne
   - ✅ Les deals s'affichent en grille (1 colonne mobile, 2 tablette, 3 desktop)
   - ✅ Le message "✨ Vous avez vu tous les bons plans disponibles !" apparaît en bas
   - ✅ La section CTA "Vous êtes professionnel ?" s'affiche

3. **Tester la redirection** :
   - Clique sur une carte
   - Vérifie la redirection vers `/etablissement/[id]`

4. **Tester le bouton retour** :
   - Clique sur "Retour"
   - Vérifie le retour à la page d'accueil

---

#### 1.3 - Page Établissement

1. **Aller sur une page établissement** qui a un bon plan actif

2. **Vérifier** que :
   - ✅ Le bon plan apparaît dans la section `EstablishmentInfo` (à droite)
   - ✅ **Au clic sur la carte → un modal s'ouvre** (pas de redirection)
   - ✅ Le modal affiche tous les détails du bon plan

---

### ✅ Étape 2 : Tests manuels complets

#### Test 1 : Parcours utilisateur depuis la landing
```
Landing → Carousel → Clic sur deal → Page établissement ✅
```

#### Test 2 : Parcours via "Voir tous"
```
Landing → Voir tous → /bons-plans → Clic sur deal → Page établissement ✅
```

#### Test 3 : Responsive mobile
```
1. Ouvrir DevTools (F12)
2. Passer en mode mobile (375px)
3. Vérifier que le carousel est scrollable horizontalement
4. Vérifier que /bons-plans affiche 1 colonne
```

#### Test 4 : Responsive tablette
```
1. Passer en mode tablette (768px)
2. Vérifier que /bons-plans affiche 2 colonnes
```

#### Test 5 : Responsive desktop
```
1. Passer en mode desktop (1440px)
2. Vérifier que /bons-plans affiche 3 colonnes
```

---

### ✅ Étape 3 : Vérifications techniques

#### 3.1 - Vérifier qu'il n'y a pas d'erreurs console

1. Ouvrir DevTools (F12) → Console
2. Naviguer sur toutes les pages
3. **Vérifier** qu'il n'y a **aucune erreur rouge**

#### 3.2 - Vérifier les appels API

1. Ouvrir DevTools → Network
2. Recharger la landing page
3. **Vérifier** l'appel à `/api/deals/all?limit=12` :
   - ✅ Status 200
   - ✅ Retourne un JSON avec `{ success: true, deals: [...], total: X }`

4. Aller sur `/bons-plans`
5. **Vérifier** l'appel à `/api/deals/all?limit=0` :
   - ✅ Status 200
   - ✅ Retourne tous les deals

#### 3.3 - Vérifier l'engagement

1. Ouvrir DevTools → Network
2. Cliquer sur "Intéressé" sur une carte
3. **Vérifier** l'appel à `/api/deals/engagement` :
   - ✅ Method: POST
   - ✅ Status 200
   - ✅ Body contient `{ dealId, type: "liked", timestamp }`

---

### ✅ Étape 4 : Tests avec données réelles

#### Si tu n'as pas encore de bons plans en base de données :

1. **Se connecter en tant que professionnel** avec un compte Premium
2. **Aller sur le dashboard** → Section "Bons plans journaliers"
3. **Créer un nouveau bon plan** :
   - Titre : "Test - Tacos à 3€"
   - Description : "Offre test pour vérifier l'affichage"
   - Prix initial : 5€
   - Prix réduit : 3€
   - Image : Uploader une image de test
   - Date début : Aujourd'hui
   - Date fin : Demain
   - Horaires : 11:00 - 14:00
   - Actif : ✅

4. **Vérifier** que le deal apparaît :
   - ✅ Sur la landing page (carousel)
   - ✅ Sur `/bons-plans`
   - ✅ Sur la page de l'établissement

5. **Tester toutes les interactions** avec ce deal réel

---

### ✅ Étape 5 : Tests E2E automatisés (optionnel)

Si tu veux lancer les tests automatisés Playwright :

```bash
# Lancer les tests E2E
npm run test:e2e -- daily-deals-integration.spec.ts --headed

# Mode debug (avec trace)
npm run test:e2e -- daily-deals-integration.spec.ts --debug

# Sur un navigateur spécifique
npm run test:e2e -- daily-deals-integration.spec.ts --project=chromium
```

---

## 📋 Checklist Finale

Avant de valider, vérifier que :

### Interface utilisateur
- [ ] La section "Bons plans du jour" s'affiche sur la landing page
- [ ] Le carousel fonctionne (scroll, flèches)
- [ ] Les cartes affichent toutes les informations (titre, prix, image, horaires)
- [ ] Le badge "BON PLAN DU JOUR" est visible sur chaque carte
- [ ] Les boutons d'engagement fonctionnent (Intéressé/Pas intéressé)
- [ ] L'effet flip fonctionne (recto/verso)
- [ ] Le bouton "Voir tous les bons plans" est visible si 12+ deals
- [ ] La page `/bons-plans` affiche tous les deals en grille
- [ ] Le compteur de deals est correct
- [ ] La redirection vers établissement fonctionne

### Comportements
- [ ] Depuis la landing → Redirection vers établissement
- [ ] Depuis `/bons-plans` → Redirection vers établissement
- [ ] Sur page établissement → Modal (pas de redirection)
- [ ] Les clics sur les boutons d'engagement ne déclenchent pas de redirection
- [ ] Les clics sur "Voir les détails" ne déclenchent pas de redirection

### Responsive
- [ ] Mobile (375px) : Carousel scrollable horizontalement
- [ ] Tablette (768px) : Grille 2 colonnes sur `/bons-plans`
- [ ] Desktop (1440px+) : Grille 3 colonnes sur `/bons-plans`

### Technique
- [ ] Pas d'erreurs console
- [ ] L'API `/api/deals/all` fonctionne
- [ ] L'API `/api/deals/engagement` fonctionne
- [ ] Les images s'affichent correctement
- [ ] Les dates et prix sont formatés en français

### Données
- [ ] Les deals actifs s'affichent
- [ ] Les deals inactifs ne s'affichent pas
- [ ] Les deals expirés ne s'affichent pas
- [ ] L'ordre est correct (plus récents en premier)

---

## 🐛 Problèmes connus et solutions

### Problème : Aucun bon plan ne s'affiche

**Solution :**
1. Vérifier qu'il y a des deals actifs en base de données
2. Vérifier les dates (dateDebut <= aujourd'hui, dateFin >= aujourd'hui)
3. Vérifier que `isActive = true`

### Problème : La redirection ne fonctionne pas

**Solution :**
1. Vérifier que `redirectToEstablishment={true}` est bien passé au composant
2. Vérifier que `establishmentId` est fourni
3. Vérifier la console pour les erreurs

### Problème : Le carousel ne scroll pas

**Solution :**
1. Vérifier qu'il y a plus de 3 deals
2. Vérifier que le container `#deals-scroll-container` existe
3. Essayer de scroller manuellement (clic + drag)

### Problème : Les boutons d'engagement ne fonctionnent pas

**Solution :**
1. Vérifier la console Network pour l'appel API
2. Vérifier que l'endpoint `/api/deals/engagement` existe
3. Vérifier les permissions CORS si nécessaire

---

## 📞 Support

Si tu rencontres un problème :

1. **Console DevTools** : Vérifier les erreurs JavaScript
2. **Network Tab** : Vérifier les appels API
3. **Logs serveur** : Vérifier les logs du terminal où tourne `npm run dev`

---

## ✅ Résultat attendu

À la fin de cette vérification, tu devrais avoir :

✅ Une section "Bons plans du jour" fonctionnelle sur la landing page  
✅ Un carousel interactif avec navigation  
✅ Une page `/bons-plans` qui affiche tous les deals  
✅ Une redirection vers établissement au clic depuis landing/bons-plans  
✅ Un modal sur la page établissement (comportement différent)  
✅ Un système d'engagement fonctionnel (like/dislike)  
✅ Un effet flip pour voir les détails  
✅ Un design responsive sur tous les appareils  

---

**Bon test ! 🚀**

Si tout fonctionne, la fonctionnalité est prête à être déployée ! 🎉

