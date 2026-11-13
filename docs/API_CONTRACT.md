# Contrato API · Historial asistencial (HU: consulta de historial médico y de citas)

Este documento describe los endpoints que el frontend consume y las reglas que el **backend Spring Boot** (`veterinary-system`) debe cumplir. El frontend ya está implementado contra este contrato; en modo demo (`src/services/historialService.ts`) se simula exactamente este comportamiento, incluido el 403.

- Base: `VITE_API_URL` (por ejemplo `http://localhost:8080/api`)
- Autenticación: `Authorization: Bearer <JWT>` en todas las rutas.
- Fechas: ISO-8601 con zona horaria (`2026-11-10T10:30:00-05:00`). Zona de negocio: `America/Bogota`.
- Errores: `{ "status": 403, "error": "Forbidden", "mensaje": "No tienes permiso para ver esta información." }`

---

## 1. Endpoints del cliente (rol `CLIENTE`)

### `GET /clientes/me/mascotas`
Mascotas del cliente autenticado (el id del cliente sale **del token**, nunca de un parámetro).

```json
[
  { "id": 1, "nombre": "Bruno", "especie": "PERRO", "raza": "Golden Retriever", "fotoUrl": null }
]
```

### `GET /clientes/me/mascotas/{mascotaId}/historial`
### `GET /clientes/me/historial` (todas las mascotas del cliente)

Query params (todos opcionales):

| Param   | Tipo                 | Ejemplo            |
|---------|----------------------|--------------------|
| desde   | `yyyy-MM-dd`         | `2026-01-01`       |
| hasta   | `yyyy-MM-dd`         | `2026-11-30`       |
| tipo    | `TipoCita`           | `VACUNACION`       |
| estado  | `COMPLETADA \| CANCELADA` | `CANCELADA`   |
| page    | int (desde 0)        | `0`                |
| size    | int                  | `5`                |

Solo devuelve citas en estado **COMPLETADA** o **CANCELADA** (no pendientes), ordenadas por `fechaHora` **descendente**.

```json
{
  "citas": [
    {
      "id": 501,
      "mascota": { "id": 1, "nombre": "Bruno" },
      "profesional": { "id": 7, "nombre": "Dra. Valentina Gómez" },
      "fechaHora": "2026-11-10T10:30:00-05:00",
      "duracionMinutos": 30,
      "tipo": "CONSULTA_GENERAL",
      "servicio": "Consulta general",
      "motivo": "Control digestivo y seguimiento de evolución",
      "estado": "COMPLETADA"
    }
  ],
  "resumen": { "total": 6, "completadas": 4, "canceladas": 2, "porcentaje": 67 },
  "page": 0,
  "size": 5,
  "totalElementos": 6,
  "hayMas": true
}
```

> `resumen` se calcula sobre **todas** las citas completadas + canceladas de la(s) mascota(s), sin aplicar filtros. `porcentaje = round(completadas / total * 100)`.
> La lista **no** incluye diagnósticos ni notas: esos datos solo viajan en el detalle.

### `GET /clientes/me/citas/{citaId}`
Detalle de una atención (fecha, profesional tratante, servicio, diagnósticos, servicios aplicados, tratamientos y notas clínicas; o datos de cancelación).

```json
{
  "id": 501,
  "mascota": { "id": 1, "nombre": "Bruno" },
  "profesional": {
    "id": 7, "nombre": "Dra. Valentina Gómez", "especialidad": "Medicina interna",
    "registroProfesional": "MP 18429", "verificado": true, "fotoUrl": null
  },
  "fechaHora": "2026-11-10T10:30:00-05:00",
  "duracionMinutos": 30,
  "tipo": "CONSULTA_GENERAL",
  "servicio": "Consulta general",
  "motivo": "Control digestivo y seguimiento de evolución",
  "estado": "COMPLETADA",
  "diagnosticoPrincipal": {
    "id": 9001, "citaId": 501, "fecha": "2026-11-10T10:30:00-05:00",
    "descripcion": "Gastritis leve de origen alimentario",
    "observaciones": "Paciente estable…", "principal": true, "registradoPor": "Dra. Valentina Gómez"
  },
  "diagnosticosSecundarios": [],
  "serviciosAplicados": [{ "id": 1, "nombre": "Consulta médica general", "cantidad": 1, "detalle": "Evaluación completa" }],
  "notasClinicas": "Continuar dieta gastrointestinal por 7 días…",
  "tratamientos": [{ "id": 801, "citaId": 501, "medicamento": "Omeprazol", "dosis": "20 mg / 24 h", "duracion": "7 días", "fechaIndicacion": "2026-11-10T10:30:00-05:00" }],
  "cancelacion": null
}
```

Para una cita cancelada: `diagnosticoPrincipal: null`, listas vacías, `notasClinicas: null` y
`"cancelacion": { "fecha": "…", "canceladaPor": "CLIENTE | VETERINARIO | CLINICA", "motivo": "…" }`.

---

## 2. Endpoints del veterinario (rol `VETERINARIO`)

### `GET /veterinario-portal/consulta-activa`
`200` con la consulta en curso o `204 No Content` si no hay ninguna.

```json
{
  "citaId": 510,
  "inicio": "2026-11-13T16:05:00-05:00",
  "paciente": {
    "id": 1, "nombre": "Bruno", "especie": "PERRO", "raza": "Golden Retriever", "fotoUrl": null,
    "edadAnios": 5, "pesoKg": 28.4, "sexo": "MACHO", "propietario": "Camila Mejía"
  }
}
```

### `GET /veterinario-portal/pacientes/{mascotaId}/historial-clinico`
Query: `q` (texto en diagnóstico, tratamiento, servicio o nota), `periodo` (`ULTIMOS_12_MESES | ULTIMOS_6_MESES | TODO`), `tipo`.

