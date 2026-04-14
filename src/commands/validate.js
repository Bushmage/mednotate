'use strict';

const path = require('path');
const fs = require('fs-extra');
const chalk = require('chalk');
const { validate: validateSchema } = require('../lib/schema');

/**
 * Implements the `mednotate validate <file>` command.
 * Checks a clinical note against schema rules and prints PASS or FAIL.
 * Exits with code 0 on PASS, code 2 on FAIL.
 * @param {string} filePath - Path to the .txt note file.
 * @returns {Promise<void>}
 */
async function validateCmd(filePath) {
  const resolved = path.resolve(filePath);

  if (!await fs.pathExists(resolved)) {
    console.error(chalk.red(`Error: File not found: ${resolved}`));
    process.exit(1);
  }

  let text;
  try {
    text = await fs.readFile(resolved, 'utf8');
  } catch (err) {
    console.error(chalk.red(`Error reading file: ${err.message}`));
    process.exit(1);
  }

  const { valid, results } = validateSchema(text);

  console.log(`\nValidating: ${resolved}\n`);
  for (const result of results) {
    if (result.passed) {
      console.log(chalk.green(`  PASS  ${result.reason}`));
    } else {
      console.log(chalk.red(`  FAIL  ${result.reason}`));
    }
  }

  console.log('');
  if (valid) {
    console.log(chalk.green('Result: PASS'));
    process.exit(0);
  } else {
    console.log(chalk.red('Result: FAIL'));
    process.exit(2);
  }
}

module.exports = { validateCmd };
