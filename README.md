# VetAgenda — Configuración de horarios de atención

Frontend de VetAgenda para la historia de usuario:

> **Como veterinario**, quiero configurar mis días y franjas horarias de atención,
> **para que** el sistema conozca mis turnos disponibles y evitar cruces de agenda.

## Stack

- React 18
- TypeScript
- Vite
- Tailwind CSS
- React Router DOM
- Docker (Nginx para servir el build)
- PostgreSQL 16 (script `docker/init.sql`)
- Node.js 20+

## Rutas

- `/` — Landing page
- `/veterinarios/horarios` — Gestión de disponibilidad (días y franjas de atención)

## Escenarios cubiertos

| Escenario | Comportamiento en la interfaz |
| --- | --- |
| Configuración exitosa | Se seleccionan los días (Lun–Dom), se definen hora de inicio y fin y al guardar se muestra "Horarios guardados". El panel "Disponibles para agendamiento" muestra los horarios guardados. |
| Varias franjas en un mismo día | Botón "+ Agregar franja" por día. Cada franja se registra y se muestra por separado. Las franjas que se cruzan se marcan como error. |
| Horario inválido | Si la hora de fin es anterior o igual a la de inicio se muestra "El rango de horario no es válido…" y el botón de guardar queda deshabilitado. |
| Actualización | Con horarios existentes el botón cambia a "Actualizar disponibilidad" y se confirma con "Disponibilidad actualizada". Se avisa de cambios sin guardar y se pueden descartar. |
| Eliminación de franja | El botón de eliminar abre un modal de confirmación; al confirmar la franja deja de mostrarse como disponible. |

## Contrato esperado con el backend

| Método | Endpoint | Descripción |
| --- | --- | --- |
| GET | `/api/veterinarios` | Lista de veterinarios `[{ id, nombre }]` |
| GET | `/api/veterinarios/{id}/disponibilidad` | Disponibilidad configurada |
| PUT | `/api/veterinarios/{id}/disponibilidad` | Guarda / actualiza la disponibilidad |
| DELETE | `/api/veterinarios/{id}/disponibilidad/franjas/{franjaId}` | Elimina una franja |

Cuerpo del `PUT` y respuesta de `GET`/`PUT`:

```json
{
  "veterinarioId": 1,
  "dias": [
    { "dia": "LUNES", "franjas": [{ "id": 1, "horaInicio": "08:00", "horaFin": "12:00" }] }
  ]
}
```

Si el backend no está disponible (o los endpoints aún no existen), el frontend guarda la
configuración en `localStorage` y muestra un aviso de modo demostración, para que el flujo
pueda probarse sin servidor.

## Base de datos

`docker/init.sql` incluye las migraciones V1–V7 originales y la nueva **V8**, que crea la tabla
`franja_horaria` con:

- `chk_franja_rango`: la hora de fin debe ser posterior a la de inicio.
- `excl_franja_sin_cruces`: impide que dos franjas activas del mismo veterinario y día se solapen
  (usa la extensión `btree_gist`).
- Datos de ejemplo para los veterinarios 1 y 2.

## Levantar en desarrollo local

```bash
cd frontend
npm install
npm run dev
```

Abrir `http://localhost:5173`.

Para consumir el backend real, crea `frontend/.env` con:

```env
VITE_API_URL=http://localhost:8080/api
```

## Levantar con Docker

Desde la raíz del proyecto:

```bash
docker compose up --build
```

Levanta la base de datos, el backend (`../veterinary-system`) y el frontend en
`http://localhost:5173`.

## Scripts disponibles

```bash
npm run dev
npm run build
npm run preview
npm run typecheck
```

## Estructura

```text
vetagenda-horarios/
├── docker/
│   └── init.sql
├── docker-compose.yml
├── README.md
└── frontend/
    ├── src/
    │   ├── App.tsx
    │   ├── main.tsx
    │   ├── index.css
    │   ├── vite-env.d.ts
    │   ├── LandingPage.tsx
    │   ├── components/
    │   │   ├── BackToHomeButton.tsx
    │   │   └── BrandHeader.tsx
    │   ├── pages/
    │   │   └── ConfigurarHorariosPage.tsx
    │   └── services/
    │       └── api.ts
    ├── Dockerfile
    ├── nginx.conf
    ├── package.json
    ├── package-lock.json
    ├── vite.config.ts
    ├── tailwind.config.js
    ├── postcss.config.js
    ├── tsconfig.json
    ├── tsconfig.app.json
    ├── tsconfig.node.json
    └── index.html
```
