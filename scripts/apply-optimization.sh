#!/bin/bash

# ============================================
# Script d'Application des Optimisations
# ============================================
# Ce script facilite l'application de la migration
# d'optimisation RLS et Performance
# ============================================

set -e  # Arrêter en cas d'erreur

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
MIGRATION_FILE="supabase/migrations/028_optimization_rls_performance.sql"
VALIDATION_FILE="scripts/validate-optimization.sql"
BACKUP_DIR="backups"
TIMESTAMP=$(date +%Y%m%d-%H%M%S)

# Fonctions utilitaires
print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_header() {
    echo ""
    echo "=========================================="
    echo "$1"
    echo "=========================================="
    echo ""
}

# Vérifier que les fichiers existent
check_files() {
    print_header "Vérification des fichiers"
    
    if [ ! -f "$MIGRATION_FILE" ]; then
        print_error "Fichier de migration introuvable: $MIGRATION_FILE"
        exit 1
    fi
    print_success "Fichier de migration trouvé"
    
    if [ ! -f "$VALIDATION_FILE" ]; then
        print_warning "Fichier de validation introuvable: $VALIDATION_FILE"
        print_info "La validation sera ignorée"
    else
        print_success "Fichier de validation trouvé"
    fi
}

# Vérifier les prérequis
check_prerequisites() {
    print_header "Vérification des prérequis"
    
    # Vérifier que psql est installé
    if ! command -v psql &> /dev/null; then
        print_error "psql n'est pas installé. Veuillez installer PostgreSQL client."
        exit 1
    fi
    print_success "psql est installé"
    
    # Vérifier la variable d'environnement DATABASE_URL
    if [ -z "$DATABASE_URL" ]; then
        print_error "Variable d'environnement DATABASE_URL non définie"
        print_info "Exemple: export DATABASE_URL='postgresql://user:pass@host:port/dbname'"
        exit 1
    fi
    print_success "DATABASE_URL est définie"
}

# Créer un backup
create_backup() {
    print_header "Création du backup"
    
    # Créer le dossier de backup s'il n'existe pas
    mkdir -p "$BACKUP_DIR"
    
    BACKUP_FILE="$BACKUP_DIR/backup-before-optimization-$TIMESTAMP.sql"
    
    print_info "Création du backup: $BACKUP_FILE"
    
    if pg_dump "$DATABASE_URL" > "$BACKUP_FILE" 2>/dev/null; then
        print_success "Backup créé avec succès"
        print_info "Taille du backup: $(du -h "$BACKUP_FILE" | cut -f1)"
    else
        print_error "Échec de la création du backup"
        print_warning "Continuer sans backup? (non recommandé)"
        read -p "Continuer? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 1
        fi
    fi
}

# Vérifier l'extension pg_trgm
check_pg_trgm() {
    print_header "Vérification de l'extension pg_trgm"
    
    print_info "Vérification si pg_trgm est disponible..."
    
    if psql "$DATABASE_URL" -tAc "SELECT 1 FROM pg_available_extensions WHERE name = 'pg_trgm'" | grep -q 1; then
        print_success "Extension pg_trgm est disponible"
        
        if psql "$DATABASE_URL" -tAc "SELECT 1 FROM pg_extension WHERE extname = 'pg_trgm'" | grep -q 1; then
            print_success "Extension pg_trgm est déjà installée"
        else
            print_warning "Extension pg_trgm n'est pas installée"
            print_info "Elle sera installée automatiquement par la migration"
        fi
    else
        print_warning "Extension pg_trgm n'est pas disponible"
        print_info "Les index trigram ne seront pas créés, mais les autres optimisations fonctionneront"
    fi
}

# Appliquer la migration
apply_migration() {
    print_header "Application de la migration"
    
    print_info "Application de: $MIGRATION_FILE"
    print_warning "Cette opération peut prendre 15-20 minutes..."
    
    if psql "$DATABASE_URL" -f "$MIGRATION_FILE" 2>&1 | tee "/tmp/migration-output-$TIMESTAMP.log"; then
        print_success "Migration appliquée avec succès"
    else
        print_error "Échec de l'application de la migration"
        print_info "Consulter les logs: /tmp/migration-output-$TIMESTAMP.log"
        exit 1
    fi
}

