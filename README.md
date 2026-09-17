# VetAgenda

VetAgenda es una plataforma para la gestión de clientes, mascotas y citas
veterinarias. Este repositorio contiene el frontend web y una base inicial del
backend preparada para ejecutarse de forma local o con Docker Compose.

## Stack tecnológico

### Frontend

- React 18
- JavaScript (ES Modules)
- Vite 5
- Tailwind CSS 3
- PostCSS y Autoprefixer
- Node.js 20 o superior

### Backend e infraestructura

- Java 17
- Spring Boot
- Maven Wrapper
- PostgreSQL 16
- Docker y Docker Compose

## Requisitos

Para ejecutar el proyecto localmente se necesita:

- Node.js 20 o superior y npm 10 o superior.
- Java 17 o superior.
- Docker Desktop con Docker Compose, si se desea ejecutar toda la solución en
  contenedores.
- Git.

## Instalación y ejecución local

### Frontend

Desde la raíz del repositorio:

```bash
cd frontend
npm install
npm run dev
```

La aplicación estará disponible en <http://localhost:5173>.

Comandos principales:

```bash
npm run dev       # Servidor de desarrollo
npm run build     # Compilación de producción
npm run preview   # Previsualización de la compilación
```

### Backend

Desde la raíz del repositorio:

```bash
cd backend
./mvnw spring-boot:run
```

En Windows se puede utilizar:

```powershell
cd backend
.\mvnw.cmd spring-boot:run
```

El backend utiliza el puerto `8080`.

## Ejecución con Docker Compose

Para levantar PostgreSQL, backend y frontend:

```bash
docker compose up --build
```

Servicios disponibles:

- Frontend: <http://localhost:3000>
- Backend: <http://localhost:8080>
- PostgreSQL: `localhost:5432`

Para detener los servicios:

```bash
docker compose down
```

Las credenciales de desarrollo de PostgreSQL están definidas en
`docker-compose.yml`. No deben reutilizarse en producción.

## Estructura del proyecto

```text
VetAgenda/
├── backend/
│   ├── src/main/java/com/vetagenda/
│   │   ├── VetAgendaApplication.java
│   │   └── controller/
│   │       └── HelloController.java
│   ├── src/main/resources/
│   │   └── application.properties
│   ├── pom.xml
│   ├── Dockerfile
│   ├── mvnw
│   └── mvnw.cmd
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── Dockerfile
│   └── README.md
├── docker-compose.yml
├── .gitignore
└── README.md
```

## Estado actual

El frontend incluye la pantalla de registro de clientes con validaciones para
nombre, correo, teléfono, contraseña y confirmación de contraseña. El backend
contiene la configuración inicial de Spring Boot y un endpoint de prueba.
