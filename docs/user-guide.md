# MedNotate CLI — User Guide

**Version:** 1.0.0  
**Last updated:** 2026-03-26  
**Audience:** Clinical informaticists, health IT staff, and EHR integration teams

---

## Overview

MedNotate is a command-line tool that reads plain-text clinical notes and extracts structured data — diagnoses, medications, dates, and providers — without requiring a connection to an EHR system or external API. You run it locally, point it at a note file, and it produces structured output you can use in downstream workflows or integration pipelines.

This guide walks you through installing MedNotate, annotating your first clinical note, exporting the results, and validating note files before processing them.

---

## Prerequisites

Before installing MedNotate, confirm the following:

| Requirement | Minimum Version | How to Check |
|---|---|---|
| Node.js | v18.0.0 | `node --version` |
| npm | v9.0.0 | `npm --version` |

MedNotate runs on macOS, Linux, and Windows (via PowerShell or WSL). All examples in this guide use macOS terminal syntax.

---

## Installation

**1. Clone the repository:**

```bash
git clone https://github.com/bushmage/mednotate.git
cd mednotate
```

**2. Install dependencies:**

```bash
npm install
```

**3. Confirm the CLI is working:**

```bash
node bin/mednotate.js --help
```

You should see the help output listing all available commands. If you see an error, confirm you are inside the `mednotate/` directory and that `npm install` completed without errors.

---

## Tutorial 1: Annotate Your First Clinical Note

This tutorial walks through annotating a clinical note using the sample fixture included with MedNotate. By the end, you will have a structured JSON file containing every diagnosis, medication, date, and provider extracted from the note.

### Step 1: Initialize the configuration

Run `init` once per project to create a configuration file in your working directory:

```bash
node bin/mednotate.js init
```

Expected output:

```
Config created: /Users/kylebush/mednotate/mednotate.config.json
```

This creates `mednotate.config.json` with default settings: output files go to `./output/`, and the default export format is JSON. You do not need to edit this file to complete the tutorial.

### Step 2: Review the sample note

The sample note at `test/fixtures/sample-note.txt` contains a realistic clinical encounter for a patient named John A. Doe, seen on 03/15/2024. It includes:

- Two ICD-10 coded diagnoses (hypertension `I10`, type 2 diabetes `E11.65`)
- Two additional diagnoses documented in narrative form
- Four medications including a new prescription
- Three provider references
- Four dates across the visit record and plan section

This is the note you will annotate in the next step.

### Step 3: Run the annotate command

```bash
node bin/mednotate.js annotate test/fixtures/sample-note.txt
```

Expected output:

```
✔ Annotated output written to: /Users/kylebush/mednotate/output/sample-note.annotated.json
```

MedNotate reads the note, runs the entity parser, and writes the results to `output/sample-note.annotated.json`. The output directory is created automatically if it does not exist.

### Step 4: Review the annotated output

```bash
cat output/sample-note.annotated.json
```

The output file contains three top-level fields:

- `source` — absolute path to the original note file
- `annotatedAt` — ISO 8601 timestamp of when the annotation ran
- `entities` — array of extracted entity objects
- `summary` — entity counts by type

Each entity in the array looks like this:

```json
{
  "type": "diagnosis",
  "value": "Community-acquired pneumonia",
  "raw": "Dx: Community-acquired pneumonia",
  "position": 322,
  "confidence": "high"
}
```

The `value` field contains the cleaned entity text. The `raw` field shows the original matched string from the note, including any label prefix such as `Dx:` or `Medications:`. The `position` field is the character offset where the match was found. The `confidence` field indicates whether the entity was found by a label trigger (`high`) or a pattern match alone (`medium`).

For the sample note, the summary section reports:

```json
"summary": {
  "diagnosis": 4,
  "medication": 7,
  "date": 4,
  "provider": 3,
  "total": 18
}
```

> **Note on medication counts:** MedNotate version 1.0.0 may produce two records for the same medication when it is detected by both a label trigger and a drug-suffix pattern. For example, Lisinopril appears once with full dosage information (`confidence: high`) and once as a bare drug name (`confidence: medium`). When using this output programmatically, filter by `"confidence": "high"` to retain the most complete record per medication. See the [CLI Reference](cli-reference.md) for full details.

---

## Tutorial 2: Export Annotated Output

Once a note has been annotated, you can export the results to JSON, CSV, or HL7 format for use in other systems.

### Export to JSON

