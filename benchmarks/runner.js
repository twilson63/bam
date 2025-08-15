#!/usr/bin/env node
/**
 * BAM Performance Benchmark Runner
 * Compares performance between CoffeeScript, ES6, and Bun implementations
 */

import { spawn } from 'child_process';
import { writeFileSync, mkdirSync, existsSync, rmSync } from 'fs';
import { join } from 'path';
import { performance } from 'perf_hooks';

const BENCHMARK_DIR = process.cwd();
const RESULTS_DIR = join(BENCHMARK_DIR, 'results');
const DATA_DIR = join(BENCHMARK_DIR, 'data');

// Ensure directories exist
if (!existsSync(RESULTS_DIR)) {
  mkdirSync(RESULTS_DIR, { recursive: true });
}
if (!existsSync(DATA_DIR)) {
  mkdirSync(DATA_DIR, { recursive: true });
}

class BenchmarkRunner {
  constructor() {
    this.results = {
      timestamp: new Date().toISOString(),
      system: {
        platform: process.platform,
        arch: process.arch,
        nodeVersion: process.version,
        bunVersion: null // Will be detected
      },
      benchmarks: {}
    };
  }

  async detectBunVersion() {
    try {
      const { stdout } = await this.runCommand('bun', ['--version']);
      this.results.system.bunVersion = stdout.trim();
    } catch (error) {
      this.results.system.bunVersion = 'Not available';
    }
  }

  runCommand(command, args, options = {}) {
    return new Promise((resolve, reject) => {
      const proc = spawn(command, args, { 
        stdio: 'pipe',
        shell: true,
        ...options 
      });
      
      let stdout = '';
      let stderr = '';
      
      proc.stdout.on('data', (data) => {
        stdout += data.toString();
      });
      
      proc.stderr.on('data', (data) => {
        stderr += data.toString();
      });
      
      proc.on('close', (code) => {
        if (code === 0) {
          resolve({ stdout, stderr, code });
        } else {
          reject(new Error(`Command failed with code ${code}: ${stderr}`));
        }
      });
      
      proc.on('error', reject);
    });
  }

  async setupTestProject(name, template = 'skeleton') {
    const projectDir = join(DATA_DIR, name);
    
    // Clean existing project
    if (existsSync(projectDir)) {
      rmSync(projectDir, { recursive: true, force: true });
    }
    
    mkdirSync(projectDir, { recursive: true });
    process.chdir(projectDir);
    
    return projectDir;
  }

  async benchmarkProjectCreation() {
    console.log('\\n📁 Benchmarking project creation...');
    
    const templates = ['skeleton', 'bootstrap', 'reveal'];
    const results = {};
    
    for (const template of templates) {
      console.log(`  Testing ${template} template...`);
      results[template] = {};
      
      // Test ES6 implementation
      try {
        const projectDir = await this.setupTestProject(`es6-${template}`);
        const startTime = performance.now();
        
        await this.runCommand('node', [
          join(BENCHMARK_DIR, '../src-es6/index.js'),
          'new',
          'test-project',
          template
        ], { cwd: projectDir });
        
        const endTime = performance.now();
        results[template].es6 = endTime - startTime;
        console.log(`    ES6: ${results[template].es6.toFixed(2)}ms`);
      } catch (error) {
        console.error(`    ES6 failed: ${error.message}`);
        results[template].es6 = null;
      }
      
      // Test Bun implementation
      try {
        const projectDir = await this.setupTestProject(`bun-${template}`);
        const startTime = performance.now();
        
        await this.runCommand('bun', [
          join(BENCHMARK_DIR, '../bun/cli.js'),
          'new',
          'test-project',
          template
        ], { cwd: projectDir });
        
        const endTime = performance.now();
        results[template].bun = endTime - startTime;
        console.log(`    Bun: ${results[template].bun.toFixed(2)}ms`);
      } catch (error) {
        console.error(`    Bun failed: ${error.message}`);
        results[template].bun = null;
      }
      
      // Test CoffeeScript implementation (if available)
      try {
        const projectDir = await this.setupTestProject(`coffee-${template}`);
        const startTime = performance.now();
        
        await this.runCommand('node', [
          join(BENCHMARK_DIR, '../lib/index.js'),
          'new',
          'test-project',
          template
        ], { cwd: projectDir });
        
        const endTime = performance.now();
        results[template].coffee = endTime - startTime;
        console.log(`    CoffeeScript: ${results[template].coffee.toFixed(2)}ms`);
      } catch (error) {
        console.error(`    CoffeeScript failed: ${error.message}`);
        results[template].coffee = null;
      }
    }
    
    this.results.benchmarks.projectCreation = results;
  }

