#Requires -Version 3.0

<#
.SYNOPSIS
    BAM Installation Script for Windows PowerShell
.DESCRIPTION
    Universal PowerShell installer for BAM static site generator.
    Supports automatic platform detection, version management, and secure installation.
.PARAMETER Version
    Specific version to install (default: latest)
.PARAMETER InstallDir
    Custom installation directory
.PARAMETER Force
    Force reinstall even if already installed
.PARAMETER DryRun
    Show what would be installed without installing
.PARAMETER Uninstall
    Remove BAM installation
.PARAMETER Verbose
    Enable verbose output
.PARAMETER SkipChecksum
    Skip checksum verification (not recommended)
.PARAMETER Offline
    Use offline mode (requires local files)
.PARAMETER Help
    Show help information
.EXAMPLE
    # Install latest version
    iex ((New-Object System.Net.WebClient).DownloadString('https://raw.githubusercontent.com/twilson63/bam/master/scripts/install.ps1'))
.EXAMPLE
    # Install specific version
    iex "& { $(irm https://raw.githubusercontent.com/twilson63/bam/master/scripts/install.ps1) } -Version 1.0.0"
.EXAMPLE
    # Install to custom directory
    iex "& { $(irm https://raw.githubusercontent.com/twilson63/bam/master/scripts/install.ps1) } -InstallDir C:\Tools"
#>

param(
    [string]$Version = "latest",
    [string]$InstallDir = "",
    [switch]$Force = $false,
    [switch]$DryRun = $false,
    [switch]$Uninstall = $false,
    [switch]$Verbose = $false,
    [switch]$SkipChecksum = $false,
    [switch]$Offline = $false,
    [switch]$Help = $false
)

# Script metadata
$ScriptVersion = "1.0.0"
$GitHubRepo = "twilson63/bam"
$GitHubReleasesUrl = "https://github.com/$GitHubRepo/releases"
$ChecksumUrlBase = "https://github.com/$GitHubRepo/releases/download"

# Global variables
$script:IsElevated = $false
$script:DetectedArch = ""
$script:BinaryName = ""
$script:ExecutableName = "bam.exe"

# Color configuration
$Colors = @{
    Red     = [ConsoleColor]::Red
    Green   = [ConsoleColor]::Green
    Yellow  = [ConsoleColor]::Yellow
    Blue    = [ConsoleColor]::Blue
    Magenta = [ConsoleColor]::Magenta
    Cyan    = [ConsoleColor]::Cyan
    White   = [ConsoleColor]::White
}

# Utility functions
function Write-ColoredText {
    param(
        [string]$Message,
        [ConsoleColor]$Color = [ConsoleColor]::White,
        [switch]$NoNewline
    )
    
    $originalColor = $Host.UI.RawUI.ForegroundColor
    try {
        $Host.UI.RawUI.ForegroundColor = $Color
        if ($NoNewline) {
            Write-Host $Message -NoNewline
        } else {
            Write-Host $Message
        }
    } finally {
        $Host.UI.RawUI.ForegroundColor = $originalColor
    }
}

function Write-Log {
    param([string]$Message)
    Write-ColoredText "[INFO] $Message" -Color $Colors.Blue
}

function Write-LogVerbose {
    param([string]$Message)
    if ($Verbose) {
        Write-ColoredText "[DEBUG] $Message" -Color $Colors.Cyan
    }
}

function Write-LogSuccess {
    param([string]$Message)
    Write-ColoredText "[SUCCESS] $Message" -Color $Colors.Green
}

function Write-LogWarning {
    param([string]$Message)
    Write-ColoredText "[WARNING] $Message" -Color $Colors.Yellow
}

function Write-LogError {
    param([string]$Message)
    Write-ColoredText "[ERROR] $Message" -Color $Colors.Red
}

function Write-Fatal {
    param([string]$Message)
    Write-LogError $Message
    exit 1
}

function Show-Progress {
    param([string]$Message)
    Write-ColoredText "[PROGRESS] $Message..." -Color $Colors.Magenta -NoNewline
}

