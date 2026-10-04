# VetAgenda

VetAgenda es una plataforma web para la gestión de clientes, mascotas, veterinarios y servicios veterinarios. El proyecto está estructurado con un frontend en React + TypeScript y un backend en Spring Boot que se conecta a PostgreSQL.

## Stack tecnológico

### Frontend
- React 18
- TypeScript
- Vite 5
- Tailwind CSS 3
- React Router DOM
- Node.js 20+

### Backend
- Java 21
- Spring Boot 4.x
- Spring Web MVC
- Spring Data JPA
- Spring Security
- PostgreSQL 16
- Maven

### Infraestructura
- Docker
- Docker Compose
- Git

## Requisitos previos

### Con Docker (recomendado)
Solo necesitas:
- **Docker Desktop** con Docker Compose
- **Git**

### En modo desarrollo local
- Node.js 20 o superior
- npm 10 o superior
- Java 21
- Maven 3.9+
- PostgreSQL 16

## Estructura del proyecto

```text
VetAgenda/
├── .gitignore
├── README.md
├── docker-compose.yml
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
│       │   ├── BrandHeader.tsx
│       │   └── VetForm.tsx
│       ├── pages/
│       │   ├── CatalogoServiciosPage.tsx
│       │   ├── LoginPage.tsx
│       │   ├── RegisterServicePage.tsx
│       │   ├── RegisterVeterinarianPage.tsx
│       │   └── RegistroMascotaPage.tsx
│       └── services/
│           └── api.ts
├── backend/
│   ├── Dockerfile
│   ├── mvnw
│   ├── mvnw.cmd
│   ├── pom.xml
│   └── src/
│       ├── main/
│       │   ├── java/
│       │   └── resources/
│       │       └── application.properties
│       └── test/
└── veterinary-system/   # backend principal del proyecto
    ├── Dockerfile
    ├── mvnw
    ├── pom.xml
    ├── README.md
    ├── setup-db.sh
    └── src/
        ├── main/
        │   ├── java/
        │   └── resources/
        └── test/
```

> El Docker Compose del proyecto usa `../veterinary-system` como contexto del backend, por lo que el backend funcional del sistema principal vive en la carpeta hermana `veterinary-system`.

## Rutas del frontend

El frontend usa React Router y estas son las rutas principales actualmente disponibles:

- `/` - Landing page
- `/inicio` - Landing page alternativa
- `/login` - Login de usuario
- `/registro` - Registro de cliente
- `/veterinarios/registro` - Registro de veterinario
- `/servicios/registro` - Registro de servicio
- `/mascotas/registro` - Registro de mascota
- `/catalogo` - Catálogo de servicios

## Cómo ejecutar el proyecto

### Opción 1: Docker Compose (recomendado)

> Requiere tener clonados **ambos repositorios** en carpetas hermanas:
> ```
> proyectos/
> ├── VetAgenda/           ← este repo
> └── veterinary-system/   ← backend
> ```

Desde la raíz de `VetAgenda`:

```bash
# Primera vez (o tras cambios en el código)
docker compose up --build

# Siguientes veces
docker compose up
```

Esto levanta automáticamente:
- 🗄️ **PostgreSQL** — con el esquema y datos de prueba
- ⚙️ **Backend** Spring Boot — compila y arranca el JAR
- 🖥️ **Frontend** React — compilado y servido con Nginx

| Servicio | URL |
|---|---|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:8080/api |
| Swagger UI | http://localhost:8080/swagger-ui.html |
| PostgreSQL | localhost:5432 (DB: `vetagenda`) |

Para detener:

```bash
docker compose down
```

> ⚠️ **Si cambias el esquema de la base de datos**, el volumen debe borrarse
> para que el nuevo `init.sql` se aplique:
> ```bash
> docker compose down -v
> docker compose up --build
> ```

### Opción 2: Desarrollo local (frontend)

```bash
cd frontend
npm install
npm run dev
# Disponible en http://localhost:5173
```

### Opción 3: Desarrollo local (backend)

```bash
cd ../veterinary-system
mvn spring-boot:run
# API disponible en http://localhost:8080
```

## Variables de entorno

| Variable | Valor por defecto | Descripción |
|---|---|---|
| `VITE_API_URL` | `http://localhost:8080/api` | URL del backend (quemada en el build) |
| `POSTGRES_DB` | `vetagenda` | Nombre de la base de datos |
| `POSTGRES_USER` | `vetagenda` | Usuario de PostgreSQL |
| `POSTGRES_PASSWORD` | `vetagenda123` | Contraseña de PostgreSQL |

## Flujo actual del proyecto

Actualmente el frontend incluye:
- landing page
- registro de clientes
- registro de veterinarios
- registro de servicios
- registro de mascotas
- catálogo de servicios
- integración inicial con el backend a través de la API REST

## Notas importantes

- La carpeta `veterinary-system` es la base principal del backend Java/Spring Boot.
- El archivo `docker-compose.yml` del repositorio root orquesta la bd, backend y frontend.
- Los archivos generados por compilación (`target`) deben quedar excluidos del control de versiones mediante `.gitignore`.
- El frontend está documentado para ejecutarse con Docker y también en modo desarrollo local.

## Buenas prácticas

- Mantener el backend y frontend sincronizados con las rutas y endpoints API.
- Revisar la configuración de CORS en `SecurityConfig.java` si se cambia el puerto del frontend.
- Usar `docker compose down -v` para limpiar la BD si cambia el esquema.
- Preferir Docker Compose para pruebas de integración completa.
