import { remove } from 'fs-extra';
import { describe, it, afterEach } from 'mocha';
import cmdNew from '../src-es6/new.js';
import cmdGen from '../src-es6/gen.js';

describe('bam gen', function() {
  // Clean up any test projects after each test
  afterEach(async function() {
    try {
      await remove('foo');
    } catch (error) {
      // Ignore if directory doesn't exist
    }
  });

  it('should create and generate project', async function() {
    this.timeout(15000); // Increase timeout for file operations
    
    // First create a new project
    await cmdNew('foo');
    
    // Then generate the static site
    await cmdGen('foo');
    
    // Test should pass if no error is thrown
  });
});