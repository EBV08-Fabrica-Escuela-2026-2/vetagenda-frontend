import { CLIENTES_MOCK, type MascotaFormData } from '../types/mascota'

interface SuccessPanelProps {
  data: MascotaFormData
  onRegistrarOtra: () => void
  onVolver?: () => void
}

export default function SuccessPanel({ data, onRegistrarOtra, onVolver }: SuccessPanelProps) {
  const cliente = CLIENTES_MOCK.find((c) => c.id === data.clienteId)

  return (
    <div className="success-panel" role="status">
      <div className="success-panel__icon" aria-hidden="true">
        ✓
      </div>
      <h2 className="success-panel__title">¡Mascota registrada con éxito!</h2>
      <p className="success-panel__text">
        {data.nombre} quedó registrado{data.sexo === 'Hembra' ? 'a' : ''} para{' '}
        <strong>{cliente?.nombre ?? 'el cliente seleccionado'}</strong>.
      </p>

      <dl className="success-panel__summary">
        <div>
          <dt>Especie</dt>
          <dd>{data.especie}</dd>
        </div>
        <div>
          <dt>Raza</dt>
          <dd>{data.raza}</dd>
        </div>
        <div>
          <dt>Sexo</dt>
          <dd>{data.sexo}</dd>
        </div>
        <div>
          <dt>Peso</dt>
          <dd>{data.peso} kg</dd>
        </div>
      </dl>

      <div className="ficha-card__actions">
        <button type="button" className="btn btn--primary" onClick={onRegistrarOtra}>
          Registrar otra mascota
        </button>
        <button type="button" className="btn btn--link" onClick={onVolver}>
          Volver a Mis Mascotas
        </button>
      </div>
    </div>
  )
}
