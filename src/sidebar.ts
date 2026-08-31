import * as vscode from 'vscode';

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
        if (element) {
            return Promise.resolve([]);
        }

        const cfg = vscode.workspace.getConfiguration("aidenCompetitiveCompanion");
        const fixedFileName = cfg.get<string>("fixedFileName", "").trim();
        const inputMode = cfg.get<string>("inputMode", "first");
        const layout = cfg.get<string>("layout", "source-input/output");

        const initItem = new vscode.TreeItem("Init Workspace (tasks.json)", vscode.TreeItemCollapsibleState.None);
        initItem.command = { command: "aiden-competitive-companion.initWorkspace", title: "Init Workspace" };
        initItem.iconPath = new vscode.ThemeIcon("new-folder");
        initItem.tooltip = "Creates .vscode/tasks.json for building and running code";

        const fixedFileItem = new vscode.TreeItem(`Fixed File: ${fixedFileName || 'Dynamic (Off)'}`, vscode.TreeItemCollapsibleState.None);
        fixedFileItem.command = { command: "aiden-competitive-companion.setFixedFile", title: "Set Fixed File" };
        fixedFileItem.iconPath = new vscode.ThemeIcon("file-code");
        fixedFileItem.tooltip = "Click to change fixed file mode";

        const inputModeItem = new vscode.TreeItem(`Input Mode: ${inputMode}`, vscode.TreeItemCollapsibleState.None);
        inputModeItem.command = { command: "aiden-competitive-companion.toggleInputMode", title: "Toggle Input Mode" };
        inputModeItem.iconPath = new vscode.ThemeIcon("list-selection");
        inputModeItem.tooltip = "Click to toggle between first test only and all tests";

        const layoutItem = new vscode.TreeItem(`Layout: ${layout}`, vscode.TreeItemCollapsibleState.None);
        layoutItem.command = { command: "aiden-competitive-companion.toggleLayout", title: "Toggle Layout" };
        layoutItem.iconPath = new vscode.ThemeIcon("layout");
        layoutItem.tooltip = "Click to cycle through window layouts";

        const clearIOItem = new vscode.TreeItem("Clear input/output", vscode.TreeItemCollapsibleState.None);
        clearIOItem.command = { command: "aiden-competitive-companion.clearIO", title: "Clear IO" };
        clearIOItem.iconPath = new vscode.ThemeIcon("clear-all");
        clearIOItem.tooltip = "Empties the contents of input.txt and output.txt";

        return Promise.resolve([initItem, fixedFileItem, inputModeItem, layoutItem, clearIOItem]);
    }
}
