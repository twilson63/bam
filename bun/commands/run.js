/**
 * BAM Run Command - Bun-optimized Development Server
 * Uses Bun.serve() for high-performance development server
 */

import { existsSync, readFileSync, statSync } from "fs";
import { join, extname } from "path";
import { Page } from "../utils/page.js";

/**
 * Get MIME type for file extension
 */
function getMimeType(ext) {
  const mimeTypes = {
    ".html": "text/html",
    ".css": "text/css",
    ".js": "application/javascript",
    ".json": "application/json",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".gif": "image/gif",
    ".svg": "image/svg+xml",
    ".ico": "image/x-icon",
    ".woff": "font/woff",
    ".woff2": "font/woff2",
    ".ttf": "font/ttf",
    ".eot": "application/vnd.ms-fontobject"
  };
  
  return mimeTypes[ext.toLowerCase()] || "text/plain";
}

/**
 * Check if path is an asset directory
 */
function isAssetPath(pathname) {
  return /^\/(stylesheets|images|javascripts|css|img|js)/.test(pathname);
}

/**
 * Serve static asset files
 */
async function serveAsset(pathname) {
  const filePath = `.${pathname}`;
  
  if (!existsSync(filePath)) {
    return null;
  }
  
  try {
    const content = readFileSync(filePath);
    const ext = extname(filePath);
    const mimeType = getMimeType(ext);
    
    return new Response(content, {
      headers: {
        "Content-Type": mimeType,
        "Cache-Control": "no-cache"
      }
    });
  } catch (error) {
    console.error(`Error serving asset ${pathname}:`, error.message);
    return null;
  }
}

/**
 * Serve dynamically rendered page
 */
async function servePage(pathname) {
  try {
    // Remove .html extension for page lookup
    const pagePath = pathname.replace('.html', '');
    const page = new Page(pagePath);
    const content = page.render();
    
    return new Response(content, {
      headers: {
        "Content-Type": "text/html",
        "Cache-Control": "no-cache"
      }
    });
  } catch (error) {
    console.error(`Error rendering page ${pathname}:`, error.message);
    return null;
  }
}

/**
 * Serve 404 page
 */
async function serve404() {
  const notFoundPath = "./404.html";
  
  if (existsSync(notFoundPath)) {
    try {
      const content = readFileSync(notFoundPath, "utf8");
      return new Response(content, {
        status: 404,
        headers: {
          "Content-Type": "text/html"
        }
      });
    } catch (error) {
      console.error("Error reading 404.html:", error.message);
    }
  }
  
  // Fallback 404 response
  return new Response(
    "<html><body><h1>404 - Page Not Found</h1><p>The requested page could not be found.</p></body></html>",
    {
      status: 404,
      headers: {
        "Content-Type": "text/html"
      }
    }
  );
}

/**
 * Main request handler
 */
async function handleRequest(request) {
  const url = new URL(request.url);
  let pathname = url.pathname;
  
  // Default to index.html for root path
  if (pathname === '/') {
    pathname = '/index.html';
  }
  
  console.log(`${new Date().toISOString()} - ${request.method} ${pathname}`);
  
  try {
    // Serve static assets
    if (isAssetPath(pathname)) {
      const assetResponse = await serveAsset(pathname);
      if (assetResponse) {
        return assetResponse;
      }
    }
    
    // Serve dynamically rendered pages
    const pageResponse = await servePage(pathname);
    if (pageResponse) {
      return pageResponse;
    }
    
    // Return 404 if nothing found
    return await serve404();
    
  } catch (error) {
    console.error(`Server error for ${pathname}:`, error.message);
    
    return new Response("Internal Server Error", {
      status: 500,
      headers: {
        "Content-Type": "text/plain"
      }
    });
  }
}

/**
 * Start development server
 */
export default async function runCommand(port = "3000") {
  const portNumber = parseInt(port, 10);
  
  if (isNaN(portNumber) || portNumber < 1 || portNumber > 65535) {
    throw new Error(`Invalid port number: ${port}`);
  }
  
  // Check if we're in a BAM project
  if (!existsSync("layout.html") && !existsSync("pages")) {
    console.warn("Warning: This doesn't appear to be a BAM project directory.");
    console.warn("Make sure you're in a directory with layout.html and pages/ folder.");
  }
  
  try {
    const server = Bun.serve({
      port: portNumber,
      fetch: handleRequest,
      error(error) {
        console.error("Server error:", error);
        return new Response("Internal Server Error", {
          status: 500
        });
      }
    });
    
    console.log(`🚀 BAM development server running on http://localhost:${portNumber}`);
    console.log(`📁 Serving from: ${process.cwd()}`);
    console.log(`⚡ Powered by Bun ${Bun.version}`);
    console.log("Press Ctrl+C to stop the server");
    
    // Handle graceful shutdown
    process.on("SIGINT", () => {
      console.log("\n👋 Shutting down server...");
      server.stop();
      process.exit(0);
    });
    
    process.on("SIGTERM", () => {
      console.log("\n👋 Shutting down server...");
      server.stop();
      process.exit(0);
    });
    
    return server;
    
  } catch (error) {
    if (error.code === "EADDRINUSE") {
      throw new Error(`Port ${portNumber} is already in use. Try a different port.`);
    }
    throw new Error(`Failed to start server: ${error.message}`);
  }
}