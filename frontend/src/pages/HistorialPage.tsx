import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { HeartPulse, LoaderCircle, PawPrint, RefreshCw, SearchX } from 'lucide-react';
import { IS_DEMO, isForbidden } from '../services/api';
import {
  getDemoScenario,
  listarMisMascotas,
  obtenerDetalleCliente,
  obtenerHistorialCliente,
  setDemoScenario,
  type DemoScenario,
} from '../services/historialService';
import type { CitaHistorial, FiltrosHistorial, MascotaResumen, PaginaHistorial } from '../types/historial';
import { plural } from '../utils/format';
import { PetSelector } from '../components/historial/PetSelector';
import { SelectPetPrompt } from '../components/historial/SelectPetPrompt';
import { HistorialFilters } from '../components/historial/HistorialFilters';
import { AppointmentCard } from '../components/historial/AppointmentCard';
import { AppointmentDetailDrawer } from '../components/historial/AppointmentDetailDrawer';
import { ComplianceChip } from '../components/historial/ComplianceChip';
import { DemoStateSwitcher } from '../components/historial/DemoStateSwitcher';
import { ForbiddenState } from '../components/ui/ForbiddenState';
import { StateMessage } from '../components/ui/StateMessage';
import { TimelineSkeleton } from '../components/ui/Skeletons';

const FILTROS_BASE: Omit<FiltrosHistorial, 'mascotaId'> = { desde: '', hasta: '', tipo: 'TODOS', estado: 'TODOS' };

type Listado =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'ok'; pagina: PaginaHistorial; citas: CitaHistorial[]; loadingMore: boolean }
  | { status: 'error' };

/** Convierte el parámetro de la URL en el id de mascota. */
function parseMascota(param: string | undefined): number | 'TODAS' | null | 'INVALIDO' {
  if (param === undefined) return null;
  if (param === 'todas') return 'TODAS';
  return /^\d+$/.test(param) ? Number(param) : 'INVALIDO';
}

