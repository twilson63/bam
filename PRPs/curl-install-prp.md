# Project Request Protocol (PRP): Curl Installation Support

## Project Overview

### Project Name
BAM Curl Installation Script Implementation

### Executive Summary
Create a robust, user-friendly curl-based installation script for BAM that enables one-line installation from the command line. This will significantly improve the user onboarding experience by providing a simple, standard installation method similar to popular tools like Homebrew, Rust, and Bun.

### Current State
- Manual download and installation process
- Multiple steps required for installation
- Platform-specific instructions scattered in documentation
- No automatic platform detection
- No version management or update mechanism

### Target State
- One-line curl installation command
- Automatic platform and architecture detection
- Intelligent installation path selection
- Version management support
- Graceful error handling and recovery
- Clear installation feedback and next steps

## Technical Requirements

### Core Features

#### 1. Installation Script
- **Hosted Script**: Publicly accessible installation script
- **Platform Detection**: Automatic OS and architecture detection
- **Binary Selection**: Choose correct binary based on platform
- **Path Management**: Install to appropriate system location
- **Permission Handling**: Manage executable permissions correctly
- **Error Recovery**: Graceful handling of failures

#### 2. Supported Platforms
- **macOS**: Intel (x64) and Apple Silicon (ARM64)
- **Linux**: x64 and ARM64
- **Windows**: x64 (via WSL or Git Bash)

#### 3. Installation Locations
- **Primary**: `/usr/local/bin` (system-wide)
- **Fallback**: `~/.local/bin` (user-specific)
- **Custom**: Support `INSTALL_DIR` environment variable

#### 4. Version Management
- **Latest**: Install latest stable release by default
- **Specific**: Support installing specific versions
- **Upgrade**: Detect and handle existing installations
- **Rollback**: Keep backup of previous version

### Installation Flow

```
User runs curl command
    ↓
Script downloads and executes
    ↓
Detect OS and architecture
    ↓
Determine installation directory
    ↓
Download appropriate binary
    ↓
Verify download integrity
    ↓
Install binary with permissions
    ↓
Update PATH if needed
    ↓
Display success message
```

### Script Requirements

#### 1. Safety Features
- **Checksum Verification**: Verify binary integrity
- **HTTPS Only**: Enforce secure downloads
- **No Root Required**: Work without sudo when possible
- **Dry Run Mode**: Preview actions without executing
- **Uninstall Support**: Clean removal option

#### 2. User Experience
- **Progress Indicators**: Show download progress
- **Clear Messages**: Informative status updates
- **Error Messages**: Helpful troubleshooting guidance
- **Success Confirmation**: Clear next steps
- **Shell Detection**: Work with bash, zsh, fish

#### 3. Advanced Options
```bash
# Basic installation
curl -fsSL https://bam.sh/install | sh

# Install specific version
curl -fsSL https://bam.sh/install | sh -s -- --version 2.0.0

# Install to custom directory
curl -fsSL https://bam.sh/install | INSTALL_DIR=/opt/bam sh

# Dry run mode
curl -fsSL https://bam.sh/install | sh -s -- --dry-run

# Force reinstall
curl -fsSL https://bam.sh/install | sh -s -- --force

# Uninstall
curl -fsSL https://bam.sh/install | sh -s -- --uninstall
```

## Implementation Steps

### Phase 1: Core Script Development

#### 1. Create Installation Script (`install.sh`)
```bash
#!/bin/sh
# Universal installation script with platform detection
# Features: version management, error handling, progress display
```

#### 2. Platform Detection Logic
- OS detection (Darwin, Linux, Windows)
- Architecture detection (x86_64, aarch64, arm64)
- Binary mapping to download URLs

#### 3. Download and Verification
- Secure HTTPS downloads
- Progress bar implementation
- SHA256 checksum verification
- Retry logic for failed downloads

### Phase 2: Installation Logic

#### 1. Directory Management
- Check write permissions
- Create directories if needed
- Handle PATH updates
- Shell configuration updates

#### 2. Binary Installation
- Download to temporary location
- Verify integrity
- Move to final location
- Set executable permissions
- Create symlinks if needed

#### 3. Error Handling
- Network failures
- Permission issues
- Disk space checks
- Existing installation conflicts

### Phase 3: Version Management

#### 1. Version Detection
- Query GitHub releases API
- Parse version tags
- Validate version format

#### 2. Update Mechanism
- Check current version
- Compare with latest
- Backup existing binary
- Install new version

