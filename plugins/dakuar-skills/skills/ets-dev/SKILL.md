---
name: ets-dev
description: Redacta en Español Técnico Simplificado (ETS) tanto la documentación técnica como las respuestas del agente en el chat. Usa este skill al crear o editar README, CLAUDE.md, AGENTS.md, archivos en docs/, comentarios de código o mensajes de commit en español, al responder al usuario en un proyecto de desarrollo, y cuando el usuario pida simplificar, aclarar o acortar un texto técnico.
---

# ETS-Dev

Escribe texto técnico que un lector entienda en una sola lectura.

## Alcance

Aplica estas reglas a:

- Documentación, comentarios de código y mensajes de commit.
- Tus respuestas al usuario en el chat.

No las apliques al código ni a las citas textuales.

## Reglas de oración

1. Escribe una instrucción por oración. Máximo 25 palabras.
2. Escribe una idea por oración descriptiva. Máximo 30 palabras.
3. Usa voz activa y nombra al agente. "El servidor valida el token", no "Se valida el token".
4. Usa imperativo para instrucciones: Crea, Ejecuta, Elimina.
5. Escribe la condición antes de la acción. "Si la prueba falla, revierte el cambio."
6. Usa presente. Evita gerundios encadenados y nominalizaciones. "Valida", no "realiza la validación".

## Reglas de vocabulario

7. Usa un término por concepto. No alternes "carpeta" y "directorio".
8. Sustituye cada adjetivo de calidad por un dato. "Responde en 40 ms", no "es rápido".
9. Elimina suavizadores y relleno. Si existe una duda real, escríbela como dato: "No verificado en Windows".
10. No traduzcas identificadores, comandos ni nombres de API. Escríbelos en `código`.

## Reglas de estructura

11. Usa lista numerada para pasos y viñetas para elementos sin orden.
12. Escribe las advertencias antes del paso que afectan.
13. Titula cada sección con su contenido. No uses "Notas", "Otros" ni "General".
14. Máximo 6 oraciones por párrafo.

## Reglas para respuestas en el chat

15. Escribe primero el resultado. Después escribe el detalle.
16. Indica qué archivos modificaste y qué cambió en cada uno.
17. Si una verificación falla o no se ejecutó, dilo con el dato. "2 de 14 pruebas fallan", no "casi todo pasa".

## Ejemplos

Antes: "Posiblemente sería mejor que se realizara la instalación de las dependencias antes de proceder a ejecutar el proyecto."
Después: "Instala las dependencias. Luego ejecuta el proyecto."

Antes: "El módulo es robusto y maneja errores de forma elegante."
Después: "El módulo reintenta 3 veces cada petición fallida. Luego registra el error y devuelve `null`."

Antes: "¡Listo! Ya quedó todo funcionando bastante mejor, hice varios ajustes en el formulario."
Después: "Agregué validación de email en `RegisterForm.tsx`. Las 14 pruebas pasan."

## Referencias

Lee estos archivos cuando necesites más detalle. Están en la carpeta de este skill.

- `references/examples.md`: un ejemplo antes y después por cada regla. Léelo cuando dudes de cómo aplicar una regla.
- `references/vocabulary.md`: términos preferidos, suavizadores, relleno y adjetivos de calidad. Léelo antes de escribir o revisar un documento de más de una página.

## Documentación afectada por un cambio

- Si un cambio de código invalida un documento existente, actualízalo en el mismo cambio.
- No crees archivos de documentación que el proyecto no tiene. Propónlos al usuario.
- Si la petición admite dos interpretaciones con resultados distintos, pregunta antes de ejecutar.

## Verificación

Antes de entregar, revisa cada oración: longitud, agente explícito, adjetivos sin dato, términos duplicados.

Para una revisión completa con informe de hallazgos, usa el skill `ets-review` si está instalado.
