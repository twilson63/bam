#!/bin/sh
# BAM Installation Script
# Universal POSIX-compliant installer for BAM static site generator
# Usage: curl -fsSL https://raw.githubusercontent.com/twilson63/bam/master/scripts/install.sh | sh
# Usage: curl -fsSL https://raw.githubusercontent.com/twilson63/bam/master/scripts/install.sh | sh -s -- --version=1.0.0
# Usage: curl -fsSL https://raw.githubusercontent.com/twilson63/bam/master/scripts/install.sh | sh -s -- --help

set -e

# Script metadata
SCRIPT_VERSION="1.0.0"
GITHUB_REPO="twilson63/bam"
GITHUB_RELEASES_URL="https://github.com/${GITHUB_REPO}/releases"
CHECKSUM_URL_BASE="https://github.com/${GITHUB_REPO}/releases/download"

# Default configuration
DEFAULT_INSTALL_DIR=""
VERSION="latest"
FORCE_INSTALL=false
DRY_RUN=false
UNINSTALL=false
VERBOSE=false
SKIP_CHECKSUM=false
OFFLINE_MODE=false
INSTALL_DIR_SPECIFIED=false

# Colors for output (if terminal supports it)
if [ -t 1 ] && command -v tput >/dev/null 2>&1; then
    RED=$(tput setaf 1)
    GREEN=$(tput setaf 2)
    YELLOW=$(tput setaf 3)
    BLUE=$(tput setaf 4)
    MAGENTA=$(tput setaf 5)
    CYAN=$(tput setaf 6)
    WHITE=$(tput setaf 7)
    BOLD=$(tput bold)
    RESET=$(tput sgr0)
else
    RED=""
    GREEN=""
    YELLOW=""
    BLUE=""
    MAGENTA=""
    CYAN=""
    WHITE=""
    BOLD=""
    RESET=""
fi

# Utility functions
log() {
    printf "%s[INFO]%s %s\n" "${BLUE}" "${RESET}" "$1"
}

log_verbose() {
    if [ "$VERBOSE" = true ]; then
        printf "%s[DEBUG]%s %s\n" "${CYAN}" "${RESET}" "$1"
    fi
}

log_success() {
    printf "%s[SUCCESS]%s %s\n" "${GREEN}" "${RESET}" "$1"
}

log_warning() {
    printf "%s[WARNING]%s %s\n" "${YELLOW}" "${RESET}" "$1"
}

log_error() {
    printf "%s[ERROR]%s %s\n" "${RED}" "${RESET}" "$1" >&2
}

fatal() {
    log_error "$1"
    exit 1
}

# Progress indicator
show_progress() {
    if [ -t 1 ]; then
        printf "%s[PROGRESS]%s %s..." "${MAGENTA}" "${RESET}" "$1"
    else
        log "$1..."
    fi
}

complete_progress() {
    if [ -t 1 ]; then
        printf " %sDone%s\n" "${GREEN}" "${RESET}"
    fi
}

