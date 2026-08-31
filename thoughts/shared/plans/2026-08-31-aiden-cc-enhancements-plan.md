# Implementation Plan: Aiden CC Enhancements

## 1. Update Configuration (package.json)
- Add `aidenCompetitiveCompanion.fixedFileName` (string, default: "") to `contributes.configuration`.
- Add commands to `contributes.commands`:
  - `aiden-competitive-companion.quickSettings` (Title: "Aiden CC: Quick Settings")
  - `aiden-competitive-companion.initWorkspace` (Title: "Aiden CC: Init Workspace")

## 2. Enhance URL Parsing (src/files.ts)
- Update `detectPreferredBaseName(problem)`:
  - Add AtCoder regex (`atcoder\.jp/.*/tasks/([^/?]+)`) -> return match group.
  - Add CSES regex (`cses\.fi/.*/task/(\d+)`) -> return `CSES${match}`.
  - Add Generic URL fallback: take the last segment of the URL path before query parameters.
  - Add fallback to sanitize `problem.name` instead of returning `null`.

## 3. Implement Fixed File Mode (src/files.ts)
- In `createOrOpenSolution`:
  - Read `fixedFileName` from config.
  - If `fixedFileName` is set and not empty, use it as `fileName` (bypassing language extension mapping and base name detection).
  - If `fixedFileName` is used, skip the `fs.access` check and warning prompt (force overwrite).

## 4. Implement Commands and Status Bar (src/commands.ts)
- Create `src/commands.ts`.
- Implement `registerCommands(context: vscode.ExtensionContext)`:
  - Create a `vscode.StatusBarItem` (alignment Right).
  - Update its text based on `fixedFileName` (e.g., `Aiden: [Dynamic]` or `Aiden: [main.cpp]`).
  - Listen to `vscode.workspace.onDidChangeConfiguration` to update the Status Bar when settings change.
  - Implement `aiden-competitive-companion.quickSettings` command:
    - Show `vscode.window.showQuickPick` with options: "Set Fixed File Name", "Toggle Input Mode (first/all)".
    - Handle selection and update workspace configuration.
  - Implement `aiden-competitive-companion.initWorkspace` command:
    - Check if workspace exists.
    - Create `.vscode` directory if missing.
    - Check if `.vscode/tasks.json` exists. Prompt if it does.
    - Write the provided `tasks.json` string to the file.

## 5. Wire up Commands (src/extension.ts)
- Import and call `registerCommands(context)` in `activate`.