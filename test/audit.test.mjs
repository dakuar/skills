import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const script = join(root, 'plugins/dakuar-skills/skills/docs-audit/scripts/audit.mjs');

const VALID = {
  'CLAUDE.md': '@AGENTS.md\n@MEMORY.md\n',
  'AGENTS.md': '# Agents\n\n| Task | File |\n| --- | --- |\n| Structure | `docs/architecture.md` |\n',
  'MEMORY.md': '# Memory\n\n## Current state\n\n- The project has one module.\n',
  'logs.md': '# Logs\n\n## 2026-10-02\n\nSecond change.\n\n## 2026-10-01\n\nFirst change.\n',
  'README.md': '# Project\n\nRead [the architecture](docs/architecture.md).\n',
  'docs/architecture.md': '# Architecture\n\nOne module.\n',
};

// Crea un proyecto temporal, ejecuta el script y devuelve el informe.
function audit(files) {
  const project = mkdtempSync(join(tmpdir(), 'docs-audit-'));
  try {
    for (const [path, content] of Object.entries(files)) {
      if (content === null) continue;
      mkdirSync(dirname(join(project, path)), { recursive: true });
      writeFileSync(join(project, path), content);
    }
    const run = spawnSync(process.execPath, [script, project, '--json'], { encoding: 'utf8' });
    const { findings } = JSON.parse(run.stdout);
    return { status: run.status, stdout: run.stdout, findings };
  } finally {
    rmSync(project, { recursive: true, force: true });
  }
}

function errors(report, file) {
  return report.findings.filter((f) => f.level === 'ERROR' && (!file || f.file === file));
}

test('un proyecto válido no tiene errores ni avisos', () => {
  const report = audit(VALID);
  assert.equal(report.status, 0);
  assert.deepEqual(report.findings.filter((f) => f.level !== 'INFO'), []);
});

test('un proyecto vacío informa los 4 archivos obligatorios', () => {
  const report = audit({ 'src/index.js': '' });
  assert.equal(report.status, 1);
  assert.deepEqual(
    errors(report).map((f) => f.file).sort(),
    ['AGENTS.md', 'CLAUDE.md', 'MEMORY.md', 'logs.md'],
  );
});

test('CLAUDE.md sin una importación es un error', () => {
  const report = audit({ ...VALID, 'CLAUDE.md': '@AGENTS.md\n' });
  assert.equal(report.status, 1);
  assert.match(errors(report, 'CLAUDE.md')[0].message, /@MEMORY\.md/);
});

test('CLAUDE.md que importa logs.md es un error', () => {
  const report = audit({ ...VALID, 'CLAUDE.md': '@AGENTS.md\n@MEMORY.md\n@logs.md\n' });
  assert.equal(report.status, 1);
  assert.match(errors(report, 'CLAUDE.md')[0].message, /@logs\.md/);
});

test('MEMORY.md sobre el límite es un error', () => {
  const entries = Array.from({ length: 150 }, (_, i) => `- Entry ${i}.`).join('\n');
  const report = audit({ ...VALID, 'MEMORY.md': `# Memory\n\n## Current state\n\n${entries}\n` });
  assert.equal(report.status, 1);
  assert.match(errors(report, 'MEMORY.md')[0].message, /Limit: 150/);
});

test('MEMORY.md sobre el 90% del límite es un aviso', () => {
  const entries = Array.from({ length: 136 }, (_, i) => `- Entry ${i}.`).join('\n');
  const report = audit({ ...VALID, 'MEMORY.md': `# Memory\n\n## Current state\n\n${entries}\n` });
  assert.equal(report.status, 0);
  assert.ok(report.findings.some((f) => f.level === 'WARN' && f.file === 'MEMORY.md'));
});

test('un enlace a un archivo que no existe es un error', () => {
  const report = audit({ ...VALID, 'README.md': '# Project\n\nRead [the guide](docs/missing.md).\n' });
  assert.equal(report.status, 1);
  assert.match(errors(report, 'README.md')[0].message, /docs\/missing\.md/);
});

test('un archivo de docs/ sin puntero en AGENTS.md es un aviso', () => {
  const report = audit({ ...VALID, 'docs/design.md': '# Design\n' });
  assert.equal(report.status, 0);
  assert.ok(report.findings.some((f) => f.level === 'WARN' && f.file === 'docs/design.md'));
});

test('logs.md con las entradas en orden ascendente es un aviso', () => {
  const report = audit({ ...VALID, 'logs.md': '# Logs\n\n## 2026-10-01\n\nFirst.\n\n## 2026-10-02\n\nSecond.\n' });
  assert.ok(report.findings.some((f) => f.level === 'WARN' && f.file === 'logs.md'));
});

test('un script de npm que no existe es un error', () => {
  const report = audit({
    ...VALID,
    'package.json': '{ "scripts": { "dev": "vite" } }',
    'AGENTS.md': `${VALID['AGENTS.md']}\nRun \`npm run build\` before a commit.\n`,
  });
  assert.equal(report.status, 1);
  assert.match(errors(report, 'AGENTS.md')[0].message, /npm run build/);
});

test('.env sin .env.example es un error', () => {
  const report = audit({ ...VALID, '.env': 'PORT=3000\n', '.gitignore': '.env\n' });
  assert.equal(report.status, 1);
  assert.equal(errors(report, '.env.example').length, 1);
});

test('una credencial es un error y el informe no imprime el valor', () => {
  const value = ['ghp', 'A1b2C3d4E5f6G7h8I9j0K1l2M3n4O5p6Q7r8'].join('_');
  const report = audit({ ...VALID, 'docs/architecture.md': `# Architecture\n\nToken: ${value}\n` });
  assert.equal(report.status, 1);
  assert.match(errors(report, 'docs/architecture.md')[0].message, /Line 3: possible secret/);
  assert.ok(!report.stdout.includes(value));
});

test('.docsauditignore excluye una carpeta', () => {
  const report = audit({
    ...VALID,
    'docs/vendor/guide.md': '# Guide\n\nRead [this](missing.md).\n',
    '.docsauditignore': 'docs/vendor/\n',
  });
  assert.equal(report.status, 0);
  assert.deepEqual(errors(report), []);
});

test('un subproyecto con su propio manifiesto queda fuera', () => {
  const report = audit({
    ...VALID,
    'packages/app/package.json': '{}',
    'packages/app/NOTES.md': 'Read [this](missing.md).\n',
  });
  assert.equal(report.status, 0);
  assert.deepEqual(errors(report), []);
});
