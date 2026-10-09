---
name: docs-audit
description: Audits the agent documentation of a project - CLAUDE.md, AGENTS.md, MEMORY.md, ARCHIVE.md, logs.md and docs/. Checks line limits, broken pointers, misplaced entries, documents that no instruction points to, missing .env.example and secrets in Markdown. Fixes the mechanical problems and proposes the rest. Use this skill when the user asks to audit, clean, trim or review project documentation or memory files, when MEMORY.md or AGENTS.md grows past its limit, and after a large refactor that moved files.
---

# docs-audit

Keep the documentation that every session loads short and true. Report first. Fix only what is mechanical. Propose the rest and wait.

## Limits

| File | Loaded every session | Limit |
| --- | --- | --- |
| `CLAUDE.md` | Yes | The 2 imports: `@AGENTS.md` and `@MEMORY.md` |
| `AGENTS.md` | Yes | 200 lines |
| `MEMORY.md` | Yes | 150 lines |
| `ARCHIVE.md`, `logs.md`, `docs/` | No | None |

Never raise a limit. Archive or split instead.

## Steps

1. **Run the script.** It reads the project and changes nothing.
   ```bash
   node <skill-folder>/scripts/audit.mjs <project-path>
   ```
   If Node is not available, do the checks of the "Script checks" section by hand.
2. **Review what the script cannot judge.** Read `AGENTS.md` and `MEMORY.md` in full:
   - A prescriptive entry in `MEMORY.md` ("always", "never", "do not") belongs in `AGENTS.md`.
   - A fact that can change in `AGENTS.md` (a status, a count, a date, a pending task) belongs in `MEMORY.md`.
   - The same entry in two files: keep one and point to it.
   - A statement that the code contradicts. Check the commands, the paths and the stack that the files name against the manifest and the folders.
   - A value copied from code into `docs/design.md` or `docs/backend.md`. The document must point to the code.
3. **Show the report.** Give the errors first, then the warnings, then the proposals. Give the file and the line for each one.
4. **Apply the mechanical fixes** of the next section.
5. **Propose the fixes that need judgment** and wait for the answer of the user.
6. **Run the script again.** Report the count of errors before and after.
7. **Add an entry to `logs.md`** when you changed a file.

## Fix without asking

These fixes do not change what an agent does, and version control can undo them:

- `MEMORY.md` over its limit: move the oldest entries that no longer change the work to `ARCHIVE.md`. Create `ARCHIVE.md` if it does not exist. Write each entry as it was, under a heading with the date of today, and add what replaced it.
- A pointer to a file that was renamed or moved, when exactly one file in the project has that name: update the pointer.
- `CLAUDE.md` without an import of `AGENTS.md` or `MEMORY.md`: add the import.
- `logs.md` with entries out of order: sort them, newest first.
- A file in `docs/` that `AGENTS.md` does not point to: add a row to the routing table.

If the project does not use version control, ask before the first fix.

## Propose and wait

- Move an entry between `AGENTS.md` and `MEMORY.md`. This changes what the agent obeys.
- Move a section of `AGENTS.md` to `docs/` to return under the limit. Propose the section that the fewest tasks need.
- Delete or merge a document.
- Rename a file in `docs/`.
- Rewrite a statement that the code contradicts, when you cannot tell which one is right.

## Secrets

If the script reports a possible secret:

1. Tell the user at once. Give the file and the line. Do not print the value.
2. Do not move the value to another file, and do not commit.
3. Tell the user to rotate the credential. A value that reached a commit stays in the history.

## Script checks

- `CLAUDE.md`, `AGENTS.md`, `MEMORY.md` and `logs.md` exist.
- `CLAUDE.md` imports `@AGENTS.md` and `@MEMORY.md`, and does not import `ARCHIVE.md` or `logs.md`.
- `AGENTS.md` and `MEMORY.md` are within their limits. The script warns at 90%.
- `MEMORY.md` starts with a "Current state" section, and no entry is longer than 320 characters.
- Entries of `MEMORY.md` that read like rules, and entries dated more than 90 days ago. These are candidates, not errors.
- `logs.md` has dated headings, newest first.
- Every `.md` path in backticks and every relative Markdown link leads to a file that exists.
- Every `npm run <name>` in `AGENTS.md` and `README.md` is a script of `package.json`.
- `AGENTS.md` points to every file of `docs/`.
- The project root holds only the standard `.md` files, and the files of `docs/` use lowercase ASCII names.
- `.env.example` exists when a `.env` file exists, and `.gitignore` excludes `.env` files.
- No `.md` file contains a string that looks like a credential.

The script skips dependency, build and data folders. It also skips a subfolder with its own manifest or its own `AGENTS.md`: audit that subproject separately.

To exclude copies of third-party documents, write one path prefix per line in `.docsauditignore` at the project root. Example: `docs/vendor/`.