# Help function
show_help() {
    cat << EOF
${BOLD}BAM Installation Script v${SCRIPT_VERSION}${RESET}

${BOLD}USAGE:${RESET}
    curl -fsSL https://raw.githubusercontent.com/${GITHUB_REPO}/master/scripts/install.sh | sh
    curl -fsSL https://raw.githubusercontent.com/${GITHUB_REPO}/master/scripts/install.sh | sh -s -- [OPTIONS]

${BOLD}OPTIONS:${RESET}
    --version=VERSION       Install specific version (default: latest)
    --install-dir=DIR       Custom installation directory
    --force                 Force reinstall even if already installed
    --dry-run              Show what would be installed without installing
    --uninstall            Remove BAM installation
    --verbose              Enable verbose output
    --skip-checksum        Skip checksum verification (not recommended)
    --offline              Use offline mode (requires local files)
    --help                 Show this help message

${BOLD}EXAMPLES:${RESET}
    # Install latest version
    curl -fsSL https://raw.githubusercontent.com/${GITHUB_REPO}/master/scripts/install.sh | sh

    # Install specific version
    curl -fsSL https://raw.githubusercontent.com/${GITHUB_REPO}/master/scripts/install.sh | sh -s -- --version=1.0.0

    # Install to custom directory
    curl -fsSL https://raw.githubusercontent.com/${GITHUB_REPO}/master/scripts/install.sh | sh -s -- --install-dir=~/bin

    # Dry run to see what would happen
    curl -fsSL https://raw.githubusercontent.com/${GITHUB_REPO}/master/scripts/install.sh | sh -s -- --dry-run

    # Uninstall BAM
    curl -fsSL https://raw.githubusercontent.com/${GITHUB_REPO}/master/scripts/install.sh | sh -s -- --uninstall

${BOLD}INSTALLATION DIRECTORIES:${RESET}
    The script will attempt to install to the first writable directory from:
    1. /usr/local/bin (if writable)
    2. ~/.local/bin
    3. ~/bin

    Or use --install-dir to specify a custom location.

${BOLD}PLATFORM SUPPORT:${RESET}
    - macOS (Intel x64, Apple Silicon ARM64)
    - Linux (x64, ARM64)
    - Windows (WSL, x64)

${BOLD}SECURITY:${RESET}
    All downloads use HTTPS and verify checksums by default.
    Use --skip-checksum only if you understand the security implications.

EOF
}

# Parse command line arguments
parse_args() {
    for arg in "$@"; do
        case $arg in
            --version=*)
                VERSION="${arg#*=}"
                ;;
            --install-dir=*)
                DEFAULT_INSTALL_DIR="${arg#*=}"
                INSTALL_DIR_SPECIFIED=true
                ;;
            --force)
                FORCE_INSTALL=true
                ;;
            --dry-run)
                DRY_RUN=true
                ;;
            --uninstall)
                UNINSTALL=true
                ;;
            --verbose)
                VERBOSE=true
                ;;
            --skip-checksum)
                SKIP_CHECKSUM=true
                log_warning "Checksum verification disabled - this reduces security!"
                ;;
            --offline)
                OFFLINE_MODE=true
                ;;
            --help|-h)
                show_help
                exit 0
                ;;
            *)
                log_error "Unknown option: $arg"
                echo "Run with --help for usage information."
                exit 1
                ;;
        esac
    done
}

# Detect platform and architecture
detect_platform() {
    log_verbose "Detecting platform and architecture..."
    
    local os
    local arch
    
    # Detect OS
    case "$(uname -s)" in
        Darwin*)
            os="macos"
            ;;
        Linux*)
            os="linux"
            ;;
        CYGWIN*|MINGW*|MSYS*)
            os="windows"
            ;;
        *)
            fatal "Unsupported operating system: $(uname -s)"
            ;;
    esac
    
    # Detect architecture
    case "$(uname -m)" in
        x86_64|amd64)
            arch="x64"
            ;;
        arm64|aarch64)
            if [ "$os" = "macos" ]; then
                arch="arm64"
            else
                arch="x64"  # Fallback to x64 for Linux ARM64
            fi
            ;;
        armv7l)
            arch="x64"  # Fallback to x64
            ;;
        *)
            log_warning "Unknown architecture $(uname -m), falling back to x64"
            arch="x64"
            ;;
    esac
    
    # Set binary name
    if [ "$os" = "windows" ]; then
        BINARY_NAME="bam-${os}-${arch}.exe"
        EXECUTABLE_NAME="bam.exe"
    else
        BINARY_NAME="bam-${os}-${arch}"
        EXECUTABLE_NAME="bam"
    fi
    
    log_verbose "Detected platform: ${os}-${arch}"
    log_verbose "Binary name: ${BINARY_NAME}"
    
    export DETECTED_OS="$os"
    export DETECTED_ARCH="$arch"
}

