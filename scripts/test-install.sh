#!/bin/bash
# Test script for BAM installation scripts
# Tests various scenarios and edge cases

set -e

# Script configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TEST_DIR="$(mktemp -d)"
INSTALL_SCRIPT="$SCRIPT_DIR/install.sh"
CHECKSUM_SCRIPT="$SCRIPT_DIR/generate-checksums.sh"

# Test configuration
TEST_VERBOSE=false
TEST_CLEANUP=true
GITHUB_REPO="twilson63/bam"

# Colors for output
if [ -t 1 ] && command -v tput >/dev/null 2>&1; then
    RED=$(tput setaf 1)
    GREEN=$(tput setaf 2)
    YELLOW=$(tput setaf 3)
    BLUE=$(tput setaf 4)
    MAGENTA=$(tput setaf 5)
    CYAN=$(tput setaf 6)
    BOLD=$(tput bold)
    RESET=$(tput sgr0)
else
    RED=""
    GREEN=""
    YELLOW=""
    BLUE=""
    MAGENTA=""
    CYAN=""
    BOLD=""
    RESET=""
fi

# Test counters
TESTS_RUN=0
TESTS_PASSED=0
TESTS_FAILED=0

# Utility functions
log() {
    printf "%s[INFO]%s %s\n" "${BLUE}" "${RESET}" "$1"
}

log_test() {
    printf "%s[TEST]%s %s\n" "${CYAN}" "${RESET}" "$1"
}

log_success() {
    printf "%s[PASS]%s %s\n" "${GREEN}" "${RESET}" "$1"
}

log_error() {
    printf "%s[FAIL]%s %s\n" "${RED}" "${RESET}" "$1"
}

log_warning() {
    printf "%s[WARN]%s %s\n" "${YELLOW}" "${RESET}" "$1"
}

# Test management
start_test() {
    local test_name="$1"
    TESTS_RUN=$((TESTS_RUN + 1))
    log_test "Running test: $test_name"
    echo "  Test directory: $TEST_DIR"
}

pass_test() {
    local test_name="$1"
    TESTS_PASSED=$((TESTS_PASSED + 1))
    log_success "✓ $test_name"
    echo ""
}

fail_test() {
    local test_name="$1"
    local reason="$2"
    TESTS_FAILED=$((TESTS_FAILED + 1))
    log_error "✗ $test_name"
    if [ -n "$reason" ]; then
        echo "  Reason: $reason"
    fi
    echo ""
}

# Cleanup function
cleanup() {
    if [ "$TEST_CLEANUP" = true ] && [ -d "$TEST_DIR" ]; then
        rm -rf "$TEST_DIR"
    fi
}
trap cleanup EXIT

# Show help
show_help() {
    cat << EOF
${BOLD}BAM Installation Script Tester${RESET}

Tests the BAM installation scripts with various scenarios.

${BOLD}USAGE:${RESET}
    $0 [OPTIONS]

${BOLD}OPTIONS:${RESET}
    -v, --verbose          Enable verbose test output
    --no-cleanup          Don't cleanup test directories
    -h, --help            Show this help message

${BOLD}TESTS:${RESET}
    - Script existence and permissions
    - Help output functionality  
    - Dry-run mode
    - Platform detection
    - Version argument parsing
    - Error handling
    - POSIX compliance
    - Checksum generation

${BOLD}EXAMPLES:${RESET}
    # Run all tests
    $0

    # Run with verbose output
    $0 --verbose

    # Keep test files for inspection
    $0 --no-cleanup

EOF
}

# Parse arguments
parse_args() {
    while [[ $# -gt 0 ]]; do
        case $1 in
            -v|--verbose)
                TEST_VERBOSE=true
                shift
                ;;
            --no-cleanup)
                TEST_CLEANUP=false
                shift
                ;;
            -h|--help)
                show_help
                exit 0
                ;;
            *)
                echo "Unknown option: $1"
                echo "Run with --help for usage information."
                exit 1
                ;;
        esac
    done
}

