import { useEffect, useRef, useState, type ReactNode } from 'react';
import { BadgeCheck, CalendarDays, CalendarX2, Download, RefreshCw, TriangleAlert, X } from 'lucide-react';
import type { DetalleAtencion } from '../../types/historial';
import { CANCELADA_POR_LABEL, fechaCorta, fechaLarga, fechaTabla, hora, iniciales } from '../../utils/format';
import { isForbidden } from '../../services/api';
import { StatusBadge } from '../ui/StatusBadge';
import { DrawerSkeleton } from '../ui/Skeletons';
import { StateMessage } from '../ui/StateMessage';

type Props = {
  citaId: number | null;
  load: (citaId: number, signal: AbortSignal) => Promise<DetalleAtencion>;
  onClose: () => void;
  /** Se invoca si el backend responde 403: la página debe ocultar todo y mostrar la vista de acceso restringido. */
  onForbidden: () => void;
};

type State = { status: 'loading' } | { status: 'ok'; data: DetalleAtencion } | { status: 'error' };

export function AppointmentDetailDrawer({ citaId, load, onClose, onForbidden }: Props) {
  const [state, setState] = useState<State>({ status: 'loading' });
  const [reload, setReload] = useState(0);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (citaId === null) return;
    const controller = new AbortController();
    setState({ status: 'loading' });
    load(citaId, controller.signal)
      .then((data) => setState({ status: 'ok', data }))
      .catch((error: unknown) => {
        if ((error as Error).name === 'AbortError') return;
        if (isForbidden(error)) {
          onForbidden();
          return;
        }
        setState({ status: 'error' });
      });
    return () => controller.abort();
  }, [citaId, load, onForbidden, reload]);

  useEffect(() => {
    if (citaId === null) return;
    closeRef.current?.focus();
    const onKey = (event: KeyboardEvent) => event.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = overflow;
    };
  }, [citaId, onClose]);

  if (citaId === null) return null;

  const data = state.status === 'ok' ? state.data : null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 animate-fade-in bg-brand-950/40 backdrop-blur-[2px]" onClick={onClose} aria-hidden />
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="detalle-titulo"
        className="absolute inset-y-0 right-0 flex w-full max-w-xl animate-slide-in flex-col bg-white shadow-drawer"
      >
        <header className="flex items-start justify-between gap-4 border-b border-line px-6 py-5">
          <div>
            <p className="eyebrow !text-brand-600">Detalle de atención</p>
            <h2 id="detalle-titulo" className="mt-1 font-display text-3xl font-bold text-brand-950">
              {data?.servicio ?? 'Cargando…'}
            </h2>
          </div>
          <button ref={closeRef} type="button" onClick={onClose} className="grid h-10 w-10 place-items-center rounded-xl border border-line text-ink-600 hover:border-brand-500 hover:text-brand-800" aria-label="Cerrar detalle">
            <X className="h-5 w-5" aria-hidden />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto">
          {state.status === 'loading' && <DrawerSkeleton />}
          {state.status === 'error' && (
            <StateMessage
              icon={TriangleAlert}
              tone="danger"
              title="No pudimos cargar el detalle"
              description="Ocurrió un problema al consultar el servicio. Inténtalo nuevamente."
              action={
                <button type="button" className="btn-primary" onClick={() => setReload((n) => n + 1)}>
                  <RefreshCw className="h-4 w-4" aria-hidden /> Reintentar
                </button>
              }
            />
          )}
          {data && <DetalleContenido data={data} />}
        </div>

        <footer className="flex justify-end gap-3 border-t border-line px-6 py-4">
          <button type="button" className="btn-secondary" onClick={onClose}>Cerrar</button>
          <button type="button" className="btn-primary" disabled={!data} onClick={() => data && descargarResumen(data)}>
            <Download className="h-4 w-4" aria-hidden /> Descargar resumen
          </button>
        </footer>
      </aside>
    </div>
  );
}

function Seccion({ titulo, extra, children }: { titulo: string; extra?: ReactNode; children: ReactNode }) {
  return (
    <section className="border-b border-line py-5 last:border-b-0">
      <h3 className="eyebrow mb-3 flex items-center gap-2">
        {titulo}
        {extra}
      </h3>
      {children}
    </section>
  );
}

