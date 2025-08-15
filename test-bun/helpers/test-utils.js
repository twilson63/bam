/**
 * Test Utilities for Bun Tests
 * Shared utilities and helper functions for BAM testing
 */

import { mkdirSync, writeFileSync, rmSync, existsSync, readFileSync } from "fs";
import { join } from "path";

/**
 * Test project factory for creating consistent test projects
 */
export class TestProjectFactory {
  constructor(baseDir) {
    this.baseDir = baseDir;
    this.projects = new Map();
  }

  /**
   * Create a test project with specified configuration
   * @param {string} name - Project name
   * @param {Object} config - Project configuration
   * @returns {string} Project path
   */
  createProject(name, config = {}) {
    const projectPath = join(this.baseDir, name);
    
    if (existsSync(projectPath)) {
      rmSync(projectPath, { recursive: true, force: true });
    }
    mkdirSync(projectPath, { recursive: true });
    
    const defaultConfig = {
      template: 'skeleton',
      pages: [],
      assets: [],
      layout: this.getDefaultLayout()
    };
    
    const finalConfig = { ...defaultConfig, ...config };
    
    // Create layout file
    writeFileSync(join(projectPath, 'layout.html'), finalConfig.layout);
    
    // Create pages directory
    const pagesDir = join(projectPath, 'pages');
    mkdirSync(pagesDir, { recursive: true });
    
    // Create pages
    finalConfig.pages.forEach(page => {
      const pagePath = join(pagesDir, page.filename);
      writeFileSync(pagePath, page.content);
    });
    
    // Create asset directories and files
    finalConfig.assets.forEach(asset => {
      const assetDir = join(projectPath, asset.directory);
      mkdirSync(assetDir, { recursive: true });
      
      if (asset.files) {
        asset.files.forEach(file => {
          writeFileSync(join(assetDir, file.name), file.content);
        });
      }
    });
    
    this.projects.set(name, { path: projectPath, config: finalConfig });
    return projectPath;
  }

  /**
   * Get default layout template
   */
  getDefaultLayout() {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Test Site</title>
</head>
<body>
  <header>
    <h1>Test Site</h1>
  </header>
  <main>
    <%- body %>
  </main>
  <footer>
    <p>&copy; 2024 Test Site</p>
  </footer>
</body>
</html>`;
  }

  /**
   * Create a blog-style project
   */
  createBlogProject(name) {
    return this.createProject(name, {
      pages: [
        {
          filename: 'index.md',
          content: `# My Blog\n\nWelcome to my personal blog.\n\n## Recent Posts\n\n- [First Post](/first-post.html)\n- [About Me](/about.html)`
        },
        {
          filename: 'first-post.md',
          content: `# My First Post\n\nThis is my first blog post with **bold** text and *italic* text.\n\n## Code Example\n\n\`\`\`javascript\nconsole.log("Hello, world!");\n\`\`\``
        },
        {
          filename: 'about.html',
          content: `<h1>About Me</h1>\n<p>I'm a blogger who loves to write about technology.</p>`
        }
      ],
      assets: [
        {
          directory: 'stylesheets',
          files: [
            {
              name: 'blog.css',
              content: `body { font-family: Arial, sans-serif; }\nh1 { color: #333; }\n.post { margin: 20px 0; }`
            }
          ]
        },
        {
          directory: 'images',
          files: [
            {
              name: 'avatar.png',
              content: 'fake-png-data'
            }
          ]
        }
      ]
    });
  }

  /**
   * Create a portfolio-style project
   */
  createPortfolioProject(name) {
    return this.createProject(name, {
      pages: [
        {
          filename: 'index.html',
          content: `<div class="hero">\n  <h1>John Doe</h1>\n  <p>Web Developer & Designer</p>\n</div>\n<section class="projects">\n  <h2>Projects</h2>\n  <div class="project">Project 1</div>\n</section>`
        },
        {
          filename: 'contact.md',
          content: `# Contact Me\n\n**Email:** john@example.com\n**Phone:** +1 (555) 123-4567\n\n## Social Media\n\n- [Twitter](https://twitter.com/johndoe)\n- [LinkedIn](https://linkedin.com/in/johndoe)`
        }
      ],
      assets: [
        {
          directory: 'css',
          files: [
            {
              name: 'portfolio.css',
              content: `.hero { text-align: center; padding: 50px; }\n.projects { margin: 40px 0; }\n.project { border: 1px solid #ddd; padding: 20px; }`
            }
          ]
        }
      ]
    });
  }

  /**
   * Create a documentation-style project
   */
  createDocsProject(name) {
    return this.createProject(name, {
      pages: [
        {
          filename: 'index.md',
          content: `# Documentation\n\nWelcome to the documentation.\n\n## Getting Started\n\n1. [Installation](/installation.html)\n2. [Configuration](/configuration.html)\n3. [Usage](/usage.html)`
        },
        {
          filename: 'installation.md',
          content: `# Installation\n\n## Prerequisites\n\n- Node.js 16+\n- Git\n\n## Steps\n\n\`\`\`bash\nnpm install -g bam\nbam new my-project\n\`\`\``
        },
        {
          filename: 'configuration.md',
          content: `# Configuration\n\n## Basic Configuration\n\nEdit your \`config.json\` file:\n\n\`\`\`json\n{\n  "title": "My Site",\n  "description": "A great site"\n}\n\`\`\``
        }
      ],
      assets: [
        {
          directory: 'css',
          files: [
            {
              name: 'docs.css',
              content: `code { background: #f4f4f4; padding: 2px 4px; }\npre { background: #f4f4f4; padding: 15px; }\n.sidebar { width: 250px; float: left; }`
            }
          ]
        }
      ]
    });
  }

  /**
   * Cleanup all created projects
   */
  cleanup() {
    this.projects.forEach((project, name) => {
      if (existsSync(project.path)) {
        rmSync(project.path, { recursive: true, force: true });
      }
    });
    this.projects.clear();
  }
}

