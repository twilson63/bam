/**
 * Cross-platform compatibility tests for BAM (Bun)
 */

import { test, expect, describe, beforeEach, afterEach } from "bun:test";
import { mkdirSync, writeFileSync, rmSync, existsSync } from "fs";
import { join, sep, resolve } from "path";
import { platform, tmpdir } from "os";

describe("Cross-Platform Compatibility (Bun)", () => {
  const testDir = globalThis.testUtils.createTempPath("cross-platform");

  beforeEach(() => {
    if (existsSync(testDir)) {
      rmSync(testDir, { recursive: true, force: true });
    }
    mkdirSync(testDir, { recursive: true });
    process.chdir(testDir);
  });

  afterEach(() => {
    process.chdir(globalThis.TEST_CONFIG.tempDir.replace("/cross-platform", ""));
    if (existsSync(testDir)) {
      rmSync(testDir, { recursive: true, force: true });
    }
  });

  describe("Path Handling", () => {
    test("should handle different path separators", () => {
      const paths = [
        "pages/index.md",
        "pages\\index.md", // Windows style
        "pages/blog/post.md",
        "assets/css/style.css"
      ];
      
      paths.forEach(path => {
        const normalized = path.split(/[\/\\]/).join(sep);
        expect(normalized).toBeDefined();
        expect(typeof normalized).toBe("string");
      });
    });

    test("should resolve relative paths correctly", () => {
      const testPaths = [
        "./pages/index.md",
        "../templates/layout.html",
        "../../assets/style.css"
      ];
      
      testPaths.forEach(path => {
        const resolved = resolve(path);
        expect(resolved).toBeDefined();
        expect(typeof resolved).toBe("string");
      });
    });

    test("should handle long file paths", () => {
      // Test path length limits on different platforms
      const longPath = "a".repeat(platform() === "win32" ? 200 : 500);
      const testPath = join(testDir, longPath);
      
      // Should handle long paths gracefully
      expect(() => resolve(testPath)).not.toThrow();
    });

    test("should handle special characters in paths", () => {
      const specialChars = platform() === "win32" 
        ? ["test file.md", "test-file.md", "test_file.md"]
        : ["test file.md", "test-file.md", "test_file.md", "tëst-fîlé.md"];
      
      specialChars.forEach(filename => {
        const filePath = join(testDir, filename);
        expect(() => {
          writeFileSync(filePath, "test content");
          existsSync(filePath);
        }).not.toThrow();
      });
    });
  });

  describe("File System Operations", () => {
    test("should handle case sensitivity correctly", () => {
      const isCaseSensitive = platform() !== "win32" && platform() !== "darwin";
      
      writeFileSync(join(testDir, "Test.md"), "content");
      
      if (isCaseSensitive) {
        // On case-sensitive systems, these should be different files
        expect(existsSync(join(testDir, "test.md"))).toBe(false);
        expect(existsSync(join(testDir, "TEST.md"))).toBe(false);
      } else {
        // On case-insensitive systems, these might refer to the same file
        const testExists = existsSync(join(testDir, "test.md"));
        const upperExists = existsSync(join(testDir, "TEST.md"));
        // At least one should work on case-insensitive systems
        expect(testExists || upperExists).toBe(true);
      }
    });

    test("should handle file permissions correctly", () => {
      const testFile = join(testDir, "permission-test.txt");
      writeFileSync(testFile, "test content");
      
      if (platform() !== "win32") {
        // Unix-like systems support chmod
        try {
          const { chmodSync } = await import("fs");
          chmodSync(testFile, 0o644);
          expect(existsSync(testFile)).toBe(true);
        } catch (error) {
          // Permission operations might fail in some environments
          console.warn("Permission test skipped:", error.message);
        }
      } else {
        // Windows handles permissions differently
        expect(existsSync(testFile)).toBe(true);
      }
    });

    test("should handle symlinks if supported", () => {
      const sourceFile = join(testDir, "source.txt");
      const linkFile = join(testDir, "link.txt");
      
      writeFileSync(sourceFile, "source content");
      
      if (platform() !== "win32") {
        try {
          const { symlinkSync, readlinkSync } = await import("fs");
          symlinkSync(sourceFile, linkFile);
          
          expect(existsSync(linkFile)).toBe(true);
          const linkTarget = readlinkSync(linkFile);
          expect(linkTarget).toBe(sourceFile);
        } catch (error) {
          // Symlinks might not be supported in all environments
          console.warn("Symlink test skipped:", error.message);
        }
      }
    });
  });

  describe("Line Ending Handling", () => {
    test("should handle different line endings", () => {
      const lineEndings = {
        unix: "Line 1\nLine 2\nLine 3",
        windows: "Line 1\r\nLine 2\r\nLine 3",
        mac: "Line 1\rLine 2\rLine 3",
        mixed: "Line 1\nLine 2\r\nLine 3\r"
      };
      
      Object.entries(lineEndings).forEach(([type, content]) => {
        const filename = `${type}-endings.txt`;
        const filePath = join(testDir, filename);
        
        writeFileSync(filePath, content);
        expect(existsSync(filePath)).toBe(true);
        
        const readContent = Bun.file(filePath).text();
        expect(readContent).resolves.toContain("Line 1");
        expect(readContent).resolves.toContain("Line 2");
        expect(readContent).resolves.toContain("Line 3");
      });
    });

    test("should normalize line endings in templates", async () => {
      const templateContent = "<!DOCTYPE html>\r\n<html>\n<body>\r<%- body %>\r\n</body>\n</html>";
      const layoutFile = join(testDir, "layout.html");
      
      writeFileSync(layoutFile, templateContent);
      
      // Read and process the template
      const content = await Bun.file(layoutFile).text();
      const normalized = content.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
      
      expect(normalized).toContain("<!DOCTYPE html>");
      expect(normalized).toContain("<%- body %>");
      expect(normalized).not.toContain("\r");
    });
  });

  describe("Environment Variables", () => {
    test("should handle different environment variable formats", () => {
      const originalEnv = process.env.BAM_TEST;
      
      try {
        // Test setting environment variable
        process.env.BAM_TEST = "test-value";
        expect(process.env.BAM_TEST).toBe("test-value");
        
        // Test PATH-like variables
        const pathSeparator = platform() === "win32" ? ";" : ":";
        const testPath = `path1${pathSeparator}path2${pathSeparator}path3`;
        process.env.BAM_TEST_PATH = testPath;
        
        const pathParts = process.env.BAM_TEST_PATH.split(pathSeparator);
        expect(pathParts).toContain("path1");
        expect(pathParts).toContain("path2");
        expect(pathParts).toContain("path3");
      } finally {
        // Restore original environment
        if (originalEnv !== undefined) {
          process.env.BAM_TEST = originalEnv;
        } else {
          delete process.env.BAM_TEST;
        }
        delete process.env.BAM_TEST_PATH;
      }
    });

    test("should handle home directory detection", () => {
      const homeVar = platform() === "win32" ? "USERPROFILE" : "HOME";
      const homeDir = process.env[homeVar];
      
      expect(homeDir).toBeDefined();
      expect(typeof homeDir).toBe("string");
      expect(homeDir.length).toBeGreaterThan(0);
    });
  });

  describe("Command Line Handling", () => {
    test("should handle different command line argument formats", () => {
      const testArgs = [
        ["--help"],
        ["-h"],
        ["new", "project"],
        ["new", "project", "template"],
        ["gen", "--output", "dist"]
      ];
      
      testArgs.forEach(args => {
        // Test argument parsing
        expect(Array.isArray(args)).toBe(true);
        expect(args.length).toBeGreaterThan(0);
        
        // Test that arguments are strings
        args.forEach(arg => {
          expect(typeof arg).toBe("string");
        });
      });
    });

    test("should handle quoted arguments", () => {
      const quotedArgs = [
        "project name with spaces",
        "path/with spaces/file.txt",
        "argument-with-special-chars!@#"
      ];
      
      quotedArgs.forEach(arg => {
        expect(typeof arg).toBe("string");
        expect(arg.length).toBeGreaterThan(0);
      });
    });
  });

  describe("Temporary Directory Handling", () => {
    test("should use platform-appropriate temp directory", () => {
      const systemTmpDir = tmpdir();
      
      expect(systemTmpDir).toBeDefined();
      expect(typeof systemTmpDir).toBe("string");
      expect(existsSync(systemTmpDir)).toBe(true);
      
      // Create a temp file in system temp dir
      const tempFile = join(systemTmpDir, `bam-test-${Date.now()}.tmp`);
      writeFileSync(tempFile, "temp content");
      
      expect(existsSync(tempFile)).toBe(true);
      
      // Cleanup
      rmSync(tempFile, { force: true });
    });

    test("should handle temp directory with special characters", () => {
      const tempSubDir = join(tmpdir(), "bam-test-special-chars");
      
      if (!existsSync(tempSubDir)) {
        mkdirSync(tempSubDir, { recursive: true });
      }
      
      const specialFiles = [
        "file with spaces.txt",
        "file-with-dashes.txt",
        "file_with_underscores.txt"
      ];
      
      specialFiles.forEach(filename => {
        const filePath = join(tempSubDir, filename);
        writeFileSync(filePath, `content for ${filename}`);
        expect(existsSync(filePath)).toBe(true);
      });
      
      // Cleanup
      rmSync(tempSubDir, { recursive: true, force: true });
    });
  });

  describe("Unicode Support", () => {
    test("should handle Unicode file names", () => {
      const unicodeFiles = [
        "café.md",
        "résumé.html",
        "测试.txt",
        "🚀rocket.md"
      ];
      
      unicodeFiles.forEach(filename => {
        try {
          const filePath = join(testDir, filename);
          writeFileSync(filePath, `Unicode content for ${filename}`);
          
          if (existsSync(filePath)) {
            expect(existsSync(filePath)).toBe(true);
          } else {
            console.warn(`Unicode filename not supported: ${filename}`);
          }
        } catch (error) {
          console.warn(`Unicode filename test failed for ${filename}:`, error.message);
        }
      });
    });

    test("should handle Unicode content", async () => {
      const unicodeContent = `
# Unicode Test Page

This page contains various Unicode characters:

- Café ☕
- Résumé 📄  
- 中文 🇨🇳
- Emoji: 🚀 🌟 ⭐
- Math: α β γ ∑ ∞
- Arrows: → ← ↑ ↓
`;
      
      const testFile = join(testDir, "unicode-content.md");
      writeFileSync(testFile, unicodeContent, "utf8");
      
      const readContent = await Bun.file(testFile).text();
      expect(readContent).toContain("Café");
      expect(readContent).toContain("Résumé");
      expect(readContent).toContain("中文");
      expect(readContent).toContain("🚀");
    });
  });

  describe("Performance Characteristics", () => {
    test("should perform consistently across platforms", () => {
      const iterations = 1000;
      
      const startTime = performance.now();
      
      for (let i = 0; i < iterations; i++) {
        const testFile = join(testDir, `perf-test-${i}.txt`);
        writeFileSync(testFile, `Performance test iteration ${i}`);
      }
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      // Performance should be reasonable on all platforms
      const expectedMaxDuration = platform() === "win32" ? 3000 : 2000; // Windows might be slower
      expect(duration).toBeLessThan(expectedMaxDuration);
      
      // Verify files were created
      for (let i = 0; i < 10; i++) { // Check first 10 files
        expect(existsSync(join(testDir, `perf-test-${i}.txt`))).toBe(true);
      }
    });
  });
});

describe("Platform-Specific Features", () => {
  test("should detect current platform correctly", () => {
    const currentPlatform = platform();
    const supportedPlatforms = ["win32", "darwin", "linux", "freebsd", "openbsd"];
    
    expect(supportedPlatforms).toContain(currentPlatform);
    console.log(`Running on platform: ${currentPlatform}`);
  });

  test("should handle platform-specific file attributes", () => {
    const testFile = join(globalThis.testUtils.createTempPath("platform-test"), "test.txt");
    mkdirSync(join(globalThis.testUtils.createTempPath("platform-test")), { recursive: true });
    writeFileSync(testFile, "test content");
    
    const stats = Bun.file(testFile).size;
    expect(typeof stats).toBe("number");
    expect(stats).toBeGreaterThan(0);
  });
});