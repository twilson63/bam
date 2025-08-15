import { mkdirSync, existsSync } from 'fs';
import { copy } from 'fs-extra';
import { join } from 'path';

/**
 * Copy asset directories from project to generated site
 * @param {string} proj - Project directory
 * @param {string} gen - Generation directory
 */
export default async function assets(proj, gen) {
  const assetDirs = ['images', 'javascripts', 'stylesheets', 'ico', 'img', 'js', 'css'];
  
  for (const dir of assetDirs) {
    const sourcePath = join(proj, dir);
    const destPath = join(gen, dir);
    
    try {
      if (existsSync(sourcePath)) {
        mkdirSync(destPath, { recursive: true });
        await copy(sourcePath, destPath);
        console.log(`Copied ${destPath}`);
      }
    } catch (error) {
      console.error(`Error copying ${dir}:`, error.message);
      // Continue with other directories
    }
  }
}