### Phase 4: Documentation Updates

#### 1. README Updates
- Prominent installation section
- One-line install command
- Platform-specific notes
- Troubleshooting guide

#### 2. Website Integration
- Install page with curl command
- Platform detection on website
- Custom install command generator

### Phase 5: Distribution

#### 1. Hosting Setup
- GitHub Pages for script hosting
- CDN for binary distribution
- Fallback mirrors

#### 2. URL Structure
```
https://bam.sh/install           # Installation script
https://bam.sh/install.ps1       # PowerShell variant
https://bam.sh/releases/latest   # Latest version info
https://bam.sh/releases/v2.0.0   # Specific version
```

## Success Criteria

### Functional Requirements
- ✅ One-line installation works on all platforms
- ✅ Automatic platform detection accurate
- ✅ Binary downloads and installs correctly
- ✅ PATH updates work across shells
- ✅ Version management functions properly

### Performance Requirements
- ✅ Installation completes in < 30 seconds
- ✅ Script size < 20KB
- ✅ Minimal dependencies (POSIX shell only)
- ✅ Works on slow connections (retry logic)

### Security Requirements
- ✅ HTTPS enforced for all downloads
- ✅ Checksum verification mandatory
- ✅ No arbitrary code execution
- ✅ Clear audit trail of actions

### User Experience Requirements
- ✅ Clear progress indicators
- ✅ Helpful error messages
- ✅ Success confirmation with next steps
- ✅ Works without user interaction

## Risk Assessment

### Technical Risks
1. **Platform Variations**
   - Mitigation: Extensive testing matrix
   
2. **Network Issues**
   - Mitigation: Retry logic, multiple mirrors

3. **Permission Problems**
   - Mitigation: Fallback locations, clear guidance

### Security Risks
1. **Man-in-the-Middle**
   - Mitigation: HTTPS only, checksums

2. **Script Injection**
   - Mitigation: Input validation, sandboxing

## Testing Requirements

### Test Scenarios
1. Fresh installation on each platform
2. Upgrade from existing installation
3. Installation with limited permissions
4. Network failure scenarios
5. Checksum mismatch handling
6. Custom directory installation
7. PATH update verification
8. Uninstall and cleanup

### Platforms to Test
- macOS 12+ (Intel and ARM)
- Ubuntu 20.04, 22.04
- Debian 11, 12
- Fedora 38+
- Alpine Linux
- WSL2 on Windows

## Deliverables

1. **Installation Script** (`install.sh`)
   - Universal POSIX-compliant script
   - Platform detection and binary selection
   - Error handling and recovery

2. **PowerShell Script** (`install.ps1`)
   - Windows-native installation
   - Similar features to shell script

3. **Updated README**
   - Prominent installation section
   - One-line curl command
   - Platform requirements
   - Troubleshooting guide

4. **GitHub Release Integration**
   - Automated checksum generation
   - Release notes with install command
   - Binary hosting setup

5. **Documentation**
   - Installation guide
   - Uninstall instructions
   - FAQ section
   - Developer notes

## Timeline

- **Day 1-2**: Core script development
- **Day 3**: Platform testing and refinement
- **Day 4**: Documentation updates
- **Day 5**: Release and deployment

## Example Installation Commands

### Standard Installation
```bash
# Latest version
curl -fsSL https://raw.githubusercontent.com/beautifulnode/bam/main/install.sh | sh

# Or using wget
wget -qO- https://raw.githubusercontent.com/beautifulnode/bam/main/install.sh | sh
```

### Advanced Usage
```bash
# Install specific version
curl -fsSL https://raw.githubusercontent.com/beautifulnode/bam/main/install.sh | sh -s -- v2.0.0

# Install to custom location
INSTALL_DIR=$HOME/bin curl -fsSL https://raw.githubusercontent.com/beautifulnode/bam/main/install.sh | sh

# Dry run to see what would happen
curl -fsSL https://raw.githubusercontent.com/beautifulnode/bam/main/install.sh | sh -s -- --dry-run
```

## Success Metrics

- Installation success rate > 95%
- Average installation time < 30 seconds
- User reported issues < 5%
- Platform coverage > 90% of users

## Conclusion

This curl installation implementation will significantly improve the BAM user experience by providing a simple, standard installation method that "just works" across all platforms. The script will be robust, secure, and user-friendly, matching the installation experience of modern developer tools.