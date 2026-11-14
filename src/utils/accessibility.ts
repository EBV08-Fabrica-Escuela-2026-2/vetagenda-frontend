export const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ');

function normalizeHex(hex: string): string {
  const clean = hex.trim().replace('#', '');
  if (clean.length === 3) {
    return clean
      .split('')
      .map((char) => char + char)
      .join('');
  }
  return clean;
}

export function hexToRgb(hex: string): [number, number, number] {
  const full = normalizeHex(hex);
  if (!/^[0-9a-fA-F]{6}$/.test(full)) {
    throw new Error(`Color hexadecimal inválido: ${hex}`);
  }
  return [
    parseInt(full.slice(0, 2), 16),
    parseInt(full.slice(2, 4), 16),
    parseInt(full.slice(4, 6), 16),
  ];
}

function linearizeChannel(channel255: number): number {
  const srgb = channel255 / 255;
  return srgb <= 0.03928 ? srgb / 12.92 : ((srgb + 0.055) / 1.055) ** 2.4;
}

export function getLuminance(hex: string): number {
  const [r, g, b] = hexToRgb(hex);
  return 0.2126 * linearizeChannel(r) + 0.7152 * linearizeChannel(g) + 0.0722 * linearizeChannel(b);
}

export function getContrastRatio(foregroundHex: string, backgroundHex: string): number {
  const l1 = getLuminance(foregroundHex);
  const l2 = getLuminance(backgroundHex);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

export function meetsWcagAA(
  foregroundHex: string,
  backgroundHex: string,
  options: { largeText?: boolean } = {},
): boolean {
  const threshold = options.largeText ? 3.0 : 4.5;
  return getContrastRatio(foregroundHex, backgroundHex) >= threshold;
}

export function formatSlotAriaLabel(params: {
  time: string;
  veterinarioNombre: string;
  isSelected: boolean;
  isAvailable?: boolean;
}): string {
  const { time, veterinarioNombre, isSelected, isAvailable = true } = params;
  const availabilityText = isAvailable ? 'disponible' : 'no disponible';
  const selectedText = isSelected ? ', seleccionado' : '';
  return `Horario ${time} con ${veterinarioNombre}, ${availabilityText}${selectedText}`;
}

export function formatDateAriaLabel(params: {
  day: number;
  monthName: string;
  hasAvailability?: boolean;
  isSelected: boolean;
  isDisabled?: boolean;
}): string {
  const { day, monthName, hasAvailability, isSelected, isDisabled } = params;
  const base = `${day} de ${monthName}`;
  if (isDisabled) return `${base}, fecha no disponible`;
  const availability =
    hasAvailability === undefined
      ? ''
      : hasAvailability
        ? ', con horarios disponibles'
        : ', sin horarios disponibles';
  const selected = isSelected ? ', fecha seleccionada' : '';
  return `${base}${availability}${selected}`;
}

export function getNextTrapFocusIndex(
  currentIndex: number,
  totalItems: number,
  shiftKey: boolean,
): number {
  if (totalItems <= 0) return -1;
  if (currentIndex < 0 || currentIndex >= totalItems) {
    return shiftKey ? totalItems - 1 : 0;
  }
  if (shiftKey && currentIndex === 0) {
    return totalItems - 1;
  }
  if (!shiftKey && currentIndex === totalItems - 1) {
    return 0;
  }
  return -1;
}
