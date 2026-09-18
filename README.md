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

Comandos útiles:

```bash
npm run dev
npm run build
npm run preview
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

## Convenciones de desarrollo

- Frontend en TypeScript + React
- Rutas definidas en `frontend/src/App.tsx`
- Estilos con Tailwind CSS
- Backend con Spring Boot y conexión PostgreSQL
- Ejecución recomendada con Docker Compose para entorno consistente
