/**
 * End-to-end workflow tests for BAM (Bun)
 */

import { test, expect, describe, beforeEach, afterEach } from "bun:test";
import { spawn } from "child_process";
import { mkdirSync, writeFileSync, rmSync, existsSync, readFileSync } from "fs";
import { join } from "path";
import newCommand from "../../bun/commands/new.js";
import genCommand from "../../bun/commands/gen.js";

describe("E2E Workflow Tests (Bun)", () => {
  const testDir = globalThis.testUtils.createTempPath("e2e-tests");

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
    process.chdir(globalThis.TEST_CONFIG.tempDir.replace("/e2e-tests", ""));
    
    // Cleanup
    if (existsSync(testDir)) {
      rmSync(testDir, { recursive: true, force: true });
    }
  });

  test("should complete full blog creation workflow", async () => {
    // Step 1: Create new blog project
    await newCommand("my-blog", "skeleton");
    expect(existsSync("my-blog")).toBe(true);
    
    process.chdir("my-blog");
    
    // Step 2: Customize layout
    const customLayout = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>My Blog</title>
  <link rel="stylesheet" href="stylesheets/custom.css">
</head>
<body>
  <header>
    <h1>My Personal Blog</h1>
    <nav>
      <a href="/">Home</a>
      <a href="/about.html">About</a>
      <a href="/blog.html">Blog</a>
    </nav>
  </header>
  <main>
    <%- body %>
  </main>
  <footer>
    <p>&copy; 2024 My Blog. All rights reserved.</p>
  </footer>
</body>
</html>`;
    
    writeFileSync("layout.html", customLayout);
    
    // Step 3: Create blog posts
    const posts = [
      {
        filename: "index.md",
        content: `# Welcome to My Blog

This is my personal blog where I share my thoughts and experiences.

## Latest Posts

- [First Post](/first-post.html)
- [About JavaScript](/javascript-tips.html)
- [Travel Adventures](/travel.html)`
      },
      {
        filename: "first-post.md",
        content: `# My First Blog Post

Welcome to my first blog post! I'm excited to start sharing my journey.

## What's This About?

This blog will cover:
- **Technology** - My experiences with programming
- **Travel** - Adventures around the world  
- **Life** - Random thoughts and experiences

Stay tuned for more content!`
      },
      {
        filename: "javascript-tips.md",
        content: `# JavaScript Tips and Tricks

Here are some useful JavaScript tips I've learned.

## Tip 1: Use const and let

\`\`\`javascript
// Good
const name = "John";
let age = 25;

// Avoid
var oldStyle = "deprecated";
\`\`\`

## Tip 2: Destructuring

\`\`\`javascript
const user = { name: "Alice", age: 30 };
const { name, age } = user;
\`\`\`

*Happy coding!*`
      },
      {
        filename: "about.md",
        content: `# About Me

Hi! I'm a software developer passionate about **web technologies** and *travel*.

## Skills

- JavaScript/Node.js
- React/Vue.js
- Python
- Go

## Contact

Feel free to reach out at: hello@myblog.com`
      }
    ];
    
    posts.forEach(post => {
      writeFileSync(join("pages", post.filename), post.content);
    });
    
    // Step 4: Add custom CSS
    const customCSS = `/* Custom blog styles */
header {
  background: #2c3e50;
  color: white;
  padding: 20px;
  text-align: center;
}

nav a {
  color: white;
  text-decoration: none;
  margin: 0 15px;
  font-weight: bold;
}

nav a:hover {
  text-decoration: underline;
}

main {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  line-height: 1.6;
}

footer {
  background: #34495e;
  color: white;
  text-align: center;
  padding: 20px;
  margin-top: 40px;
}

code {
  background: #f4f4f4;
  padding: 2px 4px;
  border-radius: 3px;
  font-family: monospace;
}

pre {
  background: #f4f4f4;
  padding: 15px;
  border-radius: 5px;
  overflow-x: auto;
}

blockquote {
  border-left: 4px solid #3498db;
  margin-left: 0;
  padding-left: 20px;
  font-style: italic;
}`;
    
    writeFileSync(join("stylesheets", "custom.css"), customCSS);
    
    // Step 5: Generate the static site
    await genCommand(".");
    
    // Step 6: Verify generated files
    expect(existsSync("gen")).toBe(true);
    expect(existsSync(join("gen", "index.html"))).toBe(true);
    expect(existsSync(join("gen", "first-post.html"))).toBe(true);
    expect(existsSync(join("gen", "javascript-tips.html"))).toBe(true);
    expect(existsSync(join("gen", "about.html"))).toBe(true);
    expect(existsSync(join("gen", "stylesheets"))).toBe(true);
    
    // Step 7: Verify content quality
    const indexHtml = readFileSync(join("gen", "index.html"), "utf8");
    expect(indexHtml).toContain("My Personal Blog");
    expect(indexHtml).toContain("Welcome to My Blog");
    expect(indexHtml).toContain("Latest Posts");
    expect(indexHtml).toContain('href="/first-post.html"');
    
    const firstPostHtml = readFileSync(join("gen", "first-post.html"), "utf8");
    expect(firstPostHtml).toContain("My First Blog Post");
    expect(firstPostHtml).toContain("<strong>Technology</strong>");
    expect(firstPostHtml).toContain("<em>Travel</em>");
    
    const jsPostHtml = readFileSync(join("gen", "javascript-tips.html"), "utf8");
    expect(jsPostHtml).toContain("JavaScript Tips and Tricks");
    expect(jsPostHtml).toContain("<code>");
    expect(jsPostHtml).toContain("const name");
    
    // Step 8: Verify CSS was copied
    expect(existsSync(join("gen", "stylesheets", "custom.css"))).toBe(true);
    const copiedCSS = readFileSync(join("gen", "stylesheets", "custom.css"), "utf8");
    expect(copiedCSS).toContain("Custom blog styles");
    expect(copiedCSS).toContain("#2c3e50");
  });

  test("should handle complex multi-template project", async () => {
    // Create a project mixing different content types
    await newCommand("complex-site", "bootstrap");
    process.chdir("complex-site");
    
    // Add various page types
    writeFileSync(join("pages", "portfolio.html"), `
      <div class="portfolio">
        <h1>My Portfolio</h1>
        <div class="row">
          <div class="span4">
            <h3>Project 1</h3>
            <p>Description of project 1</p>
          </div>
          <div class="span4">
            <h3>Project 2</h3>
            <p>Description of project 2</p>
          </div>
        </div>
      </div>
    `);
    
    writeFileSync(join("pages", "docs.md"), `
# Documentation

## Getting Started

Follow these steps:

1. **Install** the software
2. **Configure** your settings  
3. **Deploy** your application

### Advanced Usage

\`\`\`bash
npm install
npm run build
npm start
\`\`\`
    `);
    
    // Generate and verify
    await genCommand(".");
    
    expect(existsSync(join("gen", "portfolio.html"))).toBe(true);
    expect(existsSync(join("gen", "docs.html"))).toBe(true);
    
    const portfolioHtml = readFileSync(join("gen", "portfolio.html"), "utf8");
    expect(portfolioHtml).toContain("portfolio");
    expect(portfolioHtml).toContain("Project 1");
    
    const docsHtml = readFileSync(join("gen", "docs.html"), "utf8");
    expect(docsHtml).toContain("<h1>Documentation</h1>");
    expect(docsHtml).toContain("<strong>Install</strong>");
    expect(docsHtml).toContain("<code>npm install</code>");
  });

  test("should preserve directory structure in pages", async () => {
    await newCommand("structured-site");
    process.chdir("structured-site");
    
    // Create nested directory structure
    mkdirSync(join("pages", "blog"), { recursive: true });
    mkdirSync(join("pages", "docs", "api"), { recursive: true });
    
    writeFileSync(join("pages", "blog", "post1.md"), "# Blog Post 1");
    writeFileSync(join("pages", "blog", "post2.md"), "# Blog Post 2");
    writeFileSync(join("pages", "docs", "guide.md"), "# User Guide");
    writeFileSync(join("pages", "docs", "api", "reference.md"), "# API Reference");
    
    await genCommand(".");
    
    // Verify directory structure is preserved
    expect(existsSync(join("gen", "blog"))).toBe(true);
    expect(existsSync(join("gen", "docs"))).toBe(true);
    expect(existsSync(join("gen", "docs", "api"))).toBe(true);
  });

  test("should handle error recovery gracefully", async () => {
    await newCommand("error-test");
    process.chdir("error-test");
    
    // Create page with potential issues
    writeFileSync(join("pages", "broken.html"), "<h1>Unclosed tag<h1>");
    writeFileSync(join("pages", "normal.md"), "# Normal Page");
    
    // Should still generate other pages even if one has issues
    await genCommand(".");
    
    expect(existsSync("gen")).toBe(true);
    expect(existsSync(join("gen", "normal.html"))).toBe(true);
    // broken.html might still be generated but with unclosed tags
  });
});

