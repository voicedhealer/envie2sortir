# 🐳 Guide Docker pour Envie2Sortir

Ce guide vous explique comment dockeriser et déployer l'application Envie2Sortir.

## 📋 Prérequis

- Docker 20.10+
- Docker Compose 2.0+
- Git

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

