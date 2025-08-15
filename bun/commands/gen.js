/**
 * BAM Gen Command - Bun-optimized Static Site Generation
 * Generates static site files using Bun's native file APIs
 */

import { existsSync, mkdirSync, writeFileSync, rmSync } from "fs";
import { join, resolve } from "path";
import { Page } from "../utils/page.js";
import { copyAssets } from "../utils/assets.js";

/**
 * Clean generation directory
 */
async function cleanGenDirectory(genDir) {
  if (existsSync(genDir)) {
    console.log("Cleaning previous build...");
    rmSync(genDir, { recursive: true, force: true });
  }
}

/**
 * Create generation directory
 */
async function createGenDirectory(genDir) {
  if (!existsSync(genDir)) {
    mkdirSync(genDir, { recursive: true });
  }
}

/**
 * Generate additional files (robots.txt, sitemap, etc.)
 */
async function generateAdditionalFiles(genDir, projectName = "BAM Site") {
  // Generate robots.txt
  const robotsContent = `User-agent: *
Allow: /

Sitemap: /sitemap.xml`;
  
  writeFileSync(join(genDir, "robots.txt"), robotsContent, "utf8");
  console.log("Generated robots.txt");
  
  // Generate a basic sitemap.xml
  const sitemapContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>http://localhost/</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>`;
  
  writeFileSync(join(genDir, "sitemap.xml"), sitemapContent, "utf8");
  console.log("Generated sitemap.xml");
  
  // Generate a simple server.js for serving the static site
  const serverContent = `const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const port = process.env.PORT || 8000;

const mimeTypes = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml'
};

const server = http.createServer((req, res) => {
  let pathname = url.parse(req.url).pathname;
  
  if (pathname === '/') {
    pathname = '/index.html';
  }
  
  const filePath = path.join(__dirname, pathname);
  
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end('Not Found');
      return;
    }
    
    const ext = path.extname(filePath);
    const mimeType = mimeTypes[ext] || 'text/plain';
    
    res.writeHead(200, { 'Content-Type': mimeType });
    res.end(data);
  });
});

server.listen(port, () => {
  console.log(\`Static server running on http://localhost:\${port}\`);
});`;
  
  writeFileSync(join(genDir, "server.js"), serverContent, "utf8");
  console.log("Generated server.js");
}

/**
 * Generate build info file
 */
async function generateBuildInfo(genDir) {
  const buildInfo = {
    generator: "BAM (Bun-optimized)",
    version: "0.9.2-bun",
    buildTime: new Date().toISOString(),
    bunVersion: Bun.version,
    nodeVersion: process.version
  };
  
  writeFileSync(join(genDir, "build-info.json"), JSON.stringify(buildInfo, null, 2), "utf8");
  console.log("Generated build-info.json");
}

/**
 * Main gen command implementation
 */
export default async function genCommand(outputDir = "gen") {
  const genDir = resolve(process.cwd(), outputDir);
  
  console.log("🔨 Starting static site generation...");
  console.log(`📁 Output directory: ${genDir}`);
  console.log(`⚡ Powered by Bun ${Bun.version}`);
  
  // Check if we're in a BAM project
  if (!existsSync("layout.html")) {
    console.error("Error: layout.html not found. Are you in a BAM project directory?");
    process.exit(1);
  }
  
  if (!existsSync("pages")) {
    console.error("Error: pages/ directory not found. Are you in a BAM project directory?");
    process.exit(1);
  }
  
  try {
    const startTime = Date.now();
    
    // Clean and create generation directory
    await cleanGenDirectory(genDir);
    await createGenDirectory(genDir);
    
    // Generate pages
    console.log("📝 Processing pages...");
    const page = new Page();
    await page.all(genDir);
    
    // Copy assets
    console.log("📦 Copying assets...");
    await copyAssets(genDir);
    
    // Generate additional files
    console.log("📄 Generating additional files...");
    await generateAdditionalFiles(genDir);
    await generateBuildInfo(genDir);
    
    const endTime = Date.now();
    const duration = (endTime - startTime) / 1000;
    
    console.log("✅ Site generation completed successfully!");
    console.log(`📊 Build time: ${duration.toFixed(2)}s`);
    console.log(`📂 Files generated in: ${genDir}`);
    console.log();
    console.log("Next steps:");
    console.log(`  bam serve ${outputDir}     # Serve the generated site`);
    console.log(`  cd ${outputDir} && python -m http.server 8000   # Alternative server`);
    console.log("  # Deploy the contents of the gen/ folder to your web server");
    
  } catch (error) {
    console.error(`❌ Generation failed: ${error.message}`);
    console.error("Stack trace:", error.stack);
    process.exit(1);
  }
}