# Test 1: Script existence and permissions
test_script_existence() {
    start_test "Script existence and permissions"
    
    # Check install.sh
    if [ ! -f "$INSTALL_SCRIPT" ]; then
        fail_test "Script existence and permissions" "install.sh not found"
        return
    fi
    
    if [ ! -x "$INSTALL_SCRIPT" ]; then
        log_warning "install.sh is not executable, attempting to fix..."
        chmod +x "$INSTALL_SCRIPT"
    fi
    
    # Check generate-checksums.sh
    if [ ! -f "$CHECKSUM_SCRIPT" ]; then
        fail_test "Script existence and permissions" "generate-checksums.sh not found"
        return
    fi
    
    if [ ! -x "$CHECKSUM_SCRIPT" ]; then
        log_warning "generate-checksums.sh is not executable, attempting to fix..."
        chmod +x "$CHECKSUM_SCRIPT"
    fi
    
    pass_test "Script existence and permissions"
}

# Test 2: Help functionality
test_help_output() {
    start_test "Help output functionality"
    
    # Test install.sh help
    if ! "$INSTALL_SCRIPT" --help >/dev/null 2>&1; then
        fail_test "Help output functionality" "install.sh --help failed"
        return
    fi
    
    # Test generate-checksums.sh help
    if ! "$CHECKSUM_SCRIPT" --help >/dev/null 2>&1; then
        fail_test "Help output functionality" "generate-checksums.sh --help failed"
        return
    fi
    
    pass_test "Help output functionality"
}

# Test 3: Dry-run mode
test_dry_run() {
    start_test "Dry-run mode"
    
    # Create temporary install directory
    local temp_install_dir="$TEST_DIR/install"
    mkdir -p "$temp_install_dir"
    
    # Test dry-run mode
    local output
    if output=$("$INSTALL_SCRIPT" --dry-run --install-dir="$temp_install_dir" 2>&1); then
        if echo "$output" | grep -q "DRY RUN"; then
            pass_test "Dry-run mode"
        else
            fail_test "Dry-run mode" "No dry-run output found"
        fi
    else
        fail_test "Dry-run mode" "Dry-run failed to execute"
    fi
}

# Test 4: Platform detection
test_platform_detection() {
    start_test "Platform detection"
    
    # Test with verbose output to see platform detection
    local output
    if output=$("$INSTALL_SCRIPT" --dry-run --verbose 2>&1); then
        if echo "$output" | grep -q "Detected platform:"; then
            local platform
            platform=$(echo "$output" | grep "Detected platform:" | head -n1)
            echo "  $platform"
            pass_test "Platform detection"
        else
            fail_test "Platform detection" "No platform detection output found"
        fi
    else
        fail_test "Platform detection" "Failed to run platform detection"
    fi
}

# Test 5: Version argument parsing
test_version_parsing() {
    start_test "Version argument parsing"
    
    # Test specific version
    local output
    if output=$("$INSTALL_SCRIPT" --version=1.0.0 --dry-run 2>&1); then
        if echo "$output" | grep -q "1.0.0"; then
            pass_test "Version argument parsing"
        else
            fail_test "Version argument parsing" "Version not found in output"
        fi
    else
        fail_test "Version argument parsing" "Failed to parse version argument"
    fi
}

# Test 6: Error handling
test_error_handling() {
    start_test "Error handling"
    
    # Test invalid option
    local output
    if output=$("$INSTALL_SCRIPT" --invalid-option 2>&1); then
        # Script should exit with error for invalid option
        fail_test "Error handling" "Script should reject invalid options"
    else
        # Expected to fail, so this is success
        pass_test "Error handling"
    fi
}

# Test 7: POSIX compliance check
test_posix_compliance() {
    start_test "POSIX compliance"
    
    # Basic syntax check
    if sh -n "$INSTALL_SCRIPT" 2>/dev/null; then
        pass_test "POSIX compliance"
    else
        fail_test "POSIX compliance" "Script has syntax errors"
    fi
}

