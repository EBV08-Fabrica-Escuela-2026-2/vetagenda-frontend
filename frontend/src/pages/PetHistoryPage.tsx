import { useEffect, useState } from 'react';
import { ArrowLeft, CalendarDays, ClipboardList, Stethoscope } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { ClientPortalHeader } from '../components/ClientPortalHeader';
import { getPetHistory, type PetHistory } from '../services/api';

const dateFormatter = new Intl.DateTimeFormat('es-CO', { dateStyle: 'long', timeStyle: 'short' });

export function PetHistoryPage() {
  const { id } = useParams();
  const petId = Number(id);
  const [history, setHistory] = useState<PetHistory | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!Number.isInteger(petId) || petId <= 0) {
      setError('La mascota seleccionada no es válida.');
      setLoading(false);
      return;
    }
    let current = true;
    getPetHistory(petId)
      .then((result) => { if (current) setHistory(result); })
      .catch((requestError) => { if (current) setError(requestError instanceof Error ? requestError.message : 'No fue posible consultar el historial.'); })
      .finally(() => { if (current) setLoading(false); });
    return () => { current = false; };
  }, [petId]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <ClientPortalHeader />
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <Link to="/cliente" className="inline-flex min-h-11 items-center gap-2 rounded-lg px-3 text-sm font-bold text-[#0D5C75] hover:bg-white"><ArrowLeft size={17} /> Volver al portal</Link>
        <header className="mt-5 border-b border-slate-200 pb-6">
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-[#0D9488]">Historial clínico</p>
          <h1 className="mt-2 text-3xl font-black">{history?.mascotaNombre || 'Historial de la mascota'}</h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">Atenciones finalizadas y cancelaciones registradas en VetAgenda.</p>
        </header>

        {loading && <p className="py-12 text-center text-sm font-semibold text-slate-500">Consultando historial…</p>}
        {!loading && error && <p role="alert" className="mt-6 rounded-xl border border-rose-200 bg-rose-50 p-5 text-sm font-semibold text-rose-800">{error}</p>}
        {!loading && !error && history?.contenido.length === 0 && (
          <section className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center"><ClipboardList className="mx-auto h-9 w-9 text-slate-400" /><h2 className="mt-3 font-bold">Aún no hay atenciones en el historial</h2><p className="mt-1 text-sm text-slate-600">Las citas completadas, no asistidas o canceladas aparecerán aquí.</p></section>
        )}
        {!loading && !error && history && history.contenido.length > 0 && (
          <ol className="mt-6 space-y-4">
            {history.contenido.map((entry) => (
              <li key={entry.idCita} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div><p className="text-lg font-black">{entry.servicioNombre}</p><p className="mt-1 flex items-center gap-2 text-sm text-slate-600"><Stethoscope size={16} /> {entry.veterinarioNombre}{entry.veterinarioEspecialidad ? ` · ${entry.veterinarioEspecialidad}` : ''}</p><p className="mt-2 flex items-center gap-2 text-sm text-slate-600"><CalendarDays size={16} /> {dateFormatter.format(new Date(entry.fechaHoraInicio))}</p></div>
                  <span className="self-start rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">{entry.etiquetaEstado || entry.estado}</span>
                </div>
                {(entry.diagnostico || entry.tratamiento || entry.notasClinicas || entry.motivoCancelacion) && <dl className="mt-5 grid gap-4 border-t border-slate-200 pt-4 sm:grid-cols-2">{entry.diagnostico && <div><dt className="text-xs font-bold uppercase tracking-wide text-slate-500">Diagnóstico</dt><dd className="mt-1 text-sm leading-6">{entry.diagnostico}</dd></div>}{entry.tratamiento && <div><dt className="text-xs font-bold uppercase tracking-wide text-slate-500">Tratamiento</dt><dd className="mt-1 text-sm leading-6">{entry.tratamiento}</dd></div>}{entry.notasClinicas && <div><dt className="text-xs font-bold uppercase tracking-wide text-slate-500">Notas clínicas</dt><dd className="mt-1 text-sm leading-6">{entry.notasClinicas}</dd></div>}{entry.motivoCancelacion && <div><dt className="text-xs font-bold uppercase tracking-wide text-slate-500">Motivo de cancelación</dt><dd className="mt-1 text-sm leading-6">{entry.motivoCancelacion}</dd></div>}</dl>}
              </li>
            ))}
          </ol>
        )}
      </main>
    </div>
  );
}
