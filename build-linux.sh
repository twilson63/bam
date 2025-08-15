#!/bin/bash
# BAM Linux Build Script
# Builds native Linux binaries using Bun

set -e

echo "🐧 Building BAM for Linux..."

# Check if Bun is installed
if ! command -v bun &> /dev/null; then
    echo "❌ Bun is not installed. Please install Bun first:"
    echo "curl -fsSL https://bun.sh/install | bash"
    exit 1
fi

echo "⚡ Using Bun $(bun --version)"

# Navigate to bun directory
cd "$(dirname "$0")/bun"

# Install dependencies
echo "📦 Installing dependencies..."
bun install

# Clean previous builds
echo "🧹 Cleaning previous builds..."
rm -rf dist

# Build for Linux platforms
echo "🔨 Building for Linux..."

# Detect current architecture
ARCH=$(uname -m)
case "$ARCH" in
    x86_64)
        echo "🚀 Building for x64..."
        bun build cli.js --compile --target=linux-x64 --outfile=dist/bam-linux-x64
        
        echo "🔨 Cross-compiling for ARM64..."
        bun build cli.js --compile --target=linux-arm64 --outfile=dist/bam-linux-arm64 || {
            echo "⚠️  Cross-compilation to ARM64 failed, skipping..."
        }
        ;;
    aarch64|arm64)
        echo "🚀 Building for ARM64..."
        bun build cli.js --compile --target=linux-arm64 --outfile=dist/bam-linux-arm64
        
        echo "🔨 Cross-compiling for x64..."
        bun build cli.js --compile --target=linux-x64 --outfile=dist/bam-linux-x64 || {
            echo "⚠️  Cross-compilation to x64 failed, skipping..."
        }
        ;;
    *)
        echo "⚠️  Unknown architecture $ARCH, attempting x64 build..."
        bun build cli.js --compile --target=linux-x64 --outfile=dist/bam-linux-x64
        ;;
esac

# Set executable permissions
chmod +x dist/bam-linux-* 2>/dev/null || true

# Create AppImage (if tools are available)
if command -v appimagetool &> /dev/null; then
    echo "📦 Creating AppImage..."
    
    # Create AppDir structure
    mkdir -p AppDir/usr/bin
    mkdir -p AppDir/usr/share/applications
    mkdir -p AppDir/usr/share/icons/hicolor/64x64/apps
    
    # Copy binary (prefer native arch)
    if [[ "$ARCH" == "x86_64" && -f "dist/bam-linux-x64" ]]; then
        cp dist/bam-linux-x64 AppDir/usr/bin/bam
    elif [[ "$ARCH" == "aarch64" && -f "dist/bam-linux-arm64" ]]; then
        cp dist/bam-linux-arm64 AppDir/usr/bin/bam
    else
        # Use any available binary
        cp dist/bam-linux-* AppDir/usr/bin/bam 2>/dev/null | head -1 || {
            echo "⚠️  No Linux binary found for AppImage creation"
        }
    fi
    
    if [[ -f "AppDir/usr/bin/bam" ]]; then
        chmod +x AppDir/usr/bin/bam
        
        # Create desktop file
        cat > AppDir/usr/share/applications/bam.desktop << EOF
[Desktop Entry]
Type=Application
Name=BAM
Comment=Static Site Generator
Exec=bam
Icon=bam
Categories=Development;WebDevelopment;
Terminal=true
EOF
        
        # Create a simple icon (you might want to replace this with a real icon)
        cat > AppDir/usr/share/icons/hicolor/64x64/apps/bam.svg << 'EOF'
<svg width="64" height="64" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
  <rect width="64" height="64" fill="#3498db" rx="8"/>
  <text x="32" y="40" font-family="Arial, sans-serif" font-size="24" font-weight="bold" fill="white" text-anchor="middle">BAM</text>
</svg>
EOF
        
        # Create AppRun
        cat > AppDir/AppRun << 'EOF'
#!/bin/bash
exec "${APPDIR}/usr/bin/bam" "$@"
EOF
        chmod +x AppDir/AppRun
        
        # Build AppImage
        appimagetool AppDir dist/BAM-linux-$ARCH.AppImage
        echo "✅ Created AppImage: dist/BAM-linux-$ARCH.AppImage"
    fi
    
    # Cleanup
    rm -rf AppDir
fi