# Check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Find download tool
find_download_tool() {
    if command_exists curl; then
        DOWNLOAD_TOOL="curl"
        DOWNLOAD_CMD="curl -fsSL"
    elif command_exists wget; then
        DOWNLOAD_TOOL="wget"
        DOWNLOAD_CMD="wget -qO-"
    elif command_exists fetch; then
        DOWNLOAD_TOOL="fetch"
        DOWNLOAD_CMD="fetch -qo-"
    else
        fatal "No download tool found. Please install curl, wget, or fetch."
    fi
    
    log_verbose "Using download tool: ${DOWNLOAD_TOOL}"
}

# Get latest version from GitHub API
get_latest_version() {
    if [ "$OFFLINE_MODE" = true ]; then
        fatal "Cannot determine latest version in offline mode. Please specify --version."
    fi
    
    log_verbose "Fetching latest version from GitHub API..."
    
    local api_url="https://api.github.com/repos/${GITHUB_REPO}/releases/latest"
    local version_json
    
    case "$DOWNLOAD_TOOL" in
        curl)
            version_json=$(curl -fsSL "$api_url" 2>/dev/null) || {
                log_warning "No releases found on GitHub"
                log "Falling back to npm installation..."
                install_via_npm
                exit 0
            }
            ;;
        wget)
            version_json=$(wget -qO- "$api_url" 2>/dev/null) || {
                log_warning "No releases found on GitHub"
                log "Falling back to npm installation..."
                install_via_npm
                exit 0
            }
            ;;
        fetch)
            version_json=$(fetch -qo- "$api_url" 2>/dev/null) || fatal "Failed to fetch version information"
            ;;
    esac
    
    # Extract version from JSON (simple grep/sed approach for POSIX compatibility)
    local latest_version
    latest_version=$(echo "$version_json" | grep '"tag_name"' | sed -E 's/.*"tag_name"[[:space:]]*:[[:space:]]*"([^"]+)".*/\1/' | head -n1)
    
    if [ -z "$latest_version" ]; then
        fatal "Could not determine latest version"
    fi
    
    # Remove 'v' prefix if present
    latest_version=$(echo "$latest_version" | sed 's/^v//')
    
    log_verbose "Latest version: ${latest_version}"
    echo "$latest_version"
}

# Determine installation directory
determine_install_dir() {
    if [ -n "$DEFAULT_INSTALL_DIR" ]; then
        if [ "$INSTALL_DIR_SPECIFIED" = true ]; then
            INSTALL_DIR="$DEFAULT_INSTALL_DIR"
            log_verbose "Using specified install directory: ${INSTALL_DIR}"
            return
        fi
    fi
    
    # Try directories in order of preference
    local dirs="/usr/local/bin $HOME/.local/bin $HOME/bin"
    
    for dir in $dirs; do
        if [ -d "$dir" ] && [ -w "$dir" ]; then
            INSTALL_DIR="$dir"
            log_verbose "Selected install directory: ${INSTALL_DIR}"
            return
        fi
    done
    
    # If no writable directory found, create ~/.local/bin
    INSTALL_DIR="$HOME/.local/bin"
    log_verbose "Creating install directory: ${INSTALL_DIR}"
    
    if [ "$DRY_RUN" = false ]; then
        mkdir -p "$INSTALL_DIR" || fatal "Failed to create install directory: ${INSTALL_DIR}"
    fi
}

# Install via npm as fallback
install_via_npm() {
    log "Checking for npm..."
    
    if ! command_exists npm; then
        fatal "npm is not installed. Please install Node.js and npm first: https://nodejs.org"
    fi
    
    log "Installing BAM via npm..."
    
    if npm install -g bam; then
        log_success "BAM installed successfully via npm!"
        log ""
        log "Get started with:"
        log "  ${CYAN}bam new mysite${RESET}"
        log "  ${CYAN}cd mysite${RESET}"
        log "  ${CYAN}bam run${RESET}"
        exit 0
    else
        fatal "npm installation failed"
    fi
}

