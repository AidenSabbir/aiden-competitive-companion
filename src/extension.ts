import * as vscode from "vscode";
import { startServer } from "./server";
import { createOrOpenSolution, writeInputTxt, writeOutputTxt } from "./files";
import { CompetitiveCompanionProblem } from "./problem";
import { registerCommands } from "./commands";

let server: import("http").Server | undefined;

export function activate(context: vscode.ExtensionContext) {
  console.log("[AidenCC] activate() called");

  registerCommands(context);

  server = startServer(async (problem: CompetitiveCompanionProblem) => {
    console.log("[AidenCC] received:", problem?.name, problem?.language);

    try {
      const docPath = await createOrOpenSolution(problem);
      const inputPath = await writeInputTxt(problem);
      const outputPath = await writeOutputTxt(problem);
      
      const cfg = vscode.workspace.getConfiguration("aidenCompetitiveCompanion");
      const layout = cfg.get<string>("layout", "source-input/output");

      const srcDoc = await vscode.workspace.openTextDocument(docPath);
      const inputDoc = await vscode.workspace.openTextDocument(inputPath);
      const outputDoc = await vscode.workspace.openTextDocument(outputPath);

      // We use vscode.setEditorLayout to deterministically create the grid.
      // Group indices (ViewColumn 1, 2, 3) map to the leaf nodes in the layout definition.

      if (layout === "none") {
        await vscode.commands.executeCommand("vscode.setEditorLayout", { orientation: 0, groups: [{}] });
        await vscode.window.showTextDocument(srcDoc, { viewColumn: vscode.ViewColumn.One });
      } 
      else if (layout === "source-input") {
        await vscode.commands.executeCommand("vscode.setEditorLayout", { 
          orientation: 0, 
          groups: [{ size: 0.5 }, { size: 0.5 }] 
        });
        await vscode.window.showTextDocument(srcDoc, { viewColumn: vscode.ViewColumn.One });
        await vscode.window.showTextDocument(inputDoc, { viewColumn: vscode.ViewColumn.Two, preserveFocus: true });
      } 
      else if (layout === "source-input-output") {
        await vscode.commands.executeCommand("vscode.setEditorLayout", { 
          orientation: 0, 
          groups: [{ size: 0.33 }, { size: 0.33 }, { size: 0.33 }] 
        });
        await vscode.window.showTextDocument(srcDoc, { viewColumn: vscode.ViewColumn.One });
        await vscode.window.showTextDocument(inputDoc, { viewColumn: vscode.ViewColumn.Two, preserveFocus: true });
        await vscode.window.showTextDocument(outputDoc, { viewColumn: vscode.ViewColumn.Three, preserveFocus: true });
      } 
      else if (layout === "source-input/output") {
        await vscode.commands.executeCommand("vscode.setEditorLayout", {
          orientation: 0,
          groups: [
            { size: 0.5 },
            { groups: [{}, {}], orientation: 1, size: 0.5 }
          ]
        });
        // Col 1: Left (Source)
        await vscode.window.showTextDocument(srcDoc, { viewColumn: vscode.ViewColumn.One });
        // Col 2: Top Right (Input)
        await vscode.window.showTextDocument(inputDoc, { viewColumn: vscode.ViewColumn.Two, preserveFocus: true });
        // Col 3: Bottom Right (Output)
        await vscode.window.showTextDocument(outputDoc, { viewColumn: vscode.ViewColumn.Three, preserveFocus: true });
      } 
      else if (layout === "input/output-source") {
        await vscode.commands.executeCommand("vscode.setEditorLayout", {
          orientation: 0,
          groups: [
            { groups: [{}, {}], orientation: 1, size: 0.5 },
            { size: 0.5 }
          ]
        });
        // Col 1: Top Left (Input)
        await vscode.window.showTextDocument(inputDoc, { viewColumn: vscode.ViewColumn.One, preserveFocus: true });
        // Col 2: Bottom Left (Output)
        await vscode.window.showTextDocument(outputDoc, { viewColumn: vscode.ViewColumn.Two, preserveFocus: true });
        // Col 3: Right (Source)
        await vscode.window.showTextDocument(srcDoc, { viewColumn: vscode.ViewColumn.Three });
      }

      vscode.window.showInformationMessage(`Imported: ${problem.name}`);
    } catch (err) {
      const msg = (err as Error).message;
      console.error("[AidenCC] import failed:", msg);
      vscode.window.showErrorMessage(`Import failed: ${msg}`);
    }
  });

  context.subscriptions.push({
    dispose: () => server?.close()
  });
}

export function deactivate() {
  server?.close();
}