# Create .deb package (if tools are available)
if command -v dpkg-deb &> /dev/null; then
    echo "📦 Creating .deb package..."
    
    # Determine architecture for .deb
    DEB_ARCH="amd64"
    if [[ "$ARCH" == "aarch64" ]]; then
        DEB_ARCH="arm64"
    fi
    
    # Create package directory structure
    DEB_DIR="bam_0.9.2-bun_${DEB_ARCH}"
    mkdir -p "${DEB_DIR}/usr/local/bin"
    mkdir -p "${DEB_DIR}/DEBIAN"
    
    # Copy binary
    if [[ "$ARCH" == "x86_64" && -f "dist/bam-linux-x64" ]]; then
        cp dist/bam-linux-x64 "${DEB_DIR}/usr/local/bin/bam"
    elif [[ "$ARCH" == "aarch64" && -f "dist/bam-linux-arm64" ]]; then
        cp dist/bam-linux-arm64 "${DEB_DIR}/usr/local/bin/bam"
    else
        # Use any available binary
        cp dist/bam-linux-* "${DEB_DIR}/usr/local/bin/bam" 2>/dev/null | head -1 || {
            echo "⚠️  No Linux binary found for .deb creation"
        }
    fi
    
    if [[ -f "${DEB_DIR}/usr/local/bin/bam" ]]; then
        chmod +x "${DEB_DIR}/usr/local/bin/bam"
        
        # Create control file
        cat > "${DEB_DIR}/DEBIAN/control" << EOF
Package: bam
Version: 0.9.2-bun
Section: web
Priority: optional
Architecture: ${DEB_ARCH}
Depends: libc6
Maintainer: Tom Wilson <tom@beautifulnode.com>
Description: BAM Static Site Generator (Bun-optimized)
 The easiest static site generator on the planet, now optimized with Bun
 for maximum performance. Create beautiful static websites with minimal
 configuration and lightning-fast build times.
Homepage: http://www.usebam.com
EOF
        
        # Build .deb package
        dpkg-deb --build "${DEB_DIR}" "dist/bam_0.9.2-bun_${DEB_ARCH}.deb"
        echo "✅ Created .deb package: dist/bam_0.9.2-bun_${DEB_ARCH}.deb"
    fi
    
    # Cleanup
    rm -rf "${DEB_DIR}"
fi

# Create installation script
cat > dist/install-linux.sh << 'EOF'
#!/bin/bash
# BAM Linux Installation Script

set -e

echo "🐧 Installing BAM for Linux..."

# Detect architecture
ARCH=$(uname -m)
BINARY_NAME=""

case "$ARCH" in
    x86_64)
        if [[ -f "bam-linux-x64" ]]; then
            BINARY_NAME="bam-linux-x64"
            echo "💻 Using x64 binary"
        fi
        ;;
    aarch64|arm64)
        if [[ -f "bam-linux-arm64" ]]; then
            BINARY_NAME="bam-linux-arm64"
            echo "🚀 Using ARM64 binary"
        fi
        ;;
esac

if [[ -z "$BINARY_NAME" ]]; then
    echo "❌ No compatible binary found for architecture: $ARCH"
    echo "Available binaries:"
    ls -la bam-linux-* 2>/dev/null || echo "No binaries found"
    exit 1
fi

# Install directory
INSTALL_DIR="/usr/local/bin"
if [[ ! -w "$INSTALL_DIR" ]]; then
    echo "⚠️  /usr/local/bin is not writable, installing to ~/.local/bin"
    INSTALL_DIR="$HOME/.local/bin"
    mkdir -p "$INSTALL_DIR"
fi

# Copy binary
cp "$BINARY_NAME" "$INSTALL_DIR/bam"
chmod +x "$INSTALL_DIR/bam"

echo "✅ BAM installed successfully to $INSTALL_DIR/bam"

# Check if directory is in PATH
if [[ ":$PATH:" != *":$INSTALL_DIR:"* ]]; then
    echo "⚠️  $INSTALL_DIR is not in your PATH"
    echo "Add this line to your ~/.bashrc or ~/.zshrc:"
    echo "export PATH=\"$INSTALL_DIR:\$PATH\""
fi

echo "🎉 Installation complete! Run 'bam --help' to get started."
EOF

chmod +x dist/install-linux.sh

# Create systemd service template (optional)
cat > dist/bam.service << 'EOF'
[Unit]
Description=BAM Static Site Generator Development Server
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/html
ExecStart=/usr/local/bin/bam run 3000
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
EOF

# Print summary
echo ""
echo "🎉 Linux build completed!"
echo "📁 Output directory: $(pwd)/dist"
echo ""
echo "Built binaries:"
ls -la dist/bam-linux-* 2>/dev/null || echo "No binaries found"
echo ""
echo "Installation options:"
echo "  1. Script install:    cd dist && ./install-linux.sh"
if [[ -f "dist/bam_0.9.2-bun_${DEB_ARCH}.deb" ]]; then
    echo "  2. .deb package:      sudo dpkg -i dist/bam_0.9.2-bun_${DEB_ARCH}.deb"
fi
if [[ -f "dist/BAM-linux-$ARCH.AppImage" ]]; then
    echo "  3. AppImage:          chmod +x dist/BAM-linux-$ARCH.AppImage && ./dist/BAM-linux-$ARCH.AppImage"
fi

cd ..

echo "✅ Linux build script completed successfully!"