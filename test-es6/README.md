# BAM ES6 Test Suite

This directory contains the comprehensive test suite for the ES6/Node.js version of BAM static site generator.

## Test Structure

```
test-es6/
├── unit/                    # Unit tests for individual components
│   ├── page.test.js        # Page utility tests
│   └── assets.test.js      # Assets utility tests
├── integration/            # Integration tests for CLI commands
├── e2e/                    # End-to-end workflow tests
├── fixtures/               # Test fixtures and sample data
├── setup.js               # Global test setup for Mocha
├── cross-platform.test.js # Cross-platform compatibility tests
├── bam_gen_test.js        # Legacy generation tests
├── bam_new_test.js        # Legacy project creation tests
└── default.js             # Default test configuration
```

## Running Tests

### All Tests
```bash
npm test
```

### Specific Test Files
```bash
npx mocha test-es6/unit/page.test.js
npx mocha test-es6/unit/assets.test.js
```

### With Watch Mode
```bash
npm run test:watch
```

### Test Categories
```bash
# Unit tests only
npx mocha "test-es6/unit/**/*.js"

# All tests with timeout
npx mocha "test-es6/**/*.test.js" --timeout 30000
```

## Test Framework

This test suite uses:
- **Mocha**: Test framework
- **Chai**: Assertion library
- **ES6 Modules**: Native ES module support
- **Node.js**: Runtime environment

## Test Configuration

### Mocha Configuration
```javascript
// Global timeout: 30 seconds
// ES module support: Enabled
// Recursive: True for nested test files
```

### Global Test Setup
The `setup.js` file provides:
- Global test configuration
- Temporary directory management
- Cleanup utilities
- Test helper functions

## Test Categories

### Unit Tests

#### page.test.js
Tests the ES6 Page utility class:
- **Constructor**: Initialization with different parameters
- **Content Rendering**: HTML, Markdown, and template processing
- **Template Integration**: Layout template rendering
- **Page Building**: File generation and directory handling
- **Generate All**: Batch processing of multiple pages
- **Edge Cases**: Error handling and special scenarios
- **Performance**: Large file processing benchmarks

#### assets.test.js
Tests the ES6 Assets utility:
- **Basic Asset Copying**: Standard directory copying
- **Multiple Asset Types**: Different file formats
- **Error Handling**: Permission and missing file scenarios
- **Path Resolution**: Relative and absolute paths
- **Performance**: Large file set copying benchmarks

### Cross-Platform Tests
Tests platform compatibility across Windows, macOS, and Linux:
- **Path Handling**: Different path separators and formats
- **File System Operations**: Case sensitivity and permissions
- **Line Ending Handling**: CR, LF, and CRLF support
- **Environment Variables**: Platform-specific variables
- **Unicode Support**: International characters and emojis
- **Performance**: Consistent behavior across platforms

### Legacy Tests
Preserved from original CoffeeScript implementation:
- **bam_gen_test.js**: Generation functionality tests
- **bam_new_test.js**: Project creation tests

## Test Utilities

### Global Test Configuration
```javascript
global.TEST_CONFIG = {
  timeout: 30000,
  tempDir: 'tmp-test-es6',
  fixturesDir: 'test-es6/fixtures',
  templates: ['skeleton', 'bootstrap', 'reveal', 'angular', 'pagedown']
};
```

### Global Test Utilities
```javascript
global.testUtils = {
  createTempPath: (name) => join(tempDir, name),
  cleanup: () => cleanupTempDir(),
  sleep: (ms) => new Promise(resolve => setTimeout(resolve, ms))
};
```

## Performance Expectations

### Unit Test Performance
- Page initialization: < 10ms
- Markdown rendering: < 100ms for typical content
- HTML rendering: < 50ms for typical content
- Template rendering: < 200ms including layout
- Asset copying: < 1000ms for 50 files

### Integration Performance
- Multiple page generation: < 5000ms for 100 pages
- Large markdown processing: < 2000ms for 500 sections
- Asset copying: < 3000ms for 300 files

### Cross-Platform Performance
- File operations: < 3000ms for 1000 files (5000ms on Windows)
- Unicode handling: Consistent across all platforms

## Error Handling

Tests verify proper error handling for:
- Missing files and directories
- Invalid templates
- Permission errors
- Malformed content
- Network timeouts
- Resource exhaustion

## Memory Management

The test suite includes:
- Automatic cleanup of temporary files
- Memory usage monitoring
- Resource leak detection
- Garbage collection optimization

## Debugging Tests

### Run Single Test
```bash
npx mocha test-es6/unit/page.test.js --grep "should render HTML content"
```

### Enable Debug Output
```bash
DEBUG=* npm test
```

### Inspect Mode
```bash
npx mocha test-es6/unit/page.test.js --inspect-brk
```

## CI/CD Integration

Configured for continuous integration with:
- Matrix testing across Node.js versions
- Platform-specific test execution
- Performance regression detection
- Code coverage reporting
- Artifact generation

## Compatibility

### Node.js Versions
- Minimum: Node.js 16.0.0
- Tested: 16.x, 18.x, 20.x
- Recommended: Latest LTS

### Operating Systems
- Ubuntu/Linux
- macOS
- Windows 10/11

### Dependencies
```json
{
  "mocha": "^10.2.0",
  "chai": "^4.3.10",
  "fs-extra": "^11.2.0"
}
```

## Migration Notes

This test suite represents the modernized version of the original CoffeeScript tests:
- Converted from CoffeeScript to ES6
- Updated to use modern Node.js APIs
- Enhanced with additional test coverage
- Improved performance benchmarks
- Added cross-platform compatibility tests

## Contributing

When contributing to this test suite:

1. Use ES6+ syntax and features
2. Follow existing test patterns
3. Include both positive and negative cases
4. Add performance benchmarks for new features
5. Ensure cross-platform compatibility
6. Update documentation as needed

### Test Naming Convention
```javascript
describe('Component Name (ES6/Node.js)', function() {
  describe('Method or Feature', function() {
    it('should do something specific', function() {
      // Test implementation
    });
  });
});
```

### Performance Test Pattern
```javascript
it('should handle operation efficiently', function() {
  this.timeout(10000); // Extend timeout if needed
  
  const startTime = Date.now();
  // Perform operation
  const endTime = Date.now();
  
  expect(endTime - startTime).to.be.lessThan(expectedTime);
});
```