import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, LogOut, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { OccupancyChart } from '../components/analytics/OccupancyChart';
import { OccupancyEmptyState } from '../components/analytics/OccupancyEmptyState';
import { OccupancyFilters } from '../components/analytics/OccupancyFilters';
import { OccupancyHighlights } from '../components/analytics/OccupancyHighlights';
import { OccupancyKpiGrid } from '../components/analytics/OccupancyKpiGrid';
import { OccupancySkeleton } from '../components/analytics/OccupancySkeleton';
import { OccupancyTable } from '../components/analytics/OccupancyTable';
import { BrandHeader } from '../components/BrandHeader';
import { getOccupancyReport, OCCUPANCY_VETERINARIANS } from '../services/occupancy';
import { clearClientSession } from '../services/api';
import type { OccupancyFilter, OccupancyReportResponse } from '../types/occupancy';

function toLocalDateInput(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function currentWeekRange(): Pick<OccupancyFilter, 'startDate' | 'endDate'> {
  const today = new Date();
  const start = new Date(today);
  const day = start.getDay();
  start.setDate(start.getDate() - (day === 0 ? 6 : day - 1));
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  return { startDate: toLocalDateInput(start), endDate: toLocalDateInput(end) };
}

function initialFilters(): OccupancyFilter {
  return { ...currentWeekRange(), periodicity: 'semana', sedeId: '', vetId: '' };
}

export default function OccupancyPage() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<OccupancyFilter>(initialFilters);
  const [submittedFilters, setSubmittedFilters] = useState<OccupancyFilter>(initialFilters);
  const [report, setReport] = useState<OccupancyReportResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const filterOptions = useMemo(
    () => OCCUPANCY_VETERINARIANS.map(({ id, nombre }) => ({ id, nombre })),
    [],
  );

  const loadReport = useCallback(async (query: OccupancyFilter) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await getOccupancyReport(query);
      setReport(result);
      setSubmittedFilters(query);
    } catch (loadError: unknown) {
      setReport(null);
      setError(loadError instanceof Error ? loadError.message : 'No fue posible consultar el reporte de ocupación.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadReport(initialFilters());
  }, [loadReport]);

  function resetToCurrentWeek() {
    const resetFilters: OccupancyFilter = {
      ...currentWeekRange(),
      periodicity: 'semana',
      sedeId: '',
      vetId: '',
    };
    setFilters(resetFilters);
    void loadReport(resetFilters);
  }

  const dateRange = report
    ? `${new Intl.DateTimeFormat('es-CO', { dateStyle: 'medium' }).format(new Date(`${report.rangoConsultado.inicio}T12:00:00`))} – ${new Intl.DateTimeFormat('es-CO', { dateStyle: 'medium' }).format(new Date(`${report.rangoConsultado.fin}T12:00:00`))}`
    : '';

  return (
    <main className="min-h-screen bg-[#F8FAFC] px-4 py-6 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <BrandHeader
          className="mb-8"
          subtitle="Analítica asistencial"
          rightContent={(
            <div className="flex flex-wrap gap-2">
              <Link
                className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D5C75] focus-visible:ring-offset-2"
                to="/"
              >
                <ArrowLeft aria-hidden="true" size={17} /> Inicio
              </Link>
              <button
                className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D5C75] focus-visible:ring-offset-2"
                onClick={() => {
                  clearClientSession();
                  navigate('/login', { replace: true });
                }}
                type="button"
              >
                <LogOut aria-hidden="true" size={17} /> Cerrar sesión
              </button>
            </div>
          )}
        />

        <header className="mb-6">
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-[#0D5C75]">Panel administrativo</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">Ocupación asistencial</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
            Analiza la capacidad instalada y la distribución de turnos para optimizar la agenda de tus consultorios.
          </p>
          <p className="mt-2 text-xs font-medium text-slate-500">
            Reporte de demostración calculado a partir de las citas locales y una capacidad estimada de 16 slots por día hábil.
          </p>
        </header>

        {isLoading ? (
          <OccupancySkeleton />
        ) : (
          <div className="space-y-5">
            <OccupancyFilters
              filters={filters}
              onChange={setFilters}
              onSubmit={() => { void loadReport(filters); }}
              veterinarians={filterOptions}
            />

            {error ? (
              <section className="rounded-2xl border border-rose-200 bg-rose-50 p-6" role="alert">
                <h2 className="font-bold text-rose-900">No se pudo cargar el reporte</h2>
                <p className="mt-2 text-sm text-rose-800">{error}</p>
                <button
                  className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#0D5C75] px-4 py-2 text-sm font-bold text-white hover:bg-[#09485d] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D5C75] focus-visible:ring-offset-2"
                  onClick={() => { void loadReport(submittedFilters); }}
                  type="button"
                >
                  <RefreshCw aria-hidden="true" size={16} /> Reintentar
                </button>
              </section>
            ) : report && report.detallesPorVeterinario.length === 0 ? (
              <>
                <OccupancyKpiGrid
                  effectiveAppointments={report.totalCitasEfectivas}
                  enabledSlots={report.totalSlotsHabilitados}
                  freeSlots={report.totalSlotsLibres}
                  occupancy={report.tasaOcupacionGlobal}
                />
                <OccupancyEmptyState onReset={resetToCurrentWeek} />
              </>
            ) : report ? (
              <>
                <p className="text-sm font-medium text-slate-600">
                  Periodo consultado: <span className="font-bold text-slate-800">{dateRange}</span>
                </p>
                <OccupancyKpiGrid
                  effectiveAppointments={report.totalCitasEfectivas}
                  enabledSlots={report.totalSlotsHabilitados}
                  freeSlots={report.totalSlotsLibres}
                  occupancy={report.tasaOcupacionGlobal}
                />
                <OccupancyHighlights
                  highest={report.veterinarioMayorDemanda}
                  lowest={report.veterinarioMenorDemanda}
                />
                <OccupancyChart details={report.detallesPorVeterinario} />
                <OccupancyTable details={report.detallesPorVeterinario} />
              </>
            ) : null}
          </div>
        )}
      </div>
    </main>
  );
}
