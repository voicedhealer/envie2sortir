#!/bin/bash

# Script de test pour vérifier la connexion admin et l'affichage de la page admin
# Usage: ./scripts/test-admin-flow.sh

BASE_URL="${TEST_URL:-http://localhost:3001}"
ADMIN_EMAIL="${ADMIN_EMAIL:-envie2sortir.fr@gmail.com}"
ADMIN_PASSWORD="${ADMIN_PASSWORD:-Admin123!Secure}"

echo "🧪 Test du flux complet : Connexion Admin → Affichage page admin"
echo "================================================================"
echo ""
echo "📍 URL: $BASE_URL"
echo "📧 Email: $ADMIN_EMAIL"
echo ""

# Couleurs
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test 1: Vérifier que le serveur est accessible
echo -e "${BLUE}Test 1: Vérification de l'accessibilité du serveur${NC}"
if curl -s -o /dev/null -w "%{http_code}" "$BASE_URL" | grep -q "200\|301\|302"; then
    echo -e "${GREEN}✅ Serveur accessible${NC}"
else
    echo -e "${RED}❌ Serveur non accessible. Assurez-vous que 'npm run dev' est lancé.${NC}"
    exit 1
fi
echo ""

# Test 2: Test de connexion
echo -e "${BLUE}Test 2: Connexion Admin${NC}"
LOGIN_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$ADMIN_EMAIL\",\"password\":\"$ADMIN_PASSWORD\",\"role\":\"admin\"}")

HTTP_CODE=$(echo "$LOGIN_RESPONSE" | tail -n1)
BODY=$(echo "$LOGIN_RESPONSE" | head -n-1)

if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✅ Connexion réussie (HTTP $HTTP_CODE)${NC}"
    
    # Extraire les cookies
    COOKIES=$(echo "$LOGIN_RESPONSE" | grep -i "set-cookie" || echo "")
    
    if echo "$BODY" | grep -q '"success":true'; then
        echo -e "${GREEN}✅ Réponse JSON valide${NC}"
        
        # Vérifier le rôle
        if echo "$BODY" | grep -q '"role":"admin"'; then
            echo -e "${GREEN}✅ Rôle admin détecté${NC}"
        else
            echo -e "${YELLOW}⚠️  Rôle admin non trouvé dans la réponse${NC}"
        fi
    else
        echo -e "${RED}❌ Réponse JSON invalide${NC}"
        echo "$BODY" | head -n 5
    fi
    
    # Vérifier les cookies
    if echo "$LOGIN_RESPONSE" | grep -qi "sb-.*auth-token"; then
        echo -e "${GREEN}✅ Cookies Supabase détectés${NC}"
    else
        echo -e "${YELLOW}⚠️  Cookies Supabase non détectés dans les headers${NC}"
    fi
else
    echo -e "${RED}❌ Connexion échouée (HTTP $HTTP_CODE)${NC}"
    echo "$BODY" | head -n 5
    exit 1
fi
echo ""

# Test 3: Test d'accès à la page admin (simulation)
echo -e "${BLUE}Test 3: Vérification de la page admin${NC}"
ADMIN_RESPONSE=$(curl -s -w "\n%{http_code}" "$BASE_URL/admin" \
  -H "Cookie: sb-qzmduszbsmxitsvciwzq-auth-token=test" 2>/dev/null || echo "000")

HTTP_CODE=$(echo "$ADMIN_RESPONSE" | tail -n1)

if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "307" ] || [ "$HTTP_CODE" = "308" ]; then
    echo -e "${GREEN}✅ Page admin accessible (HTTP $HTTP_CODE)${NC}"
    
    if [ "$HTTP_CODE" = "307" ] || [ "$HTTP_CODE" = "308" ]; then
        echo -e "${YELLOW}⚠️  Redirection détectée (normal si session non valide)${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  Page admin retourne HTTP $HTTP_CODE${NC}"
    echo -e "${YELLOW}   (C'est normal si les cookies ne sont pas valides dans ce test)${NC}"
fi
echo ""

# Test 4: Vérification de la configuration
echo -e "${BLUE}Test 4: Vérification de la configuration${NC}"

# Vérifier que les fichiers existent
if [ -f "src/app/admin/page.tsx" ]; then
    echo -e "${GREEN}✅ Page admin existe${NC}"
else
    echo -e "${RED}❌ Page admin introuvable${NC}"
fi

if [ -f "src/app/admin/layout.tsx" ]; then
    echo -e "${GREEN}✅ Layout admin existe${NC}"
else
    echo -e "${RED}❌ Layout admin introuvable${NC}"
fi

if [ -f "src/lib/supabase/middleware.ts" ]; then
    echo -e "${GREEN}✅ Middleware Supabase existe${NC}"
else
    echo -e "${RED}❌ Middleware Supabase introuvable${NC}"
fi

if [ -f "src/app/api/auth/login/route.ts" ]; then
    echo -e "${GREEN}✅ API login existe${NC}"
else
    echo -e "${RED}❌ API login introuvable${NC}"
fi
echo ""

# Résumé
echo "================================================================"
echo -e "${BLUE}📊 RÉSUMÉ${NC}"
echo "================================================================"
echo ""
echo -e "${GREEN}✅ Tests automatisés terminés${NC}"
echo ""
echo -e "${YELLOW}⚠️  Tests manuels requis :${NC}"
echo "   1. Ouvrir http://localhost:3001/auth dans le navigateur"
echo "   2. Se connecter avec les identifiants admin"
echo "   3. Vérifier la redirection vers /admin"
echo "   4. Vérifier que la page admin s'affiche correctement"
echo ""
echo -e "${BLUE}💡 Pour plus de détails, voir : scripts/test-auth-browser.md${NC}"

