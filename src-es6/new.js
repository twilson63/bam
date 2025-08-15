import { promises as fs } from 'fs';
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { copy, remove } from 'fs-extra';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import ecoRender from './util/eco.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DEBUG = process.env.NODE_ENV === 'debug';
const coreFiles = ['server.js', 'package.json', 'robots.txt', '404.html'];

/**
 * Create a new BAM project
 * @param {string} proj - Project name
 * @param {string} tmpl - Template name (skeleton, bootstrap, reveal, angular, pagedown)
 * @param {Function} cb - Callback function
 */
export default async function newCommand(proj = null, tmpl = 'skeleton', cb = null) {
  if (!proj) {
    throw new Error('Project Name Required!');
  }

  const project = proj;
  const template = tmpl || 'skeleton';

  try {
    await buildProjectFolder(project);
    await buildFiles(project, template);
    await copyAssets(project, template);
    await buildLayout(project, template);
    
    if (cb) cb(null, 'Done');
    return 'Done';
  } catch (error) {
    if (cb) cb(error);
    throw error;
  }
}

/**
 * Build project folder
 * @param {string} project - Project name
 */
async function buildProjectFolder(project) {
  if (DEBUG) console.log('Building Project Folder...');
  
  const projectPath = `./${project}`;
  
  // Remove project directory if it exists
  if (existsSync(projectPath)) {
    await remove(projectPath);
  }
  
  // Create project directory
  mkdirSync(project, { mode: 0o755 });
}

/**
 * Build core files from templates
 * @param {string} project - Project name
 * @param {string} template - Template name
 */
async function buildFiles(project, template) {
  if (DEBUG) console.log('Building Files...');
  
  for (const tmp of coreFiles) {
    try {
      const html = ecoRender(tmp, { title: project });
      writeFileSync(`./${project}/${tmp}`, html, 'utf8');
    } catch (error) {
      console.error(`Error building file ${tmp}:`, error.message);
    }
  }
}

/**
 * Build layout file
 * @param {string} project - Project name
 * @param {string} template - Template name
 */
async function buildLayout(project, template) {
  if (DEBUG) console.log('Building Layout...');
  
  try {
    const html = ecoRender(`${template}/layout.html`, { title: project });
    writeFileSync(`./${project}/layout.html`, html, 'utf8');
  } catch (error) {
    console.error('Error building layout:', error.message);
    throw error;
  }
}

/**
 * Copy assets from template to project
 * @param {string} project - Project name
 * @param {string} template - Template name
 */
async function copyAssets(project, template) {
  if (DEBUG) console.log('Copying Assets...');
  
  const assetDirs = ['images', 'javascripts', 'stylesheets', 'ico', 'img', 'js', 'css', 'pages'];
  const templatePath = join(__dirname, '..', 'templates', template);
  
  for (const dir of assetDirs) {
    const sourcePath = join(templatePath, dir);
    const destPath = `./${project}/${dir}`;
    
    try {
      if (existsSync(sourcePath)) {
        mkdirSync(destPath, { recursive: true });
        await copy(sourcePath, destPath);
        if (DEBUG) console.log(`Copied ${dir}`);
      }
    } catch (error) {
      if (DEBUG) console.log(`Error copying ${dir}:`, error.message);
    }
  }
}