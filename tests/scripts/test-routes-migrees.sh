#!/bin/bash

# Script de test des routes migrées vers Supabase
# Usage: ./scripts/test-routes-migrees.sh

BASE_URL="http://localhost:3000"

echo "🧪 Test des routes migrées vers Supabase"
echo "========================================"
echo ""

# Vérifier que le serveur tourne
if ! curl -s "$BASE_URL" > /dev/null 2>&1; then
    echo "❌ ERREUR: Le serveur Next.js n'est pas démarré !"
    echo ""
    echo "💡 Solution:"
    echo "   1. Ouvrez un terminal"
    echo "   2. Exécutez: npm run dev"
    echo "   3. Attendez que le serveur démarre"
    echo "   4. Relancez ce script dans un autre terminal"
    echo ""
    exit 1
fi

echo "✅ Serveur Next.js actif"
echo ""

# Test 1: GET /api/categories
echo "1️⃣  Test GET /api/categories"
RESPONSE=$(curl -s "$BASE_URL/api/categories")
if echo "$RESPONSE" | grep -q "categories"; then
    COUNT=$(echo "$RESPONSE" | grep -o '"count"' | wc -l)
    echo "   ✅ Succès ($COUNT catégories trouvées)"
else
    echo "   ❌ Erreur: $RESPONSE"
fi
echo ""

# Test 2: GET /api/recherche/envie
echo "2️⃣  Test GET /api/recherche/envie"
RESPONSE=$(curl -s "$BASE_URL/api/recherche/envie?envie=restaurant&ville=Paris&rayon=5")
if echo "$RESPONSE" | grep -q "results"; then
    echo "   ✅ Succès (recherche fonctionnelle)"
else
    echo "   ❌ Erreur: $RESPONSE"
fi
echo ""

# Test 3: GET /api/etablissements/[slug]
echo "3️⃣  Test GET /api/etablissements/[slug]"
# Utiliser un slug réel trouvé dans la base
SLUG="battlekart-dijon"
RESPONSE=$(curl -s "$BASE_URL/api/etablissements/$SLUG")
if echo "$RESPONSE" | grep -q "success\|data"; then
    echo "   ✅ Succès (établissement trouvé: $SLUG)"
else
    echo "   ⚠️  Établissement non trouvé ou erreur"
    echo "   Réponse: $(echo "$RESPONSE" | head -c 100)..."
fi
echo ""

# Test 4: Vérifier Supabase
echo "4️⃣  Vérification Supabase"
if npm run test:supabase > /dev/null 2>&1; then
    echo "   ✅ Connexion Supabase OK"
else
    echo "   ⚠️  Vérifiez la connexion Supabase"
fi
echo ""

echo "✅ Tests terminés"
echo ""
echo "💡 Pour voir les détails complets:"
echo "   curl $BASE_URL/api/categories | jq"
echo "   curl \"$BASE_URL/api/recherche/envie?envie=restaurant&ville=Paris&rayon=5\" | jq"

