# skills

Colección de skills para agentes de código. Cada skill define reglas que el agente aplica durante una tarea.

## Skills disponibles

- [**ets-dev**](plugins/dakuar-skills/skills/ets-dev/SKILL.md): Redacta en Español Técnico Simplificado (ETS) la documentación técnica y las respuestas del agente en el chat. Aplica 17 reglas de **oración**, **vocabulario**, **estructura** y **respuestas en el chat**. Incluye [ejemplos por regla](plugins/dakuar-skills/skills/ets-dev/references/examples.md) y [listas de vocabulario](plugins/dakuar-skills/skills/ets-dev/references/vocabulary.md).
- [**ets-review**](plugins/dakuar-skills/skills/ets-review/SKILL.md): Revisa un texto en español contra las reglas de `ets-dev`. Devuelve un veredicto y una lista de hallazgos con **línea**, **regla**, **cita** y **corrección**. No edita el texto.
- [**docs-init**](plugins/dakuar-skills/skills/docs-init/SKILL.md): Crea o completa la estructura de documentación de un proyecto para agentes de código: `CLAUDE.md`, `AGENTS.md`, `MEMORY.md`, `ARCHIVE.md`, `logs.md` y la carpeta `docs/`. Incluye **13 plantillas** y detecta si el proyecto es **web**, tiene **servidor** o es de **ML**.
- [**docs-audit**](plugins/dakuar-skills/skills/docs-audit/SKILL.md): Audita esa estructura. Comprueba los **límites de líneas**, los **punteros rotos**, las **entradas mal ubicadas** y las **credenciales** en archivos Markdown. Corrige los problemas mecánicos y propone el resto. Incluye un script de Node sin dependencias.

## Agentes y comandos

El plugin incluye un agente y dos comandos para Claude Code. Otros agentes cargan las piezas que admiten.

| Pieza | Función |
| --- | --- |
| Agente `ets-reviewer` | Revisa un documento con `ets-review`. Solo lee: no tiene herramientas de edición. |
| `/ets-check [archivo ...]` | Lanza un agente `ets-reviewer` por archivo y entrega los veredictos. Sin argumentos, revisa los archivos Markdown modificados. |
| `/docs-check [ruta]` | Ejecuta el script de `docs-audit` y muestra el informe. No corrige ningún archivo. |

## Instalación

```bash
npx skills add dakuar/skills
```

Este comando instala los skills. Para instalar también el agente y los comandos, usa el plugin de Claude Code.

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
├── .github/
│   └── workflows/
│       └── test.yml
├── plugins/
│   └── dakuar-skills/
│       ├── .claude-plugin/
│       │   └── plugin.json
│       ├── .codex-plugin/
│       │   └── plugin.json
│       ├── .cursor-plugin/
│       │   └── plugin.json
│       ├── agents/
│       │   └── ets-reviewer.md
│       ├── commands/
│       │   ├── docs-check.md
│       │   └── ets-check.md
│       ├── evals/
│       │   ├── evals.json
│       │   └── trigger-evals.json
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
│           ├── ets-dev/
│           │   ├── agents/
│           │   │   └── openai.yaml
│           │   ├── references/
│           │   │   ├── examples.md
│           │   │   └── vocabulary.md
│           │   └── SKILL.md
│           └── ets-review/
│               ├── agents/
│               │   └── openai.yaml
│               └── SKILL.md
├── test/
│   ├── audit.test.mjs
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
- `plugins/dakuar-skills/skills/<nombre>/references/` contiene el detalle que el agente lee solo cuando lo necesita.
- `plugins/dakuar-skills/agents/` contiene las definiciones de subagentes.
- `plugins/dakuar-skills/commands/` contiene los comandos. El nombre de un comando no repite el nombre de un skill.
- `plugins/dakuar-skills/evals/` contiene las evaluaciones de los skills.
- `plugins/dakuar-skills/.claude-plugin/`, `.codex-plugin/` y `.cursor-plugin/` contienen el manifiesto del plugin para Claude Code, Codex y Cursor.
- `.claude-plugin/marketplace.json` define el marketplace de Claude Code.
- `.agents/plugins/marketplace.json` define el marketplace genérico para otros agentes.
- `opencode.json` registra la carpeta de skills en opencode.
- `test/repository.test.mjs` comprueba la estructura del repositorio.
- `test/audit.test.mjs` comprueba el script de `docs-audit` con proyectos temporales.
- `.github/workflows/test.yml` ejecuta las pruebas en cada push a `main` y en cada pull request.

## Pruebas

```bash
npm test
```

Las pruebas usan el ejecutor de pruebas de Node. No instalan dependencias.

`test/repository.test.mjs` comprueba estos puntos:

- Cada skill tiene `SKILL.md`, y su campo `name` coincide con el nombre de la carpeta.
- Cada skill tiene `agents/openai.yaml` con `display_name` y `short_description`.
- Los archivos JSON son válidos.
- Los tres manifiestos del plugin y `package.json` tienen la misma versión.
- Los marketplaces y `opencode.json` apuntan a carpetas que existen.
- Los enlaces locales de los archivos Markdown llevan a un archivo que existe.
- Este archivo enlaza cada skill.
- Cada agente declara `name` y `description`, y usa skills que existen.
- Cada comando declara `description`, y su nombre no repite el nombre de un skill.
- Los evals nombran skills que existen, y cada skill tiene al menos 3 consultas de activación.
- Los archivos de `references/`, `scripts/` y `templates/` que nombra un `SKILL.md` existen.

`test/audit.test.mjs` ejecuta `audit.mjs` sobre 14 proyectos temporales. Comprueba los errores, los avisos y el código de salida. También comprueba que el informe no imprime el valor de una credencial.

## Evals

La carpeta `plugins/dakuar-skills/evals/` contiene dos archivos:

- `trigger-evals.json`: 34 consultas de activación. Cada consulta indica si debe activar un skill y qué skills son una respuesta aceptada.
- `evals.json`: 6 casos de comportamiento. Cada caso tiene un `prompt` y el resultado esperado.

Estos evals no tienen resultados medidos. El campo `method` de `trigger-evals.json` describe cómo medir la activación.

## Cómo agregar un skill

1. Crea la carpeta `plugins/dakuar-skills/skills/<nombre>/`.
2. Crea `SKILL.md` en esa carpeta con los campos `name` y `description` en el frontmatter. El valor de `name` debe coincidir con el nombre de la carpeta.
3. Crea `agents/openai.yaml` en esa carpeta con `display_name` y `short_description`.
4. Agrega al menos 3 consultas de activación del skill en `plugins/dakuar-skills/evals/trigger-evals.json`.
5. Agrega el skill a la lista "Skills disponibles" de este archivo.
6. Incrementa `version` en `package.json` y en los tres archivos `plugin.json`. Claude Code compara ese número para detectar una actualización del plugin.
7. Ejecuta `npm test`.

## Licencia

Este repositorio usa la licencia MIT. Lee el texto completo en [LICENSE](LICENSE).
