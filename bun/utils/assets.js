/**
 * BAM Assets Utility - Bun-optimized version
 * Handles asset file management using Bun's native file APIs
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync, copyFileSync, statSync } from "fs";
import { readdirSync } from "fs";
import { join, dirname, extname, basename } from "path";

/**
 * Copy file with error handling
 */
async function copyFile(src, dest) {
  try {
    // Ensure destination directory exists
    const destDir = dirname(dest);
    if (!existsSync(destDir)) {
      mkdirSync(destDir, { recursive: true });
    }
    
    copyFileSync(src, dest);
    return true;
  } catch (error) {
    console.error(`Error copying ${src} to ${dest}:`, error.message);
    return false;
  }
}

/**
 * Recursively copy directory contents
 */
async function copyDirectory(src, dest) {
  if (!existsSync(src)) {
    console.warn(`Source directory does not exist: ${src}`);
    return;
  }

  // Create destination directory
  if (!existsSync(dest)) {
    mkdirSync(dest, { recursive: true });
  }

  const items = readdirSync(src);
  
  for (const item of items) {
    const srcPath = join(src, item);
    const destPath = join(dest, item);
    
    if (statSync(srcPath).isDirectory()) {
      await copyDirectory(srcPath, destPath);
    } else {
      await copyFile(srcPath, destPath);
    }
  }
}

/**
 * Get all asset files from standard directories
 */
function getAssetFiles() {
  const assetDirs = ["stylesheets", "images", "javascripts", "css", "img", "js"];
  const assets = [];
  
  for (const dir of assetDirs) {
    if (existsSync(dir)) {
      try {
        const files = readdirSync(dir, { withFileTypes: true });
        for (const file of files) {
          if (file.isFile()) {
            assets.push({
              source: join(dir, file.name),
              destination: join(dir, file.name),
              type: extname(file.name).slice(1) || "unknown"
            });
          }
        }
      } catch (error) {
        console.warn(`Warning: Could not read asset directory ${dir}:`, error.message);
      }
    }
  }
  
  return assets;
}

/**
 * Copy all assets to destination directory
 */
export async function copyAssets(destDir) {
  const assetDirs = ["stylesheets", "images", "javascripts", "css", "img", "js"];
  
  console.log("Copying assets...");
  
  for (const dir of assetDirs) {
    if (existsSync(dir)) {
      const destPath = join(destDir, dir);
      await copyDirectory(dir, destPath);
      console.log(`Copied ${dir}/ to ${destPath}`);
    }
  }
}

/**
 * Optimize CSS files (basic minification)
 */
export function optimizeCSS(content) {
  return content
    .replace(/\/\*[\s\S]*?\*\//g, "") // Remove comments
    .replace(/\s+/g, " ") // Collapse whitespace
    .replace(/;\s*}/g, "}") // Remove trailing semicolons
    .trim();
}

/**
 * Optimize JavaScript files (basic minification)
 */
export function optimizeJS(content) {
  return content
    .replace(/\/\*[\s\S]*?\*\//g, "") // Remove multi-line comments
    .replace(/\/\/.*$/gm, "") // Remove single-line comments
    .replace(/\s+/g, " ") // Collapse whitespace
    .trim();
}

/**
 * Process and optimize asset file
 */
export async function processAsset(filePath, destPath) {
  try {
    const ext = extname(filePath).toLowerCase();
    let content = readFileSync(filePath, "utf8");
    
    switch (ext) {
      case ".css":
        content = optimizeCSS(content);
        break;
      case ".js":
        content = optimizeJS(content);
        break;
      // For other files (images, etc.), just copy as-is
      default:
        copyFileSync(filePath, destPath);
        return;
    }
    
    // Ensure destination directory exists
    const destDir = dirname(destPath);
    if (!existsSync(destDir)) {
      mkdirSync(destDir, { recursive: true });
    }
    
    writeFileSync(destPath, content, "utf8");
    console.log(`Processed and optimized: ${basename(filePath)}`);
  } catch (error) {
    console.error(`Error processing asset ${filePath}:`, error.message);
    // Fallback to simple copy
    try {
      copyFileSync(filePath, destPath);
    } catch (copyError) {
      console.error(`Failed to copy ${filePath}:`, copyError.message);
    }
  }
}

export { getAssetFiles, copyDirectory, copyFile };