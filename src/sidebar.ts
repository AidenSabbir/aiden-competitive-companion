import * as vscode from 'vscode';
import * as path from 'path';

export class AidenCCProvider implements vscode.TreeDataProvider<vscode.TreeItem> {
    private _onDidChangeTreeData: vscode.EventEmitter<vscode.TreeItem | undefined | void> = new vscode.EventEmitter<vscode.TreeItem | undefined | void>();
    readonly onDidChangeTreeData: vscode.Event<vscode.TreeItem | undefined | void> = this._onDidChangeTreeData.event;

    constructor() {
        vscode.workspace.onDidChangeConfiguration(e => {
            if (e.affectsConfiguration("aidenCompetitiveCompanion")) {
                this.refresh();
            }
        });
    }

    refresh(): void {
        this._onDidChangeTreeData.fire();
    }

    getTreeItem(element: vscode.TreeItem): vscode.TreeItem {
        return element;
    }

    getChildren(element?: vscode.TreeItem): Thenable<vscode.TreeItem[]> {
        if (!element) {
            const actionsGroup = new vscode.TreeItem("Actions", vscode.TreeItemCollapsibleState.Expanded);
            const settingsGroup = new vscode.TreeItem("Configuration", vscode.TreeItemCollapsibleState.Expanded);
            return Promise.resolve([actionsGroup, settingsGroup]);
        }

        if (element.label === "Actions") {
            const initItem = new vscode.TreeItem("Initialize Workspace", vscode.TreeItemCollapsibleState.None);
            initItem.command = { command: "aiden-competitive-companion.initWorkspace", title: "Init Workspace" };
            initItem.iconPath = new vscode.ThemeIcon("rocket");
            initItem.tooltip = "Creates .vscode/tasks.json for building and running code";

            const openProblemItem = new vscode.TreeItem("Open Problem in Browser", vscode.TreeItemCollapsibleState.None);
            openProblemItem.command = { command: "aiden-competitive-companion.openProblem", title: "Open Problem" };
            openProblemItem.iconPath = new vscode.ThemeIcon("globe");
            openProblemItem.tooltip = "Opens the last received problem in your default web browser";

            const clearIOItem = new vscode.TreeItem("Clear I/O Files", vscode.TreeItemCollapsibleState.None);
            clearIOItem.command = { command: "aiden-competitive-companion.clearIO", title: "Clear IO" };
            clearIOItem.iconPath = new vscode.ThemeIcon("trash");
            clearIOItem.tooltip = "Empties the contents of input.txt and output.txt";

            return Promise.resolve([initItem, openProblemItem, clearIOItem]);
        }

        if (element.label === "Configuration") {
            const cfg = vscode.workspace.getConfiguration("aidenCompetitiveCompanion");
            const fixedFileName = cfg.get<string>("fixedFileName", "").trim();
            const inputMode = cfg.get<string>("inputMode", "first");
            const layout = cfg.get<string>("layout", "source-input/output");
            const templateDir = cfg.get<string>("templateDirectory", "").trim();

            const templateDirItem = new vscode.TreeItem("Template Folder", vscode.TreeItemCollapsibleState.None);
            templateDirItem.description = templateDir ? `.../${path.basename(templateDir)}` : 'Default';
            templateDirItem.command = { command: "aiden-competitive-companion.setTemplateDirectory", title: "Set Template Directory" };
            templateDirItem.iconPath = new vscode.ThemeIcon("folder-library");
            templateDirItem.tooltip = templateDir || "Click to change template directory";

            const fixedFileItem = new vscode.TreeItem("File Naming", vscode.TreeItemCollapsibleState.None);
            fixedFileItem.description = fixedFileName || 'Dynamic';
            fixedFileItem.command = { command: "aiden-competitive-companion.setFixedFile", title: "Set Fixed File" };
            fixedFileItem.iconPath = new vscode.ThemeIcon("file-code");
            fixedFileItem.tooltip = "Click to toggle between dynamic naming and a fixed file";

            const inputModeItem = new vscode.TreeItem("Test Cases", vscode.TreeItemCollapsibleState.None);
            inputModeItem.description = inputMode === "first" ? "First Only" : "All Tests";
            inputModeItem.command = { command: "aiden-competitive-companion.toggleInputMode", title: "Toggle Input Mode" };
            inputModeItem.iconPath = new vscode.ThemeIcon("beaker");
            inputModeItem.tooltip = "Click to toggle test case extraction mode";

            let layoutDesc = layout;
            if (layout === "source-input/output") layoutDesc = "Grid (Default)";
            else if (layout === "input/output-source") layoutDesc = "Grid (Reversed)";
            else if (layout === "source-input-output") layoutDesc = "3 Columns";
            else if (layout === "source-input") layoutDesc = "2 Columns";
            else if (layout === "none") layoutDesc = "Single Window";

            const layoutItem = new vscode.TreeItem("Window Layout", vscode.TreeItemCollapsibleState.None);
            layoutItem.description = layoutDesc;
            layoutItem.command = { command: "aiden-competitive-companion.toggleLayout", title: "Toggle Layout" };
            layoutItem.iconPath = new vscode.ThemeIcon("layout");
            layoutItem.tooltip = "Click to cycle through window layouts";

            return Promise.resolve([templateDirItem, fixedFileItem, inputModeItem, layoutItem]);
        }

        return Promise.resolve([]);
    }
}
