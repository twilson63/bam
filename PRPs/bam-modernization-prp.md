# Project Request Protocol (PRP): BAM Modernization

## Project Overview

### Project Name
BAM Static Site Generator - CoffeeScript to JavaScript Migration with Bun Distribution

### Executive Summary
Modernize the BAM static site generator by migrating from CoffeeScript to JavaScript and implementing Bun for building multi-platform distribution executables. This migration will eliminate the outdated CoffeeScript dependency, improve maintainability, and provide standalone executables for easier distribution.

### Current State
- **Language**: CoffeeScript (268 lines of source code)
- **Runtime**: Node.js
- **Distribution**: npm package requiring Node.js installation
- **Build System**: Cake (CoffeeScript build tool)
- **Dependencies**: Mix of legacy packages (eco, flatiron, github-flavored-markdown)

### Target State
- **Language**: Modern JavaScript (ES6+)
- **Runtime**: Bun (with Node.js compatibility)
- **Distribution**: Standalone executables for Windows, macOS, and Linux
- **Build System**: Bun's built-in tooling
- **Dependencies**: Updated to modern alternatives where necessary

## Technical Requirements

### Core Migration Requirements

#### 1. Language Migration
- Convert all CoffeeScript files (.coffee) to modern JavaScript (.js)
- Maintain exact functionality and behavior
- Use ES6+ features where appropriate (arrow functions, destructuring, async/await)
- Preserve existing API and CLI interface

#### 2. Files to Migrate
**Source Files (src/):**
- `index.coffee` (41 lines) - CLI entry point
- `new.coffee` (75 lines) - Project creation
- `run.coffee` (26 lines) - Development server
- `gen.coffee` (23 lines) - Static generation
- `serve.coffee` (14 lines) - Static server
- `util/page.coffee` (47 lines) - Page rendering
- `util/eco.coffee` (12 lines) - Template engine
- `util/assets.coffee` (11 lines) - Asset management
- `util/misc.coffee` (7 lines) - File utilities
- `util/zeke.coffee` (12 lines) - Zeke integration

**Test Files:**
- `test/default.coffee`
- `test/bam_new_test.coffee`
- `test/bam_gen_test.coffee`

**Template Files:**
- `templates/reveal/pages/index.coffee`
- `templates/pagedown/pages/index.coffee`

#### 3. Dependency Updates
**Critical Dependencies to Address:**
- `eco` (1.1.0-rc-3) → Consider migration to modern template engine
- `github-flavored-markdown` (1.0.1) → Update to modern markdown parser
- `flatiron` → Consider lighter CLI framework or native implementation
- `wrench` → Replace with modern fs utilities

**Dependencies to Retain:**
- `jade` → Update to latest `pug` version
- `zeke` and `zeke-markdown` → Evaluate necessity
- `w3` → Update to latest version

### Bun Integration Requirements

#### 1. Bun Runtime Compatibility
- Ensure all code is compatible with Bun's JavaScript runtime
- Test Node.js API compatibility
- Validate file system operations
- Verify HTTP server functionality

#### 2. Executable Building
- Configure Bun build for standalone executables
- Target platforms:
  - macOS (x64, arm64)
  - Linux (x64, arm64)
  - Windows (x64)
- Bundle all dependencies into single executable
- Minimize executable size

#### 3. Build Configuration
- Create `bun.build.js` configuration
- Define entry points
- Configure bundling options
- Set up cross-platform build scripts

## Implementation Steps

### Phase 1: Preparation (Week 1)
1. **Environment Setup**
   - Install Bun development environment
   - Create migration branch
   - Set up testing framework for JavaScript
   - Document current behavior and edge cases

2. **Dependency Analysis**
   - Audit all dependencies for Bun compatibility
   - Identify replacement packages for legacy dependencies
   - Create dependency migration map

### Phase 2: Core Migration (Week 2-3)
1. **Automated Conversion**
   - Use decaffeinate or similar tool for initial conversion
   - Generate baseline JavaScript code
   - Commit automated conversion results

2. **Manual Refinement**
   - Refactor to modern JavaScript patterns
   - Replace CoffeeScript idioms with ES6+ equivalents
   - Optimize code structure and readability

