'use strict';

/**
 * Extracts diagnosis entities from text.
 * Matches terms after "Dx:", "Diagnosis:", "Assessment:", or ICD-10 code patterns.
 * @param {string} text - The clinical note text.
 * @returns {Array<Object>} Array of diagnosis entity objects.
 */
function extractDiagnoses(text) {
  const entities = [];

  // Pattern: label followed by value on same line
  const labelPatterns = [
    /(?:Dx|Diagnosis|Assessment)[ \t]*:[ \t]*(.+)/gi,
  ];

  for (const pattern of labelPatterns) {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      entities.push({
        type: 'diagnosis',
        value: match[1].trim(),
        raw: match[0].trim(),
        position: match.index,
        confidence: 'high',
      });
    }
  }

  // ICD-10 code pattern (e.g., J18.9, E11.65)
  const icd10Pattern = /\b([A-Z]\d{2}(?:\.\d{1,4})?)\b/g;
  let match;
  while ((match = icd10Pattern.exec(text)) !== null) {
    // Avoid duplicate if already captured by label pattern at same position
    const alreadyCaptured = entities.some(e => e.position === match.index);
    if (!alreadyCaptured) {
      entities.push({
        type: 'diagnosis',
        value: match[1],
        raw: match[0],
        position: match.index,
        confidence: 'high',
      });
    }
  }

  return entities;
}

/**
 * Extracts medication entities from text.
 * Matches terms after "Rx:", "Medications:", "Med:", or common drug name suffixes.
 * @param {string} text - The clinical note text.
 * @returns {Array<Object>} Array of medication entity objects.
 */
function extractMedications(text) {
  const entities = [];

  const labelPatterns = [
    /(?:Rx|Medications?|Med)[ \t]*:[ \t]*(.+)/gi,
  ];

  for (const pattern of labelPatterns) {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      // Split by commas or semicolons to handle lists
      const items = match[1].split(/[,;]/).map(s => s.trim()).filter(Boolean);
      for (const item of items) {
        entities.push({
          type: 'medication',
          value: item,
          raw: match[0].trim(),
          position: match.index,
          confidence: 'high',
        });
      }
    }
  }

  // Common drug suffix patterns
  const suffixPattern = /\b([A-Za-z]+(?:mycin|pril|olol|statin|sartan|mab|nib|zole|azole|cillin|cycline|prazole|oxacin))\b/gi;
  let match;
  while ((match = suffixPattern.exec(text)) !== null) {
    const alreadyCaptured = entities.some(
      e => e.value.toLowerCase() === match[1].toLowerCase()
    );
    if (!alreadyCaptured) {
      entities.push({
        type: 'medication',
        value: match[1],
        raw: match[0],
        position: match.index,
        confidence: 'medium',
      });
    }
  }

  return entities;
}

/**
 * Extracts date entities from text.
 * Matches MM/DD/YYYY, YYYY-MM-DD, and written formats (e.g., "March 4, 2024").
 * @param {string} text - The clinical note text.
 * @returns {Array<Object>} Array of date entity objects.
 */
function extractDates(text) {
  const entities = [];

  const datePatterns = [
    /\b(\d{1,2}\/\d{1,2}\/\d{4})\b/g,
    /\b(\d{4}-\d{2}-\d{2})\b/g,
    /\b((?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},?\s+\d{4})\b/gi,
  ];

  for (const pattern of datePatterns) {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      entities.push({
        type: 'date',
        value: match[1],
        raw: match[0],
        position: match.index,
        confidence: 'high',
      });
    }
  }

  return entities;
}

/**
 * Extracts provider entities from text.
 * Matches "Dr.", "MD", "NP", "PA" followed by a capitalized name.
 * @param {string} text - The clinical note text.
 * @returns {Array<Object>} Array of provider entity objects.
 */
function extractProviders(text) {
  const entities = [];

  const providerPatterns = [
    /\b(Dr\.[ \t]+[A-Z][a-z]+(?:[ \t]+[A-Z][a-z]+)?)\b/g,
    /\b([A-Z][a-z]+(?:[ \t]+[A-Z][a-z]+)?,?[ \t]+(?:MD|NP|PA))\b/g,
  ];

  for (const pattern of providerPatterns) {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      entities.push({
        type: 'provider',
        value: match[1].trim(),
        raw: match[0].trim(),
        position: match.index,
        confidence: 'high',
      });
    }
  }

  return entities;
}

/**
 * Parses a clinical note and extracts all structured entities.
 * @param {string} text - The raw clinical note text.
 * @returns {Object} Object with `entities` array and `summary` counts by type.
 */
function parse(text) {
  const diagnoses = extractDiagnoses(text);
  const medications = extractMedications(text);
  const dates = extractDates(text);
  const providers = extractProviders(text);

  const entities = [...diagnoses, ...medications, ...dates, ...providers].sort(
    (a, b) => a.position - b.position
  );

  const summary = {
    diagnosis: diagnoses.length,
    medication: medications.length,
    date: dates.length,
    provider: providers.length,
    total: entities.length,
  };

  return { entities, summary };
}

module.exports = { parse, extractDiagnoses, extractMedications, extractDates, extractProviders };
