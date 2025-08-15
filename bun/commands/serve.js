/**
 * BAM Serve Command - Bun-optimized Static Site Serving
 * Serves generated static sites using Bun.serve()
 */

import { existsSync, readFileSync, statSync, readdirSync } from "fs";
import { join, extname, resolve } from "path";

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
    ".eot": "application/vnd.ms-fontobject",
    ".pdf": "application/pdf",
    ".txt": "text/plain",
    ".xml": "application/xml"
  };
  
  return mimeTypes[ext.toLowerCase()] || "application/octet-stream";
}

/**
 * Serve static file
 */
async function serveFile(filePath) {
  try {
    if (!existsSync(filePath) || !statSync(filePath).isFile()) {
      return null;
    }
    
    const ext = extname(filePath);
    const mimeType = getMimeType(ext);
    
    // Read file content
    const content = readFileSync(filePath);
    
    return new Response(content, {
      headers: {
        "Content-Type": mimeType,
        "Cache-Control": "public, max-age=3600"
      }
    });
  } catch (error) {
    console.error(`Error serving file ${filePath}:`, error.message);
    return null;
  }
}

/**
 * Generate directory listing HTML
 */
function generateDirectoryListing(dirPath, requestPath) {
  const items = readdirSync(dirPath);
  const listItems = items.map(item => {
    const itemPath = join(dirPath, item);
    const isDir = statSync(itemPath).isDirectory();
    const displayName = isDir ? `${item}/` : item;
    const href = join(requestPath, item);
    
    return `<li><a href="${href}">${displayName}</a></li>`;
  }).join("\n");
  
  return `<!DOCTYPE html>
<html>
<head>
  <title>Directory Listing - ${requestPath}</title>
  <style>
    body { font-family: monospace; margin: 40px; }
    h1 { color: #333; }
    ul { list-style: none; padding: 0; }
    li { margin: 8px 0; }
    a { text-decoration: none; color: #0066cc; }
    a:hover { text-decoration: underline; }
    .parent { margin-bottom: 20px; }
  </style>
</head>
<body>
  <h1>Directory Listing: ${requestPath}</h1>
  ${requestPath !== "/" ? '<div class="parent"><a href="../">../</a></div>' : ""}
  <ul>
    ${listItems}
  </ul>
  <hr>
  <small>Served by BAM (Bun-optimized) Static Server</small>
</body>
</html>`;
}

/**
 * Main request handler
 */
async function handleRequest(request, serveDir) {
  const url = new URL(request.url);
  let pathname = decodeURIComponent(url.pathname);
  
  // Security: prevent path traversal
  if (pathname.includes("..") || pathname.includes("\\")) {
    return new Response("Forbidden", { 
      status: 403,
      headers: { "Content-Type": "text/plain" }
    });
  }
  
  console.log(`${new Date().toISOString()} - ${request.method} ${pathname}`);
  
  // Build full file path
  const fullPath = join(serveDir, pathname);
  
  try {
    // Check if path exists
    if (!existsSync(fullPath)) {
      return new Response("Not Found", {
        status: 404,
        headers: { "Content-Type": "text/plain" }
      });
    }
    
    const stats = statSync(fullPath);
    
    if (stats.isFile()) {
      // Serve file
      const response = await serveFile(fullPath);
      return response || new Response("Error reading file", { 
        status: 500,
        headers: { "Content-Type": "text/plain" }
      });
    } else if (stats.isDirectory()) {
      // Try to serve index.html from directory
      const indexPath = join(fullPath, "index.html");
      if (existsSync(indexPath)) {
        const response = await serveFile(indexPath);
        return response || new Response("Error reading index file", {
          status: 500,
          headers: { "Content-Type": "text/plain" }
        });
      } else {
        // Generate directory listing
        const listingHtml = generateDirectoryListing(fullPath, pathname);
        return new Response(listingHtml, {
          headers: { "Content-Type": "text/html" }
        });
      }
    }
    
    return new Response("Unsupported file type", {
      status: 400,
      headers: { "Content-Type": "text/plain" }
    });
    
  } catch (error) {
    console.error(`Server error for ${pathname}:`, error.message);
    
    return new Response("Internal Server Error", {
      status: 500,
      headers: { "Content-Type": "text/plain" }
    });
  }
}

/**
 * Main serve command implementation
 */
export default async function serveCommand(portOrDir = "8000", maybePort) {
  let port = 8000;
  let serveDir = "./gen";
  
  // Parse arguments - handle both "bam serve" and "bam serve gen 8000" patterns
  if (portOrDir) {
    const parsedPort = parseInt(portOrDir, 10);
    if (!isNaN(parsedPort)) {
      // First arg is port number
      port = parsedPort;
    } else {
      // First arg is directory
      serveDir = portOrDir;
      if (maybePort) {
        const parsedMaybePort = parseInt(maybePort, 10);
        if (!isNaN(parsedMaybePort)) {
          port = parsedMaybePort;
        }
      }
    }
  }
  
  if (port < 1 || port > 65535) {
    throw new Error(`Invalid port number: ${port}`);
  }
  
  // Resolve serve directory
  serveDir = resolve(process.cwd(), serveDir);
  
  // Check if directory exists
  if (!existsSync(serveDir)) {
    console.error(`Error: Directory '${serveDir}' does not exist`);
    console.log("Did you run 'bam gen' first to generate the static site?");
    process.exit(1);
  }
  
  if (!statSync(serveDir).isDirectory()) {
    console.error(`Error: '${serveDir}' is not a directory`);
    process.exit(1);
  }
  
  try {
    const server = Bun.serve({
      port,
      fetch: (request) => handleRequest(request, serveDir),
      error(error) {
        console.error("Server error:", error);
        return new Response("Internal Server Error", {
          status: 500,
          headers: { "Content-Type": "text/plain" }
        });
      }
    });
    
    console.log(`🚀 BAM static server running on http://localhost:${port}`);
    console.log(`📁 Serving from: ${serveDir}`);
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
      throw new Error(`Port ${port} is already in use. Try a different port.`);
    }
    throw new Error(`Failed to start server: ${error.message}`);
  }
}