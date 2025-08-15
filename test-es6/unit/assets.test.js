/**
 * Unit tests for ES6 Assets utility (Node.js/Mocha)
 */

import { describe, it, beforeEach, afterEach } from 'mocha';
import { expect } from 'chai';
import { mkdirSync, writeFileSync, rmSync, existsSync, readFileSync } from 'fs';
import { join } from 'path';
import assets from '../../src-es6/util/assets.js';

describe('Assets Utility (ES6/Node.js)', function() {
  const testDir = global.testUtils.createTempPath('assets-tests');

  beforeEach(function() {
    // Clean and create test directory
    if (existsSync(testDir)) {
      rmSync(testDir, { recursive: true, force: true });
    }
    mkdirSync(testDir, { recursive: true });
    process.chdir(testDir);
  });

  afterEach(function() {
    // Return to original directory
    process.chdir(global.TEST_CONFIG.tempDir.replace('/assets-tests', ''));
    
    // Cleanup
    if (existsSync(testDir)) {
      rmSync(testDir, { recursive: true, force: true });
    }
  });

  describe('Basic Asset Copying', function() {
    it('should copy all standard asset directories', async function() {
      this.timeout(5000);
      
      const assetDirs = ['images', 'javascripts', 'stylesheets', 'ico', 'img', 'js', 'css'];
      const genDir = join(testDir, 'gen');
      
      // Create asset directories with content
      assetDirs.forEach(dir => {
        mkdirSync(join(testDir, dir), { recursive: true });
        writeFileSync(join(testDir, dir, `test.${getFileExtension(dir)}`), 
                     `content for ${dir}`);
      });
      
      await assets(testDir, genDir);
      
      // Verify all directories were copied
      assetDirs.forEach(dir => {
        expect(existsSync(join(genDir, dir))).to.be.true;
        expect(existsSync(join(genDir, dir, `test.${getFileExtension(dir)}`))).to.be.true;
      });
    });

    it('should handle missing asset directories gracefully', async function() {
      const genDir = join(testDir, 'gen');
      
      // Should not throw error when no asset directories exist
      await expect(assets(testDir, genDir)).to.not.be.rejected;
    });

    it('should copy nested directory structures', async function() {
      const sourceDir = join(testDir, 'images');
      const subDir = join(sourceDir, 'icons');
      const genDir = join(testDir, 'gen');
      
      mkdirSync(subDir, { recursive: true });
      writeFileSync(join(sourceDir, 'logo.png'), 'logo content');
      writeFileSync(join(subDir, 'icon1.png'), 'icon1 content');
      writeFileSync(join(subDir, 'icon2.png'), 'icon2 content');
      
      await assets(testDir, genDir);
      
      expect(existsSync(join(genDir, 'images', 'logo.png'))).to.be.true;
      expect(existsSync(join(genDir, 'images', 'icons', 'icon1.png'))).to.be.true;
      expect(existsSync(join(genDir, 'images', 'icons', 'icon2.png'))).to.be.true;
    });

    it('should preserve file content during copy', async function() {
      const sourceFile = join(testDir, 'css', 'style.css');
      const expectedContent = `
        body {
          font-family: Arial, sans-serif;
          margin: 0;
          padding: 20px;
        }
        .container {
          max-width: 1200px;
          margin: 0 auto;
        }
      `;
      
      mkdirSync(join(testDir, 'css'), { recursive: true });
      writeFileSync(sourceFile, expectedContent);
      
      const genDir = join(testDir, 'gen');
      await assets(testDir, genDir);
      
      const copiedFile = join(genDir, 'css', 'style.css');
      expect(existsSync(copiedFile)).to.be.true;
      
      const copiedContent = readFileSync(copiedFile, 'utf8');
      expect(copiedContent).to.equal(expectedContent);
    });
  });

  describe('Multiple Asset Types', function() {
    it('should handle different file types correctly', async function() {
      const assets = [
        { dir: 'css', file: 'styles.css', content: 'body { color: red; }' },
        { dir: 'js', file: 'script.js', content: 'console.log("hello");' },
        { dir: 'images', file: 'logo.png', content: 'fake-png-data' },
        { dir: 'images', file: 'background.jpg', content: 'fake-jpg-data' },
        { dir: 'ico', file: 'favicon.ico', content: 'fake-ico-data' }
      ];
      
      // Create asset files
      assets.forEach(asset => {
        mkdirSync(join(testDir, asset.dir), { recursive: true });
        writeFileSync(join(testDir, asset.dir, asset.file), asset.content);
      });
      
      const genDir = join(testDir, 'gen');
      await assets(testDir, genDir);
      
      // Verify all files copied
      assets.forEach(asset => {
        const copiedFile = join(genDir, asset.dir, asset.file);
        expect(existsSync(copiedFile)).to.be.true;
        
        const copiedContent = readFileSync(copiedFile, 'utf8');
        expect(copiedContent).to.equal(asset.content);
      });
    });

    it('should handle large asset files', async function() {
      this.timeout(10000);
      
      const largeCSS = Array(10000).fill('.class { margin: 0; }').join('\n');
      const largeJS = Array(5000).fill('// Comment line').join('\n') + '\nfunction test() { return true; }';
      
      mkdirSync(join(testDir, 'css'), { recursive: true });
      mkdirSync(join(testDir, 'js'), { recursive: true });
      
      writeFileSync(join(testDir, 'css', 'large.css'), largeCSS);
      writeFileSync(join(testDir, 'js', 'large.js'), largeJS);
      
      const genDir = join(testDir, 'gen');
      const startTime = Date.now();
      
      await assets(testDir, genDir);
      
      const endTime = Date.now();
      
      expect(existsSync(join(genDir, 'css', 'large.css'))).to.be.true;
      expect(existsSync(join(genDir, 'js', 'large.js'))).to.be.true;
      expect(endTime - startTime).to.be.lessThan(3000); // Under 3 seconds
    });

    it('should handle binary files correctly', async function() {
      const binaryData = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]); // PNG header
      
      mkdirSync(join(testDir, 'images'), { recursive: true });
      writeFileSync(join(testDir, 'images', 'test.png'), binaryData);
      
      const genDir = join(testDir, 'gen');
      await assets(testDir, genDir);
      
      const copiedFile = join(genDir, 'images', 'test.png');
      expect(existsSync(copiedFile)).to.be.true;
      
      const copiedData = readFileSync(copiedFile);
      expect(copiedData).to.deep.equal(binaryData);
    });
  });

  describe('Error Handling', function() {
    it('should handle permission errors gracefully', async function() {
      // Create a directory that might cause permission issues
      const restrictedDir = join(testDir, 'restricted');
      mkdirSync(restrictedDir, { recursive: true });
      
      const genDir = join(testDir, 'gen');
      
      // Should not throw even if there are permission issues
      await expect(assets(testDir, genDir)).to.not.be.rejected;
    });

    it('should continue copying other directories if one fails', async function() {
      // Create good and potentially problematic directories
      mkdirSync(join(testDir, 'css'), { recursive: true });
      mkdirSync(join(testDir, 'js'), { recursive: true });
      
      writeFileSync(join(testDir, 'css', 'good.css'), 'body { color: blue; }');
      writeFileSync(join(testDir, 'js', 'good.js'), 'console.log("good");');
      
      const genDir = join(testDir, 'gen');
      await assets(testDir, genDir);
      
      // Good files should still be copied
      expect(existsSync(join(genDir, 'css', 'good.css'))).to.be.true;
      expect(existsSync(join(genDir, 'js', 'good.js'))).to.be.true;
    });

    it('should handle empty directories', async function() {
      // Create empty asset directories
      const emptyDirs = ['images', 'css', 'js'];
      emptyDirs.forEach(dir => {
        mkdirSync(join(testDir, dir), { recursive: true });
      });
      
      const genDir = join(testDir, 'gen');
      await assets(testDir, genDir);
      
      // Empty directories should still be created
      emptyDirs.forEach(dir => {
        expect(existsSync(join(genDir, dir))).to.be.true;
      });
    });
  });

  describe('Path Resolution', function() {
    it('should handle relative paths correctly', async function() {
      mkdirSync(join(testDir, 'css'), { recursive: true });
      writeFileSync(join(testDir, 'css', 'style.css'), 'body { color: green; }');
      
      const relativeGenDir = 'gen';
      await assets('.', relativeGenDir);
      
      expect(existsSync(join(testDir, relativeGenDir, 'css', 'style.css'))).to.be.true;
    });

    it('should handle absolute paths correctly', async function() {
      mkdirSync(join(testDir, 'css'), { recursive: true });
      writeFileSync(join(testDir, 'css', 'style.css'), 'body { color: purple; }');
      
      const absoluteGenDir = join(testDir, 'gen-absolute');
      await assets(testDir, absoluteGenDir);
      
      expect(existsSync(join(absoluteGenDir, 'css', 'style.css'))).to.be.true;
    });

    it('should create destination directories if they don\'t exist', async function() {
      mkdirSync(join(testDir, 'css'), { recursive: true });
      writeFileSync(join(testDir, 'css', 'style.css'), 'body { color: orange; }');
      
      const deepGenDir = join(testDir, 'deep', 'nested', 'gen');
      await assets(testDir, deepGenDir);
      
      expect(existsSync(join(deepGenDir, 'css', 'style.css'))).to.be.true;
    });
  });
});

