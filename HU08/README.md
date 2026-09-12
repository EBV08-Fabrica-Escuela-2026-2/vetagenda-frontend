# vetagenda-hu08-catalogo-servicios — HU08 · Consultar catálogo de servicios

Este proyecto contiene **únicamente el código de la HU08**. Se eliminaron
los archivos que pertenecían a otras historias de usuario del repositorio
del equipo (formulario de registro de cliente, sus validaciones y su
modal de confirmación) para dejar solo lo correspondiente a esta entrega.
Se conservó `src/components/ui/Logo.tsx` porque es el logo oficial de
marca que usa el header de esta misma HU.

## Cómo ejecutarlo

```bash
npm install
npm run dev
```

Abre la URL que muestre la terminal (normalmente `http://localhost:5173`).

Al abrirlo verás directamente el **catálogo de servicios (HU08)** — no
hay ningún selector ni otra vista por defecto.

## Sesión de prueba

Por defecto no hay token, así que el catálogo mostrará el estado de
"sin sesión" (Escenario 6, tal como debe comportarse). Para ver el
catálogo con datos, ejecuta en la consola del navegador:
```js
localStorage.setItem('vetagenda_token', 'demo-token')
```
y recarga la página.

## Verificación de criterios (hecha antes de esta entrega)

- Escenario 1 — Lista de veterinarios con servicios (nombre, descripción, precio): OK
- Escenario 2 — Ficha de detalle (dirección, horario, teléfono): OK
- Escenario 3 — Formato `$XX.XXX` en COP, sin decimales, punto de miles: OK
  (se corrigió un espacio invisible que `Intl.NumberFormat` inserta por
  defecto entre el símbolo y el número, para que el formato sea exacto)
- Escenario 4 — Sin veterinarios → mensaje exacto, sin tarjetas: OK
- Escenario 5 — Veterinario sin servicios → "Sin servicios publicados", sin precios: OK
- Escenario 6 — Sin sesión → bloquea el catálogo (no se renderiza nada del contenido): OK
- Task 47 (maquetación), 48 (loading/skeleton), 49 (error/empty state),
  50 (integración API + sesión): implementadas y verificadas en el código.

Validado con `tsc -b` (modo estricto, `noUnusedLocals`/`noUnusedParameters`
activos) y `vite build` sin errores.

## Conectar el endpoint real

Edita `src/api/catalogoService.ts` (bloque comentado dentro de
`fetchCatalogoVeterinarios`) para reemplazar el mock por el `fetch` real
a `GET /veterinarios/catalogo`.
