# Ejemplos por regla

Cada ejemplo muestra un texto que incumple una regla y su corrección. Los números corresponden a las reglas de `SKILL.md`.

## Reglas de oración

**Regla 1. Una instrucción por oración.**

Antes: "Clona el repositorio, instala las dependencias y, cuando termine, copia `.env.example` a `.env` y ejecuta el servidor."
Después:

1. Clona el repositorio.
2. Instala las dependencias.
3. Copia `.env.example` a `.env`.
4. Ejecuta el servidor.

**Regla 2. Una idea por oración descriptiva.**

Antes: "El servicio lee los eventos de la cola, que se llena desde el formulario, y los guarda en la base de datos, donde otro proceso los agrupa por día."
Después: "El formulario escribe los eventos en la cola. El servicio lee cada evento y lo guarda en la base de datos. Otro proceso agrupa los eventos por día."

**Regla 3. Voz activa con agente.**

Antes: "Se genera un informe al final de cada ejecución."
Después: "El script genera un informe al final de cada ejecución."

Antes: "Los datos son validados antes de ser enviados."
Después: "El cliente valida los datos antes de enviarlos."

**Regla 4. Imperativo para instrucciones.**

Antes: "Hay que configurar la variable `API_URL`."
Después: "Configura la variable `API_URL`."

Antes: "El usuario debería reiniciar el servidor."
Después: "Reinicia el servidor."

**Regla 5. Condición antes de la acción.**

Antes: "Ejecuta `npm run migrate` si cambiaste el esquema."
Después: "Si cambiaste el esquema, ejecuta `npm run migrate`."

**Regla 6. Presente, sin gerundios encadenados ni nominalizaciones.**

Antes: "El servidor arranca leyendo la configuración, abriendo la conexión y quedando a la espera de peticiones."
Después: "El servidor lee la configuración y abre la conexión. Después espera peticiones."

Antes: "El script hará la comprobación de los permisos."
Después: "El script comprueba los permisos."

## Reglas de vocabulario

**Regla 7. Un término por concepto.**

Antes: "Crea el directorio `docs/`. Dentro de la carpeta, agrega un fichero por tema. Cada archivo usa minúsculas."
Después: "Crea la carpeta `docs/`. Dentro de la carpeta, agrega un archivo por tema. Cada archivo usa minúsculas."

**Regla 8. Un dato en lugar de un adjetivo de calidad.**

Antes: "La caché mejora mucho el rendimiento."
Después: "La caché reduce el tiempo de respuesta de 320 ms a 45 ms."

Si no tienes el dato, no escribas el adjetivo. Describe el comportamiento: "La caché guarda cada respuesta durante 1 hora."

**Regla 9. Sin suavizadores ni relleno.**

Antes: "Cabe destacar que, en principio, el proceso debería tardar más o menos un minuto."
Después: "El proceso tarda 1 minuto."

Si la duda es real: "El proceso tarda 1 minuto en Linux. No verificado en Windows."

**Regla 10. Identificadores sin traducir y en formato de código.**

Antes: "Llama a la función obtenerUsuario y revisa la rama principal."
Después: "Llama a la función `getUser` y revisa la rama `main`."

## Reglas de estructura

**Regla 11. Lista numerada para pasos, viñetas para elementos sin orden.**

Antes: "Primero compila, luego ejecuta las pruebas y por último publica."
Después:

1. Compila el proyecto.
2. Ejecuta las pruebas.
3. Publica el paquete.

**Regla 12. Advertencia antes del paso.**

Antes: "Ejecuta `npm run reset`. Este comando elimina todos los datos locales."
Después: "Advertencia: este comando elimina todos los datos locales. Ejecuta `npm run reset`."

**Regla 13. Encabezado con contenido.**

Antes: `## Notas`
Después: `## Límites de la API gratuita`

**Regla 14. Máximo 6 oraciones por párrafo.**

Divide el párrafo en el punto donde cambia el tema. Si las oraciones son pasos, usa una lista numerada.

## Reglas para respuestas en el chat

**Regla 15. Resultado primero.**

Antes: "Estuve revisando el código y vi que había varios problemas en el manejo de fechas, así que probé distintas opciones hasta que encontré la causa."
Después: "La causa es la zona horaria. `formatDate` usa la hora local del servidor. Cambié la función para usar UTC."

**Regla 16. Archivos modificados.**

Antes: "Hice los cambios que pediste."
Después: "Modifiqué 2 archivos. `auth.ts`: el token ahora caduca en 15 minutos. `auth.test.ts`: agregué una prueba de caducidad."

**Regla 17. Verificación con dato.**

Antes: "Todo debería funcionar."
Después: "Las 14 pruebas pasan. No probé el flujo en el navegador."
