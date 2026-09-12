/**
 * Formatea un valor numérico como moneda colombiana (COP).
 * Reglas de negocio (HU08 - Escenario 3):
 * - Símbolo "$"
 * - Punto como separador de miles
 * - Sin decimales
 */
export function formatPrecioCOP(valor: number): string {
  const formateado = new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(valor);

  // Intl.NumberFormat con 'es-CO' inserta un espacio (incluso uno no
  // separable, U+00A0) entre el símbolo "$" y el número. El Escenario 3
  // exige exactamente el formato "$XX.XXX", sin espacio, así que se elimina.
  return formateado.replace(/\s/g, '');
}