function DetalleContenido({ data }: { data: DetalleAtencion }) {
  const cancelada = data.estado === 'CANCELADA';
  return (
    <>
      <div className={`flex items-center justify-between gap-4 px-6 py-4 ${cancelada ? 'bg-danger-50/60' : 'bg-[#F6FFFC]'}`}>
        <div className="flex items-center gap-3">
          <CalendarDays className={`h-5 w-5 ${cancelada ? 'text-danger-600' : 'text-brand-600'}`} aria-hidden />
          <div>
            <p className="font-display text-lg font-bold leading-tight text-brand-950">{fechaCorta(data.fechaHora)}</p>
            <p className="text-xs text-ink-500">
              {hora(data.fechaHora)} · {data.duracionMinutos} min · {data.mascota.nombre}
            </p>
          </div>
        </div>
        <StatusBadge estado={data.estado} />
      </div>

      <div className="px-6">
        <Seccion titulo="Profesional tratante">
          <div className="flex items-center gap-3">
            {data.profesional.fotoUrl ? (
              <img src={data.profesional.fotoUrl} alt="" className="h-12 w-12 rounded-xl object-cover" />
            ) : (
              <span className="grid h-12 w-12 place-items-center rounded-xl bg-brand-50 font-display font-bold text-brand-700">{iniciales(data.profesional.nombre)}</span>
            )}
            <div className="flex-1">
              <p className="font-display text-lg font-bold leading-tight text-brand-950">{data.profesional.nombre}</p>
              <p className="text-xs text-ink-500">
                {data.profesional.especialidad} · {data.profesional.registroProfesional}
              </p>
            </div>
            {data.profesional.verificado && (
              <span className="inline-flex items-center gap-1 text-xs font-bold text-brand-600">
                <BadgeCheck className="h-4 w-4" aria-hidden /> Verificada
              </span>
            )}
          </div>
        </Seccion>

        {cancelada ? (
          <>
            {data.cancelacion && (
              <Seccion titulo="Cita cancelada">
                <div className="rounded-xl border border-danger-100 bg-danger-50 p-4">
                  <p className="text-sm text-danger-700">
                    Cancelada el {fechaLarga(data.cancelacion.fecha)} a las {hora(data.cancelacion.fecha)} por {CANCELADA_POR_LABEL[data.cancelacion.canceladaPor]}.
                  </p>
                  <p className="mt-3 text-[11px] font-bold uppercase tracking-[0.16em] text-danger-600">Motivo de cancelación</p>
                  <p className="mt-1 text-sm leading-6 text-ink-700">{data.cancelacion.motivo}</p>
                </div>
              </Seccion>
            )}
            <div className="flex flex-col items-center py-8 text-center">
              <CalendarX2 className="h-8 w-8 text-ink-300" aria-hidden />
              <p className="mt-3 text-sm font-bold text-ink-700">Sin diagnóstico ni servicios aplicados</p>
              <p className="text-xs text-ink-400">Esta cita fue cancelada antes de la atención.</p>
            </div>
          </>
        ) : (
          <>
            <Seccion titulo="Diagnóstico">
              {data.diagnosticoPrincipal ? (
                <div className="rounded-r-xl border-l-[3px] border-brand-500 bg-[#F6FFFC] p-4">
                  <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-brand-600">Principal</p>
                  <p className="mt-1 font-display text-lg font-bold text-brand-950">{data.diagnosticoPrincipal.descripcion}</p>
                  <p className="mt-1 text-sm leading-6 text-ink-500">{data.diagnosticoPrincipal.observaciones}</p>
                </div>
              ) : (
                <p className="text-sm italic text-ink-400">Sin diagnóstico registrado para esta atención.</p>
              )}
              <div className="mt-3">
                <p className="text-xs font-semibold text-ink-500">Diagnósticos secundarios</p>
                {data.diagnosticosSecundarios.length === 0 ? (
                  <p className="mt-1 text-xs italic text-ink-400">Sin información registrada</p>
                ) : (
                  <ul className="mt-2 space-y-2">
                    {data.diagnosticosSecundarios.map((d) => (
                      <li key={d.id} className="rounded-lg bg-canvas px-3 py-2 text-sm">
                        <span className="font-bold text-ink-800">{d.descripcion}</span>
                        <span className="block text-xs text-ink-500">{d.observaciones}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </Seccion>

            <Seccion
              titulo="Servicios aplicados"
              extra={<span className="rounded-full bg-brand-50 px-2 py-0.5 text-[11px] text-brand-600">{data.serviciosAplicados.length}</span>}
            >
              {data.serviciosAplicados.length === 0 ? (
                <p className="text-xs italic text-ink-400">Sin servicios registrados</p>
              ) : (
                <ol className="space-y-3">
                  {data.serviciosAplicados.map((s, i) => (
                    <li key={s.id} className="flex items-center gap-3">
                      <span className="grid h-9 w-9 place-items-center rounded-lg bg-brand-50 font-display font-bold text-brand-600">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <span>
                        <span className="block text-sm font-bold text-ink-800">{s.nombre}</span>
                        <span className="block text-xs text-ink-500">Cantidad: {s.cantidad} · {s.detalle}</span>
                      </span>
                    </li>
                  ))}
                </ol>
              )}
            </Seccion>

            {data.tratamientos.length > 0 && (
              <Seccion titulo="Tratamiento indicado">
                <ul className="space-y-2">
                  {data.tratamientos.map((t) => (
                    <li key={t.id} className="flex justify-between gap-3 rounded-lg bg-canvas px-3 py-2 text-sm">
                      <span className="font-bold text-ink-800">{t.medicamento}</span>
                      <span className="text-ink-500">{t.dosis} · {t.duracion}</span>
                    </li>
                  ))}
                </ul>
              </Seccion>
            )}

            <Seccion titulo="Notas clínicas">
              {data.notasClinicas ? (
                <p className="rounded-xl border border-[#F3E3B5] bg-[#FFFBEF] p-4 text-sm leading-6 text-ink-700">{data.notasClinicas}</p>
              ) : (
                <p className="text-xs italic text-ink-400">Sin notas clínicas registradas.</p>
              )}
            </Seccion>
          </>
        )}
      </div>
    </>
  );
}

function descargarResumen(d: DetalleAtencion) {
  const lineas = [
    'VetAgenda · Resumen de atención',
    '================================',
    `Servicio: ${d.servicio}`,
    `Mascota: ${d.mascota.nombre}`,
    `Fecha: ${fechaTabla(d.fechaHora)} ${hora(d.fechaHora)} (${d.duracionMinutos} min)`,
    `Estado: ${d.estado === 'COMPLETADA' ? 'Completada' : 'Cancelada'}`,
    `Profesional: ${d.profesional.nombre} · ${d.profesional.especialidad} · ${d.profesional.registroProfesional}`,
    '',
  ];
  if (d.cancelacion) {
    lineas.push(`Cancelada el ${fechaLarga(d.cancelacion.fecha)} por ${CANCELADA_POR_LABEL[d.cancelacion.canceladaPor]}.`, `Motivo: ${d.cancelacion.motivo}`);
  } else {
    if (d.diagnosticoPrincipal) lineas.push(`Diagnóstico principal: ${d.diagnosticoPrincipal.descripcion}`, `  ${d.diagnosticoPrincipal.observaciones}`);
    d.diagnosticosSecundarios.forEach((x) => lineas.push(`Diagnóstico secundario: ${x.descripcion}`));
    if (d.serviciosAplicados.length) lineas.push('', 'Servicios aplicados:', ...d.serviciosAplicados.map((s) => `  - ${s.nombre} (x${s.cantidad}): ${s.detalle}`));
    if (d.tratamientos.length) lineas.push('', 'Tratamiento:', ...d.tratamientos.map((t) => `  - ${t.medicamento}: ${t.dosis}, ${t.duracion}`));
    if (d.notasClinicas) lineas.push('', `Notas clínicas: ${d.notasClinicas}`);
  }
  const blob = new Blob([lineas.join('\n')], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `resumen-${d.mascota.nombre.toLowerCase()}-${d.fechaHora.slice(0, 10)}.txt`;
  a.click();
  URL.revokeObjectURL(url);
}
