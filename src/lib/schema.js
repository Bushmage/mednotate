'use strict';

const DATE_PATTERN = /\b(\d{1,2}\/\d{1,2}\/\d{4}|\d{4}-\d{2}-\d{2}|(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},?\s+\d{4})\b/i;
const CLINICAL_KEYWORDS = /\b(patient|dx|diagnosis|medication|rx|assessment)\b/i;

/**
 * Validates a clinical note string against the MedNotate schema rules.
 * Rules:
 *   1. File must not be empty.
 *   2. File must be under 50,000 characters.
 *   3. Must contain at least one date pattern.
 *   4. Must contain at least one clinical keyword.
 * @param {string} text - The raw clinical note text.
 * @returns {{ valid: boolean, results: Array<{ rule: string, passed: boolean, reason: string }> }}
 */
function validate(text) {
  const results = [];

  results.push({
    rule: 'not-empty',
    passed: text.trim().length > 0,
    reason: 'File must not be empty',
  });

  results.push({
    rule: 'max-length',
    passed: text.length < 50000,
    reason: 'File must be under 50,000 characters',
  });

  results.push({
    rule: 'has-date',
    passed: DATE_PATTERN.test(text),
    reason: 'Must contain at least one date pattern (MM/DD/YYYY, YYYY-MM-DD, or written)',
  });

  results.push({
    rule: 'has-clinical-keyword',
    passed: CLINICAL_KEYWORDS.test(text),
    reason: 'Must contain at least one of: patient, dx, diagnosis, medication, rx, assessment',
  });

  const valid = results.every(r => r.passed);
  return { valid, results };
}

module.exports = { validate };