  async benchmarkSiteGeneration() {
    console.log('\\n🏗️  Benchmarking site generation...');
    
    const testCases = [
      { name: 'small', pages: 10, assets: 5 },
      { name: 'medium', pages: 50, assets: 20 },
      { name: 'large', pages: 200, assets: 50 }
    ];
    
    const results = {};
    
    for (const testCase of testCases) {
      console.log(`  Testing ${testCase.name} site (${testCase.pages} pages, ${testCase.assets} assets)...`);
      results[testCase.name] = {};
      
      // Create test content
      const createTestContent = async (projectDir) => {
        // Create pages
        mkdirSync(join(projectDir, 'test-project', 'pages'), { recursive: true });
        for (let i = 0; i < testCase.pages; i++) {
          const content = `# Page ${i}\\n\\nThis is page ${i} with some **markdown** content.\\n\\n## Section\\n\\n- Item 1\\n- Item 2\\n- Item 3`;
          writeFileSync(join(projectDir, 'test-project', 'pages', `page${i}.md`), content);
        }
        
        // Create assets
        mkdirSync(join(projectDir, 'test-project', 'css'), { recursive: true });
        for (let i = 0; i < testCase.assets; i++) {
          const css = `.class${i} { color: #${i.toString(16).padStart(6, '0')}; margin: ${i}px; }`;
          writeFileSync(join(projectDir, 'test-project', 'css', `style${i}.css`), css);
        }
      };
      
      // Test ES6 implementation
      try {
        const projectDir = await this.setupTestProject(`es6-gen-${testCase.name}`);
        await this.runCommand('node', [
          join(BENCHMARK_DIR, '../src-es6/index.js'),
          'new',
          'test-project',
          'skeleton'
        ], { cwd: projectDir });
        
        await createTestContent(projectDir);
        
        const startTime = performance.now();
        await this.runCommand('node', [
          join(BENCHMARK_DIR, '../src-es6/index.js'),
          'gen'
        ], { cwd: join(projectDir, 'test-project') });
        
        const endTime = performance.now();
        results[testCase.name].es6 = endTime - startTime;
        console.log(`    ES6: ${results[testCase.name].es6.toFixed(2)}ms`);
      } catch (error) {
        console.error(`    ES6 failed: ${error.message}`);
        results[testCase.name].es6 = null;
      }
      
      // Test Bun implementation
      try {
        const projectDir = await this.setupTestProject(`bun-gen-${testCase.name}`);
        await this.runCommand('bun', [
          join(BENCHMARK_DIR, '../bun/cli.js'),
          'new',
          'test-project',
          'skeleton'
        ], { cwd: projectDir });
        
        await createTestContent(projectDir);
        
        const startTime = performance.now();
        await this.runCommand('bun', [
          join(BENCHMARK_DIR, '../bun/cli.js'),
          'gen'
        ], { cwd: join(projectDir, 'test-project') });
        
        const endTime = performance.now();
        results[testCase.name].bun = endTime - startTime;
        console.log(`    Bun: ${results[testCase.name].bun.toFixed(2)}ms`);
      } catch (error) {
        console.error(`    Bun failed: ${error.message}`);
        results[testCase.name].bun = null;
      }
    }
    
    this.results.benchmarks.siteGeneration = results;
  }

