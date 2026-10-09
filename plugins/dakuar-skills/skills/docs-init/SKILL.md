---
name: docs-init
description: Creates or completes the standard documentation structure of a project for coding agents - CLAUDE.md, AGENTS.md, MEMORY.md, ARCHIVE.md, logs.md and a docs/ folder with architecture, design, deployment, backend, experiments, data and plans. Use this skill when the user starts a new project, asks to set up or standardize project documentation, asks for agent instructions or project memory files, or asks to migrate an existing project to this structure.
---

# docs-init

Give a project one documentation structure that every coding agent can read. Create only what is missing. Never overwrite a file that exists.

## Structure

```text
CLAUDE.md        2 lines: @AGENTS.md and @MEMORY.md
AGENTS.md        rules and instructions. Loaded every session. Max 200 lines
MEMORY.md        current facts and decisions. Loaded every session. Max 150 lines
ARCHIVE.md       entries that left MEMORY.md. Never loaded. No limit
logs.md          one entry per change, with the reason. Never loaded. No limit
README.md        install, build and run, for people
.env.example     required when the project reads environment variables
docs/
  architecture.md   every project
  design.md         web: color, typography and component rules
  deployment.md     web: publish, roll back, production logs
  backend.md        projects with a server: routes, data, environment variables
  experiments.md    ML: experiment log
  data.md           ML: datasets, licenses, where the data lives
  plans/            numbered plans with a status
  <topic>.md        long rules for one topic, read on demand
```

`AGENTS.md` holds the instructions because most agents read it. `CLAUDE.md` only imports it, so Claude Code loads the same text.

## Where each entry goes

| Entry | File |
| --- | --- |
| Prescriptive: "always", "never", "use", "do not". | `AGENTS.md` |
| A fact or decision that can change: status, stack choices, pending tasks. | `MEMORY.md` |
| A fact that is no longer true, or a closed decision. | `ARCHIVE.md` |
| A finished change and its reason. | `logs.md` |
| Rules for one topic that are longer than 30 lines. | `docs/<topic>.md`, with a one-line pointer in `AGENTS.md` |
| Install, build and run steps. | `README.md` |

Write each entry in one file only. Point to it from the others.

## Steps

1. **Detect the project type.** Read the manifest and the folder list.
   - Web: `package.json` with a UI framework, or an `index.html`.
   - Server: a `server/`, `api/` or `backend/` folder, or a server framework in the dependencies.
   - ML: notebooks, `experiments/`, training scripts, or a competition folder.
   - A project can have more than one type. If no type matches, create only the root files and `docs/architecture.md`.
2. **Inventory the documentation.** List every `.md` file outside dependency and build folders. Note files that hold the same content as a standard file under another name or path. Example: `agents/MEMORY.md`, `context/guidelines.md`, `docs/arquitectura.md`.
3. **Write the plan and show it to the user.** Use three lists:
   - Create: standard files that are missing and have real content to hold.
   - Move or rename: existing files that become a standard file. Give the old and the new path.
   - Delete: empty folders and pointer files that the move makes obsolete.
4. **Wait for confirmation** before you move, rename or delete. You can create missing files without confirmation.
5. **Protect the current state.** Warning: a move cannot be undone without version control. If the project uses git, commit the pending work first, or ask the user to. If the project does not use git, propose `git init` and a first commit before any move.
6. **Create the files** from `templates/`. Replace every `<placeholder>` with a fact that you read in the project. If you cannot find the fact, ask. Do not leave a placeholder in a file.
7. **Move and rename** with `git mv` when the project uses git. Then search the whole project for the old paths and update every pointer, including code comments and `README.md`.
8. **Fill the routing table** in `AGENTS.md`: one row per file in `docs/`, with the task that requires it.
9. **Verify.** Run the `docs-audit` skill if it is installed. If it is not, check by hand: `CLAUDE.md` imports both files, no pointer leads to a missing file, and the line limits hold.
10. **Record the change** in `logs.md` and report to the user what you created, moved and deleted.

## Rules

- Create a file only when it has real content. An empty template is noise in every later session. Report the files that you skipped and why.
- Do not create `ARCHIVE.md` until `MEMORY.md` reaches its limit.
- Do not copy values that live in code. `docs/design.md` gives the rules and points to the token file. `docs/backend.md` points to the route files.
- Do not write a secret, a password or a private phone number in any `.md` file. Name the environment variable instead.
- Keep `.env.example` in step with the variables that the code reads. Check that `.gitignore` excludes `.env` and `.env.*` but not `.env.example`.
- Use lowercase ASCII file names with hyphens in `docs/`. Keep `CLAUDE.md`, `AGENTS.md`, `MEMORY.md`, `ARCHIVE.md` and `README.md` in the project root, with these exact names.
- Keep the template headings. Write the content in the language that the project documentation already uses.
- If `templates/<language>/` exists for the language of the project, use those templates instead.
- When you add a section to an existing file, follow the language and style of that file.
- Do not translate or rewrite existing documentation. Move it.
- A subproject with its own manifest and its own `AGENTS.md` keeps its files. Do not merge them into the parent.

## Existing projects

- An `AGENTS.md` or `CLAUDE.md` that already holds the instructions stays as the instructions. If only `CLAUDE.md` exists, rename it to `AGENTS.md` and create the 2-line `CLAUDE.md`.
- If the project keeps a log or a decision record under another name, keep its content and rename the file. Do not start a second file for the same purpose.
- If scripts, tools or other documents depend on the path of an existing document, leave it in place and point to it from the routing table. Example: `experiments/EXPERIMENTS.md` does the job of `docs/experiments.md`.
- Write the "Current state" section from evidence: the last commits, the log and the open plans. If the next step is not known, write "not defined". Do not invent one.
- After `git init`, search the documentation for statements that the project has no version control, and update them.
- If `docs/` holds copies of third-party documents, add their path to `.docsauditignore` so that `docs-audit` skips them.
- Do not move entries between `AGENTS.md` and `MEMORY.md` in this skill. List the entries that look misplaced and let the user decide.
