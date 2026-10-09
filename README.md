# skills

Colección de skills para agentes de código. Cada skill define reglas que el agente aplica durante una tarea.

## Skills disponibles

- [**ets-dev**](plugins/dakuar-skills/skills/ets-dev/SKILL.md): Redacta en Español Técnico Simplificado (ETS) la documentación técnica y las respuestas del agente en el chat. Aplica 17 reglas de **oración**, **vocabulario**, **estructura** y **respuestas en el chat**.
- [**docs-init**](plugins/dakuar-skills/skills/docs-init/SKILL.md): Crea o completa la estructura de documentación de un proyecto para agentes de código: `CLAUDE.md`, `AGENTS.md`, `MEMORY.md`, `ARCHIVE.md`, `logs.md` y la carpeta `docs/`. Incluye **13 plantillas** y detecta si el proyecto es **web**, tiene **servidor** o es de **ML**.
- [**docs-audit**](plugins/dakuar-skills/skills/docs-audit/SKILL.md): Audita esa estructura. Comprueba los **límites de líneas**, los **punteros rotos**, las **entradas mal ubicadas** y las **credenciales** en archivos Markdown. Corrige los problemas mecánicos y propone el resto. Incluye un script de Node sin dependencias.

## Instalación

```bash
npx skills add dakuar/skills
```

## Plugin de Claude Code

```text
/plugin marketplace add dakuar/skills
/plugin install dakuar-skills@dakuar-skills
```

## Estructura del repositorio

```text
.
├── .agents/
│   └── plugins/
│       └── marketplace.json
├── .claude-plugin/
│   └── marketplace.json
├── plugins/
│   └── dakuar-skills/
│       ├── .claude-plugin/
│       │   └── plugin.json
│       ├── .codex-plugin/
│       │   └── plugin.json
│       ├── .cursor-plugin/
│       │   └── plugin.json
│       └── skills/
│           ├── docs-audit/
│           │   ├── agents/
│           │   │   └── openai.yaml
│           │   ├── scripts/
│           │   │   └── audit.mjs
│           │   └── SKILL.md
│           ├── docs-init/
│           │   ├── agents/
│           │   │   └── openai.yaml
│           │   ├── templates/
│           │   └── SKILL.md
│           └── ets-dev/
│               ├── agents/
│               │   └── openai.yaml
│               └── SKILL.md
├── test/
│   └── repository.test.mjs
├── .gitattributes
├── .gitignore
├── LICENSE
├── opencode.json
├── package.json
└── README.md
```

- `plugins/dakuar-skills/` es la carpeta del plugin. Cada agente carga esta carpeta completa.
- `plugins/dakuar-skills/skills/<nombre>/SKILL.md` es el punto de entrada de cada skill.
- `plugins/dakuar-skills/skills/<nombre>/agents/openai.yaml` define el nombre y la descripción que muestra Codex.
- `plugins/dakuar-skills/skills/<nombre>/templates/` y `scripts/` contienen los archivos que el skill copia o ejecuta.
- `plugins/dakuar-skills/.claude-plugin/`, `.codex-plugin/` y `.cursor-plugin/` contienen el manifiesto del plugin para Claude Code, Codex y Cursor.
- `.claude-plugin/marketplace.json` define el marketplace de Claude Code.
- `.agents/plugins/marketplace.json` define el marketplace genérico para otros agentes.
- `opencode.json` registra la carpeta de skills en opencode.
- `test/repository.test.mjs` comprueba la estructura del repositorio.

## Pruebas

```bash
npm test
```

La prueba usa el ejecutor de pruebas de Node. No instala dependencias. Comprueba estos puntos:

- Cada skill tiene `SKILL.md`, y su campo `name` coincide con el nombre de la carpeta.
- Cada skill tiene `agents/openai.yaml` con `display_name` y `short_description`.
- Los archivos JSON son válidos.
- Los tres manifiestos del plugin y `package.json` tienen la misma versión.
- Los marketplaces y `opencode.json` apuntan a carpetas que existen.
- Los enlaces locales de los archivos Markdown llevan a un archivo que existe.
- Este archivo enlaza cada skill.

## Cómo agregar un skill

1. Crea la carpeta `plugins/dakuar-skills/skills/<nombre>/`.
2. Crea `SKILL.md` en esa carpeta con los campos `name` y `description` en el frontmatter. El valor de `name` debe coincidir con el nombre de la carpeta.
3. Crea `agents/openai.yaml` en esa carpeta con `display_name` y `short_description`.
4. Agrega el skill a la lista "Skills disponibles" de este archivo.
5. Incrementa `version` en `package.json` y en los tres archivos `plugin.json`. Claude Code compara ese número para detectar una actualización del plugin.
6. Ejecuta `npm test`.

## Licencia

Este repositorio usa la licencia MIT. Lee el texto completo en [LICENSE](LICENSE).
