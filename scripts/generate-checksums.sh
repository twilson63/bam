#!/bin/bash
# Generate checksums for BAM release binaries
# This script should be run in the directory containing the release binaries

set -e

# Configuration
CHECKSUM_FILE="checksums.txt"
ALGORITHM="sha256"

# Colors for output
if [ -t 1 ] && command -v tput >/dev/null 2>&1; then
    RED=$(tput setaf 1)
    GREEN=$(tput setaf 2)
    YELLOW=$(tput setaf 3)
    BLUE=$(tput setaf 4)
    BOLD=$(tput bold)
    RESET=$(tput sgr0)
else
    RED=""
    GREEN=""
    YELLOW=""
    BLUE=""
    BOLD=""
    RESET=""
fi

# Utility functions
log() {
    printf "%s[INFO]%s %s\n" "${BLUE}" "${RESET}" "$1"
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

# Show help
show_help() {
    cat << EOF
${BOLD}BAM Checksum Generator${RESET}

Generates SHA256 checksums for BAM release binaries.

${BOLD}USAGE:${RESET}
    $0 [OPTIONS] [DIRECTORY]

${BOLD}OPTIONS:${RESET}
    -o, --output FILE      Output file name (default: checksums.txt)
    -a, --algorithm ALGO   Hash algorithm (default: sha256)
    -v, --verbose          Enable verbose output
    -h, --help             Show this help message

${BOLD}ARGUMENTS:${RESET}
    DIRECTORY             Directory containing binaries (default: current directory)

${BOLD}EXAMPLES:${RESET}
    # Generate checksums for binaries in current directory
    $0

    # Generate checksums for binaries in specific directory
    $0 /path/to/binaries

    # Custom output file
    $0 --output release-checksums.txt

    # Verbose output
    $0 --verbose

${BOLD}EXPECTED BINARIES:${RESET}
    - bam-macos-x64
    - bam-macos-arm64
    - bam-linux-x64
    - bam-linux-arm64
    - bam-windows-x64.exe

EOF
}

# Parse command line arguments
parse_args() {
    DIRECTORY="."
    VERBOSE=false
    
    while [[ $# -gt 0 ]]; do
        case $1 in
            -o|--output)
                CHECKSUM_FILE="$2"
                shift 2
                ;;
            -a|--algorithm)
                ALGORITHM="$2"
                shift 2
                ;;
            -v|--verbose)
                VERBOSE=true
                shift
                ;;
            -h|--help)
                show_help
                exit 0
                ;;
            -*)
                log_error "Unknown option: $1"
                echo "Run with --help for usage information."
                exit 1
                ;;
            *)
                DIRECTORY="$1"
                shift
                ;;
        esac
    done
}

# Check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Find hash command
find_hash_command() {
    case "$ALGORITHM" in
        sha256)
            if command_exists sha256sum; then
                HASH_CMD="sha256sum"
            elif command_exists shasum; then
                HASH_CMD="shasum -a 256"
            elif command_exists openssl; then
                HASH_CMD="openssl dgst -sha256"
            else
                fatal "No SHA256 command found. Please install sha256sum, shasum, or openssl."
            fi
            ;;
        sha1)
            if command_exists sha1sum; then
                HASH_CMD="sha1sum"
            elif command_exists shasum; then
                HASH_CMD="shasum -a 1"
            elif command_exists openssl; then
                HASH_CMD="openssl dgst -sha1"
            else
                fatal "No SHA1 command found. Please install sha1sum, shasum, or openssl."
            fi
            ;;
        md5)
            if command_exists md5sum; then
                HASH_CMD="md5sum"
            elif command_exists md5; then
                HASH_CMD="md5"
            elif command_exists openssl; then
                HASH_CMD="openssl dgst -md5"
            else
                fatal "No MD5 command found. Please install md5sum, md5, or openssl."
            fi
            ;;
        *)
            fatal "Unsupported algorithm: $ALGORITHM"
            ;;
    esac
    
    if [ "$VERBOSE" = true ]; then
        log "Using hash command: $HASH_CMD"
    fi
}

# Calculate hash for a file
calculate_hash() {
    local file="$1"
    local hash_output
    
    case "$HASH_CMD" in
        "openssl dgst -"*)
            hash_output=$($HASH_CMD "$file" | awk '{print $2}')
            ;;
        "md5")
            hash_output=$(md5 "$file" | awk '{print $4}')
            ;;
        *)
            hash_output=$($HASH_CMD "$file" | awk '{print $1}')
            ;;
    esac
    
    echo "$hash_output"
}

