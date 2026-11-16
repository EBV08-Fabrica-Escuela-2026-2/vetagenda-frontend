import {
  Activity,
  ArrowRight,
  BarChart3,
  CalendarCheck2,
  RefreshCw,
  ShieldCheck,
  Stethoscope,
  UserCheck,
  Users,
  UserX,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { BrandHeader } from '../components/BrandHeader';
import { ClientSessionActions } from '../components/ClientSessionActions';
import { getOccupancyReport } from '../services/occupancy';
import { getServiceUsageReport } from '../services/reports';
import { getAuthenticatedSession, listAdminUsers, type AdminUser } from '../services/api';
import type { OccupancyReportResponse } from '../types/occupancy';
import type { ServiceUsageReport } from '../types/serviceUsage';

const modules = [
  {
    to: '/admin/usuarios',
    title: 'Usuarios y accesos',
    description: 'Consulta las cuentas registradas, filtra por rol y activa o desactiva el acceso.',
    action: 'Gestionar usuarios',
    icon: Users,
    tone: 'bg-sky-50 text-sky-700',
  },
  {
    to: '/admin/analitica/ocupacion',
    title: 'Ocupación asistencial',
    description: 'Revisa la capacidad, los turnos habilitados y la ocupación de los profesionales.',
    action: 'Ver ocupación',
    icon: Activity,
    tone: 'bg-violet-50 text-violet-700',
  },
  {
    to: '/admin/analitica/servicios',
    title: 'Uso de servicios',
    description: 'Analiza solicitudes, atenciones realizadas, cumplimiento e ingresos por servicio.',
    action: 'Ver servicios',
    icon: BarChart3,
    tone: 'bg-emerald-50 text-emerald-700',
  },
];

function isoDate(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function currentMonth() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

export default function AdminPortalPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [occupancy, setOccupancy] = useState<OccupancyReportResponse | null>(null);
  const [serviceUsage, setServiceUsage] = useState<ServiceUsageReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const session = getAuthenticatedSession();

  const loadSummary = useCallback(async () => {
    setLoading(true);
    setError('');
    const today = new Date();
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const results = await Promise.allSettled([
      listAdminUsers(),
      getOccupancyReport({
        startDate: isoDate(monthStart),
        endDate: isoDate(today),
        periodicity: 'semana',
        sedeId: '',
        vetId: '',
      }),
      getServiceUsageReport(currentMonth()),
    ]);

    if (results[0].status === 'fulfilled') setUsers(results[0].value);
    if (results[1].status === 'fulfilled') setOccupancy(results[1].value);
    if (results[2].status === 'fulfilled') setServiceUsage(results[2].value);
    if (results.some((result) => result.status === 'rejected')) {
      setError('Algunos indicadores no pudieron actualizarse. Los módulos administrativos siguen disponibles.');
    }
    setLoading(false);
  }, []);

  useEffect(() => { void loadSummary(); }, [loadSummary]);

  const userSummary = useMemo(() => ({
    active: users.filter((user) => user.activo).length,
    inactive: users.filter((user) => !user.activo).length,
    veterinarians: users.filter((user) => user.roles.includes('VETERINARIO') || user.rol === 'VETERINARIO').length,
  }), [users]);

  const firstName = session?.nombre?.trim().split(/\s+/)[0] || 'Administrador';
  const kpis = [
    { label: 'Usuarios registrados', value: users.length, detail: `${userSummary.active} activos`, icon: Users, color: 'text-sky-700' },
    { label: 'Cuentas inactivas', value: userSummary.inactive, detail: 'Requieren revisión', icon: UserX, color: 'text-rose-700' },
    { label: 'Profesionales', value: userSummary.veterinarians, detail: 'Cuentas veterinarias', icon: Stethoscope, color: 'text-violet-700' },
    { label: 'Ocupación del mes', value: occupancy ? `${occupancy.tasaOcupacionGlobal}%` : '—', detail: occupancy ? `${occupancy.totalCitasEfectivas} citas efectivas` : 'Sin datos disponibles', icon: CalendarCheck2, color: 'text-emerald-700' },
  ];

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-5 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <BrandHeader
          homePath="/admin"
          subtitle="Portal administrativo"
          rightContent={<ClientSessionActions showPortalLink={false} />}
          className="!flex-col !items-stretch gap-4 rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm sm:!flex-row sm:!items-center sm:px-6"
        />

        <section className="mt-6 overflow-hidden rounded-3xl bg-gradient-to-br from-[#0D5C75] to-[#0D9488] p-6 text-white shadow-lg sm:p-8" aria-labelledby="admin-welcome-title">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-100">Resumen operativo</p>
              <h1 id="admin-welcome-title" className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">Hola, {firstName}</h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-cyan-50 sm:text-base">Controla los accesos y consulta el desempeño de VetAgenda desde un solo lugar.</p>
            </div>
            <button type="button" onClick={() => void loadSummary()} disabled={loading} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-white px-5 text-sm font-black text-[#0D5C75] shadow-sm transition hover:bg-cyan-50 disabled:opacity-60">
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} aria-hidden="true" />
              {loading ? 'Actualizando…' : 'Actualizar resumen'}
            </button>
          </div>
        </section>

        {error && <p role="alert" className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm font-semibold text-amber-900">{error}</p>}

        <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Indicadores administrativos">
          {kpis.map(({ label, value, detail, icon: Icon, color }) => (
            <article key={label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-3"><p className="text-sm font-semibold text-slate-600">{label}</p><span className={`rounded-xl bg-slate-50 p-2 ${color}`}><Icon className="h-5 w-5" aria-hidden="true" /></span></div>
              <p className="mt-4 text-3xl font-black tracking-tight text-slate-950">{loading ? '…' : value}</p>
              <p className="mt-1 text-xs font-medium text-slate-500">{loading ? 'Consultando información' : detail}</p>
            </article>
          ))}
        </section>

        <section className="mt-8" aria-labelledby="admin-functions-title">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-[#0D9488]">Funciones disponibles</p>
            <h2 id="admin-functions-title" className="mt-2 text-2xl font-black text-slate-950">¿Qué quieres gestionar?</h2>
          </div>
          <div className="mt-5 grid gap-5 lg:grid-cols-3">
            {modules.map(({ to, title, description, action, icon: Icon, tone }) => (
              <Link key={to} to={to} className="group flex min-h-60 flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-[#0D9488]/50 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D9488]">
                <span className={`flex h-12 w-12 items-center justify-center rounded-xl ${tone}`}><Icon className="h-6 w-6" aria-hidden="true" /></span>
                <h3 className="mt-5 text-xl font-black text-slate-950">{title}</h3>
                <p className="mt-2 flex-1 text-sm leading-6 text-slate-600">{description}</p>
                <span className="mt-5 inline-flex items-center gap-2 text-sm font-black text-[#0D5C75]">{action}<ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" aria-hidden="true" /></span>
              </Link>
            ))}
          </div>
        </section>

        <section className="mt-8 grid gap-5 lg:grid-cols-2" aria-label="Hallazgos del periodo">
          <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3"><span className="rounded-xl bg-emerald-50 p-2 text-emerald-700"><UserCheck className="h-5 w-5" /></span><h2 className="text-lg font-black">Estado de las cuentas</h2></div>
            <p className="mt-4 text-sm leading-6 text-slate-600">{loading ? 'Consultando usuarios…' : users.length ? `${userSummary.active} de ${users.length} cuentas tienen acceso activo. ${userSummary.inactive ? `${userSummary.inactive} requieren revisión.` : 'No hay cuentas pendientes por reactivar.'}` : 'No hay cuentas disponibles para resumir.'}</p>
            <Link to="/admin/usuarios" className="mt-4 inline-flex min-h-10 items-center gap-2 text-sm font-black text-[#0D5C75]">Revisar cuentas <ArrowRight className="h-4 w-4" /></Link>
          </article>
          <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3"><span className="rounded-xl bg-sky-50 p-2 text-sky-700"><ShieldCheck className="h-5 w-5" /></span><h2 className="text-lg font-black">Actividad clínica del mes</h2></div>
            <p className="mt-4 text-sm leading-6 text-slate-600">{loading ? 'Calculando actividad…' : serviceUsage ? `Se solicitaron ${serviceUsage.citasSolicitadas} citas y se completaron ${serviceUsage.atencionesRealizadas}, con una tasa de atención del ${serviceUsage.tasaCumplimiento}%.` : 'No fue posible obtener el resumen de servicios de este mes.'}</p>
            <Link to="/admin/analitica/servicios" className="mt-4 inline-flex min-h-10 items-center gap-2 text-sm font-black text-[#0D5C75]">Abrir analítica <ArrowRight className="h-4 w-4" /></Link>
          </article>
        </section>
      </div>
    </main>
  );
}
