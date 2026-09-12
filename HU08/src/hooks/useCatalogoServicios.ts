import { useCallback, useEffect, useState } from 'react';
import { Veterinario } from '../types/veterinario';
import { ApiError, fetchCatalogoVeterinarios } from '../api/catalogoService';

interface UseCatalogoServiciosResult {
  veterinarios: Veterinario[];
  isLoading: boolean;
  error: boolean;
  sesionInvalida: boolean;
  recargar: () => void;
}

export function useCatalogoServicios(): UseCatalogoServiciosResult {
  const [veterinarios, setVeterinarios] = useState<Veterinario[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);
  const [sesionInvalida, setSesionInvalida] = useState<boolean>(false);

  const cargar = useCallback(async () => {
    setIsLoading(true);
    setError(false);
    setSesionInvalida(false);

    try {
      const data = await fetchCatalogoVeterinarios();
      setVeterinarios(data);
    } catch (err: unknown) {
      if (err instanceof ApiError && err.status === 401) {
        setSesionInvalida(true);
      } else {
        setError(true);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    cargar();
  }, [cargar]);

  return { veterinarios, isLoading, error, sesionInvalida, recargar: cargar };
}
