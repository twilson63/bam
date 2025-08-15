# BAM ES6+ Conversion

This directory contains the modernized ES6+ version of the BAM static site generator, converted from the original CoffeeScript implementation.

## Overview

The conversion includes:

- **Modern ES6+ JavaScript** with imports/exports, arrow functions, async/await
- **Updated Dependencies** using modern replacements:
  - `eco` → `ejs` (template engine)
  - `github-flavored-markdown` → `marked` (markdown parser)
  - `flatiron` → `commander` (CLI framework)
  - `wrench` → `fs-extra` (file system utilities)
- **Improved Error Handling** with proper try/catch blocks
- **Type Safety Preparation** with JSDoc comments
- **Modern Dev Tools** including ESLint and Prettier

## Directory Structure

```
src-es6/
├── index.js          # Main CLI entry point
├── new.js           # Project creation command
├── run.js           # Development server command  
├── gen.js           # Static site generation command
├── serve.js         # Static site serving command
└── util/
    ├── eco.js       # EJS template rendering
    ├── page.js      # Page processing and rendering
    ├── assets.js    # Asset copying utilities
    ├── misc.js      # Miscellaneous file operations
    └── zeke.js      # CoffeeScript template compiler

test-es6/
├── default.js       # Basic CLI tests
├── bam_new_test.js  # Project creation tests
└── bam_gen_test.js  # Site generation tests

templates-es6/
├── reveal/pages/index.js    # Reveal.js template (JS version)
└── pagedown/pages/index.js  # Pagedown template (JS version)
```

## Installation and Setup

1. Install dependencies for the ES6 version:
```bash
npm install --save-dev $(cat package-es6.json | jq -r '.devDependencies | keys[]')
npm install --save $(cat package-es6.json | jq -r '.dependencies | keys[]')
```

2. Or copy the package-es6.json over the main package.json:
```bash
cp package-es6.json package.json
npm install
```

## Usage

### Development

```bash
# Run with Node.js directly
node src-es6/index.js --help

# Run tests
npm test

# Run tests in watch mode  
npm run test:watch

# Lint code
npm run lint

# Format code
npm run format

# Development with auto-restart
npm run dev
```

### Commands

The ES6 version maintains the same CLI interface:

```bash
# Create new project
node src-es6/index.js new mysite skeleton

# Run development server
node src-es6/index.js run 3000

# Generate static site
node src-es6/index.js gen

# Serve generated site
node src-es6/index.js serve
```

## Key Improvements

### 1. Modern JavaScript Features
- **ES Modules**: Import/export instead of CommonJS require()
- **Async/Await**: Proper asynchronous handling
- **Arrow Functions**: Concise function syntax
- **Destructuring**: Clean object/array manipulation
- **Template Literals**: Improved string formatting

### 2. Better Error Handling
- Comprehensive try/catch blocks
- Meaningful error messages
- Graceful degradation for missing files
- Proper cleanup in tests

### 3. Enhanced Dependencies
- **Commander.js**: Modern CLI framework with better help and validation
- **EJS**: Actively maintained template engine with ECO compatibility layer
- **Marked**: Fast, spec-compliant markdown parser
- **fs-extra**: Enhanced file system operations with promises

### 4. Development Experience
- **ESLint**: Code quality and style enforcement
- **Prettier**: Consistent code formatting
- **Mocha**: Modern test runner with ES modules support
- **Nodemon**: Development server with auto-restart

### 5. Performance Improvements
- **Streaming**: Better memory usage for file operations
- **Promises**: Non-blocking I/O operations
- **Modern Node.js**: Takes advantage of latest Node.js features

## Migration Notes

### Template Engine Changes
The conversion from ECO to EJS includes a compatibility layer:
- ECO syntax `<%- content %>` maps to EJS `<%= content %>`
- Most existing `.eco` templates will work with minimal changes

### CoffeeScript Template Handling
The Zeke utility provides basic CoffeeScript-to-HTML compilation:
- Simple HTML generation patterns are supported
- Complex CoffeeScript may need manual conversion
- Consider migrating templates to pure HTML or EJS

### File Structure Compatibility
The ES6 version maintains compatibility with existing BAM projects:
- Same template structure
- Same asset organization
- Same output format

## Testing

The test suite has been converted to ES6 with enhanced features:

```bash
# Run all tests
npm test

# Run specific test file
npx mocha test-es6/bam_new_test.js

# Run tests with coverage (if coverage tool added)
npm run test:coverage
```

## Configuration

### ESLint (.eslintrc.js)
- Standard JavaScript style guide
- Node.js environment settings
- ES2022 support
- Mocha test environment

### Prettier (.prettierrc)
- 2-space indentation
- Single quotes
- Semicolons required
- 100 character line width

## Future Enhancements

The ES6 conversion enables several potential improvements:

1. **TypeScript Support**: Easy migration path to TypeScript
2. **Module System**: Better code organization and reusability  
3. **Modern Frameworks**: Integration with Vite, Webpack, etc.
4. **Plugin System**: Extensible architecture
5. **Hot Reloading**: Enhanced development experience
6. **Progressive Web App**: Modern web features

## Compatibility

- **Node.js**: Requires Node.js 16.0.0 or higher
- **Browsers**: ES2022 features (for any client-side code)
- **Operating Systems**: Cross-platform (Windows, macOS, Linux)

The ES6 version maintains full backward compatibility with projects created by the original BAM tool.