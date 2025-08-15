#!/bin/bash

# BAM Multi-Platform Build Script
# Builds standalone executables for all supported platforms

set -e

echo "🚀 BAM Multi-Platform Build System"
echo "===================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Bun is installed
if ! command -v bun &> /dev/null; then
    echo -e "${RED}❌ Bun is not installed${NC}"
    echo "Please install Bun first: curl -fsSL https://bun.sh/install | bash"
    exit 1
fi

# Configuration
PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
BUILD_DIR="$PROJECT_ROOT/dist"
BUN_DIR="$PROJECT_ROOT/bun"
VERSION=$(node -p "require('$PROJECT_ROOT/package.json').version" 2>/dev/null || echo "2.0.0")

echo "📦 Version: $VERSION"
echo "📂 Build directory: $BUILD_DIR"
echo ""

# Create build directory
mkdir -p "$BUILD_DIR"
cd "$BUN_DIR"

# Install dependencies
echo "📥 Installing dependencies..."
bun install --production

# Function to build for a specific platform
build_platform() {
    local PLATFORM=$1
    local ARCH=$2
    local OUTPUT=$3
    
    echo -e "${YELLOW}Building for $PLATFORM-$ARCH...${NC}"
    
    if bun build ./cli.js \
        --compile \
        --target="$PLATFORM-$ARCH" \
        --outfile="$BUILD_DIR/$OUTPUT" \
        --minify; then
        
        # Make executable
        chmod +x "$BUILD_DIR/$OUTPUT"
        
        # Get file size
        SIZE=$(ls -lh "$BUILD_DIR/$OUTPUT" | awk '{print $5}')
        
        echo -e "${GREEN}✅ Built: $OUTPUT ($SIZE)${NC}"
        return 0
    else
        echo -e "${RED}❌ Failed to build for $PLATFORM-$ARCH${NC}"
        return 1
    fi
}

# Build for all platforms
echo "🔨 Building executables..."
echo "=========================="

# macOS builds
echo -e "\n${YELLOW}macOS Builds:${NC}"
build_platform "darwin" "x64" "bam-macos-x64"
build_platform "darwin" "arm64" "bam-macos-arm64"

# Linux builds
echo -e "\n${YELLOW}Linux Builds:${NC}"
build_platform "linux" "x64" "bam-linux-x64"
build_platform "linux" "arm64" "bam-linux-arm64"

# Windows build
echo -e "\n${YELLOW}Windows Build:${NC}"
build_platform "windows" "x64" "bam-windows-x64.exe"

# Create universal macOS binary
echo -e "\n${YELLOW}Creating Universal macOS Binary...${NC}"
if [ -f "$BUILD_DIR/bam-macos-x64" ] && [ -f "$BUILD_DIR/bam-macos-arm64" ]; then
    lipo -create -output "$BUILD_DIR/bam-macos-universal" \
        "$BUILD_DIR/bam-macos-x64" \
        "$BUILD_DIR/bam-macos-arm64" 2>/dev/null || {
        echo -e "${YELLOW}⚠️  lipo not available, skipping universal binary${NC}"
    }
    
    if [ -f "$BUILD_DIR/bam-macos-universal" ]; then
        chmod +x "$BUILD_DIR/bam-macos-universal"
        SIZE=$(ls -lh "$BUILD_DIR/bam-macos-universal" | awk '{print $5}')
        echo -e "${GREEN}✅ Built: bam-macos-universal ($SIZE)${NC}"
    fi
fi

# Create checksums
echo -e "\n${YELLOW}Generating checksums...${NC}"
cd "$BUILD_DIR"

# SHA256 checksums
if command -v sha256sum &> /dev/null; then
    sha256sum bam-* > SHA256SUMS
elif command -v shasum &> /dev/null; then
    shasum -a 256 bam-* > SHA256SUMS
fi

if [ -f SHA256SUMS ]; then
    echo -e "${GREEN}✅ Created SHA256SUMS${NC}"
