/**
 * Unit tests for Bun Assets utility
 */

import { test, expect, describe, beforeEach, afterEach } from "bun:test";
import { mkdirSync, writeFileSync, rmSync, existsSync, readFileSync } from "fs";
import { join } from "path";
import { 
  copyAssets, 
  optimizeCSS, 
  optimizeJS, 
  processAsset,
  getAssetFiles,
  copyFile,
  copyDirectory 
} from "../../bun/utils/assets.js";

describe("Assets Utility (Bun)", () => {
  const testDir = globalThis.testUtils.createTempPath("assets-tests");

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
    process.chdir(globalThis.TEST_CONFIG.tempDir.replace("/assets-tests", ""));
    
    // Cleanup
    if (existsSync(testDir)) {
      rmSync(testDir, { recursive: true, force: true });
    }
  });

  describe("CSS Optimization", () => {
    test("should remove comments from CSS", () => {
      const css = `
        /* This is a comment */
        body { 
          color: red; /* Another comment */
        }
        /* Multi-line
           comment */
        .test { margin: 0; }
      `;
      
      const optimized = optimizeCSS(css);
      expect(optimized).not.toContain("/* This is a comment */");
      expect(optimized).not.toContain("/* Another comment */");
      expect(optimized).not.toContain("/* Multi-line");
      expect(optimized).toContain("body { color: red");
      expect(optimized).toContain(".test { margin: 0; }");
    });

    test("should collapse whitespace in CSS", () => {
      const css = `
        body    {
          color:    red;
          margin:   0     10px;
        }
      `;
      
      const optimized = optimizeCSS(css);
      expect(optimized).toBe("body { color: red; margin: 0 10px; }");
    });

    test("should remove trailing semicolons", () => {
      const css = "body { color: red; margin: 0; }";
      const optimized = optimizeCSS(css);
      expect(optimized).toBe("body { color: red; margin: 0 }");
    });
  });

  describe("JavaScript Optimization", () => {
    test("should remove comments from JavaScript", () => {
      const js = `
        // Single line comment
        function test() {
          /* Multi-line comment */
          return true; // Another comment
        }
        /* Another multi-line
           comment */
      `;
      
      const optimized = optimizeJS(js);
      expect(optimized).not.toContain("// Single line comment");
      expect(optimized).not.toContain("/* Multi-line comment */");
      expect(optimized).not.toContain("// Another comment");
      expect(optimized).toContain("function test()");
      expect(optimized).toContain("return true;");
    });

    test("should collapse whitespace in JavaScript", () => {
      const js = `
        function    test(  )   {
          var    x   =   5;
          return   x   +   1;
        }
      `;
      
      const optimized = optimizeJS(js);
      expect(optimized).toBe("function test( ) { var x = 5; return x + 1; }");
    });
  });

  describe("File Operations", () => {
    test("should copy single file", async () => {
      const sourceFile = join(testDir, "source.txt");
      const destFile = join(testDir, "dest.txt");
      
      writeFileSync(sourceFile, "test content");
      
      const result = await copyFile(sourceFile, destFile);
      expect(result).toBe(true);
      expect(existsSync(destFile)).toBe(true);
      expect(readFileSync(destFile, "utf8")).toBe("test content");
    });

    test("should handle copy file errors gracefully", async () => {
      const sourceFile = join(testDir, "nonexistent.txt");
      const destFile = join(testDir, "dest.txt");
      
      const result = await copyFile(sourceFile, destFile);
      expect(result).toBe(false);
      expect(existsSync(destFile)).toBe(false);
    });

    test("should copy directory recursively", async () => {
      const sourceDir = join(testDir, "source");
      const destDir = join(testDir, "dest");
      
      // Create source directory structure
      mkdirSync(join(sourceDir, "subdir"), { recursive: true });
      writeFileSync(join(sourceDir, "file1.txt"), "content1");
      writeFileSync(join(sourceDir, "subdir", "file2.txt"), "content2");
      
      await copyDirectory(sourceDir, destDir);
      
      expect(existsSync(join(destDir, "file1.txt"))).toBe(true);
      expect(existsSync(join(destDir, "subdir", "file2.txt"))).toBe(true);
      expect(readFileSync(join(destDir, "file1.txt"), "utf8")).toBe("content1");
      expect(readFileSync(join(destDir, "subdir", "file2.txt"), "utf8")).toBe("content2");
    });
  });

  describe("Asset Processing", () => {
    test("should get asset files from standard directories", () => {
      // Create asset directories and files
      mkdirSync(join(testDir, "css"), { recursive: true });
      mkdirSync(join(testDir, "js"), { recursive: true });
      mkdirSync(join(testDir, "images"), { recursive: true });
      
      writeFileSync(join(testDir, "css", "style.css"), "body { color: red; }");
      writeFileSync(join(testDir, "js", "script.js"), "console.log('test');");
      writeFileSync(join(testDir, "images", "logo.png"), "fake-image-data");
      
      const assets = getAssetFiles();
      
      expect(assets).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            source: "css/style.css",
            destination: "css/style.css",
            type: "css"
          }),
          expect.objectContaining({
            source: "js/script.js",
            destination: "js/script.js",
            type: "js"
          }),
          expect.objectContaining({
            source: "images/logo.png",
            destination: "images/logo.png",
            type: "png"
          })
        ])
      );
    });

    test("should process and optimize CSS asset", async () => {
      const cssContent = `
        /* Comment */
        body {
          color:   red;
          margin:  0;
        }
      `;
      
      const sourceFile = join(testDir, "style.css");
      const destFile = join(testDir, "dist", "style.css");
      
      writeFileSync(sourceFile, cssContent);
      
      await processAsset(sourceFile, destFile);
      
      const optimized = readFileSync(destFile, "utf8");
      expect(optimized).not.toContain("/* Comment */");
      expect(optimized).toBe("body { color: red; margin: 0 }");
    });

    test("should process and optimize JavaScript asset", async () => {
      const jsContent = `
        // Comment
        function test() {
          /* Block comment */
          return   true;
        }
      `;
      
      const sourceFile = join(testDir, "script.js");
      const destFile = join(testDir, "dist", "script.js");
      
      writeFileSync(sourceFile, jsContent);
      
      await processAsset(sourceFile, destFile);
      
      const optimized = readFileSync(destFile, "utf8");
      expect(optimized).not.toContain("// Comment");
      expect(optimized).not.toContain("/* Block comment */");
      expect(optimized).toContain("function test()");
      expect(optimized).toContain("return true;");
    });

    test("should copy non-text assets as-is", async () => {
      const sourceFile = join(testDir, "image.png");
      const destFile = join(testDir, "dist", "image.png");
      const imageData = Buffer.from("fake-png-data");
      
      writeFileSync(sourceFile, imageData);
      
      await processAsset(sourceFile, destFile);
      
      const copiedData = readFileSync(destFile);
      expect(copiedData).toEqual(imageData);
    });
  });

  describe("Copy Assets Integration", () => {
    test("should copy all standard asset directories", async () => {
      // Create standard asset directories
      const assetDirs = ["stylesheets", "images", "javascripts", "css", "img", "js"];
      
      for (const dir of assetDirs) {
        mkdirSync(join(testDir, dir), { recursive: true });
        writeFileSync(join(testDir, dir, `test.${dir === "images" || dir === "img" ? "png" : "txt"}`), 
                     `content for ${dir}`);
      }
      
      const destDir = join(testDir, "dist");
      
      await copyAssets(destDir);
      
      for (const dir of assetDirs) {
        expect(existsSync(join(destDir, dir))).toBe(true);
        const files = [join(destDir, dir, `test.${dir === "images" || dir === "img" ? "png" : "txt"}`)];
        expect(existsSync(files[0])).toBe(true);
      }
    });

    test("should handle missing asset directories gracefully", async () => {
      const destDir = join(testDir, "dist");
      
      // Should not throw error even if no asset directories exist
      await expect(copyAssets(destDir)).resolves.toBeUndefined();
    });
  });
});

describe("Assets Utility Performance (Bun)", () => {
  test("should optimize large CSS file efficiently", () => {
    const testDir = globalThis.testUtils.createTempPath("perf-assets");
    mkdirSync(testDir, { recursive: true });
    
    // Create large CSS content
    const rules = Array(1000).fill(0).map((_, i) => 
      `/* Comment ${i} */\n.class-${i} {\n  color: red;\n  margin: ${i}px;\n}\n`
    );
    const largeCss = rules.join("\n");
    
    const startTime = performance.now();
    const optimized = optimizeCSS(largeCss);
    const endTime = performance.now();
    
    expect(optimized).not.toContain("/* Comment");
    expect(optimized).toContain(".class-0");
    expect(optimized).toContain(".class-999");
    expect(endTime - startTime).toBeLessThan(500); // Should complete in under 500ms
    
    // Cleanup
    rmSync(testDir, { recursive: true, force: true });
  });
});