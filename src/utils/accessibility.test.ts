import test from 'node:test';
import assert from 'node:assert/strict';
import {
  formatDateAriaLabel,
  formatSlotAriaLabel,
  getContrastRatio,
  getNextTrapFocusIndex,
  meetsWcagAA,
} from './accessibility';

test('WCAG AA contrast holds across corporate VetAgenda palette pairs', () => {
  // Primary petrol blue & deep teal on white and mint surfaces
  assert.equal(meetsWcagAA('#0D5C75', '#FFFFFF'), true);
  assert.equal(meetsWcagAA('#0D5C75', '#F0F7F7'), true);
  assert.equal(meetsWcagAA('#0D5C75', '#E8F4F1'), true);
  assert.equal(meetsWcagAA('#0F766E', '#FFFFFF'), true);
  assert.equal(meetsWcagAA('#0F766E', '#F0F7F7'), true);

  // White text on primary/action buttons (sky-700, emerald-700, rose-600, petrol)
  assert.equal(meetsWcagAA('#FFFFFF', '#0D5C75'), true);
  assert.equal(meetsWcagAA('#FFFFFF', '#0369A1'), true);
  assert.equal(meetsWcagAA('#FFFFFF', '#047857'), true);
  assert.equal(meetsWcagAA('#FFFFFF', '#E11D48'), true);

  // Neutral slate text on white and slate-50 backgrounds
  assert.equal(meetsWcagAA('#475569', '#FFFFFF'), true);
  assert.equal(meetsWcagAA('#475569', '#F8FAFC'), true);
  assert.equal(meetsWcagAA('#0F172A', '#FFFFFF'), true);

  // Status badges: Programada, Completada, Cancelada
  assert.equal(meetsWcagAA('#075985', '#E0F2FE'), true);
  assert.equal(meetsWcagAA('#065F46', '#D1FAE5'), true);
  assert.equal(meetsWcagAA('#9F1239', '#FFE4E6'), true);
  assert.equal(meetsWcagAA('#334155', '#F1F5F9'), true);

  // Contrast ratio calculation check for white on black
  assert.equal(Math.round(getContrastRatio('#FFFFFF', '#000000')), 21);
});

test('formatSlotAriaLabel announces time, veterinarian, availability, and selection state', () => {
  assert.equal(
    formatSlotAriaLabel({
      time: '9:00 a. m.',
      veterinarioNombre: 'Dr. Carlos Pérez',
      isSelected: false,
    }),
    'Horario 9:00 a. m. con Dr. Carlos Pérez, disponible',
  );

  assert.equal(
    formatSlotAriaLabel({
      time: '10:30 a. m.',
      veterinarioNombre: 'Dra. María López',
      isSelected: true,
    }),
    'Horario 10:30 a. m. con Dra. María López, disponible, seleccionado',
  );
});

test('formatDateAriaLabel includes availability and selection state cleanly', () => {
  assert.equal(
    formatDateAriaLabel({
      day: 15,
      monthName: 'noviembre',
      hasAvailability: true,
      isSelected: true,
    }),
    '15 de noviembre, con horarios disponibles, fecha seleccionada',
  );

  assert.equal(
    formatDateAriaLabel({
      day: 10,
      monthName: 'noviembre',
      isSelected: false,
      isDisabled: true,
    }),
    '10 de noviembre, fecha no disponible',
  );
});

test('getNextTrapFocusIndex wraps cleanly at first and last focusable items', () => {
  assert.equal(getNextTrapFocusIndex(0, 4, true), 3);
  assert.equal(getNextTrapFocusIndex(3, 4, false), 0);
  assert.equal(getNextTrapFocusIndex(1, 4, false), -1);
  assert.equal(getNextTrapFocusIndex(-1, 4, false), 0);
  assert.equal(getNextTrapFocusIndex(-1, 4, true), 3);
  assert.equal(getNextTrapFocusIndex(0, 0, false), -1);
});