function Complete-Progress {
    Write-ColoredText " Done" -Color $Colors.Green
}

# Help function
function Show-Help {
    $helpText = @"
BAM Installation Script for Windows PowerShell v$ScriptVersion

USAGE:
    # Simple installation (run as Administrator for system-wide install)
    iex ((New-Object System.Net.WebClient).DownloadString('https://raw.githubusercontent.com/$GitHubRepo/master/scripts/install.ps1'))
    
    # Or using Invoke-RestMethod (PowerShell 3.0+)
    iex (irm https://raw.githubusercontent.com/$GitHubRepo/master/scripts/install.ps1)

PARAMETERS:
    -Version <version>      Install specific version (default: latest)
    -InstallDir <path>      Custom installation directory
    -Force                  Force reinstall even if already installed
    -DryRun                 Show what would be installed without installing
    -Uninstall              Remove BAM installation
    -Verbose                Enable verbose output
    -SkipChecksum           Skip checksum verification (not recommended)
    -Offline                Use offline mode (requires local files)
    -Help                   Show this help message

EXAMPLES:
    # Install latest version
    iex (irm https://raw.githubusercontent.com/$GitHubRepo/master/scripts/install.ps1)

    # Install specific version
    iex "& { `$(irm https://raw.githubusercontent.com/$GitHubRepo/master/scripts/install.ps1) } -Version 1.0.0"

    # Install to custom directory
    iex "& { `$(irm https://raw.githubusercontent.com/$GitHubRepo/master/scripts/install.ps1) } -InstallDir C:\Tools"

    # Dry run to see what would happen
    iex "& { `$(irm https://raw.githubusercontent.com/$GitHubRepo/master/scripts/install.ps1) } -DryRun"

    # Uninstall BAM
    iex "& { `$(irm https://raw.githubusercontent.com/$GitHubRepo/master/scripts/install.ps1) } -Uninstall"

INSTALLATION DIRECTORIES:
    The script will attempt to install to the first suitable directory:
    1. C:\Program Files\BAM (if running as Administrator)
    2. `$env:LOCALAPPDATA\Programs\BAM (current user)
    3. Custom directory specified with -InstallDir

    The installation directory will be added to your PATH automatically.

SECURITY:
    All downloads use HTTPS and verify checksums by default.
    Run PowerShell as Administrator for system-wide installation.
    Use -SkipChecksum only if you understand the security implications.

PLATFORM SUPPORT:
    - Windows x64 (native)
    - Windows on ARM64 (emulated x64)

"@
    Write-Host $helpText
}

# Check if running as Administrator
function Test-IsElevated {
    $currentUser = [Security.Principal.WindowsIdentity]::GetCurrent()
    $principal = New-Object Security.Principal.WindowsPrincipal($currentUser)
    return $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
}

# Detect platform and architecture
function Get-PlatformInfo {
    Write-LogVerbose "Detecting platform and architecture..."
    
    $arch = if ([Environment]::Is64BitOperatingSystem) { "x64" } else { "x86" }
    
    # Note: We only support x64 for now, even on ARM64 systems (emulation)
    if ($arch -ne "x64") {
        Write-Fatal "Unsupported architecture: $arch. Only x64 is supported."
    }
    
    $script:DetectedArch = $arch
    $script:BinaryName = "bam-windows-$arch.exe"
    
    Write-LogVerbose "Detected platform: windows-$arch"
    Write-LogVerbose "Binary name: $script:BinaryName"
}

# Get latest version from GitHub API
function Get-LatestVersion {
    if ($Offline) {
        Write-Fatal "Cannot determine latest version in offline mode. Please specify -Version."
    }
    
    Write-LogVerbose "Fetching latest version from GitHub API..."
    
    $apiUrl = "https://api.github.com/repos/$GitHubRepo/releases/latest"
    
    try {
        $release = Invoke-RestMethod -Uri $apiUrl -ErrorAction Stop
        $latestVersion = $release.tag_name -replace '^v', ''
        
        Write-LogVerbose "Latest version: $latestVersion"
        return $latestVersion
    }
    catch {
        Write-Fatal "Failed to fetch version information: $($_.Exception.Message)"
    }
}

# Determine installation directory
function Get-InstallDirectory {
    if ($InstallDir) {
        Write-LogVerbose "Using specified install directory: $InstallDir"
        return $InstallDir
    }
    
    $script:IsElevated = Test-IsElevated
    
    if ($script:IsElevated) {
        $dir = "${env:ProgramFiles}\BAM"
        Write-LogVerbose "Running as Administrator, using system directory: $dir"
    } else {
        $dir = "${env:LOCALAPPDATA}\Programs\BAM"
        Write-LogVerbose "Running as user, using user directory: $dir"
    }
    
    return $dir
}

# Check if BAM is already installed
function Test-ExistingInstallation {
    $bamPath = Get-Command "bam" -ErrorAction SilentlyContinue
    
    if ($bamPath) {
        $existingVersion = ""
        try {
            $versionOutput = & $bamPath.Source --version 2>$null
            if ($versionOutput -match '(\d+\.\d+\.\d+)') {
                $existingVersion = $matches[1]
            }
        }
        catch {
            $existingVersion = "unknown"
        }
        
        if (-not $Force) {
            Write-Log "BAM is already installed at: $($bamPath.Source)"
            if ($existingVersion) {
                Write-Log "Existing version: $existingVersion"
            }
            Write-Log "Use -Force to reinstall or -Uninstall to remove"
            exit 0
        } else {
            Write-LogWarning "BAM already installed at $($bamPath.Source), but -Force specified"
            if ($existingVersion) {
                Write-Log "Existing version: $existingVersion"
            }
        }
    }
}

# Download file with progress
function Invoke-FileDownload {
    param(
        [string]$Url,
        [string]$OutputPath,
        [string]$Description
    )
    
    Show-Progress "Downloading $Description"
    
    try {
        if ($Verbose) {
            # Show progress bar for verbose mode
            Invoke-WebRequest -Uri $Url -OutFile $OutputPath -UseBasicParsing
        } else {
            # Silent download
            $webClient = New-Object System.Net.WebClient
            $webClient.DownloadFile($Url, $OutputPath)
            $webClient.Dispose()
        }
        Complete-Progress
    }
    catch {
        Complete-Progress
        Write-Fatal "Failed to download $Description`: $($_.Exception.Message)"
    }
}

# Verify checksum
function Test-Checksum {
    param(
        [string]$FilePath,
        [string]$ExpectedChecksum
    )
    
    if ($SkipChecksum) {
        Write-LogWarning "Skipping checksum verification"
        return $true
    }
    
    if (-not $ExpectedChecksum) {
        Write-LogWarning "No checksum available for verification"
        return $true
    }
    
    Show-Progress "Verifying checksum"
    
    try {
        $actualChecksum = (Get-FileHash -Path $FilePath -Algorithm SHA256).Hash.ToLower()
        $expectedLower = $ExpectedChecksum.ToLower()
        
        if ($actualChecksum -eq $expectedLower) {
            Complete-Progress
            Write-LogVerbose "Checksum verification passed"
            return $true
        } else {
            Complete-Progress
            Write-LogError "Checksum verification failed!"
            Write-LogError "Expected: $expectedLower"
            Write-LogError "Actual:   $actualChecksum"
            return $false
        }
    }
    catch {
        Complete-Progress
        Write-LogWarning "Checksum verification failed: $($_.Exception.Message)"
        return $false
    }
}

# Get checksum for binary
function Get-BinaryChecksum {
    param(
        [string]$Version,
        [string]$BinaryName
    )
    
    if ($Offline -or $SkipChecksum) {
        return ""
    }
    
    $checksumUrl = "$ChecksumUrlBase/v$Version/checksums.txt"
    
    Write-LogVerbose "Fetching checksums from: $checksumUrl"
    
    try {
        $checksums = Invoke-RestMethod -Uri $checksumUrl -ErrorAction Stop
        
        # Extract checksum for our binary
        $lines = $checksums -split "`n"
        foreach ($line in $lines) {
            if ($line -match "^([a-fA-F0-9]+)\s+$([regex]::Escape($BinaryName))") {
                $checksum = $matches[1]
                Write-LogVerbose "Found checksum for $BinaryName`: $checksum"
                return $checksum
            }
        }
        
        Write-LogWarning "No checksum found for $BinaryName"
        return ""
    }
    catch {
        Write-LogWarning "Could not fetch checksums file: $($_.Exception.Message)"
        return ""
    }
}

# Add directory to PATH
function Add-ToPath {
    param([string]$Directory)
    
    $currentPath = [Environment]::GetEnvironmentVariable("PATH", "User")
    
    if ($currentPath -split ';' -contains $Directory) {
        Write-LogVerbose "Directory already in user PATH: $Directory"
        return
    }
    
    Write-LogVerbose "Adding to user PATH: $Directory"
    
    try {
        $newPath = if ($currentPath) { "$currentPath;$Directory" } else { $Directory }
        [Environment]::SetEnvironmentVariable("PATH", $newPath, "User")
        
        # Update current session PATH
        $env:PATH = "$env:PATH;$Directory"
        
        Write-LogSuccess "Added $Directory to your PATH"
        Write-Log "Restart your terminal or PowerShell session to use BAM from anywhere"
    }
    catch {
        Write-LogWarning "Failed to update PATH automatically: $($_.Exception.Message)"
        Write-Log "Please add $Directory to your PATH manually"
    }
}

# Install BAM
function Install-Bam {
    Write-ColoredText "Installing BAM v$Version..." -Color $Colors.White
    
    # Resolve version
    if ($Version -eq "latest") {
        $script:Version = Get-LatestVersion
        Write-Log "Latest version: $script:Version"
    }
    
    # Get installation directory
    $installDir = Get-InstallDirectory
    
    # Construct download URL
    $downloadUrl = "$GitHubReleasesUrl/download/v$script:Version/$script:BinaryName"
    Write-LogVerbose "Download URL: $downloadUrl"
    
    # Create temporary file
    $tempFile = [System.IO.Path]::GetTempFileName()
    $tempFile = [System.IO.Path]::ChangeExtension($tempFile, ".exe")
    
    try {
        if ($DryRun) {
            Write-ColoredText "[DRY RUN] Would download: $downloadUrl" -Color $Colors.Yellow
            Write-ColoredText "[DRY RUN] Would install to: $installDir\$script:ExecutableName" -Color $Colors.Yellow
            return
        }
        
        # Download binary
        if (-not $Offline) {
            Invoke-FileDownload -Url $downloadUrl -OutputPath $tempFile -Description "BAM v$script:Version"
            
            # Get and verify checksum
            $expectedChecksum = Get-BinaryChecksum -Version $script:Version -BinaryName $script:BinaryName
            
            if ($expectedChecksum -and -not (Test-Checksum -FilePath $tempFile -ExpectedChecksum $expectedChecksum)) {
                Write-Fatal "Checksum verification failed. Installation aborted for security."
            }
        } else {
            # Offline mode - look for local file
            if (-not (Test-Path $script:BinaryName)) {
                Write-Fatal "Offline mode enabled but $script:BinaryName not found in current directory"
            }
            Copy-Item $script:BinaryName $tempFile
            Write-Log "Using local file: $script:BinaryName"
        }
        
        # Verify downloaded file
        if (-not (Test-Path $tempFile)) {
            Write-Fatal "Downloaded file not found or corrupted"
        }
        
        # Install binary
        Show-Progress "Installing to $installDir"
        
        # Create installation directory
        if (-not (Test-Path $installDir)) {
            New-Item -ItemType Directory -Path $installDir -Force | Out-Null
        }
        
        # Copy binary
        $installPath = Join-Path $installDir $script:ExecutableName
        Copy-Item $tempFile $installPath -Force
        
        Complete-Progress
        
        # Verify installation
        if (Test-Path $installPath) {
            $installedVersion = ""
            try {
                $versionOutput = & $installPath --version 2>$null
                if ($versionOutput -match '(\d+\.\d+\.\d+)') {
                    $installedVersion = $matches[1]
                }
            }
            catch {
                # Version check failed, but file exists
            }
            
            Write-LogSuccess "BAM v$script:Version installed successfully!"
            Write-Log "Installed to: $installPath"
            
            if ($installedVersion) {
                Write-Log "Verified version: $installedVersion"
            }
            
            # Add to PATH
            Add-ToPath -Directory $installDir
            
            # Show usage information
            Show-UsageInfo
        } else {
            Write-Fatal "Installation verification failed"
        }
    }
    finally {
        # Cleanup
        if (Test-Path $tempFile) {
            Remove-Item $tempFile -Force -ErrorAction SilentlyContinue
        }
    }
}

# Show usage information
function Show-UsageInfo {
    Write-Host ""
    Write-ColoredText "Getting Started with BAM:" -Color $Colors.White
    Write-Host ""
    Write-Host "1. Create a new project:"
    Write-ColoredText "   bam new my-site" -Color $Colors.Green
    Write-Host "                 # Create with skeleton template"
    Write-ColoredText "   bam new my-site bootstrap" -Color $Colors.Green
    Write-Host "       # Create with Bootstrap template"
    Write-Host ""
    Write-Host "2. Navigate to your project and start development:"
    Write-ColoredText "   cd my-site" -Color $Colors.Green
    Write-ColoredText "   bam run" -Color $Colors.Green
    Write-Host "                         # Start development server"
    Write-Host ""
    Write-Host "3. Generate your static site:"
    Write-ColoredText "   bam gen" -Color $Colors.Green
    Write-Host "                         # Generate to ./gen directory"
    Write-ColoredText "   bam serve" -Color $Colors.Green
    Write-Host "                       # Serve generated site"
    Write-Host ""
    Write-Host "For more information:"
    Write-ColoredText "   bam --help" -Color $Colors.Green
    Write-Host "                      # Show all commands"
    Write-Host "   Visit: " -NoNewline
    Write-ColoredText "https://github.com/$GitHubRepo" -Color $Colors.Cyan
    Write-Host ""
}

# Uninstall BAM
function Uninstall-Bam {
    Write-ColoredText "Uninstalling BAM..." -Color $Colors.White
    
    $bamPath = Get-Command "bam" -ErrorAction SilentlyContinue
    
    if ($bamPath) {
        if ($DryRun) {
            Write-ColoredText "[DRY RUN] Would remove: $($bamPath.Source)" -Color $Colors.Yellow
            return
        }
        
        Show-Progress "Removing BAM from $($bamPath.Source)"
        
        try {
            Remove-Item $bamPath.Source -Force
            Complete-Progress
            Write-LogSuccess "BAM uninstalled successfully!"
            
            # Note: We don't automatically remove from PATH as it might affect other tools
            Write-Log "Note: The installation directory may still be in your PATH"
        }
        catch {
            Complete-Progress
            Write-LogError "Failed to remove $($bamPath.Source): $($_.Exception.Message)"
            Write-Log "You may need to run PowerShell as Administrator or remove manually"
            exit 1
        }
    } else {
        Write-Log "BAM is not installed or not in PATH"
        exit 1
    }
}

# Main function
function Main {
    Write-ColoredText "BAM Installation Script for Windows PowerShell v$ScriptVersion" -Color $Colors.White
    Write-Host "GitHub Repository: " -NoNewline
    Write-ColoredText "https://github.com/$GitHubRepo" -Color $Colors.Cyan
    Write-Host ""
    
    # Show help if requested
    if ($Help) {
        Show-Help
        return
    }
    
    # Handle uninstall
    if ($Uninstall) {
        Uninstall-Bam
        return
    }
    
    # Detect platform
    Get-PlatformInfo
    
    # Check existing installation
    Test-ExistingInstallation
    
    # Install BAM
    Install-Bam
}

# Error handling
trap {
    Write-LogError "An unexpected error occurred: $($_.Exception.Message)"
    Write-LogError "Stack trace: $($_.ScriptStackTrace)"
    exit 1
}

# Run main function
Main