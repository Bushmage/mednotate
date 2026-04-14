'use strict';

const path = require('path');
const fs = require('fs');
const {
  parse,
  extractDiagnoses,
  extractMedications,
  extractDates,
  extractProviders,
} = require('../src/lib/parser');

const sampleNote = fs.readFileSync(
  path.join(__dirname, 'fixtures', 'sample-note.txt'),
  'utf8'
);
const expectedOutput = require('./fixtures/expected-output.json');

describe('extractDiagnoses', () => {
  it('extracts diagnoses from Dx: label', () => {
    const text = 'Dx: Community-acquired pneumonia';
    const results = extractDiagnoses(text);
    expect(results).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ type: 'diagnosis', value: 'Community-acquired pneumonia' }),
      ])
    );
  });

  it('extracts diagnoses from Diagnosis: label', () => {
    const text = 'Diagnosis: Chronic kidney disease, stage 3';
    const results = extractDiagnoses(text);
    expect(results[0]).toMatchObject({ type: 'diagnosis', value: 'Chronic kidney disease, stage 3' });
  });

  it('extracts ICD-10 codes', () => {
    const text = 'Type 2 diabetes mellitus with hyperglycemia (E11.65)';
    const results = extractDiagnoses(text);
    expect(results).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ type: 'diagnosis', value: 'E11.65' }),
      ])
    );
  });

  it('returns confidence: high for all extracted diagnoses', () => {
    const results = extractDiagnoses(sampleNote);
    results.forEach(e => expect(e.confidence).toBe('high'));
  });

  it('returns entities with required fields', () => {
    const results = extractDiagnoses(sampleNote);
    results.forEach(e => {
      expect(e).toHaveProperty('type', 'diagnosis');
      expect(e).toHaveProperty('value');
      expect(e).toHaveProperty('raw');
      expect(e).toHaveProperty('position');
      expect(e).toHaveProperty('confidence');
    });
  });
});

describe('extractMedications', () => {
  it('extracts medications from Medications: label as a list', () => {
    const text = 'Medications: Lisinopril 10mg daily, Metformin 500mg twice daily';
    const results = extractMedications(text);
    const values = results.map(r => r.value);
    expect(values).toContain('Lisinopril 10mg daily');
    expect(values).toContain('Metformin 500mg twice daily');
  });

  it('extracts medications from Rx: label', () => {
    const text = 'Rx: Amoxicillin 500mg three times daily for 7 days';
    const results = extractMedications(text);
    expect(results).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ value: 'Amoxicillin 500mg three times daily for 7 days' }),
      ])
    );
  });

  it('extracts drug suffix patterns (-statin, -pril, -cillin)', () => {
    const text = 'Patient is on Atorvastatin, Lisinopril, and Amoxicillin.';
    const results = extractMedications(text);
    const values = results.map(r => r.value.toLowerCase());
    expect(values).toContain('atorvastatin');
    expect(values).toContain('lisinopril');
    expect(values).toContain('amoxicillin');
  });

  it('returns entities with required fields', () => {
    const results = extractMedications(sampleNote);
    results.forEach(e => {
      expect(e).toHaveProperty('type', 'medication');
      expect(e).toHaveProperty('value');
      expect(e).toHaveProperty('raw');
      expect(e).toHaveProperty('position');
      expect(e).toHaveProperty('confidence');
    });
  });
});

describe('extractDates', () => {
  it('extracts MM/DD/YYYY dates', () => {
    const text = 'Visit date: 03/15/2024';
    const results = extractDates(text);
    expect(results[0]).toMatchObject({ type: 'date', value: '03/15/2024', confidence: 'high' });
  });

  it('extracts YYYY-MM-DD dates', () => {
    const text = 'DOB: 1965-04-22';
    const results = extractDates(text);
    expect(results[0]).toMatchObject({ type: 'date', value: '1965-04-22' });
  });

  it('extracts written date formats', () => {
    const text = 'Return visit scheduled for March 28, 2024.';
    const results = extractDates(text);
    expect(results[0]).toMatchObject({ type: 'date', value: 'March 28, 2024' });
  });

  it('extracts all 4 dates from the sample note', () => {
    const results = extractDates(sampleNote);
    expect(results).toHaveLength(4);
  });
});

describe('extractProviders', () => {
  it('extracts Dr. prefixed providers', () => {
    const text = 'Attending Physician: Dr. Martinez';
    const results = extractProviders(text);
    expect(results[0]).toMatchObject({ type: 'provider', value: 'Dr. Martinez' });
  });

  it('extracts NP suffixed providers', () => {
    const text = 'Referring Provider: Chen, NP';
    const results = extractProviders(text);
    expect(results).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ type: 'provider' }),
      ])
    );
  });

  it('does not match providers across newlines', () => {
    const text = 'Dr. Martinez\nReferring Provider: Chen, NP';
    const results = extractProviders(text);
    const drResult = results.find(r => r.value.startsWith('Dr.'));
    expect(drResult.value).toBe('Dr. Martinez');
  });

  it('returns entities with required fields', () => {
    const results = extractProviders(sampleNote);
    results.forEach(e => {
      expect(e).toHaveProperty('type', 'provider');
      expect(e).toHaveProperty('value');
      expect(e).toHaveProperty('position');
      expect(e).toHaveProperty('confidence', 'high');
    });
  });
});

describe('parse (full)', () => {
  it('returns expected entity count from sample note', () => {
    const result = parse(sampleNote);
    expect(result.summary.total).toBe(expectedOutput.summary.total);
  });

  it('returns correct summary counts matching expected output', () => {
    const result = parse(sampleNote);
    expect(result.summary).toEqual(expectedOutput.summary);
  });

  it('returns entities sorted by position', () => {
    const result = parse(sampleNote);
    for (let i = 1; i < result.entities.length; i++) {
      expect(result.entities[i].position).toBeGreaterThanOrEqual(result.entities[i - 1].position);
    }
  });

  it('returns the exact entities matching expected-output.json', () => {
    const result = parse(sampleNote);
    expect(result.entities).toEqual(expectedOutput.entities);
  });
});
