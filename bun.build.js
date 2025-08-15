#!/usr/bin/env bun

/**
 * Bun Build Configuration for BAM
 * Generates platform-specific executables
 */

import { $ } from "bun";

const platforms = [
  { target: "bun-darwin-x64", name: "bam-macos-x64" },
  { target: "bun-darwin-arm64", name: "bam-macos-arm64" },
  { target: "bun-linux-x64", name: "bam-linux-x64" },
  { target: "bun-linux-arm64", name: "bam-linux-arm64" },
  { target: "bun-windows-x64", name: "bam-windows-x64.exe" }
];

async function build() {
  console.log("Building BAM executables with Bun...\n");

  // Ensure dist directory exists
  await $`mkdir -p dist`;

  for (const platform of platforms) {
    console.log(`Building ${platform.name}...`);
    
    try {
      const result = await Bun.build({
        entrypoints: ["./bin/bam-es6"],
        outdir: "./dist",
        target: platform.target,
        minify: true,
        sourcemap: "none",
        define: {
          "process.env.NODE_ENV": '"production"'
        }
      });

      if (result.success) {
        // Rename output to platform-specific name
        await $`mv dist/bam-es6 dist/${platform.name}`;
        console.log(`✓ Built ${platform.name}`);
      } else {
        console.error(`✗ Failed to build ${platform.name}`);
        console.error(result.logs);
      }
    } catch (error) {
      console.error(`✗ Error building ${platform.name}:`, error.message);
    }
  }

  console.log("\n✓ Build complete! Executables in ./dist/");
}

// Alternative build using Bun's compile feature (when available)
async function compileExecutable() {
  console.log("Compiling standalone BAM executable...\n");

  try {
    // Single-file executable compilation
    await $`bun build ./bin/bam-es6 --compile --outfile dist/bam`;
    
    console.log("✓ Standalone executable created: dist/bam");
    console.log("  This is a self-contained binary with Bun runtime embedded");
  } catch (error) {
    console.error("✗ Compilation failed:", error.message);
    console.log("  Note: --compile flag requires Bun 1.0.0+");
  }
}

// Development build (no minification)
async function buildDev() {
  console.log("Building development version...\n");

  const result = await Bun.build({
    entrypoints: ["./bin/bam-es6"],
    outdir: "./dist",
    minify: false,
    sourcemap: "inline",
    define: {
      "process.env.NODE_ENV": '"development"'
    }
  });

  if (result.success) {
    console.log("✓ Development build complete: dist/bam-es6");
  } else {
    console.error("✗ Development build failed");
    console.error(result.logs);
  }
}

// Parse command line arguments
const command = process.argv[2] || "build";

switch (command) {
  case "build":
    await build();
    break;
  case "compile":
    await compileExecutable();
    break;
  case "dev":
    await buildDev();
    break;
  default:
    console.log("Usage: bun bun.build.js [build|compile|dev]");
    console.log("  build   - Build for all platforms");
    console.log("  compile - Create standalone executable");
    console.log("  dev     - Build development version");
}