# Check if BAM is already installed
check_existing_installation() {
    if command_exists bam; then
        local existing_path
        existing_path=$(command -v bam)
        local existing_version=""
        
        if [ -x "$existing_path" ]; then
            existing_version=$("$existing_path" --version 2>/dev/null | head -n1 | grep -oE '[0-9]+\.[0-9]+\.[0-9]+' || echo "unknown")
        fi
        
        if [ "$FORCE_INSTALL" = false ]; then
            log "BAM is already installed at: ${existing_path}"
            if [ -n "$existing_version" ]; then
                log "Existing version: ${existing_version}"
            fi
            log "Use --force to reinstall or --uninstall to remove"
            exit 0
        else
            log_warning "BAM already installed at ${existing_path}, but --force specified"
            if [ -n "$existing_version" ]; then
                log "Existing version: ${existing_version}"
            fi
        fi
    fi
}

# Download file with progress
download_file() {
    local url="$1"
    local output="$2"
    local description="$3"
    
    show_progress "Downloading ${description}"
    
    case "$DOWNLOAD_TOOL" in
        curl)
            if [ "$VERBOSE" = true ]; then
                curl -fSL --progress-bar "$url" -o "$output"
            else
                curl -fsSL "$url" -o "$output"
            fi
            ;;
        wget)
            if [ "$VERBOSE" = true ]; then
                wget --progress=bar "$url" -O "$output"
            else
                wget -q "$url" -O "$output"
            fi
            ;;
        fetch)
            fetch -o "$output" "$url"
            ;;
    esac
    
    complete_progress
}

# Verify checksum
verify_checksum() {
    local file="$1"
    local expected_checksum="$2"
    
    if [ "$SKIP_CHECKSUM" = true ]; then
        log_warning "Skipping checksum verification"
        return 0
    fi
    
    if [ -z "$expected_checksum" ]; then
        log_warning "No checksum available for verification"
        return 0
    fi
    
    show_progress "Verifying checksum"
    
    local actual_checksum
    if command_exists sha256sum; then
        actual_checksum=$(sha256sum "$file" | cut -d' ' -f1)
    elif command_exists shasum; then
        actual_checksum=$(shasum -a 256 "$file" | cut -d' ' -f1)
    elif command_exists openssl; then
        actual_checksum=$(openssl dgst -sha256 "$file" | cut -d' ' -f2)
    else
        log_warning "No checksum tool available, skipping verification"
        complete_progress
        return 0
    fi
    
    if [ "$actual_checksum" = "$expected_checksum" ]; then
        complete_progress
        log_verbose "Checksum verification passed"
        return 0
    else
        complete_progress
        log_error "Checksum verification failed!"
        log_error "Expected: ${expected_checksum}"
        log_error "Actual:   ${actual_checksum}"
        return 1
    fi
}

# Get checksum for binary
get_checksum() {
    local version="$1"
    local binary_name="$2"
    
    if [ "$OFFLINE_MODE" = true ] || [ "$SKIP_CHECKSUM" = true ]; then
        echo ""
        return
    fi
    
    local checksum_url="${CHECKSUM_URL_BASE}/v${version}/checksums.txt"
    local checksums
    
    log_verbose "Fetching checksums from: ${checksum_url}"
    
    case "$DOWNLOAD_TOOL" in
        curl)
            checksums=$(curl -fsSL "$checksum_url" 2>/dev/null)
            ;;
        wget)
            checksums=$(wget -qO- "$checksum_url" 2>/dev/null)
            ;;
        fetch)
            checksums=$(fetch -qo- "$checksum_url" 2>/dev/null)
            ;;
    esac
    
    if [ -z "$checksums" ]; then
        log_warning "Could not fetch checksums file"
        echo ""
        return
    fi
    
    # Extract checksum for our binary
    local checksum
    checksum=$(echo "$checksums" | grep "$binary_name" | cut -d' ' -f1)
    
    if [ -z "$checksum" ]; then
        log_warning "No checksum found for ${binary_name}"
        echo ""
        return
    fi
    
    log_verbose "Found checksum for ${binary_name}: ${checksum}"
    echo "$checksum"
}