# Generate checksums
generate_checksums() {
    log "Generating ${ALGORITHM} checksums in directory: $DIRECTORY"
    
    # Change to target directory
    if [ ! -d "$DIRECTORY" ]; then
        fatal "Directory does not exist: $DIRECTORY"
    fi
    
    cd "$DIRECTORY" || fatal "Failed to change to directory: $DIRECTORY"
    
    # Expected binary patterns
    local patterns=(
        "bam-macos-x64"
        "bam-macos-arm64" 
        "bam-linux-x64"
        "bam-linux-arm64"
        "bam-windows-x64.exe"
    )
    
    # Find all binary files
    local found_files=()
    for pattern in "${patterns[@]}"; do
        if [ -f "$pattern" ]; then
            found_files+=("$pattern")
        fi
    done
    
    # Also check for any other bam-* files
    for file in bam-*; do
        if [ -f "$file" ] && [[ ! " ${found_files[*]} " =~ " ${file} " ]]; then
            found_files+=("$file")
        fi
    done
    
    if [ ${#found_files[@]} -eq 0 ]; then
        log_warning "No BAM binary files found in $DIRECTORY"
        log "Expected files: ${patterns[*]}"
        exit 1
    fi
    
    # Create checksums file
    local output_path="$CHECKSUM_FILE"
    log "Creating checksum file: $output_path"
    
    # Write header
    cat > "$output_path" << EOF
# BAM Release Checksums
# Generated on $(date -u '+%Y-%m-%d %H:%M:%S UTC')
# Algorithm: $(echo "$ALGORITHM" | tr '[:lower:]' '[:upper:]')
#
# Verify with:
#   sha256sum -c checksums.txt
#   shasum -a 256 -c checksums.txt
#

EOF
    
    # Generate checksums for each file
    local total_files=${#found_files[@]}
    local processed=0
    
    for file in "${found_files[@]}"; do
        processed=$((processed + 1))
        
        if [ "$VERBOSE" = true ]; then
            log "Processing file $processed/$total_files: $file"
        fi
        
        if [ ! -f "$file" ]; then
            log_warning "File not found: $file"
            continue
        fi
        
        # Calculate hash
        local hash
        hash=$(calculate_hash "$file")
        
        if [ -z "$hash" ]; then
            log_error "Failed to calculate hash for: $file"
            continue
        fi
        
        # Write to file
        printf "%s  %s\n" "$hash" "$file" >> "$output_path"
        
        if [ "$VERBOSE" = true ]; then
            log "  $hash  $file"
        fi
    done
    
    log_success "Generated checksums for $processed files"
    log "Checksum file: $output_path"
    
    # Show summary
    echo ""
    log "${BOLD}Checksum Summary:${RESET}"
    cat "$output_path" | grep -v '^#' | grep -v '^$'
}

# Verify checksums (if file already exists)
verify_existing_checksums() {
    if [ ! -f "$CHECKSUM_FILE" ]; then
        return
    fi
    
    log "Verifying existing checksums..."
    
    case "$ALGORITHM" in
        sha256)
            if command_exists sha256sum; then
                if sha256sum -c "$CHECKSUM_FILE" 2>/dev/null; then
                    log_success "All existing checksums verified successfully"
                else
                    log_warning "Some checksums failed verification"
                fi
            elif command_exists shasum; then
                if shasum -a 256 -c "$CHECKSUM_FILE" 2>/dev/null; then
                    log_success "All existing checksums verified successfully"
                else
                    log_warning "Some checksums failed verification"
                fi
            fi
            ;;
    esac
}

# Main function
main() {
    log "${BOLD}BAM Checksum Generator${RESET}"
    
    # Parse arguments
    parse_args "$@"
    
    # Find hash command
    find_hash_command
    
    # Verify existing checksums if they exist
    if [ -f "$DIRECTORY/$CHECKSUM_FILE" ]; then
        cd "$DIRECTORY" && verify_existing_checksums
    fi
    
    # Generate new checksums
    generate_checksums
    
    echo ""
    log "${BOLD}Usage Instructions:${RESET}"
    log "1. Upload this checksum file alongside your release binaries"
    log "2. Users can verify downloads with:"
    log "   ${GREEN}sha256sum -c $CHECKSUM_FILE${RESET}"
    log "   ${GREEN}shasum -a 256 -c $CHECKSUM_FILE${RESET}"
    log ""
    log "3. The installation scripts will automatically verify checksums"
}

# Run main function
main "$@"