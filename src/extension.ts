import * as vscode from "vscode";
import { startServer } from "./server";
import { createOrOpenSolution, writeInputTxt } from "./files";
import { CompetitiveCompanionProblem } from "./problem";

let server: import("http").Server | undefined;

export function activate(context: vscode.ExtensionContext) {
  console.log("[AidenCC] activate() called");

  server = startServer(async (problem: CompetitiveCompanionProblem) => {
    console.log("[AidenCC] received:", problem?.name, problem?.language);

    try {
      await createOrOpenSolution(problem);
      await writeInputTxt(problem);
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