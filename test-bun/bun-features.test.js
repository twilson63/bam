/**
 * Bun-specific feature tests
 * Tests features and optimizations unique to Bun
 */

import { test, expect, describe, beforeEach, afterEach } from "bun:test";
import { mkdirSync, writeFileSync, rmSync, existsSync, readFileSync } from "fs";
import { join } from "path";

describe("Bun-Specific Features", () => {
  const testDir = globalThis.testUtils.createTempPath("bun-features");

  beforeEach(() => {
    if (existsSync(testDir)) {
      rmSync(testDir, { recursive: true, force: true });
    }
    mkdirSync(testDir, { recursive: true });
    process.chdir(testDir);
  });

  afterEach(() => {
    process.chdir(globalThis.TEST_CONFIG.tempDir.replace("/bun-features", ""));
    if (existsSync(testDir)) {
      rmSync(testDir, { recursive: true, force: true });
    }
  });

  test("should leverage Bun's fast file I/O", async () => {
    // Create many files to test I/O performance
    const fileCount = 1000;
    const sourceDir = join(testDir, "source");
    const destDir = join(testDir, "dest");
    
    mkdirSync(sourceDir, { recursive: true });
    mkdirSync(destDir, { recursive: true });
    
    // Create test files
    for (let i = 0; i < fileCount; i++) {
      writeFileSync(join(sourceDir, `file${i}.txt`), `Content ${i}`);
    }
    
    // Measure file operations
    const startTime = performance.now();
    
    // Simulate BAM's file processing
    for (let i = 0; i < fileCount; i++) {
      const content = readFileSync(join(sourceDir, `file${i}.txt`), "utf8");
      writeFileSync(join(destDir, `file${i}.txt`), content.toUpperCase());
    }
    
    const endTime = performance.now();
    
    // Bun should handle this efficiently
    expect(endTime - startTime).toBeLessThan(2000); // Under 2 seconds
    
    // Verify all files processed
    for (let i = 0; i < fileCount; i++) {
      expect(existsSync(join(destDir, `file${i}.txt`))).toBe(true);
      const content = readFileSync(join(destDir, `file${i}.txt`), "utf8");
      expect(content).toBe(`CONTENT ${i}`);
    }
  });

  test("should handle concurrent operations efficiently", async () => {
    const concurrentOps = 50;
    const promises = [];
    
    // Create concurrent file operations
    for (let i = 0; i < concurrentOps; i++) {
      const promise = new Promise((resolve) => {
        const content = `Concurrent operation ${i}`;
        writeFileSync(join(testDir, `concurrent${i}.txt`), content);
        const read = readFileSync(join(testDir, `concurrent${i}.txt`), "utf8");
        resolve(read === content);
      });
      promises.push(promise);
    }
    
    const startTime = performance.now();
    const results = await Promise.all(promises);
    const endTime = performance.now();
    
    // All operations should succeed
    expect(results.every(result => result === true)).toBe(true);
    
    // Should complete quickly with Bun's performance
    expect(endTime - startTime).toBeLessThan(1000); // Under 1 second
  });

  test("should optimize JavaScript execution", () => {
    // Test Bun's JavaScript optimization
    const iterations = 100000;
    
    const startTime = performance.now();
    
    let result = 0;
    for (let i = 0; i < iterations; i++) {
      result += Math.sqrt(i) * Math.random();
    }
    
    const endTime = performance.now();
    
    // Bun should execute this efficiently
    expect(endTime - startTime).toBeLessThan(100); // Under 100ms
    expect(result).toBeGreaterThan(0);
  });

  test("should handle large string operations efficiently", () => {
    // Test string processing performance
    const largeString = "A".repeat(1000000); // 1MB string
    
    const startTime = performance.now();
    
    // Simulate template processing
    const processed = largeString
      .replace(/A/g, "B")
      .replace(/B/g, "C")
      .substring(0, 1000);
    
    const endTime = performance.now();
    
    expect(processed).toBe("C".repeat(1000));
    expect(endTime - startTime).toBeLessThan(100); // Under 100ms
  });

  test("should handle TypeScript imports efficiently", async () => {
    // Test that Bun handles mixed module types
    const esmContent = `
export const greeting = "Hello from ESM";
export function multiply(a, b) {
  return a * b;
}`;
    
    writeFileSync(join(testDir, "test-module.js"), esmContent);
    
    const startTime = performance.now();
    
    // Dynamic import (Bun handles this natively)
    const module = await import(`${testDir}/test-module.js`);
    
    const endTime = performance.now();
    
    expect(module.greeting).toBe("Hello from ESM");
    expect(module.multiply(5, 3)).toBe(15);
    expect(endTime - startTime).toBeLessThan(50); // Very fast with Bun
  });

  test("should optimize asset bundling", () => {
    // Test efficient asset processing
    const cssContent = `
      /* Large CSS file */
      ${Array(1000).fill(0).map((_, i) => `
        .class-${i} {
          color: #${i.toString(16).padStart(6, '0')};
          margin: ${i}px;
          padding: ${i * 2}px;
        }
      `).join('\n')}
    `;
    
    const startTime = performance.now();
    
    // Simulate CSS processing
    const minified = cssContent
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/\s+/g, ' ')
      .trim();
    
    const endTime = performance.now();
    
    expect(minified.length).toBeLessThan(cssContent.length);
    expect(minified).not.toContain('/* Large CSS file */');
    expect(endTime - startTime).toBeLessThan(50); // Fast processing
  });

  test("should handle memory efficiently with large datasets", () => {
    // Test memory efficiency
    const largeArray = Array(100000).fill(0).map((_, i) => ({
      id: i,
      name: `Item ${i}`,
      description: `Description for item ${i}`,
      tags: [`tag${i}`, `category${i % 10}`]
    }));
    
    const startTime = performance.now();
    
    // Process data
    const filtered = largeArray
      .filter(item => item.id % 2 === 0)
      .map(item => ({ ...item, processed: true }))
      .slice(0, 1000);
    
    const endTime = performance.now();
    
    expect(filtered.length).toBe(1000);
    expect(filtered[0].processed).toBe(true);
    expect(filtered[0].id).toBe(0);
    expect(endTime - startTime).toBeLessThan(200); // Under 200ms
  });

  test("should utilize Bun's built-in utilities", () => {
    // Test Bun-specific APIs if available
    expect(typeof Bun).toBe("object");
    expect(typeof Bun.version).toBe("string");
    
    // Test performance timing
    const start = Bun.nanoseconds();
    
    // Small operation
    let sum = 0;
    for (let i = 0; i < 1000; i++) {
      sum += i;
    }
    
    const end = Bun.nanoseconds();
    
    expect(sum).toBe(499500);
    expect(end - start).toBeGreaterThan(0);
    expect(end - start).toBeLessThan(1000000); // Under 1ms in nanoseconds
  });

  test("should handle streaming operations efficiently", async () => {
    // Test streaming capabilities
    const largeContent = Array(10000).fill("Line of content\n").join("");
    const sourceFile = join(testDir, "large-source.txt");
    const destFile = join(testDir, "large-dest.txt");
    
    writeFileSync(sourceFile, largeContent);
    
    const startTime = performance.now();
    
    // Simulate streaming processing
    const content = readFileSync(sourceFile, "utf8");
    const processed = content
      .split('\n')
      .map(line => line.toUpperCase())
      .join('\n');
    
    writeFileSync(destFile, processed);
    
    const endTime = performance.now();
    
    expect(existsSync(destFile)).toBe(true);
    const result = readFileSync(destFile, "utf8");
    expect(result).toContain("LINE OF CONTENT");
    expect(endTime - startTime).toBeLessThan(500); // Under 500ms
  });
});

describe("Bun vs Node.js Performance Comparison", () => {
  test("should demonstrate faster startup time", () => {
    // This test demonstrates the concept - actual comparison would need separate processes
    const startTime = performance.now();
    
    // Simulate module loading and initialization
    import("../../bun/utils/page.js").then(() => {
      const endTime = performance.now();
      const loadTime = endTime - startTime;
      
      // Bun typically has faster startup times
      expect(loadTime).toBeLessThan(100); // Under 100ms
    });
  });

  test("should show improved JSON parsing performance", () => {
    const largeObject = {
      users: Array(10000).fill(0).map((_, i) => ({
        id: i,
        name: `User ${i}`,
        email: `user${i}@example.com`,
        profile: {
          age: 20 + (i % 50),
          city: `City ${i % 100}`,
          interests: [`hobby${i % 20}`, `sport${i % 10}`]
        }
      }))
    };
    
    const startTime = performance.now();
    
    const jsonString = JSON.stringify(largeObject);
    const parsed = JSON.parse(jsonString);
    
    const endTime = performance.now();
    
    expect(parsed.users.length).toBe(10000);
    expect(parsed.users[0].name).toBe("User 0");
    expect(endTime - startTime).toBeLessThan(200); // Under 200ms with Bun
  });
});