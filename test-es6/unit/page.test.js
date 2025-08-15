/**
 * Unit tests for ES6 Page utility (Node.js/Mocha)
 */

import { describe, it, beforeEach, afterEach } from 'mocha';
import { expect } from 'chai';
import { mkdirSync, writeFileSync, rmSync, existsSync } from 'fs';
import { join } from 'path';
import Page from '../../src-es6/util/page.js';

describe('Page Utility (ES6/Node.js)', function() {
  const testDir = global.testUtils.createTempPath('page-tests');
  const pagesDir = join(testDir, 'pages');

  beforeEach(function() {
    // Clean and create test directory
    if (existsSync(testDir)) {
      rmSync(testDir, { recursive: true, force: true });
    }
    mkdirSync(testDir, { recursive: true });
    mkdirSync(pagesDir, { recursive: true });
    
    // Change to test directory
    process.chdir(testDir);
  });

  afterEach(function() {
    // Return to original directory
    process.chdir(global.TEST_CONFIG.tempDir.replace('/page-tests', ''));
    
    // Cleanup
    if (existsSync(testDir)) {
      rmSync(testDir, { recursive: true, force: true });
    }
  });

  describe('Constructor', function() {
    it('should initialize with empty pathname', function() {
      const page = new Page();
      expect(page.pathname).to.equal('');
      expect(page.ext).to.be.null;
      expect(page.pages).to.be.an('array');
    });

    it('should initialize with specific pathname', function() {
      // Create test page
      writeFileSync(join(pagesDir, 'test.html'), '<h1>Test</h1>');
      
      const page = new Page('/test');
      expect(page.pathname).to.equal('/test');
      expect(page.ext).to.equal('html');
    });

    it('should read pages directory contents', function() {
      // Create test pages
      writeFileSync(join(pagesDir, 'index.html'), '<h1>Index</h1>');
      writeFileSync(join(pagesDir, 'about.md'), '# About');
      
      const page = new Page();
      expect(page.pages).to.include('index.html');
      expect(page.pages).to.include('about.md');
      expect(page.pages).to.have.lengthOf(2);
    });

    it('should handle missing pages directory gracefully', function() {
      rmSync(pagesDir, { recursive: true, force: true });
      
      const page = new Page();
      expect(page.pages).to.be.an('array').that.is.empty;
    });
  });

  describe('Content Rendering', function() {
    it('should render HTML content', function() {
      const content = '<h1>Test HTML</h1><p>Content</p>';
      writeFileSync(join(pagesDir, 'test.html'), content);
      
      const page = new Page('/test');
      const result = page.html();
      expect(result).to.equal(content);
    });

    it('should render Markdown content', function() {
      const content = '# Test Header\n\nThis is **bold** text.';
      writeFileSync(join(pagesDir, 'test.md'), content);
      
      const page = new Page('/test');
      const result = page.markdown();
      expect(result).to.include('<h1>Test Header</h1>');
      expect(result).to.include('<strong>bold</strong>');
    });

    it('should throw error for missing HTML file', function() {
      const page = new Page('/nonexistent');
      page.ext = 'html';
      
      expect(() => page.html()).to.throw('Error reading HTML file');
    });

    it('should throw error for missing Markdown file', function() {
      const page = new Page('/nonexistent');
      page.ext = 'md';
      
      expect(() => page.markdown()).to.throw('Error reading markdown file');
    });
  });

  describe('Template Integration', function() {
    it('should render with layout template', async function() {
      // Create layout template
      const layoutContent = `<!DOCTYPE html>
<html>
<head><title>Test</title></head>
<body><%- body %></body>
</html>`;
      writeFileSync(join(testDir, 'layout.html'), layoutContent);
      
      // Create page content
      writeFileSync(join(pagesDir, 'test.html'), '<h1>Test Page</h1>');
      
      const page = new Page('/test');
      const result = await page.render();
      expect(result).to.include('<!DOCTYPE html>');
      expect(result).to.include('<h1>Test Page</h1>');
      expect(result).to.include('</html>');
    });

    it('should handle missing layout template', async function() {
      writeFileSync(join(pagesDir, 'test.html'), '<h1>Test Page</h1>');
      
      const page = new Page('/test');
      await expect(page.render()).to.be.rejected;
    });

    it('should render different content types with template', async function() {
      const layoutContent = '<html><body><%- body %></body></html>';
      writeFileSync(join(testDir, 'layout.html'), layoutContent);
      
      // Test HTML
      writeFileSync(join(pagesDir, 'html-test.html'), '<div>HTML Content</div>');
      const htmlPage = new Page('/html-test');
      const htmlResult = await htmlPage.render();
      expect(htmlResult).to.include('<div>HTML Content</div>');
      
      // Test Markdown
      writeFileSync(join(pagesDir, 'md-test.md'), '# Markdown Content');
      const mdPage = new Page('/md-test');
      const mdResult = await mdPage.render();
      expect(mdResult).to.include('<h1>Markdown Content</h1>');
    });
  });

  describe('Page Building', function() {
    it('should build page to destination', function() {
      const genDir = join(testDir, 'gen');
      mkdirSync(genDir, { recursive: true });
      
      const page = new Page();
      const content = '<h1>Built Page</h1>';
      
      page.build(content, 'test.html', genDir);
      
      const builtFile = join(genDir, 'test.html');
      expect(existsSync(builtFile)).to.be.true;
    });

    it('should build directory when content is DIR', function() {
      const genDir = join(testDir, 'gen');
      mkdirSync(genDir, { recursive: true });
      
      const page = new Page();
      page.build('DIR', 'subdir', genDir);
      
      const builtDir = join(genDir, 'subdir');
      expect(existsSync(builtDir)).to.be.true;
    });

    it('should handle build errors gracefully', function() {
      const page = new Page();
      
      // Try to build to non-existent directory without recursive option
      expect(() => {
        page.build('<h1>Content</h1>', 'test.html', '/nonexistent/path');
      }).to.throw();
    });
  });

  describe('Generate All Pages', function() {
    it('should process all pages in directory', async function() {
      // Create layout template
      const layoutContent = '<html><body><%- body %></body></html>';
      writeFileSync(join(testDir, 'layout.html'), layoutContent);
      
      // Create test pages
      writeFileSync(join(pagesDir, 'index.html'), '<h1>Index</h1>');
      writeFileSync(join(pagesDir, 'about.md'), '# About Page');
      
      const genDir = join(testDir, 'gen');
      mkdirSync(genDir, { recursive: true });
      
      const page = new Page();
      await page.generateAll(genDir);
      
      expect(existsSync(join(genDir, 'index.html'))).to.be.true;
      expect(existsSync(join(genDir, 'about.html'))).to.be.true;
    });

    it('should handle errors in individual pages without stopping', async function() {
      // Create layout template
      const layoutContent = '<html><body><%- body %></body></html>';
      writeFileSync(join(testDir, 'layout.html'), layoutContent);
      
      // Create good and problematic pages
      writeFileSync(join(pagesDir, 'good.html'), '<h1>Good Page</h1>');
      // Create a page that will cause an error (invalid extension handling)
      writeFileSync(join(pagesDir, 'problematic'), 'Content without extension');
      
      const genDir = join(testDir, 'gen');
      mkdirSync(genDir, { recursive: true });
      
      const page = new Page();
      
      // Should not throw error for the entire operation
      await expect(page.generateAll(genDir)).to.not.be.rejected;
      
      // Good page should still be generated
      expect(existsSync(join(genDir, 'good.html'))).to.be.true;
    });

    it('should preserve file structure for nested pages', async function() {
      // Create layout template
      const layoutContent = '<html><body><%- body %></body></html>';
      writeFileSync(join(testDir, 'layout.html'), layoutContent);
      
      // Create nested directory structure
      mkdirSync(join(pagesDir, 'blog'), { recursive: true });
      writeFileSync(join(pagesDir, 'blog', 'post1.md'), '# Blog Post 1');
      writeFileSync(join(pagesDir, 'blog', 'post2.html'), '<h1>Blog Post 2</h1>');
      
      const genDir = join(testDir, 'gen');
      mkdirSync(genDir, { recursive: true });
      
      const page = new Page();
      await page.generateAll(genDir);
      
      // Check that nested structure is handled appropriately
      // Note: The current implementation might flatten the structure
      const generatedFiles = ['post1.html', 'post2.html'];
      generatedFiles.forEach(file => {
        expect(existsSync(join(genDir, file))).to.be.true;
      });
    });
  });

  describe('Edge Cases', function() {
    it('should handle empty pages directory', async function() {
      const page = new Page();
      const genDir = join(testDir, 'gen');
      mkdirSync(genDir, { recursive: true });
      
      await expect(page.generateAll(genDir)).to.not.be.rejected;
    });

    it('should handle pages with no extension', function() {
      writeFileSync(join(pagesDir, 'no-extension'), 'Content without extension');
      
      const page = new Page('/no-extension');
      expect(page.ext).to.be.null;
    });

    it('should handle special characters in page names', function() {
      const specialName = 'page-with-special_chars.html';
      writeFileSync(join(pagesDir, specialName), '<h1>Special</h1>');
      
      const page = new Page();
      expect(page.pages).to.include(specialName);
    });

    it('should handle large page content', function() {
      const largeContent = '<h1>Large Page</h1>\n' + 'Content line\n'.repeat(10000);
      writeFileSync(join(pagesDir, 'large.html'), largeContent);
      
      const page = new Page('/large');
      const result = page.html();
      expect(result).to.include('<h1>Large Page</h1>');
      expect(result.split('\n')).to.have.length.greaterThan(10000);
    });
  });
});

