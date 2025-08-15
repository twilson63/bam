#!/bin/bash
# BAM macOS Build Script
# Builds native macOS binaries using Bun

set -e

echo "🍎 Building BAM for macOS..."

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

# Build for macOS platforms
echo "🔨 Building for macOS..."

# Detect current architecture
ARCH=$(uname -m)
if [[ "$ARCH" == "arm64" ]]; then
    echo "🚀 Building for Apple Silicon (ARM64)..."
    bun build cli.js --compile --target=bun-darwin-arm64 --outfile=dist/bam-macos-arm64
    
    echo "🔨 Cross-compiling for Intel (x64)..."
    bun build cli.js --compile --target=bun-darwin-x64 --outfile=dist/bam-macos-x64 || {
        echo "⚠️  Cross-compilation to x64 failed, skipping..."
    }
else
    echo "🚀 Building for Intel (x64)..."
    bun build cli.js --compile --target=bun-darwin-x64 --outfile=dist/bam-macos-x64
    
    echo "🔨 Cross-compiling for Apple Silicon (ARM64)..."
    bun build cli.js --compile --target=bun-darwin-arm64 --outfile=dist/bam-macos-arm64 || {
        echo "⚠️  Cross-compilation to ARM64 failed, skipping..."
    }
fi

# Create universal binary if both architectures built successfully
if [[ -f "dist/bam-macos-x64" && -f "dist/bam-macos-arm64" ]]; then
    echo "🔗 Creating universal binary..."
    lipo -create -output dist/bam-macos-universal dist/bam-macos-x64 dist/bam-macos-arm64
    echo "✅ Created universal binary: dist/bam-macos-universal"
fi

# Set executable permissions
chmod +x dist/bam-macos-* 2>/dev/null || true

# Create macOS installer package (optional)
if command -v pkgbuild &> /dev/null; then
    echo "📦 Creating macOS installer package..."
    
    # Create temporary directory structure
    mkdir -p pkg/usr/local/bin
    
    # Copy binary (prefer universal, then native arch, then any available)
    if [[ -f "dist/bam-macos-universal" ]]; then
        cp dist/bam-macos-universal pkg/usr/local/bin/bam
    elif [[ "$ARCH" == "arm64" && -f "dist/bam-macos-arm64" ]]; then
        cp dist/bam-macos-arm64 pkg/usr/local/bin/bam
    elif [[ "$ARCH" == "x86_64" && -f "dist/bam-macos-x64" ]]; then
        cp dist/bam-macos-x64 pkg/usr/local/bin/bam
    else
        # Use any available binary
        cp dist/bam-macos-* pkg/usr/local/bin/bam 2>/dev/null | head -1 || {
            echo "⚠️  No macOS binary found for package creation"
        }
    fi
    
    if [[ -f "pkg/usr/local/bin/bam" ]]; then
        chmod +x pkg/usr/local/bin/bam
        
        # Create package
        pkgbuild --root pkg \
                --identifier com.beautifulnode.bam \
                --version "0.9.2-bun" \
                --install-location / \
                dist/bam-macos.pkg
        
        echo "✅ Created installer package: dist/bam-macos.pkg"
    fi
    
    # Cleanup
    rm -rf pkg
fi

# Create installation script
cat > dist/install-macos.sh << 'EOF'
#!/bin/bash
# BAM macOS Installation Script

set -e

echo "🍎 Installing BAM for macOS..."

# Detect architecture
ARCH=$(uname -m)
BINARY_NAME=""

if [[ -f "bam-macos-universal" ]]; then
    BINARY_NAME="bam-macos-universal"
    echo "📦 Using universal binary"
elif [[ "$ARCH" == "arm64" && -f "bam-macos-arm64" ]]; then
    BINARY_NAME="bam-macos-arm64"
    echo "🚀 Using Apple Silicon binary"
elif [[ "$ARCH" == "x86_64" && -f "bam-macos-x64" ]]; then
    BINARY_NAME="bam-macos-x64"
    echo "💻 Using Intel binary"
else
    echo "❌ No compatible binary found for architecture: $ARCH"
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
    echo "Add this line to your ~/.zshrc or ~/.bash_profile:"
    echo "export PATH=\"$INSTALL_DIR:\$PATH\""
fi

echo "🎉 Installation complete! Run 'bam --help' to get started."
EOF

chmod +x dist/install-macos.sh

# Print summary
echo ""
echo "🎉 macOS build completed!"
echo "📁 Output directory: $(pwd)/dist"
echo ""
echo "Built binaries:"
ls -la dist/bam-macos-* 2>/dev/null || echo "No binaries found"
echo ""
echo "To install locally:"
echo "  cd dist && ./install-macos.sh"
echo ""
echo "To install system-wide:"
echo "  sudo installer -pkg dist/bam-macos.pkg -target /" 

cd ..

echo "✅ macOS build script completed successfully!"