fi

# Create version file
echo "$VERSION" > VERSION

# Create release notes
cat > RELEASE_NOTES.md << EOF
# BAM v$VERSION Release

## 🎉 Modernized Edition

This release includes standalone executables for all major platforms.

### 📦 Downloads

#### macOS
- \`bam-macos-x64\` - Intel/AMD processors
- \`bam-macos-arm64\` - Apple Silicon (M1/M2)
- \`bam-macos-universal\` - Universal binary (both architectures)

#### Linux
- \`bam-linux-x64\` - 64-bit Intel/AMD
- \`bam-linux-arm64\` - 64-bit ARM

#### Windows
- \`bam-windows-x64.exe\` - 64-bit

### 📝 Installation

1. Download the appropriate file for your platform
2. Make it executable: \`chmod +x bam-*\`
3. Move to your PATH: \`sudo mv bam-* /usr/local/bin/bam\`

### ✨ What's New
- Migrated from CoffeeScript to modern JavaScript
- Bun runtime for 2-5x performance improvement
- Standalone executables - no Node.js required
- Updated all dependencies to modern alternatives

### 🔒 Verification

Verify your download with the SHA256 checksum:
\`\`\`bash
sha256sum -c SHA256SUMS
\`\`\`

Built with Bun v$(bun --version | head -1)
EOF

echo -e "${GREEN}✅ Created RELEASE_NOTES.md${NC}"

# Create installation script
cat > install.sh << 'EOF'
#!/bin/bash
# BAM Installation Script

set -e

# Detect OS and architecture
OS=$(uname -s | tr '[:upper:]' '[:lower:]')
ARCH=$(uname -m)

# Map architecture names
case "$ARCH" in
    x86_64|amd64)
        ARCH="x64"
        ;;
    aarch64|arm64)
        ARCH="arm64"
        ;;
    *)
        echo "Unsupported architecture: $ARCH"
        exit 1
        ;;
esac

# Map OS names and select file
case "$OS" in
    darwin)
        FILE="bam-macos-$ARCH"
        ;;
    linux)
        FILE="bam-linux-$ARCH"
        ;;
    mingw*|msys*|cygwin*|windows*)
        FILE="bam-windows-x64.exe"
        ;;
    *)
        echo "Unsupported OS: $OS"
        exit 1
        ;;
esac

echo "📥 Downloading BAM for $OS-$ARCH..."

# Download URL
URL="https://github.com/beautifulnode/bam/releases/latest/download/$FILE"

# Download and install
if command -v curl &> /dev/null; then
    curl -L "$URL" -o bam
elif command -v wget &> /dev/null; then
    wget "$URL" -O bam
else
    echo "Please install curl or wget"
    exit 1
fi

# Make executable and install
chmod +x bam

if [ -w /usr/local/bin ]; then
    mv bam /usr/local/bin/
    echo "✅ BAM installed to /usr/local/bin/bam"
else
    echo "⚠️  Cannot write to /usr/local/bin"
    echo "Please run: sudo mv bam /usr/local/bin/"
fi

echo "🎉 Installation complete! Run 'bam --help' to get started."
EOF

chmod +x install.sh
echo -e "${GREEN}✅ Created install.sh${NC}"

# Summary
echo -e "\n${GREEN}==================================${NC}"
echo -e "${GREEN}✅ Build Complete!${NC}"
echo -e "${GREEN}==================================${NC}"
echo ""
echo "📦 Built executables:"
ls -lh bam-* | grep -v SHA256SUMS
echo ""
echo "📂 Output directory: $BUILD_DIR"
echo ""
echo "🚀 Next steps:"
echo "1. Test executables: $BUILD_DIR/bam-[platform] --version"
echo "2. Create GitHub release with these files"
echo "3. Upload to package managers (npm, homebrew, etc.)"
echo ""
echo "📝 For automated releases, use GitHub Actions:"
echo "   See: .github/workflows/build-bun.yml"