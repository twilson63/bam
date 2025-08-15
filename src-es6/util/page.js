import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync, statSync } from 'fs';
import { marked } from 'marked';
import ejs from 'ejs';
import { join, extname, basename } from 'path';
import zekeInit from './zeke.js';

/**
 * Get all files recursively from a directory
 * @param {string} dir - Directory path
 * @returns {Array<string>} Array of file paths
 */
function readdirSyncRecursive(dir) {
  const results = [];
  
  try {
    const list = readdirSync(dir);
    
    list.forEach(file => {
      const filePath = join(dir, file);
      const stat = statSync(filePath);
      
      if (stat && stat.isDirectory()) {
        results.push(...readdirSyncRecursive(filePath).map(f => join(file, f)));
      } else {
        results.push(file);
      }
    });
  } catch (error) {
    // Directory doesn't exist or can't be read
    return [];
  }
  
  return results;
}

/**
 * Render template with body content
 * @param {string} proj - Project directory
 * @param {string} body - Body content
 * @returns {string} Rendered HTML
 */
function renderTemplate(proj = '.', body = '') {
  try {
    const template = readFileSync(join(proj, 'layout.html'), 'utf8');
    return ejs.render(template, { body });
  } catch (error) {
    console.error('Error rendering template:', error.message);
    throw error;
  }
}

/**
 * Page class for handling different page types
 */
export default class Page {
  constructor(pathname = '') {
    this.pathname = pathname;
    this.pages = [];
    this.ext = null;
    
    // Try to read pages directory
    if (existsSync('pages')) {
      this.pages = readdirSyncRecursive('pages');
      
      // Find extension for the requested pathname
      if (pathname && pathname !== '') {
        for (const page of this.pages) {
          const pagePathname = '/' + page.split('.')[0];
          if (pagePathname === pathname) {
            this.ext = extname(page).substring(1); // Remove leading dot
            break;
          }
        }
      }
    }
  }

  /**
   * Render Markdown content
   * @returns {string} Rendered HTML
   */
  markdown() {
    try {
      const content = readFileSync(`./pages${this.pathname}.md`, 'utf8');
      return marked(content);
    } catch (error) {
      console.error(`Error reading markdown file: ${this.pathname}.md`, error.message);
      throw error;
    }
  }

  /**
   * Render HTML content
   * @returns {string} HTML content
   */
  html() {
    try {
      return readFileSync(`./pages${this.pathname}.html`, 'utf8');
    } catch (error) {
      console.error(`Error reading HTML file: ${this.pathname}.html`, error.message);
      throw error;
    }
  }

  /**
   * Render CoffeeScript content using Zeke
   * @returns {string} Rendered HTML
   */
  coffee() {
    try {
      const content = readFileSync(`./pages${this.pathname}.coffee`, 'utf8');
      const zeke = zekeInit();
      return zeke.render(content);
    } catch (error) {
      console.error(`Error rendering CoffeeScript file: ${this.pathname}.coffee`, error.message);
      throw error;
    }
  }

  /**
   * Render page based on file extension
   * @returns {Promise<string>} Rendered HTML
   */
  async render() {
    let body;
    
    try {
      switch (this.ext) {
        case 'coffee':
          body = this.coffee();
          break;
        case 'md':
          body = this.markdown();
          break;
        default:
          body = this.html();
      }
      
      return renderTemplate('.', body);
    } catch (error) {
      console.error('Error rendering page:', error.message);
      throw error;
    }
  }

  /**
   * Build individual page
   * @param {string} body - Page content
   * @param {string} page - Page filename
   * @param {string} gen - Generation directory
   */
  build(body, page, gen) {
    const name = basename(page, extname(page));
    
    if (body === 'DIR') {
      mkdirSync(join(gen, name), { recursive: true });
    } else {
      const fullName = `${name}.html`;
      writeFileSync(join(gen, fullName), body, 'utf8');
    }
  }

  /**
   * Generate HTML for all pages
   * @param {string} dest - Destination directory
   * @param {string} proj - Project directory
   */
  async generateAll(dest, proj = '.') {
    this.proj = proj;
    console.log('Processing pages:', this.pages);
    
    for (const page of this.pages) {
      const [name, ext] = page.split('.');
      this.pathname = `/${page}`;
      this.ext = ext;
      
      let body;
      try {
        if (ext) {
          body = await this.render();
        } else {
          body = 'DIR';
        }
        
        this.build(body, page, dest);
      } catch (error) {
        console.error(`Error processing page ${page}:`, error.message);
        // Continue with other pages
      }
    }
  }
}