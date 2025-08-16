#!/bin/sh
# BAM Development Installation Script
# Installs BAM from the feat/modernize branch for testing
# Usage: curl -fsSL https://raw.githubusercontent.com/twilson63/bam/feat/modernize/install-dev.sh | sh

set -e

# Configuration
GITHUB_REPO="twilson63/bam"
BRANCH="feat/modernize"
INSTALL_DIR="${INSTALL_DIR:-$HOME/.local/bin}"

# Colors
if [ -t 1 ]; then
    RED='\033[0;31m'
    GREEN='\033[0;32m'
    YELLOW='\033[1;33m'
    BLUE='\033[0;34m'
    RESET='\033[0m'
else
    RED=''
    GREEN=''
    YELLOW=''
    BLUE=''
    RESET=''
fi

# Logging functions
log() {
    echo "${GREEN}[BAM]${RESET} $1"
}

error() {
    echo "${RED}[ERROR]${RESET} $1" >&2
}

warning() {
    echo "${YELLOW}[WARNING]${RESET} $1"
}

# Detect platform
detect_platform() {
    OS="$(uname -s)"
    ARCH="$(uname -m)"
    
    case "$OS" in
        Darwin)
            PLATFORM="macos"
            ;;
        Linux)
            PLATFORM="linux"
            ;;
        MINGW*|MSYS*|CYGWIN*)
            PLATFORM="windows"
            ;;
        *)
            error "Unsupported OS: $OS"
            exit 1
            ;;
    esac
    
    case "$ARCH" in
        x86_64|amd64)
            ARCH="x64"
            ;;
        arm64|aarch64)
            ARCH="arm64"
            ;;
        *)
            warning "Unknown architecture $ARCH, using x64"
            ARCH="x64"
            ;;
    esac
    
    # Determine binary name
    if [ "$PLATFORM" = "windows" ]; then
        BINARY_NAME="bam-${PLATFORM}-${ARCH}.exe"
    else
        BINARY_NAME="bam-${PLATFORM}-${ARCH}"
    fi
    
    log "Detected platform: ${PLATFORM}-${ARCH}"
}

# Check for required tools
check_requirements() {
    if ! command -v curl >/dev/null 2>&1 && ! command -v wget >/dev/null 2>&1; then
        error "curl or wget is required"
        exit 1
    fi
    
    if command -v curl >/dev/null 2>&1; then
        DOWNLOAD_CMD="curl -fsSL"
        DOWNLOAD_OUTPUT="-o"
    else
        DOWNLOAD_CMD="wget -qO"
        DOWNLOAD_OUTPUT=""
    fi
}

# Create install directory
create_install_dir() {
    if [ ! -d "$INSTALL_DIR" ]; then
        log "Creating directory: $INSTALL_DIR"
        mkdir -p "$INSTALL_DIR"
    fi
    
    # Check if we can write to the directory
    if [ ! -w "$INSTALL_DIR" ]; then
        error "Cannot write to $INSTALL_DIR"
        error "Try setting INSTALL_DIR to a writable location:"
        error "  INSTALL_DIR=\$HOME/bin $0"
        exit 1
    fi
}

# Download binary from GitHub Actions artifacts
download_binary() {
    # For development, we'll build from source or use pre-built binaries
    # This is a temporary solution until releases are created
    
    log "Downloading BAM binary..."
    
    # GitHub Actions artifact URL (temporary)
    # In production, this would be from releases
    BINARY_URL="https://github.com/${GITHUB_REPO}/raw/${BRANCH}/dist/${BINARY_NAME}"
    
    # First, let's check if the binary exists in the repo
    if $DOWNLOAD_CMD "${BINARY_URL}" ${DOWNLOAD_OUTPUT} /dev/null 2>/dev/null; then
        log "Downloading from: $BINARY_URL"
        $DOWNLOAD_CMD "${BINARY_URL}" ${DOWNLOAD_OUTPUT} "${INSTALL_DIR}/bam"
        chmod +x "${INSTALL_DIR}/bam"
        log "Binary downloaded successfully"
    else
        warning "Pre-built binary not found, attempting to install via npm..."
        install_via_npm
    fi
}

