# <Project name>

<One or two sentences: what the project does and for whom. Stack in one line.>

## Before a change

1. Read `MEMORY.md`. It holds the current state, the facts and the decisions in force.
2. Read the file that the routing table gives for your task.

## After a change

1. Run `<test command>` and `<build command>`. Both must end without errors.
2. Add an entry to `logs.md`: date, change and reason.
3. If the change replaces a fact or a decision, update `MEMORY.md`. Replace the old entry. Do not append.
4. If the change makes a document false, update the document in the same change.

## Routing table

Read a file only when the task requires it.

| Task | Read |
| --- | --- |
| Change the structure or add a module | `docs/architecture.md` |
| <task> | `docs/<file>.md` |

## Where to write

| Entry | File |
| --- | --- |
| Rule: "always", "never", "use", "do not" | `AGENTS.md` |
| Fact or decision that can change | `MEMORY.md` |
| Finished change and its reason | `logs.md` |
| Install, build and run | `README.md` |

- `MEMORY.md` has a limit of 150 lines. At the limit, move the entries that no longer change the work to `ARCHIVE.md`. Do not raise the limit.
- This file has a limit of 200 lines. At the limit, move one section to `docs/` and leave a one-line pointer here.
- `logs.md` and `ARCHIVE.md` are not loaded in a session. Read them only to answer a question about the past.
- Do not write a secret in any `.md` file. Name the environment variable and add it to `.env.example`.

## Commands

| Command | Result |
| --- | --- |
| `<command>` | <result> |

## Rules

- <One rule per line. Include the error that the rule prevents.>
