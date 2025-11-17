# Stop script on the first error
$ErrorActionPreference = 'Stop'

# --- Logging Functions with Colors ---
function log_info {
    param([string]$Message)
    Write-Host -ForegroundColor Green "✓ $Message"
}

function log_warn {
    param([string]$Message)
    Write-Host -ForegroundColor Yellow "⚠ $Message"
}

function log_error {
    param([string]$Message)
    Write-Host -ForegroundColor Red "✗ $Message"
    exit 1
}


# --- Helper Functions ---

# Verify we're in the right directory by checking for package.json
function Verify-RepoRoot {
    if (-not (Test-Path -Path ".\package.json" -PathType Leaf)) {
        log_error "package.json not found. Please run this script from the project's root directory."
    }
    log_info "Project root detected"
}

# Check for required command-line tools
function Check-Dependencies {
    log_info "Checking dependencies..."

    # Check Node.js
    if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
        log_error "Node.js is not installed. Please install it from https://nodejs.org/"
    }
    $nodeVersion = (node -v)
    $nodeMajorVersion = ($nodeVersion -replace 'v', '').Split('.')[0]
    if ([int]$nodeMajorVersion -lt 20) {
        log_warn "Node.js ${nodeVersion} detected. v20.x is recommended."
    } else {
        log_info "Node.js ${nodeVersion} detected"
    }

    # Check npm
    if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
        log_error "npm is not installed. It should come with Node.js."
    }
    log_info "npm $((npm -v)) detected"

    # Check openssl for secret generation
    if (-not (Get-Command openssl -ErrorAction SilentlyContinue)) {
        log_warn "openssl not found. Cannot auto-generate NEXTAUTH_SECRET. Please install it (e.g., via Git for Windows)."
    }
}

# Install npm dependencies
function Install-Dependencies {
    if (Test-Path -Path ".\node_modules" -PathType Container) {
        log_info "node_modules exists, running 'npm install' to ensure everything is up-to-date."
    } else {
        log_info "Installing npm dependencies..."
    }
    # Use npm.cmd for explicit execution in PowerShell
    npm.cmd install
}

# Set up the .env file
function Setup-EnvironmentFile {
    if (Test-Path -Path ".\.env" -PathType Leaf) {
        log_warn ".env file already exists, skipping creation to preserve your settings."
        return
    }

    if (-not (Test-Path -Path ".\.env.development" -PathType Leaf)) {
        log_error ".env.development template not found. Cannot create .env file."
    }

    log_info "Creating .env from .env.development..."
    Copy-Item -Path ".\.env.development" -Destination ".\.env"

    # Generate and inject NEXTAUTH_SECRET if openssl is available
    if (Get-Command openssl -ErrorAction SilentlyContinue) {
        $secret = (openssl rand -base64 32)

        $newContent = Get-Content -Path ".\.env" | ForEach-Object {
            if ($_.StartsWith('NEXTAUTH_SECRET=')) {
                # Replace this line with the new secret
                "NEXTAUTH_SECRET=$secret"
            } else {
                # Keep all other lines as they are
                $_
            }
        }
        $newContent | Set-Content -Path ".\.env"

        log_info "Generated and set NEXTAUTH_SECRET"
    }
}

# Set up and migrate the database
function Setup-Database {
    log_info "Setting up Prisma database..."
    npx.cmd prisma migrate dev
    npx.cmd prisma generate
    log_info "Database migrated and Prisma client generated"
}

# Seed the database with initial data
function Seed-Database {
    log_info "Seeding database with test data..."
    npm.cmd run seed
    log_info "Database seeded successfully"
}


# --- Main Execution ---
function main {
    Write-Host ""
    log_info "Starting automated setup for the Design Patterns workshop..."
    Write-Host ""

    Verify-RepoRoot
    Check-Dependencies
    Install-Dependencies
    Setup-EnvironmentFile
    Setup-Database
    Seed-Database

    Write-Host ""
    log_info "Setup complete! 🎉"
    Write-Host ""
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    Write-Host ""
    Write-Host "  Next steps:"
    Write-Host "  1. Start the development server:  npm run dev"
    Write-Host "  2. Open your browser to:          http://localhost:3000"
    Write-Host ""
    Write-Host "  Test Users:"
    Write-Host "    - test@test.com / password123"
    Write-Host "    - bob@example.com / password123"
    Write-Host ""
    Write-Host "  Database Tools:"
    Write-Host "    - View data with GUI:      npx prisma studio"
    Write-Host "    - Reset the database:      npx prisma migrate reset"
    Write-Host ""
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    Write-Host ""
}

main
