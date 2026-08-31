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

  // 1) Strong URL parse first (Codeforces, AtCoder, CSES)
  for (const u of urlCandidates) {
    // Codeforces
    const mCF =
      u.match(/codeforces\.com\/contest\/(\d+)\/problem\/([A-Za-z][0-9A-Za-z]*)/i) ||
      u.match(/codeforces\.com\/problemset\/problem\/(\d+)\/([A-Za-z][0-9A-Za-z]*)/i) ||
      u.match(/codeforces\.com\/gym\/(\d+)\/problem\/([A-Za-z][0-9A-Za-z]*)/i);
    if (mCF) {
      return `CF${mCF[1]}${mCF[2]}`;
    }

    // AtCoder
    const mAC = u.match(/atcoder\.jp\/.*\/tasks\/([^/?]+)/i);
    if (mAC) {
      return mAC[1];
    }

    // CSES
    const mCSES = u.match(/cses\.fi\/.*\/task\/(\d+)/i);
    if (mCSES) {
      return `CSES${mCSES[1]}`;
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

  // 4) Generic URL fallback
  for (const u of urlCandidates) {
    try {
      const parsedUrl = new URL(u);
      const parts = parsedUrl.pathname.split("/").filter(Boolean);
      if (parts.length > 0) {
        return parts[parts.length - 1];
      }
    } catch {
      // ignore invalid URL
    }
  }

  // 5) Fallback to sanitized name
  return sanitizeFileName(name);
}
export async function createOrOpenSolution(problem: CompetitiveCompanionProblem): Promise<string> {
  const langKey = normalizeLanguage(problem.language as string | undefined);
  const map = getLanguageMap();
  const lang = map[langKey] || map["cpp"];
  if (!lang) throw new Error(`No language mapping found for "${langKey}".`);

  const templateDir = getTemplateDirectory();
  const templatePath = path.join(templateDir, lang.template);

  const templateContent = await fs.readFile(templatePath, "utf8");

  const cfg = vscode.workspace.getConfiguration("aidenCompetitiveCompanion");
  const fixedFileName = cfg.get<string>("fixedFileName", "").trim();

  let fileName = "";
  if (fixedFileName) {
    fileName = fixedFileName;
  } else {
    const baseName = detectPreferredBaseName(problem) ?? sanitizeFileName(problem.name);
    const safeBaseName = sanitizeFileName(baseName);
    fileName = `${safeBaseName}${lang.extension}`;
  }

  const fullPath = path.join(getWorkspaceRoot(), fileName);

  let shouldWrite = true;
  if (!fixedFileName) {
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
  }

  if (shouldWrite) {
    await fs.writeFile(fullPath, templateContent, "utf8");
  }

  return fullPath;
}

export async function writeInputTxt(problem: CompetitiveCompanionProblem): Promise<string> {
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
  return inputPath;
}

export async function writeOutputTxt(problem: CompetitiveCompanionProblem): Promise<string> {
  const root = getWorkspaceRoot();
  const outputPath = path.join(root, "output.txt");

  const cfg = vscode.workspace.getConfiguration("aidenCompetitiveCompanion");
  const mode = cfg.get<string>("inputMode", "first");
  const tests = problem.tests || [];

  let content = "";
  if (tests.length > 0) {
    if (mode === "all") {
      content = tests.map(t => t.output ?? "").join("\n");
    } else {
      content = tests[0]?.output ?? "";
    }
  }

  await fs.writeFile(outputPath, content, "utf8");
  return outputPath;
}