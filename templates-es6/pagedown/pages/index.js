// Modern JavaScript equivalent of the CoffeeScript template
// This generates HTML content similar to the original CoffeeScript

/**
 * Generate an image element with jpg.to service
 * @param {string} name - Image name
 * @returns {string} HTML img element
 */
function jpg2(name) {
  return `
    <center>
      <img src="http://${name}.jpg.to" style="max-height: 90%;max-width:90%" />
    </center>
  `;
}

/**
 * Generate a slide section
 * @param {string} title - Slide title
 * @param {string} jpg - Image name for jpg2 function
 * @returns {string} HTML section element
 */
function slide(title, jpg) {
  let content = '<section class="container hero-unit">';
  
  if (title) {
    content += `<h1 style="margin-bottom: 20px;">${title}</h1>`;
  }
  
  if (jpg) {
    content += jpg2(jpg);
  }
  
  content += '</section>';
  return content;
}

/**
 * Generate a list item with link
 * @param {string} desc - Link description
 * @param {string} link - Link URL
 * @returns {string} HTML li element with link
 */
function item(desc, link) {
  return `<li><a href="${link}">${desc}</a></li>`;
}

// Generate the main page content
export default function renderPagedownPage() {
  return slide('hello world', 'goodmorning');
}

// Export utility functions for use in other templates
export { jpg2, slide, item };

// Alternative: Direct HTML content for static generation
export const pagedownPageHTML = slide('hello world', 'goodmorning');