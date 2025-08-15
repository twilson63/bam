import { readFileSync } from 'fs';
import { marked } from 'marked';

/**
 * Simple Zeke-like CoffeeScript to HTML compiler
 * This is a basic implementation that handles common CoffeeScript HTML generation patterns
 */
class ZekeCompiler {
  constructor() {
    this.initialized = false;
    this.modules = new Map();
    this.helpers = new Map();
  }

  /**
   * Initialize the compiler
   */
  init() {
    if (this.initialized) return this;
    
    // Add default modules
    this.addModule('fs', 'fs');
    
    // Add default helpers
    this.helpers.set('get', (path) => {
      try {
        return readFileSync(path, 'utf8');
      } catch (error) {
        console.error(`Error reading file ${path}:`, error.message);
        return '';
      }
    });
    
    this.helpers.set('escape', (html) => {
      return html.replace(/</g, '&lt;').replace(/>/g, '&gt;');
    });
    
    this.helpers.set('jpg2', (name) => {
      return `<img src="http://${name}.jpg.to" style="max-height: 90%;max-width:90%" />`;
    });
    
    this.initialized = true;
    return this;
  }

  /**
   * Add a module to the compiler
   * @param {string} name - Module name
   * @param {string} path - Module path or actual module
   */
  addModule(name, path) {
    this.modules.set(name, path);
    return this;
  }

  /**
   * Use a plugin (simplified version)
   * @param {Object|Function} plugin - Plugin object or function
   */
  use(plugin) {
    if (typeof plugin === 'function') {
      plugin.call(this);
    } else if (plugin && typeof plugin.attach === 'function') {
      plugin.attach.call(this);
    }
    return this;
  }

  /**
   * Render CoffeeScript content to HTML
   * @param {string} content - CoffeeScript content
   * @returns {string} Rendered HTML
   */
  render(content) {
    if (!this.initialized) {
      this.init();
    }

    try {
      // This is a very basic implementation
      // In a real implementation, you'd parse and compile CoffeeScript
      // For now, we'll handle some common patterns manually
      
      // Convert basic CoffeeScript HTML patterns to HTML
      let html = content;
      
      // Handle simple div/section/h1 patterns
      html = html.replace(/(\s*)div\s+['"]([^'"]*)['"]\s*,\s*->/g, '$1<div class="$2">');
      html = html.replace(/(\s*)section\s+->/g, '$1<section>');
      html = html.replace(/(\s*)h1\s+['"]([^'"]*)['"]/g, '$1<h1>$2</h1>');
      html = html.replace(/(\s*)center\s+->/g, '$1<center>');
      html = html.replace(/(\s*)li\s+->/g, '$1<li>');
      html = html.replace(/(\s*)a\s+href:\s*['"]([^'"]*)['"]\s*,\s*['"]([^'"]*)['"]/g, '$1<a href="$2">$3</a>');
      
      // Handle img tags
      html = html.replace(/(\s*)img\s+src:\s*['"]([^'"]*)['"]\s*,?\s*style:\s*['"]([^'"]*)['"]/g, '$1<img src="$2" style="$3" />');
      
      // Handle helpers
      for (const [name, helper] of this.helpers.entries()) {
        const regex = new RegExp(`${name}\\s*\\(['"]([^'"]*)['"]\)`, 'g');
        html = html.replace(regex, (match, arg) => {
          try {
            return helper(arg);
          } catch (error) {
            console.error(`Error executing helper ${name}:`, error.message);
            return match;
          }
        });
      }
      
      // Close any unclosed div/section tags (basic implementation)
      const openTags = html.match(/<(div|section|center|li)[^>]*>/g) || [];
      const closeTags = html.match(/<\/(div|section|center|li)>/g) || [];
      
      if (openTags.length > closeTags.length) {
        for (let i = closeTags.length; i < openTags.length; i++) {
          const tag = openTags[i].match(/<(\w+)/)[1];
          html += `</${tag}>`;
        }
      }
      
      return html;
      
    } catch (error) {
      console.error('Error rendering CoffeeScript content:', error.message);
      return `<p>Error rendering content: ${error.message}</p>`;
    }
  }
}

/**
 * Initialize and return a Zeke compiler instance
 * @returns {ZekeCompiler} Compiler instance
 */
export default function zekeInit() {
  const compiler = new ZekeCompiler();
  
  // Add markdown support plugin
  compiler.use({
    attach() {
      this.helpers.set('markdown', (content) => {
        return marked(content);
      });
    }
  });
  
  return compiler.init();
}