---
description: Revisa uno o más documentos contra las reglas de Español Técnico Simplificado
argument-hint: "[archivo ...]"
---

Revisa con las reglas de ETS los documentos que nombran los argumentos.

Argumentos: `$ARGUMENTS`

Si los argumentos no nombran un archivo, revisa los archivos Markdown modificados del árbol de trabajo. Obtén la lista con `git diff --name-only --diff-filter=d HEAD -- '*.md'` y `git ls-files --others --exclude-standard -- '*.md'`. Indica al usuario qué archivos vas a revisar antes de empezar.

Para cada archivo:

1. Lanza un agente `ets-reviewer` y pásale la ruta del archivo. El agente revisa y no edita.
2. Entrega al usuario el veredicto y los hallazgos sin modificarlos, del más grave al menos grave.

Al final, escribe un resumen: cantidad de archivos aprobados, cantidad de archivos rechazados y total de errores.

No apliques correcciones en este comando. Si el usuario pide las correcciones después, aplícalas con el skill `ets-dev`. Avisa al usuario que una edición invalida el veredicto y que el archivo requiere una revisión nueva.
