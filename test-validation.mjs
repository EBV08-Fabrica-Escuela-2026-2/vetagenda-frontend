import { validateField, validateClientForm, REGEX } from './src/utils/validation.ts';
import assert from 'node:assert';

console.log('🧪 Iniciando verificación de validaciones de HU01...\n');

// 1. Validaciones de Nombre
console.log('Validando campo Nombre...');
assert.strictEqual(validateField('nombre', ''), 'El nombre completo es obligatorio.');
assert.strictEqual(validateField('nombre', 'Al'), 'El nombre debe tener al menos 3 caracteres.');
assert.strictEqual(validateField('nombre', 'Carlos123'), 'El nombre solo debe contener letras y espacios válidos.');
assert.strictEqual(validateField('nombre', 'Carlos Pérez Gómez'), undefined);
console.log('✓ Pruebas de Nombre pasaron con éxito.');

// 2. Validaciones de Cédula
console.log('\nValidando campo Cédula...');
assert.strictEqual(validateField('cedula', ''), 'El número de cédula es obligatorio.');
assert.strictEqual(validateField('cedula', '1234a'), 'La cédula debe contener únicamente números.');
assert.strictEqual(validateField('cedula', '12345'), 'La cédula debe tener entre 6 y 10 dígitos.');
assert.strictEqual(validateField('cedula', '12345678901'), 'La cédula debe tener entre 6 y 10 dígitos.');
assert.strictEqual(validateField('cedula', '1020304050'), undefined);
assert.strictEqual(validateField('cedula', '123456'), undefined);
console.log('✓ Pruebas de Cédula pasaron con éxito.');

// 3. Validaciones de Correo
console.log('\nValidando campo Correo...');
assert.strictEqual(validateField('correo', ''), 'El correo electrónico es obligatorio.');
assert.strictEqual(validateField('correo', 'correo-invalido'), 'Ingresa un correo electrónico válido (ej. usuario@dominio.com).');
assert.strictEqual(validateField('correo', 'cliente@dominio'), 'Ingresa un correo electrónico válido (ej. usuario@dominio.com).');
assert.strictEqual(validateField('correo', 'cliente@vetagenda.com'), undefined);
console.log('✓ Pruebas de Correo pasaron con éxito.');

// 4. Validaciones de Teléfono
console.log('\nValidando campo Teléfono...');
assert.strictEqual(validateField('telefono', ''), 'El teléfono de contacto es obligatorio.');
assert.strictEqual(validateField('telefono', 'abc1234567'), 'El teléfono solo debe contener números.');
assert.strictEqual(validateField('telefono', '12345'), 'Ingresa un número de celular válido de 10 dígitos (ej. 300 123 4567).');
assert.strictEqual(validateField('telefono', '3001234567'), undefined);
console.log('✓ Pruebas de Teléfono pasaron con éxito.');

// 5. Validaciones de Dirección
console.log('\nValidando campo Dirección...');
assert.strictEqual(validateField('direccion', ''), 'La dirección de residencia es obligatoria.');
assert.strictEqual(validateField('direccion', 'Cra'), 'La dirección debe tener al menos 5 caracteres.');
assert.strictEqual(validateField('direccion', 'Calle 50 # 45-20 Apto 301'), undefined);
console.log('✓ Pruebas de Dirección pasaron con éxito.');

// 6. Validación completa de formulario (validateClientForm)
console.log('\nValidando formulario completo...');
const emptyResult = validateClientForm({
  nombre: '',
  cedula: '',
  correo: '',
  telefono: '',
  direccion: ''
});
assert.strictEqual(emptyResult.isValid, false);
assert.strictEqual(Object.keys(emptyResult.errors).length, 5);

const validResult = validateClientForm({
  nombre: 'María Camila Rodríguez',
  cedula: '1098765432',
  correo: 'maria.rodriguez@email.com',
  telefono: '3157894561',
  direccion: 'Carrera 70 # 32-15'
});
assert.strictEqual(validResult.isValid, true);
assert.strictEqual(Object.keys(validResult.errors).length, 0);

console.log('✓ Validación integral de validateClientForm pasó con éxito.');
console.log('\n🎉 ¡TODAS LAS VALIDACIONES FRONTEND FUNCIONAN CORRECTAMENTE!');
