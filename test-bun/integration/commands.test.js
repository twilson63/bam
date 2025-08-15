/**
 * Integration tests for Bun CLI commands
 */

import { test, expect, describe, beforeEach, afterEach } from "bun:test";
import { spawn } from "child_process";
import { mkdirSync, writeFileSync, rmSync, existsSync, readFileSync } from "fs";
import { join } from "path";

// Import command modules directly for testing
import newCommand from "../../bun/commands/new.js";
import genCommand from "../../bun/commands/gen.js";

describe("CLI Commands Integration (Bun)", () => {
  const testDir = globalThis.testUtils.createTempPath("cli-tests");

  beforeEach(() => {
    // Clean and create test directory
    if (existsSync(testDir)) {
      rmSync(testDir, { recursive: true, force: true });
    }
    mkdirSync(testDir, { recursive: true });
    process.chdir(testDir);
  });

  afterEach(() => {
    // Return to original directory
    process.chdir(globalThis.TEST_CONFIG.tempDir.replace("/cli-tests", ""));
    
    // Cleanup
    if (existsSync(testDir)) {
      rmSync(testDir, { recursive: true, force: true });
    }
  });

  describe("New Command", () => {
    test("should create new project with skeleton template", async () => {
      await newCommand("test-project");
      
      expect(existsSync("test-project")).toBe(true);
      expect(existsSync(join("test-project", "layout.html"))).toBe(true);
      expect(existsSync(join("test-project", "pages"))).toBe(true);
      expect(existsSync(join("test-project", "stylesheets"))).toBe(true);
    });

    test("should create new project with bootstrap template", async () => {
      await newCommand("bootstrap-project", "bootstrap");
      
      expect(existsSync("bootstrap-project")).toBe(true);
      expect(existsSync(join("bootstrap-project", "layout.html"))).toBe(true);
      expect(existsSync(join("bootstrap-project", "pages"))).toBe(true);
      expect(existsSync(join("bootstrap-project", "css"))).toBe(true);
      expect(existsSync(join("bootstrap-project", "js"))).toBe(true);
    });

    test("should create new project with reveal template", async () => {
      await newCommand("reveal-project", "reveal");
      
      expect(existsSync("reveal-project")).toBe(true);
      expect(existsSync(join("reveal-project", "layout.html"))).toBe(true);
      expect(existsSync(join("reveal-project", "pages"))).toBe(true);
      expect(existsSync(join("reveal-project", "css"))).toBe(true);
      expect(existsSync(join("reveal-project", "js"))).toBe(true);
    });

    test("should create new project with angular template", async () => {
      await newCommand("angular-project", "angular");
      
      expect(existsSync("angular-project")).toBe(true);
      expect(existsSync(join("angular-project", "layout.html"))).toBe(true);
      expect(existsSync(join("angular-project", "pages"))).toBe(true);
    });

    test("should create new project with pagedown template", async () => {
      await newCommand("pagedown-project", "pagedown");
      
      expect(existsSync("pagedown-project")).toBe(true);
      expect(existsSync(join("pagedown-project", "layout.html"))).toBe(true);
      expect(existsSync(join("pagedown-project", "pages"))).toBe(true);
    });

    test("should handle invalid template gracefully", async () => {
      await expect(newCommand("test-project", "invalid-template"))
        .rejects.toThrow();
    });

    test("should create project with proper structure", async () => {
      await newCommand("structure-test");
      
      const projectDir = "structure-test";
      
      // Check essential files exist
      expect(existsSync(join(projectDir, "layout.html"))).toBe(true);
      expect(existsSync(join(projectDir, "pages", "index.md"))).toBe(true);
      
      // Check layout content
      const layout = readFileSync(join(projectDir, "layout.html"), "utf8");
      expect(layout).toContain("<%- body %>");
      expect(layout).toContain("<!DOCTYPE html>");
    });
  });

  describe("Gen Command", () => {
    test("should generate static site from skeleton project", async () => {
      // Create project first
      await newCommand("gen-test");
      process.chdir("gen-test");
      
      // Generate site
      await genCommand(".");
      
      // Check generated files
      expect(existsSync("gen")).toBe(true);
      expect(existsSync(join("gen", "index.html"))).toBe(true);
      expect(existsSync(join("gen", "stylesheets"))).toBe(true);
      
      // Check generated content
      const indexHtml = readFileSync(join("gen", "index.html"), "utf8");
      expect(indexHtml).toContain("<!DOCTYPE html>");
      expect(indexHtml).toContain("</html>");
    });

    test("should generate static site from bootstrap project", async () => {
      // Create bootstrap project
      await newCommand("bootstrap-gen", "bootstrap");
      process.chdir("bootstrap-gen");
      
      // Generate site
      await genCommand(".");
      
      // Check generated files
      expect(existsSync("gen")).toBe(true);
      expect(existsSync(join("gen", "index.html"))).toBe(true);
      expect(existsSync(join("gen", "css"))).toBe(true);
      expect(existsSync(join("gen", "js"))).toBe(true);
    });

    test("should copy assets during generation", async () => {
      // Create project with custom assets
      await newCommand("assets-test");
      process.chdir("assets-test");
      
      // Add custom assets
      writeFileSync(join("stylesheets", "custom.css"), "body { color: blue; }");
      writeFileSync(join("images", "logo.png"), "fake-image-data");
      
      // Generate site
      await genCommand(".");
      
      // Check assets were copied
      expect(existsSync(join("gen", "stylesheets", "custom.css"))).toBe(true);
      expect(existsSync(join("gen", "images", "logo.png"))).toBe(true);
      
      const customCss = readFileSync(join("gen", "stylesheets", "custom.css"), "utf8");
      expect(customCss).toContain("color: blue");
    });

    test("should handle missing project directory", async () => {
      await expect(genCommand("nonexistent-project"))
        .rejects.toThrow();
    });

    test("should generate from custom pages", async () => {
      // Create project
      await newCommand("custom-pages");
      process.chdir("custom-pages");
      
      // Add custom pages
      writeFileSync(join("pages", "about.md"), "# About Page\n\nThis is the about page.");
      writeFileSync(join("pages", "contact.html"), "<h1>Contact</h1><p>Contact us here.</p>");
      
      // Generate site
      await genCommand(".");
      
      // Check generated pages
      expect(existsSync(join("gen", "about.html"))).toBe(true);
      expect(existsSync(join("gen", "contact.html"))).toBe(true);
      
      const aboutHtml = readFileSync(join("gen", "about.html"), "utf8");
      expect(aboutHtml).toContain("<h1>About Page</h1>");
      
      const contactHtml = readFileSync(join("gen", "contact.html"), "utf8");
      expect(contactHtml).toContain("<h1>Contact</h1>");
    });
  });
});