  async benchmarkFileProcessing() {
    console.log('\\n📄 Benchmarking file processing...');
    
    const testCases = [
      { name: 'markdown', ext: 'md', content: '# Large Markdown\\n\\n' + 'Line of content\\n'.repeat(1000) },
      { name: 'html', ext: 'html', content: '<h1>Large HTML</h1>\\n' + '<p>Paragraph</p>\\n'.repeat(1000) },
      { name: 'mixed', files: 100, content: 'Mixed content test' }
    ];
    
    const results = {};
    
    for (const testCase of testCases) {
      console.log(`  Testing ${testCase.name} processing...`);
      results[testCase.name] = {};
      
      // Create large test files for each implementation to process
      const createLargeContent = async (projectDir) => {
        mkdirSync(join(projectDir, 'test-project', 'pages'), { recursive: true });
        
        if (testCase.name === 'mixed') {
          for (let i = 0; i < testCase.files; i++) {
            const ext = i % 3 === 0 ? 'md' : (i % 3 === 1 ? 'html' : 'md');
            const content = `# File ${i}\\n\\nContent for file ${i}.`;
            writeFileSync(join(projectDir, 'test-project', 'pages', `file${i}.${ext}`), content);
          }
        } else {
          writeFileSync(join(projectDir, 'test-project', 'pages', `large.${testCase.ext}`), testCase.content);
        }
      };
      
      // Test each implementation
      const implementations = [
        { name: 'es6', cmd: 'node', script: '../src-es6/index.js' },
        { name: 'bun', cmd: 'bun', script: '../bun/cli.js' }
      ];
      
      for (const impl of implementations) {
        try {
          const projectDir = await this.setupTestProject(`${impl.name}-proc-${testCase.name}`);
          await this.runCommand(impl.cmd, [
            join(BENCHMARK_DIR, impl.script),
            'new',
            'test-project',
            'skeleton'
          ], { cwd: projectDir });
          
          await createLargeContent(projectDir);
          
          const startTime = performance.now();
          await this.runCommand(impl.cmd, [
            join(BENCHMARK_DIR, impl.script),
            'gen'
          ], { cwd: join(projectDir, 'test-project') });
          
          const endTime = performance.now();
          results[testCase.name][impl.name] = endTime - startTime;
          console.log(`    ${impl.name}: ${results[testCase.name][impl.name].toFixed(2)}ms`);
        } catch (error) {
          console.error(`    ${impl.name} failed: ${error.message}`);
          results[testCase.name][impl.name] = null;
        }
      }
    }
    
    this.results.benchmarks.fileProcessing = results;
  }

  generateReport() {
    console.log('\\n📊 Generating performance report...');
    
    const reportData = {
      ...this.results,
      summary: this.calculateSummary()
    };
    
    // Save JSON report
    const jsonFile = join(RESULTS_DIR, `benchmark-${Date.now()}.json`);
    writeFileSync(jsonFile, JSON.stringify(reportData, null, 2));
    
    // Save human-readable report
    const textFile = join(RESULTS_DIR, `benchmark-${Date.now()}.txt`);
    writeFileSync(textFile, this.generateTextReport(reportData));
    
    console.log(`Reports saved to:`);
    console.log(`  JSON: ${jsonFile}`);
    console.log(`  Text: ${textFile}`);
    
    return reportData;
  }

  calculateSummary() {
    const summary = {
      winner: { es6: 0, bun: 0, coffee: 0 },
      averageSpeedup: {},
      recommendations: []
    };
    
    // Calculate winners and speedup
    Object.values(this.results.benchmarks).forEach(category => {
      Object.values(category).forEach(test => {
        if (test.es6 && test.bun) {
          if (test.bun < test.es6) {
            summary.winner.bun++;
            const speedup = (test.es6 / test.bun).toFixed(2);
            if (!summary.averageSpeedup.bunOverEs6) summary.averageSpeedup.bunOverEs6 = [];
            summary.averageSpeedup.bunOverEs6.push(parseFloat(speedup));
          } else {
            summary.winner.es6++;
          }
        }
        
        if (test.coffee && test.es6) {
          if (test.es6 < test.coffee) {
            summary.winner.es6++;
          } else {
            summary.winner.coffee++;
          }
        }
      });
    });
    
    // Calculate average speedups
    if (summary.averageSpeedup.bunOverEs6) {
      const avg = summary.averageSpeedup.bunOverEs6.reduce((a, b) => a + b, 0) / summary.averageSpeedup.bunOverEs6.length;
      summary.averageSpeedup.bunOverEs6 = avg.toFixed(2);
    }
    
    // Generate recommendations
    if (summary.winner.bun > summary.winner.es6) {
      summary.recommendations.push('Bun shows significant performance improvements over Node.js ES6');
    }
    if (summary.winner.es6 > summary.winner.coffee) {
      summary.recommendations.push('ES6 implementation outperforms CoffeeScript version');
    }
    
    return summary;
  }

