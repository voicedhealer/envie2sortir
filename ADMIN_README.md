# Interface d'Administration Envie2Sortir - MVP

## 🚀 **Fonctionnalités**

### **Page de Connexion Admin**
- **Route** : `/admin/login`
- **Authentification** : Mot de passe simple
- **Variables d'environnement** : `ADMIN_PASSWORD=admin123envie2sortir`

### **Dashboard Principal**
- **Route** : `/admin`
- **Compteurs** : Établissements en attente, actifs, total
- **Dernières inscriptions** : 5 derniers établissements inscrits
- **Actions rapides** : Navigation vers les demandes

### **Liste des Demandes**
- **Route** : `/admin/demandes`
- **Affichage** : Tous les établissements avec `status: "pending"`
- **Actions rapides** : Approuver/Rejeter directement depuis la liste
- **Informations** : Nom, adresse, catégorie, entreprise, contact

### **Détail d'une Demande**
- **Route** : `/admin/demandes/[id]`
- **Informations complètes** : Établissement + professionnel
- **Actions** : Approuver ou Rejeter avec motif
- **Navigation** : Retour à la liste

## 🔧 **Configuration**

### **1. Variables d'environnement**
Créez un fichier `.env.local` à la racine du projet :

```env
# Mot de passe admin (changez-le en production !)
ADMIN_PASSWORD=admin123envie2sortir

# Clé secrète pour les sessions (changez-la en production !)
ADMIN_SESSION_SECRET=secretsessionkey123
```

### **2. Base de données**
Assurez-vous que votre base de données contient :
- Modèle `Professional` avec les champs requis
- Modèle `Establishment` avec `status` et relations
- Données de test pour tester l'interface

## 📱 **Utilisation**

### **Connexion**
1. Allez sur `/admin/login`
2. Entrez le mot de passe configuré dans `.env.local`
3. Vous êtes redirigé vers le dashboard

### **Validation des Demandes**
1. **Dashboard** : Vue d'ensemble des compteurs
2. **Liste des demandes** : Voir toutes les demandes en attente
3. **Actions rapides** : Approuver/Rejeter directement
4. **Détail** : Voir toutes les informations avant décision

### **Actions Disponibles**
- **Approuver** : Status devient "active" → Établissement visible sur le site
- **Rejeter** : Status devient "suspended" → Établissement masqué
- **Voir détails** : Page complète avec toutes les informations

## 🎨 **Design**

### **Couleurs**
- **Primaire** : Bleu (#3B82F6)
- **Succès** : Vert (#10B981)
- **Danger** : Rouge (#EF4444)
- **Fond** : Gris clair (#F9FAFB)

### **Layout**
- **Header fixe** avec navigation
- **Container centré** max-w-6xl
- **Cards blanches** avec ombres légères
- **Boutons arrondis** avec hover states

## 🔒 **Sécurité**

### **Authentification Simple**
- Mot de passe en dur dans `.env.local`
- Session stockée dans localStorage
- Pas de NextAuth pour le MVP

### **Protection des Routes**
- Vérification de session dans le layout admin
- Redirection automatique vers login si non connecté

## 🚧 **Limitations MVP**

- **Pas de pagination** : Limite à 50 demandes max
- **Pas de filtres avancés** : Juste pending/active
- **Pas d'export** de données
- **Pas de gestion d'images** : Juste les textes
- **Pas de rôles** : Un seul admin
- **Pas d'audit logs** : Juste console.log

## 🧪 **Tests**

### **Test de Base**
1. Créez une demande via le formulaire public
2. Connectez-vous en admin sur `/admin/login`
3. Vérifiez que la demande apparaît dans la liste
4. Approuvez la demande → Status devient "active"
5. Vérifiez que l'établissement apparaît sur le site public

### **Test des Actions**
- **Approbation** : Vérifiez le changement de status
- **Rejet** : Vérifiez le changement de status
- **Navigation** : Testez tous les liens et boutons

## 🔄 **Évolutions Futures**

- **Authentification robuste** avec NextAuth
- **Gestion des rôles** et permissions
- **Audit logs** des actions admin
- **Notifications** par email
- **Interface mobile** responsive
- **Export de données** en CSV/Excel
- **Gestion des images** et médias
- **Modération des commentaires** utilisateurs

## 📞 **Support**

Pour toute question ou problème :
1. Vérifiez les variables d'environnement
2. Consultez les logs de la console
3. Vérifiez la base de données
4. Testez avec des données de test

---

**Interface Admin MVP Envie2Sortir** - Version 1.0
