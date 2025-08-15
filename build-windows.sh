#!/bin/bash
# BAM Windows Build Script
# Builds native Windows binaries using Bun (cross-platform)

set -e

echo "🪟 Building BAM for Windows..."

# Check if Bun is installed
if ! command -v bun &> /dev/null; then
    echo "❌ Bun is not installed. Please install Bun first:"
    echo "curl -fsSL https://bun.sh/install | bash"
    exit 1
fi

echo "⚡ Using Bun $(bun --version)"

# Navigate to bun directory
cd "$(dirname "$0")/bun"

# Install dependencies
echo "📦 Installing dependencies..."
bun install

# Clean previous builds
echo "🧹 Cleaning previous builds..."
rm -rf dist

# Build for Windows
echo "🔨 Building for Windows x64..."
bun build cli.js --compile --target=windows-x64 --outfile=dist/bam-windows-x64.exe

# Verify the build
if [[ -f "dist/bam-windows-x64.exe" ]]; then
    echo "✅ Windows binary created successfully"
    ls -la dist/bam-windows-x64.exe
else
    echo "❌ Windows build failed"
    exit 1
fi

# Create Windows installer script (PowerShell)
cat > dist/install-windows.ps1 << 'EOF'
# BAM Windows Installation Script
# Run this script in PowerShell as Administrator

param(
    [switch]$AllUsers = $false
)

$ErrorActionPreference = "Stop"

Write-Host "🪟 Installing BAM for Windows..." -ForegroundColor Green

$BinaryName = "bam-windows-x64.exe"

if (-not (Test-Path $BinaryName)) {
    Write-Host "❌ Binary $BinaryName not found in current directory" -ForegroundColor Red
    Write-Host "Make sure you're running this script from the directory containing the BAM executable" -ForegroundColor Yellow
    exit 1
}

# Determine installation directory
if ($AllUsers) {
    $InstallDir = "$env:ProgramFiles\BAM"
    Write-Host "📁 Installing for all users to: $InstallDir" -ForegroundColor Cyan
} else {
    $InstallDir = "$env:LOCALAPPDATA\Programs\BAM"
    Write-Host "📁 Installing for current user to: $InstallDir" -ForegroundColor Cyan
}

# Create installation directory
if (-not (Test-Path $InstallDir)) {
    New-Item -ItemType Directory -Path $InstallDir -Force | Out-Null
    Write-Host "✅ Created installation directory" -ForegroundColor Green
}

# Copy binary
$BinaryPath = Join-Path $InstallDir "bam.exe"
Copy-Item $BinaryName $BinaryPath -Force
Write-Host "✅ Copied BAM executable to $BinaryPath" -ForegroundColor Green

# Add to PATH
$PathScope = if ($AllUsers) { "Machine" } else { "User" }
$CurrentPath = [Environment]::GetEnvironmentVariable("PATH", $PathScope)

if ($CurrentPath -notlike "*$InstallDir*") {
    $NewPath = "$CurrentPath;$InstallDir"
    [Environment]::SetEnvironmentVariable("PATH", $NewPath, $PathScope)
    Write-Host "✅ Added $InstallDir to $PathScope PATH" -ForegroundColor Green
    Write-Host "⚠️  Please restart your terminal or run: refreshenv" -ForegroundColor Yellow
} else {
    Write-Host "ℹ️  $InstallDir is already in PATH" -ForegroundColor Blue
}

