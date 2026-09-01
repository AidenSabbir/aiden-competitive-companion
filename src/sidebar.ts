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
        const templateDir = cfg.get<string>("templateDirectory", "").trim();

        const initItem = new vscode.TreeItem("Init Workspace", vscode.TreeItemCollapsibleState.None);
        initItem.description = "tasks.json";
        initItem.command = { command: "aiden-competitive-companion.initWorkspace", title: "Init Workspace" };
        initItem.iconPath = new vscode.ThemeIcon("new-folder");
        initItem.tooltip = "Creates .vscode/tasks.json for building and running code";

        const templateDirItem = new vscode.TreeItem("Template Directory", vscode.TreeItemCollapsibleState.None);
        templateDirItem.description = templateDir || 'Default';
        templateDirItem.command = { command: "aiden-competitive-companion.setTemplateDirectory", title: "Set Template Directory" };
        templateDirItem.iconPath = new vscode.ThemeIcon("folder");
        templateDirItem.tooltip = "Click to change template directory";

        const fixedFileItem = new vscode.TreeItem("Fixed File", vscode.TreeItemCollapsibleState.None);
        fixedFileItem.description = fixedFileName || 'Dynamic (Off)';
        fixedFileItem.command = { command: "aiden-competitive-companion.setFixedFile", title: "Set Fixed File" };
        fixedFileItem.iconPath = new vscode.ThemeIcon("file-code");
        fixedFileItem.tooltip = "Click to change fixed file mode";

        const inputModeItem = new vscode.TreeItem("Input Mode", vscode.TreeItemCollapsibleState.None);
        inputModeItem.description = inputMode;
        inputModeItem.command = { command: "aiden-competitive-companion.toggleInputMode", title: "Toggle Input Mode" };
        inputModeItem.iconPath = new vscode.ThemeIcon("list-selection");
        inputModeItem.tooltip = "Click to toggle between first test only and all tests";

        const layoutItem = new vscode.TreeItem("Layout", vscode.TreeItemCollapsibleState.None);
        layoutItem.description = layout;
        layoutItem.command = { command: "aiden-competitive-companion.toggleLayout", title: "Toggle Layout" };
        layoutItem.iconPath = new vscode.ThemeIcon("layout");
        layoutItem.tooltip = "Click to cycle through window layouts";

        const clearIOItem = new vscode.TreeItem("Clear I/O", vscode.TreeItemCollapsibleState.None);
        clearIOItem.command = { command: "aiden-competitive-companion.clearIO", title: "Clear IO" };
        clearIOItem.iconPath = new vscode.ThemeIcon("clear-all");
        clearIOItem.tooltip = "Empties the contents of input.txt and output.txt";

        return Promise.resolve([initItem, templateDirItem, fixedFileItem, inputModeItem, layoutItem, clearIOItem]);
    }
}
