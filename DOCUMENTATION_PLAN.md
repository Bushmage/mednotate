# MedNotate CLI — Documentation Plan
**For: Kyle Bush | Technical Writing & Instructional Design Portfolio**

---

## Purpose

This plan defines the documentation deliverables for the MedNotate CLI project,
establishes the audience and scope for each artifact, and provides a production
checklist so each document can be reviewed and published consistently.

---

## Deliverable 1: User Guide + Tutorial

**File:** `docs/user-guide.md`
**Audience:** Clinical informaticists and health IT staff who are comfortable
with terminals but are not software developers. They understand clinical
terminology and EHR workflows.

**Goal:** Enable a first-time user to install MedNotate, annotate a clinical note,
and export results to JSON — with zero prior experience using the tool.

### Structure

| Section | Content | Notes |
|---|---|---|
| Overview | What MedNotate does and why it matters | 2–3 sentences, no jargon |
| Prerequisites | Node.js version, OS support, required permissions | Exact version numbers |
| Installation | Step-by-step install via npm | Include verification step |
| Tutorial: Annotate Your First Note | Guided walkthrough using the sample note | Numbered steps with terminal output |
| Tutorial: Export to JSON | Run export, open output file, review structure | Show what the output looks like |
| Tutorial: Validate a Note | Run validate, interpret PASS/FAIL output | Cover both outcomes |
| Troubleshooting | Common errors and how to resolve them | At least 5 entries |

### Writing Standards
- Use numbered steps for all procedures
- Show exact terminal commands in code blocks
- Show exact expected output after each command
- Do not assume prior CLI experience for the target audience
- Define clinical terms in context (do not assume the reader knows HL7, ICD-10, etc.)

---

## Deliverable 2: CLI Reference

**File:** `docs/cli-reference.md`
**Audience:** Developers integrating MedNotate into scripts, pipelines, or EHR
workflows. They are comfortable with terminal tools and API-style documentation.

**Goal:** Serve as a complete, authoritative reference for every command, flag,
argument, exit code, and output format. Users should be able to answer any
technical question about the CLI from this document alone.

### Structure

| Section | Content |
|---|---|
| Synopsis | `mednotate <command> [options]` |
| Global Options | `--help`, `--version`, `--config` |
| Commands | One section per command (see below) |
| Exit Codes | Table of all exit codes and meanings |
| Output Formats | JSON schema, CSV schema, HL7 segment spec |
| Configuration | `mednotate.config.json` fields and defaults |
| Environment Variables | Any env vars that affect behavior |

### Per-Command Template (repeat for each command)

```
### mednotate <command>

**Synopsis**
mednotate <command> <args> [options]

**Description**
One paragraph. What it does, when to use it, what it produces.

**Arguments**
| Argument | Required | Description |
|---|---|---|

**Options / Flags**
| Flag | Default | Description |
|---|---|---|

**Exit Codes**
| Code | Meaning |
|---|---|

**Example**
$ mednotate <command> ./notes/patient-visit.txt
[expected output]

**Notes / Edge Cases**
Any gotchas, limits, or non-obvious behavior.
```

### Writing Standards
- Every flag must have a description, default value, and example
- Every example must be copy-pasteable and produce documented output
- Do not include opinions or marketing language
- Use present tense ("Returns", "Writes", "Exits")

---

## Deliverable 3: README

**File:** `README.md` (repo root)
**Audience:** Anyone landing on the GitHub repo — developers, hiring managers,
or potential collaborators evaluating the project in 60 seconds.

**Goal:** Communicate what the project is, how to try it immediately, and where
to find deeper documentation — in under 300 words.

### Structure

| Section | Content |
|---|---|
| Project title + badge line | Name, npm version badge, license badge |
| One-liner description | What it does in one sentence |
| Feature list | 4–5 bullet points |
| Quickstart | Install + 2 commands, copy-pasteable |
| Command table | One row per command |
| Documentation links | Links to user guide and CLI reference |
| License | MIT |

---

## Documentation Toolchain

| Tool | Purpose |
|---|---|
| Markdown (`.md`) | All documentation source files |
| GitHub | Primary publication surface |
| `docs/` folder | Houses user guide and CLI reference |
| VS Code + Markdown Preview | Authoring environment |

Optional for portfolio presentation:
- Export to PDF using Pandoc or a Markdown-to-PDF tool
- Host as GitHub Pages site using a simple MkDocs or Docusaurus config

---

## Review Checklist (apply to every deliverable)

- [ ] All commands and flags match the actual implemented CLI
- [ ] All code blocks are copy-pasteable and produce documented output
- [ ] No unexplained acronyms (ICD-10, HL7, EHR defined on first use)
- [ ] Numbered steps used for all procedures
- [ ] Expected output shown after every command example
- [ ] File has a clear title, version, and last-updated date in the header
- [ ] Spelling and grammar pass (Grammarly or equivalent)
- [ ] Reviewed against the actual running CLI at least once

---

## Timeline (suggested)

| Phase | Task | When |
|---|---|---|
| 1 | Run Claude Code with CLAUDE.md; confirm build passes | Day 1 |
| 2 | Draft CLI Reference from actual implemented commands | Day 2 |
| 3 | Draft User Guide; run through tutorial yourself end-to-end | Day 3 |
| 4 | Draft README | Day 3 |
| 5 | Review all docs against running CLI; fix discrepancies | Day 4 |
| 6 | Final proofread; publish to GitHub | Day 5 |
