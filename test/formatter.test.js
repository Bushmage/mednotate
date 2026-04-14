'use strict';

const { format, toJSON, toCSV, toHL7 } = require('../src/lib/formatter');

const sampleAnnotated = {
  source: '/tmp/note.txt',
  annotatedAt: '2024-03-15T00:00:00.000Z',
  entities: [
    { type: 'diagnosis', value: 'Hypertension', raw: 'Dx: Hypertension', position: 10, confidence: 'high' },
    { type: 'medication', value: 'Lisinopril', raw: 'Lisinopril', position: 50, confidence: 'medium' },
    { type: 'date', value: '03/15/2024', raw: '03/15/2024', position: 100, confidence: 'high' },
    { type: 'provider', value: 'Dr. Smith', raw: 'Dr. Smith', position: 200, confidence: 'high' },
  ],
  summary: { diagnosis: 1, medication: 1, date: 1, provider: 1, total: 4 },
};

describe('toJSON', () => {
  it('returns a valid JSON string', () => {
    const result = toJSON(sampleAnnotated);
    expect(() => JSON.parse(result)).not.toThrow();
  });

  it('round-trips the annotated object', () => {
    const result = toJSON(sampleAnnotated);
    expect(JSON.parse(result)).toEqual(sampleAnnotated);
  });

  it('is pretty-printed with 2-space indentation', () => {
    const result = toJSON(sampleAnnotated);
    expect(result).toContain('\n  ');
  });
});

describe('toCSV', () => {
  it('includes a header row', () => {
    const result = toCSV(sampleAnnotated);
    const lines = result.split('\n');
    expect(lines[0]).toBe('type,value,position,confidence');
  });

  it('produces one data row per entity', () => {
    const result = toCSV(sampleAnnotated);
    const lines = result.split('\n');
    // header + 4 entity rows
    expect(lines).toHaveLength(5);
  });

  it('formats entity values correctly', () => {
    const result = toCSV(sampleAnnotated);
    expect(result).toContain('diagnosis,"Hypertension",10,high');
    expect(result).toContain('medication,"Lisinopril",50,medium');
  });

  it('escapes double-quotes in values', () => {
    const annotated = {
      entities: [
        { type: 'diagnosis', value: 'He said "flu"', raw: 'raw', position: 0, confidence: 'high' },
      ],
    };
    const result = toCSV(annotated);
    expect(result).toContain('"He said ""flu"""');
  });

  it('handles empty entities array', () => {
    const result = toCSV({ entities: [] });
    expect(result).toBe('type,value,position,confidence');
  });
});

describe('toHL7', () => {
  it('starts with the MedNotate comment header', () => {
    const result = toHL7(sampleAnnotated);
    expect(result.startsWith('# MedNotate HL7 v2.x Export')).toBe(true);
  });

  it('produces one OBX segment per entity', () => {
    const result = toHL7(sampleAnnotated);
    const obxLines = result.split('\n').filter(l => l.startsWith('OBX|'));
    expect(obxLines).toHaveLength(4);
  });

  it('formats OBX segments correctly', () => {
    const result = toHL7(sampleAnnotated);
    expect(result).toContain('OBX|1|ST|diagnosis||Hypertension|||||||F');
    expect(result).toContain('OBX|2|ST|medication||Lisinopril|||||||F');
    expect(result).toContain('OBX|3|ST|date||03/15/2024|||||||F');
    expect(result).toContain('OBX|4|ST|provider||Dr. Smith|||||||F');
  });

  it('handles empty entities array', () => {
    const result = toHL7({ entities: [] });
    expect(result).toBe('# MedNotate HL7 v2.x Export');
  });
});

describe('format (dispatcher)', () => {
  it('dispatches to toJSON for format "json"', () => {
    const result = format(sampleAnnotated, 'json');
    expect(() => JSON.parse(result)).not.toThrow();
  });

  it('dispatches to toCSV for format "csv"', () => {
    const result = format(sampleAnnotated, 'csv');
    expect(result.split('\n')[0]).toBe('type,value,position,confidence');
  });

  it('dispatches to toHL7 for format "hl7"', () => {
    const result = format(sampleAnnotated, 'hl7');
    expect(result).toContain('OBX|');
  });

  it('is case-insensitive for format', () => {
    expect(() => format(sampleAnnotated, 'JSON')).not.toThrow();
    expect(() => format(sampleAnnotated, 'CSV')).not.toThrow();
    expect(() => format(sampleAnnotated, 'HL7')).not.toThrow();
  });

  it('throws for unsupported format', () => {
    expect(() => format(sampleAnnotated, 'xml')).toThrow('Unsupported format');
  });
});
