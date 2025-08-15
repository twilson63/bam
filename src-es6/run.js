import http from 'http';
import { parse } from 'url';
import { createReadStream, existsSync } from 'fs';
import { pipeline } from 'stream';
import { promisify } from 'util';
import Page from './util/page.js';

const pipelineAsync = promisify(pipeline);

/**
 * Run development server
 * @param {number} port - Port number (default: 3000)
 * @param {string} proj - Project directory (default: '.')
 */
export default function runCommand(port = 3000, proj = '.') {
  const server = http.createServer(async (req, res) => {
    const { pathname } = parse(req.url);
    const normalizedPath = pathname === '/' ? '/index.html' : pathname;

    try {
      // Handle static assets
      if (/^\/(stylesheets|images|javascripts|css|img|js)/.test(normalizedPath)) {
        const filePath = `.${normalizedPath}`;
        
        if (existsSync(filePath)) {
          const readStream = createReadStream(filePath);
          await pipelineAsync(readStream, res);
        } else {
          res.writeHead(404, { 'Content-Type': 'text/plain' });
          res.end('File not found');
        }
        return;
      }

      // Handle pages
      const pagePathname = normalizedPath.replace('.html', '');
      res.writeHead(200, { 'Content-Type': 'text/html' });
      
      const page = new Page(pagePathname);
      const renderedPage = await page.render();
      res.end(renderedPage);

    } catch (error) {
      console.log(`Unable to locate file ${normalizedPath}`);
      
      // Serve 404 page
      try {
        if (existsSync('./404.html')) {
          const readStream = createReadStream('./404.html');
          res.writeHead(404, { 'Content-Type': 'text/html' });
          await pipelineAsync(readStream, res);
        } else {
          res.writeHead(404, { 'Content-Type': 'text/plain' });
          res.end('404 - Page not found');
        }
      } catch (err404) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Internal server error');
      }
    }
  });

  try {
    server.listen(port, () => {
      console.log(`Server running on port ${port}`);
      console.log(`Visit http://localhost:${port} to view your site`);
      console.log('Press CTRL-C to exit');
    });

    // Handle server errors
    server.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        console.error(`Port ${port} is already in use. Try a different port.`);
      } else {
        console.error('Server error:', error.message);
      }
      process.exit(1);
    });

    // Graceful shutdown
    process.on('SIGINT', () => {
      console.log('\nShutting down server...');
      server.close(() => {
        console.log('Server closed');
        process.exit(0);
      });
    });

  } catch (error) {
    console.error('Not able to detect BAM application or start server:', error.message);
    throw error;
  }
}