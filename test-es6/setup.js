/**
 * Mocha Test Setup for Node.js ES6 BAM Implementation
 */

import { mkdirSync, rmSync, existsSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Global test configuration
global.TEST_CONFIG = {
  timeout: 30000,
  tempDir: join(process.cwd(), 'tmp-test-es6'),
  fixturesDir: join(__dirname, 'fixtures'),
  templates: ['skeleton', 'bootstrap', 'reveal', 'angular', 'pagedown']
};

// Setup temp directory for tests
if (!existsSync(global.TEST_CONFIG.tempDir)) {
  mkdirSync(global.TEST_CONFIG.tempDir, { recursive: true });
}

// Global cleanup function
global.cleanupTempDir = () => {
  try {
    if (existsSync(global.TEST_CONFIG.tempDir)) {
      rmSync(global.TEST_CONFIG.tempDir, { recursive: true, force: true });
    }
  } catch (error) {
    console.warn('Warning: Could not clean temp directory:', error.message);
  }
};

// Global test utilities
global.testUtils = {
  createTempPath: (name) => join(global.TEST_CONFIG.tempDir, name),
  cleanup: global.cleanupTempDir,
  sleep: (ms) => new Promise(resolve => setTimeout(resolve, ms))
};

// Setup global error handlers for tests
process.on('exit', () => {
  global.cleanupTempDir();
});

// Increase default timeout for Mocha
process.env.MOCHA_TIMEOUT = '30000';

console.log('Node.js ES6 test setup completed');