#!/usr/bin/env node
// Audits the agent documentation structure of a project.
// Usage: node audit.mjs [project-path] [--json]
// Exit code 1 when the report contains an ERROR. No dependencies.

import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { basename, dirname, join, relative, resolve } from "node:path";

const args = process.argv.slice(2);
const asJson = args.includes("--json");
const root = resolve(args.find((a) => !a.startsWith("--")) ?? ".");

const LIMITS = { "AGENTS.md": 200, "MEMORY.md": 150 };
const ROOT_MD = new Set([
  "CLAUDE.md", "AGENTS.md", "MEMORY.md", "ARCHIVE.md", "logs.md", "README.md",
  "LICENSE.md", "CHANGELOG.md", "CONTRIBUTING.md", "CODE_OF_CONDUCT.md", "SECURITY.md",
]);
const SKIP_DIRS = new Set([
  "node_modules", ".git", "dist", "build", "out", ".next", ".venv", "venv",
  "__pycache__", "target", "vendor", "data", "runs", ".cache",
]);
const STALE_DAYS = 90;

// .docsauditignore: one path prefix per line. Use it for copies of third-party documents.
const ignoreFile = join(root, ".docsauditignore");
const ignored = existsSync(ignoreFile)
  ? readFileSync(ignoreFile, "utf8").split(/\r?\n/).map((l) => l.trim()).filter((l) => l && !l.startsWith("#"))
  : [];

const findings = [];
const add = (level, file, message) => findings.push({ level, file, message });
const read = (file) => readFileSync(join(root, file), "utf8");
const has = (file) => existsSync(join(root, file));
const lineCount = (text) => text.replace(/\n$/, "").split("\n").length;

function walk(dir, depth = 0, out = []) {
  if (depth > 6) return out;
  for (const name of readdirSync(dir)) {
    if (SKIP_DIRS.has(name)) continue;
    const full = join(dir, name);
    let stat;
    try { stat = statSync(full); } catch { continue; }
    if (stat.isDirectory()) {
      // A folder with its own manifest or its own AGENTS.md is a separate project.
      const nested =
        ["package.json", "pyproject.toml", "AGENTS.md"].some((f) => existsSync(join(full, f)));
      if (!nested) walk(full, depth + 1, out);
    } else if (name.endsWith(".md")) {
      out.push(relative(root, full).replaceAll("\\", "/"));
    }
  }
  return out;
}

// 1. Required files
for (const file of ["CLAUDE.md", "AGENTS.md", "MEMORY.md", "logs.md"]) {
  if (!has(file)) add("ERROR", file, "Required file is missing.");
}
if (!has("README.md")) add("WARN", "README.md", "File is missing.");

// 2. CLAUDE.md imports
if (has("CLAUDE.md")) {
  const text = read("CLAUDE.md");
  for (const target of ["AGENTS.md", "MEMORY.md"]) {
    if (!new RegExp(`^@${target}\\s*$`, "m").test(text)) {
      add("ERROR", "CLAUDE.md", `Does not import @${target}. Claude Code will not load it.`);
    }
  }
  for (const target of ["ARCHIVE.md", "logs.md"]) {
    if (new RegExp(`^@${target}\\s*$`, "m").test(text)) {
      add("ERROR", "CLAUDE.md", `Imports @${target}. This file must not load in every session.`);
    }
  }
  if (lineCount(text) > 10) {
    add("WARN", "CLAUDE.md", `${lineCount(text)} lines. Keep only the imports here and move the rest to AGENTS.md.`);
  }
}

// 3. Line limits
for (const [file, limit] of Object.entries(LIMITS)) {
  if (!has(file)) continue;
  const lines = lineCount(read(file));
  if (lines > limit) add("ERROR", file, `${lines} lines. Limit: ${limit}.`);
  else if (lines > limit * 0.9) add("WARN", file, `${lines} lines. Limit: ${limit}. Archive or split before the next change.`);
  else add("INFO", file, `${lines} of ${limit} lines.`);
}

