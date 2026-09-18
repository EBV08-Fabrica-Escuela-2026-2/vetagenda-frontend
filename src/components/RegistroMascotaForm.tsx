import { useMemo, useState, type FormEvent } from 'react'
import ClienteSelector from './ClienteSelector'
import EspecieSelector from './EspecieSelector'
import SexoSelector from './SexoSelector'
import SuccessPanel from './SuccessPanel'
import {
  LIMITES,
  RAZAS_POR_ESPECIE,
  initialFormData,
  type MascotaFormData,
} from '../types/mascota'

type CampoValidable =
  | 'clienteId'
  | 'nombre'
  | 'especie'
  | 'raza'
  | 'sexo'
  | 'edadAnios'
  | 'edadMeses'
  | 'peso'

type FormErrors = Partial<Record<CampoValidable, string>>

interface RegistroMascotaFormProps {
  onGuardar?: (data: MascotaFormData) => void
  onVolver?: () => void
}

const NUMERO_ENTERO_RE = /^\d{0,3}$/
const NUMERO_DECIMAL_RE = /^\d{0,3}(\.\d{0,2})?$/

export default function RegistroMascotaForm({ onGuardar, onVolver }: RegistroMascotaFormProps) {
  const [formData, setFormData] = useState<MascotaFormData>(initialFormData)
  const [errors, setErrors] = useState<FormErrors>({})
  const [mascotaGuardada, setMascotaGuardada] = useState<MascotaFormData | null>(null)
  const [intentoEnvio, setIntentoEnvio] = useState(false)

  const razasDisponibles = useMemo(
    () => (formData.especie ? RAZAS_POR_ESPECIE[formData.especie] : []),
    [formData.especie],
  )

  function updateField<K extends keyof MascotaFormData>(field: K, value: MascotaFormData[K]) {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  function handleEspecieChange(especie: MascotaFormData['especie']) {
    setFormData((prev) => ({ ...prev, especie, raza: '' }))
  }

  function validar(data: MascotaFormData): FormErrors {
    const nuevosErrores: FormErrors = {}

    if (!data.clienteId) {
      nuevosErrores.clienteId = 'Debes seleccionar un cliente existente registrado en el sistema.'
    }

    if (!data.nombre.trim()) {
      nuevosErrores.nombre = 'El nombre de la mascota es obligatorio.'
    }

    if (!data.especie) {
      nuevosErrores.especie = 'Selecciona una especie.'
    }

    if (!data.raza) {
      nuevosErrores.raza = 'Selecciona la raza.'
    }

    if (!data.sexo) {
      nuevosErrores.sexo = 'Selecciona el sexo.'
    }

    // --- Validación de campos numéricos: edad ---
    if (data.edadAnios !== '') {
      const anios = Number(data.edadAnios)
      if (!Number.isInteger(anios) || anios < LIMITES.edadAnios.min || anios > LIMITES.edadAnios.max) {
        nuevosErrores.edadAnios = `Ingresa un número entre ${LIMITES.edadAnios.min} y ${LIMITES.edadAnios.max}.`
      }
    }

    if (data.edadMeses !== '') {
      const meses = Number(data.edadMeses)
      if (!Number.isInteger(meses) || meses < LIMITES.edadMeses.min || meses > LIMITES.edadMeses.max) {
        nuevosErrores.edadMeses = `Ingresa un número entre ${LIMITES.edadMeses.min} y ${LIMITES.edadMeses.max}.`
      }
    }

    // --- Validación de campo numérico: peso (obligatorio) ---
    if (data.peso === '') {
      nuevosErrores.peso = 'El peso es obligatorio.'
    } else {
      const peso = Number(data.peso)
      if (Number.isNaN(peso) || peso < LIMITES.peso.min || peso > LIMITES.peso.max) {
        nuevosErrores.peso = `Ingresa un peso válido entre ${LIMITES.peso.min} y ${LIMITES.peso.max} kg.`
      }
    }

    return nuevosErrores
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setIntentoEnvio(true)

    const nuevosErrores = validar(formData)
    setErrors(nuevosErrores)

    if (Object.keys(nuevosErrores).length > 0) {
      setMascotaGuardada(null)
      return
    }

    onGuardar?.(formData)
    setMascotaGuardada(formData)
  }

  function handleEnteroChange(field: 'edadAnios' | 'edadMeses', raw: string) {
    if (raw === '' || NUMERO_ENTERO_RE.test(raw)) {
      updateField(field, raw)
    }
  }

  function handlePesoChange(raw: string) {
    if (raw === '' || NUMERO_DECIMAL_RE.test(raw)) {
      updateField('peso', raw)
    }
  }

  function handleRegistrarOtra() {
    setFormData(initialFormData)
    setErrors({})
    setIntentoEnvio(false)
    setMascotaGuardada(null)
  }

  if (mascotaGuardada) {
    return (
      <div className="ficha-card">
        <SuccessPanel data={mascotaGuardada} onRegistrarOtra={handleRegistrarOtra} onVolver={onVolver} />
      </div>
    )
  }

  const hayErrores = intentoEnvio && Object.keys(errors).length > 0

  return (
    <form className="ficha-card" onSubmit={handleSubmit} noValidate>
      <div className="ficha-card__header">
        <h1 className="ficha-card__title">Ficha de Registro de Mascota</h1>
        <p className="ficha-card__subtitle">Ingresa la información básica de tu compañero peludo.</p>
      </div>

      <div className="ficha-card__body">
        {hayErrores && (
          <div className="alert alert--error" role="alert">
            Revisa los campos marcados en rojo antes de guardar.
          </div>
        )}

        <div className="field">
          <label className="field__label" htmlFor="cliente">
            Cliente propietario<span className="field__required">*</span>
          </label>
          <ClienteSelector
            value={formData.clienteId}
            onChange={(clienteId) => updateField('clienteId', clienteId)}
            invalid={Boolean(errors.clienteId)}
          />
          {errors.clienteId && <span className="field__error">{errors.clienteId}</span>}
        </div>

        <div className="field">
          <label className="field__label" htmlFor="nombre">
            Nombre de la mascota<span className="field__required">*</span>
          </label>
          <input
            id="nombre"
            type="text"
            className="field__input"
            placeholder="Ej. Luna, Max, Toby"
            value={formData.nombre}
            onChange={(e) => updateField('nombre', e.target.value)}
            aria-invalid={Boolean(errors.nombre)}
            aria-describedby={errors.nombre ? 'nombre-error' : undefined}
          />
          {errors.nombre && (
            <span className="field__error" id="nombre-error">
              {errors.nombre}
            </span>
          )}
        </div>

        <div className="field">
          <span className="field__label">
            Especie<span className="field__required">*</span>
          </span>
          <EspecieSelector value={formData.especie} onChange={handleEspecieChange} />
          {errors.especie && <span className="field__error">{errors.especie}</span>}
        </div>

        <div className="field">
          <label className="field__label" htmlFor="raza">
            Raza<span className="field__required">*</span>
          </label>
          <div className="select-wrapper">
            <select
              id="raza"
              className="field__select"
              value={formData.raza}
              onChange={(e) => updateField('raza', e.target.value)}
              disabled={!formData.especie}
              aria-invalid={Boolean(errors.raza)}
            >
              <option value="" disabled>
                Selecciona la raza
              </option>
              {razasDisponibles.map((raza) => (
                <option key={raza} value={raza}>
                  {raza}
                </option>
              ))}
            </select>
          </div>
          {errors.raza && <span className="field__error">{errors.raza}</span>}
        </div>

        <div className="field">
          <span className="field__label">
            Sexo<span className="field__required">*</span>
          </span>
          <SexoSelector value={formData.sexo} onChange={(sexo) => updateField('sexo', sexo)} />
          {errors.sexo && <span className="field__error">{errors.sexo}</span>}
        </div>

        <div className="field">
          <span className="field__label">Edad estimada</span>
          <div className="edad-grid">
            <div className="edad-input">
              <input
                type="text"
                inputMode="numeric"
                className="field__input"
                placeholder="0"
                value={formData.edadAnios}
                onChange={(e) => handleEnteroChange('edadAnios', e.target.value)}
                aria-label="Años"
                aria-invalid={Boolean(errors.edadAnios)}
              />
              <span className="edad-input__suffix">años</span>
            </div>
            <div className="edad-input">
              <input
                type="text"
                inputMode="numeric"
                className="field__input"
                placeholder="0"
                value={formData.edadMeses}
                onChange={(e) => handleEnteroChange('edadMeses', e.target.value)}
                aria-label="Meses"
                aria-invalid={Boolean(errors.edadMeses)}
              />
              <span className="edad-input__suffix">meses</span>
            </div>
          </div>
          {(errors.edadAnios || errors.edadMeses) && (
            <span className="field__error">{errors.edadAnios ?? errors.edadMeses}</span>
          )}
        </div>

        <div className="field">
          <label className="field__label" htmlFor="peso">
            Peso<span className="field__required">*</span>
          </label>
          <div className="edad-input">
            <input
              id="peso"
              type="text"
              inputMode="decimal"
              className="field__input"
              placeholder="0.0"
              value={formData.peso}
              onChange={(e) => handlePesoChange(e.target.value)}
              aria-invalid={Boolean(errors.peso)}
              aria-describedby={errors.peso ? 'peso-error' : undefined}
            />
            <span className="edad-input__suffix">kg</span>
          </div>
          {errors.peso && (
            <span className="field__error" id="peso-error">
              {errors.peso}
            </span>
          )}
        </div>

        <div className="field">
          <label className="field__label" htmlFor="observaciones">
            Cuidados especiales / Observaciones clínicas iniciales
          </label>
          <textarea
            id="observaciones"
            className="field__textarea"
            placeholder="Alergias conocidas, medicamentos actuales, condiciones previas, comportamiento especial, etc."
            value={formData.observaciones}
            onChange={(e) => updateField('observaciones', e.target.value)}
            rows={4}
          />
          <span className="field__hint">Esta información será visible para el veterinario en la consulta.</span>
        </div>

        <div className="ficha-card__actions">
          <button type="submit" className="btn btn--primary">
            Guardar Mascota
          </button>
          <button type="button" className="btn btn--link" onClick={onVolver}>
            Volver a Mis Mascotas
          </button>
        </div>
      </div>
    </form>
  )
}
