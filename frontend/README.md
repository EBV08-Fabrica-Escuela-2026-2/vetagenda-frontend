# VetAgenda Frontend

Frontend de VetAgenda desarrollado con React, TypeScript y Vite para la gestión de clientes, veterinarios, mascotas, servicios y catálogo de atención veterinaria.

## Stack

- React 18
- TypeScript
- Vite
- Tailwind CSS
- React Router DOM
- Docker
- Node.js 20+

## Requisitos

Antes de ejecutar el proyecto asegúrate de tener instalado:

- Node.js 20 o superior
- npm 10 o superior
- Docker y Docker Compose

## Rutas de la aplicación

Las rutas disponibles en la interfaz son:

- `/` - Landing page principal
- `/login` - Ruta opcional de demo para iniciar sesión, sin auth real
- `/registro` - Registro de cliente
- `/veterinarios/registro` - Registro de veterinario
- `/servicios/registro` - Registro de servicio asistencial
- `/mascotas/registro` - Registro de mascota
- `/catalogo` - Catálogo de servicios

> El alcance actual del proyecto es la landing page y las 5 historias de usuario; no existe login funcional en este repositorio.

## Levantar en desarrollo local

1. Entrar a la carpeta del frontend:

```bash
cd frontend
```

2. Instalar dependencias:

```bash
npm install
```

3. Ejecutar el proyecto:

```bash
npm run dev
```

4. Abrir la app en el navegador:

```text
http://localhost:5173
```

5. Si quieres consumir el backend real, crea un archivo `.env` con:

```env
VITE_API_URL=http://localhost:8080/api
```

## Levantar con Docker

Desde la raíz del proyecto:

```bash
docker compose up --build
```

Esto levantará el frontend junto con el backend y la base de datos del proyecto.

La aplicación frontend quedará disponible en:

```text
http://localhost:3000
```

## Scripts disponibles

```bash
npm run dev
npm run build
npm run preview
```

## Estructura principal

```text
frontend/
├── src/
│   ├── App.tsx
│   ├── main.tsx
│   ├── index.css
│   ├── LandingPage.tsx
│   ├── RegisterPage.tsx
│   ├── components/
│   │   └── BrandHeader.tsx
│   └── pages/
│       ├── RegisterVeterinarianPage.tsx
│       ├── RegistroMascotaPage.tsx
│       ├── RegisterServicePage.tsx
│       └── CatalogoServiciosPage.tsx
├── Dockerfile
├── package.json
├── vite.config.ts
├── tailwind.config.js
├── postcss.config.js
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.node.json
├── index.html
├── README.md
└── .gitignore
```

## Nota

Este frontend se desarrolló como una interfaz de usuario funcional para la gestión veterinaria, con validaciones en formularios, navegación por rutas y un catálogo visual para servicios. La lógica de negocio se maneja principalmente en la capa de frontend para la demo y flujo actual del producto.
