'use strict';

/**
 * Formats annotated output as a pretty-printed JSON string.
 * @param {Object} annotated - The annotated output object from the parser.
 * @returns {string} Pretty-printed JSON string.
 */
function toJSON(annotated) {
  return JSON.stringify(annotated, null, 2);
}

/**
 * Formats annotated output as a CSV string.
 * One row per entity with columns: type, value, position, confidence.
 * @param {Object} annotated - The annotated output object from the parser.
 * @returns {string} CSV string with header row.
 */
function toCSV(annotated) {
  const header = 'type,value,position,confidence';
  const rows = (annotated.entities || []).map(entity => {
    const value = `"${String(entity.value).replace(/"/g, '""')}"`;
    return `${entity.type},${value},${entity.position},${entity.confidence}`;
  });
  return [header, ...rows].join('\n');
}

/**
 * Formats annotated output as a minimal HL7 v2.x OBX segment string.
 * One OBX segment per entity.
 * @param {Object} annotated - The annotated output object from the parser.
 * @returns {string} HL7 v2.x OBX segment string.
 */
function toHL7(annotated) {
  const lines = ['# MedNotate HL7 v2.x Export'];
  (annotated.entities || []).forEach((entity, index) => {
    lines.push(`OBX|${index + 1}|ST|${entity.type}||${entity.value}|||||||F`);
  });
  return lines.join('\n');
}

/**
 * Converts annotated output to the specified format.
 * @param {Object} annotated - The annotated output object from the parser.
 * @param {string} format - The output format: 'json', 'csv', or 'hl7'.
 * @returns {string} Formatted string in the requested format.
 * @throws {Error} If an unsupported format is requested.
 */
function format(annotated, fmt) {
  switch (fmt.toLowerCase()) {
    case 'json':
      return toJSON(annotated);
    case 'csv':
      return toCSV(annotated);
    case 'hl7':
      return toHL7(annotated);
    default:
      throw new Error(`Unsupported format: ${fmt}. Use json, csv, or hl7.`);
  }
}

module.exports = { format, toJSON, toCSV, toHL7 };