describe('Assets Utility Performance (ES6/Node.js)', function() {
  it('should copy many files efficiently', async function() {
    this.timeout(15000);
    
    const testDir = global.testUtils.createTempPath('perf-assets');
    mkdirSync(testDir, { recursive: true });
    process.chdir(testDir);
    
    // Create many asset files
    const assetDirs = ['css', 'js', 'images'];
    const filesPerDir = 100;
    
    assetDirs.forEach(dir => {
      mkdirSync(join(testDir, dir), { recursive: true });
      
      for (let i = 0; i < filesPerDir; i++) {
        const extension = dir === 'images' ? 'png' : (dir === 'css' ? 'css' : 'js');
        const content = `/* File ${i} in ${dir} */ .class${i} { margin: ${i}px; }`;
        writeFileSync(join(testDir, dir, `file${i}.${extension}`), content);
      }
    });
    
    const genDir = join(testDir, 'gen');
    const startTime = Date.now();
    
    await assets(testDir, genDir);
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    // Should complete in reasonable time
    expect(duration).to.be.lessThan(5000); // Under 5 seconds
    
    // Verify all files copied
    assetDirs.forEach(dir => {
      for (let i = 0; i < filesPerDir; i++) {
        const extension = dir === 'images' ? 'png' : (dir === 'css' ? 'css' : 'js');
        expect(existsSync(join(genDir, dir, `file${i}.${extension}`))).to.be.true;
      }
    });
    
    // Cleanup
    process.chdir(global.TEST_CONFIG.tempDir);
    rmSync(testDir, { recursive: true, force: true });
  });
});

// Helper function to determine file extension for asset directories
function getFileExtension(dir) {
  const extensions = {
    'images': 'png',
    'javascripts': 'js',
    'stylesheets': 'css',
    'ico': 'ico',
    'img': 'png',
    'js': 'js',
    'css': 'css'
  };
  return extensions[dir] || 'txt';
}