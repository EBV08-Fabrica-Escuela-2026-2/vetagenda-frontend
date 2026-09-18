# VetAgenda

VetAgenda es una plataforma para la gestión de clientes, mascotas, veterinarios y citas veterinarias. Este repositorio contiene el frontend web en React + TypeScript y una base inicial del backend en Spring Boot para ejecutarse localmente o con Docker Compose.

## Stack tecnológico

### Frontend

- React 18
- TypeScript
- Vite 5
- Tailwind CSS 3
- React Router DOM
- PostCSS y Autoprefixer
- Node.js 20 o superior

### Backend

- Java 17
- Spring Boot 3.3.3
- Spring Web
- Spring Data JPA
- PostgreSQL 16
- Maven Wrapper

### Infraestructura

- Docker
- Docker Compose
- Git

## Estructura del proyecto

```text
VetAgenda/
├── backend/
│   ├── Dockerfile
│   ├── mvnw
│   ├── mvnw.cmd
│   ├── pom.xml
│   └── src/
│       ├── main/
│       │   ├── java/com/vetagenda/
│       │   │   ├── VetAgendaApplication.java
│       │   │   └── controller/
│       │   │       └── HelloController.java
│       │   └── resources/
│       │       └── application.properties
├── frontend/
│   ├── Dockerfile
│   ├── index.html
│   ├── package.json
│   ├── postcss.config.js
│   ├── tailwind.config.js
│   ├── tsconfig.app.json
│   ├── tsconfig.node.json
│   ├── vite.config.ts
│   └── src/
│       ├── App.tsx
│       ├── LandingPage.tsx
│       ├── RegisterPage.tsx
│       ├── index.css
│       ├── main.tsx
│       ├── components/
│       │   └── VetForm.tsx
│       └── pages/
│           └── RegisterVeterinarianPage.tsx
├── docker-compose.yml
├── .gitignore
├── README.md
└── LICENSE (si aplica)
```

## Rutas del frontend

El frontend usa React Router para la navegación. Las rutas actuales son:

| Ruta | Componente | Descripción | Estado |
|---|---|---|---|
| `/` | `LandingPage` | Página de bienvenida / landing | ✅ Activa |
| `/registro` | `RegisterPage` | Registro de cliente | ✅ Activa |
| `/veterinarios/registro` | `RegisterVeterinarianPage` | Registro de veterinario | ✅ Activa |

### Acceso local

Si se levanta el proyecto en modo desarrollo:

- Frontend: http://localhost:5173
- Backend: http://localhost:8080
- Base de datos: localhost:5432

Con Docker Compose, el frontend queda expuesto en:

- http://localhost:3000

## Requisitos

Antes de ejecutar el proyecto, asegúrate de tener instalado:

- Node.js 20+
- npm 10+
- Java 17+
- Maven (opcional si usas el wrapper)
- Docker Desktop + Docker Compose
- Git

## Instalación y ejecución

### 1) Frontend local

Desde la raíz del proyecto:

```bash
cd frontend
npm install
npm run dev
```

### 2) Backend local

Desde la raíz del proyecto:

```bash
cd backend
./mvnw spring-boot:run
```

Windows:

```powershell
cd backend
./mvnw.cmd spring-boot:run
```

### 3) Ejecutar con Docker Compose

Desde la raíz del repositorio:

```bash
docker compose up --build
```

Esto levanta:

- Frontend en http://localhost:3000
- Backend en http://localhost:8080
- PostgreSQL en localhost:5432

Para detener los servicios:

```bash
docker compose down
```

## Variables y configuración

La configuración de base de datos está definida en `docker-compose.yml`:

- Base de datos: `vetagenda`
- Usuario: `vetagenda`
- Contraseña: `vetagenda123`

El backend usa esas credenciales para conectarse a PostgreSQL mediante la variable `SPRING_DATASOURCE_URL`.

## Estado actual del proyecto

La base del proyecto ya quedó migrada a TypeScript con React para el frontend. Actualmente se cuenta con:

- landing page inicial
- registro de clientes
- registro de veterinarios
- configuración base para integración con backend y base de datos
- referencia de trabajo previo para la HU05 Registro de Mascota

## HU05 Registro de Mascota

La rama de trabajo previa incluía una implementación en React + TypeScript + Vite del flujo de alta de mascota, con componentes como selector de especie, sexo y formulario de registro. En la estructura actual del repositorio, la funcionalidad quedó como referencia histórica para integrarse posteriormente con la base del proyecto actual.

## Convenciones de desarrollo

- Frontend en TypeScript + React
- Rutas definidas en `frontend/src/App.tsx`
- Estilos con Tailwind CSS
- Backend con Spring Boot y conexión PostgreSQL
- Ejecución recomendada con Docker Compose para entorno consistente
│   ├── Header.tsx              # Barra de tabs (HU) + appbar con usuario
│   ├── Breadcrumb.tsx          # Mis Mascotas > Nueva Mascota
│   ├── EspecieSelector.tsx     # Tarjetas Perro / Gato / Otro
│   ├── SexoSelector.tsx        # Pills Macho / Hembra
│   └── RegistroMascotaForm.tsx # Formulario completo con validaciones
├── pages/
│   └── RegistroMascotaPage.tsx # Ensambla breadcrumb + formulario
├── types/
│   └── mascota.ts              # Tipos, catálogo de razas por especie
├── styles/
│   └── global.css              # Estilos fieles al diseño (colores, layout)
├── App.tsx
└── main.tsx
```

## Detalles de la implementación

- **Validación**: cliente, nombre, especie, raza y sexo son obligatorios; se
  muestran mensajes de error inline al intentar guardar sin completarlos.
- **Cliente existente obligatorio**: `ClienteSelector.tsx` obliga a elegir un
  cliente de la lista de registrados (`CLIENTES_MOCK` en `types/mascota.ts`,
  simulando la integración con HU01). No se puede guardar sin cliente.
- **Raza dependiente de especie**: el combo de razas se filtra según la
  especie seleccionada y se reinicia si el usuario cambia de especie.
- **Validación de campos numéricos (criterio de aceptación)**:
  - *Edad*: "años" (0–30) y "meses" (0–11) solo aceptan dígitos mientras se
    escribe y se validan como enteros dentro de rango al guardar.
  - *Peso*: campo obligatorio en kg, acepta hasta 2 decimales, validado
    contra un rango razonable (0.1–150 kg). Si el valor está fuera de rango o
    vacío, se marca el campo en rojo (`aria-invalid`) con su mensaje.
- **Avisos de error (criterio de aceptación)**: al intentar guardar con datos
  inválidos aparece un banner general ("Revisa los campos marcados en
  rojo...") además del mensaje puntual bajo cada campo inválido.
- **Confirmación visual de éxito (criterio de aceptación)**: al guardar
  correctamente, el formulario se reemplaza por `SuccessPanel.tsx`: un ícono
  de check, el mensaje "¡Mascota registrada con éxito!", un resumen
  (especie, raza, sexo, peso) y acciones para registrar otra mascota o volver
  a "Mis Mascotas".
- **Punto de integración**: `RegistroMascotaPage` expone `onGuardar` /
  `onVolver`; ahí se conectaría el llamado real al backend/API de HU05
  (incluyendo `clienteId` como dueño) y la navegación hacia "Mis Mascotas".
- El diseño (colores, tipografía, tarjetas, distribución) replica fielmente
  las capturas provistas; no se introdujeron elementos ajenos al mockup.
>>>>>>> origin/registro_mascota
