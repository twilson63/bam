# BAM

![bam](http://bam.jpg.to)

The easiest static site generator on the planet. ⚡️ **Now with Bun support for blazing-fast performance!**

## 🚀 Quick Install

### One-line Installation (Recommended)

#### macOS/Linux
```bash
curl -fsSL https://raw.githubusercontent.com/twilson63/bam/master/scripts/install.sh | sh
```

#### Windows (PowerShell)
```powershell
iex (irm https://raw.githubusercontent.com/twilson63/bam/master/scripts/install.ps1)
```

#### Alternative Installation Methods

**Using wget:**
```bash
wget -qO- https://raw.githubusercontent.com/twilson63/bam/master/scripts/install.sh | sh
```

**Install specific version:**
```bash
curl -fsSL https://raw.githubusercontent.com/twilson63/bam/master/scripts/install.sh | sh -s -- --version v2.0.0
```

**Install to custom directory:**
```bash
INSTALL_DIR=$HOME/bin curl -fsSL https://raw.githubusercontent.com/twilson63/bam/master/scripts/install.sh | sh
```

### Traditional Installation

**Via npm:**
```bash
npm install bam -g
```

**Via Bun:**
```bash
bun install -g bam-ssg
```

## ✨ Features

- **Lightning Fast**: Powered by Bun for 5x faster builds
- **Simple**: Minimal configuration, maximum productivity
- **Multiple Templates**: Skeleton, Bootstrap, Reveal.js, Angular, Pagedown
- **Live Reload**: Development server with hot reloading
- **Markdown Support**: GitHub Flavored Markdown out of the box
- **Cross-Platform**: Works on macOS, Linux, and Windows

## 📖 Quick Start

### Create a new site with http://getskeleton.com

```bash
bam new mysite
```

### Create a new site with http://twitter.github.com/bootstrap

```bash
bam new mysite bootstrap
```

### Create a new site with http://revealjs.org

```bash
bam new mysite reveal
```

### Run in development mode

```bash
cd mysite
bam run
```

Open http://localhost:3000 in your browser.

### Generate static site

```bash
bam gen
```

Your static site will be in the `gen` folder.

### Serve the generated site

```bash
bam serve
```

Open http://localhost:8080 to view your generated site.

## 📁 Project Structure

```
mysite/
├── assets/          # Static assets (CSS, JS, images)
├── layouts/         # Page layouts (EJS templates)
├── pages/           # Content pages (Markdown, HTML, EJS)
├── gen/             # Generated static site (after bam gen)
└── package.json     # Project configuration
```

## 🎨 Working with Pages

Create pages in the `pages/` directory using:
- **Markdown** (`.md`) - For content-focused pages
- **HTML** (`.html`) - For custom layouts
- **EJS** (`.ejs`) - For dynamic templates

Example `pages/about.md`:
```markdown
---
title: About Us
layout: default
---

# About Our Company

We build amazing static sites with BAM!
```

## 🚀 Templates

BAM comes with several built-in templates:

- **skeleton** - Minimal, responsive CSS framework (default)
- **bootstrap** - Twitter Bootstrap for rapid development
- **reveal** - Reveal.js for presentations
- **angular** - Angular.js single-page applications
- **pagedown** - Markdown-focused documentation sites

## ⚡ Performance

The modernized BAM with Bun support provides:
- 5x faster startup time
- 5x faster build times for 100+ pages
- 50% reduction in memory usage
- Standalone executables (no Node.js required)

## 🔧 Advanced Usage

### Environment Variables
```bash
# Development mode
BAM_ENV=development bam run

# Custom port
BAM_PORT=4000 bam run

# Production build
BAM_ENV=production bam gen
```

### Uninstall
```bash
# If installed via curl
curl -fsSL https://raw.githubusercontent.com/twilson63/bam/master/scripts/install.sh | sh -s -- --uninstall

# If installed via npm
npm uninstall -g bam
```

## 📚 Documentation

- [Installation Guide](./scripts/README.md)
- [Migration Guide](./MIGRATION-GUIDE.md)
- [Modernization Details](./README-MODERNIZED.md)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT

## 👏 Credits

Created by Tom Wilson ([@twilson63](https://github.com/twilson63))

Modernized with Bun support by the BAM community

---

**Built with ❤️ using Bun** - The fastest JavaScript runtime