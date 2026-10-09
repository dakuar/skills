---
description: Report the state of the agent documentation of a project without changing a file
argument-hint: "[path]"
---

Report the state of the agent documentation of the project at the given path. The default is the current project.

Arguments: `$ARGUMENTS`

This command only reads. It does not fix, move or create a file.

1. Run the script of the `docs-audit` skill:
   ```bash
   node "${CLAUDE_PLUGIN_ROOT}/skills/docs-audit/scripts/audit.mjs" <project-path>
   ```
   If Node is not available, do the checks of the "Script checks" section of the `docs-audit` skill by hand.
2. Show the report to the user: the errors first, then the warnings, then the notes. Give the file for each one.
3. If the script reports a possible secret, follow the "Secrets" section of the `docs-audit` skill. Do not print the value.
4. End with the count of errors and warnings.

If the user asks for the fixes afterward, run the `docs-audit` skill. That skill decides which fixes need confirmation.