```bash
node bin/mednotate.js export --format json
```

Expected output:

```
✔ Exported to: /Users/kylebush/mednotate/output/sample-note.json
```

When `--input` is not specified, MedNotate automatically uses the most recently annotated file in the output directory.

### Export to CSV

```bash
node bin/mednotate.js export --format csv
```

The CSV file contains one row per entity with four columns: `type`, `value`, `position`, and `confidence`. This format is useful for loading annotated data into a spreadsheet or business intelligence tool.

### Export to HL7

```bash
node bin/mednotate.js export --format hl7
```

The HL7 export produces one OBX segment per entity following HL7 v2.x conventions. The file begins with a comment header identifying it as a MedNotate export:

```
# MedNotate HL7 v2.x Export
OBX|1|ST|date||03/15/2024|||||||F
OBX|2|ST|provider||Dr. Martinez|||||||F
OBX|3|ST|diagnosis||I10|||||||F
OBX|4|ST|medication||Lisinopril 10mg daily|||||||F
```

> **Important:** HL7 output from MedNotate is intended for review and integration prototyping. It is not a validated HL7 message and should not be submitted to a production EHR system without additional transformation and review by your integration team.

### Export from a specific input file

Use `--input` to target a specific annotated file rather than the most recent:

```bash
node bin/mednotate.js export --format csv --input output/sample-note.annotated.json
```

---

## Tutorial 3: Validate a Note Before Annotating

The `validate` command checks a note file against four rules before you commit it to annotation. This is useful when processing notes from unfamiliar sources or when building an automated pipeline.

### Run the validator

```bash
node bin/mednotate.js validate test/fixtures/sample-note.txt
```

Expected output for a valid note:

```
Validating: /Users/kylebush/mednotate/test/fixtures/sample-note.txt

  PASS  File must not be empty
  PASS  File must be under 50,000 characters
  PASS  Must contain at least one date pattern
  PASS  Must contain at least one clinical keyword

All 4 rules passed. The note is valid.
```

The command exits with code `0` when all rules pass.

### What a failed validation looks like

If a note does not meet one or more rules, each failure is reported with a specific reason:

```
Validating: /Users/kylebush/mednotate/notes/incomplete.txt

  PASS  File must not be empty
  PASS  File must be under 50,000 characters
  FAIL  Must contain at least one date pattern
  FAIL  Must contain at least one clinical keyword

2 rules failed. The note is invalid.
```

The command exits with code `2` on failure. In a shell script or pipeline, you can check this exit code before running `annotate`:

```bash
node bin/mednotate.js validate notes/visit.txt && node bin/mednotate.js annotate notes/visit.txt
```

This runs `annotate` only if `validate` exits cleanly.

### Validation rules

| Rule | What it checks |
|---|---|
| File must not be empty | File contains at least one character |
| File must be under 50,000 characters | File does not exceed the maximum supported size |
| Must contain at least one date pattern | File includes a date in `MM/DD/YYYY`, `YYYY-MM-DD`, or written format |
| Must contain at least one clinical keyword | File includes one of: `patient`, `dx`, `diagnosis`, `medication`, `rx`, `assessment` |

---

## Troubleshooting

**`node: command not found`**  
Node.js is not installed or not in your PATH. Download it from [nodejs.org](https://nodejs.org) and reopen your terminal.

**`Cannot find module` error on startup**  
Dependencies are not installed. Run `npm install` from inside the `mednotate/` directory.

**`Error: ENOENT: no such file or directory`**  
The file path you passed to `annotate` or `validate` does not exist. Check the path and confirm the file has a `.txt` extension.

**`annotate` runs but the output directory is empty**  
Confirm you are running the command from inside the `mednotate/` project directory. The output path in `mednotate.config.json` is relative to your working directory.

**`export` reports no annotated file found**  
Run `annotate` first to generate an `.annotated.json` file, or use `--input` to point to an existing one.

**Medication entities appear twice in output**  
This is expected behavior in version 1.0.0. See the note in Tutorial 1, Step 4 for an explanation and workaround.

---

## Next Steps

- Review the [CLI Reference](cli-reference.md) for complete command syntax, all flags, and exit code definitions.
- To annotate your own notes, copy a `.txt` file into the project directory and run `mednotate validate <file>` followed by `mednotate annotate <file>`.
- To process multiple notes in sequence, use a shell loop or integrate the CLI into a bash script using the exit code pattern shown in Tutorial 3.
