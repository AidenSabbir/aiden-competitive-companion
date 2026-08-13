import * as http from "http";
import * as vscode from "vscode";
import { CompetitiveCompanionProblem } from "./problem";

export function startServer(onProblem: (p: CompetitiveCompanionProblem) => Promise<void>): http.Server {
  const cfg = vscode.workspace.getConfiguration("aidenCompetitiveCompanion");
  const host = cfg.get<string>("host", "127.0.0.1");
  const port = cfg.get<number>("port", 27121);

  const server = http.createServer((req, res) => {
    if (req.method !== "POST") {
      res.statusCode = 405;
      return res.end("Method Not Allowed");
    }

    let body = "";
    req.on("data", chunk => (body += chunk.toString()));
    req.on("end", async () => {
      try {
        const problem = JSON.parse(body) as CompetitiveCompanionProblem;
        if (!problem?.name) throw new Error("Invalid payload: missing name");
        await onProblem(problem);
        res.statusCode = 200;
        res.end("OK");
      } catch (e) {
        res.statusCode = 400;
        res.end(`Bad Request: ${(e as Error).message}`);
      }
    });
  });

  server.listen(port, host, () => {
    vscode.window.showInformationMessage(`Aiden CC listening on ${host}:${port}`);
  });

  return server;
}