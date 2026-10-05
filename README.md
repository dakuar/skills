# skills

Colección de skills para agentes de código. Cada skill define reglas que el agente aplica durante una tarea.

## Skills disponibles

- [**ets-dev**](skills/ets-dev/SKILL.md): Redacta en Español Técnico Simplificado (ETS) la documentación técnica y las respuestas del agente en el chat. Aplica 17 reglas de **oración**, **vocabulario**, **estructura** y **respuestas en el chat**.

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
├── .claude-plugin/
│   ├── marketplace.json
│   └── plugin.json
├── skills/
│   └── ets-dev/
│       ├── agents/
│       │   └── openai.yaml
│       └── SKILL.md
├── .gitattributes
├── opencode.json
└── README.md
```

- `skills/<nombre>/SKILL.md` es el punto de entrada de cada skill.
- `skills/<nombre>/agents/openai.yaml` define el nombre y la descripción que muestra Codex.
- `.claude-plugin/` define el plugin de Claude Code y su marketplace.
- `opencode.json` registra la carpeta `skills/` en opencode.

## Cómo agregar un skill

1. Crea la carpeta `skills/<nombre>/`.
2. Crea `skills/<nombre>/SKILL.md` con los campos `name` y `description` en el frontmatter. El valor de `name` debe coincidir con el nombre de la carpeta.
3. Crea `skills/<nombre>/agents/openai.yaml` con `display_name` y `short_description`.
4. Agrega el skill a la lista "Skills disponibles" de este archivo.
5. Incrementa `version` en `.claude-plugin/plugin.json`. Claude Code compara ese número para detectar una actualización del plugin.
