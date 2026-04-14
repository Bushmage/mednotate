'use strict';

const path = require('path');
const fs = require('fs-extra');
const chalk = require('chalk');
const readline = require('readline');
const defaults = require('../config/defaults');

const CONFIG_FILE = 'mednotate.config.json';

/**
 * Prompts the user for a yes/no confirmation.
 * @param {string} question - The question to display.
 * @returns {Promise<boolean>} True if user answers yes.
 */
function confirm(question) {
  return new Promise(resolve => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    rl.question(question, answer => {
      rl.close();
      resolve(answer.trim().toLowerCase().startsWith('y'));
    });
  });
}

/**
 * Implements the `mednotate init` command.
 * Creates a mednotate.config.json in the current working directory.
 * @returns {Promise<void>}
 */
async function init() {
  const configPath = path.resolve(process.cwd(), CONFIG_FILE);

  if (await fs.pathExists(configPath)) {
    const overwrite = await confirm(
      chalk.yellow(`${CONFIG_FILE} already exists. Overwrite? (y/N) `)
    );
    if (!overwrite) {
      console.log(chalk.yellow('Aborted. Config file was not changed.'));
      return;
    }
  }

  const config = {
    outputDir: defaults.outputDir,
    defaultFormat: defaults.defaultFormat,
    entityTypes: defaults.entityTypes,
  };

  await fs.writeJson(configPath, config, { spaces: 2 });
  console.log(chalk.green(`Config created: ${configPath}`));
}

module.exports = { init };
