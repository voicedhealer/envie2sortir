#!/bin/bash

# Script pour appliquer les migrations Storage sur Supabase
# Usage: ./scripts/apply-storage-migrations.sh

set -e

echo "🚀 Application des migrations Storage sur Supabase..."
echo ""

# Couleurs pour l'affichage
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Vérifier que supabase CLI est installé
if ! command -v supabase &> /dev/null; then
    echo -e "${RED}❌ Supabase CLI n'est pas installé${NC}"
    echo ""
    echo "Installation:"
    echo "  macOS:  brew install supabase/tap/supabase"
    echo "  Linux:  https://supabase.com/docs/guides/cli"
    echo ""
    exit 1
fi

# Vérifier que nous sommes dans le bon répertoire
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Ce script doit être exécuté depuis la racine du projet${NC}"
    exit 1
fi

# Vérifier que le projet Supabase est lié
if [ ! -f ".supabase/config.toml" ]; then
    echo -e "${YELLOW}⚠️  Projet Supabase non lié${NC}"
    echo ""
    echo "Lier le projet:"
    echo "  supabase link --project-ref YOUR_PROJECT_REF"
    echo ""
    echo "Ou appliquer manuellement via le dashboard:"
    echo "  → docs/APPLIQUER_MIGRATIONS_STORAGE.md"
    echo ""
    exit 1
fi

echo -e "${YELLOW}📋 Migrations à appliquer:${NC}"
echo "  - 003_storage_setup.sql (buckets principaux)"
echo "  - 007_add_images_bucket.sql (bucket images)"
echo ""

# Demander confirmation
read -p "Continuer ? (y/n) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Annulé"
    exit 1
fi

echo ""
echo "🔧 Application des migrations..."
echo ""

# Appliquer les migrations dans l'ordre
echo -e "${YELLOW}→ Migration 003: Storage Setup...${NC}"
supabase db push --file supabase/migrations/003_storage_setup.sql || {
    echo -e "${RED}❌ Erreur lors de l'application de 003_storage_setup.sql${NC}"
    exit 1
}
echo -e "${GREEN}✅ Migration 003 appliquée${NC}"
echo ""

echo -e "${YELLOW}→ Migration 007: Images Bucket...${NC}"
supabase db push --file supabase/migrations/007_add_images_bucket.sql || {
    echo -e "${RED}❌ Erreur lors de l'application de 007_add_images_bucket.sql${NC}"
    exit 1
}
echo -e "${GREEN}✅ Migration 007 appliquée${NC}"
echo ""

echo -e "${GREEN}✅ Toutes les migrations Storage ont été appliquées avec succès !${NC}"
echo ""
echo "📋 Vérification des buckets créés:"
echo ""

# Afficher les buckets créés
echo "SELECT id, name, public FROM storage.buckets ORDER BY name;" | supabase db query || {
    echo -e "${YELLOW}⚠️  Impossible de vérifier les buckets (vérifiez manuellement)${NC}"
}

echo ""
echo -e "${GREEN}🎉 C'est prêt ! Vous pouvez maintenant uploader des images.${NC}"