# Valider les optimisations
validate_optimization() {
    if [ ! -f "$VALIDATION_FILE" ]; then
        print_warning "Fichier de validation introuvable, validation ignorée"
        return
    fi
    
    print_header "Validation des optimisations"
    
    print_info "Exécution du script de validation..."
    print_warning "Cette opération peut prendre 2-3 minutes..."
    
    VALIDATION_OUTPUT="/tmp/validation-output-$TIMESTAMP.log"
    
    if psql "$DATABASE_URL" -f "$VALIDATION_FILE" > "$VALIDATION_OUTPUT" 2>&1; then
        print_success "Validation terminée"
        print_info "Résultats sauvegardés dans: $VALIDATION_OUTPUT"
        print_info "Consulter le fichier pour les détails"
    else
        print_warning "Des erreurs ont été détectées lors de la validation"
        print_info "Consulter les logs: $VALIDATION_OUTPUT"
    fi
}

# Exécuter VACUUM ANALYZE
run_vacuum() {
    print_header "Optimisation avec VACUUM ANALYZE"
    
    print_warning "VACUUM ANALYZE peut prendre du temps sur les grandes tables"
    read -p "Exécuter VACUUM ANALYZE maintenant? (y/N): " -n 1 -r
    echo
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_info "Exécution de VACUUM ANALYZE..."
        
        TABLES=("users" "professionals" "location_preferences" "establishments")
        
        for table in "${TABLES[@]}"; do
            print_info "VACUUM ANALYZE sur: $table"
            if psql "$DATABASE_URL" -c "VACUUM ANALYZE $table;" 2>&1; then
                print_success "VACUUM ANALYZE terminé pour $table"
            else
                print_warning "Erreur lors du VACUUM ANALYZE pour $table"
            fi
        done
        
        print_success "VACUUM ANALYZE terminé"
    else
        print_info "VACUUM ANALYZE ignoré (peut être exécuté plus tard)"
    fi
}

# Résumé final
print_summary() {
    print_header "Résumé de l'opération"
    
    print_success "Optimisations appliquées avec succès!"
    echo ""
    echo "📁 Fichiers générés:"
    echo "   - Backup: $BACKUP_DIR/backup-before-optimization-$TIMESTAMP.sql"
    echo "   - Logs migration: /tmp/migration-output-$TIMESTAMP.log"
    if [ -f "$VALIDATION_FILE" ]; then
        echo "   - Logs validation: /tmp/validation-output-$TIMESTAMP.log"
    fi
    echo ""
    echo "📊 Prochaines étapes:"
    echo "   1. Vérifier les logs pour détecter d'éventuelles erreurs"
    echo "   2. Surveiller les performances pendant 48h"
    echo "   3. Consulter la documentation: docs/optimization/README.md"
    echo ""
    echo "📈 Résultats attendus:"
    echo "   - Gain de performance: 85% de réduction"
    echo "   - Temps d'exécution: < 500ms pour 95% des requêtes"
    echo ""
}

# Fonction principale
main() {
    print_header "Application des Optimisations RLS et Performance"
    
    print_info "Ce script va:"
    echo "  1. Vérifier les prérequis"
    echo "  2. Créer un backup de la base de données"
    echo "  3. Vérifier l'extension pg_trgm"
    echo "  4. Appliquer la migration"
    echo "  5. Valider les optimisations"
    echo "  6. Proposer d'exécuter VACUUM ANALYZE"
    echo ""
    
    read -p "Continuer? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_info "Opération annulée"
        exit 0
    fi
    
    check_files
    check_prerequisites
    create_backup
    check_pg_trgm
    apply_migration
    validate_optimization
    run_vacuum
    print_summary
    
    print_success "Terminé!"
}

# Exécuter le script principal
main

