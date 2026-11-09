import { useCallback, useEffect, useState } from 'react';
import { ArrowLeft, RefreshCw, Search, ShieldCheck, UserCheck, UserX } from 'lucide-react';
import { Link } from 'react-router-dom';
import { BrandHeader } from '../components/BrandHeader';
import { ClientSessionActions } from '../components/ClientSessionActions';
import { listAdminUsers, updateAdminUserStatus, type AdminUser } from '../services/api';

type PendingChange = { user: AdminUser; activo: boolean } | null;

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pending, setPending] = useState<PendingChange>(null);
  const [saving, setSaving] = useState(false);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setUsers(await listAdminUsers({ buscar: search.trim(), rol: role, activo: status }));
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'No fue posible consultar los usuarios.');
    } finally {
      setLoading(false);
    }
  }, [role, search, status]);

  useEffect(() => { void loadUsers(); }, [loadUsers]);

  async function confirmChange() {
    if (!pending) return;
    setSaving(true);
    setError('');
    try {
      const updated = await updateAdminUserStatus(pending.user.id, pending.activo);
      setUsers((current) => current.map((user) => user.id === updated.id ? updated : user));
      setPending(null);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'No fue posible actualizar el usuario.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <BrandHeader
          className="mb-8"
          subtitle="Administración de usuarios"
          rightContent={(
            <div className="flex flex-wrap items-center gap-2">
              <Link to="/admin/analitica/ocupacion" className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50">
                <ArrowLeft size={17} /> Analítica
              </Link>
              <ClientSessionActions showPortalLink={false} />
            </div>
          )}
        />

        <header className="mb-6">
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-[#0D5C75]">Panel administrativo</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">Usuarios y accesos</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">Consulta las cuentas registradas y controla quién puede acceder a VetAgenda.</p>
        </header>

        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5" aria-label="Filtros de usuarios">
          <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_220px_180px_auto]">
            <label className="relative">
              <span className="sr-only">Buscar por nombre o correo</span>
              <Search className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
              <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar por nombre o correo" className="min-h-11 w-full rounded-xl border border-slate-300 pl-10 pr-3 text-sm outline-none focus:border-[#0D9488] focus:ring-2 focus:ring-[#0D9488]/20" />
            </label>
            <select value={role} onChange={(event) => setRole(event.target.value)} aria-label="Filtrar por rol" className="min-h-11 rounded-xl border border-slate-300 px-3 text-sm">
              <option value="">Todos los roles</option>
              <option value="CLIENTE">Cliente</option>
              <option value="VETERINARIO">Veterinario</option>
              <option value="ADMINISTRADOR">Administrador</option>
            </select>
            <select value={status} onChange={(event) => setStatus(event.target.value)} aria-label="Filtrar por estado" className="min-h-11 rounded-xl border border-slate-300 px-3 text-sm">
              <option value="">Todos los estados</option>
              <option value="true">Activos</option>
              <option value="false">Inactivos</option>
            </select>
            <button type="button" onClick={() => void loadUsers()} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#0D5C75] px-4 text-sm font-bold text-white hover:bg-[#09485d]">
              <RefreshCw size={16} /> Actualizar
            </button>
          </div>
        </section>

        {error && <p role="alert" className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-800">{error}</p>}

        <section className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          {loading ? (
            <p className="p-8 text-center text-sm font-medium text-slate-500">Consultando usuarios…</p>
          ) : users.length === 0 ? (
            <p className="p-8 text-center text-sm font-medium text-slate-500">No se encontraron usuarios con estos filtros.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead className="bg-slate-100 text-xs uppercase tracking-wide text-slate-600">
                  <tr><th className="px-5 py-4">Usuario</th><th className="px-5 py-4">Roles</th><th className="px-5 py-4">Estado</th><th className="px-5 py-4 text-right">Acción</th></tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-slate-50">
                      <td className="px-5 py-4"><p className="font-bold text-slate-900">{user.nombre}</p><p className="mt-1 text-slate-500">{user.correo}</p></td>
                      <td className="px-5 py-4"><div className="flex flex-wrap gap-1.5">{user.roles.map((item) => <span key={item} className="rounded-full bg-sky-50 px-2.5 py-1 text-xs font-bold text-sky-800">{item}</span>)}</div></td>
                      <td className="px-5 py-4"><span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-bold ${user.activo ? 'bg-emerald-50 text-emerald-800' : 'bg-slate-100 text-slate-600'}`}><span className={`h-2 w-2 rounded-full ${user.activo ? 'bg-emerald-500' : 'bg-slate-400'}`} />{user.activo ? 'Activo' : 'Inactivo'}</span></td>
                      <td className="px-5 py-4 text-right"><button type="button" onClick={() => setPending({ user, activo: !user.activo })} className={`inline-flex min-h-10 items-center gap-2 rounded-lg border px-3 py-2 text-xs font-bold ${user.activo ? 'border-rose-200 text-rose-700 hover:bg-rose-50' : 'border-emerald-200 text-emerald-700 hover:bg-emerald-50'}`}>{user.activo ? <UserX size={16} /> : <UserCheck size={16} />}{user.activo ? 'Desactivar' : 'Activar'}</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      {pending && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4" role="presentation">
          <section role="dialog" aria-modal="true" aria-labelledby="confirm-user-title" className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <ShieldCheck className="h-9 w-9 text-[#0D5C75]" />
            <h2 id="confirm-user-title" className="mt-4 text-xl font-black">{pending.activo ? '¿Activar esta cuenta?' : '¿Desactivar esta cuenta?'}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">{pending.user.nombre} · {pending.user.correo}{!pending.activo && ' perderá acceso inmediatamente y sus sesiones abiertas serán invalidadas.'}</p>
            <div className="mt-6 flex justify-end gap-3">
              <button type="button" disabled={saving} onClick={() => setPending(null)} className="min-h-11 rounded-xl border border-slate-300 px-4 text-sm font-bold text-slate-700">Cancelar</button>
              <button type="button" disabled={saving} onClick={() => void confirmChange()} className="min-h-11 rounded-xl bg-[#0D5C75] px-4 text-sm font-bold text-white disabled:opacity-60">{saving ? 'Guardando…' : 'Confirmar cambio'}</button>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