# Create Start Menu shortcut (for all users installation)
if ($AllUsers) {
    $StartMenuPath = "$env:ProgramData\Microsoft\Windows\Start Menu\Programs"
    $ShortcutPath = Join-Path $StartMenuPath "BAM Static Site Generator.lnk"
    
    $WshShell = New-Object -ComObject WScript.Shell
    $Shortcut = $WshShell.CreateShortcut($ShortcutPath)
    $Shortcut.TargetPath = "cmd.exe"
    $Shortcut.Arguments = "/k `"cd /d %USERPROFILE% && $BinaryPath --help`""
    $Shortcut.Description = "BAM Static Site Generator"
    $Shortcut.IconLocation = "$env:SystemRoot\System32\cmd.exe,0"
    $Shortcut.Save()
    
    Write-Host "✅ Created Start Menu shortcut" -ForegroundColor Green
}

Write-Host ""
Write-Host "🎉 Installation completed successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "To get started:" -ForegroundColor Cyan
Write-Host "  1. Open a new terminal/PowerShell window" -ForegroundColor White
Write-Host "  2. Run: bam --help" -ForegroundColor White
Write-Host ""
Write-Host "If 'bam' command is not found, restart your terminal or run: refreshenv" -ForegroundColor Yellow
EOF

# Create batch file installer (alternative)
cat > dist/install-windows.bat << 'EOF'
@echo off
setlocal enabledelayedexpansion

echo 🪟 Installing BAM for Windows...

set "BINARY_NAME=bam-windows-x64.exe"

if not exist "%BINARY_NAME%" (
    echo ❌ Binary %BINARY_NAME% not found in current directory
    echo Make sure you're running this script from the directory containing the BAM executable
    pause
    exit /b 1
)

set "INSTALL_DIR=%LOCALAPPDATA%\Programs\BAM"
echo 📁 Installing to: %INSTALL_DIR%

if not exist "%INSTALL_DIR%" (
    mkdir "%INSTALL_DIR%"
    echo ✅ Created installation directory
)

copy "%BINARY_NAME%" "%INSTALL_DIR%\bam.exe" > nul
echo ✅ Copied BAM executable

:: Add to PATH
set "CURRENT_PATH="
for /f "tokens=2*" %%A in ('reg query "HKEY_CURRENT_USER\Environment" /v PATH 2^>nul') do set "CURRENT_PATH=%%B"

echo !CURRENT_PATH! | find /i "%INSTALL_DIR%" > nul
if errorlevel 1 (
    if defined CURRENT_PATH (
        set "NEW_PATH=!CURRENT_PATH!;%INSTALL_DIR%"
    ) else (
        set "NEW_PATH=%INSTALL_DIR%"
    )
    reg add "HKEY_CURRENT_USER\Environment" /v PATH /t REG_EXPAND_SZ /d "!NEW_PATH!" /f > nul
    echo ✅ Added %INSTALL_DIR% to user PATH
    echo ⚠️  Please restart your command prompt
) else (
    echo ℹ️  %INSTALL_DIR% is already in PATH
)

echo.
echo 🎉 Installation completed successfully!
echo.
echo To get started:
echo   1. Open a new command prompt
echo   2. Run: bam --help
echo.
pause
EOF

# Create Chocolatey package spec (nuspec)
cat > dist/bam.nuspec << 'EOF'
<?xml version="1.0" encoding="utf-8"?>
<package xmlns="http://schemas.microsoft.com/packaging/2015/06/nuspec.xsd">
  <metadata>
    <id>bam-static-generator</id>
    <version>0.9.2-bun</version>
    <packageSourceUrl>https://github.com/beautifulnode/bam</packageSourceUrl>
    <owners>beautifulnode</owners>
    <title>BAM Static Site Generator (Bun-optimized)</title>
    <authors>Tom Wilson</authors>
    <projectUrl>http://www.usebam.com</projectUrl>
    <iconUrl>https://raw.githubusercontent.com/beautifulnode/bam/master/icon.png</iconUrl>
    <copyright>2023 Tom Wilson</copyright>
    <licenseUrl>https://github.com/beautifulnode/bam/blob/master/LICENSE</licenseUrl>
    <requireLicenseAcceptance>false</requireLicenseAcceptance>
    <projectSourceUrl>https://github.com/beautifulnode/bam</projectSourceUrl>
    <docsUrl>https://github.com/beautifulnode/bam/blob/master/README.md</docsUrl>
    <bugTrackerUrl>https://github.com/beautifulnode/bam/issues</bugTrackerUrl>
    <tags>static-site-generator bun web-development cli build-tool</tags>
    <summary>The easiest static site generator on the planet, now with Bun optimization</summary>
    <description>
BAM is a static site generator that makes creating static websites incredibly easy. 
This Bun-optimized version provides lightning-fast performance with native executable distribution.

Features:
- Lightning-fast development server using Bun.serve()
- Multiple template support (Skeleton, Bootstrap, Reveal.js, etc.)
- Live reloading during development
- Optimized asset processing
- Cross-platform native executables
- Zero configuration setup
    </description>
    <releaseNotes>
- Bun-optimized version with native performance
- New Bun.serve() based development server
- Cross-platform executable builds
- Improved asset processing
- Enhanced error handling
    </releaseNotes>
  </metadata>
  <files>
    <file src="bam-windows-x64.exe" target="tools\bam.exe" />
  </files>
</package>
EOF

# Create Scoop manifest
cat > dist/bam.json << 'EOF'
{
    "version": "0.9.2-bun",
    "description": "BAM Static Site Generator (Bun-optimized) - The easiest static site generator on the planet",
    "homepage": "http://www.usebam.com",
    "license": "MIT",
    "url": "https://github.com/beautifulnode/bam/releases/download/v0.9.2-bun/bam-windows-x64.exe",
    "hash": "sha256:placeholder-hash-will-be-updated",
    "bin": "bam-windows-x64.exe",
    "suggest": {
        "Git": "git"
    },
    "checkver": {
        "github": "https://github.com/beautifulnode/bam"
    },
    "autoupdate": {
        "url": "https://github.com/beautifulnode/bam/releases/download/v$version/bam-windows-x64.exe"
    }
}
EOF

# Create WiX installer source (if WiX is available)
if command -v candle.exe &> /dev/null && command -v light.exe &> /dev/null; then
    echo "📦 Creating Windows Installer (.msi)..."
    
    cat > dist/bam-installer.wxs << 'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<Wix xmlns="http://schemas.microsoft.com/wix/2006/wi">
  <Product Id="*" Name="BAM Static Site Generator" Language="1033" 
           Version="0.9.2.0" Manufacturer="Beautiful Node" 
           UpgradeCode="12345678-1234-1234-1234-123456789012">
    
    <Package InstallerVersion="200" Compressed="yes" InstallScope="perMachine" />
    
    <MajorUpgrade DowngradeErrorMessage="A newer version of [ProductName] is already installed." />
    
    <MediaTemplate EmbedCab="yes" />
    
    <Feature Id="ProductFeature" Title="BAM" Level="1">
      <ComponentGroupRef Id="ProductComponents" />
    </Feature>
  </Product>

  <Fragment>
    <Directory Id="TARGETDIR" Name="SourceDir">
      <Directory Id="ProgramFilesFolder">
        <Directory Id="INSTALLFOLDER" Name="BAM" />
      </Directory>
    </Directory>
  </Fragment>

  <Fragment>
    <ComponentGroup Id="ProductComponents" Directory="INSTALLFOLDER">
      <Component Id="BAMExecutable" Guid="*">
        <File Id="BAMExe" Source="bam-windows-x64.exe" KeyPath="yes" Name="bam.exe" />
        <Environment Id="PATH" Name="PATH" Value="[INSTALLFOLDER]" Permanent="no" Part="last" Action="set" System="yes" />
      </Component>
    </ComponentGroup>
  </Fragment>
</Wix>
EOF
    
    # Compile installer (would need WiX toolset installed)
    # candle.exe dist/bam-installer.wxs -out dist/bam-installer.wixobj
    # light.exe dist/bam-installer.wixobj -out dist/bam-installer.msi
    
    echo "ℹ️  WiX installer source created. Run with WiX toolset to build .msi"
fi

# Print summary
echo ""
echo "🎉 Windows build completed!"
echo "📁 Output directory: $(pwd)/dist"
echo ""
echo "Built binary:"
ls -la dist/bam-windows-x64.exe 2>/dev/null || echo "No binary found"
echo ""
echo "Installation options:"
echo "  1. PowerShell (recommended): PowerShell -ExecutionPolicy Bypass -File dist/install-windows.ps1"
echo "  2. Batch file: dist/install-windows.bat"
echo "  3. Manual: Copy bam-windows-x64.exe to a directory in your PATH"
echo ""
echo "Package managers:"
echo "  - Scoop manifest: dist/bam.json"
echo "  - Chocolatey spec: dist/bam.nuspec"

cd ..

echo "✅ Windows build script completed successfully!"