# BAM Bun Test Suite

This directory contains the comprehensive test suite for the Bun-optimized version of BAM (Bun-powered static site generator).

## Test Structure

```
test-bun/
├── unit/                    # Unit tests for individual components
│   ├── page.test.js        # Page utility tests
│   └── assets.test.js      # Assets utility tests
├── integration/            # Integration tests for CLI commands
│   └── commands.test.js    # CLI command integration tests
├── e2e/                    # End-to-end workflow tests
│   └── workflow.test.js    # Complete workflow scenarios
├── fixtures/               # Test fixtures and sample data
│   ├── test-layout.html
│   ├── test-page.md
│   ├── test-page.html
│   └── test-style.css
├── helpers/                # Test utilities and helpers
│   └── test-utils.js       # Shared test utilities
├── setup.js               # Global test setup
├── bunfig.toml            # Bun test configuration
├── bun-features.test.js   # Bun-specific feature tests
└── cross-platform.test.js # Cross-platform compatibility tests
```

## Running Tests

### All Tests
```bash
bun test
```

### Specific Test Files
```bash
bun test unit/page.test.js
bun test integration/commands.test.js
bun test e2e/workflow.test.js
```

### Test Categories
```bash
# Unit tests only
bun test unit/

# Integration tests only
bun test integration/

# End-to-end tests only
bun test e2e/
```

### With Coverage
```bash
bun test --coverage
```

### Watch Mode
```bash
bun test --watch
```

## Test Configuration

The test suite is configured with:

- **Timeout**: 30 seconds for long-running operations
- **Coverage**: Enabled with 80% threshold
- **Mocking**: Enabled for external dependencies
- **Parallel Execution**: Automatic for better performance

## Test Categories

### Unit Tests
- **page.test.js**: Tests the Page utility class including:
  - Constructor behavior
  - Content rendering (HTML, Markdown, CoffeeScript)
  - Template integration
  - Page building and generation
  - Performance characteristics

- **assets.test.js**: Tests the Assets utility including:
  - CSS optimization
  - JavaScript optimization
  - File operations
  - Asset processing
  - Performance characteristics

### Integration Tests
- **commands.test.js**: Tests CLI command integration:
  - `new` command for all templates
  - `gen` command for site generation
  - Error handling
  - Performance benchmarks

### End-to-End Tests
- **workflow.test.js**: Tests complete workflows:
  - Blog creation workflow
  - Multi-template projects
  - Directory structure preservation
  - Error recovery
  - Large site generation

### Bun-Specific Tests
- **bun-features.test.js**: Tests Bun-specific optimizations:
  - Fast file I/O
  - Concurrent operations
  - JavaScript execution speed
  - String processing
  - TypeScript imports
  - Memory efficiency

### Cross-Platform Tests
- **cross-platform.test.js**: Tests platform compatibility:
  - Path handling
  - File system operations
  - Line ending handling
  - Environment variables
  - Unicode support
  - Performance consistency

## Test Utilities

### TestProjectFactory
Creates consistent test projects with various configurations:
```javascript
const factory = new TestProjectFactory(testDir);
const blogProject = factory.createBlogProject('my-blog');
const portfolioProject = factory.createPortfolioProject('portfolio');
```

### ContentGenerator
Generates test content for various scenarios:
```javascript
const markdown = ContentGenerator.generateMarkdown({
  title: 'Test Page',
  sections: 5,
  codeBlocks: 2
});
```

### PerformanceUtils
Measures and compares performance:
```javascript
const results = await PerformanceUtils.measureTime(async () => {
  // Operation to measure
}, 10); // 10 iterations
```

### FileSystemUtils
Manages test file structures:
```javascript
FileSystemUtils.createTempStructure(baseDir, {
  'pages/index.md': '# Home Page',
  'css/style.css': 'body { margin: 0; }'
});
```

## Test Environment

### Global Variables
- `globalThis.TEST_CONFIG`: Test configuration object
- `globalThis.testUtils`: Common test utilities
- `globalThis.cleanupTempDir`: Cleanup function

### Temporary Files
All tests use isolated temporary directories that are automatically cleaned up.

## Performance Expectations

### Unit Test Performance
- Page rendering: < 100ms for typical content
- Asset processing: < 50ms for standard files
- Large content: < 1000ms for 1000+ files

### Integration Test Performance
- Project creation: < 2000ms
- Site generation: < 5000ms for 50 pages
- Asset copying: < 1000ms for 100 files

### E2E Test Performance
- Complete workflows: < 10000ms
- Large sites (200+ pages): < 10000ms

## Debugging Tests

### Verbose Output
```bash
bun test --verbose
```

### Specific Test Pattern
```bash
bun test --grep "should render markdown"
```

### Debug Mode
```bash
bun test --debug
```

## CI/CD Integration

This test suite is designed to run in CI/CD environments with:
- Deterministic test execution
- Platform-independent assertions
- Comprehensive error reporting
- Performance regression detection

## Contributing

When adding new tests:

1. Follow the existing file structure
2. Use the provided test utilities
3. Include both positive and negative test cases
4. Add performance assertions for critical paths
5. Ensure cross-platform compatibility
6. Update this README if adding new test categories