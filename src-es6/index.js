#!/usr/bin/env node

import { Command } from 'commander';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import newCommand from './new.js';
import runCommand from './run.js';
import genCommand from './gen.js';
import serveCommand from './serve.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Read package.json for version
const packageJson = JSON.parse(readFileSync(join(__dirname, '../package.json'), 'utf8'));
const version = packageJson.version;

const program = new Command();

program
  .name('bam')
  .description('Easiest Static Site Generator on the Planet')
  .version(version, '-v, --version', 'display version number')
  .helpOption('-h, --help', 'display help for command');

// Add usage information
program.addHelpText('before', `
BAM v${version}
Easiest Static Site Generator on the Planet

Usage:
  bam new [foo] [template]
  cd [foo]

  # run in dev mode
  bam run

  # generate site
  bam gen

  # test gen site
  bam serve
`);

// Define commands
program
  .command('new')
  .description('Create a new project')
  .argument('[name]', 'project name')
  .argument('[template]', 'template name (skeleton, bootstrap, reveal, angular, pagedown)', 'skeleton')
  .action(async (name, template) => {
    if (!name) {
      console.error('Project Name Required!');
      process.exit(1);
    }
    
    try {
      await newCommand(name, template);
      console.log('Done....');
    } catch (error) {
      console.error('Error creating project:', error.message);
      process.exit(1);
    }
  });

program
  .command('run')
  .description('Run development server')
  .argument('[port]', 'port number', '3000')
  .argument('[project]', 'project directory', '.')
  .action((port, project) => {
    try {
      runCommand(parseInt(port), project);
    } catch (error) {
      console.error('Error running server:', error.message);
      process.exit(1);
    }
  });

program
  .command('gen')
  .description('Generate static site')
  .argument('[project]', 'project directory', '.')
  .action(async (project) => {
    try {
      await genCommand(project);
      console.log('Successfully Generated Static Site in the gen folder...');
    } catch (error) {
      console.error('Error generating site:', error.message);
      process.exit(1);
    }
  });

program
  .command('serve')
  .description('Serve generated static site')
  .argument('[project]', 'project directory', '.')
  .action((project) => {
    try {
      serveCommand(project);
    } catch (error) {
      console.error('Error serving site:', error.message);
      process.exit(1);
    }
  });

// Handle version command explicitly
program
  .command('version')
  .description('Show version number')
  .action(() => {
    console.log(`BAM v${version}`);
  });

// Parse command line arguments
program.parse();