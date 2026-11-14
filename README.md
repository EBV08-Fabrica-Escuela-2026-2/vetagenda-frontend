# VetAgenda · Gestión de Citas Veterinarias

VetAgenda es una aplicación web interactiva desarrollada en **React 18**, **TypeScript**, **Vite** y **Tailwind CSS** para la gestión integral de citas veterinarias, pacientes (mascotas), profesionales clínicos y catálogo de servicios asistenciales.

## Características principales

- **Portal de Familias y Clientes:**
  - Exploración de la sede clínica, preguntas frecuentes y buscador de citas.
  - Registro de cuenta y autenticación segura (con soporte de perfil demo de Carolina Restrepo).
  - Consulta y gestión de mascotas vinculadas al usuario.
  - Catálogo interactivo de servicios clínicos con duraciones y tarifas referenciales.
  - Consulta de disponibilidad en tiempo real con calendario de 60 días, franjas horarias y detección de profesionales habilitados (HU09).
  - Reserva paso a paso de turnos clínicos (HU12).
  - Consulta detallada, reprogramación y anulación de citas con liberación inmediata de cupos médicos (HU14).

- **Portal del Equipo Veterinario:**
  - Agenda médica del profesional (con perfil demo del Dr. Camilo Durán).
  - Configuración y ajuste de horarios de atención semanales con franjas horarias y validación de cruces.
  - Cancelación justificada de citas ante imprevistos.

- **Conectividad Híbrida y Fallback Autónomo:**
  - Si el backend Spring Boot (`http://localhost:8080/api`) está disponible, la app se comunica con la API REST.
  - En entornos de vista previa o cuando el backend se encuentra offline, la aplicación recurre de forma transparente a persistencia local (`localStorage`) y datos precargados para asegurar un funcionamiento completo de todos los flujos sin interrupciones.

## Tecnologías

- **React 18** + **TypeScript**
- **Vite 5** (servidor en puerto 3000, `0.0.0.0`)
- **React Router DOM 7**
- **Tailwind CSS 3**
- **Lucide React** (iconografía clínica)

## Scripts disponibles

```bash
# Iniciar servidor de desarrollo en puerto 3000
npm run dev

# Compilar para producción
npm run build

# Previsualizar compilación
npm run preview
```
