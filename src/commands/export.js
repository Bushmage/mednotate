'use strict';

const path = require('path');
const fs = require('fs-extra');
const chalk = require('chalk');
const ora = require('ora');
const { format } = require('../lib/formatter');

const EXTENSIONS = { json: 'json', csv: 'csv', hl7: 'hl7' };

/**
 * Finds the most recently modified .annotated.json file in the output directory.
 * @param {string} outputDir - Path to the output directory.
 * @returns {Promise<string|null>} Path to the most recent file, or null if none found.
 */
async function findMostRecent(outputDir) {
  const files = (await fs.readdir(outputDir))
    .filter(f => f.endsWith('.annotated.json'))
    .map(f => ({ name: f, mtime: fs.statSync(path.join(outputDir, f)).mtime }))
    .sort((a, b) => b.mtime - a.mtime);

  return files.length > 0 ? path.join(outputDir, files[0].name) : null;
}

/**
 * Implements the `mednotate export` command.
 * Reads an annotated JSON file and converts it to the specified format.
 * @param {Object} options - Command options.
 * @param {string} options.format - Output format: json, csv, or hl7.
 * @param {string} [options.input] - Path to an annotated JSON file (optional).
 * @returns {Promise<void>}
 */
async function exportCmd(options) {
  const fmt = options.format || 'json';

  if (!EXTENSIONS[fmt]) {
    console.error(chalk.red(`Error: Unsupported format "${fmt}". Use json, csv, or hl7.`));
    process.exit(1);
  }

  const outputDir = path.resolve(process.cwd(), 'output');
  let inputPath = options.input ? path.resolve(options.input) : null;

  if (!inputPath) {
    if (!await fs.pathExists(outputDir)) {
      console.error(chalk.red('Error: No output directory found. Run `mednotate annotate` first.'));
      process.exit(1);
    }
    inputPath = await findMostRecent(outputDir);
    if (!inputPath) {
      console.error(chalk.red('Error: No annotated files found in ./output/. Specify --input.'));
      process.exit(1);
    }
  }

  const spinner = ora(`Reading ${path.basename(inputPath)}...`).start();

  let annotated;
  try {
    annotated = await fs.readJson(inputPath);
  } catch (err) {
    spinner.fail(chalk.red(`Failed to read input: ${err.message}`));
    process.exit(1);
  }

  spinner.text = `Formatting as ${fmt.toUpperCase()}...`;
  const output = format(annotated, fmt);

  const baseName = path.basename(inputPath, '.annotated.json');
  await fs.ensureDir(outputDir);
  const outputPath = path.join(outputDir, `${baseName}.${EXTENSIONS[fmt]}`);

  await fs.writeFile(outputPath, output, 'utf8');
  spinner.succeed(chalk.green(`Exported to: ${outputPath}`));
}

module.exports = { exportCmd };
