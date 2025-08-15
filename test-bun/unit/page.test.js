/**
 * Unit tests for Bun Page utility
 */

import { test, expect, describe, beforeEach, afterEach } from "bun:test";
import { mkdirSync, writeFileSync, rmSync, existsSync } from "fs";
import { join } from "path";
import { Page } from "../../bun/utils/page.js";

describe("Page Utility (Bun)", () => {
  const testDir = globalThis.testUtils.createTempPath("page-tests");
  const pagesDir = join(testDir, "pages");

  beforeEach(() => {
    // Clean and create test directory
    if (existsSync(testDir)) {
      rmSync(testDir, { recursive: true, force: true });
    }
    mkdirSync(testDir, { recursive: true });
    mkdirSync(pagesDir, { recursive: true });
    
    // Change to test directory
    process.chdir(testDir);
  });

  afterEach(() => {
    // Return to original directory
    process.chdir(globalThis.TEST_CONFIG.tempDir.replace("/page-tests", ""));
    
    // Cleanup
    if (existsSync(testDir)) {
      rmSync(testDir, { recursive: true, force: true });
    }
  });

  test("should initialize with empty pathname", () => {
    const page = new Page();
    expect(page.pathname).toBe("");
    expect(page.ext).toBe(null);
    expect(page.pages).toBeInstanceOf(Array);
  });

  test("should initialize with pathname", () => {
    // Create test page
    writeFileSync(join(pagesDir, "test.html"), "<h1>Test</h1>");
    
    const page = new Page("/test");
    expect(page.pathname).toBe("/test");
    expect(page.ext).toBe("html");
  });

  test("should read pages directory", () => {
    // Create test pages
    writeFileSync(join(pagesDir, "index.html"), "<h1>Index</h1>");
    writeFileSync(join(pagesDir, "about.md"), "# About");
    
    const page = new Page();
    expect(page.pages).toContain("index.html");
    expect(page.pages).toContain("about.md");
    expect(page.pages.length).toBe(2);
  });

  test("should render HTML content", () => {
    const content = "<h1>Test HTML</h1><p>Content</p>";
    writeFileSync(join(pagesDir, "test.html"), content);
    
    const page = new Page("/test");
    const result = page.html();
    expect(result).toBe(content);
  });

  test("should render Markdown content", () => {
    const content = "# Test Header\n\nThis is **bold** text.";
    writeFileSync(join(pagesDir, "test.md"), content);
    
    const page = new Page("/test");
    const result = page.markdown();
    expect(result).toContain("<h1>Test Header</h1>");
    expect(result).toContain("<strong>bold</strong>");
  });

  test("should handle missing pages directory gracefully", () => {
    rmSync(pagesDir, { recursive: true, force: true });
    
    const page = new Page();
    expect(page.pages).toEqual([]);
  });

  test("should throw error for missing file", () => {
    const page = new Page("/nonexistent");
    page.ext = "html";
    
    expect(() => page.html()).toThrow("HTML file not found");
  });

  test("should render with template", () => {
    // Create layout template
    const layoutContent = `<!DOCTYPE html>
<html>
<head><title>Test</title></head>
<body><%- body %></body>
</html>`;
    writeFileSync(join(testDir, "layout.html"), layoutContent);
    
    // Create page content
    writeFileSync(join(pagesDir, "test.html"), "<h1>Test Page</h1>");
    
    const page = new Page("/test");
    const result = page.render();
    expect(result).toContain("<!DOCTYPE html>");
    expect(result).toContain("<h1>Test Page</h1>");
    expect(result).toContain("</html>");
  });

  test("should build page to destination", () => {
    const genDir = join(testDir, "gen");
    mkdirSync(genDir, { recursive: true });
    
    const page = new Page();
    const content = "<h1>Built Page</h1>";
    
    page.build(content, "test.html", genDir);
    
    const builtFile = join(genDir, "test.html");
    expect(existsSync(builtFile)).toBe(true);
  });

  test("should build directory", () => {
    const genDir = join(testDir, "gen");
    mkdirSync(genDir, { recursive: true });
    
    const page = new Page();
    page.build("DIR", "subdir", genDir);
    
    const builtDir = join(genDir, "subdir");
    expect(existsSync(builtDir)).toBe(true);
  });

  test("should process all pages", async () => {
    // Create layout template
    const layoutContent = `<html><body><%- body %></body></html>`;
    writeFileSync(join(testDir, "layout.html"), layoutContent);
    
    // Create test pages
    writeFileSync(join(pagesDir, "index.html"), "<h1>Index</h1>");
    writeFileSync(join(pagesDir, "about.md"), "# About Page");
    
    const genDir = join(testDir, "gen");
    mkdirSync(genDir, { recursive: true });
    
    const page = new Page();
    await page.all(genDir);
    
    expect(existsSync(join(genDir, "index.html"))).toBe(true);
    expect(existsSync(join(genDir, "about.html"))).toBe(true);
  });
});

describe("Page Utility Performance (Bun)", () => {
  test("should render large markdown file efficiently", () => {
    const testDir = globalThis.testUtils.createTempPath("perf-test");
    const pagesDir = join(testDir, "pages");
    
    mkdirSync(testDir, { recursive: true });
    mkdirSync(pagesDir, { recursive: true });
    
    // Create large markdown content
    const lines = Array(1000).fill("## Section").map((line, i) => 
      `${line} ${i}\n\nThis is content for section ${i} with **bold** and *italic* text.\n`
    );
    const largeContent = lines.join("\n");
    
    writeFileSync(join(pagesDir, "large.md"), largeContent);
    process.chdir(testDir);
    
    const startTime = performance.now();
    const page = new Page("/large");
    const result = page.markdown();
    const endTime = performance.now();
    
    expect(result).toContain("<h2>Section 0</h2>");
    expect(result).toContain("<h2>Section 999</h2>");
    expect(endTime - startTime).toBeLessThan(1000); // Should complete in under 1 second
    
    // Cleanup
    process.chdir(globalThis.TEST_CONFIG.tempDir);
    rmSync(testDir, { recursive: true, force: true });
  });
});