# Fallback to npm installation
install_via_npm() {
    if ! command -v npm >/dev/null 2>&1; then
        error "npm is required for installation"
        error "Please install Node.js and npm first: https://nodejs.org"
        exit 1
    fi
    
    log "Installing BAM via npm..."
    npm install -g bam
    
    # Check if installation succeeded
    if command -v bam >/dev/null 2>&1; then
        log "BAM installed successfully via npm"
        exit 0
    else
        error "npm installation failed"
        exit 1
    fi
}

# Setup PATH
setup_path() {
    # Check if INSTALL_DIR is in PATH
    case ":$PATH:" in
        *":$INSTALL_DIR:"*)
            log "Installation directory is already in PATH"
            ;;
        *)
            warning "Installation directory is not in PATH"
            
            # Detect shell
            SHELL_NAME="$(basename "$SHELL")"
            case "$SHELL_NAME" in
                bash)
                    RC_FILE="$HOME/.bashrc"
                    ;;
                zsh)
                    RC_FILE="$HOME/.zshrc"
                    ;;
                fish)
                    RC_FILE="$HOME/.config/fish/config.fish"
                    ;;
                *)
                    RC_FILE="$HOME/.profile"
                    ;;
            esac
            
            echo ""
            echo "${YELLOW}To use BAM, add this to your $RC_FILE:${RESET}"
            echo ""
            echo "  export PATH=\"$INSTALL_DIR:\$PATH\""
            echo ""
            echo "Then reload your shell:"
            echo "  source $RC_FILE"
            echo ""
            ;;
    esac
}

# Verify installation
verify_installation() {
    if [ -x "${INSTALL_DIR}/bam" ]; then
        log "BAM installed successfully to: ${INSTALL_DIR}/bam"
        
        # Try to get version
        if "${INSTALL_DIR}/bam" --version >/dev/null 2>&1; then
            VERSION=$("${INSTALL_DIR}/bam" --version 2>/dev/null | head -n1)
            log "Version: $VERSION"
        fi
        
        setup_path
        
        echo ""
        echo "${GREEN}Installation complete!${RESET}"
        echo ""
        echo "Get started with:"
        echo "  bam new mysite"
        echo "  cd mysite"
        echo "  bam run"
        echo ""
    else
        error "Installation failed - binary not found at ${INSTALL_DIR}/bam"
        exit 1
    fi
}

# Main installation flow
main() {
    echo "${BLUE}Installing BAM - The easiest static site generator${RESET}"
    echo ""
    
    detect_platform
    check_requirements
    create_install_dir
    download_binary
    verify_installation
}

# Handle uninstall
if [ "$1" = "--uninstall" ]; then
    log "Uninstalling BAM..."
    
    # Remove from common locations
    for dir in /usr/local/bin /usr/bin "$HOME/.local/bin" "$HOME/bin"; do
        if [ -f "$dir/bam" ]; then
            log "Removing $dir/bam"
            rm -f "$dir/bam"
        fi
    done
    
    # Try npm uninstall
    if command -v npm >/dev/null 2>&1; then
        npm uninstall -g bam 2>/dev/null || true
    fi
    
    log "BAM uninstalled successfully"
    exit 0
fi

# Show help
if [ "$1" = "--help" ] || [ "$1" = "-h" ]; then
    echo "BAM Installation Script"
    echo ""
    echo "Usage:"
    echo "  curl -fsSL URL | sh           # Install to ~/.local/bin"
    echo "  INSTALL_DIR=/path curl ... | sh  # Install to custom directory"
    echo "  curl -fsSL URL | sh -s -- --uninstall  # Uninstall"
    echo ""
    echo "Options:"
    echo "  --help, -h     Show this help message"
    echo "  --uninstall    Remove BAM from system"
    echo ""
    echo "Environment Variables:"
    echo "  INSTALL_DIR    Installation directory (default: ~/.local/bin)"
    echo ""
    exit 0
fi

# Run main installation
main