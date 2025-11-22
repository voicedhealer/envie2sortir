#!/bin/bash

# Script pour revenir à Prisma (local)
# Usage: ./scripts/switch-to-prisma.sh

echo "🔄 Retour à Prisma (local)..."
echo ""

# Créer un backup de .env.local s'il existe
if [ -f .env.local ]; then
    echo "📦 Backup de .env.local existant..."
    cp .env.local .env.local.backup.$(date +%Y%m%d_%H%M%S)
fi

# Supprimer .env.local (Next.js utilisera .env)
echo "🗑️  Suppression de .env.local..."
rm .env.local

echo ""
echo "✅ Retour à Prisma terminé !"
echo ""
echo "💡 Next.js utilisera maintenant .env (Prisma local)"
echo "   npm run dev              # Redémarrer le serveur"

