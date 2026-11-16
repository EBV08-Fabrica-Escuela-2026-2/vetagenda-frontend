import { API_BASE_URL, getAuthenticatedSession } from './api';
import type { ServiceUsageReport } from '../types/serviceUsage';

function adminHeaders(): Record<string, string> {
  const session = getAuthenticatedSession();
  if (!session || session.rol !== 'ADMIN') {
    throw new Error('Debes iniciar sesión como administrador para consultar los reportes.');
  }
  return { Accept: 'application/json', Authorization: `Bearer ${session.token}` };
}

export async function getServiceUsageReport(month: string, service = ''): Promise<ServiceUsageReport> {
  const query = new URLSearchParams();
  if (month) query.set('mes', month);
  if (service) query.set('servicio', service);
  const response = await fetch(`${API_BASE_URL}/admin/reportes/uso-servicios?${query}`, {
    headers: adminHeaders(),
  });
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(data?.mensaje || data?.detail || 'No fue posible consultar el uso de servicios.');
  }
  return data as ServiceUsageReport;
}
