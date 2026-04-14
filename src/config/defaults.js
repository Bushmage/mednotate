'use strict';

/**
 * Default configuration values for MedNotate.
 */
const defaults = {
  outputDir: './output',
  defaultFormat: 'json',
  entityTypes: ['diagnosis', 'medication', 'date', 'provider'],
};

module.exports = defaults;
