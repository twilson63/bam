import ejs from 'ejs';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Render EJS templates (replacing ECO)
 * @param {string} name - Template name
 * @param {Object} data - Data to pass to template (default: {})
 * @returns {string} Rendered HTML
 */
export default function ecoRender(name, data = {}) {
  try {
    const templatePath = join(__dirname, '..', '..', 'templates', `${name}.eco`);
    const template = readFileSync(templatePath, 'utf8');
    
    // Convert ECO syntax to EJS syntax
    // ECO uses <%- %> for output, EJS uses <%= %>
    // ECO uses <% %> for code, EJS uses the same
    let ejsTemplate = template
      .replace(/<%-([\s\S]*?)%>/g, '<%=$1%>')  // Convert ECO output to EJS output
      .replace(/<%=([\s\S]*?)%>/g, '<%=$1%>'); // Ensure EJS output syntax
    
    return ejs.render(ejsTemplate, data);
  } catch (error) {
    console.error(`Error rendering template ${name}:`, error.message);
    throw error;
  }
}