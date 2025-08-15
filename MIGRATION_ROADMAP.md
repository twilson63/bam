# BAM CoffeeScript to JavaScript/Bun Migration Roadmap

## Executive Summary

Migration of BAM static site generator from legacy CoffeeScript/Node.js to modern JavaScript with Bun runtime support. Total scope: 268 lines across 15 files.

## Architecture Overview

### Module System
- **From**: CommonJS (`require`/`module.exports`)
- **To**: ES6 Modules (`import`/`export`)
- **Runtime**: Bun (with Node.js fallback)

### Dependency Replacements

| Legacy Package | Modern Replacement | Status |
|---------------|-------------------|---------|
| eco | EJS | Template compatible |
| github-flavored-markdown | marked | Drop-in replacement |
| flatiron | commander.js | Industry standard |
| wrench | fs-extra + native fs | Bun optimized |
| filed | Bun.serve() | Native performance |
| w3 | Bun.serve() | Native performance |
| zeke/zeke-markdown | Evaluate/Remove | Low priority |

## Phase 1: Foundation (Week 1)

### 1.1 Development Environment Setup
- [ ] Install Bun runtime
- [ ] Set up migration testing environment
- [ ] Install modern dependencies
- [ ] Run dependency compatibility tests

**Files Created**:
- ✅ `/migration/dependency-analysis.md`
- ✅ `/migration/test-deps.js`
- ✅ `bun.build.js`
- ✅ `bunfig.toml`

### 1.2 Core Module Conversions
Convert foundational modules first:

**Priority Order**:
1. `src/index.coffee` → `src-es6/index.js` ✅ (sample created)
2. `src/util/eco.coffee` → `src-es6/util/template.js` ✅ (sample created)
3. `src/util/misc.coffee` → `src-es6/util/misc.js`
4. `src/util/assets.coffee` → `src-es6/util/assets.js`
5. `src/util/page.coffee` → `src-es6/util/page.js`

## Phase 2: Command Modules (Week 2)

### 2.1 CLI Commands
Convert each command module to ES6 with async/await:

- [ ] `src/new.coffee` → `src-es6/new.js`
- [ ] `src/run.coffee` → `src-es6/run.js`
- [ ] `src/gen.coffee` → `src-es6/gen.js`
- [ ] `src/serve.coffee` → `src-es6/serve.js`

### 2.2 Server Migration
Replace `filed` and `w3` with Bun's native server:

```javascript
// Old: filed/w3
// New: Bun.serve()
Bun.serve({
  port: 3000,
  fetch(req) {
    // Handle static files
  }
});
```

## Phase 3: Template System (Week 3)

### 3.1 Template Conversion
Convert eco templates to EJS format:

**Template Directories**:
- [ ] `/templates/skeleton/*.eco` → `*.ejs`
- [ ] `/templates/bootstrap/*.eco` → `*.ejs`
- [ ] `/templates/reveal/*.eco` → `*.ejs`
- [ ] `/templates/angular/*.eco` → `*.ejs`
- [ ] `/templates/pagedown/*.eco` → `*.ejs`

### 3.2 Template Engine Integration
- [ ] Update page rendering logic
- [ ] Ensure variable compatibility
- [ ] Test template output matches original

## Phase 4: Testing & Validation (Week 4)

### 4.1 Test Suite Migration
- [ ] Convert Mocha tests to Bun test runner
- [ ] Create regression test suite
- [ ] Add performance benchmarks

### 4.2 Compatibility Testing
- [ ] Test all CLI commands
- [ ] Validate template generation
- [ ] Cross-platform testing (macOS, Linux, Windows)

### 4.3 Build & Distribution
- [ ] Generate platform-specific executables
- [ ] Create installation scripts
- [ ] Update documentation

## File Structure

```
bam/
├── src/              # Original CoffeeScript (preserve during migration)
├── src-es6/          # New ES6 modules
│   ├── index.js
│   ├── new.js
│   ├── run.js
│   ├── gen.js
│   ├── serve.js
│   └── util/
│       ├── template.js
│       ├── markdown.js
│       ├── assets.js
│       ├── page.js
│       └── misc.js
├── bin/
│   ├── bam           # Original entry point
│   └── bam-es6       # New ES6 entry point
├── templates/        # Template files (convert .eco → .ejs)
├── migration/        # Migration utilities and tests
├── dist/            # Built executables
├── bun.build.js     # Build configuration
└── bunfig.toml      # Bun configuration
```

## Success Criteria

1. **Functional Parity**: All existing commands work identically
2. **Performance**: ≥20% improvement in generation speed
3. **Size Reduction**: Smaller executable size with Bun bundling
4. **Modern Codebase**: ES6+, async/await, no legacy dependencies
5. **Cross-Platform**: Works on macOS, Linux, Windows

## Risk Mitigation

### Rollback Strategy
- Keep original CoffeeScript files intact
- Maintain parallel directory structure
- Git branch protection for stable version

### Gradual Migration
- Test each component independently
- Use feature flags for switching between old/new
- Incremental user testing

## Performance Targets

| Metric | Current | Target | Method |
|--------|---------|---------|---------|
| Startup Time | ~200ms | <50ms | Bun runtime |
| Build Time (100 pages) | ~2s | <500ms | Bun.write() |
| Memory Usage | ~50MB | <30MB | Native streams |
| Bundle Size | ~15MB | <5MB | Tree shaking |

## Commands Reference

```bash
# Development
bun install                  # Install dependencies
bun run migration/test-deps.js  # Test replacements
bun test                     # Run test suite

# Building
bun bun.build.js build      # Build all platforms
bun bun.build.js compile    # Single executable
bun bun.build.js dev        # Development build

# Testing Migration
./bin/bam-es6 new testsite  # Test new command
./bin/bam-es6 run           # Test dev server
./bin/bam-es6 gen           # Test generation
./bin/bam-es6 serve         # Test static server
```

## Next Steps

1. **Immediate**: Run `bun install` to set up dependencies
2. **Today**: Complete Phase 1.2 core module conversions
3. **This Week**: Begin Phase 2 command modules
4. **Validation**: Run side-by-side comparison tests

## Notes

- Preserve backward compatibility during migration
- Document any behavioral differences
- Prioritize user-facing functionality
- Consider creating `bam-legacy` command for fallback