describe("E2E Performance Tests (Bun)", () => {
  test("should handle large site generation efficiently", async () => {
    const testDir = globalThis.testUtils.createTempPath("large-site");
    mkdirSync(testDir, { recursive: true });
    process.chdir(testDir);
    
    // Create large site
    await newCommand("large-site");
    process.chdir("large-site");
    
    // Generate many pages
    const pageCount = 100;
    for (let i = 0; i < pageCount; i++) {
      const content = `# Page ${i}

This is page number ${i} with some content.

## Section 1

Lorem ipsum dolor sit amet, consectetur adipiscing elit.

## Section 2  

- Item 1
- Item 2
- Item 3

### Code Example

\`\`\`javascript
function page${i}() {
  console.log("Page ${i}");
  return ${i};
}
\`\`\`

*Generated page ${i}*
`;
      writeFileSync(join("pages", `page${i}.md`), content);
    }
    
    // Add multiple asset files
    for (let i = 0; i < 20; i++) {
      writeFileSync(join("stylesheets", `style${i}.css`), 
        `/* Style ${i} */ .style${i} { color: #${i.toString(16).padStart(6, '0')}; }`);
      writeFileSync(join("images", `image${i}.png`), `fake-image-data-${i}`);
    }
    
    const startTime = performance.now();
    await genCommand(".");
    const endTime = performance.now();
    
    // Should complete large site in reasonable time
    expect(endTime - startTime).toBeLessThan(10000); // Under 10 seconds
    
    // Verify all pages generated
    expect(existsSync("gen")).toBe(true);
    for (let i = 0; i < pageCount; i++) {
      expect(existsSync(join("gen", `page${i}.html`))).toBe(true);
    }
    
    // Verify assets copied
    expect(existsSync(join("gen", "stylesheets"))).toBe(true);
    expect(existsSync(join("gen", "images"))).toBe(true);
    
    // Cleanup
    process.chdir(globalThis.TEST_CONFIG.tempDir);
    rmSync(testDir, { recursive: true, force: true });
  });
});