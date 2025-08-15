import { createReadStream, createWriteStream, existsSync } from 'fs';
import { pipeline } from 'stream';
import { promisify } from 'util';
import { join } from 'path';

const pipelineAsync = promisify(pipeline);

/**
 * Copy miscellaneous files from project to generated site
 * @param {string} proj - Project directory  
 * @param {string} gen - Generation directory
 */
export default async function misc(proj, gen) {
  const miscFiles = ['404.html', 'robots.txt'];
  
  for (const file of miscFiles) {
    const sourcePath = join(proj, file);
    const destPath = join(gen, file);
    
    try {
      if (existsSync(sourcePath)) {
        const readStream = createReadStream(sourcePath);
        const writeStream = createWriteStream(destPath);
        
        await pipelineAsync(readStream, writeStream);
        console.log(`Copied ${destPath}`);
      }
    } catch (error) {
      console.error(`Error copying ${file}:`, error.message);
      // Continue with other files
    }
  }
}