```json
{
  "paciente": { "...": "igual que en consulta-activa" },
  "cumplimiento": { "total": 6, "completadas": 4, "canceladas": 2, "porcentaje": 67 },
  "citas": [ "CitaHistorial…" ],
  "diagnosticos": [ "Diagnostico…" ],
  "tratamientos": [ "Tratamiento…" ],
  "resumen": {
    "alergias": ["Polen y ácaros"],
    "diagnosticosActivos": ["Dermatitis alérgica", "Sensibilidad digestiva"],
    "ultimaVacuna": { "nombre": "Vacuna múltiple", "fecha": "2026-03-15" },
    "proximoControl": "2026-11-25T10:00:00-05:00"
  }
}
```

### `GET /veterinario-portal/citas/{citaId}`
Mismo cuerpo que `GET /clientes/me/citas/{citaId}`.

---

## 3. Regla de seguridad: validación de titularidad → 403

**Escenario:** un cliente fuerza la URL (`/historial/mascotas/3`, `?cita=701`) o llama directamente a la API para ver el historial de una mascota ajena.

El backend **debe**:

1. Tomar la identidad del usuario **del JWT** (nunca de un parámetro o del body).
2. Antes de consultar datos clínicos, verificar:
   - `CLIENTE`: `mascota.cliente.id == usuarioAutenticado.id`.
   - `VETERINARIO`: el paciente está asignado al veterinario (tiene o tuvo una cita con él).
   - Para `/citas/{citaId}`: la verificación se hace sobre la mascota de la cita.
3. Si no se cumple → `403 Forbidden` con un cuerpo **genérico**, sin nombre de mascota, propietario, diagnósticos ni ningún otro dato.
4. Si la mascota/cita **no existe**, responder también `403` (no `404`), para no revelar qué IDs existen.
5. Registrar el intento en el log de auditoría (usuario, recurso, fecha).

Ejemplo de implementación sugerida (Spring Boot / Spring Security):

```java
@RestController
@RequestMapping("/api/clientes/me")
@PreAuthorize("hasRole('CLIENTE')")
@RequiredArgsConstructor
class HistorialClienteController {

  private final HistorialService historialService;

  @GetMapping("/mascotas/{mascotaId}/historial")
  PaginaHistorialDto historial(@AuthenticationPrincipal UsuarioAutenticado usuario,
                               @PathVariable Long mascotaId,
                               @Valid FiltrosHistorialDto filtros,
                               Pageable pageable) {
    historialService.validarTitularidad(usuario.getClienteId(), mascotaId);
    return historialService.historialDeMascota(mascotaId, filtros, pageable);
  }

  @GetMapping("/citas/{citaId}")
  DetalleAtencionDto detalle(@AuthenticationPrincipal UsuarioAutenticado usuario, @PathVariable Long citaId) {
    Long mascotaId = historialService.mascotaDeCita(citaId)
        .orElseThrow(AccesoDenegadoException::new);         // inexistente → 403
    historialService.validarTitularidad(usuario.getClienteId(), mascotaId);
    return historialService.detalle(citaId);
  }
}

// En HistorialService
public void validarTitularidad(Long clienteId, Long mascotaId) {
  if (!mascotaRepository.existsByIdAndClienteId(mascotaId, clienteId)) {
    log.warn("Acceso denegado al historial: cliente={} mascota={}", clienteId, mascotaId);
    throw new AccesoDenegadoException();
  }
}

@ResponseStatus(HttpStatus.FORBIDDEN)
class AccesoDenegadoException extends RuntimeException {}

// En el @RestControllerAdvice
@ExceptionHandler(AccesoDenegadoException.class)
ResponseEntity<Map<String, Object>> forbidden() {
  return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of(
      "status", 403,
      "error", "Forbidden",
      "mensaje", "No tienes permiso para ver esta información."));
}
```

Queries sugeridas:

```sql
-- Titularidad del cliente
SELECT EXISTS (SELECT 1 FROM mascota WHERE id = :mascotaId AND cliente_id = :clienteId);

-- Paciente asignado al veterinario
SELECT EXISTS (SELECT 1 FROM cita WHERE mascota_id = :mascotaId AND veterinario_id = :veterinarioId);
```

### Comportamiento del frontend ante un 403
- `apiGet` convierte el 403 en `ForbiddenError` y **no** reutiliza el cuerpo de la respuesta.
- La página descarta todo dato cargado previamente y muestra solo la vista "Acceso restringido".
- El 403 se maneja igual si llega desde la lista o desde el detalle de una cita.

## 4. Casos de prueba sugeridos para el backend

| # | Usuario | Petición | Esperado |
|---|---------|----------|----------|
| 1 | Cliente A | `GET /clientes/me/mascotas/{mascotaDeA}/historial` | 200, solo citas COMPLETADA/CANCELADA, orden descendente |
| 2 | Cliente A | `GET /clientes/me/mascotas/{mascotaDeB}/historial` | 403, cuerpo genérico |
| 3 | Cliente A | `GET /clientes/me/citas/{citaDeMascotaDeB}` | 403, cuerpo genérico |
| 4 | Cliente A | `GET /clientes/me/mascotas/999999/historial` | 403 (no 404) |
| 5 | Veterinario X | `GET /veterinario-portal/pacientes/{asignado}/historial-clinico` | 200 con diagnósticos, tratamientos y fechas |
| 6 | Veterinario X | `GET /veterinario-portal/pacientes/{noAsignado}/historial-clinico` | 403 |
| 7 | Sin token | cualquiera | 401 |
| 8 | Cliente | `GET /veterinario-portal/...` | 403 por rol |
