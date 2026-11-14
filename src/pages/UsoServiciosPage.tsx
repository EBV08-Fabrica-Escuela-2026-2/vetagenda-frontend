import { useEffect, useState } from 'react';
import { ArrowLeft, BarChart3, CalendarDays, ClipboardList, DollarSign, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { BrandHeader } from '../components/BrandHeader';
import { ClientSessionActions } from '../components/ClientSessionActions';
import { formatearIngresos, MOCK_SERVICIOS_USO, obtenerReporteUsoServicios } from '../services/usoServicios';
import type { MetricaServicio, PeriodoFiltro, ReporteUsoServiciosResponse } from '../types/usoServicios';

function UsoServiciosSkeleton() {
  return (
    <div className="space-y-5" aria-label="Cargando reporte de servicios" aria-busy="true">
      <div className="grid gap-4 sm:grid-cols-2">
        {[0, 1].map((item) => (
          <div key={item} className="h-32 animate-pulse rounded-2xl border border-slate-200 bg-white p-5">
            <div className="h-4 w-32 rounded bg-slate-200" />
            <div className="mt-5 h-8 w-40 rounded bg-slate-200" />
          </div>
        ))}
      </div>
      <div className="h-80 animate-pulse rounded-2xl border border-slate-200 bg-white p-6">
        <div className="h-5 w-56 rounded bg-slate-200" />
        <div className="mt-8 space-y-5">
          {[0, 1, 2, 3].map((item) => <div key={item} className="h-7 rounded bg-slate-100" />)}
        </div>
      </div>
      <div className="h-72 animate-pulse rounded-2xl border border-slate-200 bg-white p-6">
        <div className="h-5 w-48 rounded bg-slate-200" />
        <div className="mt-6 h-40 rounded bg-slate-100" />
      </div>
    </div>
  );
}

function Chart({
  services,
  selectedServiceId,
  onSelectService,
}: {
  services: MetricaServicio[];
  selectedServiceId: string;
  onSelectService: (serviceId: string) => void;
}) {
  const isTrend = Boolean(selectedServiceId);
  const maxValue = Math.max(1, ...services.flatMap((service) => (
    isTrend
      ? service.tendencia.map((point) => point.citas)
      : [service.citasFacturadas]
  )));

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-extrabold text-slate-900">
            {isTrend ? 'Tendencia de solicitudes' : 'Servicios con mayor demanda'}
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            {isTrend
              ? 'Citas facturadas a lo largo del periodo seleccionado.'
              : 'Selecciona una barra para consultar la tendencia del servicio.'}
          </p>
        </div>
        <span className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600">
          <i className="h-3 w-3 rounded-sm bg-[#0D5C75]" aria-hidden="true" />
          Citas facturadas
        </span>
      </div>

      <div className="mt-6 space-y-4">
        {services.map((service) => {
          if (isTrend) {
            return (
              <div key={service.servicioId} className="space-y-3">
                <p className="text-sm font-bold text-slate-800">{service.nombreServicio}</p>
                <div className="space-y-3">
                  {service.tendencia.map((point) => (
                    <div key={point.etiqueta} className="grid grid-cols-[3.5rem_minmax(0,1fr)_2rem] items-center gap-3">
                      <span className="text-xs font-medium text-slate-600">{point.etiqueta}</span>
                      <div
                        role="img"
                        aria-label={`${point.etiqueta}: ${point.citas} citas facturadas`}
                        title={`${point.etiqueta}: ${point.citas} citas · ${formatearIngresos(point.ingresos)}`}
                        className="h-7 overflow-hidden rounded-md bg-slate-100"
                      >
                        <div
                          className="flex h-full min-w-1 items-center rounded-md bg-[#0D5C75] px-2 text-[10px] font-bold text-white"
                          style={{ width: `${point.citas > 0 ? Math.max(8, (point.citas / maxValue) * 100) : 0}%` }}
                        >
                          {point.citas > 0 ? point.citas : ''}
                        </div>
                      </div>
                      <span className="text-right text-xs font-bold text-slate-700">{point.citas}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          }

          return (
            <button
              key={service.servicioId}
              type="button"
              onClick={() => onSelectService(service.servicioId)}
              aria-label={`Ver tendencia de ${service.nombreServicio}`}
              className="group grid w-full gap-2 text-left sm:grid-cols-[minmax(9rem,13rem)_minmax(0,1fr)_3.5rem] sm:items-center sm:gap-4"
            >
              <span className="truncate text-sm font-bold text-slate-800 group-hover:text-[#0D5C75]">
                {service.nombreServicio}
              </span>
              <span className="h-7 overflow-hidden rounded-md bg-slate-100">
                <span
                  className="flex h-full min-w-1 items-center rounded-md bg-[#0D5C75] px-2 text-[10px] font-bold text-white transition-colors group-hover:bg-[#0D9488]"
                  style={{ width: `${Math.max(3, (service.citasFacturadas / maxValue) * 100)}%` }}
                >
                  {service.citasFacturadas > 0 ? service.citasFacturadas : ''}
                </span>
              </span>
              <span className="text-right text-sm font-bold text-slate-700">{service.citasFacturadas}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}

export default function UsoServiciosPage() {
  const [periodo, setPeriodo] = useState<PeriodoFiltro>('MENSUAL');
  const [servicioId, setServicioId] = useState('');
  const [report, setReport] = useState<ReporteUsoServiciosResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    let active = true;
    setIsLoading(true);
    setError(null);
    void obtenerReporteUsoServicios(periodo, servicioId || undefined)
      .then((result) => {
        if (active) setReport(result);
      })
      .catch((loadError: unknown) => {
        if (active) {
          setReport(null);
          setError(loadError instanceof Error
            ? loadError.message
            : 'No fue posible consultar el reporte de uso de servicios.');
        }
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => { active = false; };
  }, [periodo, servicioId, retryKey]);

  const isEmpty = report !== null && (report.totalCitas === 0 || report.servicios.length === 0);

  return (
    <main className="min-h-screen bg-[#F8FAFC] px-4 py-6 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <BrandHeader
          className="mb-8"
          subtitle="Analítica de servicios"
          rightContent={(
            <div className="flex flex-wrap items-center gap-2">
              <Link to="/admin/analitica/ocupacion" className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50">
                <ArrowLeft size={17} /> Ocupación
              </Link>
              <Link to="/admin/usuarios" className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50">
                Usuarios
              </Link>
              <ClientSessionActions showPortalLink={false} />
            </div>
          )}
        />

        <header className="mb-6">
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-[#0D5C75]">Panel administrativo</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">Uso de servicios clínicos</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
            Consulta la demanda y los ingresos facturados por servicio durante el periodo seleccionado.
          </p>
        </header>

        <section className="mb-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5" aria-label="Filtros del reporte">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-1.5 text-sm font-bold text-slate-700">
              <span className="inline-flex items-center gap-2"><CalendarDays size={16} aria-hidden="true" /> Periodo</span>
              <select
                value={periodo}
                onChange={(event) => setPeriodo(event.target.value as PeriodoFiltro)}
                className="min-h-11 rounded-xl border border-slate-300 bg-white px-3 text-sm font-medium outline-none focus:border-[#0D9488] focus:ring-2 focus:ring-[#0D9488]/20"
              >
                <option value="SEMANAL">Semanal</option>
                <option value="MENSUAL">Mensual (mes en curso)</option>
                <option value="ANUAL">Anual</option>
              </select>
            </label>
            <label className="grid gap-1.5 text-sm font-bold text-slate-700">
              <span>Servicio</span>
              <select
                value={servicioId}
                onChange={(event) => setServicioId(event.target.value)}
                className="min-h-11 rounded-xl border border-slate-300 bg-white px-3 text-sm font-medium outline-none focus:border-[#0D9488] focus:ring-2 focus:ring-[#0D9488]/20"
              >
                <option value="">Todos los servicios</option>
                {MOCK_SERVICIOS_USO.map((service) => (
                  <option key={service.servicioId} value={service.servicioId}>{service.nombreServicio}</option>
                ))}
              </select>
            </label>
          </div>
        </section>

        {isLoading ? (
          <UsoServiciosSkeleton />
        ) : error ? (
          <section className="rounded-2xl border border-rose-200 bg-rose-50 p-6" role="alert">
            <h2 className="font-bold text-rose-900">No se pudo cargar el reporte</h2>
            <p className="mt-2 text-sm text-rose-800">{error}</p>
            <button
              type="button"
              onClick={() => setRetryKey((current) => current + 1)}
              className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#0D5C75] px-4 py-2 text-sm font-bold text-white hover:bg-[#09485d]"
            >
              <RefreshCw size={16} aria-hidden="true" /> Reintentar
            </button>
          </section>
        ) : report ? (
          <div className="space-y-5">
            <section className="grid gap-4 sm:grid-cols-2" aria-label="Resumen del periodo">
              <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-slate-600">Atenciones facturadas</p>
                    <p className="mt-2 text-3xl font-black text-slate-950">{report.totalCitas.toLocaleString('es-CO')}</p>
                  </div>
                  <span className="rounded-xl bg-sky-50 p-3 text-[#0D5C75]"><ClipboardList size={23} aria-hidden="true" /></span>
                </div>
              </article>
              <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-slate-600">Ingresos acumulados</p>
                    <p className="mt-2 text-3xl font-black text-slate-950">{formatearIngresos(report.totalIngresos)}</p>
                  </div>
                  <span className="rounded-xl bg-emerald-50 p-3 text-emerald-700"><DollarSign size={23} aria-hidden="true" /></span>
                </div>
              </article>
            </section>

            {isEmpty ? (
              <section className="rounded-2xl border border-slate-200 bg-white px-6 py-12 text-center shadow-sm">
                <BarChart3 className="mx-auto h-10 w-10 text-slate-400" aria-hidden="true" />
                <h2 className="mt-4 text-lg font-bold text-slate-900">Aún no hay servicios facturados</h2>
                <p className="mt-2 text-sm text-slate-600">No encontramos registros para los filtros seleccionados.</p>
              </section>
            ) : (
              <>
                <Chart
                  services={report.servicios}
                  selectedServiceId={servicioId}
                  onSelectService={setServicioId}
                />

                <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                  <div className="border-b border-slate-200 px-5 py-4">
                    <h2 className="text-lg font-extrabold text-slate-900">Detalle consolidado</h2>
                    <p className="mt-1 text-sm text-slate-600">Servicios ordenados por número de citas facturadas.</p>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[780px] text-left text-sm">
                      <thead className="bg-slate-100 text-xs uppercase tracking-wide text-slate-600">
                        <tr>
                          <th scope="col" className="px-5 py-4">Nombre del servicio</th>
                          <th scope="col" className="px-5 py-4">Categoría</th>
                          <th scope="col" className="px-5 py-4 text-right">Citas facturadas</th>
                          <th scope="col" className="px-5 py-4 text-right">Demanda</th>
                          <th scope="col" className="px-5 py-4 text-right">Valor acumulado</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {report.servicios.map((service) => (
                          <tr key={service.servicioId} className="hover:bg-slate-50">
                            <th scope="row" className="px-5 py-4 font-bold text-slate-900">{service.nombreServicio}</th>
                            <td className="px-5 py-4 text-slate-600">{service.categoria}</td>
                            <td className="px-5 py-4 text-right font-semibold text-slate-800">{service.citasFacturadas.toLocaleString('es-CO')}</td>
                            <td className="px-5 py-4 text-right text-slate-700">{service.porcentajeDemanda.toLocaleString('es-CO', { maximumFractionDigits: 1 })}%</td>
                            <td className="px-5 py-4 text-right font-bold text-slate-900">{formatearIngresos(service.ingresosAcumulados)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>
              </>
            )}
            <p className="text-xs text-slate-500">
              Reporte de demostración con datos simulados; se actualizará al conectar el endpoint definitivo.
            </p>
          </div>
        ) : null}
      </div>
    </main>
  );
}
