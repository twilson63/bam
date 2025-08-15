# BAM Installation Scripts

This directory contains comprehensive installation scripts for BAM that support one-line curl installation across multiple platforms.

## Scripts Overview

### `install.sh` - Universal POSIX Installation Script

Universal POSIX-compliant installation script that works on macOS, Linux, and Windows WSL.

**Features:**
- Automatic platform and architecture detection
- Version management (latest by default, specific versions via `--version`)
- Multiple installation directory options
- Secure checksum verification
- Progress indicators and clear feedback
- Dry-run mode for testing
- Force reinstall capability
- Uninstall functionality
- Error handling and recovery
- PATH update suggestions

**Usage:**

```bash
# Install latest version
curl -fsSL https://raw.githubusercontent.com/twilson63/bam/master/scripts/install.sh | sh

# Install specific version
curl -fsSL https://raw.githubusercontent.com/twilson63/bam/master/scripts/install.sh | sh -s -- --version=1.0.0

# Install to custom directory
curl -fsSL https://raw.githubusercontent.com/twilson63/bam/master/scripts/install.sh | sh -s -- --install-dir=~/bin

# Dry run to see what would happen
curl -fsSL https://raw.githubusercontent.com/twilson63/bam/master/scripts/install.sh | sh -s -- --dry-run

# Uninstall BAM
curl -fsSL https://raw.githubusercontent.com/twilson63/bam/master/scripts/install.sh | sh -s -- --uninstall

# Force reinstall
curl -fsSL https://raw.githubusercontent.com/twilson63/bam/master/scripts/install.sh | sh -s -- --force

# Verbose output
curl -fsSL https://raw.githubusercontent.com/twilson63/bam/master/scripts/install.sh | sh -s -- --verbose

# Offline installation (requires local binary)
curl -fsSL https://raw.githubusercontent.com/twilson63/bam/master/scripts/install.sh | sh -s -- --offline
```

**Options:**
- `--version=VERSION` - Install specific version (default: latest)
- `--install-dir=DIR` - Custom installation directory
- `--force` - Force reinstall even if already installed
- `--dry-run` - Show what would be installed without installing
- `--uninstall` - Remove BAM installation
- `--verbose` - Enable verbose output
- `--skip-checksum` - Skip checksum verification (not recommended)
- `--offline` - Use offline mode (requires local files)
- `--help` - Show help message

### `install.ps1` - PowerShell Installation Script

Native PowerShell installation script for Windows with similar features to the shell script.

**Usage:**

```powershell
# Install latest version
iex (irm https://raw.githubusercontent.com/twilson63/bam/master/scripts/install.ps1)

# Install specific version
iex "& { $(irm https://raw.githubusercontent.com/twilson63/bam/master/scripts/install.ps1) } -Version 1.0.0"

# Install to custom directory
iex "& { $(irm https://raw.githubusercontent.com/twilson63/bam/master/scripts/install.ps1) } -InstallDir C:\Tools"

# Dry run
iex "& { $(irm https://raw.githubusercontent.com/twilson63/bam/master/scripts/install.ps1) } -DryRun"

# Uninstall
iex "& { $(irm https://raw.githubusercontent.com/twilson63/bam/master/scripts/install.ps1) } -Uninstall"
```

**Parameters:**
- `-Version` - Specific version to install (default: latest)
- `-InstallDir` - Custom installation directory
- `-Force` - Force reinstall even if already installed
- `-DryRun` - Show what would be installed without installing
- `-Uninstall` - Remove BAM installation
- `-Verbose` - Enable verbose output
- `-SkipChecksum` - Skip checksum verification (not recommended)
- `-Offline` - Use offline mode (requires local files)
- `-Help` - Show help information

### `generate-checksums.sh` - Checksum Generation Script

Generates SHA256 checksums for BAM release binaries to ensure secure downloads.

**Usage:**

```bash
# Generate checksums for binaries in current directory
./generate-checksums.sh

# Generate checksums for binaries in specific directory
./generate-checksums.sh /path/to/binaries

# Custom output file
./generate-checksums.sh --output release-checksums.txt

# Verbose output
./generate-checksums.sh --verbose
```

**Options:**
- `-o, --output FILE` - Output file name (default: checksums.txt)
- `-a, --algorithm ALGO` - Hash algorithm (default: sha256)
- `-v, --verbose` - Enable verbose output
- `-h, --help` - Show help message

### `test-install.sh` - Installation Script Tester

Comprehensive test suite for validating the installation scripts.

**Usage:**

```bash
# Run all tests
./test-install.sh

# Run with verbose output
./test-install.sh --verbose

# Keep test files for inspection
./test-install.sh --no-cleanup
```