  generateTextReport(data) {
    let report = `BAM Performance Benchmark Report\\n`;
    report += `Generated: ${data.timestamp}\\n`;
    report += `System: ${data.system.platform} ${data.system.arch}\\n`;
    report += `Node.js: ${data.system.nodeVersion}\\n`;
    report += `Bun: ${data.system.bunVersion}\\n\\n`;
    
    report += `=== BENCHMARK RESULTS ===\\n\\n`;
    
    Object.entries(data.benchmarks).forEach(([category, tests]) => {
      report += `${category.toUpperCase()}:\\n`;
      Object.entries(tests).forEach(([test, results]) => {
        report += `  ${test}:\\n`;
        if (results.es6) report += `    ES6: ${results.es6.toFixed(2)}ms\\n`;
        if (results.bun) report += `    Bun: ${results.bun.toFixed(2)}ms\\n`;
        if (results.coffee) report += `    CoffeeScript: ${results.coffee.toFixed(2)}ms\\n`;
        
        if (results.es6 && results.bun) {
          const speedup = results.es6 / results.bun;
          report += `    Speedup (Bun vs ES6): ${speedup.toFixed(2)}x\\n`;
        }
        report += `\\n`;
      });
      report += `\\n`;
    });
    
    if (data.summary) {
      report += `=== SUMMARY ===\\n`;
      report += `Winners: ES6 (${data.summary.winner.es6}), Bun (${data.summary.winner.bun}), CoffeeScript (${data.summary.winner.coffee})\\n`;
      if (data.summary.averageSpeedup.bunOverEs6) {
        report += `Average Bun speedup over ES6: ${data.summary.averageSpeedup.bunOverEs6}x\\n`;
      }
      report += `\\nRecommendations:\\n`;
      data.summary.recommendations.forEach(rec => {
        report += `- ${rec}\\n`;
      });
    }
    
    return report;
  }

  async run() {
    console.log('🚀 Starting BAM performance benchmarks...');
    
    await this.detectBunVersion();
    console.log(`System: ${this.results.system.platform} ${this.results.system.arch}`);
    console.log(`Node.js: ${this.results.system.nodeVersion}`);
    console.log(`Bun: ${this.results.system.bunVersion}`);
    
    try {
      await this.benchmarkProjectCreation();
      await this.benchmarkSiteGeneration();
      await this.benchmarkFileProcessing();
      
      const report = this.generateReport();
      
      console.log('\\n✅ Benchmarks completed successfully!');
      console.log('\\n🏆 Quick Summary:');
      if (report.summary) {
        console.log(`Winners: ES6 (${report.summary.winner.es6}), Bun (${report.summary.winner.bun}), CoffeeScript (${report.summary.winner.coffee})`);
        if (report.summary.averageSpeedup.bunOverEs6) {
          console.log(`Average Bun speedup: ${report.summary.averageSpeedup.bunOverEs6}x faster than ES6`);
        }
      }
      
    } catch (error) {
      console.error('❌ Benchmark failed:', error.message);
      process.exit(1);
    }
  }
}

// Run benchmarks if called directly
if (import.meta.main) {
  const runner = new BenchmarkRunner();
  runner.run().catch(console.error);
}

export default BenchmarkRunner;