# Install BAM
install_bam() {
    log "${BOLD}Installing BAM v${VERSION}...${RESET}"
    
    # Resolve version
    if [ "$VERSION" = "latest" ]; then
        if [ "$DRY_RUN" = true ] || [ "$OFFLINE_MODE" = true ]; then
            VERSION="1.0.0"  # Use placeholder version for dry-run/offline
            log "Using placeholder version for dry-run: ${VERSION}"
        else
            VERSION=$(get_latest_version)
            log "Latest version: ${VERSION}"
        fi
    fi
    
    # Construct download URL
    local download_url="${GITHUB_RELEASES_URL}/download/v${VERSION}/${BINARY_NAME}"
    log_verbose "Download URL: ${download_url}"
    
    # Create temporary directory
    local temp_dir
    temp_dir=$(mktemp -d 2>/dev/null || mktemp -d -t 'bam-install')
    local temp_file="${temp_dir}/${BINARY_NAME}"
    
    # Cleanup function
    cleanup() {
        if [ -d "$temp_dir" ]; then
            rm -rf "$temp_dir"
        fi
    }
    trap cleanup EXIT INT TERM
    
    if [ "$DRY_RUN" = true ]; then
        if [ "$OFFLINE_MODE" = true ]; then
            log "${YELLOW}[DRY RUN]${RESET} Would use local file: ${BINARY_NAME}"
        else
            log "${YELLOW}[DRY RUN]${RESET} Would download: ${download_url}"
        fi
        log "${YELLOW}[DRY RUN]${RESET} Would install to: ${INSTALL_DIR}/${EXECUTABLE_NAME}"
        return 0
    fi
    
    # Download binary
    if [ "$OFFLINE_MODE" = false ]; then
        download_file "$download_url" "$temp_file" "BAM v${VERSION}"
        
        # Get and verify checksum
        local expected_checksum
        expected_checksum=$(get_checksum "$VERSION" "$BINARY_NAME")
        
        if [ -n "$expected_checksum" ]; then
            if ! verify_checksum "$temp_file" "$expected_checksum"; then
                fatal "Checksum verification failed. Installation aborted for security."
            fi
        fi
    else
        # Offline mode - look for local file
        if [ ! -f "$BINARY_NAME" ]; then
            fatal "Offline mode enabled but ${BINARY_NAME} not found in current directory"
        fi
        cp "$BINARY_NAME" "$temp_file"
        log "Using local file: ${BINARY_NAME}"
    fi
    
    # Verify file is executable
    if [ ! -f "$temp_file" ]; then
        fatal "Downloaded file not found or corrupted"
    fi
    
    # Install binary
    show_progress "Installing to ${INSTALL_DIR}"
    
    # Ensure install directory exists
    mkdir -p "$INSTALL_DIR" || fatal "Failed to create install directory: ${INSTALL_DIR}"
    
    # Copy and make executable
    local install_path="${INSTALL_DIR}/${EXECUTABLE_NAME}"
    cp "$temp_file" "$install_path" || fatal "Failed to copy binary to ${install_path}"
    chmod +x "$install_path" || fatal "Failed to make binary executable"
    
    complete_progress
    
    # Verify installation
    if [ -x "$install_path" ]; then
        local installed_version
        installed_version=$("$install_path" --version 2>/dev/null | head -n1 | grep -oE '[0-9]+\.[0-9]+\.[0-9]+' || echo "")
        
        log_success "BAM v${VERSION} installed successfully!"
        log "Installed to: ${install_path}"
        
        if [ -n "$installed_version" ]; then
            log "Verified version: ${installed_version}"
        fi
        
        # Check if install directory is in PATH
        check_path_and_suggest
        
        # Show usage information
        show_usage_info
    else
        fatal "Installation verification failed"
    fi
}

# Check PATH and suggest updates
check_path_and_suggest() {
    case ":$PATH:" in
        *":$INSTALL_DIR:"*)
            log_verbose "Install directory is already in PATH"
            ;;
        *)
            log_warning "Install directory ${INSTALL_DIR} is not in your PATH"
            suggest_path_update
            ;;
    esac
}

