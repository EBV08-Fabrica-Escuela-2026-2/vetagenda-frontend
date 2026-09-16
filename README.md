# 🐾 VetAgenda — Frontend

Plataforma web moderna para la gestión de clínicas veterinarias, control de citas y registro de propietarios y mascotas.

Este repositorio contiene la aplicación **Frontend** de **VetAgenda**, desarrollada con **React 19**, **TypeScript** y **Vite**, enfocada en ofrecer una interfaz intuitiva, accesible y de alto rendimiento.

---

## 📌 Contexto del Proyecto

- **Proyecto:** VetAgenda — Plataforma de Gestión Veterinaria


## 🛠️ Stack Tecnológico

| Tecnología | Versión | Propósito |
| :--- | :--- | :--- |
| [React](https://react.dev/) | `^19.0.0` | Biblioteca de interfaz de usuario reactiva |
| [TypeScript](https://www.typescriptlang.org/) | `~5.7.2` | Tipado estático y robustez en tiempo de compilación |
| [Vite](https://vitejs.dev/) | `^6.0.3` | Entorno de desarrollo rápido y empaquetador para producción |
| [Lucide React](https://lucide.dev/) | `^1.16.0` | Iconografía SVG moderna y optimizada |
| [CSS Tokens](src/index.css) | Vanilla CSS | Variables CSS nativas, animaciones y diseño responsivo |

---

## 📁 Estructura del Proyecto

```text
vetagenda-frontend/
├── public/                    # Archivos estáticos
├── src/
│   ├── components/
│   │   ├── clients/
│   │   │   └── ClientRegisterForm.tsx  # Formulario principal de registro de clientes (HU01)
│   │   └── ui/
│   │       ├── ConfirmationModal.tsx   # Modal de confirmación de registro
│   │       └── Logo.tsx                # Componente de marca e isotipo VetAgenda
│   ├── types/
│   │   └── client.ts                   # Interfaces TypeScript (datos del cliente y respuestas)
│   ├── utils/
│   │   └── validation.ts               # Expresiones regulares y reglas de validación
│   ├── App.tsx                         # Componente raíz con layout (Header, Main, Footer)
│   ├── index.css                       # Variables de diseño, reset y animaciones
│   └── main.tsx                        # Punto de entrada de React 19
├── index.html                          # Plantilla base HTML con fuentes de Google Fonts
├── package.json                        # Dependencias y scripts de ejecución
├── tsconfig.json                       # Configuración base de TypeScript
├── tsconfig.app.json                   # Configuración de compilación para la aplicación
└── vite.config.ts                      # Configuración de Vite y plugin de React
```

---

## 🚀 Instalación y Puesta en Marcha

### Prerrequisitos
- **Node.js**: versión 18 o superior recomendada.
- **npm**: versión 9 o superior.

### Pasos

1. **Clonar el repositorio:**
   ```bash
   git clone https://github.com/EBV08-Fabrica-Escuela-2026-2/vetagenda-frontend.git
   cd vetagenda-frontend
   ```

2. **Instalar dependencias:**
   ```bash
   npm install
   ```

3. **Iniciar el servidor de desarrollo:**
   ```bash
   npm run dev
   ```
   La aplicación estará disponible en `http://localhost:5173/` (o el puerto que indique la terminal).

4. **Compilar para producción:**
   ```bash
   npm run build
   ```
   Genera los archivos optimizados listos para despliegue en la carpeta `dist/`.

5. **Previsualizar la versión de producción:**
   ```bash
   npm run preview
   ```
