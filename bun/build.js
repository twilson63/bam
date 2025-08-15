#!/usr/bin/env bun
/**
 * BAM Build Script - Creates executable binaries for multiple platforms
 * Uses Bun's native compilation features for maximum performance
 */

import { existsSync, mkdirSync, rmSync, writeFileSync } from "fs";
import { resolve, join } from "path";
import { $ } from "bun";

// Build configuration
const BUILD_CONFIG = {
  entrypoint: "./cli.js",
  outputDir: "./dist",
  name: "bam",
  platforms: [
    {
      target: "darwin-x64",
      suffix: "-macos-x64",
      description: "macOS Intel"
    },
    {
      target: "darwin-arm64", 
      suffix: "-macos-arm64",
      description: "macOS Apple Silicon"
    },
    {
      target: "linux-x64",
      suffix: "-linux-x64",
      description: "Linux x64"
    },
    {
      target: "linux-arm64",
      suffix: "-linux-arm64",
      description: "Linux ARM64"
    },
    {
      target: "windows-x64",
      suffix: "-windows-x64.exe",
      description: "Windows x64"
    }
  ]
};

/**
 * Clean build directory
 */
async function cleanBuildDir() {
  const { outputDir } = BUILD_CONFIG;
  
  if (existsSync(outputDir)) {
    console.log("🧹 Cleaning build directory...");
    rmSync(outputDir, { recursive: true, force: true });
  }
  
  mkdirSync(outputDir, { recursive: true });
}

/**
 * Create build info file
 */
async function createBuildInfo() {
  const buildInfo = {
    name: "BAM (Bun-optimized)",
    version: "0.9.2-bun",
    buildTime: new Date().toISOString(),
    bunVersion: Bun.version,
    platforms: BUILD_CONFIG.platforms.map(p => ({
      target: p.target,
      description: p.description
    }))
  };
  
  const buildInfoPath = join(BUILD_CONFIG.outputDir, "build-info.json");
  writeFileSync(buildInfoPath, JSON.stringify(buildInfo, null, 2));
  console.log("📋 Created build info");
}

/**
 * Build executable for specific platform
 */
async function buildPlatform(platform) {
  const { target, suffix, description } = platform;
  const outputName = `${BUILD_CONFIG.name}${suffix}`;
  const outputPath = join(BUILD_CONFIG.outputDir, outputName);
  
  console.log(`🔨 Building for ${description} (${target})...`);
  
  try {
    // Use Bun's build command
    const result = await $`bun build ${BUILD_CONFIG.entrypoint} --compile --target=${target} --outfile=${outputPath}`.quiet();
    
    if (result.exitCode === 0) {
      console.log(`✅ Built ${outputName}`);
      return { success: true, outputPath, platform: description };
    } else {
      console.error(`❌ Failed to build ${outputName}`);
      console.error(result.stderr?.toString() || "Unknown error");
      return { success: false, platform: description, error: result.stderr?.toString() };
    }
  } catch (error) {
    console.error(`❌ Build error for ${description}:`, error.message);
    return { success: false, platform: description, error: error.message };
  }
}

/**
 * Build all platforms
 */
async function buildAllPlatforms() {
  console.log(`🚀 Building ${BUILD_CONFIG.name} for all platforms...\n`);
  
  const results = [];
  
  for (const platform of BUILD_CONFIG.platforms) {
    const result = await buildPlatform(platform);
    results.push(result);
  }
  
  return results;
}

/**
 * Generate installation script
 */
