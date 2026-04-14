#!/usr/bin/env node
'use strict';

const { Command } = require('commander');
const { init } = require('../src/commands/init');
const { annotate } = require('../src/commands/annotate');
const { exportCmd } = require('../src/commands/export');
const { validateCmd } = require('../src/commands/validate');

const program = new Command();

program
  .name('mednotate')
  .description('Parse and annotate clinical notes with structured entity extraction')
  .version('1.0.0');

program
  .command('init')
  .description('Create a mednotate.config.json in the current directory')
  .action(() => init().catch(err => { console.error(err.message); process.exit(1); }));

program
  .command('annotate <file>')
  .description('Annotate a .txt clinical note and extract entities')
  .action(file => annotate(file).catch(err => { console.error(err.message); process.exit(1); }));

program
  .command('export')
  .description('Export an annotated file to JSON, CSV, or HL7 format')
  .requiredOption('-f, --format <format>', 'Output format: json, csv, or hl7')
  .option('-i, --input <file>', 'Path to an .annotated.json file (defaults to most recent in ./output/)')
  .action(opts => exportCmd(opts).catch(err => { console.error(err.message); process.exit(1); }));

program
  .command('validate <file>')
  .description('Validate a .txt clinical note against the MedNotate schema')
  .action(file => validateCmd(file).catch(err => { console.error(err.message); process.exit(1); }));

program.parse(process.argv);
