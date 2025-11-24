#!/bin/bash

# Script pour appliquer toutes les migrations Supabase dans l'ordre
# Usage: ./scripts/apply-all-supabase-migrations.sh

echo "🚀 Application de toutes les migrations Supabase..."
echo ""

# Vérifier si supabase CLI est installé
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI n'est pas installé."
    echo "   Installez-le avec: npm install -g supabase"
    exit 1
fi

# Vérifier si on est connecté à un projet Supabase
if [ -z "$SUPABASE_PROJECT_ID" ] && [ -z "$SUPABASE_DB_URL" ]; then
    echo "⚠️  Aucune configuration Supabase détectée."
    echo "   Options:"
    echo "   1. Utilisez 'supabase db push' pour appliquer toutes les migrations"
    echo "   2. Ou appliquez les migrations manuellement via l'interface Supabase"
    echo ""
    echo "📋 Liste des migrations à appliquer dans l'ordre:"
    ls -1 supabase/migrations/*.sql | sort
    exit 0
fi

# Appliquer toutes les migrations
echo "📦 Application des migrations..."
supabase db push

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Toutes les migrations ont été appliquées avec succès!"
else
    echo ""
    echo "❌ Erreur lors de l'application des migrations."
    echo "   Vérifiez les logs ci-dessus pour plus de détails."
    exit 1
fi

