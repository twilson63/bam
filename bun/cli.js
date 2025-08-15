#!/usr/bin/env bun
/**
 * BAM - Bun-optimized Static Site Generator
 * CLI Entry Point
 */

import { parseArgs } from "util";
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

// Import commands
import newCommand from "./commands/new.js";
import runCommand from "./commands/run.js";
import genCommand from "./commands/gen.js";
import serveCommand from "./commands/serve.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Read package version
function getVersion() {
  try {
    const packagePath = join(__dirname, "package.json");
    const pkg = JSON.parse(readFileSync(packagePath, "utf8"));
    return pkg.version;
  } catch {
    return "0.9.2-bun";
  }
}

const VERSION = getVersion();

// CLI Usage information
const USAGE = `
BAM v${VERSION} (Bun-optimized)
Easiest Static Site Generator on the Planet

Usage:
  bam new [project-name] [template]    Create a new BAM project
  bam run [port]                       Run development server (default: 3000)
  bam gen                              Generate static site to ./gen
  bam serve [port]                     Serve generated static site
  bam version                          Show version
  bam help                             Show this help

Templates: skeleton (default), bootstrap, reveal, angular, pagedown

Examples:
  bam new my-site skeleton             Create new site with skeleton template
  bam run 8080                         Run dev server on port 8080
  bam gen                              Generate static files
  bam serve 8000                       Serve generated site on port 8000
`;

// Command router
const commands = {
  new: newCommand,
  run: runCommand,
  gen: genCommand,
  serve: serveCommand,
  version: () => console.log(`BAM v${VERSION} (Bun-optimized)`),
  help: () => console.log(USAGE),
};

// Parse command line arguments
function parseCliArgs() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log(USAGE);
    process.exit(0);
  }

  const command = args[0];
  const commandArgs = args.slice(1);

  return { command, args: commandArgs };
}

// Main CLI execution
async function main() {
  try {
    const { command, args } = parseCliArgs();

    // Handle special flags
    if (command === "--version" || command === "-v") {
      commands.version();
      return;
    }

    if (command === "--help" || command === "-h") {
      commands.help();
      return;
    }

    // Execute command
    const commandHandler = commands[command];
    if (!commandHandler) {
      console.error(`Unknown command: ${command}`);
      console.log("\nRun 'bam help' for usage information.");
      process.exit(1);
    }

    await commandHandler(...args);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
}

// Handle uncaught errors
process.on("uncaughtException", (error) => {
  console.error("Uncaught exception:", error.message);
  process.exit(1);
});

process.on("unhandledRejection", (reason) => {
  console.error("Unhandled rejection:", reason);
  process.exit(1);
});

// Run CLI
if (import.meta.main) {
  main();
}

export default main;