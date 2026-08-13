import * as os from "os";
import * as path from "path";
import * as vscode from "vscode";

export interface LanguageConfig {
  template: string;
  extension: string;
}

const DEFAULT_MAP: Record<string, LanguageConfig> = {
  cpp: { template: "cpp.cpp", extension: ".cpp" },
  "c++": { template: "cpp.cpp", extension: ".cpp" },
  python: { template: "py.py", extension: ".py" },
  py: { template: "py.py", extension: ".py" },
  java: { template: "java.java", extension: ".java" },
  c: { template: "c.c", extension: ".c" },
  rust: { template: "rs.rs", extension: ".rs" },
  rs: { template: "rs.rs", extension: ".rs" },
  go: { template: "go.go", extension: ".go" }
};

export function getTemplateDirectory(): string {
  const cfg = vscode.workspace.getConfiguration("aidenCompetitiveCompanion");
  const configured = cfg.get<string>("templateDirectory");
  return configured?.trim() || path.join(os.homedir(), "Documents", "templates");
}

export function getLanguageMap(): Record<string, LanguageConfig> {
  const cfg = vscode.workspace.getConfiguration("aidenCompetitiveCompanion");
  const userMap = cfg.get<Record<string, LanguageConfig>>("languageMap");
  return { ...DEFAULT_MAP, ...(userMap || {}) };
}

export function normalizeLanguage(language: string | undefined): string {
  return (language || "cpp").toLowerCase().trim();
}