/**
 * File content generators for testing
 */
export class ContentGenerator {
  /**
   * Generate markdown content with specified characteristics
   */
  static generateMarkdown(options = {}) {
    const {
      title = 'Test Page',
      sections = 3,
      subsections = 2,
      paragraphs = 2,
      codeBlocks = 1,
      lists = 1
    } = options;

    let content = `# ${title}\n\n`;

    for (let i = 1; i <= sections; i++) {
      content += `## Section ${i}\n\n`;
      
      for (let p = 0; p < paragraphs; p++) {
        content += `This is paragraph ${p + 1} in section ${i}. It contains some **bold text** and *italic text* for testing purposes.\n\n`;
      }

      // Add subsections
      for (let s = 1; s <= subsections; s++) {
        content += `### Subsection ${i}.${s}\n\n`;
        content += `Content for subsection ${i}.${s} with more details.\n\n`;
      }

      // Add lists
      if (i <= lists) {
        content += `#### List Example ${i}\n\n`;
        content += `- Item 1\n- Item 2\n- Item 3\n\n`;
      }

      // Add code blocks
      if (i <= codeBlocks) {
        content += `#### Code Example ${i}\n\n`;
        content += `\`\`\`javascript\nfunction example${i}() {\n  console.log("Example ${i}");\n  return true;\n}\n\`\`\`\n\n`;
      }
    }

    return content;
  }

  /**
   * Generate HTML content
   */
  static generateHTML(options = {}) {
    const {
      title = 'Test HTML Page',
      sections = 3,
      includeCSS = true,
      includeJS = true
    } = options;

    let content = `<div class="page">\n  <header>\n    <h1>${title}</h1>\n  </header>\n\n`;

    for (let i = 1; i <= sections; i++) {
      content += `  <section class="section-${i}">\n`;
      content += `    <h2>Section ${i}</h2>\n`;
      content += `    <p>This is the content for section ${i}.</p>\n`;
      content += `    <div class="content">\n`;
      content += `      <p>More detailed content goes here.</p>\n`;
      content += `    </div>\n`;
      content += `  </section>\n\n`;
    }

    content += `  <footer>\n    <p>&copy; 2024 Test Page</p>\n  </footer>\n</div>`;

    if (includeJS) {
      content += `\n\n<script>\nconsole.log("${title} loaded");\n</script>`;
    }

    return content;
  }

  /**
   * Generate CSS content
   */
  static generateCSS(options = {}) {
    const {
      classes = 10,
      includeMediaQueries = true,
      includeAnimations = true
    } = options;

    let css = `/* Generated CSS for testing */\n\n`;
    css += `body {\n  font-family: Arial, sans-serif;\n  line-height: 1.6;\n  margin: 0;\n  padding: 20px;\n}\n\n`;

    for (let i = 1; i <= classes; i++) {
      css += `.class-${i} {\n`;
      css += `  color: #${(i * 111111).toString(16).slice(0, 6)};\n`;
      css += `  margin: ${i * 5}px;\n`;
      css += `  padding: ${i * 2}px;\n`;
      css += `}\n\n`;
    }

    if (includeMediaQueries) {
      css += `@media (max-width: 768px) {\n`;
      css += `  body { padding: 10px; }\n`;
      css += `  .class-1 { font-size: 14px; }\n`;
      css += `}\n\n`;
    }

    if (includeAnimations) {
      css += `@keyframes fadeIn {\n`;
      css += `  from { opacity: 0; }\n`;
      css += `  to { opacity: 1; }\n`;
      css += `}\n\n`;
      css += `.animated {\n`;
      css += `  animation: fadeIn 0.5s ease-in;\n`;
      css += `}\n`;
    }

    return css;
  }

