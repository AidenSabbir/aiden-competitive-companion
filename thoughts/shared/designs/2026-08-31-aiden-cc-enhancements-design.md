---
date: 2026-08-31
topic: "Aiden CC Enhancements: Judges, Fixed File Mode, and Quick UI"
status: validated
---

## Problem Statement
The current extension is heavily biased towards Codeforces naming conventions, failing to generate clean filenames for other judges like AtCoder or CSES. Additionally, competitive programmers need extreme speed; navigating standard VS Code settings menus to change behaviors (like switching to a single fixed overwrite file) is too slow. Finally, users need a fast way to initialize local build tasks.

## Constraints
- Must remain a lightweight bridge.
- Must not break existing Codeforces functionality.
- UI additions must be unobtrusive (Status Bar and QuickPick).

## Approach
1. **Robust URL Parsing**: Upgrade the URL parser to handle AtCoder, CSES, and a generic fallback based on the last URL segment.
2. **Fixed File Mode**: Introduce a setting that bypasses dynamic naming and warning prompts, always overwriting a specific file (e.g., `main.cpp`).
3. **Quick Settings UI**: Add a Status Bar item that opens a QuickPick menu, allowing instant toggling of the fixed file mode and input extraction mode.
4. **Workspace Initialization**: Add a command to scaffold a `.vscode/tasks.json` file with a pre-defined C++ build and run configuration.

## Architecture
- **`src/extension.ts`**: Will initialize the Status Bar item on activation and register the new commands (`aiden.initWorkspace`, `aiden.quickSettings`).
- **`src/files.ts`**: `detectPreferredBaseName` will be expanded with regexes for AtCoder and CSES. `createOrOpenSolution` will check the new `fixedFileName` configuration before falling back to dynamic naming, and will skip the overwrite prompt if `fixedFileName` is active.
- **`src/commands.ts` (New)**: Will encapsulate the logic for the QuickPick menu, configuration updating, and the `.vscode/tasks.json` scaffolding.

## Components
- **Status Bar Item**: Displays current mode (e.g., `Aiden: Dynamic` or `Aiden: main.cpp`). Clicking triggers `aiden.quickSettings`.
- **QuickPick Menu**: Presents options: "Set Fixed File Name" and "Toggle Input Mode". Updates `vscode.workspace.getConfiguration` programmatically.
- **Init Command**: Uses `fs` to ensure `.vscode` exists and writes the user-provided `tasks.json`.

## Data Flow
1. User clicks Status Bar -> QuickPick opens -> User selects option -> `workspace.getConfiguration().update()` is called -> Status Bar updates.
2. Companion sends POST -> `server.ts` receives -> `files.ts` checks `fixedFileName`. If set, overwrites immediately. If not, parses URL/Name for dynamic filename and prompts if exists.

## Error Handling
- If `.vscode/tasks.json` already exists during Init, prompt the user before overwriting to prevent data loss.
- Gracefully handle malformed URLs in the generic fallback parser.

## Testing Strategy
- Verify Codeforces parsing still works.
- Verify AtCoder and CSES URLs generate correct names.
- Verify setting a fixed file name skips prompts and overwrites correctly.
- Verify the Status Bar updates immediately when settings change.
