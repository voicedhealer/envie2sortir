# 🐳 Guide Docker pour Envie2Sortir

Ce guide vous explique comment dockeriser et déployer l'application Envie2Sortir.

## 📋 Prérequis

- Docker 20.10+ et Docker Compose 2.0+
- Git

### 🔽 Installation de Docker

#### Sur macOS

1. **Téléchargez Docker Desktop** :
   - Allez sur [https://www.docker.com/products/docker-desktop](https://www.docker.com/products/docker-desktop)
   - Téléchargez Docker Desktop pour Mac (choisissez Intel ou Apple Silicon selon votre Mac)
   - Installez en suivant l'assistant d'installation

2. **Lancez Docker Desktop** :
   - Ouvrez Docker Desktop depuis vos applications
   - Attendez que le statut affiche "Docker is running"
   - L'icône Docker doit apparaître dans votre barre de menu (en haut)

3. **Vérifiez l'installation** :
```bash
docker --version
docker compose version
```

4. **Note sur les commandes** :
   - **Docker Compose V2** (intégré) : Utilisez `docker compose` (sans tiret)
   - **Docker Compose V1** (standalone) : Utilisez `docker-compose` (avec tiret)
   
   ⚠️ **Important** : Les fichiers de ce projet utilisent `docker-compose`. Si vous avez Docker Compose V2, vous pouvez soit :
   - Utiliser `docker compose` (sans tiret) à la place de `docker-compose` dans toutes les commandes
   - Ou créer un alias : `alias docker-compose='docker compose'`

## 🚀 Démarrage rapide

### Production

```bash
# Construire et démarrer l'application
docker-compose up -d --build

# Voir les logs
docker-compose logs -f

# Arrêter l'application
docker-compose down

# Arrêter et supprimer les volumes
docker-compose down -v
```

L'application sera accessible sur `http://localhost:3000`

### Développement

```bash
# Démarrer en mode développement (avec hot-reload)
docker-compose -f docker-compose.dev.yml up --build

# Voir les logs
docker-compose -f docker-compose.dev.yml logs -f
```

## 🔧 Configuration

### Variables d'environnement

Créez un fichier `.env` à la racine du projet avec les variables nécessaires :

```env
# Base de données
DATABASE_URL="file:./prisma/dev.db"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="votre-secret-key-changez-en-production"

# OAuth (optionnel)
GOOGLE_CLIENT_ID="votre-google-client-id"
GOOGLE_CLIENT_SECRET="votre-google-client-secret"
FACEBOOK_CLIENT_ID="votre-facebook-client-id"
FACEBOOK_CLIENT_SECRET="votre-facebook-client-secret"

# API Google Places (requis pour l'enrichissement des établissements)
NEXT_PUBLIC_GOOGLE_PLACES_API_KEY="votre-google-places-api-key"
GOOGLE_MAPS_API_KEY="votre-google-maps-api-key"
```

### Initialisation de la base de données

Au premier démarrage, vous devrez exécuter les migrations Prisma :

```bash
# Exécuter les migrations dans le container
docker-compose exec app npx prisma migrate deploy

# Ou en développement
docker-compose -f docker-compose.dev.yml exec app npx prisma migrate dev
```

## 📁 Volumes persistants

Les volumes suivants sont montés pour persister les données :

- `./prisma` : Base de données SQLite et migrations
- `./public/uploads` : Fichiers uploadés par les utilisateurs
- `./logs` : Logs de l'application

## 🔍 Commandes utiles

```bash
# Reconstruire l'image après modification du code
docker-compose build

# Accéder au shell du container
docker-compose exec app sh

# Voir les logs en temps réel
docker-compose logs -f app

# Redémarrer un service spécifique
docker-compose restart app

# Vérifier l'état des services
docker-compose ps
```

## 🏗️ Architecture

L'application utilise un Dockerfile multi-stage :

1. **Builder stage** : Installe les dépendances, génère le client Prisma, et build l'application Next.js
2. **Runner stage** : Image finale optimisée avec uniquement les fichiers nécessaires pour la production

Le mode `standalone` de Next.js crée une version autonome de l'application qui ne nécessite pas `node_modules` complet.

## 🔒 Sécurité

- L'application s'exécute avec un utilisateur non-root (`nextjs`)
- Seuls les fichiers nécessaires sont copiés dans l'image finale
- Les variables sensibles doivent être configurées via `.env`

## 🐛 Dépannage

### Docker n'est pas installé ou commande introuvable

**Erreur** : `zsh: command not found: docker-compose` ou `command not found: docker`

**Solution** :
1. Vérifiez que Docker Desktop est installé et en cours d'exécution
2. Si Docker est installé mais `docker-compose` ne fonctionne pas, essayez :
   ```bash
   docker compose up -d --build
   ```
   (notez l'absence de tiret : `docker compose` au lieu de `docker-compose`)
3. Si cela ne fonctionne toujours pas, installez Docker Desktop (voir section Installation ci-dessus)

### L'application ne démarre pas

```bash
# Vérifier les logs
docker-compose logs app

# Vérifier que le port 3000 n'est pas déjà utilisé
lsof -i :3000
```

### Erreurs de base de données

```bash
# Vérifier que le volume prisma est bien monté
docker-compose exec app ls -la /app/prisma

# Réinitialiser la base de données (ATTENTION: supprime les données)
docker-compose down -v
docker-compose up -d
docker-compose exec app npx prisma migrate deploy
```

### Problèmes de permissions

```bash
# Corriger les permissions des volumes
sudo chown -R $USER:$USER ./prisma ./public/uploads ./logs
```

## 📦 Déploiement en production

Pour un déploiement en production, considérez :

1. **Base de données** : Utiliser PostgreSQL au lieu de SQLite
   - Modifier `DATABASE_URL` dans `.env`
   - Ajouter un service PostgreSQL dans `docker-compose.yml`

2. **Reverse Proxy** : Ajouter Nginx ou Traefik devant l'application

3. **HTTPS** : Configurer SSL/TLS avec Let's Encrypt

4. **Monitoring** : Ajouter des outils de monitoring (Prometheus, Grafana)

5. **Backups** : Mettre en place des sauvegardes régulières de la base de données

## 📚 Ressources

- [Documentation Docker](https://docs.docker.com/)
- [Documentation Next.js Docker](https://nextjs.org/docs/deployment#docker-image)
- [Documentation Prisma](https://www.prisma.io/docs/)

