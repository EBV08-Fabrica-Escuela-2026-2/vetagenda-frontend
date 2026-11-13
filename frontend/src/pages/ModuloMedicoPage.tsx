import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { CalendarDays, CirclePlus, HeartPulse, RefreshCw, Search, SearchX, Stethoscope } from 'lucide-react';
import { IS_DEMO, isForbidden } from '../services/api';
import {
  getDemoScenario,
  obtenerConsultaActiva,
  obtenerDetalleVeterinario,
  obtenerHistorialClinico,
  setDemoScenario,
  type DemoScenario,
} from '../services/historialService';
import type { CitaHistorial, ConsultaActiva, FiltrosClinicos, HistorialClinico } from '../types/historial';
import { TIPO_LABEL } from '../utils/format';
import { PatientBanner } from '../components/medico/PatientBanner';
import { ClinicalKpis } from '../components/medico/ClinicalKpis';
import { ClinicalSummary } from '../components/medico/ClinicalSummary';
import { DiagnosticosList, TratamientosTable } from '../components/medico/ClinicalRecords';
import { AppointmentCard } from '../components/historial/AppointmentCard';
import { AppointmentDetailDrawer } from '../components/historial/AppointmentDetailDrawer';
import { DemoStateSwitcher } from '../components/historial/DemoStateSwitcher';
import { ForbiddenState } from '../components/ui/ForbiddenState';
import { StateMessage } from '../components/ui/StateMessage';
import { TimelineSkeleton } from '../components/ui/Skeletons';

type Tab = 'evolucion' | 'diagnosticos' | 'tratamientos';
const FILTROS_BASE: FiltrosClinicos = { q: '', periodo: 'ULTIMOS_12_MESES', tipo: 'TODOS' };

type Carga = { status: 'loading' } | { status: 'ok'; data: HistorialClinico } | { status: 'error' } | { status: 'sin-consulta' };

