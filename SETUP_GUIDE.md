# How to Build MedNotate with Claude Code
**Step-by-step setup for Kyle Bush**

---

## What You'll Need

- Node.js v18 or higher (check with `node --version`)
- npm (included with Node.js)
- Claude Code installed (`npm install -g @anthropic-ai/claude-code`)
- A terminal (Terminal.app on Mac)
- An Anthropic API key

---

## Step 1: Create the Project Folder

```bash
mkdir mednotate
cd mednotate
```

---

## Step 2: Add the CLAUDE.md File

Copy the `CLAUDE.md` file you received into the `mednotate/` folder.
This is the instruction file Claude Code reads before it starts building.

```bash
# Confirm it's in place
ls CLAUDE.md
```

You should see: `CLAUDE.md`

---

## Step 3: Initialize the npm Project

```bash
npm init -y
```

This creates a `package.json`. Claude Code will update it during the build.

---

## Step 4: Start Claude Code

```bash
claude
```

Claude Code will open in your terminal. You'll see a prompt.

---

## Step 5: Give Claude Code Its Instructions

At the Claude Code prompt, type:

```
Read CLAUDE.md and build the MedNotate CLI exactly as specified.
Start with the folder structure, then implement each command,
then write the tests and fixtures, then the README.
Tell me when each major section is complete.
```

Then let it run. It will:
1. Scaffold the folder structure
2. Implement each command (`init`, `annotate`, `export`, `validate`)
3. Write the parser, formatter, and schema logic
4. Create test fixtures and Jest tests
5. Write the README

This typically takes 5–15 minutes.

---

## Step 6: Run the Tests

When Claude Code finishes, run:

```bash
npm install
npm test
```

You should see Jest output with all tests passing. If any fail, paste the
error output back into Claude Code and ask it to fix the failures.

---

## Step 7: Try It Yourself

Run the CLI against the sample fixture:

```bash
node bin/mednotate.js init
node bin/mednotate.js annotate test/fixtures/sample-note.txt
node bin/mednotate.js export --format json
node bin/mednotate.js validate test/fixtures/sample-note.txt
```

Confirm the output matches what's documented. This is the same verification
you'll do when writing your user guide — use these runs as your source of truth
for terminal output screenshots.

---

## Step 8: Set Up Git and Push to GitHub

```bash
git init
git add .
git commit -m "Initial build: MedNotate CLI"
```

Then create a new repo on GitHub (github.com/bushmage) and push:

```bash
git remote add origin https://github.com/bushmage/mednotate.git
git branch -M main
git push -u origin main
```

---

## Step 9: Create the docs/ Folder

```bash
mkdir docs
```

This is where your `user-guide.md` and `cli-reference.md` will live.
Use the Documentation Plan to write them. Write the CLI reference first —
it forces you to confirm every command and flag is accurate — then write
the user guide against the confirmed reference.

---

## Troubleshooting

**`claude: command not found`**
Claude Code isn't installed or isn't in your PATH.
Run: `npm install -g @anthropic-ai/claude-code`

**`npm test` fails with "Cannot find module"**
Run `npm install` first to install dependencies.

**chalk or ora errors about ESM**
This is a version issue. The CLAUDE.md specifies `chalk@4` and `ora@5`
which are CommonJS-compatible. If Claude Code installed newer versions, run:
```bash
npm install chalk@4 ora@5
```

**Git push rejected**
Make sure the GitHub repo is empty (no auto-generated README) before pushing.
If it isn't, run: `git pull origin main --allow-unrelated-histories` first.
