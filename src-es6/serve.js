import http from 'http';
import { parse } from 'url';
import { createReadStream, existsSync } from 'fs';
import { pipeline } from 'stream';
import { promisify } from 'util';
import { join } from 'path';
import { lookup } from 'mime-types';

const pipelineAsync = promisify(pipeline);

/**
 * Serve generated static site
 * @param {string} proj - Project directory (default: '.')
 */
export default function serveCommand(proj = '.') {
  const genPath = join(proj, 'gen');
  const port = 3000;

  // Check if gen directory exists
  if (!existsSync(genPath)) {
    console.error('Generated site not found. Run "bam gen" first to generate the static site.');
    process.exit(1);
  }

  const server = http.createServer(async (req, res) => {
    const { pathname } = parse(req.url);
    const normalizedPath = pathname === '/' ? '/index.html' : pathname;
    const filePath = join(genPath, normalizedPath);

    try {
      if (existsSync(filePath)) {
        // Set appropriate content type
        const mimeType = lookup(filePath) || 'application/octet-stream';
        res.writeHead(200, { 'Content-Type': mimeType });
        
        // Stream the file
        const readStream = createReadStream(filePath);
        await pipelineAsync(readStream, res);
      } else {
        // Try to serve 404.html if it exists
        const notFoundPath = join(genPath, '404.html');
        if (existsSync(notFoundPath)) {
          res.writeHead(404, { 'Content-Type': 'text/html' });
          const readStream = createReadStream(notFoundPath);
          await pipelineAsync(readStream, res);
        } else {
          res.writeHead(404, { 'Content-Type': 'text/plain' });
          res.end('404 - Page not found');
        }
      }
    } catch (error) {
      console.error(`Error serving ${normalizedPath}:`, error.message);
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('Internal server error');
    }
  });

  try {
    server.listen(port, () => {
      console.log(`Static site server running on port ${port}`);
      console.log(`Visit http://localhost:${port} to view your generated site`);
      console.log('Press CTRL-C to exit');
    });

    // Handle server errors
    server.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        console.error(`Port ${port} is already in use. Please stop other services using this port.`);
      } else {
        console.error('Server error:', error.message);
      }
      process.exit(1);
    });

    // Graceful shutdown
    process.on('SIGINT', () => {
      console.log('\nShutting down static site server...');
      server.close(() => {
        console.log('Server closed');
        process.exit(0);
      });
    });

  } catch (error) {
    console.error('Error starting static site server:', error.message);
    throw error;
  }
}