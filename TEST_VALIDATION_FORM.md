# 🧪 Tests de Validation du Formulaire d'Établissement

## ✅ Tests à Effectuer

### 1. **Test : Modification d'items enrichis**
**Objectif** : Vérifier que les items venant de l'enrichissement Google peuvent être modifiés

**Étapes** :
1. Aller à l'étape 4 "Services et ambiance"
2. Chercher un item enrichi (ex: "Chaussures")
3. Cliquer sur l'icône "Modifier" (crayon)
4. Changer le texte (ex: "Chaussure" → "Chaussures de bowling")
5. Cliquer en dehors du champ ou appuyer sur Entrée

**Résultat attendu** :
- ✅ L'item est modifié
- ✅ Pas de doublon créé
- ✅ Message console : `✅ Remplacé dans SERVICES: [ancien] -> [nouveau]`

---

### 2. **Test : Suppression d'items enrichis**
**Objectif** : Vérifier que les items enrichis peuvent être supprimés

**Étapes** :
1. Aller à l'étape 4 "Services et ambiance"
2. Chercher un item enrichi
3. Cliquer sur l'icône "Supprimer" (X)

**Résultat attendu** :
- ✅ L'item est supprimé immédiatement
- ✅ Message console : `🗑️ Retiré de [tableau]: [item] (X -> Y éléments)`

---

### 3. **Test : Affichage des moyens de paiement enrichis**
**Objectif** : Vérifier que les moyens de paiement de Google sont affichés

**Étapes** :
1. Aller à l'étape 4 "Services et ambiance"
2. Dérouler la section "Moyens de paiement"

**Résultat attendu** :
- ✅ Les moyens de paiement s'affichent (ex: "Cartes de crédit", "Espèces", etc.)
- ✅ Message console : `🧠 RAW DATA - Moyens de paiement: Array(4)` (ou plus)
- ❌ PAS "Aucun élément"

---

### 4. **Test : Validation finale (étape 8)**
**Objectif** : Vérifier que la validation de l'étape finale fonctionne

**Étapes** :
1. Remplir toutes les étapes du formulaire
2. Aller à l'étape 8 "Récapitulatif"
3. NE PAS cocher "J'accepte les conditions générales"
4. Cliquer sur "Valider"

**Résultat attendu** :
- ❌ Erreur affichée : "Vous devez accepter les conditions générales d'utilisation"
- ❌ Formulaire non soumis

**Étapes (suite)** :
5. Cocher "J'accepte les conditions générales"
6. Cliquer sur "Valider"

**Résultat attendu** :
- ✅ Formulaire soumis
- ✅ Pas de message d'erreur

---

### 5. **Test : Optimisation de la redirection**
**Objectif** : Vérifier que la redirection est rapide sans erreurs 404

**Étapes** :
1. Remplir et soumettre le formulaire complet
2. Observer la console du navigateur (F12)
3. Observer le temps de redirection vers le dashboard

**Résultat attendu** :
- ✅ Pas d'erreur 404 sur `/api/professional/establishments`
- ✅ Pas de message "non autorisé"
- ✅ Redirection quasi-instantanée (< 500ms après "Connexion automatique réussie")
- ✅ Message console : `✅ Connexion automatique réussie, redirection vers dashboard`

---

### 6. **Test : Géocodage**
**Objectif** : Vérifier que le géocodage fonctionne correctement

**Étapes** :
1. Aller à l'étape 3 "Établissement"
2. Entrer une adresse valide (ex: "10 rue de la Paix 75002 Paris")
3. Observer les logs serveur

**Résultat attendu** :
- ✅ Message serveur : `✅ Géocodage réussi: [lat], [lng]`
- ✅ Coordonnées valides récupérées
- ❌ PAS d'erreur `TypeError: fetch failed`

---

### 7. **Test : Conversion des moyens de paiement**
**Objectif** : Vérifier que les moyens de paiement sont correctement convertis entre objet et tableau

**Étapes** :
1. Aller à l'étape 4 "Services et ambiance"
2. Ajouter un moyen de paiement manuellement
3. Observer les logs console

**Résultat attendu lors de l'affichage** :
- ✅ Console : `🧠 RAW DATA - Moyens de paiement: Array(X)`

**Résultat lors de la soumission** (étape 8) :
- ✅ Console dans le hook : `paymentMethods: [object Object]`
- ✅ Les moyens de paiement sont envoyés au format objet à l'API

---

## 🎯 Checklist Finale

Avant de considérer les corrections comme complètes, vérifier :

- [ ] Tous les items enrichis peuvent être modifiés
- [ ] Tous les items enrichis peuvent être supprimés
- [ ] Les moyens de paiement s'affichent correctement
- [ ] La validation de l'étape 8 fonctionne
- [ ] Pas d'erreur 404 pendant la validation
- [ ] Pas de délai inutile (setTimeout de 1s supprimé)
- [ ] Redirection rapide vers le dashboard
- [ ] Géocodage fonctionnel

---

## 🐛 En cas de problème

Si un test échoue :

1. **Ouvrir la console du navigateur** (F12 → Console)
2. **Copier tous les logs** pertinents
3. **Envoyer les logs** pour diagnostic

**Logs importants à chercher** :
- `✏️ MODIFICATION - Item:`
- `✅ Remplacé dans SERVICES/AMBIANCE/...:`
- `🗑️ SUPPRESSION - Item:`
- `🧠 RAW DATA - Moyens de paiement:`
- `✅ Connexion automatique réussie`
- Messages d'erreur en rouge

---

**Date de création** : 15 octobre 2025  
**Objectif** : Valider les corrections apportées au formulaire d'établissement

