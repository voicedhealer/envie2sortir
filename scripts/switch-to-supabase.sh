#!/bin/bash

# Script pour basculer vers Supabase
# Usage: ./scripts/switch-to-supabase.sh

echo "🔄 Basculement vers Supabase..."
echo ""

# Vérifier que .env.dev existe
if [ ! -f .env.dev ]; then
    echo "❌ Erreur: .env.dev n'existe pas"
    echo "💡 Créez-le d'abord avec vos clés Supabase"
    exit 1
fi

# Créer un backup de .env.local s'il existe
if [ -f .env.local ]; then
    echo "📦 Backup de .env.local existant..."
    cp .env.local .env.local.backup.$(date +%Y%m%d_%H%M%S)
fi

# Copier .env.dev vers .env.local
echo "📋 Copie de .env.dev vers .env.local..."
cp .env.dev .env.local

echo ""
echo "✅ Basculement terminé !"
echo ""
echo "⚠️  IMPORTANT: Éditez .env.local et remplissez vos vraies clés Supabase :"
echo "   - NEXT_PUBLIC_SUPABASE_URL"
echo "   - NEXT_PUBLIC_SUPABASE_ANON_KEY"
echo "   - SUPABASE_SERVICE_ROLE_KEY"
echo ""
echo "💡 Commandes utiles :"
echo "   nano .env.local          # Éditer le fichier"
echo "   npm run test:supabase    # Tester la connexion"
echo "   npm run dev              # Redémarrer le serveur"

