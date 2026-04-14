# CLAUDE.md — MedNotate CLI

This file instructs Claude Code on how to build the MedNotate CLI project.
Read this file in full before writing any code.

---

## Project Overview

**MedNotate** is a Node.js command-line tool that parses plain-text clinical notes,
annotates structured entities (diagnoses, medications, dates, providers), and exports
the results to JSON, CSV, or HL7 format.

Target users: clinical informaticists, health IT developers, and EHR integration engineers.

---

## Repository Structure

Scaffold the project exactly as follows:

```
mednotate/
├── CLAUDE.md
├── README.md
├── package.json
├── .gitignore
├── bin/
│   └── mednotate.js          # CLI entry point (#!/usr/bin/env node)
├── src/
│   ├── commands/
│   │   ├── init.js           # `mednotate init`
│   │   ├── annotate.js       # `mednotate annotate <file>`
│   │   ├── export.js         # `mednotate export`
│   │   └── validate.js       # `mednotate validate <file>`
│   ├── lib/
│   │   ├── parser.js         # Entity extraction logic
│   │   ├── schema.js         # Validation schema definitions
│   │   └── formatter.js      # Output formatters (JSON, CSV, HL7)
│   └── config/
│       └── defaults.js       # Default config values
├── test/
│   ├── parser.test.js
│   ├── formatter.test.js
│   └── fixtures/
│       ├── sample-note.txt   # Realistic clinical note for testing
│       └── expected-output.json
└── docs/                     # Leave empty — documentation added separately
```

---

## Dependencies

Use only these packages. Do not add others without a clear reason.

```json
{
  "dependencies": {
    "commander": "^11.0.0",
    "chalk": "^4.1.2",
    "ora": "^5.4.1",
    "fs-extra": "^11.1.1"
  },
  "devDependencies": {
    "jest": "^29.0.0"
  }
}
```

> Use `chalk@4` and `ora@5` specifically — these are CommonJS-compatible and
> do not require ESM configuration.

---

## Commands to Implement

### `mednotate init`

- Creates a `mednotate.config.json` file in the current working directory
- Config file must include: `{ "outputDir": "./output", "defaultFormat": "json", "entityTypes": ["diagnosis", "medication", "date", "provider"] }`
- If config already exists, prompt the user before overwriting
- Print a success message with the file path created

### `mednotate annotate <file>`

- Accepts a path to a `.txt` file
- Reads the file content
- Passes content through `src/lib/parser.js` to extract entities
- Writes the annotated result to `./output/<filename>.annotated.json`
- Creates the output directory if it does not exist
- Prints a summary: number of entities found by type
- Exits with code 1 if the file does not exist or is not `.txt`

### `mednotate export --format <json|csv|hl7> [--input <file>]`

- Reads an existing `.annotated.json` file (defaults to most recent in `./output/`)
- Converts it to the specified format using `src/lib/formatter.js`
- Writes output to `./output/<filename>.<format>`
- Prints the output file path on success

### `mednotate validate <file>`

- Accepts a path to a `.txt` note file
- Checks the note against a schema defined in `src/lib/schema.js`
- Schema rules (implement all of these):
  - File must not be empty
  - File must be under 50,000 characters
  - Must contain at least one date pattern (e.g., MM/DD/YYYY or YYYY-MM-DD)
  - Must contain at least one of: "patient", "dx", "diagnosis", "medication", "rx", "assessment"
- Prints PASS or FAIL with a specific reason for each failed rule
- Exits with code 0 on PASS, code 2 on FAIL

---

## Parser Logic (`src/lib/parser.js`)

Implement regex-based entity extraction. Do not call any external APIs.

Entity types and detection patterns:

| Entity Type  | Detection Strategy |
|---|---|
| `diagnosis`  | Terms after "Dx:", "Diagnosis:", "Assessment:", or ICD-10 code pattern (e.g., J18.9) |
| `medication` | Terms after "Rx:", "Medications:", "Med:", or common drug name suffix patterns (-mycin, -pril, -olol, -statin) |
| `date`       | MM/DD/YYYY, YYYY-MM-DD, and written formats (e.g., "March 4, 2024") |
| `provider`   | "Dr.", "MD", "NP", "PA" followed by a capitalized name |

Each extracted entity must include:
```json
{
  "type": "diagnosis",
  "value": "Community-acquired pneumonia",
  "raw": "Dx: Community-acquired pneumonia",
  "position": 142,
  "confidence": "high"
}
```

---

## Formatter Logic (`src/lib/formatter.js`)

### JSON
Return the annotated output as-is, pretty-printed.

### CSV
One row per entity. Columns: `type`, `value`, `position`, `confidence`.
Include a header row.

### HL7
Produce a minimal HL7 v2.x OBX segment per entity. Format:
```
OBX|1|ST|<type>||<value>|||||||F
```
No real HL7 library required — plain string construction is acceptable.
Include a brief comment at the top of the file: `# MedNotate HL7 v2.x Export`.

---

## Test Fixtures

Create `test/fixtures/sample-note.txt` with a realistic clinical note that includes:
- A patient name, DOB, and visit date
- At least 2 diagnoses (one with ICD-10 code)
- At least 3 medications
- At least 2 provider references (Dr. Last, NP Last)
- A clinical assessment and plan section

Create `test/fixtures/expected-output.json` with the expected annotated output
that the parser should produce from that sample note.

---

## Test Coverage (`test/`)

Write Jest tests for:

- `parser.test.js`: Test each entity type extracts correctly from fixture input
- `formatter.test.js`: Test JSON, CSV, and HL7 output formats produce correct structure

Run tests with: `npm test`

---

## Code Style Rules

- CommonJS (`require`/`module.exports`) — no ESM
- No TypeScript
- Add a JSDoc comment block to every exported function
- Use `async/await` for all file I/O
- Print user-facing messages with `chalk` (green = success, red = error, yellow = warning)
- Use `ora` spinners for any operation that reads or writes files

---

## README.md

Write a README that includes:
1. Project description (2–3 sentences)
2. Installation instructions (`npm install -g mednotate`)
3. Quickstart (annotate a file, export to JSON — copy-pasteable commands)
4. Command reference table (one row per command, brief description)
5. License (MIT)

---

## When You Are Done

Run `npm test` and confirm all tests pass before declaring the build complete.
Print a summary of files created and test results.