describe("CLI Performance Tests (Bun)", () => {
  test("should create project quickly", async () => {
    const testDir = globalThis.testUtils.createTempPath("perf-cli");
    mkdirSync(testDir, { recursive: true });
    process.chdir(testDir);
    
    const startTime = performance.now();
    await newCommand("perf-test");
    const endTime = performance.now();
    
    expect(endTime - startTime).toBeLessThan(2000); // Should complete in under 2 seconds
    expect(existsSync("perf-test")).toBe(true);
    
    // Cleanup
    process.chdir(globalThis.TEST_CONFIG.tempDir);
    rmSync(testDir, { recursive: true, force: true });
  });

  test("should generate site quickly", async () => {
    const testDir = globalThis.testUtils.createTempPath("perf-gen");
    mkdirSync(testDir, { recursive: true });
    process.chdir(testDir);
    
    // Create project
    await newCommand("perf-gen-test");
    process.chdir("perf-gen-test");
    
    // Add multiple pages
    for (let i = 0; i < 50; i++) {
      writeFileSync(join("pages", `page${i}.md`), `# Page ${i}\n\nContent for page ${i}.`);
    }
    
    const startTime = performance.now();
    await genCommand(".");
    const endTime = performance.now();
    
    expect(endTime - startTime).toBeLessThan(5000); // Should complete in under 5 seconds
    expect(existsSync("gen")).toBe(true);
    
    // Check all pages were generated
    for (let i = 0; i < 50; i++) {
      expect(existsSync(join("gen", `page${i}.html`))).toBe(true);
    }
    
    // Cleanup
    process.chdir(globalThis.TEST_CONFIG.tempDir);
    rmSync(testDir, { recursive: true, force: true });
  });
});