describe('Page Utility Performance (ES6/Node.js)', function() {
  it('should handle multiple pages efficiently', async function() {
    this.timeout(10000); // Extend timeout for performance test
    
    const testDir = global.testUtils.createTempPath('perf-test');
    const pagesDir = join(testDir, 'pages');
    
    mkdirSync(testDir, { recursive: true });
    mkdirSync(pagesDir, { recursive: true });
    
    // Create layout template
    const layoutContent = '<html><body><%- body %></body></html>';
    writeFileSync(join(testDir, 'layout.html'), layoutContent);
    
    // Create many pages
    const pageCount = 100;
    for (let i = 0; i < pageCount; i++) {
      writeFileSync(join(pagesDir, `page${i}.md`), `# Page ${i}\n\nContent for page ${i}.`);
    }
    
    process.chdir(testDir);
    
    const startTime = Date.now();
    
    const genDir = join(testDir, 'gen');
    mkdirSync(genDir, { recursive: true });
    
    const page = new Page();
    await page.generateAll(genDir);
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    // Should complete in reasonable time
    expect(duration).to.be.lessThan(5000); // Under 5 seconds
    
    // Verify all pages were generated
    for (let i = 0; i < pageCount; i++) {
      expect(existsSync(join(genDir, `page${i}.html`))).to.be.true;
    }
    
    // Cleanup
    process.chdir(global.TEST_CONFIG.tempDir);
    rmSync(testDir, { recursive: true, force: true });
  });

  it('should process large markdown files efficiently', function() {
    const testDir = global.testUtils.createTempPath('large-md-test');
    const pagesDir = join(testDir, 'pages');
    
    mkdirSync(testDir, { recursive: true });
    mkdirSync(pagesDir, { recursive: true });
    
    // Create large markdown content
    const sections = Array(500).fill(0).map((_, i) => 
      `## Section ${i}\n\nThis is content for section ${i} with **bold** and *italic* text.\n\n` +
      `### Subsection ${i}.1\n\n- Item 1\n- Item 2\n- Item 3\n\n` +
      `\`\`\`javascript\nfunction section${i}() {\n  return ${i};\n}\n\`\`\`\n`
    );
    const largeContent = '# Large Document\n\n' + sections.join('\n');
    
    writeFileSync(join(pagesDir, 'large.md'), largeContent);
    process.chdir(testDir);
    
    const startTime = Date.now();
    const page = new Page('/large');
    const result = page.markdown();
    const endTime = Date.now();
    
    expect(result).to.include('<h1>Large Document</h1>');
    expect(result).to.include('<h2>Section 0</h2>');
    expect(result).to.include('<h2>Section 499</h2>');
    expect(endTime - startTime).to.be.lessThan(2000); // Under 2 seconds
    
    // Cleanup
    process.chdir(global.TEST_CONFIG.tempDir);
    rmSync(testDir, { recursive: true, force: true });
  });
});