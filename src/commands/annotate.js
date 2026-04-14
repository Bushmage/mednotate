'use strict';

const path = require('path');
const fs = require('fs-extra');
const chalk = require('chalk');
const ora = require('ora');
const { parse } = require('../lib/parser');

/**
 * Implements the `mednotate annotate <file>` command.
 * Reads a .txt file, extracts entities, and writes an annotated JSON file to ./output/.
 * @param {string} filePath - Path to the input .txt file.
 * @returns {Promise<void>}
 */
async function annotate(filePath) {
  const resolved = path.resolve(filePath);

  if (!resolved.endsWith('.txt')) {
    console.error(chalk.red('Error: Input file must have a .txt extension.'));
    process.exit(1);
  }

  if (!await fs.pathExists(resolved)) {
    console.error(chalk.red(`Error: File not found: ${resolved}`));
    process.exit(1);
  }

  const spinner = ora('Reading file...').start();

  let text;
  try {
    text = await fs.readFile(resolved, 'utf8');
  } catch (err) {
    spinner.fail(chalk.red(`Failed to read file: ${err.message}`));
    process.exit(1);
  }

  spinner.text = 'Annotating entities...';
  const result = parse(text);

  const baseName = path.basename(resolved, '.txt');
  const outputDir = path.resolve(process.cwd(), 'output');
  const outputPath = path.join(outputDir, `${baseName}.annotated.json`);

  spinner.text = 'Writing output...';
  await fs.ensureDir(outputDir);

  const annotated = {
    source: resolved,
    annotatedAt: new Date().toISOString(),
    ...result,
  };

  await fs.writeJson(outputPath, annotated, { spaces: 2 });
  spinner.succeed(chalk.green(`Annotated output written to: ${outputPath}`));

  console.log('\nEntities found:');
  console.log(`  diagnosis : ${chalk.cyan(result.summary.diagnosis)}`);
  console.log(`  medication: ${chalk.cyan(result.summary.medication)}`);
  console.log(`  date      : ${chalk.cyan(result.summary.date)}`);
  console.log(`  provider  : ${chalk.cyan(result.summary.provider)}`);
  console.log(`  total     : ${chalk.cyan(result.summary.total)}`);
}

module.exports = { annotate };
