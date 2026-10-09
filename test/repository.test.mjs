import assert from 'node:assert/strict';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, extname, join, relative, resolve } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const pluginRoot = join(root, 'plugins/dakuar-skills');
const skillsRoot = join(pluginRoot, 'skills');

const pluginManifestFiles = [
  'plugins/dakuar-skills/.claude-plugin/plugin.json',
  'plugins/dakuar-skills/.codex-plugin/plugin.json',
  'plugins/dakuar-skills/.cursor-plugin/plugin.json',
];

const jsonFiles = [
  '.claude-plugin/marketplace.json',
  '.agents/plugins/marketplace.json',
  ...pluginManifestFiles,
  'opencode.json',
  'package.json',
];

const skillNames = readdirSync(skillsRoot, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .sort();

// Las plantillas contienen punteros a archivos del proyecto de destino.
const markdownFiles = walk(root)
  .filter((file) => extname(file) === '.md')
  .filter((file) => !relative(root, file).split(/[\\/]/).includes('templates'));

function walk(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    if (entry.name === '.git' || entry.name === 'node_modules') return [];
    const path = join(directory, entry.name);
    return entry.isDirectory() ? walk(path) : [path];
  });
}

function read(path) {
  return readFileSync(resolve(root, path), 'utf8');
}

function readJson(path) {
  return JSON.parse(read(path));
}

function localMarkdownLinks(text) {
  return [...text.matchAll(/\[[^\]]+\]\(([^)]+)\)/g)]
    .map((match) => match[1].trim().replace(/^<|>$/g, ''))
    .filter((target) => !/^(?:[a-z]+:|#|\/)/i.test(target))
    .map((target) => decodeURIComponent(target.split('#')[0]))
    .filter(Boolean);
}

test('cada skill tiene un frontmatter válido', () => {
  assert.ok(skillNames.length > 0, 'el plugin contiene al menos un skill');

  for (const name of skillNames) {
    const file = join(skillsRoot, name, 'SKILL.md');
    assert.ok(existsSync(file), `${name} tiene SKILL.md`);

    const frontmatter = readFileSync(file, 'utf8').match(/^---\r?\n([\s\S]*?)\r?\n---/);
    assert.ok(frontmatter, `${name}/SKILL.md tiene frontmatter YAML`);

    const declared = frontmatter[1].match(/^name: ([a-z0-9-]+)\s*$/m);
    assert.ok(declared, `${name}/SKILL.md declara name`);
    assert.equal(declared[1], name, `name coincide con la carpeta ${name}`);
    assert.match(frontmatter[1], /^description: \S.{40,}$/m, `${name}/SKILL.md declara description`);
  }
});

test('cada skill tiene los metadatos de Codex', () => {
  for (const name of skillNames) {
    const file = join(skillsRoot, name, 'agents/openai.yaml');
    assert.ok(existsSync(file), `${name} tiene agents/openai.yaml`);

    const text = readFileSync(file, 'utf8');
    assert.match(text, /^\s+display_name: "\S.*"\s*$/m, `${name} declara display_name`);
    assert.match(text, /^\s+short_description: "\S.*"\s*$/m, `${name} declara short_description`);
  }
});

test('los manifiestos JSON son válidos y comparten la versión', () => {
  for (const file of jsonFiles) readJson(file);

  const packageVersion = readJson('package.json').version;
  for (const file of pluginManifestFiles) {
    assert.equal(readJson(file).version, packageVersion, file);
  }
});

test('los marketplaces apuntan a la carpeta del plugin', () => {
  const claude = readJson('.claude-plugin/marketplace.json').plugins[0].source;
  const agents = readJson('.agents/plugins/marketplace.json').plugins[0].source.path;

  for (const source of [claude, agents]) {
    assert.equal(resolve(root, source), pluginRoot, source);
  }

  for (const path of readJson('opencode.json').skills.paths) {
    assert.equal(resolve(root, path), skillsRoot, path);
  }
});

test('los enlaces locales de Markdown existen', () => {
  for (const file of markdownFiles) {
    for (const target of localMarkdownLinks(readFileSync(file, 'utf8'))) {
      assert.ok(
        existsSync(resolve(dirname(file), target)),
        `${relative(root, file)} -> ${target}`,
      );
    }
  }
});

test('el README enlaza cada skill', () => {
  const readme = read('README.md');
  for (const name of skillNames) {
    assert.ok(
      readme.includes(`(plugins/dakuar-skills/skills/${name}/SKILL.md)`),
      `README.md enlaza ${name}`,
    );
  }
});
