# MedNotate CLI Reference

**Version:** 1.0.0  
**Last updated:** 2026-03-26  
**Repository:** https://github.com/bushmage/mednotate

---

## Synopsis

```
mednotate <command> [arguments] [options]
```

---

## Global Options

| Option | Description |
|---|---|
| `--help` | Display help for any command |
| `--version` | Print the installed version number |

Run `node bin/mednotate.js help <command>` for per-command usage detail.

---

## Commands

- [`init`](#mednotate-init) — Create a configuration file
- [`annotate`](#mednotate-annotate-file) — Extract entities from a clinical note
- [`export`](#mednotate-export) — Convert annotated output to JSON, CSV, or HL7
- [`validate`](#mednotate-validate-file) — Check a note file against the validation schema

---

## mednotate init

Creates a `mednotate.config.json` configuration file in the current working directory.

### Synopsis

```
mednotate init
```

### Description

Writes a default configuration file to the project root. If a config file already exists, the command prompts before overwriting. The config file controls output directory, default export format, and which entity types the parser targets.

### Output

```
Config created: /Users/kylebush/mednotate/mednotate.config.json
```

### Generated File

`mednotate.config.json`:

```json
{
  "outputDir": "./output",
  "defaultFormat": "json",
  "entityTypes": ["diagnosis", "medication", "date", "provider"]
}
```

### Configuration Fields

| Field | Default | Description |
|---|---|---|
| `outputDir` | `"./output"` | Directory where annotated and exported files are written |
| `defaultFormat` | `"json"` | Default export format used when `--format` is not specified |
| `entityTypes` | `["diagnosis", "medication", "date", "provider"]` | Entity types the parser extracts |

### Exit Codes

| Code | Meaning |
|---|---|
| `0` | Config file created or confirmed |
| `1` | Write failed (permissions or path error) |

---

## mednotate annotate \<file\>

Parses a plain-text clinical note and extracts structured entities. Writes the annotated result to the output directory.

### Synopsis

```
mednotate annotate <file>
```

### Arguments

| Argument | Required | Description |
|---|---|---|
| `<file>` | Yes | Path to a `.txt` clinical note file |

### Description

Reads the specified file and runs it through the entity parser. The parser identifies four entity types — diagnoses, medications, dates, and providers — using pattern matching against clinical terminology and formatting conventions. Results are written to `<outputDir>/<filename>.annotated.json`.

The command prints a summary of entities found by type on completion.

### Example

```
$ node bin/mednotate.js annotate test/fixtures/sample-note.txt

✔ Annotated output written to: /Users/kylebush/mednotate/output/sample-note.annotated.json
```

### Output File Structure

Annotated output is written as JSON with the following schema:

```json
{
  "source": "/absolute/path/to/note.txt",
  "annotatedAt": "2026-03-26T21:04:26.529Z",
  "entities": [
    {
      "type": "diagnosis",
      "value": "Community-acquired pneumonia",
      "raw": "Dx: Community-acquired pneumonia",
      "position": 322,
      "confidence": "high"
    }
  ],
  "summary": {
    "diagnosis": 4,
    "medication": 7,
    "date": 4,
    "provider": 3,
    "total": 18
  }
}
```

### Entity Object Fields

| Field | Type | Description |
|---|---|---|
| `type` | string | Entity category: `diagnosis`, `medication`, `date`, or `provider` |
| `value` | string | Extracted entity value, cleaned of label prefixes |
| `raw` | string | Original matched text from the source note |
| `position` | number | Character offset of the match within the source file |
| `confidence` | string | Match confidence: `high` (label-triggered) or `medium` (pattern-triggered) |

### Entity Detection Patterns

| Type | Triggers |
|---|---|
| `diagnosis` | Text following `Dx:`, `Diagnosis:`, or `Assessment:`; ICD-10 code format (e.g., `I10`, `E11.65`) |
| `medication` | Text following `Medications:`, `Med:`, or `Rx:`; drug name suffixes (`-mycin`, `-pril`, `-olol`, `-statin`) |
| `date` | `MM/DD/YYYY`, `YYYY-MM-DD`, and written formats (e.g., `March 28, 2024`) |
| `provider` | `Dr.`, `MD`, `NP`, or `PA` adjacent to a capitalized name |

### Known Behavior: Duplicate Medication Entries

Medications detected by both a label trigger (`Medications:`) and a suffix pattern (`-pril`, `-statin`, `-mycin`) produce two separate entity records — one with `confidence: high` (full dosage string) and one with `confidence: medium` (drug name only). This is expected in version 1.0.0.

**Example:** Lisinopril appears in the output as:

```json
{
  "type": "medication",
  "value": "Lisinopril 10mg daily",
  "confidence": "high"
},
{
  "type": "medication",
  "value": "Lisinopril",
  "confidence": "medium"
}
```

When processing output programmatically, filter by `confidence: high` to retain the most complete record per medication. Deduplication is planned for a future release.

### Exit Codes

| Code | Meaning |
|---|---|
| `0` | Annotation completed successfully |
| `1` | File not found, file is not `.txt`, or read error |

---

## mednotate export

Converts an annotated output file to JSON, CSV, or HL7 format.

### Synopsis

```
mednotate export --format <json|csv|hl7> [--input <file>]
```

### Options

| Option | Required | Default | Description |
|---|---|---|---|
| `--format` | Yes | — | Output format: `json`, `csv`, or `hl7` |
| `--input` | No | Most recent `.annotated.json` in `outputDir` | Path to a specific `.annotated.json` file |

### Description

Reads an annotated output file and writes a converted version to the output directory. If `--input` is not specified, the command uses the most recently modified `.annotated.json` file found in `outputDir`.

Output is written to `<outputDir>/<source-filename>.<format>`.

### Example

```
$ node bin/mednotate.js export --format json

✔ Exported to: /Users/kylebush/mednotate/output/sample-note.json
```

### Format Specifications

**JSON**  
Pretty-printed export of the full annotated output object. Identical in structure to the `.annotated.json` file.

**CSV**  
One row per entity. Header row included.

Columns: `type`, `value`, `position`, `confidence`

Example:
```
type,value,position,confidence
date,03/15/2024,29,high
provider,Dr. Martinez,99,high
diagnosis,I10,260,high
medication,Lisinopril 10mg daily,412,high
```

**HL7**  
One OBX segment per entity, following HL7 v2.x formatting conventions. A comment header identifies the file as a MedNotate export.

```
# MedNotate HL7 v2.x Export
OBX|1|ST|date||03/15/2024|||||||F
OBX|2|ST|provider||Dr. Martinez|||||||F
OBX|3|ST|diagnosis||I10|||||||F
OBX|4|ST|medication||Lisinopril 10mg daily|||||||F
```

> **Note:** HL7 output is intended for review and integration prototyping. It is not a validated HL7 message and should not be submitted to a production EHR system without additional transformation.

### Exit Codes

| Code | Meaning |
|---|---|
| `0` | Export completed successfully |
| `1` | No annotated file found, unrecognized format, or write error |

---

## mednotate validate \<file\>

Checks a plain-text clinical note against the MedNotate validation schema and reports pass/fail results for each rule.

### Synopsis

```
mednotate validate <file>
```

### Arguments

| Argument | Required | Description |
|---|---|---|
| `<file>` | Yes | Path to a `.txt` clinical note file |

### Description

Runs the specified file through four validation rules and prints a result for each. Exits with code `0` if all rules pass, or code `2` if any rule fails. Validation does not modify the file or produce output files.

### Example

```
$ node bin/mednotate.js validate test/fixtures/sample-note.txt

Validating: /Users/kylebush/mednotate/test/fixtures/sample-note.txt

  PASS  File must not be empty
  PASS  File must be under 50,000 characters
  PASS  Must contain at least one date pattern
  PASS  Must contain at least one clinical keyword

All 4 rules passed. The note is valid.
```

### Validation Rules

| Rule | Condition |
|---|---|
| File must not be empty | File contains at least one character |
| File must be under 50,000 characters | File length does not exceed 50,000 characters |
| Must contain at least one date pattern | File contains a date in `MM/DD/YYYY`, `YYYY-MM-DD`, or written format |
| Must contain at least one clinical keyword | File contains one of: `patient`, `dx`, `diagnosis`, `medication`, `rx`, `assessment` |

### Failed Validation Example

```
Validating: /Users/kylebush/mednotate/notes/incomplete.txt

  PASS  File must not be empty
  PASS  File must be under 50,000 characters
  FAIL  Must contain at least one date pattern
  FAIL  Must contain at least one clinical keyword

2 rules failed. The note is invalid.
```

### Exit Codes

| Code | Meaning |
|---|---|
| `0` | All validation rules passed |
| `1` | File not found or could not be read |
| `2` | One or more validation rules failed |

---

## Exit Code Summary

| Code | Meaning |
|---|---|
| `0` | Command completed successfully |
| `1` | Input error — file not found, wrong type, or write failure |
| `2` | Validation failure (validate command only) |

---

## Configuration File Reference

`mednotate.config.json` is created by `mednotate init` and read automatically by all commands.

| Field | Type | Default | Description |
|---|---|---|---|
| `outputDir` | string | `"./output"` | Directory for all output files |
| `defaultFormat` | string | `"json"` | Export format used when `--format` is omitted |
| `entityTypes` | array | `["diagnosis", "medication", "date", "provider"]` | Entity types targeted by the parser |

The config file must be present in the working directory from which `mednotate` is run.
