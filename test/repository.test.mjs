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

function frontmatterOf(file) {
  return readFileSync(file, 'utf8').match(/^---\r?\n([\s\S]*?)\r?\n---/)?.[1];
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

    const frontmatter = frontmatterOf(file);
    assert.ok(frontmatter, `${name}/SKILL.md tiene frontmatter YAML`);

    const declared = frontmatter.match(/^name: ([a-z0-9-]+)\s*$/m);
    assert.ok(declared, `${name}/SKILL.md declara name`);
    assert.equal(declared[1], name, `name coincide con la carpeta ${name}`);
    assert.match(frontmatter, /^description: \S.{40,}$/m, `${name}/SKILL.md declara description`);
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

test('cada agente declara su nombre, y sus skills existen', () => {
  const agentFiles = readdirSync(join(pluginRoot, 'agents')).filter((file) => file.endsWith('.md'));
  assert.ok(agentFiles.length > 0, 'el plugin contiene al menos un agente');

  const declared = readJson('plugins/dakuar-skills/.claude-plugin/plugin.json').agents;
  assert.deepEqual([...declared].sort(), agentFiles.map((file) => `./agents/${file}`).sort());

  for (const file of agentFiles) {
    const frontmatter = frontmatterOf(join(pluginRoot, 'agents', file));
    assert.ok(frontmatter, `agents/${file} tiene frontmatter YAML`);
    assert.equal(frontmatter.match(/^name: ([a-z0-9-]+)\s*$/m)?.[1], file.replace(/\.md$/, ''), file);
    assert.match(frontmatter, /^description: \S.{40,}$/m, `agents/${file} declara description`);

    for (const [, skill] of frontmatter.matchAll(/^\s+- ([a-z0-9-]+)\s*$/gm)) {
      assert.ok(skillNames.includes(skill), `agents/${file} usa el skill ${skill}`);
    }
  }
});

test('cada comando declara description, y su nombre no repite el de un skill', () => {
  const commandFiles = readdirSync(join(pluginRoot, 'commands')).filter((file) => file.endsWith('.md'));
  assert.ok(commandFiles.length > 0, 'el plugin contiene al menos un comando');

  for (const file of commandFiles) {
    const frontmatter = frontmatterOf(join(pluginRoot, 'commands', file));
    assert.ok(frontmatter, `commands/${file} tiene frontmatter YAML`);
    assert.match(frontmatter, /^description: \S.+$/m, `commands/${file} declara description`);
    assert.ok(!skillNames.includes(file.replace(/\.md$/, '')), `commands/${file} repite el nombre de un skill`);
  }
});

test('los evals nombran skills que existen', () => {
  const triggers = readJson('plugins/dakuar-skills/evals/trigger-evals.json');
  const ids = triggers.queries.map((query) => query.id);
  assert.equal(new Set(ids).size, ids.length, 'cada consulta tiene un id único');

  for (const query of triggers.queries) {
    assert.equal(typeof query.should, 'boolean', query.id);
    assert.equal(Array.isArray(query.accept), query.should, `${query.id}: accept existe solo si should es true`);
    for (const skill of query.accept ?? []) {
      assert.ok(skillNames.includes(skill), `${query.id} acepta el skill ${skill}`);
    }
  }

  for (const name of skillNames) {
    const own = triggers.queries.filter((query) => query.accept?.[0] === name);
    assert.ok(own.length >= 3, `${name} tiene al menos 3 consultas de activación`);
  }

  for (const entry of readJson('plugins/dakuar-skills/evals/evals.json').evals) {
    assert.ok(entry.prompt && entry.expected_output, `eval ${entry.id} tiene prompt y expected_output`);
    for (const skill of entry.skills) {
      assert.ok(skillNames.includes(skill), `eval ${entry.id} usa el skill ${skill}`);
    }
  }
});

test('las referencias que nombra un skill existen', () => {
  for (const name of skillNames) {
    const text = readFileSync(join(skillsRoot, name, 'SKILL.md'), 'utf8');
    for (const [, target] of text.matchAll(/`((?:references|scripts|templates)\/[\w./-]+\.\w+)`/g)) {
      assert.ok(existsSync(join(skillsRoot, name, target)), `${name}/SKILL.md -> ${target}`);
    }
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
