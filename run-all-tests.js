#!/usr/bin/env node
/**
 * Comprehensive Test Runner for BAM
 * Runs all test suites (Bun, ES6, Benchmarks) and generates reports
 */

import { spawn } from 'child_process';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';

const RESULTS_DIR = join(process.cwd(), 'test-results');

// Ensure results directory exists
if (!existsSync(RESULTS_DIR)) {
  mkdirSync(RESULTS_DIR, { recursive: true });
}

class TestRunner {
  constructor() {
    this.results = {
      timestamp: new Date().toISOString(),
      system: {
        platform: process.platform,
        arch: process.arch,
        nodeVersion: process.version,
        bunVersion: null
      },
      testSuites: {},
      summary: {
        total: 0,
        passed: 0,
        failed: 0,
        skipped: 0,
        duration: 0
      }
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
      console.log(`Running: ${command} ${args.join(' ')}`);
      
      const proc = spawn(command, args, { 
        stdio: 'pipe',
        shell: true,
        ...options 
      });
      
      let stdout = '';
      let stderr = '';
      
      proc.stdout.on('data', (data) => {
        const output = data.toString();
        stdout += output;
        if (options.verbose) {
          process.stdout.write(output);
        }
      });
      
      proc.stderr.on('data', (data) => {
        const output = data.toString();
        stderr += output;
        if (options.verbose) {
          process.stderr.write(output);
        }
      });
      
      proc.on('close', (code) => {
        resolve({ stdout, stderr, code });
      });
      
      proc.on('error', reject);
    });
  }

  async runBunTests() {
    console.log('\\n🚀 Running Bun Tests...');
    
    try {
      const startTime = Date.now();
      const result = await this.runCommand('bun', ['test', 'test-bun/'], {
        cwd: process.cwd(),
        verbose: true
      });
      const endTime = Date.now();
      
      this.results.testSuites.bun = {
        duration: endTime - startTime,
        exitCode: result.code,
        success: result.code === 0,
        output: result.stdout,
        errors: result.stderr
      };
      
      console.log(`Bun tests ${result.code === 0 ? '✅ PASSED' : '❌ FAILED'} (${endTime - startTime}ms)`);
      
    } catch (error) {
      console.error('Bun tests failed to run:', error.message);
      this.results.testSuites.bun = {
        duration: 0,
        exitCode: -1,
        success: false,
        output: '',
        errors: error.message
      };
    }
  }

  async runES6Tests() {
    console.log('\\n🟢 Running ES6/Node.js Tests...');
    
    try {
      const startTime = Date.now();
      const result = await this.runCommand('npm', ['test'], {
        cwd: process.cwd(),
        verbose: true,
        env: { ...process.env, NODE_ENV: 'test' }
      });
      const endTime = Date.now();
      
      this.results.testSuites.es6 = {
        duration: endTime - startTime,
        exitCode: result.code,
        success: result.code === 0,
        output: result.stdout,
        errors: result.stderr
      };
      
      console.log(`ES6 tests ${result.code === 0 ? '✅ PASSED' : '❌ FAILED'} (${endTime - startTime}ms)`);
      
    } catch (error) {
      console.error('ES6 tests failed to run:', error.message);
      this.results.testSuites.es6 = {
        duration: 0,
        exitCode: -1,
        success: false,
        output: '',
        errors: error.message
      };
    }
  }

  async runLegacyTests() {
    console.log('\\n☕ Running Legacy CoffeeScript Tests...');
    
    try {
      const startTime = Date.now();
      
      // Try to run original CoffeeScript tests if available
      const result = await this.runCommand('npx', ['mocha', 'test/*.coffee'], {
        cwd: process.cwd(),
        verbose: true
      });
      const endTime = Date.now();
      
      this.results.testSuites.legacy = {
        duration: endTime - startTime,
        exitCode: result.code,
        success: result.code === 0,
        output: result.stdout,
        errors: result.stderr
      };
      
      console.log(`Legacy tests ${result.code === 0 ? '✅ PASSED' : '❌ FAILED'} (${endTime - startTime}ms)`);
      
    } catch (error) {
      console.log('Legacy tests not available or failed:', error.message);
      this.results.testSuites.legacy = {
        duration: 0,
        exitCode: -1,
        success: false,
        output: '',
        errors: 'Legacy tests not available'
      };
    }
  }

  async runBenchmarks() {
    console.log('\\n📊 Running Performance Benchmarks...');
    
    try {
      const startTime = Date.now();
      const result = await this.runCommand('node', ['benchmarks/runner.js'], {
        cwd: process.cwd(),
        verbose: true
      });
      const endTime = Date.now();
      
      this.results.testSuites.benchmarks = {
        duration: endTime - startTime,
        exitCode: result.code,
        success: result.code === 0,
        output: result.stdout,
        errors: result.stderr
      };
      
      console.log(`Benchmarks ${result.code === 0 ? '✅ COMPLETED' : '❌ FAILED'} (${endTime - startTime}ms)`);
      
    } catch (error) {
      console.error('Benchmarks failed to run:', error.message);
      this.results.testSuites.benchmarks = {
        duration: 0,
        exitCode: -1,
        success: false,
        output: '',
        errors: error.message
      };
    }
  }

  calculateSummary() {
    let totalPassed = 0;
    let totalFailed = 0;
    let totalDuration = 0;
    
    Object.values(this.results.testSuites).forEach(suite => {
      totalDuration += suite.duration;
      if (suite.success) {
        totalPassed++;
      } else {
        totalFailed++;
      }
    });
    
    this.results.summary = {
      total: totalPassed + totalFailed,
      passed: totalPassed,
      failed: totalFailed,
      skipped: 0,
      duration: totalDuration,
      successRate: totalPassed / (totalPassed + totalFailed) * 100
    };
  }

  generateReport() {
    console.log('\\n📋 Generating Test Report...');
    
    this.calculateSummary();
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    
    // Save JSON report
    const jsonFile = join(RESULTS_DIR, `test-report-${timestamp}.json`);
    writeFileSync(jsonFile, JSON.stringify(this.results, null, 2));
    
    // Generate HTML report
    const htmlFile = join(RESULTS_DIR, `test-report-${timestamp}.html`);
    writeFileSync(htmlFile, this.generateHTMLReport());
    
    // Generate text summary
    const textFile = join(RESULTS_DIR, `test-summary-${timestamp}.txt`);
    writeFileSync(textFile, this.generateTextReport());
    
    console.log(`\\nReports generated:`);
    console.log(`📄 JSON: ${jsonFile}`);
    console.log(`🌐 HTML: ${htmlFile}`);
    console.log(`📝 Text: ${textFile}`);
    
    return this.results;
  }

  generateHTMLReport() {
    const { summary, testSuites } = this.results;
    
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>BAM Test Report</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
    .container { max-width: 1200px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; }
    .header { text-align: center; margin-bottom: 30px; }
    .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px; }
    .metric { background: #f8f9fa; padding: 20px; border-radius: 8px; text-align: center; }
    .metric.success { background: #d4edda; color: #155724; }
    .metric.failure { background: #f8d7da; color: #721c24; }
    .test-suite { margin-bottom: 30px; border: 1px solid #ddd; border-radius: 8px; overflow: hidden; }
    .suite-header { background: #007acc; color: white; padding: 15px; font-weight: bold; }
    .suite-content { padding: 15px; }
    .status { display: inline-block; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold; }
    .status.success { background: #28a745; color: white; }
    .status.failure { background: #dc3545; color: white; }
    .output { background: #f8f9fa; padding: 10px; border-radius: 4px; font-family: monospace; font-size: 12px; max-height: 300px; overflow-y: auto; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>BAM Test Report</h1>
      <p>Generated: ${this.results.timestamp}</p>
      <p>Platform: ${this.results.system.platform} ${this.results.system.arch}</p>
      <p>Node.js: ${this.results.system.nodeVersion} | Bun: ${this.results.system.bunVersion}</p>
    </div>
    
    <div class="summary">
      <div class="metric ${summary.passed > summary.failed ? 'success' : 'failure'}">
        <h3>Total Suites</h3>
        <div style="font-size: 2em;">${summary.total}</div>
      </div>
      <div class="metric success">
        <h3>Passed</h3>
        <div style="font-size: 2em;">${summary.passed}</div>
      </div>
      <div class="metric ${summary.failed > 0 ? 'failure' : ''}">
        <h3>Failed</h3>
        <div style="font-size: 2em;">${summary.failed}</div>
      </div>
      <div class="metric">
        <h3>Duration</h3>
        <div style="font-size: 2em;">${(summary.duration / 1000).toFixed(1)}s</div>
      </div>
      <div class="metric ${summary.successRate > 80 ? 'success' : 'failure'}">
        <h3>Success Rate</h3>
        <div style="font-size: 2em;">${summary.successRate.toFixed(1)}%</div>
      </div>
    </div>
    
    ${Object.entries(testSuites).map(([name, suite]) => `
      <div class="test-suite">
        <div class="suite-header">
          ${name.toUpperCase()} Tests
          <span class="status ${suite.success ? 'success' : 'failure'}">
            ${suite.success ? 'PASSED' : 'FAILED'}
          </span>
          <span style="float: right;">${suite.duration}ms</span>
        </div>
        <div class="suite-content">
          ${suite.errors && suite.errors.trim() ? `
            <h4>Errors:</h4>
            <div class="output">${suite.errors.replace(/\\n/g, '<br>')}</div>
          ` : ''}
          ${suite.output && suite.output.trim() ? `
            <h4>Output:</h4>
            <div class="output">${suite.output.replace(/\\n/g, '<br>')}</div>
          ` : ''}
        </div>
      </div>
    `).join('')}
  </div>
</body>
</html>`;
  }

  generateTextReport() {
    const { summary, testSuites } = this.results;
    
    let report = `BAM TEST REPORT\\n`;
    report += `===============\\n\\n`;
    report += `Generated: ${this.results.timestamp}\\n`;
    report += `Platform: ${this.results.system.platform} ${this.results.system.arch}\\n`;
    report += `Node.js: ${this.results.system.nodeVersion}\\n`;
    report += `Bun: ${this.results.system.bunVersion}\\n\\n`;
    
    report += `SUMMARY\\n`;
    report += `-------\\n`;
    report += `Total Suites: ${summary.total}\\n`;
    report += `Passed: ${summary.passed}\\n`;
    report += `Failed: ${summary.failed}\\n`;
    report += `Duration: ${(summary.duration / 1000).toFixed(1)}s\\n`;
    report += `Success Rate: ${summary.successRate.toFixed(1)}%\\n\\n`;
    
    report += `DETAILED RESULTS\\n`;
    report += `================\\n\\n`;
    
    Object.entries(testSuites).forEach(([name, suite]) => {
      report += `${name.toUpperCase()} TESTS\\n`;
      report += `Status: ${suite.success ? 'PASSED' : 'FAILED'}\\n`;
      report += `Duration: ${suite.duration}ms\\n`;
      report += `Exit Code: ${suite.exitCode}\\n`;
      
      if (suite.errors && suite.errors.trim()) {
        report += `Errors:\\n${suite.errors}\\n`;
      }
      
      report += `\\n`;
    });
    
    return report;
  }

  async run() {
    console.log('🧪 BAM Comprehensive Test Suite');
    console.log('================================');
    
    await this.detectBunVersion();
    
    const startTime = Date.now();
    
    // Run all test suites
    await this.runBunTests();
    await this.runES6Tests();
    await this.runLegacyTests();
    await this.runBenchmarks();
    
    const endTime = Date.now();
    this.results.summary.duration = endTime - startTime;
    
    // Generate reports
    const finalResults = this.generateReport();
    
    // Print summary
    console.log('\\n🏁 Test Execution Complete!');
    console.log('============================');
    console.log(`Total Duration: ${(finalResults.summary.duration / 1000).toFixed(1)}s`);
    console.log(`Test Suites: ${finalResults.summary.total}`);
    console.log(`Passed: ${finalResults.summary.passed} ✅`);
    console.log(`Failed: ${finalResults.summary.failed} ${finalResults.summary.failed > 0 ? '❌' : '✅'}`);
    console.log(`Success Rate: ${finalResults.summary.successRate.toFixed(1)}%`);
    
    // Exit with appropriate code
    process.exit(finalResults.summary.failed > 0 ? 1 : 0);
  }
}

// Run tests if called directly
if (import.meta.main) {
  const runner = new TestRunner();
  runner.run().catch(error => {
    console.error('Test runner failed:', error);
    process.exit(1);
  });
}

export default TestRunner;