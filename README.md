# VetAgenda · Historial asistencial

Frontend para consultar el **histórico de atenciones, citas pasadas y cancelaciones** de las mascotas. Está basado en el prototipo de Figma "Historial asistencial / Módulo médico" y usa el mismo stack que el frontend principal de VetAgenda.

> **Historia de usuario.** Como cliente o veterinario profesional, quiero consultar el histórico de atenciones, citas pasadas y cancelaciones asociadas a las mascotas, para hacer seguimiento a la evolución clínica de los pacientes y auditar el cumplimiento de los turnos programados.

## Stack tecnológico

- React 18
- TypeScript
- Vite 5
- Tailwind CSS 3 (con PostCSS y Autoprefixer)
- React Router DOM 7
- lucide-react (íconos)
- Docker (Node 20 para compilar y Nginx para servir), Docker Compose y Vercel

## Cómo ejecutarlo

### Modo demo (sin backend)
```bash
cd frontend
npm install
npm run dev
```
Abre http://localhost:5173 y entra como **Cliente** (Camila Mejía, dueña de Bruno y Mía) o como **Veterinario** (Dra. Valentina Gómez, con una consulta activa con Bruno).

El modo demo simula el backend en memoria, **incluida la validación de titularidad**. Además, la mascota *Luna* (id 3) pertenece a otro cliente y no está asignada a la veterinaria demo. Esto sirve para probar el 403.

### Contra el backend Spring Boot
```bash
cd frontend
cp .env.example .env      # VITE_API_URL=http://localhost:8080/api
npm run dev
```
El backend debe implementar los endpoints de [`docs/API_CONTRACT.md`](docs/API_CONTRACT.md).

### Con Docker
```bash
docker compose up --build
```
Levanta PostgreSQL, el backend (`../veterinary-system`) y el frontend en http://localhost:5173.

### Scripts
| Script | Descripción |
|---|---|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Build de producción en `dist/` |
| `npm run preview` | Sirve el build |
| `npm run typecheck` | Verificación de tipos con TypeScript |

## Rutas

| Ruta | Rol | Descripción |
|---|---|---|
| `/` | todos | Inicio |
| `/ingresar` | — | Inicio de sesión (demo o real) |
| `/historial` | CLIENTE | Selección de mascota |
| `/historial/mascotas/:id` · `/historial/mascotas/todas` | CLIENTE | Historial de atenciones |
| `?cita=:id` | CLIENTE / VETERINARIO | Abre el detalle de la atención |
| `/modulo-medico` | VETERINARIO | Historial clínico del paciente en consulta activa |
| `/modulo-medico/pacientes/:id` | VETERINARIO | Historial clínico de un paciente asignado |

## Criterios de aceptación

**1. El cliente consulta el historial de citas de sus mascotas**
- En "Historial", el cliente elige una mascota (o "Todas") y ve la lista cronológica (las más recientes primero) de citas **completadas y canceladas**.
- Cada tarjeta muestra la fecha y hora, el servicio, el motivo, la mascota, el profesional y el estado.
- El panel de detalle muestra el **profesional tratante**, el **servicio realizado** (diagnóstico, servicios aplicados y tratamiento) y las **notas clínicas**. Si la cita fue cancelada, muestra la fecha, quién la canceló y el motivo.
- Hay filtros por fechas, tipo y estado, un indicador de cumplimiento de turnos, paginación ("Cargar más citas") y la descarga de un resumen.

**2. El veterinario consulta el histórico de un paciente asignado**
- El "Módulo médico" muestra el paciente de la **consulta activa** (con cronómetro), sus datos y sus indicadores: citas completadas, citas canceladas y cumplimiento de turnos.
- Tiene tres pestañas: **Evolución clínica** (citas con su fecha de atención), **Diagnósticos** y **Tratamientos**.
- Incluye un buscador de diagnósticos, tratamientos o notas, y filtros por periodo y tipo.
- A la derecha está el **Resumen clínico**: alergias, diagnósticos activos, última vacuna y próximo control.

**3. Intento de ver un historial ajeno**
- El backend valida la titularidad y responde **403** (ver [`docs/API_CONTRACT.md`](docs/API_CONTRACT.md#3-regla-de-seguridad-validación-de-titularidad--403)).
- Ante un 403, el frontend descarta todo dato cargado y muestra solo "Acceso restringido", sin información médica. Se puede probar así:
  - Como cliente: `/historial/mascotas/3` o `/historial/mascotas/1?cita=701`.
  - Como veterinario: `/modulo-medico/pacientes/3`.
  - Con el botón **"Simular acceso 403"** (solo en modo demo).
- Si un cliente intenta abrir `/modulo-medico` (o un veterinario `/historial`), también ve el acceso restringido.

## Estructura

```
frontend/src
├── App.tsx                     # Rutas y guardas por rol
├── services/
│   ├── api.ts                  # Configuración, sesión, cliente HTTP (401/403 tipados), login
│   └── historialService.ts     # Endpoints de historial + simulación del backend (modo demo)
├── data/demoData.ts            # Datos de prueba
├── types/historial.ts          # Tipos del contrato API
├── utils/format.ts             # Fechas (America/Bogota) y etiquetas
├── pages/                      # Inicio, Ingresar, Historial, Módulo médico
└── components/
    ├── layout/                 # Encabezado y logo
    ├── historial/              # Mascotas, filtros, tarjetas de cita, detalle, cumplimiento
    ├── medico/                 # Paciente, indicadores, resumen clínico, diagnósticos y tratamientos
    └── ui/                     # Badges, estados vacíos y de error, skeletons, vista 403
```

## Diferencias con el prototipo
- En el prototipo, el cumplimiento decía "3 completadas · 1 cancelada" con solo 3 citas en la lista. Aquí se **calcula a partir de los datos**: completadas ÷ (completadas + canceladas).
- Las fechas de las citas del historial son pasadas: el prototipo mostraba una cita "completada" en una fecha futura.
- El selector "Vista del prototipo" (normal, cargando, sin citas, error) y "Simular acceso 403" solo aparecen en modo demo.
- Las fuentes Manrope y Barlow Condensed se cargan desde Google Fonts, igual que en el prototipo.