# Test 8: Checksum generation
test_checksum_generation() {
    start_test "Checksum generation"
    
    # Create test directory with mock binaries
    local checksum_test_dir="$TEST_DIR/checksums"
    mkdir -p "$checksum_test_dir"
    
    # Create mock binary files
    echo "mock bam binary" > "$checksum_test_dir/bam-macos-x64"
    echo "mock bam binary" > "$checksum_test_dir/bam-linux-x64"
    echo "mock bam binary" > "$checksum_test_dir/bam-windows-x64.exe"
    
    # Generate checksums
    if "$CHECKSUM_SCRIPT" "$checksum_test_dir" >/dev/null 2>&1; then
        if [ -f "$checksum_test_dir/checksums.txt" ]; then
            pass_test "Checksum generation"
        else
            fail_test "Checksum generation" "Checksums file not created"
        fi
    else
        fail_test "Checksum generation" "Checksum generation script failed"
    fi
}

# Test 9: Offline mode simulation
test_offline_mode() {
    start_test "Offline mode simulation"
    
    # Create test directory with local binary
    local offline_test_dir="$TEST_DIR/offline"
    mkdir -p "$offline_test_dir"
    
    # Create mock binary
    echo "mock bam binary" > "$offline_test_dir/bam-$(uname -s | tr '[:upper:]' '[:lower:]')-x64"
    
    # Test offline mode with dry-run
    local output
    if output=$(cd "$offline_test_dir" && "$INSTALL_SCRIPT" --offline --dry-run --install-dir="$offline_test_dir/bin" 2>&1); then
        if echo "$output" | grep -q "local file"; then
            pass_test "Offline mode simulation"
        else
            fail_test "Offline mode simulation" "No offline mode indication found"
        fi
    else
        fail_test "Offline mode simulation" "Offline mode test failed"
    fi
}

# Test 10: Uninstall dry-run
test_uninstall_dry_run() {
    start_test "Uninstall dry-run"
    
    # Test uninstall in dry-run mode (should not actually uninstall anything)
    local output
    if output=$("$INSTALL_SCRIPT" --uninstall --dry-run 2>&1); then
        # Should complete without error
        pass_test "Uninstall dry-run"
    else
        # Check if it failed because BAM is not installed (which is OK)
        if echo "$output" | grep -q "not installed"; then
            pass_test "Uninstall dry-run"
        else
            fail_test "Uninstall dry-run" "Uninstall dry-run failed unexpectedly"
        fi
    fi
}

# Show test summary
show_summary() {
    echo ""
    echo "${BOLD}Test Summary${RESET}"
    echo "============"
    echo "Tests run:    $TESTS_RUN"
    echo "Tests passed: ${GREEN}$TESTS_PASSED${RESET}"
    echo "Tests failed: ${RED}$TESTS_FAILED${RESET}"
    echo ""
    
    if [ $TESTS_FAILED -eq 0 ]; then
        log_success "All tests passed! ✓"
        echo ""
        echo "${BOLD}Installation scripts are ready for use.${RESET}"
        echo ""
        echo "One-liner installation commands:"
        echo "${GREEN}curl -fsSL https://raw.githubusercontent.com/$GITHUB_REPO/master/scripts/install.sh | sh${RESET}"
        echo ""
        echo "PowerShell:"
        echo "${GREEN}iex (irm https://raw.githubusercontent.com/$GITHUB_REPO/master/scripts/install.ps1)${RESET}"
    else
        log_error "Some tests failed. Please review and fix issues before using the scripts."
        exit 1
    fi
}

# Main function
main() {
    log "${BOLD}BAM Installation Script Tester${RESET}"
    log "Test directory: $TEST_DIR"
    echo ""
    
    # Parse arguments
    parse_args "$@"
    
    # Set verbose mode for scripts if requested
    if [ "$TEST_VERBOSE" = true ]; then
        export VERBOSE=true
    fi
    
    # Run tests
    test_script_existence
    test_help_output
    test_dry_run
    test_platform_detection
    test_version_parsing
    test_error_handling
    test_posix_compliance
    test_checksum_generation
    test_offline_mode
    test_uninstall_dry_run
    
    # Show summary
    show_summary
}

# Run main function
main "$@"