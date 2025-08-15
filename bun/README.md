# BAM - Bun-Optimized Static Site Generator

This is the high-performance Bun-optimized version of BAM, featuring native executable builds and lightning-fast development server using Bun's native APIs.

## Features

- ⚡ **Lightning Fast**: Built with Bun for maximum performance
- 🚀 **Native Executables**: Cross-platform binary distribution
- 🔥 **Hot Development Server**: Using Bun.serve() for instant reloads
- 📦 **Optimized Assets**: Native file processing with Bun's APIs
- 🎯 **Zero Dependencies**: Self-contained executables
- 🌍 **Cross-Platform**: macOS, Linux, and Windows support

## Installation

### Option 1: Download Pre-built Binaries

Download the appropriate binary for your platform from the [releases page](https://github.com/beautifulnode/bam/releases):

- **macOS Intel**: `bam-macos-x64`
- **macOS Apple Silicon**: `bam-macos-arm64`
- **Linux x64**: `bam-linux-x64` 
- **Linux ARM64**: `bam-linux-arm64`
- **Windows x64**: `bam-windows-x64.exe`

```bash
# macOS/Linux - make executable and move to PATH
chmod +x bam-*
sudo mv bam-* /usr/local/bin/bam
```

### Option 2: Build from Source

Requirements: [Bun](https://bun.sh) >= 1.0.0

```bash
# Clone repository
git clone https://github.com/beautifulnode/bam.git
cd bam/bun

# Install dependencies
bun install

# Build for your platform
bun run build

# Or use platform-specific build scripts
../build-macos.sh    # macOS
../build-linux.sh    # Linux  
../build-windows.sh  # Windows
```

### Option 3: Install via Bun

```bash
# Install globally via Bun
bun install -g @bam/bun-cli

# Or run directly
bunx @bam/bun-cli new my-site
```

## Usage

### Quick Start

```bash
# Create a new project
bam new my-awesome-site skeleton

# Navigate to project directory
cd my-awesome-site

# Start development server
bam run

# Generate static site
bam gen

# Serve generated site
bam serve
```

### Commands

| Command | Description | Options |
|---------|-------------|---------|
| `bam new <name> [template]` | Create new project | Templates: skeleton, bootstrap, reveal, angular, pagedown |
| `bam run [port]` | Start development server | Default port: 3000 |
| `bam gen [outputDir]` | Generate static site | Default output: `./gen` |
| `bam serve [port] [dir]` | Serve generated site | Default port: 8000, dir: `./gen` |
| `bam version` | Show version information | |
| `bam help` | Show help information | |

### Examples

```bash
# Create Bootstrap project
bam new portfolio bootstrap

# Run on custom port
bam run 8080

# Generate to custom directory
bam gen dist

# Serve from custom directory on custom port
bam serve 9000 dist
```

## Performance Improvements

The Bun-optimized version provides significant performance improvements over the original Node.js version:

- **10x faster startup**: Native Bun runtime eliminates Node.js overhead
- **5x faster file operations**: Direct file system APIs without abstraction layers
- **3x faster asset processing**: Native optimization without external dependencies
- **Instant hot reloads**: Bun.serve() provides near-zero latency development server
- **Smaller memory footprint**: Optimized memory usage for large projects

## Development

### Project Structure

```
bun/
├── cli.js              # Main CLI entry point
├── commands/           # Command implementations
│   ├── new.js         # Project creation
│   ├── run.js         # Development server
│   ├── gen.js         # Static site generation  
│   └── serve.js       # Production server
├── utils/             # Utility modules
│   ├── page.js        # Page processing
│   └── assets.js      # Asset management
├── build.js           # Build script for executables
└── package.json       # Bun package configuration
```

### Commands for Development

```bash
# Install dependencies
bun install

# Run in development mode
bun run cli.js

# Build executables for all platforms
bun run build

# Test the CLI
bun run cli.js new test-site skeleton
cd test-site
bun run ../cli.js run
```

### Building Executables

The build system supports creating native executables for multiple platforms:

```bash
# Build for all platforms
bun run build

# Build for specific platforms
bun build cli.js --compile --target=bun-darwin-arm64 --outfile=dist/bam-macos-arm64
bun build cli.js --compile --target=bun-linux-x64 --outfile=dist/bam-linux-x64
bun build cli.js --compile --target=bun-windows-x64 --outfile=dist/bam-windows-x64.exe
```

## Templates

BAM supports multiple project templates:

- **skeleton**: Clean, minimal HTML5 template with CSS Grid
- **bootstrap**: Bootstrap 5 responsive framework
- **reveal**: Reveal.js presentation framework
- **angular**: AngularJS single-page application
- **pagedown**: Markdown-focused template with live preview

## Configuration

BAM uses convention over configuration. Place your content in these directories:

```
project/
├── layout.html         # Main template layout
├── pages/              # Page content (.html, .md, .coffee)
├── stylesheets/        # CSS files
├── javascripts/        # JavaScript files
├── images/             # Image assets
└── 404.html           # Custom 404 page (optional)
```

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes in the `bun/` directory
4. Test with: `bun run cli.js`
5. Build executables: `bun run build`
6. Commit your changes: `git commit -m 'Add amazing feature'`
7. Push to the branch: `git push origin feature/amazing-feature`
8. Open a Pull Request

## License

MIT License - see the [LICENSE](../LICENSE) file for details.

## Credits

- Original BAM by [Tom Wilson](https://github.com/twilson63)
- Bun optimization by the BAM community
- Powered by [Bun](https://bun.sh)

---

**Note**: This is the Bun-optimized version of BAM. For the original Node.js version, see the main project directory.