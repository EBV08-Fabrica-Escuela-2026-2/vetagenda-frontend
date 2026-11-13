import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react';
import { Activity, ArrowLeft, CalendarDays, DollarSign, RefreshCw, Stethoscope } from 'lucide-react';
import { Link } from 'react-router-dom';
import { BrandHeader } from '../components/BrandHeader';
import { ClientSessionActions } from '../components/ClientSessionActions';
import { getServiceUsageReport } from '../services/reports';
import type { ServiceUsageReport } from '../types/serviceUsage';

const currentMonth = () => {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
};

const money = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0,
});

export default function ServiceUsagePage() {
  const [month, setMonth] = useState(currentMonth);
  const [service, setService] = useState('');
  const [report, setReport] = useState<ServiceUsageReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async (selectedMonth: string, selectedService: string) => {
    setLoading(true);
    setError('');
    try {
      setReport(await getServiceUsageReport(selectedMonth, selectedService));
    } catch (requestError) {
      setReport(null);
      setError(requestError instanceof Error ? requestError.message : 'No fue posible consultar el reporte.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(month, ''); }, [load]);

  const maxTrend = useMemo(
    () => Math.max(1, ...(report?.tendencia.map((item) => item.solicitudes) || [1])),
    [report],
  );

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void load(month, service);
  }

  const cards = report ? [
    { label: 'Citas solicitadas', value: report.citasSolicitadas.toLocaleString('es-CO'), icon: CalendarDays, color: 'text-sky-700' },
    { label: 'Atenciones realizadas', value: report.atencionesRealizadas.toLocaleString('es-CO'), icon: Stethoscope, color: 'text-emerald-700' },
    { label: 'Tasa de atención', value: `${report.tasaCumplimiento}%`, icon: Activity, color: 'text-violet-700' },
    { label: 'Ingresos generados', value: money.format(report.ingresosGenerados), icon: DollarSign, color: 'text-amber-700' },
  ] : [];

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <BrandHeader
          className="mb-8"
          subtitle="Analítica de servicios"
          rightContent={(
            <div className="flex flex-wrap items-center gap-2">
              <Link to="/admin/analitica/ocupacion" className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50">
                <ArrowLeft size={17} /> Ocupación
              </Link>
              <Link to="/admin/usuarios" className="inline-flex min-h-11 items-center rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50">
                Usuarios
              </Link>
              <ClientSessionActions showPortalLink={false} />
            </div>
          )}
        />

        <header className="mb-6">
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-[#0D5C75]">Panel administrativo</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">Uso de servicios clínicos</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">Analiza la demanda, las atenciones terminadas y los ingresos facturados por servicio.</p>
        </header>

        <form onSubmit={submit} className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:grid-cols-[220px_minmax(240px,1fr)_auto] sm:p-5">
          <label className="text-sm font-semibold text-slate-700">Mes
            <input type="month" required value={month} onChange={(event) => setMonth(event.target.value)} className="mt-1 min-h-11 w-full rounded-xl border border-slate-300 px-3 text-sm" />
          </label>
          <label className="text-sm font-semibold text-slate-700">Servicio
            <select value={service} onChange={(event) => setService(event.target.value)} className="mt-1 min-h-11 w-full rounded-xl border border-slate-300 px-3 text-sm">
              <option value="">Todos los servicios</option>
              {(report?.serviciosDisponibles || []).map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </label>
          <button type="submit" className="mt-auto inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#0D5C75] px-5 text-sm font-bold text-white hover:bg-[#09485d]">
            <RefreshCw size={16} /> Consultar
          </button>
        </form>

        {error && <p role="alert" className="mt-5 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-800">{error}</p>}
        {loading && <p className="mt-5 rounded-2xl border border-slate-200 bg-white p-10 text-center text-sm font-semibold text-slate-500">Generando reporte…</p>}

        {!loading && report && (
          <div className="mt-5 space-y-5">
            <p className="text-sm font-semibold text-slate-600">Periodo consultado: <span className="font-black text-slate-900">{report.periodoTexto}</span>{report.servicioFiltro && <> · {report.servicioFiltro}</>}</p>
            <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Indicadores de uso de servicios">
              {cards.map(({ label, value, icon: Icon, color }) => (
                <article key={label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex items-start justify-between gap-3"><p className="text-sm font-semibold text-slate-600">{label}</p><span className={`rounded-xl bg-slate-50 p-2 ${color}`}><Icon size={20} /></span></div>
                  <p className="mt-4 text-3xl font-black tracking-tight text-slate-900">{value}</p>
                </article>
              ))}
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-lg font-extrabold">Tendencia de solicitudes</h2>
              <p className="mt-1 text-sm text-slate-600">Distribución semanal dentro del mes.</p>
              <div className="mt-6 grid min-h-52 grid-cols-5 items-end gap-3" role="img" aria-label="Solicitudes por semana">
                {report.tendencia.map((item) => (
                  <div key={item.semana} className="flex h-full flex-col items-center justify-end gap-2">
                    <span className="text-sm font-black text-[#0D5C75]">{item.solicitudes}</span>
                    <div className="w-full max-w-20 rounded-t-lg bg-[#0D9488]" style={{ height: `${Math.max(4, (item.solicitudes / maxTrend) * 150)}px` }} title={`${item.etiqueta}: ${item.solicitudes}`} />
                    <span className="text-center text-xs font-semibold text-slate-600">{item.etiqueta}</span>
                  </div>
                ))}
              </div>
            </section>

            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="px-5 py-4"><h2 className="text-lg font-extrabold">Servicios por volumen</h2><p className="mt-1 text-sm text-slate-600">Solicitudes, atenciones e ingresos efectivamente facturados.</p></div>
              {report.servicios.length === 0 ? (
                <p className="border-t border-slate-200 p-8 text-center text-sm font-semibold text-slate-500">No hay citas registradas para este periodo y filtro.</p>
              ) : (
                <div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left text-sm">
                  <thead className="bg-slate-100 text-xs uppercase tracking-wide text-slate-600"><tr><th className="px-5 py-3">#</th><th className="px-5 py-3">Servicio</th><th className="px-5 py-3 text-right">Solicitudes</th><th className="px-5 py-3 text-right">Atenciones</th><th className="px-5 py-3 text-right">Tasa</th><th className="px-5 py-3 text-right">Facturado</th></tr></thead>
                  <tbody className="divide-y divide-slate-100">{report.servicios.map((item) => <tr key={item.servicio} className="hover:bg-slate-50"><td className="px-5 py-4 font-black text-slate-500">{item.posicion}</td><th scope="row" className="px-5 py-4 font-bold">{item.servicio}</th><td className="px-5 py-4 text-right">{item.solicitudes}</td><td className="px-5 py-4 text-right">{item.atencionesRealizadas}</td><td className="px-5 py-4 text-right font-bold">{item.tasaAtencion}%</td><td className="px-5 py-4 text-right font-bold text-emerald-800">{money.format(item.valorFacturado)}</td></tr>)}</tbody>
                </table></div>
              )}
            </section>
          </div>
        )}
      </div>
    </main>
  );
}
