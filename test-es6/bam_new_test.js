import { remove } from 'fs-extra';
import { describe, it, afterEach } from 'mocha';
import cmdNew from '../src-es6/new.js';

describe('bam new', function() {
  // Clean up any test projects after each test
  afterEach(async function() {
    try {
      await remove('foo');
    } catch (error) {
      // Ignore if directory doesn't exist
    }
  });

  it('should create new project', async function() {
    this.timeout(10000); // Increase timeout for file operations
    
    await cmdNew('foo');
    // Test should pass if no error is thrown
  });

  it('should create new bootstrap project', async function() {
    this.timeout(10000);
    
    await cmdNew('foo', 'bootstrap');
    // Test should pass if no error is thrown
  });

  it('should create new pagedown project', async function() {
    this.timeout(10000);
    
    await cmdNew('foo', 'pagedown');
    // Test should pass if no error is thrown
  });
});