**Tests Include:**
- Script existence and permissions
- Help output functionality
- Dry-run mode
- Platform detection
- Version argument parsing
- Error handling
- POSIX compliance
- Checksum generation
- Offline mode simulation
- Uninstall functionality

## Platform Support

### Supported Platforms
- **macOS**: Intel x64, Apple Silicon ARM64
- **Linux**: x64, ARM64 (fallback to x64)
- **Windows**: x64 (native PowerShell and WSL)

### Expected Binary Names
- `bam-macos-x64`
- `bam-macos-arm64`
- `bam-linux-x64`
- `bam-linux-arm64` (or fallback to x64)
- `bam-windows-x64.exe`

## Installation Directories

The scripts attempt to install to the first writable directory from:

1. `/usr/local/bin` (if writable)
2. `~/.local/bin`
3. `~/bin`
4. Custom directory specified with `--install-dir`

On Windows:
1. `C:\Program Files\BAM` (if running as Administrator)
2. `%LOCALAPPDATA%\Programs\BAM` (current user)
3. Custom directory specified with `-InstallDir`

## Security Features

- **HTTPS-only downloads** - All downloads use secure HTTPS connections
- **Checksum verification** - SHA256 checksums verify download integrity
- **Minimal dependencies** - Uses only POSIX shell and common utilities
- **No remote execution** - Scripts can be inspected before running
- **Error handling** - Comprehensive error checking and recovery

## GitHub Release Integration

The scripts are designed to work with GitHub releases at:
`https://github.com/twilson63/bam/releases`

### Release Structure
```
releases/
├── v1.0.0/
│   ├── bam-macos-x64
│   ├── bam-macos-arm64
│   ├── bam-linux-x64
│   ├── bam-linux-arm64
│   ├── bam-windows-x64.exe
│   └── checksums.txt
```

## Development Workflow

### Testing Scripts

```bash
# Make scripts executable
chmod +x scripts/*.sh

# Run test suite
./scripts/test-install.sh

# Test specific scenarios
./scripts/install.sh --dry-run --verbose
```

### Preparing a Release

1. **Build binaries** for all supported platforms
2. **Generate checksums**:
   ```bash
   ./scripts/generate-checksums.sh /path/to/binaries
   ```
3. **Upload to GitHub releases** with checksums.txt
4. **Test installation**:
   ```bash
   curl -fsSL https://raw.githubusercontent.com/twilson63/bam/master/scripts/install.sh | sh -s -- --version=NEW_VERSION --dry-run
   ```

## Troubleshooting

### Common Issues

1. **Permission denied**
   - Run with `sudo` for system-wide installation
   - Use `--install-dir=~/bin` for user installation

2. **Checksum verification failed**
   - Check internet connection
   - Verify release files are properly uploaded
   - Use `--skip-checksum` only if necessary (reduces security)

3. **Platform not supported**
   - Check if binary exists for your platform
   - File an issue for missing platform support

4. **PATH not updated**
   - Follow the script's PATH update suggestions
   - Restart terminal or reload shell configuration

### Getting Help

```bash
# Show help for installation script
curl -fsSL https://raw.githubusercontent.com/twilson63/bam/master/scripts/install.sh | sh -s -- --help

# Show help for checksum script
./scripts/generate-checksums.sh --help

# Show help for test script
./scripts/test-install.sh --help
```

## Examples

### Basic Installation
```bash
# Install latest BAM
curl -fsSL https://raw.githubusercontent.com/twilson63/bam/master/scripts/install.sh | sh
```

### Advanced Installation
```bash
# Install specific version with custom directory
curl -fsSL https://raw.githubusercontent.com/twilson63/bam/master/scripts/install.sh | sh -s -- \
  --version=1.0.0 \
  --install-dir=~/.local/bin \
  --verbose
```

### Windows PowerShell
```powershell
# Install with custom settings
iex "& { $(irm https://raw.githubusercontent.com/twilson63/bam/master/scripts/install.ps1) } -Version 1.0.0 -InstallDir C:\Tools -Verbose"
```

### Offline Installation
```bash
# Download binary manually, then install offline
wget https://github.com/twilson63/bam/releases/download/v1.0.0/bam-linux-x64
curl -fsSL https://raw.githubusercontent.com/twilson63/bam/master/scripts/install.sh | sh -s -- --offline
```

## Contributing

When contributing to the installation scripts:

1. **Test thoroughly** using the test suite
2. **Maintain POSIX compliance** for the shell script
3. **Update documentation** for any new features
4. **Test on multiple platforms** before submitting
5. **Follow security best practices**

## License

These installation scripts are part of the BAM project and follow the same license terms.