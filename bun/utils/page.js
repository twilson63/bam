/**
 * BAM Page Utility - Bun-optimized version
 * Handles page rendering and template processing using Bun's native APIs
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";
import { join, extname, basename } from "path";
import { readdirSync, statSync } from "fs";

// Template engines
import { render as ecoRender } from "eco";

/**
 * Recursively read directory contents (Bun-optimized)
 */
function readdirSyncRecursive(dir, files = [], rootPath = dir) {
  const items = readdirSync(dir);
  
  for (const item of items) {
    const fullPath = join(dir, item);
    const relativePath = fullPath.replace(rootPath + "/", "");
    
    if (statSync(fullPath).isDirectory()) {
      files.push(relativePath);
      readdirSyncRecursive(fullPath, files, rootPath);
    } else {
      files.push(relativePath);
    }
  }
  
  return files;
}

/**
 * Render template with body content
 */
function renderTemplate(proj = ".", body = "") {
  const templatePath = join(proj, "layout.html");
  
  if (!existsSync(templatePath)) {
    throw new Error(`Layout template not found: ${templatePath}`);
  }
  
  const template = readFileSync(templatePath, "utf8");
  return ecoRender(template, { body });
}

/**
 * Parse GitHub Flavored Markdown (simplified implementation)
 * Using Bun's built-in performance optimizations
 */
function parseMarkdown(content) {
  // Basic markdown parsing - in production, you'd use a proper markdown parser
  // This is a simplified version for demonstration
  return content
    .replace(/^# (.*$)/gm, "<h1>$1</h1>")
    .replace(/^## (.*$)/gm, "<h2>$1</h2>")
    .replace(/^### (.*$)/gm, "<h3>$1</h3>")
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    .replace(/\n/g, "<br>");
}

/**
 * Process CoffeeScript content (simplified)
 */
function processCoffeeScript(content) {
  // In a real implementation, you'd compile CoffeeScript to JavaScript
  // For now, return as-is wrapped in script tags
  return `<script type="text/coffeescript">${content}</script>`;
}

export class Page {
  constructor(pathname = "") {
    this.pathname = pathname;
    this.pages = [];
    this.ext = null;
    
    try {
      if (existsSync("pages")) {
        this.pages = readdirSyncRecursive("pages");
        
        if (this.pathname !== "") {
          // Find matching page and determine extension
          for (const page of this.pages) {
            const pageName = "/" + basename(page, extname(page));
            if (pageName === pathname) {
              this.ext = extname(page).slice(1);
              break;
            }
          }
        }
      }
    } catch (error) {
      console.warn("Warning: Could not read pages directory:", error.message);
      this.pages = [];
    }
  }

  /**
   * Render markdown content
   */
  markdown() {
    const filePath = `./pages${this.pathname}.md`;
    if (!existsSync(filePath)) {
      throw new Error(`Markdown file not found: ${filePath}`);
    }
    const content = readFileSync(filePath, "utf8");
    return parseMarkdown(content);
  }

  /**
   * Render HTML content
   */
  html() {
    const filePath = `./pages${this.pathname}.html`;
    if (!existsSync(filePath)) {
      throw new Error(`HTML file not found: ${filePath}`);
    }
    return readFileSync(filePath, "utf8");
  }

  /**
   * Process CoffeeScript content
   */
  coffee() {
    const filePath = `./pages${this.pathname}.coffee`;
    if (!existsSync(filePath)) {
      throw new Error(`CoffeeScript file not found: ${filePath}`);
    }
    const content = readFileSync(filePath, "utf8");
    return processCoffeeScript(content);
  }

  /**
   * Render page content based on file extension
   */
  render() {
    let body;
    
    switch (this.ext) {
      case "coffee":
        body = this.coffee();
        break;
      case "md":
        body = this.markdown();
        break;
      default:
        body = this.html();
    }
    
    return renderTemplate(".", body);
  }

  /**
   * Build/write page to destination
   */
  build(body, page, gen) {
    const name = basename(page, extname(page));
    
    if (body === "DIR") {
      const dirPath = join(gen, name);
      if (!existsSync(dirPath)) {
        mkdirSync(dirPath, { recursive: true });
      }
    } else {
      const fileName = `${name}.html`;
      const filePath = join(gen, fileName);
      writeFileSync(filePath, body, "utf8");
    }
  }

  /**
   * Process all pages and build them
   */
  async all(dest, proj = ".") {
    this.proj = proj;
    console.log("Processing pages:", this.pages);
    
    for (const page of this.pages) {
      try {
        const parts = ("/" + page).split(".");
        this.pathname = parts[0];
        this.ext = parts[1];
        
        const body = this.ext ? this.render() : "DIR";
        this.build(body, page, dest);
      } catch (error) {
        console.error(`Error processing page ${page}:`, error.message);
      }
    }
  }
}

export default Page;