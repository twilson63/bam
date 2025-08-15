# BAM Dependency Analysis and Replacement Strategy

## Current Dependencies Usage

### Core Dependencies

#### 1. **eco** (Embedded CoffeeScript templates)
- Used in: `lib/util/eco.js`, `lib/util/page.js`
- Functions: Template rendering
- Replacement: **EJS** (similar syntax, active maintenance)

#### 2. **github-flavored-markdown**
- Used in: `lib/util/page.js`
- Functions: Markdown to HTML conversion
- Replacement: **marked** (modern, GFM support built-in)

#### 3. **flatiron**
- Used in: `lib/index.js`
- Functions: CLI routing and command handling
- Replacement: **commander.js** (industry standard, Bun compatible)

#### 4. **wrench**
- Used in: `lib/new.js`, `lib/gen.js`, `lib/util/page.js`, `lib/util/assets.js`
- Functions: Recursive file operations (copy, mkdir, rmdir)
- Replacement: **Native fs.promises + fs-extra** (Bun optimized)

#### 5. **filed**
- Used in: `lib/run.js`, `lib/serve.js`, `lib/util/misc.js`
- Functions: HTTP file serving
- Replacement: **Bun.serve()** with static file handling

#### 6. **w3**
- Used in: `lib/serve.js`
- Functions: HTTP server functionality
- Replacement: **Bun.serve()** native server

#### 7. **zeke** + **zeke-markdown**
- Used in: `lib/util/zeke.js`
- Functions: Template compilation
- Replacement: Evaluate if still needed or merge into EJS

#### 8. **jade**
- Listed but not found in usage
- Replacement: Remove if unused

## Migration Priority

1. **High Priority** (Core functionality):
   - wrench → fs-extra
   - eco → EJS
   - flatiron → commander

2. **Medium Priority** (Server components):
   - filed → Bun.serve
   - w3 → Bun.serve
   - github-flavored-markdown → marked

3. **Low Priority** (Evaluate necessity):
   - zeke modules
   - jade (appears unused)

## Bun-Specific Optimizations

1. Use `Bun.file()` for file reading (faster than fs)
2. Use `Bun.serve()` for HTTP server (replaces filed/w3)
3. Use `Bun.write()` for file writing operations
4. Native TypeScript support (no compilation needed)
5. Built-in test runner (replace mocha)