#!/bin/bash

# Script de démarrage rapide pour Docker

set -e

echo "🐳 Démarrage de Envie2Sortir avec Docker"
echo ""

# Vérifier si Docker est installé
if ! command -v docker &> /dev/null; then
    echo "❌ Docker n'est pas installé. Veuillez l'installer d'abord."
    exit 1
fi

# Vérifier si Docker Compose est installé
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose n'est pas installé. Veuillez l'installer d'abord."
    exit 1
fi

# Créer les répertoires nécessaires s'ils n'existent pas
mkdir -p prisma public/uploads logs

# Vérifier si un fichier .env existe
if [ ! -f .env ]; then
    echo "⚠️  Fichier .env non trouvé. Création d'un fichier .env exemple..."
    if [ -f .env.example ]; then
        cp .env.example .env
        echo "✅ Fichier .env créé depuis .env.example"
        echo "⚠️  N'oubliez pas de configurer les variables dans .env !"
    else
        echo "❌ Fichier .env.example non trouvé. Veuillez créer un fichier .env manuellement."
    fi
fi

# Demander le mode (dev ou prod)
echo ""
echo "Choisissez le mode de démarrage:"
echo "1) Production (recommandé)"
echo "2) Développement (avec hot-reload)"
read -p "Votre choix (1 ou 2): " mode

if [ "$mode" = "2" ]; then
    echo ""
    echo "🚀 Démarrage en mode DÉVELOPPEMENT..."
    docker-compose -f docker-compose.dev.yml up --build
else
    echo ""
    echo "🚀 Démarrage en mode PRODUCTION..."
    
    # Construire l'image
    echo "📦 Construction de l'image Docker..."
    docker-compose build
    
    # Démarrer les services
    echo "▶️  Démarrage des services..."
    docker-compose up -d
    
    # Attendre un peu pour que le service démarre
    echo "⏳ Attente du démarrage du service..."
    sleep 5
    
    # Vérifier si la base de données existe, sinon exécuter les migrations
    if [ ! -f prisma/dev.db ]; then
        echo "📊 Initialisation de la base de données..."
        docker-compose exec -T app npx prisma migrate deploy || echo "⚠️  Les migrations peuvent être nécessaires. Exécutez: docker-compose exec app npx prisma migrate deploy"
    fi
    
    echo ""
    echo "✅ Application démarrée !"
    echo "🌐 Accès: http://localhost:3000"
    echo ""
    echo "Commandes utiles:"
    echo "  - Voir les logs: docker-compose logs -f"
    echo "  - Arrêter: docker-compose down"
    echo "  - Redémarrer: docker-compose restart"
fi

