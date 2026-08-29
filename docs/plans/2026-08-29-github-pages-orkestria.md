# Publicación y optimización de orkestria.uy — Plan de implementación

> **Para Codex:** SUB-SKILL REQUERIDA: ejecutar este plan tarea por tarea con TDD y verificación antes de completar.

**Objetivo:** Corregir la publicación de `orkestria.uy` en GitHub Pages y optimizar el sitio estático sin alterar su identidad visual minimalista.

**Arquitectura:** Se mantiene el sitio estático sin dependencias de producción. Una prueba basada en `node:test` valida la estructura publicable, las referencias locales y los metadatos esenciales; GitHub Pages publica directamente desde la raíz de `main`.

**Stack técnico:** HTML5, CSS, JavaScript del navegador, `node:test`, GitHub Pages y DNS del dominio apex.

---

### Tarea 1: Crear una prueba de regresión para la estructura publicable

**Archivos:**
- Crear: `package.json`
- Crear: `tests/site.test.mjs`

**Pasos:**
1. Escribir pruebas que exijan `CNAME`, `.nojekyll`, activos existentes y metadatos absolutos.
2. Ejecutar `npm test` y confirmar que falla por el conflicto actual del archivo `assets` y la falta de `.nojekyll`.

### Tarea 2: Corregir la estructura de activos y la compilación de Pages

**Archivos:**
- Eliminar: `assets` (archivo vacío incorrecto)
- Mover: `orkestria-hero.png` a `assets/orkestria-hero.png`
- Mover: `favicon.svg` a `assets/favicon.svg`
- Crear: `.nojekyll`

**Pasos:**
1. Sustituir el archivo conflictivo por el directorio esperado.
2. Mantener las rutas públicas ya usadas por el HTML.
3. Ejecutar `npm test` y confirmar que la regresión queda cubierta.

### Tarea 3: Optimizar metadatos, carga y accesibilidad

**Archivos:**
- Modificar: `index.html`
- Modificar: `styles.css`
- Modificar: `script.js`
- Modificar: `README.md`

**Pasos:**
1. Agregar URL canónica, Open Graph absoluto y metadatos sociales coherentes.
2. Declarar dimensiones de la imagen y contenido semántico accesible sin modificar la composición visual.
3. Mejorar la degradación segura de Web Audio y los dispositivos sin puntero fino.
4. Documentar publicación, pruebas y DNS sin incluir credenciales.
5. Ejecutar pruebas, validación HTML/CSS disponible y comprobación sintáctica de JavaScript.

### Tarea 4: Publicar y verificar el dominio

**Archivos y configuración:**
- Confirmar fuente GitHub Pages: rama `main`, directorio `/`.
- Confirmar dominio personalizado: `orkestria.uy`.
- Habilitar HTTPS cuando GitHub apruebe el certificado.

**Pasos:**
1. Revisar el diff y crear un commit atómico en español.
2. Enviar `main` a GitHub.
3. Esperar la finalización del despliegue y comprobar HTTP, HTTPS y activos.
4. Si GitHub no puede aprobar HTTPS, documentar los registros DNS exactos que deben ajustarse en Cloudflare.
