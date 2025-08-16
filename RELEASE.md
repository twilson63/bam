# Creating a Release for BAM

This guide explains how to create a release with pre-built binaries for all platforms.

## Automatic Release Creation

### Method 1: Using GitHub Actions (Recommended)

1. Go to the [Actions tab](https://github.com/twilson63/bam/actions) in the repository
2. Click on "Build BAM (Bun-optimized)" workflow
3. Click "Run workflow" button
4. Select the branch (usually `master` or `main`)
5. Check the "Create a new release" checkbox
6. Click "Run workflow"

The workflow will:
- Build binaries for all platforms
- Run tests
- Create distribution packages
- Automatically create a GitHub release with all binaries attached

### Method 2: Manual Release with Tag

1. Create and push a tag:
```bash
git tag v2.0.0
git push origin v2.0.0
```

2. Go to [GitHub Releases](https://github.com/twilson63/bam/releases)
3. Click "Draft a new release"
4. Choose the tag you just created
5. Click "Publish release"

The workflow will automatically trigger and attach binaries to your release.

## Manual Release Creation

### Prerequisites
- Bun installed locally
- Access to all target platforms (or use GitHub Actions)

### Build Binaries Locally

1. **Build all platforms** (if you have access to runners):
```bash
cd bun
bun run build
```

2. **Generate checksums**:
```bash
./scripts/generate-checksums.sh dist/
```

3. **Create release on GitHub**:
   - Go to [Releases](https://github.com/twilson63/bam/releases)
   - Click "Draft a new release"
   - Choose a tag (create new or use existing)
   - Add release title and notes
   - Upload binaries from `dist/` directory
   - Upload `checksums.txt`
   - Publish release

## Release Checklist

Before creating a release:

- [ ] All tests passing
- [ ] Version number updated in `package.json`
- [ ] CHANGELOG updated
- [ ] Documentation updated
- [ ] PR merged to main branch

## Binary Naming Convention

Binaries should follow this naming pattern:
- `bam-macos-x64` - macOS Intel
- `bam-macos-arm64` - macOS Apple Silicon
- `bam-linux-x64` - Linux 64-bit
- `bam-windows-x64.exe` - Windows 64-bit

## After Release

Once a release is created:

1. **Test installation**:
```bash
curl -fsSL https://raw.githubusercontent.com/twilson63/bam/master/scripts/install.sh | sh
```

2. **Update installation docs** if needed

3. **Announce the release** (optional):
   - Twitter/X
   - Discord/Slack
   - Blog post

## Troubleshooting

### Workflow not creating release?

The workflow only creates releases when:
- Triggered by a release event, OR
- Manually dispatched with "create_release" = true

### Binaries not attached?

Check that the build jobs completed successfully. You can manually download artifacts from the workflow run and attach them to the release.

### Installation script not finding release?

The install script looks for the "latest" release. Make sure:
- The release is not marked as "pre-release"
- The release is published (not draft)
- Binary names match the expected pattern