# Suggest PATH update
suggest_path_update() {
    log ""
    log "${BOLD}To use BAM, you need to add ${INSTALL_DIR} to your PATH:${RESET}"
    log ""
    
    # Detect shell and provide appropriate instructions
    local shell_name
    shell_name=$(basename "${SHELL:-/bin/sh}")
    
    case "$shell_name" in
        bash)
            log "Add this line to your ~/.bashrc or ~/.bash_profile:"
            log "  ${GREEN}export PATH=\"${INSTALL_DIR}:\$PATH\"${RESET}"
            log ""
            log "Then reload your shell:"
            log "  ${GREEN}source ~/.bashrc${RESET}"
            ;;
        zsh)
            log "Add this line to your ~/.zshrc:"
            log "  ${GREEN}export PATH=\"${INSTALL_DIR}:\$PATH\"${RESET}"
            log ""
            log "Then reload your shell:"
            log "  ${GREEN}source ~/.zshrc${RESET}"
            ;;
        fish)
            log "Run this command:"
            log "  ${GREEN}fish_add_path ${INSTALL_DIR}${RESET}"
            ;;
        *)
            log "Add this line to your shell's configuration file:"
            log "  ${GREEN}export PATH=\"${INSTALL_DIR}:\$PATH\"${RESET}"
            log ""
            log "Then restart your terminal or reload your shell configuration."
            ;;
    esac
    
    log ""
    log "Or run BAM directly: ${GREEN}${INSTALL_DIR}/${EXECUTABLE_NAME}${RESET}"
}

# Show usage information
show_usage_info() {
    log ""
    log "${BOLD}Getting Started with BAM:${RESET}"
    log ""
    log "1. Create a new project:"
    log "   ${GREEN}bam new my-site${RESET}                 # Create with skeleton template"
    log "   ${GREEN}bam new my-site bootstrap${RESET}       # Create with Bootstrap template"
    log ""
    log "2. Navigate to your project and start development:"
    log "   ${GREEN}cd my-site${RESET}"
    log "   ${GREEN}bam run${RESET}                         # Start development server"
    log ""
    log "3. Generate your static site:"
    log "   ${GREEN}bam gen${RESET}                         # Generate to ./gen directory"
    log "   ${GREEN}bam serve${RESET}                       # Serve generated site"
    log ""
    log "For more information:"
    log "   ${GREEN}bam --help${RESET}                      # Show all commands"
    log "   Visit: ${CYAN}https://github.com/${GITHUB_REPO}${RESET}"
    log ""
}

# Uninstall BAM
uninstall_bam() {
    log "${BOLD}Uninstalling BAM...${RESET}"
    
    local bam_path
    if command_exists bam; then
        bam_path=$(command -v bam)
        
        if [ "$DRY_RUN" = true ]; then
            log "${YELLOW}[DRY RUN]${RESET} Would remove: ${bam_path}"
            return 0
        fi
        
        show_progress "Removing BAM from ${bam_path}"
        
        if rm "$bam_path" 2>/dev/null; then
            complete_progress
            log_success "BAM uninstalled successfully!"
        else
            complete_progress
            log_error "Failed to remove ${bam_path}"
            log "You may need to run with sudo or remove manually:"
            log "  ${GREEN}sudo rm ${bam_path}${RESET}"
            exit 1
        fi
    else
        log "BAM is not installed or not in PATH"
        exit 1
    fi
}

# Main installation flow
main() {
    log "${BOLD}BAM Installation Script v${SCRIPT_VERSION}${RESET}"
    log "GitHub Repository: ${CYAN}https://github.com/${GITHUB_REPO}${RESET}"
    log ""
    
    # Parse arguments
    parse_args "$@"
    
    # Handle uninstall
    if [ "$UNINSTALL" = true ]; then
        uninstall_bam
        exit 0
    fi
    
    # Detect platform
    detect_platform
    
    # Find download tool
    if [ "$OFFLINE_MODE" = false ]; then
        find_download_tool
    fi
    
    # Determine installation directory
    determine_install_dir
    
    # Check existing installation
    check_existing_installation
    
    # Install BAM
    install_bam
}

# Run main function with all arguments
main "$@"