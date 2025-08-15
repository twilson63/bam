# BAM Installation Guide

This guide covers all installation methods for BAM, the easiest static site generator on the planet.

## Table of Contents
- [Quick Install (Recommended)](#quick-install-recommended)
- [Platform-Specific Instructions](#platform-specific-instructions)
- [Advanced Installation Options](#advanced-installation-options)
- [Verifying Installation](#verifying-installation)
- [Troubleshooting](#troubleshooting)
- [Uninstalling](#uninstalling)

## Quick Install (Recommended)

### One-Line Installation

The fastest way to install BAM is using our installation script:

#### macOS and Linux
```bash
curl -fsSL https://raw.githubusercontent.com/twilson63/bam/master/scripts/install.sh | sh
```

#### Windows PowerShell
```powershell
iex (irm https://raw.githubusercontent.com/twilson63/bam/master/scripts/install.ps1)
```

#### Alternative using wget
```bash
wget -qO- https://raw.githubusercontent.com/twilson63/bam/master/scripts/install.sh | sh
```

## Platform-Specific Instructions

### macOS

#### Intel Macs (x64)
```bash
curl -fsSL https://raw.githubusercontent.com/twilson63/bam/master/scripts/install.sh | sh
```

#### Apple Silicon Macs (M1/M2/M3)
```bash
curl -fsSL https://raw.githubusercontent.com/twilson63/bam/master/scripts/install.sh | sh
```

The installer automatically detects your architecture and downloads the appropriate binary.

#### Using Homebrew (Coming Soon)
```bash
brew install bam
```

### Linux

#### Ubuntu/Debian
```bash
curl -fsSL https://raw.githubusercontent.com/twilson63/bam/master/scripts/install.sh | sh
```

#### Fedora/RHEL/CentOS
```bash
curl -fsSL https://raw.githubusercontent.com/twilson63/bam/master/scripts/install.sh | sh
```

#### Alpine Linux
```bash
wget -qO- https://raw.githubusercontent.com/twilson63/bam/master/scripts/install.sh | sh
```

#### Arch Linux (AUR - Coming Soon)
```bash
yay -S bam-bin
```

### Windows

#### Windows PowerShell (Recommended)
Run PowerShell as Administrator:
```powershell
iex (irm https://raw.githubusercontent.com/twilson63/bam/master/scripts/install.ps1)
```

#### Windows Subsystem for Linux (WSL)
```bash
curl -fsSL https://raw.githubusercontent.com/twilson63/bam/master/scripts/install.sh | sh
```

#### Git Bash
```bash
curl -fsSL https://raw.githubusercontent.com/twilson63/bam/master/scripts/install.sh | sh
```

#### Scoop (Coming Soon)
```powershell
scoop install bam
```

## Advanced Installation Options

### Installing Specific Versions

Install a specific version of BAM:
```bash
curl -fsSL https://raw.githubusercontent.com/twilson63/bam/master/scripts/install.sh | sh -s -- --version v2.0.0
```

List available versions:
```bash
curl -fsSL https://raw.githubusercontent.com/twilson63/bam/master/scripts/install.sh | sh -s -- --list-versions
```

### Custom Installation Directory

Install to a custom directory:
```bash
INSTALL_DIR=$HOME/bin curl -fsSL https://raw.githubusercontent.com/twilson63/bam/master/scripts/install.sh | sh
```

Or using the --install-dir flag:
```bash
curl -fsSL https://raw.githubusercontent.com/twilson63/bam/master/scripts/install.sh | sh -s -- --install-dir /opt/bam
```

### Dry Run Mode

Preview what the installer will do without making changes:
```bash
curl -fsSL https://raw.githubusercontent.com/twilson63/bam/master/scripts/install.sh | sh -s -- --dry-run
```

### Force Reinstall

Force reinstall even if BAM is already installed:
```bash
curl -fsSL https://raw.githubusercontent.com/twilson63/bam/master/scripts/install.sh | sh -s -- --force
```

### Offline Installation

For air-gapped environments, download the binary manually:

1. Download the appropriate binary from [GitHub Releases](https://github.com/twilson63/bam/releases)
2. Download the checksums file
3. Run the installer in offline mode:

```bash
curl -fsSL https://raw.githubusercontent.com/twilson63/bam/master/scripts/install.sh | sh -s -- --offline --binary-path ./bam-linux-x64
```

### Installing via Package Managers

#### npm (Node.js)
```bash
npm install -g bam
```

#### Bun
```bash
bun install -g bam-ssg
```

#### yarn
```bash
yarn global add bam
```

## Verifying Installation

After installation, verify BAM is correctly installed:

```bash
# Check version
bam --version

# Check installation location
which bam

# Test with help command
bam --help
```

## PATH Configuration

If `bam` command is not found after installation, you may need to add the installation directory to your PATH.

### Bash (~/.bashrc or ~/.bash_profile)
```bash
export PATH="$HOME/.local/bin:$PATH"
```

### Zsh (~/.zshrc)
```bash
export PATH="$HOME/.local/bin:$PATH"
```

### Fish (~/.config/fish/config.fish)
```fish
set -gx PATH $HOME/.local/bin $PATH
```

### Windows
The PowerShell installer automatically updates PATH. If needed, manually add:
1. Open System Properties → Environment Variables
2. Add `C:\Program Files\BAM` to PATH
3. Restart terminal

## Troubleshooting

### Common Issues

#### Permission Denied
If you get permission errors, the installer will automatically try to use a user directory. You can also specify a custom directory:
```bash
INSTALL_DIR=$HOME/.local/bin curl -fsSL https://raw.githubusercontent.com/twilson63/bam/master/scripts/install.sh | sh
```

#### Command Not Found
After installation, if `bam` is not found:
1. Check if the binary exists: `ls ~/.local/bin/bam`
2. Add to PATH: `export PATH="$HOME/.local/bin:$PATH"`
3. Reload shell: `source ~/.bashrc` (or appropriate config file)

#### SSL/TLS Errors
If you encounter SSL errors:
```bash
# Use wget instead
wget --no-check-certificate -qO- https://raw.githubusercontent.com/twilson63/bam/master/scripts/install.sh | sh

# Or download directly
curl -kfsSL https://raw.githubusercontent.com/twilson63/bam/master/scripts/install.sh | sh
```

#### Proxy Issues
If behind a corporate proxy:
```bash
# Set proxy variables
export HTTP_PROXY=http://proxy.example.com:8080
export HTTPS_PROXY=http://proxy.example.com:8080
curl -fsSL https://raw.githubusercontent.com/twilson63/bam/master/scripts/install.sh | sh
```

#### Checksum Verification Failed
If checksum verification fails:
1. Try downloading again (may be corrupted)
2. Check if you're downloading the correct version
3. Report issue on GitHub if problem persists

### Getting Help

If you encounter issues:

1. Run installer in verbose mode:
```bash
curl -fsSL https://raw.githubusercontent.com/twilson63/bam/master/scripts/install.sh | sh -s -- --verbose
```

2. Check the [GitHub Issues](https://github.com/twilson63/bam/issues)

3. Join our community:
   - Discord: [Coming Soon]
   - GitHub Discussions: [Coming Soon]

## Uninstalling

### Using the Installer Script
```bash
curl -fsSL https://raw.githubusercontent.com/twilson63/bam/master/scripts/install.sh | sh -s -- --uninstall
```

### Manual Uninstall

#### macOS/Linux
```bash
# Remove binary
rm -f /usr/local/bin/bam
rm -f ~/.local/bin/bam

# Remove config (if any)
rm -rf ~/.config/bam
rm -rf ~/.bam
```

#### Windows PowerShell
```powershell
# Run as Administrator
Remove-Item "C:\Program Files\BAM" -Recurse -Force
# Remove from PATH manually via System Properties
```

#### npm
```bash
npm uninstall -g bam
```

#### Bun
```bash
bun uninstall -g bam-ssg
```

## Security

### Checksum Verification
All binaries are verified using SHA256 checksums. The installer automatically verifies checksums before installation.

To manually verify:
```bash
# Download binary and checksums
curl -LO https://github.com/twilson63/bam/releases/latest/download/bam-linux-x64
curl -LO https://github.com/twilson63/bam/releases/latest/download/checksums.txt

# Verify
sha256sum -c checksums.txt --ignore-missing
```

### GPG Signatures (Coming Soon)
Future releases will include GPG signatures for additional security.

## System Requirements

### Minimum Requirements
- **OS**: macOS 10.15+, Linux (glibc 2.17+), Windows 10+
- **Architecture**: x64 or ARM64
- **RAM**: 128MB
- **Disk**: 50MB

### Recommended
- **OS**: Latest stable version
- **RAM**: 256MB+
- **Disk**: 100MB+
- **Network**: For downloading templates and packages

## Next Steps

After installation:

1. **Create your first site**:
```bash
bam new mysite
cd mysite
bam run
```

2. **Read the documentation**:
   - [Quick Start Guide](README.md)
   - [Templates Guide](TEMPLATES.md)
   - [Configuration Guide](CONFIG.md)

3. **Explore templates**:
```bash
bam new --list-templates
```

## Support

- **Documentation**: [https://github.com/twilson63/bam](https://github.com/twilson63/bam)
- **Issues**: [https://github.com/twilson63/bam/issues](https://github.com/twilson63/bam/issues)
- **Discussions**: [https://github.com/twilson63/bam/discussions](https://github.com/twilson63/bam/discussions)

---

**Happy building with BAM!** 🚀