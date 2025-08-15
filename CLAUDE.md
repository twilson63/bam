# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

BAM is a static site generator written in CoffeeScript/JavaScript that provides an easy way to create static websites using various templates (Skeleton, Bootstrap, Reveal.js). The project follows a CLI-based approach with commands for creating, running, generating, and serving static sites.

## Development Commands

### Building the CoffeeScript source
```bash
# Build CoffeeScript files to JavaScript
cake build

# Watch and rebuild on changes
cake watch
```

### Testing
```bash
# Run the Mocha test suite
npm test
```

### BAM CLI Commands
```bash
# Create a new project
bam new [project-name] [template]
# Templates: skeleton (default), bootstrap, reveal, angular, pagedown

# Run development server (port 3000 by default)
bam run [port]

# Generate static site to ./gen directory
bam gen

# Serve generated static site
bam serve [port]
```

## Architecture

### Core Structure
- **src/** - CoffeeScript source files for the CLI and utilities
- **lib/** - Compiled JavaScript files (generated from src/)
- **templates/** - Template collections (skeleton, bootstrap, reveal, angular, pagedown)
- **bin/bam** - Main CLI entry point

### Main Components

1. **CLI Interface** (lib/index.js)
   - Uses Flatiron framework for CLI management
   - Routes commands to appropriate modules

2. **Command Modules**
   - `new.coffee` - Creates new projects from templates
   - `run.coffee` - Development server with live file serving
   - `gen.coffee` - Static site generation to ./gen directory
   - `serve.coffee` - Serves generated static sites

3. **Utilities** (src/util/)
   - `page.coffee` - Page rendering and template processing
   - `eco.coffee` - Eco template engine wrapper
   - `assets.coffee` - Asset file management
   - `misc.coffee` - Miscellaneous file operations
   - `zeke.coffee` - Zeke template integration

### Template System
- Uses Eco templates (.eco files) for HTML generation
- Supports multiple template frameworks out of the box
- Templates include layout files and page directories
- Asset files (CSS, JS, images) are copied during generation

### File Processing Flow
1. Pages in `pages/` directory are processed through templates
2. Layout templates wrap page content
3. Assets are copied to the generated site
4. Special files (robots.txt, package.json, server.js) are generated from templates