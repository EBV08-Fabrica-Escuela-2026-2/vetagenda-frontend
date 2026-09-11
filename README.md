# VetAgenda · HU05 Registro de Mascota

Implementación en **React + TypeScript + Vite** de la historia de usuario
**HU05 – Registro Mascota**, replicando el diseño de la ficha "Registro de
Mascota" (nombre, especie, raza, sexo, edad estimada y observaciones clínicas).

## Requisitos

- Node.js 18+
- npm 9+

## Instalación y ejecución

```bash
npm install
npm run dev
```

La app quedará disponible en `http://localhost:5173`.

## Build de producción

```bash
npm run build
npm run preview
```

## Estructura del proyecto

```
src/
├── components/
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