  /**
   * Generate JavaScript content
   */
  static generateJS(options = {}) {
    const {
      functions = 5,
      includeComments = true,
      includeES6 = true
    } = options;

    let js = includeComments ? `// Generated JavaScript for testing\n\n` : '';

    if (includeES6) {
      js += `const testConfig = {\n  environment: 'test',\n  version: '1.0.0'\n};\n\n`;
    }

    for (let i = 1; i <= functions; i++) {
      if (includeComments) {
        js += `/**\n * Test function ${i}\n * @param {number} value - Input value\n * @returns {number} Processed value\n */\n`;
      }
      
      if (includeES6) {
        js += `const testFunction${i} = (value = ${i}) => {\n`;
      } else {
        js += `function testFunction${i}(value) {\n`;
        js += `  value = value || ${i};\n`;
      }
      
      js += `  console.log('Function ${i} called with value:', value);\n`;
      js += `  return value * ${i};\n`;
      js += `};\n\n`;
    }

    if (includeES6) {
      js += `export { testConfig, ${Array.from({length: functions}, (_, i) => `testFunction${i + 1}`).join(', ')} };\n`;
    }

    return js;
  }
}

/**
 * Performance measurement utilities
 */
export class PerformanceUtils {
  /**
   * Measure execution time of a function
   */
  static async measureTime(fn, iterations = 1) {
    const times = [];
    
    for (let i = 0; i < iterations; i++) {
      const start = performance.now();
      await fn();
      const end = performance.now();
      times.push(end - start);
    }
    
    return {
      times,
      average: times.reduce((a, b) => a + b, 0) / times.length,
      min: Math.min(...times),
      max: Math.max(...times),
      total: times.reduce((a, b) => a + b, 0)
    };
  }

  /**
   * Create performance benchmark
   */
  static createBenchmark(name, fn) {
    return {
      name,
      async run(iterations = 10) {
        return await PerformanceUtils.measureTime(fn, iterations);
      }
    };
  }

  /**
   * Compare multiple functions
   */
  static async compareFunctions(functions, iterations = 10) {
    const results = {};
    
    for (const [name, fn] of Object.entries(functions)) {
      results[name] = await PerformanceUtils.measureTime(fn, iterations);
    }
    
    return results;
  }
}

/**
 * File system test utilities
 */
export class FileSystemUtils {
  /**
   * Create a temporary directory structure
   */
  static createTempStructure(baseDir, structure) {
    Object.entries(structure).forEach(([path, content]) => {
      const fullPath = join(baseDir, path);
      
      if (typeof content === 'string') {
        // It's a file
        const dir = fullPath.substring(0, fullPath.lastIndexOf('/'));
        if (!existsSync(dir)) {
          mkdirSync(dir, { recursive: true });
        }
        writeFileSync(fullPath, content);
      } else if (content === null) {
        // It's a directory
        mkdirSync(fullPath, { recursive: true });
      }
    });
  }

  /**
   * Verify directory structure
   */
  static verifyStructure(baseDir, expectedStructure) {
    const results = {};
    
    Object.keys(expectedStructure).forEach(path => {
      const fullPath = join(baseDir, path);
      results[path] = existsSync(fullPath);
    });
    
    return results;
  }

  /**
   * Get directory tree as object
   */
  static getDirectoryTree(dir) {
    if (!existsSync(dir)) return null;
    
    const { readdirSync, statSync } = require('fs');
    const items = readdirSync(dir);
    const tree = {};
    
    items.forEach(item => {
      const fullPath = join(dir, item);
      const stats = statSync(fullPath);
      
      if (stats.isDirectory()) {
        tree[item] = FileSystemUtils.getDirectoryTree(fullPath);
      } else {
        tree[item] = {
          type: 'file',
          size: stats.size,
          modified: stats.mtime
        };
      }
    });
    
    return tree;
  }
}

/**
 * Assertion helpers for testing
 */
export class AssertionHelpers {
  /**
   * Assert that file contains specific content
   */
  static assertFileContains(filePath, expectedContent) {
    if (!existsSync(filePath)) {
      throw new Error(`File does not exist: ${filePath}`);
    }
    
    const content = readFileSync(filePath, 'utf8');
    if (!content.includes(expectedContent)) {
      throw new Error(`File ${filePath} does not contain expected content: ${expectedContent}`);
    }
    
    return true;
  }

  /**
   * Assert that directory has expected files
   */
  static assertDirectoryHasFiles(dirPath, expectedFiles) {
    if (!existsSync(dirPath)) {
      throw new Error(`Directory does not exist: ${dirPath}`);
    }
    
    const missingFiles = expectedFiles.filter(file => 
      !existsSync(join(dirPath, file))
    );
    
    if (missingFiles.length > 0) {
      throw new Error(`Missing files in ${dirPath}: ${missingFiles.join(', ')}`);
    }
    
    return true;
  }

  /**
   * Assert performance characteristics
   */
  static assertPerformance(actualTime, maxTime, operation = 'operation') {
    if (actualTime > maxTime) {
      throw new Error(`Performance assertion failed: ${operation} took ${actualTime}ms, expected under ${maxTime}ms`);
    }
    
    return true;
  }
}

export default {
  TestProjectFactory,
  ContentGenerator,
  PerformanceUtils,
  FileSystemUtils,
  AssertionHelpers
};