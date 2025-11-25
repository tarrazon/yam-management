#!/bin/bash

# YAM Management Platform - Script de Configuration
# Ce script vous aide à configurer rapidement votre nouvel environnement

echo "╔════════════════════════════════════════════════════════════╗"
echo "║   YAM Management Platform - Configuration Assistant       ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Couleurs pour le terminal
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fonction pour afficher les étapes
print_step() {
    echo -e "${BLUE}[ÉTAPE $1]${NC} $2"
}

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

# Vérification de la présence de Node.js
print_step "1" "Vérification de Node.js..."
if ! command -v node &> /dev/null; then
    print_error "Node.js n'est pas installé. Veuillez l'installer : https://nodejs.org/"
    exit 1
fi
print_success "Node.js $(node -v) détecté"

# Vérification de npm
if ! command -v npm &> /dev/null; then
    print_error "npm n'est pas installé."
    exit 1
fi
print_success "npm $(npm -v) détecté"

echo ""
print_step "2" "Configuration des variables d'environnement"
echo ""

# Demander les informations Supabase
echo "Veuillez entrer vos informations Supabase :"
echo "(Disponibles sur https://supabase.com > Votre Projet > Settings > API)"
echo ""

read -p "URL Supabase (ex: https://xxxxx.supabase.co): " SUPABASE_URL
read -p "Clé ANON publique : " SUPABASE_ANON_KEY

echo ""
echo "Clés API optionnelles (appuyez sur Entrée pour garder les valeurs actuelles) :"
echo ""

# Valeurs par défaut de l'ancien projet
DEFAULT_GOOGLE_MAPS_KEY="AIzaSyCylRH1zDC8tfT6nZ9756ybT3veE9tKFhM"
DEFAULT_RESEND_KEY="re_PymVKmBe_8iTtyVbfGsUbQ2p68qYnmCRv"

read -p "Google Maps API Key [${DEFAULT_GOOGLE_MAPS_KEY}]: " GOOGLE_MAPS_KEY
GOOGLE_MAPS_KEY=${GOOGLE_MAPS_KEY:-$DEFAULT_GOOGLE_MAPS_KEY}

read -p "Resend API Key [${DEFAULT_RESEND_KEY}]: " RESEND_KEY
RESEND_KEY=${RESEND_KEY:-$DEFAULT_RESEND_KEY}

# Créer le fichier .env
echo ""
print_step "3" "Création du fichier .env..."

cat > .env << EOF
# Supabase Configuration
VITE_SUPABASE_URL=${SUPABASE_URL}
VITE_SUPABASE_ANON_KEY=${SUPABASE_ANON_KEY}

# API Keys
VITE_GOOGLE_MAPS_API_KEY=${GOOGLE_MAPS_KEY}
RESEND_API_KEY=${RESEND_KEY}
EOF

print_success "Fichier .env créé avec succès"

# Installation des dépendances
echo ""
print_step "4" "Installation des dépendances npm..."
npm install

if [ $? -eq 0 ]; then
    print_success "Dépendances installées avec succès"
else
    print_error "Erreur lors de l'installation des dépendances"
    exit 1
fi

# Vérification de Supabase CLI
echo ""
print_step "5" "Vérification de Supabase CLI..."

if ! command -v supabase &> /dev/null; then
    print_warning "Supabase CLI n'est pas installé"
    echo ""
    echo "Pour déployer les Edge Functions, installez Supabase CLI :"
    echo "  npm install -g supabase"
    echo ""
    echo "Puis exécutez :"
    echo "  supabase login"
    echo "  supabase link --project-ref VOTRE-PROJECT-ID"
    echo ""
else
    print_success "Supabase CLI $(supabase --version) détecté"

    echo ""
    read -p "Voulez-vous lier ce projet à Supabase maintenant ? (o/N): " LINK_PROJECT

    if [ "$LINK_PROJECT" = "o" ] || [ "$LINK_PROJECT" = "O" ]; then
        echo ""
        read -p "Entrez votre Project Reference ID (visible dans l'URL Supabase): " PROJECT_REF

        supabase link --project-ref $PROJECT_REF

        if [ $? -eq 0 ]; then
            print_success "Projet lié avec succès"

            echo ""
            read -p "Voulez-vous déployer toutes les Edge Functions maintenant ? (o/N): " DEPLOY_FUNCTIONS

            if [ "$DEPLOY_FUNCTIONS" = "o" ] || [ "$DEPLOY_FUNCTIONS" = "O" ]; then
                echo ""
                print_step "6" "Déploiement des Edge Functions..."

                FUNCTIONS=(
                    "create-user"
                    "expire-options-cron"
                    "export-database"
                    "export-lots"
                    "reset-password-with-token"
                    "send-birthday-emails"
                    "send-option-notification"
                    "send-password-reset"
                    "send-workflow-notification"
                )

                for func in "${FUNCTIONS[@]}"; do
                    echo ""
                    echo "Déploiement de ${func}..."
                    supabase functions deploy $func

                    if [ $? -eq 0 ]; then
                        print_success "$func déployée"
                    else
                        print_error "Erreur lors du déploiement de $func"
                    fi
                done

                # Configuration des secrets
                echo ""
                print_step "7" "Configuration des secrets..."
                echo ""
                read -p "Voulez-vous configurer les secrets pour les Edge Functions ? (o/N): " CONFIG_SECRETS

                if [ "$CONFIG_SECRETS" = "o" ] || [ "$CONFIG_SECRETS" = "O" ]; then
                    supabase secrets set RESEND_API_KEY=${RESEND_KEY}
                    print_success "Secret RESEND_API_KEY configuré"
                fi
            fi
        else
            print_error "Erreur lors de la liaison du projet"
        fi
    fi
fi

# Build du projet
echo ""
print_step "8" "Build du projet..."
npm run build

if [ $? -eq 0 ]; then
    print_success "Build réussi"
else
    print_error "Erreur lors du build"
    exit 1
fi

# Résumé final
echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║                Configuration Terminée !                    ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
echo "Prochaines étapes :"
echo ""
echo "1. Restaurer votre base de données :"
echo "   - Allez sur https://supabase.com"
echo "   - Ouvrez le SQL Editor"
echo "   - Collez le contenu de votre fichier SQL d'export"
echo "   - Exécutez le script"
echo ""
echo "2. Créer le bucket Storage :"
echo "   - Allez dans Storage > Create bucket"
echo "   - Nom: 'documents'"
echo "   - Public: NON"
echo ""
echo "3. Lancer l'application :"
echo "   - npm run dev"
echo ""
echo "4. Importer vos documents :"
echo "   - Connectez-vous en admin"
echo "   - Allez dans 'Export des données'"
echo "   - Importez votre fichier JSON de documents"
echo ""
echo "Pour plus de détails, consultez MIGRATION_GUIDE.md"
echo ""
print_success "Configuration terminée avec succès !"