3. **Module System Update**
   - Convert from CommonJS to ES modules where beneficial
   - Update import/export statements
   - Maintain backward compatibility

### Phase 3: Dependency Modernization (Week 3-4)
1. **Replace Legacy Dependencies**
   - Migrate from `eco` templates to modern alternative
   - Update markdown processing
   - Replace deprecated file utilities

2. **Update Remaining Dependencies**
   - Upgrade to latest stable versions
   - Test compatibility with Bun
   - Update API usage as needed

### Phase 4: Bun Integration (Week 4-5)
1. **Runtime Adaptation**
   - Test all functionality under Bun
   - Fix any runtime incompatibilities
   - Optimize for Bun performance

2. **Build System Setup**
   - Create Bun build configuration
   - Implement executable building scripts
   - Set up CI/CD for multi-platform builds

3. **Testing Under Bun**
   - Port test suite to Bun test runner
   - Ensure 100% test coverage
   - Add Bun-specific tests

### Phase 5: Distribution (Week 5-6)
1. **Executable Generation**
   - Build executables for all target platforms
   - Test executables on each platform
   - Optimize executable size

2. **Package Distribution**
   - Maintain npm package for backward compatibility
   - Create GitHub releases with executables
   - Update installation documentation

3. **Documentation Update**
   - Update README with new installation methods
   - Document Bun-specific features
   - Create migration guide for existing users

## Success Criteria

### Functional Requirements
- ✅ All existing BAM commands work identically
- ✅ All templates generate correctly
- ✅ Development server functions properly
- ✅ Static generation produces identical output
- ✅ All tests pass under Bun

### Performance Requirements
- ✅ Executable starts in < 100ms
- ✅ Build time reduced by 50%
- ✅ Executable size < 50MB per platform
- ✅ Memory usage equivalent or better

### Quality Requirements
- ✅ Zero CoffeeScript dependencies remain
- ✅ 100% test coverage maintained
- ✅ ESLint compliance with modern standards
- ✅ Documentation complete and accurate

### Distribution Requirements
- ✅ Standalone executables for 5 platforms
- ✅ No runtime dependencies required
- ✅ Single-command installation
- ✅ Backward compatible npm package

## Risk Assessment

### Technical Risks
1. **Bun Compatibility Issues**
   - Mitigation: Early testing, fallback to Node.js build option
   
2. **Template Engine Migration**
   - Mitigation: Create compatibility layer if needed

3. **Platform-Specific Issues**
   - Mitigation: Comprehensive CI testing on all platforms

### Timeline Risks
1. **Unexpected Complexity**
   - Mitigation: Phased approach, can release incrementally

2. **Dependency Challenges**
   - Mitigation: Early spike on critical dependencies

## Resource Requirements

### Development Tools
- Bun runtime (latest version)
- Cross-platform testing environments
- CI/CD pipeline with multi-platform support

### Testing Resources
- Virtual machines or containers for each target platform
- Automated testing infrastructure
- Performance benchmarking tools

## Deliverables

1. **Migrated Codebase**
   - Pure JavaScript implementation
   - No CoffeeScript dependencies
   - Modern ES6+ syntax

2. **Executable Distributions**
   - Standalone binaries for all platforms
   - Installation scripts
   - Auto-update mechanism (optional)

3. **Documentation**
   - Updated user documentation
   - Migration guide
   - Developer documentation

4. **Testing Suite**
   - Comprehensive test coverage
   - Platform-specific tests
   - Performance benchmarks

## Timeline

**Total Duration**: 6 weeks

- Week 1: Preparation and analysis
- Week 2-3: Core migration
- Week 3-4: Dependency modernization
- Week 4-5: Bun integration
- Week 5-6: Distribution and documentation

## Conclusion

This migration represents a significant modernization of the BAM static site generator, eliminating technical debt while adding powerful new distribution capabilities. The use of Bun for creating standalone executables will greatly simplify installation and usage, making BAM more accessible to users who don't want to manage Node.js installations.

The phased approach ensures that the project can be completed incrementally with minimal risk, while the comprehensive testing strategy guarantees that existing functionality is preserved throughout the migration.