export function ModuloMedicoPage() {
  const navigate = useNavigate();
  const { mascotaId: param } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();

  const [consulta, setConsulta] = useState<ConsultaActiva | null | undefined>(undefined);
  const [carga, setCarga] = useState<Carga>({ status: 'loading' });
  const [forbidden, setForbidden] = useState(false);
  const [tab, setTab] = useState<Tab>('evolucion');
  const [busqueda, setBusqueda] = useState('');
  const [filtros, setFiltros] = useState(FILTROS_BASE);
  const [reload, setReload] = useState(0);
  const [scenario, setScenario] = useState<DemoScenario>(getDemoScenario());

  const citaAbierta = /^\d+$/.test(searchParams.get('cita') ?? '') ? Number(searchParams.get('cita')) : null;

  // Consulta activa del veterinario
  useEffect(() => {
    const controller = new AbortController();
    obtenerConsultaActiva(controller.signal)
      .then(setConsulta)
      .catch((e: Error) => e.name !== 'AbortError' && setConsulta(null));
    return () => controller.abort();
  }, []);

  // Paciente a consultar: el de la URL o, si no hay, el de la consulta activa.
  const mascotaId = useMemo(() => {
    if (param !== undefined) return /^\d+$/.test(param) ? Number(param) : NaN;
    return consulta ? consulta.paciente.id : consulta === null ? null : undefined;
  }, [param, consulta]);

  // Búsqueda con debounce (diagnóstico, tratamiento o nota)
  useEffect(() => {
    const id = window.setTimeout(() => setFiltros((f) => (f.q === busqueda ? f : { ...f, q: busqueda })), 300);
    return () => window.clearTimeout(id);
  }, [busqueda]);

  useEffect(() => {
    setForbidden(false);
  }, [param]);

  const handleForbidden = useCallback(() => {
    setCarga({ status: 'loading' });
    setForbidden(true);
  }, []);

  useEffect(() => {
    if (mascotaId === undefined) return; // esperando consulta activa
    if (mascotaId === null) {
      setCarga({ status: 'sin-consulta' });
      return;
    }
    if (Number.isNaN(mascotaId)) {
      handleForbidden();
      return;
    }
    const controller = new AbortController();
    setCarga((prev) => (prev.status === 'ok' && prev.data.paciente.id === mascotaId ? prev : { status: 'loading' }));
    obtenerHistorialClinico(mascotaId, filtros, controller.signal)
      .then((data) => setCarga({ status: 'ok', data }))
      .catch((error: unknown) => {
        if ((error as Error).name === 'AbortError') return;
        if (isForbidden(error)) handleForbidden();
        else setCarga({ status: 'error' });
      });
    return () => controller.abort();
  }, [mascotaId, filtros, reload, scenario, handleForbidden]);

  const abrirCita = (cita: CitaHistorial) => setSearchParams({ cita: String(cita.id) });
  const cerrarCita = useCallback(() => setSearchParams({}), [setSearchParams]);
  const cargarDetalle = useCallback((id: number, signal: AbortSignal) => obtenerDetalleVeterinario(id, signal), []);
  const limpiar = () => {
    setBusqueda('');
    setFiltros(FILTROS_BASE);
  };

  if (forbidden) {
    return (
      <ForbiddenState
        backLabel="Volver al módulo médico"
        description="Este paciente no está asignado a tu agenda. Por seguridad, no podemos mostrar su información médica."
        onBack={() => {
          setForbidden(false);
          navigate('/modulo-medico');
        }}
      />
    );
  }

  const data = carga.status === 'ok' ? carga.data : null;
  const esConsultaActiva = Boolean(data && consulta && consulta.paciente.id === data.paciente.id);
  const filtrosActivos = filtros.q !== '' || filtros.periodo !== FILTROS_BASE.periodo || filtros.tipo !== 'TODOS';

  const tabs: { id: Tab; label: string; count?: number }[] = [
    { id: 'evolucion', label: 'Evolución clínica' },
    { id: 'diagnosticos', label: 'Diagnósticos', count: data?.diagnosticos.length },
    { id: 'tratamientos', label: 'Tratamientos', count: data?.tratamientos.length },
  ];

  const vacio = (texto: string) => (
    <StateMessage
      icon={filtrosActivos ? SearchX : CirclePlus}
      title={filtrosActivos ? 'Sin coincidencias' : 'Sin registros'}
      description={filtrosActivos ? 'No hay registros que coincidan con la búsqueda o los filtros.' : texto}
      action={filtrosActivos ? <button type="button" className="btn-secondary" onClick={limpiar}>Limpiar filtros</button> : undefined}
    />
  );

  return (
    <>
      {data && (
        <PatientBanner
          paciente={data.paciente}
          inicioConsulta={esConsultaActiva ? consulta!.inicio : null}
          onVolverConsulta={consulta ? () => navigate('/modulo-medico') : undefined}
        />
      )}

      <main className="mx-auto max-w-7xl px-4 pb-16 pt-8 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div>
            <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-brand-600">
              <CirclePlus className="h-3.5 w-3.5" aria-hidden /> Módulo médico
            </p>
            <h1 className="mt-2 font-display text-4xl font-bold text-brand-950 sm:text-5xl">Historial clínico</h1>
            <p className="mt-2 text-sm text-ink-500">Evolución longitudinal del paciente y antecedentes relevantes.</p>
          </div>
          <div className="flex flex-col gap-4 lg:items-end">
            {IS_DEMO && (
              <DemoStateSwitcher
                value={scenario}
                onChange={(s) => {
                  setDemoScenario(s);
                  setScenario(s);
                  setCarga({ status: 'loading' });
                }}
                onSimulateForbidden={() => navigate('/modulo-medico/pacientes/3')}
              />
            )}
            {carga.status !== 'sin-consulta' && (
              <label className="relative block w-full lg:w-80">
                <span className="sr-only">Buscar en el historial clínico</span>
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" aria-hidden />
                <input
                  type="search"
                  className="field pl-9"
                  placeholder="Buscar diagnóstico, tratamiento o nota…"
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                />
              </label>
            )}
          </div>
        </div>

        {carga.status === 'sin-consulta' && (
          <div className="card mt-8">
            <StateMessage
              icon={Stethoscope}
              title="No tienes una consulta activa"
              description="Cuando inicies la atención de un paciente asignado, aquí podrás consultar su historial clínico completo."
            />
          </div>
        )}

        {carga.status === 'error' && (
          <div className="card mt-8">
            <StateMessage
              icon={HeartPulse}
              tone="danger"
              title="No pudimos cargar el historial clínico"
              description="Ocurrió un problema al consultar el servicio. Comprueba tu conexión e inténtalo nuevamente."
              action={
                <button type="button" className="btn-primary" onClick={() => setReload((n) => n + 1)}>
                  <RefreshCw className="h-4 w-4" aria-hidden /> Reintentar
                </button>
              }
            />
          </div>
        )}

        {carga.status === 'loading' && (
          <div className="mt-8 space-y-6">
            <div className="grid gap-4 md:grid-cols-3">
              {[0, 1, 2].map((i) => <div key={i} className="skeleton h-28" />)}
            </div>
            <TimelineSkeleton />
          </div>
        )}

        {data && (
          <>
            <div className="mt-8">
              <ClinicalKpis resumen={data.cumplimiento} />
            </div>

            <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_300px] xl:grid-cols-[1fr_340px]">
              <section className="card overflow-hidden">
                <div role="tablist" aria-label="Secciones del historial clínico" className="flex gap-1 overflow-x-auto border-b border-line px-4">
                  {tabs.map((t) => (
                    <button
                      key={t.id}
                      role="tab"
                      type="button"
                      id={`tab-${t.id}`}
                      aria-selected={tab === t.id}
                      aria-controls={`panel-${t.id}`}
                      onClick={() => setTab(t.id)}
                      className={`relative flex items-center gap-2 whitespace-nowrap px-3 py-4 text-sm font-semibold transition ${
                        tab === t.id ? 'text-brand-950' : 'text-ink-400 hover:text-ink-700'
                      }`}
                    >
                      {t.label}
                      {t.count !== undefined && <span className="rounded-full bg-canvas px-2 text-[11px] font-bold text-ink-500">{t.count}</span>}
                      {tab === t.id && <span className="absolute inset-x-2 bottom-0 h-[3px] rounded-t bg-brand-500" />}
                    </button>
                  ))}
                </div>

                <div className="flex flex-wrap items-center gap-2 border-b border-line bg-canvas/60 px-4 py-3">
                  <label className="relative">
                    <span className="sr-only">Periodo</span>
                    <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" aria-hidden />
                    <select className="field !h-9 !w-auto pl-9 !text-xs" value={filtros.periodo} onChange={(e) => setFiltros({ ...filtros, periodo: e.target.value as FiltrosClinicos['periodo'] })}>
                      <option value="ULTIMOS_12_MESES">Últimos 12 meses</option>
                      <option value="ULTIMOS_6_MESES">Últimos 6 meses</option>
                      <option value="TODO">Todo el historial</option>
                    </select>
                  </label>
                  <label>
                    <span className="sr-only">Tipo de cita</span>
                    <select className="field !h-9 !w-auto !text-xs" value={filtros.tipo} onChange={(e) => setFiltros({ ...filtros, tipo: e.target.value as FiltrosClinicos['tipo'] })}>
                      <option value="TODOS">Todos los tipos</option>
                      {(Object.keys(TIPO_LABEL) as (keyof typeof TIPO_LABEL)[]).map((tipo) => (
                        <option key={tipo} value={tipo}>{TIPO_LABEL[tipo]}</option>
                      ))}
                    </select>
                  </label>
                  {filtrosActivos && (
                    <button type="button" onClick={limpiar} className="ml-auto text-xs font-bold text-brand-600 hover:text-brand-800">
                      Limpiar filtros
                    </button>
                  )}
                </div>

                <div role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`} className="p-4">
                  {tab === 'evolucion' &&
                    (data.citas.length === 0 ? (
                      vacio('Este paciente aún no tiene citas en el periodo seleccionado.')
                    ) : (
                      <ol className="space-y-3">
                        {data.citas.map((cita) => <AppointmentCard key={cita.id} cita={cita} onOpen={abrirCita} />)}
                      </ol>
                    ))}
                  {tab === 'diagnosticos' &&
                    (data.diagnosticos.length === 0 ? vacio('No hay diagnósticos registrados en el periodo.') : <DiagnosticosList diagnosticos={data.diagnosticos} />)}
                  {tab === 'tratamientos' &&
                    (data.tratamientos.length === 0 ? vacio('No hay tratamientos registrados en el periodo.') : <TratamientosTable tratamientos={data.tratamientos} />)}
                </div>
              </section>

              <ClinicalSummary resumen={data.resumen} />
            </div>
          </>
        )}
      </main>

      <AppointmentDetailDrawer citaId={citaAbierta} load={cargarDetalle} onClose={cerrarCita} onForbidden={handleForbidden} />
    </>
  );
}
