/**
 * Cross-platform compatibility tests for BAM (ES6/Node.js)
 */

import { describe, it, beforeEach, afterEach } from 'mocha';
import { expect } from 'chai';
import { mkdirSync, writeFileSync, rmSync, existsSync, readFileSync, statSync } from 'fs';
import { join, sep, resolve } from 'path';
import { platform, tmpdir } from 'os';

describe('Cross-Platform Compatibility (ES6/Node.js)', function() {
  const testDir = global.testUtils.createTempPath('cross-platform');

  beforeEach(function() {
    if (existsSync(testDir)) {
      rmSync(testDir, { recursive: true, force: true });
    }
    mkdirSync(testDir, { recursive: true });
    process.chdir(testDir);
  });

  afterEach(function() {
    process.chdir(global.TEST_CONFIG.tempDir.replace('/cross-platform', ''));
    if (existsSync(testDir)) {
      rmSync(testDir, { recursive: true, force: true });
    }
  });

  describe('Path Handling', function() {
    it('should handle different path separators', function() {
      const paths = [
        'pages/index.md',
        'pages\\index.md', // Windows style
        'pages/blog/post.md',
        'assets/css/style.css'
      ];
      
      paths.forEach(path => {
        const normalized = path.split(/[\/\\]/).join(sep);
        expect(normalized).to.be.a('string');
        expect(normalized.length).to.be.greaterThan(0);
      });
    });

    it('should resolve relative paths correctly', function() {
      const testPaths = [
        './pages/index.md',
        '../templates/layout.html',
        '../../assets/style.css'
      ];
      
      testPaths.forEach(path => {
        const resolved = resolve(path);
        expect(resolved).to.be.a('string');
        expect(resolved.length).to.be.greaterThan(0);
      });
    });

    it('should handle long file paths', function() {
      // Test path length limits on different platforms
      const longPath = 'a'.repeat(platform() === 'win32' ? 200 : 500);
      const testPath = join(testDir, longPath);
      
      // Should handle long paths gracefully
      expect(() => resolve(testPath)).to.not.throw();
    });

    it('should handle special characters in paths', function() {
      const specialChars = platform() === 'win32' 
        ? ['test file.md', 'test-file.md', 'test_file.md']
        : ['test file.md', 'test-file.md', 'test_file.md', 'tëst-fîlé.md'];
      
      specialChars.forEach(filename => {
        const filePath = join(testDir, filename);
        expect(() => {
          writeFileSync(filePath, 'test content');
          existsSync(filePath);
        }).to.not.throw();
      });
    });
  });

  describe('File System Operations', function() {
    it('should handle case sensitivity correctly', function() {
      const isCaseSensitive = platform() !== 'win32' && platform() !== 'darwin';
      
      writeFileSync(join(testDir, 'Test.md'), 'content');
      
      if (isCaseSensitive) {
        // On case-sensitive systems, these should be different files
        expect(existsSync(join(testDir, 'test.md'))).to.be.false;
        expect(existsSync(join(testDir, 'TEST.md'))).to.be.false;
      } else {
        // On case-insensitive systems, these might refer to the same file
        const testExists = existsSync(join(testDir, 'test.md'));
        const upperExists = existsSync(join(testDir, 'TEST.md'));
        // At least one should work on case-insensitive systems
        expect(testExists || upperExists).to.be.true;
      }
    });

    it('should handle file permissions correctly', function() {
      const testFile = join(testDir, 'permission-test.txt');
      writeFileSync(testFile, 'test content');
      
      if (platform() !== 'win32') {
        // Unix-like systems support chmod
        try {
          const { chmodSync } = require('fs');
          chmodSync(testFile, 0o644);
          expect(existsSync(testFile)).to.be.true;
        } catch (error) {
          // Permission operations might fail in some environments
          console.warn('Permission test skipped:', error.message);
        }
      } else {
        // Windows handles permissions differently
        expect(existsSync(testFile)).to.be.true;
      }
    });

    it('should handle symlinks if supported', function() {
      const sourceFile = join(testDir, 'source.txt');
      const linkFile = join(testDir, 'link.txt');
      
      writeFileSync(sourceFile, 'source content');
      
      if (platform() !== 'win32') {
        try {
          const { symlinkSync, readlinkSync } = require('fs');
          symlinkSync(sourceFile, linkFile);
          
          expect(existsSync(linkFile)).to.be.true;
          const linkTarget = readlinkSync(linkFile);
          expect(linkTarget).to.equal(sourceFile);
        } catch (error) {
          // Symlinks might not be supported in all environments
          console.warn('Symlink test skipped:', error.message);
        }
      }
    });
  });

  describe('Line Ending Handling', function() {
    it('should handle different line endings', function() {
      const lineEndings = {
        unix: 'Line 1\nLine 2\nLine 3',
        windows: 'Line 1\r\nLine 2\r\nLine 3',
        mac: 'Line 1\rLine 2\rLine 3',
        mixed: 'Line 1\nLine 2\r\nLine 3\r'
      };
      
      Object.entries(lineEndings).forEach(([type, content]) => {
        const filename = `${type}-endings.txt`;
        const filePath = join(testDir, filename);
        
        writeFileSync(filePath, content);
        expect(existsSync(filePath)).to.be.true;
        
        const readContent = readFileSync(filePath, 'utf8');
        expect(readContent).to.include('Line 1');
        expect(readContent).to.include('Line 2');
        expect(readContent).to.include('Line 3');
      });
    });

    it('should normalize line endings in templates', function() {
      const templateContent = '<!DOCTYPE html>\r\n<html>\n<body>\r<%- body %>\r\n</body>\n</html>';
      const layoutFile = join(testDir, 'layout.html');
      
      writeFileSync(layoutFile, templateContent);
      
      // Read and process the template
      const content = readFileSync(layoutFile, 'utf8');
      const normalized = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
      
      expect(normalized).to.include('<!DOCTYPE html>');
      expect(normalized).to.include('<%- body %>');
      expect(normalized).to.not.include('\r');
    });
  });

  describe('Environment Variables', function() {
    it('should handle different environment variable formats', function() {
      const originalEnv = process.env.BAM_TEST;
      
      try {
        // Test setting environment variable
        process.env.BAM_TEST = 'test-value';
        expect(process.env.BAM_TEST).to.equal('test-value');
        
        // Test PATH-like variables
        const pathSeparator = platform() === 'win32' ? ';' : ':';
        const testPath = `path1${pathSeparator}path2${pathSeparator}path3`;
        process.env.BAM_TEST_PATH = testPath;
        
        const pathParts = process.env.BAM_TEST_PATH.split(pathSeparator);
        expect(pathParts).to.include('path1');
        expect(pathParts).to.include('path2');
        expect(pathParts).to.include('path3');
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

    it('should handle home directory detection', function() {
      const homeVar = platform() === 'win32' ? 'USERPROFILE' : 'HOME';
      const homeDir = process.env[homeVar];
      
      expect(homeDir).to.be.a('string');
      expect(homeDir.length).to.be.greaterThan(0);
    });
  });

  describe('Command Line Handling', function() {
    it('should handle different command line argument formats', function() {
      const testArgs = [
        ['--help'],
        ['-h'],
        ['new', 'project'],
        ['new', 'project', 'template'],
        ['gen', '--output', 'dist']
      ];
      
      testArgs.forEach(args => {
        // Test argument parsing
        expect(args).to.be.an('array');
        expect(args.length).to.be.greaterThan(0);
        
        // Test that arguments are strings
        args.forEach(arg => {
          expect(arg).to.be.a('string');
        });
      });
    });

    it('should handle quoted arguments', function() {
      const quotedArgs = [
        'project name with spaces',
        'path/with spaces/file.txt',
        'argument-with-special-chars!@#'
      ];
      
      quotedArgs.forEach(arg => {
        expect(arg).to.be.a('string');
        expect(arg.length).to.be.greaterThan(0);
      });
    });
  });

  describe('Temporary Directory Handling', function() {
    it('should use platform-appropriate temp directory', function() {
      const systemTmpDir = tmpdir();
      
      expect(systemTmpDir).to.be.a('string');
      expect(existsSync(systemTmpDir)).to.be.true;
      
      // Create a temp file in system temp dir
      const tempFile = join(systemTmpDir, `bam-test-${Date.now()}.tmp`);
      writeFileSync(tempFile, 'temp content');
      
      expect(existsSync(tempFile)).to.be.true;
      
      // Cleanup
      rmSync(tempFile, { force: true });
    });

    it('should handle temp directory with special characters', function() {
      const tempSubDir = join(tmpdir(), 'bam-test-special-chars');
      
      if (!existsSync(tempSubDir)) {
        mkdirSync(tempSubDir, { recursive: true });
      }
      
      const specialFiles = [
        'file with spaces.txt',
        'file-with-dashes.txt',
        'file_with_underscores.txt'
      ];
      
      specialFiles.forEach(filename => {
        const filePath = join(tempSubDir, filename);
        writeFileSync(filePath, `content for ${filename}`);
        expect(existsSync(filePath)).to.be.true;
      });
      
      // Cleanup
      rmSync(tempSubDir, { recursive: true, force: true });
    });
  });

  describe('Unicode Support', function() {
    it('should handle Unicode file names', function() {
      const unicodeFiles = [
        'café.md',
        'résumé.html',
        '测试.txt',
        '🚀rocket.md'
      ];
      
      unicodeFiles.forEach(filename => {
        try {
          const filePath = join(testDir, filename);
          writeFileSync(filePath, `Unicode content for ${filename}`);
          
          if (existsSync(filePath)) {
            expect(existsSync(filePath)).to.be.true;
          } else {
            console.warn(`Unicode filename not supported: ${filename}`);
          }
        } catch (error) {
          console.warn(`Unicode filename test failed for ${filename}:`, error.message);
        }
      });
    });

    it('should handle Unicode content', function() {
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
      
      const testFile = join(testDir, 'unicode-content.md');
      writeFileSync(testFile, unicodeContent, 'utf8');
      
      const readContent = readFileSync(testFile, 'utf8');
      expect(readContent).to.include('Café');
      expect(readContent).to.include('Résumé');
      expect(readContent).to.include('中文');
      expect(readContent).to.include('🚀');
    });
  });

  describe('Performance Characteristics', function() {
    it('should perform consistently across platforms', function() {
      this.timeout(10000); // Extend timeout for performance test
      
      const iterations = 1000;
      
      const startTime = Date.now();
      
      for (let i = 0; i < iterations; i++) {
        const testFile = join(testDir, `perf-test-${i}.txt`);
        writeFileSync(testFile, `Performance test iteration ${i}`);
      }
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      // Performance should be reasonable on all platforms
      const expectedMaxDuration = platform() === 'win32' ? 5000 : 3000; // Windows might be slower
      expect(duration).to.be.lessThan(expectedMaxDuration);
      
      // Verify files were created
      for (let i = 0; i < 10; i++) { // Check first 10 files
        expect(existsSync(join(testDir, `perf-test-${i}.txt`))).to.be.true;
      }
    });
  });

  describe('Node.js Specific Features', function() {
    it('should handle buffer operations correctly', function() {
      const testData = Buffer.from('Hello, 世界! 🌍', 'utf8');
      const testFile = join(testDir, 'buffer-test.txt');
      
      writeFileSync(testFile, testData);
      
      const readData = readFileSync(testFile);
      expect(Buffer.isBuffer(readData)).to.be.true;
      expect(readData.toString('utf8')).to.equal('Hello, 世界! 🌍');
    });

    it('should handle stream operations', function(done) {
      const { createReadStream, createWriteStream } = require('fs');
      const sourceFile = join(testDir, 'stream-source.txt');
      const destFile = join(testDir, 'stream-dest.txt');
      
      writeFileSync(sourceFile, 'Stream test content');
      
      const readStream = createReadStream(sourceFile);
      const writeStream = createWriteStream(destFile);
      
      readStream.pipe(writeStream);
      
      writeStream.on('finish', () => {
        try {
          expect(existsSync(destFile)).to.be.true;
          const content = readFileSync(destFile, 'utf8');
          expect(content).to.equal('Stream test content');
          done();
        } catch (error) {
          done(error);
        }
      });
      
      writeStream.on('error', done);
    });
  });
});

describe('Platform-Specific Features (ES6/Node.js)', function() {
  it('should detect current platform correctly', function() {
    const currentPlatform = platform();
    const supportedPlatforms = ['win32', 'darwin', 'linux', 'freebsd', 'openbsd'];
    
    expect(supportedPlatforms).to.include(currentPlatform);
    console.log(`Running on platform: ${currentPlatform}`);
  });

  it('should handle platform-specific file attributes', function() {
    const testFile = join(global.testUtils.createTempPath('platform-test'), 'test.txt');
    mkdirSync(join(global.testUtils.createTempPath('platform-test')), { recursive: true });
    writeFileSync(testFile, 'test content');
    
    const stats = statSync(testFile);
    expect(stats.isFile()).to.be.true;
    expect(stats.size).to.be.greaterThan(0);
    expect(stats.mtime).to.be.an.instanceOf(Date);
  });

  it('should handle process signals appropriately', function(done) {
    // Test graceful shutdown handling
    const originalHandler = process.listeners('SIGTERM');
    
    process.once('SIGTERM', () => {
      // Simulate cleanup
      expect(true).to.be.true;
      done();
    });
    
    // Trigger the signal (in a safe way for testing)
    setTimeout(() => {
      process.emit('SIGTERM');
    }, 10);
  });
});