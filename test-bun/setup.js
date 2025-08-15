/**
 * Bun Test Setup
 * Global test configuration and utilities for BAM testing
 */

import { mkdirSync, rmSync, existsSync } from "fs";
import { join } from "path";

// Global test configuration
globalThis.TEST_CONFIG = {
  timeout: 30000,
  tempDir: join(process.cwd(), "tmp-test"),
  fixturesDir: join(process.cwd(), "test-bun", "fixtures"),
  templates: ["skeleton", "bootstrap", "reveal", "angular", "pagedown"]
};

// Setup temp directory for tests
if (!existsSync(globalThis.TEST_CONFIG.tempDir)) {
  mkdirSync(globalThis.TEST_CONFIG.tempDir, { recursive: true });
}

// Global cleanup function
globalThis.cleanupTempDir = () => {
  try {
    if (existsSync(globalThis.TEST_CONFIG.tempDir)) {
      rmSync(globalThis.TEST_CONFIG.tempDir, { recursive: true, force: true });
    }
  } catch (error) {
    console.warn("Warning: Could not clean temp directory:", error.message);
  }
};

// Global test utilities
globalThis.testUtils = {
  createTempPath: (name) => join(globalThis.TEST_CONFIG.tempDir, name),
  cleanup: globalThis.cleanupTempDir,
  sleep: (ms) => new Promise(resolve => setTimeout(resolve, ms))
};

// Setup global error handlers for tests
process.on("exit", () => {
  globalThis.cleanupTempDir();
});

console.log("Bun test setup completed");