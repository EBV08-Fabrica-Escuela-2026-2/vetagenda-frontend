# VetAgenda Frontend

Frontend de la aplicación VetAgenda, desarrollado con React + Vite + Tailwind CSS para la gestión de reservas de citas veterinarias y registro de clientes.

## Stack tecnológico

- React 18
- Vite
- JavaScript
- Tailwind CSS
- Docker
- Node.js 20+

## Requisitos

Antes de ejecutar este proyecto, asegúrate de tener instalado:

- Node.js 20 o superior
- npm 10 o superior
- Docker + Docker Compose (opcional, si deseas ejecutarlo en contenedores)

## Instalación local

1. Abre una terminal en la carpeta del frontend:

   ```bash
   cd frontend
   ```

2. Instala las dependencias:

   ```bash
   npm install
   ```

3. Inicia el proyecto en modo desarrollo:

   ```bash
   npm run dev
   ```

4. Abre tu navegador en:

   ```text
   http://localhost:5173
   ```

## Ejecución con Docker

Desde la raíz del proyecto principal:

```bash
cd ..
docker compose up --build
```

La interfaz quedará disponible en:

```text
http://localhost:3000
```

## Estructura del proyecto

```text
frontend/
├── src/
│   ├── App.jsx          # Componente principal de la interfaz
│   ├── main.jsx         # Entrada de la aplicación React
│   ├── index.css        # Estilos base y Tailwind
│   └── ...
├── index.html           # HTML base
├── package.json          # Dependencias y scripts
├── vite.config.js        # Configuración de Vite
├── tailwind.config.js   # Configuración de Tailwind
├── postcss.config.js    # Configuración de PostCSS
├── Dockerfile            # Imagen Docker para el frontend
├── README.md             # Documentación del frontend
└── .dockerignore         # Archivos ignorados por Docker
```

## Scripts disponibles

En el archivo `package.json` se incluyen los siguientes comandos:

```bash
npm run dev
npm run build
npm run preview
```

## Descripción general

Este frontend está pensado para:

- Registro de clientes
- Gestión de reservas de citas
- Interfaz amigable para usuarios veterinarios y clientes
- Diseño moderno con enfoque en usabilidad y acceso

## Notas

- El proyecto usa Tailwind CSS para mantener un diseño limpio y escalable.
- La configuración de Vite está preparada para ejecutarse en entorno Docker y en desarrollo local.
- El backend del proyecto se conecta mediante el puerto 8080 y la base de datos PostgreSQL en el contenedor `db`.
