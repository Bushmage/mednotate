# MedNotate

![version](https://img.shields.io/badge/version-1.0.0-blue) ![license](https://img.shields.io/badge/license-MIT-green) ![node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)

A command-line tool for extracting structured entities from plain-text clinical notes. MedNotate parses diagnoses, medications, dates, and providers and exports results to JSON, CSV, or HL7 format — no EHR connection required.

---

## Features

- Extracts four entity types: diagnoses, medications, dates, and providers
- Detects ICD-10 codes, label-triggered terms, and drug name patterns
- Exports to JSON, CSV, or HL7 v2.x OBX format
- Validates note files against a clinical schema before processing
- Runs entirely local — no API keys, no external dependencies

---

## Quickstart

```bash
# Clone and install
git clone https://github.com/bushmage/mednotate.git
cd mednotate
npm install

# Initialize config
node bin/mednotate.js init

# Annotate a note
node bin/mednotate.js annotate test/fixtures/sample-note.txt

# Export to JSON
node bin/mednotate.js export --format json
```

---

## Commands

| Command | Description |
|---|---|
| `mednotate init` | Create a `mednotate.config.json` file in the current directory |
| `mednotate annotate <file>` | Parse a `.txt` clinical note and extract structured entities |
| `mednotate export --format <json\|csv\|hl7>` | Convert annotated output to the specified format |
| `mednotate validate <file>` | Check a note file against the validation schema |

---

## Documentation

- [User Guide](docs/user-guide.md) — Installation, tutorials, and troubleshooting
- [CLI Reference](docs/cli-reference.md) — Complete command syntax, flags, and exit codes

---

## License

MIT