export function HistorialPage() {
  const navigate = useNavigate();
  const { mascotaId: mascotaParam } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const mascotaSel = parseMascota(mascotaParam);

  const [mascotas, setMascotas] = useState<MascotaResumen[]>([]);
  const [mascotasLoading, setMascotasLoading] = useState(true);
  const [forbidden, setForbidden] = useState(false);
  const [extraFiltros, setExtraFiltros] = useState(FILTROS_BASE);
  const [listado, setListado] = useState<Listado>({ status: 'idle' });
  const [reload, setReload] = useState(0);
  const [scenario, setScenario] = useState<DemoScenario>(getDemoScenario());
  // Filtros a conservar cuando el cambio de mascota viene del formulario de filtros.
  const filtrosPendientes = useRef<typeof FILTROS_BASE | null>(null);

  const citaAbierta = searchParams.get('cita') && /^\d+$/.test(searchParams.get('cita')!) ? Number(searchParams.get('cita')) : null;

  // Mascotas del cliente
  useEffect(() => {
    const controller = new AbortController();
    listarMisMascotas(controller.signal)
      .then(setMascotas)
      .catch((e: Error) => e.name !== 'AbortError' && setMascotas([]))
      .finally(() => setMascotasLoading(false));
    return () => controller.abort();
  }, []);

  // Al cambiar de mascota se limpia el estado 403 y los filtros secundarios
  useEffect(() => {
    setForbidden(false);
    setExtraFiltros(filtrosPendientes.current ?? FILTROS_BASE);
    filtrosPendientes.current = null;
  }, [mascotaParam]);

  const filtros: FiltrosHistorial | null = useMemo(
    () => (mascotaSel === null || mascotaSel === 'INVALIDO' ? null : { mascotaId: mascotaSel, ...extraFiltros }),
    [mascotaSel, extraFiltros],
  );

  const handleForbidden = useCallback(() => {
    // Se descarta cualquier dato ya cargado: no debe quedar nada visible.
    setListado({ status: 'idle' });
    setForbidden(true);
  }, []);

  // Historial (página 0)
  useEffect(() => {
    if (mascotaSel === 'INVALIDO') {
      handleForbidden();
      return;
    }
    if (!filtros) {
      setListado({ status: 'idle' });
      return;
    }
    const controller = new AbortController();
    setListado({ status: 'loading' });
    obtenerHistorialCliente(filtros, 0, controller.signal)
      .then((pagina) => setListado({ status: 'ok', pagina, citas: pagina.citas, loadingMore: false }))
      .catch((error: unknown) => {
        if ((error as Error).name === 'AbortError') return;
        if (isForbidden(error)) handleForbidden();
        else setListado({ status: 'error' });
      });
    return () => controller.abort();
  }, [filtros, mascotaSel, reload, scenario, handleForbidden]);

  const cargarMas = () => {
    if (listado.status !== 'ok' || !filtros) return;
    const siguiente = listado.pagina.page + 1;
    setListado({ ...listado, loadingMore: true });
    obtenerHistorialCliente(filtros, siguiente)
      .then((pagina) => setListado((prev) => (prev.status === 'ok' ? { status: 'ok', pagina, citas: [...prev.citas, ...pagina.citas], loadingMore: false } : prev)))
      .catch((error: unknown) => {
        if (isForbidden(error)) handleForbidden();
        else setListado((prev) => (prev.status === 'ok' ? { ...prev, loadingMore: false } : prev));
      });
  };

  const seleccionarMascota = (id: number | 'TODAS') => navigate(`/historial/mascotas/${id === 'TODAS' ? 'todas' : id}`);

  const aplicarFiltros = (f: FiltrosHistorial) => {
    const { mascotaId, ...resto } = f;
    if (mascotaId !== mascotaSel) {
      filtrosPendientes.current = resto;
      navigate(`/historial/mascotas/${mascotaId === 'TODAS' ? 'todas' : mascotaId}`);
    } else {
      setExtraFiltros(resto);
    }
  };

  const abrirCita = (cita: CitaHistorial) => setSearchParams({ cita: String(cita.id) });
  const cerrarCita = useCallback(() => setSearchParams({}), [setSearchParams]);
  const cargarDetalle = useCallback((id: number, signal: AbortSignal) => obtenerDetalleCliente(id, signal), []);

  const cambiarEscenario = (s: DemoScenario) => {
    setDemoScenario(s);
    setScenario(s);
  };

  if (forbidden) {
    return (
      <ForbiddenState
        onBack={() => {
          setForbidden(false);
          navigate('/historial');
        }}
      />
    );
  }

  const filtrosActivos = Boolean(extraFiltros.desde || extraFiltros.hasta || extraFiltros.tipo !== 'TODOS' || extraFiltros.estado !== 'TODOS');

  return (
    <main className="mx-auto max-w-7xl px-4 pb-16 pt-8 sm:px-6 lg:px-8">
      <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-start">
        <div>
          <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-brand-600">
            <span className="h-2 w-2 rounded-full bg-brand-400" aria-hidden /> Bienestar y cuidado
          </p>
          <h1 className="mt-2 font-display text-4xl font-bold text-brand-950 sm:text-5xl">Historial asistencial</h1>
          <p className="mt-2 text-sm text-ink-500">Consulta las atenciones, diagnósticos y servicios de tus mascotas.</p>
        </div>
        {IS_DEMO && <DemoStateSwitcher value={scenario} onChange={cambiarEscenario} onSimulateForbidden={() => navigate('/historial/mascotas/3')} />}
      </div>

      <section className="mt-8" aria-labelledby="mis-mascotas">
        <h2 id="mis-mascotas" className="mb-3 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-brand-600">
          <PawPrint className="h-3.5 w-3.5" aria-hidden /> Mis mascotas
        </h2>
        {!mascotasLoading && mascotas.length === 0 ? (
          <div className="card">
            <StateMessage icon={PawPrint} title="Aún no tienes mascotas registradas" description="Registra una mascota para empezar a agendar citas y consultar su historial." />
          </div>
        ) : (
          <PetSelector mascotas={mascotas} selected={mascotaSel === 'INVALIDO' ? null : mascotaSel} onSelect={seleccionarMascota} loading={mascotasLoading} />
        )}
      </section>

      <div className="mt-6">
        {mascotaSel === null || !filtros ? (
          mascotas.length > 0 && <SelectPetPrompt />
        ) : (
          <div className="space-y-6">
            <HistorialFilters mascotas={mascotas} value={filtros} defaults={{ mascotaId: filtros.mascotaId, ...FILTROS_BASE }} onApply={aplicarFiltros} />

            <section aria-labelledby="historial-titulo" aria-live="polite">
              <div className="mb-4 flex flex-wrap items-end justify-between gap-3 px-1 sm:pl-24">
                <div>
                  <h2 id="historial-titulo" className="font-display text-2xl font-bold text-brand-950">Historial de atenciones</h2>
                  <p className="text-xs text-ink-400">
                    {listado.status === 'ok'
                      ? `${plural(listado.pagina.totalElementos, 'cita registrada', 'citas registradas')} · Más recientes primero`
                      : 'Más recientes primero'}
                  </p>
                </div>
                {listado.status === 'ok' && listado.pagina.resumen.total > 0 && <ComplianceChip resumen={listado.pagina.resumen} />}
              </div>

              {listado.status === 'loading' && <TimelineSkeleton />}

              {listado.status === 'error' && (
                <div className="card">
                  <StateMessage
                    icon={HeartPulse}
                    tone="danger"
                    title="No pudimos cargar el historial"
                    description="Ocurrió un problema al consultar el servicio. Comprueba tu conexión e inténtalo nuevamente."
                    action={
                      <button type="button" className="btn-primary" onClick={() => setReload((n) => n + 1)}>
                        <RefreshCw className="h-4 w-4" aria-hidden /> Reintentar
                      </button>
                    }
                  />
                </div>
              )}

              {listado.status === 'ok' && listado.citas.length === 0 && (
                <div className="card">
                  {filtrosActivos ? (
                    <StateMessage
                      icon={SearchX}
                      title="No se encontraron citas"
                      description="No hay citas que coincidan con los filtros seleccionados. Prueba con un rango de fechas diferente."
                      action={
                        <button type="button" className="btn-secondary" onClick={() => setExtraFiltros(FILTROS_BASE)}>
                          Limpiar filtros
                        </button>
                      }
                    />
                  ) : (
                    <StateMessage
                      icon={PawPrint}
                      title="Aún no hay citas registradas"
                      description="Cuando esta mascota tenga una atención, podrás consultar aquí toda su evolución clínica."
                      action={
                        <button type="button" className="btn-secondary" onClick={() => navigate('/historial')}>
                          Elegir otra mascota
                        </button>
                      }
                    />
                  )}
                </div>
              )}

              {listado.status === 'ok' && listado.citas.length > 0 && (
                <>
                  <ol className="space-y-3">
                    {listado.citas.map((cita) => (
                      <AppointmentCard key={cita.id} cita={cita} onOpen={abrirCita} />
                    ))}
                  </ol>
                  {listado.pagina.hayMas && (
                    <div className="mt-6 flex justify-center">
                      <button type="button" className="btn-secondary" onClick={cargarMas} disabled={listado.loadingMore}>
                        {listado.loadingMore && <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden />}
                        Cargar más citas
                      </button>
                    </div>
                  )}
                </>
              )}
            </section>
          </div>
        )}
      </div>

      <AppointmentDetailDrawer citaId={citaAbierta} load={cargarDetalle} onClose={cerrarCita} onForbidden={handleForbidden} />
    </main>
  );
}
