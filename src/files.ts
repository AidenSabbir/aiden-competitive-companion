import * as fs from "fs/promises";
import * as path from "path";
import * as vscode from "vscode";
import { CompetitiveCompanionProblem } from "./problem";
import { getLanguageMap, getTemplateDirectory, normalizeLanguage } from "./template";

export function sanitizeFileName(problemName: string): string {
  // Windows-invalid chars: <>:"/\|?*
  const cleaned = problemName
    .replace(/[<>:"/\\|?*\x00-\x1F]/g, "")
    .replace(/\s+/g, "_")
    .replace(/\.+$/g, "")
    .trim();

  return cleaned || "Problem";
}

function getWorkspaceRoot(): string {
  const folder = vscode.workspace.workspaceFolders?.[0];
  if (!folder) throw new Error("No workspace folder is open.");
  return folder.uri.fsPath;
}
function detectPreferredBaseName(problem: CompetitiveCompanionProblem): string | null {
  const p = problem as any;

  // Collect possible URL fields from payload
  const urlCandidates: string[] = [
    p.url,
    p.href,
    p.link,
    p.group,
    p.source
  ]
    .filter(Boolean)
    .map((v: unknown) => String(v));

  // 1) Strong URL parse first (Codeforces)
  for (const u of urlCandidates) {
    // https://codeforces.com/contest/678/problem/D
    // https://codeforces.com/problemset/problem/678/D
    // https://codeforces.com/gym/123456/problem/A
    const m =
      u.match(/codeforces\.com\/contest\/(\d+)\/problem\/([A-Za-z][0-9A-Za-z]*)/i) ||
      u.match(/codeforces\.com\/problemset\/problem\/(\d+)\/([A-Za-z][0-9A-Za-z]*)/i) ||
      u.match(/codeforces\.com\/gym\/(\d+)\/problem\/([A-Za-z][0-9A-Za-z]*)/i);

    if (m) {
      return `CF${m[1]}${m[2]}`;
    }
  }

  // 2) Fallback explicit fields
  const contestId =
    p.contestId ?? p.contest_id ?? p.contest?.id ?? null;
  const index =
    p.index ?? p.problemIndex ?? p.problem_index ?? null;

  if (contestId && index) return `CF${String(contestId)}${String(index)}`;
  if (index) return String(index);

  // 3) Fallback from name like "D. Problem Name"
  const name = String(problem.name || "");
  const m2 = name.match(/^\s*([A-Za-z][0-9A-Za-z]*)\s*[\.\-:]/);
  if (m2) return m2[1];

  return null;
}
export async function createOrOpenSolution(problem: CompetitiveCompanionProblem): Promise<string> {
  const langKey = normalizeLanguage(problem.language as string | undefined);
  const map = getLanguageMap();
  const lang = map[langKey] || map["cpp"];
  if (!lang) throw new Error(`No language mapping found for "${langKey}".`);

  const templateDir = getTemplateDirectory();
  const templatePath = path.join(templateDir, lang.template);

  const templateContent = await fs.readFile(templatePath, "utf8");

  const baseName = detectPreferredBaseName(problem) ?? sanitizeFileName(problem.name);
  const safeBaseName = sanitizeFileName(baseName);
  const fileName = `${safeBaseName}${lang.extension}`;
  const fullPath = path.join(getWorkspaceRoot(), fileName);

  let shouldWrite = true;
  try {
    await fs.access(fullPath);
    const action = await vscode.window.showWarningMessage(
      `${fileName} already exists.`,
      "Open Existing",
      "Overwrite"
    );
    if (action === "Open Existing") shouldWrite = false;
    else if (action !== "Overwrite") return fullPath; // user cancelled
  } catch {
    // doesn't exist
  }

  if (shouldWrite) {
    await fs.writeFile(fullPath, templateContent, "utf8");
  }

  const doc = await vscode.workspace.openTextDocument(fullPath);
  await vscode.window.showTextDocument(doc);
  return fullPath;
}

export async function writeInputTxt(problem: CompetitiveCompanionProblem): Promise<void> {
  const root = getWorkspaceRoot();
  const inputPath = path.join(root, "input.txt");

  const cfg = vscode.workspace.getConfiguration("aidenCompetitiveCompanion");
  const mode = cfg.get<string>("inputMode", "first");
  const tests = problem.tests || [];

  let content = "";
  if (tests.length > 0) {
    if (mode === "all") {
      content = tests.map(t => t.input ?? "").join("\n");
    } else {
      content = tests[0]?.input ?? "";
    }
  }

  await fs.writeFile(inputPath, content, "utf8");
}