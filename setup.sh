#!/usr/bin/env bash
set -e

# --- Logging and Colors ---
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log_info() { echo -e "${GREEN}✓${NC} $1"; }
log_warn() { echo -e "${YELLOW}⚠${NC} $1"; }
log_error() { echo -e "${RED}✗${NC} $1"; exit 1; }

# --- Helper Functions ---

# Verify we're in the right directory by checking for package.json
verify_repo_root() {
    if [ ! -f "package.json" ]; then
        log_error "package.json not found. Please run this script from the project's root directory."
    fi
    log_info "Project root detected"
}

# Check for required command-line tools
check_dependencies() {
    log_info "Checking dependencies..."

    # Check Node.js
    if ! command -v node &> /dev/null; then
        log_error "Node.js is not installed. Please install it from https://nodejs.org/"
    fi
    NODE_VERSION=$(node -v)
    NODE_MAJOR_VERSION=$(echo "$NODE_VERSION" | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_MAJOR_VERSION" -lt 20 ]; then
        log_warn "Node.js ${NODE_VERSION} detected. v20.x is recommended."
    else
        log_info "Node.js ${NODE_VERSION} detected"
    fi

    # Check npm
    if ! command -v npm &> /dev/null; then
        log_error "npm is not installed. It should come with Node.js."
    fi
    log_info "npm $(npm -v) detected"

    # Check openssl for secret generation
    if ! command -v openssl &> /dev/null; then
        log_warn "openssl not found. Cannot auto-generate NEXTAUTH_SECRET."
    fi
}

# Install npm dependencies
install_dependencies() {
    if [ -d "node_modules" ]; then
        log_info "node_modules exists, running 'npm install' to ensure everything is up-to-date."
    else
        log_info "Installing npm dependencies..."
    fi
    npm install
}

# Set up the .env file
setup_environment_file() {
    if [ -f ".env" ]; then
        log_warn ".env file already exists, skipping creation to preserve your settings."
        return
    fi

    if [ ! -f ".env.development" ]; then
        log_error ".env.development template not found. Cannot create .env file."
    fi

    log_info "Creating .env from .env.development..."
    cp .env.development .env

    # Generate and inject NEXTAUTH_SECRET if openssl is available
    if command -v openssl &> /dev/null; then
        SECRET=$(openssl rand -base64 32)
        # sed -i.bak is used for cross-platform compatibility (macOS/Linux)
        sed -i.bak "s|^NEXTAUTH_SECRET=.*|NEXTAUTH_SECRET=${SECRET}|" .env
        rm -f .env.bak # Clean up the backup file created by sed
        log_info "Generated and set NEXTAUTH_SECRET"
    fi
}

# Set up and migrate the database
setup_database() {
    log_info "Setting up Prisma database..."
    npx prisma migrate dev
    npx prisma generate
    log_info "Database migrated and Prisma client generated"
}

# Seed the database with initial data
seed_database() {
    log_info "Seeding database with test data..."
    npm run seed
    log_info "Database seeded successfully"
}

# --- Main Execution ---
main() {
    echo ""
    log_info "Starting automated setup for the Design Patterns workshop..."
    echo ""

    verify_repo_root
    check_dependencies
    install_dependencies
    setup_environment_file
    setup_database
    seed_database

    echo ""
    log_info "Setup complete! 🎉"
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "  Next steps:"
    echo "  1. Start the development server:  npm run dev"
    echo "  2. Open your browser to:          http://localhost:3000"
    echo ""
    echo "  Test Users:"
    echo "    - test@test.com / password123"
    echo "    - bob@example.com / password123"
    echo ""
    echo "  Database Tools:"
    echo "    - View data with GUI:      npx prisma studio"
    echo "    - Reset the database:      npx prisma migrate reset"
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
}

main "$@"
