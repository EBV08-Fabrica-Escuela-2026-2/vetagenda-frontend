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
- Java 17
- Spring Boot 3.x
- Spring Web
- Spring Data JPA
- PostgreSQL 16
- Maven Wrapper

### Infraestructura
- Docker
- Docker Compose
- Git

## Requisitos previos

Antes de ejecutar el proyecto asegúrate de tener instalado:

- Node.js 20 o superior
- npm 10 o superior
- Java 17
- Maven (opcional si usas el wrapper)
- Docker Desktop con Docker Compose
- Git

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

## Puertos y servicios

### Ejecutando con Docker Compose
- Frontend: http://localhost:3000
- Backend: http://localhost:8080
- PostgreSQL: localhost:5432

### Ejecutando localmente (modo desarrollo)
- Frontend Vite: http://localhost:5173
- Backend Spring Boot: http://localhost:8080
- PostgreSQL: localhost:5432

## Variables de entorno y configuración

En `docker-compose.yml` se configura la base de datos con:

- Base de datos: `vetagenda`
- Usuario: `vetagenda`
- Contraseña: `vetagenda123`

El frontend envía la API al backend mediante:

- `VITE_API_URL=http://localhost:8080/api`

## Cómo ejecutar el proyecto

### Opción 1: Docker Compose (recomendado)

Desde la raíz de `VetAgenda`:

```bash
docker compose up --build
```

Esto levanta:
- la base de datos PostgreSQL
- el backend de Spring Boot
- el frontend de React/Vite

Para detenerlo:

```bash
docker compose down
```

### Opción 2: Frontend local

```bash
cd frontend
npm install
npm run dev
```

### Opción 3: Backend local

Desde la raíz del backend principal (`veterinary-system`):

```bash
cd ../veterinary-system
./mvnw spring-boot:run
```

En Windows:

```powershell
cd ../veterinary-system
./mvnw.cmd spring-boot:run
```

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
- Revisar la configuración de CORS si se cambia el puerto del frontend o del backend.
- Preferir Docker Compose para pruebas y validación del entorno completo.
  de check, el mensaje "¡Mascota registrada con éxito!", un resumen
  (especie, raza, sexo, peso) y acciones para registrar otra mascota o volver
  a "Mis Mascotas".
- **Punto de integración**: `RegistroMascotaPage` expone `onGuardar` /
  `onVolver`; ahí se conectaría el llamado real al backend/API de HU05
  (incluyendo `clienteId` como dueño) y la navegación hacia "Mis Mascotas".
- El diseño (colores, tipografía, tarjetas, distribución) replica fielmente
  las capturas provistas; no se introdujeron elementos ajenos al mockup.
>>>>>>> origin/registro_mascota
