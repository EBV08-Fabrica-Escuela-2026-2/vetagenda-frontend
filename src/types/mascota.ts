export type Especie = 'Perro' | 'Gato' | 'Otro'

export type Sexo = 'Macho' | 'Hembra'

export interface Cliente {
  id: string
  nombre: string
  documento: string
}

export interface MascotaFormData {
  clienteId: string
  nombre: string
  especie: Especie | null
  raza: string
  sexo: Sexo | null
  edadAnios: string
  edadMeses: string
  peso: string
  observaciones: string
}

export const RAZAS_POR_ESPECIE: Record<Especie, string[]> = {
  Perro: [
    'Labrador Retriever',
    'Pastor Alemán',
    'Bulldog Francés',
    'Poodle',
    'Chihuahua',
    'Beagle',
    'Criollo / Mestizo',
    'Otra',
  ],
  Gato: [
    'Común Europeo',
    'Persa',
    'Siamés',
    'Maine Coon',
    'Angora',
    'Criollo / Mestizo',
    'Otra',
  ],
  Otro: ['Ave', 'Conejo', 'Roedor', 'Reptil', 'Otra'],
}

export const ESPECIE_ICONOS: Record<Especie, string> = {
  Perro: '🐕',
  Gato: '🐈',
  Otro: '🐾',
}

// Clientes existentes en el sistema (HU01). En una integración real esto
// vendría del servicio/API de clientes; aquí se deja mockeado para HU05.
export const CLIENTES_MOCK: Cliente[] = [
  { id: 'c1', nombre: 'María González', documento: 'CC 43.108.221' },
  { id: 'c2', nombre: 'Carlos Ramírez', documento: 'CC 10.234.556' },
  { id: 'c3', nombre: 'Laura Torres', documento: 'CC 52.987.410' },
  { id: 'c4', nombre: 'Andrés Pérez', documento: 'CC 79.665.302' },
]

export const LIMITES = {
  edadAnios: { min: 0, max: 30 },
  edadMeses: { min: 0, max: 11 },
  peso: { min: 0.1, max: 150 },
}

export const initialFormData: MascotaFormData = {
  clienteId: '',
  nombre: '',
  especie: 'Perro',
  raza: '',
  sexo: null,
  edadAnios: '',
  edadMeses: '',
  peso: '',
  observaciones: '',
}
