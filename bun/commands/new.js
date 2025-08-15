/**
 * BAM New Command - Bun-optimized Project Creation
 * Creates new BAM projects from templates using Bun's native file APIs
 */

import { existsSync, mkdirSync, writeFileSync, readFileSync, readdirSync, statSync, copyFileSync } from "fs";
import { join, resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

/**
 * Available templates
 */
const TEMPLATES = {
  skeleton: "Clean, semantic HTML template",
  bootstrap: "Bootstrap framework template",
  reveal: "Reveal.js presentation template", 
  angular: "AngularJS application template",
  pagedown: "Pagedown markdown template"
};

/**
 * Copy directory recursively
 */
async function copyDirectory(src, dest) {
  if (!existsSync(dest)) {
    mkdirSync(dest, { recursive: true });
  }
  
  const items = readdirSync(src);
  
  for (const item of items) {
    const srcPath = join(src, item);
    const destPath = join(dest, item);
    
    if (statSync(srcPath).isDirectory()) {
      await copyDirectory(srcPath, destPath);
    } else {
      copyFileSync(srcPath, destPath);
    }
  }
}

/**
 * Get template source directory
 */
function getTemplatePath(template) {
  // Look for templates in parent directory structure
  const possiblePaths = [
    resolve(__dirname, "../../templates", template),
    resolve(__dirname, "../../templates-es6", template),
    resolve(process.cwd(), "templates", template),
    resolve(process.cwd(), "templates-es6", template)
  ];
  
  for (const path of possiblePaths) {
    if (existsSync(path)) {
      return path;
    }
  }
  
  return null;
}

/**
 * Create basic project structure if no template found
 */
async function createBasicProject(projectName, projectPath) {
  console.log(`Creating basic project structure for ${projectName}...`);
  
  // Create directories
  mkdirSync(join(projectPath, "pages"), { recursive: true });
  mkdirSync(join(projectPath, "stylesheets"), { recursive: true });
  mkdirSync(join(projectPath, "images"), { recursive: true });
  mkdirSync(join(projectPath, "javascripts"), { recursive: true });
  
  // Create basic layout.html
  const layoutContent = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${projectName}</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link rel="stylesheet" href="stylesheets/style.css">
</head>
<body>
  <%- @body %>
  <script src="javascripts/app.js"></script>
</body>
</html>`;
  
  writeFileSync(join(projectPath, "layout.html"), layoutContent, "utf8");
  
  // Create basic index page
  const indexContent = `<div class="container">
  <h1>Welcome to ${projectName}</h1>
  <p>Your BAM static site is ready! Edit this page in <code>pages/index.html</code></p>
  <p>Start the development server with: <code>bam run</code></p>
</div>`;
  
  writeFileSync(join(projectPath, "pages", "index.html"), indexContent, "utf8");
  
  // Create basic CSS
  const cssContent = `body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  line-height: 1.6;
  margin: 0;
  padding: 20px;
  color: #333;
}

.container {
  max-width: 800px;
  margin: 0 auto;
}

h1 {
  color: #2c3e50;
  border-bottom: 2px solid #3498db;
  padding-bottom: 10px;
}

code {
  background: #f8f9fa;
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 0.9em;
}`;
  
  writeFileSync(join(projectPath, "stylesheets", "style.css"), cssContent, "utf8");
  
  // Create basic JavaScript
  const jsContent = `// ${projectName} - JavaScript
console.log('Welcome to ${projectName}!');

// Add your JavaScript code here
document.addEventListener('DOMContentLoaded', function() {
  console.log('Page loaded successfully');
});`;
  
  writeFileSync(join(projectPath, "javascripts", "app.js"), jsContent, "utf8");
  
  // Create 404 page
  const notFoundContent = `<div class="container">
  <h1>404 - Page Not Found</h1>
  <p>Sorry, the page you're looking for doesn't exist.</p>
  <p><a href="/">Return to homepage</a></p>
</div>`;
  
  writeFileSync(join(projectPath, "404.html"), notFoundContent, "utf8");
  
  // Create package.json
  const packageJson = {
    name: projectName.toLowerCase().replace(/\s+/g, '-'),
    version: "1.0.0",
    description: `BAM static site: ${projectName}`,
    scripts: {
      "dev": "bam run",
      "build": "bam gen",
      "serve": "bam serve"
    },
    keywords: ["bam", "static-site", "generator"],
    author: "",
    license: "MIT"
  };
  
  writeFileSync(join(projectPath, "package.json"), JSON.stringify(packageJson, null, 2), "utf8");
}

/**
 * Main new command implementation
 */
export default async function newCommand(projectName, template = "skeleton") {
  if (!projectName) {
    console.error("Error: Project name is required");
    console.log("Usage: bam new <project-name> [template]");
    console.log(`Available templates: ${Object.keys(TEMPLATES).join(", ")}`);
    process.exit(1);
  }
  
  // Validate template
  if (!TEMPLATES[template]) {
    console.error(`Error: Unknown template '${template}'`);
    console.log(`Available templates: ${Object.keys(TEMPLATES).join(", ")}`);
    process.exit(1);
  }
  
  const projectPath = resolve(process.cwd(), projectName);
  
  // Check if directory already exists
  if (existsSync(projectPath)) {
    console.error(`Error: Directory '${projectName}' already exists`);
    process.exit(1);
  }
  
  console.log(`Creating new BAM project: ${projectName}`);
  console.log(`Template: ${template} - ${TEMPLATES[template]}`);
  console.log(`Location: ${projectPath}`);
  
  try {
    // Create project directory
    mkdirSync(projectPath, { recursive: true });
    
    // Get template source path
    const templatePath = getTemplatePath(template);
    
    if (templatePath) {
      console.log(`Copying template from: ${templatePath}`);
      await copyDirectory(templatePath, projectPath);
      
      // Update package.json if it exists
      const packageJsonPath = join(projectPath, "package.json");
      if (existsSync(packageJsonPath)) {
        try {
          const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf8"));
          packageJson.name = projectName.toLowerCase().replace(/\s+/g, '-');
          packageJson.description = `BAM static site: ${projectName}`;
          writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2), "utf8");
        } catch (error) {
          console.warn("Warning: Could not update package.json:", error.message);
        }
      }
    } else {
      console.warn(`Template '${template}' not found, creating basic project structure...`);
      await createBasicProject(projectName, projectPath);
    }
    
    console.log("✅ Project created successfully!");
    console.log();
    console.log("Next steps:");
    console.log(`  cd ${projectName}`);
    console.log("  bam run              # Start development server");
    console.log("  bam gen              # Generate static site");
    console.log("  bam serve            # Serve generated site");
    console.log();
    console.log("Happy coding! 🚀");
    
  } catch (error) {
    console.error(`Error creating project: ${error.message}`);
    process.exit(1);
  }
}