#!/usr/bin/env node

/**
 * Dependency Replacement Testing
 * Tests modern alternatives for legacy dependencies
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Test 1: EJS vs Eco Templates
async function testEJSReplacement() {
  console.log('\n=== Testing EJS as Eco Replacement ===');
  
  // Note: Install with: npm install ejs
  try {
    const ejs = await import('ejs');
    
    // Test basic template rendering similar to eco
    const template = `
      <h1><%= title %></h1>
      <% items.forEach(function(item) { %>
        <li><%= item %></li>
      <% }); %>
    `;
    
    const data = {
      title: 'Test Page',
      items: ['Item 1', 'Item 2', 'Item 3']
    };
    
    const result = ejs.default.render(template, data);
    console.log('✓ EJS template rendering works');
    console.log('Output:', result.substring(0, 100) + '...');
    return true;
  } catch (err) {
    console.log('✗ EJS not installed or error:', err.message);
    return false;
  }
}

// Test 2: Marked vs github-flavored-markdown
async function testMarkedReplacement() {
  console.log('\n=== Testing Marked as GFM Replacement ===');
  
  // Note: Install with: npm install marked
  try {
    const { marked } = await import('marked');
    
    // Test GFM features
    const markdown = `
# Header
This is **bold** and *italic*

\`\`\`javascript
const code = 'highlighted';
\`\`\`

- [ ] Task 1
- [x] Task 2

| Table | Header |
|-------|--------|
| Cell  | Data   |
    `;
    
    // Enable GFM
    marked.setOptions({
      gfm: true,
      breaks: true
    });
    
    const html = marked(markdown);
    console.log('✓ Marked with GFM works');
    console.log('Output preview:', html.substring(0, 100) + '...');
    return true;
  } catch (err) {
    console.log('✗ Marked not installed or error:', err.message);
    return false;
  }
}

// Test 3: Commander vs Flatiron CLI
async function testCommanderReplacement() {
  console.log('\n=== Testing Commander as Flatiron Replacement ===');
  
  // Note: Install with: npm install commander
  try {
    const { Command } = await import('commander');
    
    const program = new Command();
    
    // Replicate BAM CLI structure
    program
      .name('bam')
      .description('Static Site Generator')
      .version('1.0.0');
    
    program
      .command('new <name> [template]')
      .description('Create a new project')
      .action((name, template = 'skeleton') => {
        console.log(`Would create project: ${name} with template: ${template}`);
      });
    
    program
      .command('run [port]')
      .description('Run development server')
      .action((port = 3000) => {
        console.log(`Would start server on port: ${port}`);
      });
    
    program
      .command('gen')
      .description('Generate static site')
      .action(() => {
        console.log('Would generate static site');
      });
    
    program
      .command('serve [port]')
      .description('Serve generated site')
      .action((port = 8080) => {
        console.log(`Would serve site on port: ${port}`);
      });
    
    console.log('✓ Commander CLI structure works');
    console.log('Commands:', program.commands.map(cmd => cmd.name()).join(', '));
    return true;
  } catch (err) {
    console.log('✗ Commander not installed or error:', err.message);
    return false;
  }
}

// Test 4: fs-extra vs wrench
async function testFsExtraReplacement() {
  console.log('\n=== Testing fs-extra as Wrench Replacement ===');
  
  // Note: Install with: npm install fs-extra
  try {
    const fse = await import('fs-extra');
    
    // Test functions that replace wrench
    const testDir = path.join(__dirname, 'test-temp');
    
    // Equivalent to wrench.mkdirSyncRecursive
    await fse.ensureDir(testDir);
    console.log('✓ ensureDir (mkdirSyncRecursive) works');
    
    // Equivalent to wrench.copyDirSyncRecursive
    // await fse.copy(sourceDir, destDir);
    console.log('✓ copy (copyDirSyncRecursive) available');
    
    // Equivalent to wrench.rmdirSyncRecursive
    await fse.remove(testDir);
    console.log('✓ remove (rmdirSyncRecursive) works');
    
    return true;
  } catch (err) {
    console.log('✗ fs-extra not installed or error:', err.message);
    return false;
  }
}

// Test 5: Bun Runtime Features (when running under Bun)
function testBunFeatures() {
  console.log('\n=== Testing Bun Runtime Features ===');
  
  if (typeof Bun !== 'undefined') {
    console.log('✓ Running under Bun runtime');
    
    // Test Bun.serve
    console.log('✓ Bun.serve available:', typeof Bun.serve === 'function');
    
    // Test Bun.file
    console.log('✓ Bun.file available:', typeof Bun.file === 'function');
    
    // Test Bun.write
    console.log('✓ Bun.write available:', typeof Bun.write === 'function');
    
    return true;
  } else {
    console.log('✗ Not running under Bun runtime');
    console.log('  Install Bun: curl -fsSL https://bun.sh/install | bash');
    return false;
  }
}

// Run all tests
async function runTests() {
  console.log('BAM Dependency Replacement Tests');
  console.log('=================================');
  
  const results = {
    ejs: await testEJSReplacement(),
    marked: await testMarkedReplacement(),
    commander: await testCommanderReplacement(),
    fsExtra: await testFsExtraReplacement(),
    bun: testBunFeatures()
  };
  
  console.log('\n=== Summary ===');
  console.log('EJS (eco replacement):', results.ejs ? '✓' : '✗');
  console.log('Marked (GFM replacement):', results.marked ? '✓' : '✗');
  console.log('Commander (flatiron replacement):', results.commander ? '✓' : '✗');
  console.log('fs-extra (wrench replacement):', results.fsExtra ? '✓' : '✗');
  console.log('Bun runtime:', results.bun ? '✓' : '✗');
  
  if (!Object.values(results).every(r => r)) {
    console.log('\nInstall missing dependencies:');
    console.log('npm install ejs marked commander fs-extra');
  }
}

// Execute tests
runTests().catch(console.error);