async function generateInstallScript() {
  const installScript = `#!/bin/bash
# BAM (Bun-optimized) Installation Script

set -e

# Detect platform
OS="$(uname -s)"
ARCH="$(uname -m)"

case "\${OS}" in
  Darwin*)
    if [[ "\${ARCH}" == "arm64" ]]; then
      PLATFORM="macos-arm64"
    else
      PLATFORM="macos-x64"
    fi
    BINARY_NAME="bam-\${PLATFORM}"
    ;;
  Linux*)
    if [[ "\${ARCH}" == "aarch64" || "\${ARCH}" == "arm64" ]]; then
      PLATFORM="linux-arm64"
    else
      PLATFORM="linux-x64"
    fi
    BINARY_NAME="bam-\${PLATFORM}"
    ;;
  MINGW*|MSYS*|CYGWIN*)
    PLATFORM="windows-x64"
    BINARY_NAME="bam-\${PLATFORM}.exe"
    ;;
  *)
    echo "Unsupported operating system: \${OS}"
    exit 1
    ;;
esac

echo "Installing BAM for \${PLATFORM}..."

# Install directory
INSTALL_DIR="/usr/local/bin"
if [[ ! -w "\${INSTALL_DIR}" ]]; then
  INSTALL_DIR="\${HOME}/.local/bin"
  mkdir -p "\${INSTALL_DIR}"
fi

# Download and install
if [[ -f "\${BINARY_NAME}" ]]; then
  cp "\${BINARY_NAME}" "\${INSTALL_DIR}/bam"
  chmod +x "\${INSTALL_DIR}/bam"
  echo "✅ BAM installed to \${INSTALL_DIR}/bam"
  echo "Make sure \${INSTALL_DIR} is in your PATH"
else
  echo "❌ Binary \${BINARY_NAME} not found"
  echo "Available binaries:"
  ls -la bam-*
  exit 1
fi
`;
  
  const installPath = join(BUILD_CONFIG.outputDir, "install.sh");
  writeFileSync(installPath, installScript);
  
  // Make install script executable
  await $`chmod +x ${installPath}`.quiet();
  
  console.log("📜 Generated install.sh script");
}

/**
 * Generate PowerShell install script for Windows
 */
async function generateWindowsInstallScript() {
  const installScript = `# BAM (Bun-optimized) Windows Installation Script

$ErrorActionPreference = "Stop"

Write-Host "Installing BAM for Windows..."

$BinaryName = "bam-windows-x64.exe"
$InstallDir = "$env:LOCALAPPDATA\\Programs\\BAM"
$BinaryPath = "$InstallDir\\bam.exe"

# Create install directory
if (!(Test-Path $InstallDir)) {
    New-Item -ItemType Directory -Path $InstallDir -Force | Out-Null
}

# Copy binary
if (Test-Path $BinaryName) {
    Copy-Item $BinaryName $BinaryPath -Force
    Write-Host "✅ BAM installed to $BinaryPath"
    
    # Add to PATH if not already there
    $UserPath = [Environment]::GetEnvironmentVariable("PATH", "User")
    if ($UserPath -notlike "*$InstallDir*") {
        [Environment]::SetEnvironmentVariable("PATH", "$UserPath;$InstallDir", "User")
        Write-Host "📝 Added $InstallDir to user PATH"
        Write-Host "⚠️  Please restart your terminal or run: refreshenv"
    }
} else {
    Write-Host "❌ Binary $BinaryName not found"
    Write-Host "Available binaries:"
    Get-ChildItem bam-*
    exit 1
}
`;
  
  const installPath = join(BUILD_CONFIG.outputDir, "install.ps1");
  writeFileSync(installPath, installScript);
  console.log("📜 Generated install.ps1 script");
}

/**
 * Print build summary
 */
function printSummary(results) {
  console.log("\n📊 Build Summary:");
  console.log("================");
  
  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);
  
  if (successful.length > 0) {
    console.log("\n✅ Successful builds:");
    successful.forEach(r => {
      console.log(`  - ${r.platform}`);
    });
  }
  
  if (failed.length > 0) {
    console.log("\n❌ Failed builds:");
    failed.forEach(r => {
      console.log(`  - ${r.platform}: ${r.error}`);
    });
  }
  
  console.log(`\n📁 Output directory: ${resolve(BUILD_CONFIG.outputDir)}`);
  console.log(`🎯 Success rate: ${successful.length}/${results.length} platforms`);
}

/**
 * Main build function
 */
async function main() {
  try {
    console.log("🏗️  BAM Build System (Bun-optimized)");
    console.log(`⚡ Bun version: ${Bun.version}\n`);
    
    // Check if we're in the right directory
    if (!existsSync(BUILD_CONFIG.entrypoint)) {
      console.error(`❌ Entry point not found: ${BUILD_CONFIG.entrypoint}`);
      console.error("Make sure you're running this from the bun/ directory");
      process.exit(1);
    }
    
    // Clean and prepare
    await cleanBuildDir();
    
    // Build for all platforms
    const results = await buildAllPlatforms();
    
    // Generate additional files
    await createBuildInfo();
    await generateInstallScript();
    await generateWindowsInstallScript();
    
    // Print summary
    printSummary(results);
    
    const successful = results.filter(r => r.success);
    if (successful.length === 0) {
      console.error("\n❌ All builds failed!");
      process.exit(1);
    }
    
    console.log("\n🎉 Build completed successfully!");
    
  } catch (error) {
    console.error(`❌ Build failed: ${error.message}`);
    process.exit(1);
  }
}

// Run if executed directly
if (import.meta.main) {
  main();
}