import * as vscode from "vscode";
import * as fs from "fs/promises";
import * as path from "path";
import { AidenCCProvider } from "./sidebar";

import { lastProblemUrl } from "./extension";

let statusBarItem: vscode.StatusBarItem;

export function registerCommands(context: vscode.ExtensionContext) {
  // 1. Create and register the Status Bar Item
  statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
  statusBarItem.command = "aiden-competitive-companion.quickSettings";
  context.subscriptions.push(statusBarItem);
  
  updateStatusBar();
  statusBarItem.show();

  // 2. Register Sidebar Provider
  const sidebarProvider = new AidenCCProvider();
  vscode.window.registerTreeDataProvider('aiden-cc-settings', sidebarProvider);

  // Listen for config changes to update the status bar
  context.subscriptions.push(
    vscode.workspace.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration("aidenCompetitiveCompanion.fixedFileName")) {
        updateStatusBar();
      }
    })
  );

  // 3. Register Individual Commands for Sidebar
  context.subscriptions.push(
    vscode.commands.registerCommand("aiden-competitive-companion.setFixedFile", async () => {
      const cfg = vscode.workspace.getConfiguration("aidenCompetitiveCompanion");
      const currentFixed = cfg.get<string>("fixedFileName", "");
      const newValue = await vscode.window.showInputBox({
        prompt: "Enter a fixed file name (e.g., 'main.cpp') or leave empty for dynamic naming.",
        value: currentFixed
      });

      if (newValue !== undefined) {
        await cfg.update("fixedFileName", newValue.trim(), vscode.ConfigurationTarget.Workspace);
        vscode.window.showInformationMessage(
          newValue.trim() ? `Fixed file name set to: ${newValue.trim()}` : "Fixed file name disabled (Dynamic Mode)."
        );
      }
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("aiden-competitive-companion.setTemplateDirectory", async () => {
      const cfg = vscode.workspace.getConfiguration("aidenCompetitiveCompanion");
      const currentDir = cfg.get<string>("templateDirectory", "");
      const newValue = await vscode.window.showInputBox({
        prompt: "Enter the path to your template directory (or leave empty for default)",
        value: currentDir
      });

      if (newValue !== undefined) {
        await cfg.update("templateDirectory", newValue.trim(), vscode.ConfigurationTarget.Global);
        vscode.window.showInformationMessage(
          newValue.trim() ? `Template directory set to: ${newValue.trim()}` : "Template directory reset to default."
        );
      }
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("aiden-competitive-companion.toggleInputMode", async () => {
      const cfg = vscode.workspace.getConfiguration("aidenCompetitiveCompanion");
      const currentMode = cfg.get<string>("inputMode", "first");
      const newMode = currentMode === "first" ? "all" : "first";
      await cfg.update("inputMode", newMode, vscode.ConfigurationTarget.Workspace);
      vscode.window.showInformationMessage(`Input Mode changed to: ${newMode}`);
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("aiden-competitive-companion.toggleLayout", async () => {
      const cfg = vscode.workspace.getConfiguration("aidenCompetitiveCompanion");
      const current = cfg.get<string>("layout", "source-input/output");
      const layouts = ["none", "source-input", "source-input-output", "source-input/output", "input/output-source"];
      const nextIndex = (layouts.indexOf(current) + 1) % layouts.length;
      const nextLayout = layouts[nextIndex];
      await cfg.update("layout", nextLayout, vscode.ConfigurationTarget.Workspace);
      vscode.window.showInformationMessage(`Layout changed to: ${nextLayout}`);
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("aiden-competitive-companion.clearIO", async () => {
      const folder = vscode.workspace.workspaceFolders?.[0];
      if (!folder) return;
      
      try {
        const inputPath = path.join(folder.uri.fsPath, "input.txt");
        const outputPath = path.join(folder.uri.fsPath, "output.txt");
        await fs.writeFile(inputPath, "", "utf8");
        await fs.writeFile(outputPath, "", "utf8");
        vscode.window.showInformationMessage("Cleared input.txt and output.txt");
      } catch (err) {
        vscode.window.showErrorMessage("Failed to clear IO files");
      }
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("aiden-competitive-companion.openProblem", async () => {
      if (lastProblemUrl) {
        vscode.env.openExternal(vscode.Uri.parse(lastProblemUrl));
      } else {
        vscode.window.showInformationMessage("No problem received yet.");
      }
    })
  );

  // 4. Register Quick Settings Command (Still works from Status Bar)
  context.subscriptions.push(
    vscode.commands.registerCommand("aiden-competitive-companion.quickSettings", async () => {
      const cfg = vscode.workspace.getConfiguration("aidenCompetitiveCompanion");
      const currentFixed = cfg.get<string>("fixedFileName", "");
      const currentMode = cfg.get<string>("inputMode", "first");
      const currentTemplateDir = cfg.get<string>("templateDirectory", "");

      const options = [
        {
          label: "$(folder) Set Template Directory",
          description: currentTemplateDir ? `Currently: ${currentTemplateDir}` : "Currently: Default",
          action: "set_template_dir"
        },
        {
          label: "$(edit) Set Fixed File Name",
          description: currentFixed ? `Currently: ${currentFixed}` : "Currently: Dynamic (Off)",
          action: "set_fixed_file"
        },
        {
          label: "$(list-selection) Toggle Input Mode",
          description: `Currently: ${currentMode} test(s)`,
          action: "toggle_input_mode"
        }
      ];

      const selected = await vscode.window.showQuickPick(options, {
        placeHolder: "Aiden CC: Quick Settings"
      });

      if (!selected) return;

      if (selected.action === "set_template_dir") {
        vscode.commands.executeCommand("aiden-competitive-companion.setTemplateDirectory");
      } else if (selected.action === "set_fixed_file") {
        vscode.commands.executeCommand("aiden-competitive-companion.setFixedFile");
      } else if (selected.action === "toggle_input_mode") {
        vscode.commands.executeCommand("aiden-competitive-companion.toggleInputMode");
      }
    })
  );

  // 5. Register Init Workspace Command
  context.subscriptions.push(
    vscode.commands.registerCommand("aiden-competitive-companion.initWorkspace", async () => {
      const folder = vscode.workspace.workspaceFolders?.[0];
      if (!folder) {
        vscode.window.showErrorMessage("No workspace folder is open.");
        return;
      }

      const rootPath = folder.uri.fsPath;
      const vscodeDir = path.join(rootPath, ".vscode");
      const tasksJsonPath = path.join(vscodeDir, "tasks.json");

      try {
        await fs.mkdir(vscodeDir, { recursive: true });
        
        let shouldWrite = true;
        try {
          await fs.access(tasksJsonPath);
          const action = await vscode.window.showWarningMessage(
            "tasks.json already exists.",
            "Overwrite",
            "Cancel"
          );
          if (action !== "Overwrite") shouldWrite = false;
        } catch {
          // File does not exist, safe to write
        }

        if (shouldWrite) {
          const tasksContent = `{
    "version": "2.0.0",
    "tasks": [
        {
            "label": "build & run",
            "type": "shell",
            "command": "g++ \\"\${fileBasename}\\" -o sol.exe && sol.exe",
            "options": {
                "cwd": "\${fileDirname}",
                "shell": {
                    "executable": "cmd.exe",
                    "args": [
                        "/d",
                        "/c"
                    ]
                }
            },
            "group": {
                "kind": "build",
                "isDefault": true
            },
            "problemMatcher": [
                "$gcc"
            ],
            "presentation": {
                "reveal": "always",
                "panel": "shared",
                "clear": true
            }
        }
    ]
}`;
          await fs.writeFile(tasksJsonPath, tasksContent, "utf8");
          vscode.window.showInformationMessage("Workspace initialized with tasks.json.");
          const doc = await vscode.workspace.openTextDocument(tasksJsonPath);
          await vscode.window.showTextDocument(doc);
        }
      } catch (err) {
        const msg = (err as Error).message;
        vscode.window.showErrorMessage(`Failed to init workspace: ${msg}`);
      }
    })
  );
}

function updateStatusBar() {
  const cfg = vscode.workspace.getConfiguration("aidenCompetitiveCompanion");
  const fixedFileName = cfg.get<string>("fixedFileName", "").trim();
  const port = cfg.get<number>("port", 27121);
  
  if (fixedFileName) {
    statusBarItem.text = `$(plug) Aiden (${port}) | $(file-code) ${fixedFileName}`;
    statusBarItem.tooltip = "Aiden CC is listening. Overwriting fixed file (Click to change settings)";
  } else {
    statusBarItem.text = `$(plug) Aiden (${port}) | $(symbol-variable) Dynamic`;
    statusBarItem.tooltip = "Aiden CC is listening. Dynamic naming (Click to change settings)";
  }
}
