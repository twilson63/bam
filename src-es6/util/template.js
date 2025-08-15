/**
 * Template Engine Module
 * Replaces eco with EJS for template rendering
 */

import ejs from 'ejs';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

// ES6 module path resolution
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Render template using EJS
 * 
 * @param {string} name - Template name (without extension)
 * @param {Object} data - Data to pass to template
 * @returns {string} Rendered HTML
 */
export function renderTemplate(name, data = {}) {
  // Read template file (.ejs instead of .eco)
  const templatePath = join(__dirname, '..', '..', 'templates', `${name}.ejs`);
  const template = readFileSync(templatePath, 'utf8');
  
  // Render with EJS
  return ejs.render(template, data, {
    // EJS options for compatibility
    delimiter: '%',           // Use <% %> tags like eco
    openDelimiter: '<',
    closeDelimiter: '>',
    strict: false,            // Allow undefined variables
    _with: true,              // Use with statement for simpler variable access
    localsName: 'locals',     // Name for locals object
    rmWhitespace: false,      // Preserve whitespace
    async: false              // Synchronous rendering
  });
}

/**
 * Render template from string
 * 
 * @param {string} templateString - Template content
 * @param {Object} data - Data to pass to template
 * @returns {string} Rendered HTML
 */
export function renderString(templateString, data = {}) {
  return ejs.render(templateString, data, {
    delimiter: '%',
    openDelimiter: '<',
    closeDelimiter: '>',
    strict: false,
    _with: true,
    async: false
  });
}

/**
 * Compile template for later use
 * 
 * @param {string} templateString - Template content
 * @returns {Function} Compiled template function
 */
export function compileTemplate(templateString) {
  return ejs.compile(templateString, {
    delimiter: '%',
    openDelimiter: '<',
    closeDelimiter: '>',
    strict: false,
    _with: true,
    async: false
  });
}

// Default export for backward compatibility
export default renderTemplate;