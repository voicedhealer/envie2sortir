# Branche Demo - Envie2Sortir

Cette branche est configurée pour les présentations avec une base de données locale Prisma (SQLite).

## 🎯 Configuration

Cette branche utilise :
- **Base de données locale** : SQLite (`prisma/dev.db`)
- **Toutes les routes API** fonctionnent avec cette base locale
- **Aucune dépendance externe** pour la base de données

## 🚀 Démarrage rapide

### 1. Installer les dépendances
```bash
npm install
```

### 2. Générer le client Prisma
```bash
npx prisma generate
```

### 3. Vérifier que la base de données existe
La base de données locale se trouve dans `prisma/dev.db`. Si elle n'existe pas, appliquez les migrations :

```bash
npx prisma migrate dev
```

### 4. Démarrer le serveur de développement
```bash
npm run dev
```

L'application sera accessible sur `http://localhost:3000`

## 📊 Base de données

- **Type** : SQLite
- **Emplacement** : `prisma/dev.db`
- **Configuration** : Définie dans `prisma/schema.prisma` et `src/lib/prisma.ts`

### Visualiser la base de données

Pour ouvrir la base de données avec Prisma Studio :
```bash
npx prisma studio
```

Cela ouvrira une interface graphique sur `http://localhost:5555` pour visualiser et modifier les données.

## 🔌 Routes API disponibles

Toutes les routes API fonctionnent avec la base de données locale :

- **Authentification** : `/api/auth/*`
- **Établissements** : `/api/establishments/*`, `/api/etablissements/*`
- **Recherche** : `/api/recherche/*`
- **Professionnels** : `/api/professional/*`
- **Admin** : `/api/admin/*`
- **Commentaires** : `/api/comments/*`
- **Événements** : `/api/events/*`
- **Bons plans** : `/api/deals/*`
- **Messagerie** : `/api/messaging/*`
- **Analytics** : `/api/analytics/*`
- **Monitoring** : `/api/monitoring/*`

## 📝 Notes importantes

1. **Base de données locale uniquement** : Cette branche est configurée pour utiliser uniquement la base de données locale SQLite. Aucune connexion à une base de données distante n'est nécessaire.

2. **Données de démonstration** : Assurez-vous d'avoir des données de démonstration dans `prisma/dev.db` pour vos présentations.

3. **Portabilité** : Le chemin de la base de données est relatif, donc la branche fonctionnera sur n'importe quel système tant que la structure de dossiers est respectée.

4. **Variables d'environnement** : Si vous avez besoin de variables d'environnement spécifiques, créez un fichier `.env.local` à la racine du projet.

## 🔄 Retour à la branche principale

Pour revenir à la branche de développement :
```bash
git checkout dev
```

## 🛠️ Commandes utiles

- **Voir les données** : `npx prisma studio`
- **Réinitialiser la base** : Supprimez `prisma/dev.db` et exécutez `npx prisma migrate dev`
- **Voir les migrations** : `npx prisma migrate status`
- **Créer une migration** : `npx prisma migrate dev --name nom_de_la_migration`

