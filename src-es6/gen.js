import { existsSync, mkdirSync } from 'fs';
import { remove } from 'fs-extra';
import assets from './util/assets.js';
import misc from './util/misc.js';
import Page from './util/page.js';

/**
 * Generate static site
 * @param {string} proj - Project directory (default: '.')
 * @param {Function} cb - Optional callback function
 */
export default async function genCommand(proj = '.', cb = null) {
  const genPath = `${proj}/gen`;

  try {
    // Remove gen directory if it exists
    if (existsSync(genPath)) {
      await remove(genPath);
    }
    
    // Create gen directory
    mkdirSync(genPath, { recursive: true });
    
    // Generate all pages
    const page = new Page();
    await page.generateAll(genPath, proj);
    
    // Copy assets
    await assets(proj, genPath);
    
    // Copy miscellaneous files
    await misc(proj, genPath);

    if (cb) cb(null, 'success');
    return 'success';
    
  } catch (error) {
    console.error('Error generating static site:', error.message);
    if (cb) cb(error);
    throw error;
  }
}