// 4. MEMORY.md shape
if (has("MEMORY.md")) {
  const text = read("MEMORY.md");
  const firstH2 = text.match(/^## +(.+)$/m)?.[1] ?? "";
  if (!/current state|estado actual/i.test(firstH2)) {
    add("WARN", "MEMORY.md", `First section is "${firstH2}". Start the file with a "Current state" section.`);
  }
  const today = Date.now();
  let stale = 0;
  text.split("\n").forEach((line, i) => {
    if (/^\s*[-*] /.test(line) && line.length > 320) {
      add("WARN", "MEMORY.md", `Line ${i + 1}: entry has ${line.length} characters. Write 1 or 2 sentences.`);
    }
    const dates = [...line.matchAll(/\b(20\d{2})-(\d{2})-(\d{2})\b/g)].map((m) => Date.parse(m[0]));
    if (dates.length && dates.every((d) => today - d > STALE_DAYS * 864e5)) stale += 1;
    if (/^\s*[-*] .*\b(always|never|do not|don't|must not|siempre|nunca|no (hagas|uses|agregues|añadas|modifiques|escribas|inicies))\b/i.test(line)) {
      add("INFO", "MEMORY.md", `Line ${i + 1}: reads like a rule. Candidate for AGENTS.md. Needs judgment.`);
    }
  });
  if (stale) add("INFO", "MEMORY.md", `${stale} entries are dated more than ${STALE_DAYS} days ago. Candidates for ARCHIVE.md.`);
}

// 5. logs.md order
if (has("logs.md")) {
  const dates = [...read("logs.md").matchAll(/^## +(20\d{2}-\d{2}-\d{2})/gm)].map((m) => m[1]);
  if (!dates.length) add("WARN", "logs.md", 'No entry with a "## YYYY-MM-DD" heading.');
  for (let i = 1; i < dates.length; i += 1) {
    if (dates[i] > dates[i - 1]) {
      add("WARN", "logs.md", `Entry ${dates[i]} is below ${dates[i - 1]}. Keep the newest entry first.`);
      break;
    }
  }
}

// 6. Pointers
const mdFiles = (existsSync(root) ? walk(root) : []).filter((f) => !ignored.some((prefix) => f.startsWith(prefix)));
const scripts = has("package.json") ? Object.keys(JSON.parse(read("package.json")).scripts ?? {}) : null;
for (const file of mdFiles) {
  const text = read(file).replace(/```[\s\S]*?```/g, "");
  // A path in backticks is a pointer only in the files that give instructions.
  // Other documents name files that do not exist on purpose, or files of another project.
  const names = new Set();
  // logs.md and ARCHIVE.md describe the past: they name files that no longer exist.
  if (!file.includes("/") && !["logs.md", "ARCHIVE.md"].includes(file)) {
    for (const m of text.matchAll(/`([\w.\-/]+)`/g)) {
      if (/[\w-]\.md$/.test(m[1]) || /^docs\/./.test(m[1])) names.add(m[1]);
    }
  }
  const links = new Set();
  for (const m of text.matchAll(/\]\((?!https?:|mailto:|#)([^)#\s]+)/g)) links.add(decodeURI(m[1]));
  const exists = (target) => {
    const clean = target.replace(/^\.\//, "");
    return existsSync(join(root, clean)) || existsSync(join(root, dirname(file), clean));
  };
  for (const target of links) {
    if (!exists(target)) add("ERROR", file, `Link to \`${target}\`, which does not exist.`);
  }
  for (const target of names) {
    // ARCHIVE.md is created only when MEMORY.md reaches its limit.
    if (target !== "ARCHIVE.md" && !links.has(target) && !exists(target)) {
      add("WARN", file, `Names \`${target}\`, which does not exist. Fix the pointer, or ignore this if the text says that the file does not exist.`);
    }
  }
  if (scripts && ["AGENTS.md", "README.md"].includes(file)) {
    for (const m of text.matchAll(/`npm run ([\w:.-]+)/g)) {
      if (!scripts.includes(m[1])) add("ERROR", file, `Names \`npm run ${m[1]}\`. package.json has no such script.`);
    }
  }
}

// 7. Files that no instruction points to
const agentsText = has("AGENTS.md") ? read("AGENTS.md") : "";
for (const file of mdFiles.filter((f) => f.startsWith("docs/"))) {
  const inFolder = dirname(file) !== "docs";
  const key = inFolder ? `${dirname(file)}/` : file;
  const viaIndex = inFolder && basename(file) !== "README.md";
  if (viaIndex) continue;
  if (!agentsText.includes(key) && !agentsText.includes(file)) {
    add("WARN", file, "AGENTS.md does not point to this file. No agent will read it.");
  }
}

// 8. Root clutter and file names
for (const file of mdFiles.filter((f) => !f.includes("/"))) {
  if (!ROOT_MD.has(file)) add("WARN", file, "Not a standard root file. Move it to docs/.");
}
for (const file of mdFiles.filter((f) => f.startsWith("docs/"))) {
  const name = basename(file);
  if (name !== "README.md" && !/^[a-z0-9][a-z0-9.-]*\.md$/.test(name)) {
    add("WARN", file, "Use a lowercase ASCII file name with hyphens.");
  }
}

// 9. Environment variables
const rootNames = existsSync(root) ? readdirSync(root) : [];
const envFiles = rootNames.filter((n) => /^\.env(\..+)?$/.test(n) && n !== ".env.example");
if (envFiles.length && !has(".env.example")) {
  add("ERROR", ".env.example", `Missing, but ${envFiles.join(", ")} exists.`);
}
if (envFiles.length && has(".gitignore") && !/^\.env/m.test(read(".gitignore"))) {
  add("ERROR", ".gitignore", "Does not exclude .env files.");
}

// 10. Secrets in Markdown. The report never prints the value.
const SECRET = [
  /AKIA[0-9A-Z]{16}/, /gh[pousr]_[A-Za-z0-9]{30,}/, /sk-[A-Za-z0-9_-]{24,}/, /hf_[A-Za-z0-9]{30,}/,
  /xox[abp]-[A-Za-z0-9-]{20,}/, /-----BEGIN [A-Z ]*PRIVATE KEY-----/, /KGAT_[A-Za-z0-9]{20,}/,
  /\b(password|passwd|secret|token|api[_-]?key)\b\s*[:=]\s*["']?[A-Za-z0-9+/_-]{20,}/i,
];
for (const file of mdFiles) {
  read(file).split("\n").forEach((line, i) => {
    if (SECRET.some((re) => re.test(line))) add("ERROR", file, `Line ${i + 1}: possible secret. Remove it and rotate the credential.`);
  });
}

const order = { ERROR: 0, WARN: 1, INFO: 2 };
findings.sort((a, b) => order[a.level] - order[b.level] || a.file.localeCompare(b.file));
const count = (level) => findings.filter((f) => f.level === level).length;

if (asJson) {
  console.log(JSON.stringify({ root, findings }, null, 2));
} else {
  console.log(`docs-audit: ${root}`);
  for (const f of findings) console.log(`${f.level.padEnd(5)} ${f.file}: ${f.message}`);
  console.log(`\n${count("ERROR")} errors, ${count("WARN")} warnings, ${count("INFO")} notes.`);
}
process.exit(count("ERROR") ? 1 : 0);
