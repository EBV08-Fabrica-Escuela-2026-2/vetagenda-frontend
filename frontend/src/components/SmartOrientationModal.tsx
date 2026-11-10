import { AlertCircle, AlertTriangle, ArrowLeft, Brain, CalendarDays, Clock3, PawPrint, RefreshCw, X } from 'lucide-react';
import { useEffect, useId, useRef, useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  getClientSession,
  listClientPets,
  requestSmartOrientation,
  type PetProfile,
  type SmartOrientationRequest,
  type SmartOrientationResult,
} from '../services/api';

type SmartOrientationModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

type ConcernLevel = 'bajo' | 'moderado' | 'alto';
type DurationUnit = 'horas' | 'dias' | 'semanas';

const concernLevels: Array<{ value: ConcernLevel; label: string; description: string }> = [
  { value: 'bajo', label: 'Bajo', description: 'Los síntomas son leves.' },
  { value: 'moderado', label: 'Moderado', description: 'Me preocupa y quiero orientación.' },
  { value: 'alto', label: 'Alto', description: 'Los síntomas son intensos o empeoran.' },
];

export function SmartOrientationModal({ isOpen, onClose }: SmartOrientationModalProps) {
  const navigate = useNavigate();
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const petSelectRef = useRef<HTMLSelectElement>(null);
  const symptomsRef = useRef<HTMLTextAreaElement>(null);
  const resultsHeadingRef = useRef<HTMLHeadingElement>(null);
  const requestSequence = useRef(0);
  const ids = useId();
  const [pets, setPets] = useState<PetProfile[]>([]);
  const [petId, setPetId] = useState('');
  const [symptoms, setSymptoms] = useState('');
  const [durationValue, setDurationValue] = useState('');
  const [durationUnit, setDurationUnit] = useState<DurationUnit>('dias');
  const [concern, setConcern] = useState<ConcernLevel | ''>('');
  const [isLoadingPets, setIsLoadingPets] = useState(false);
  const [petsError, setPetsError] = useState('');
  const [formError, setFormError] = useState('');
  const [loadAttempt, setLoadAttempt] = useState(0);
  const [orientationResult, setOrientationResult] = useState<SmartOrientationResult | null>(null);
  const [recommendationError, setRecommendationError] = useState('');
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(false);
  const [lastRequest, setLastRequest] = useState<SmartOrientationRequest | null>(null);

  useEffect(() => {
    if (isOpen) return;
    requestSequence.current += 1;
    setPetId('');
    setSymptoms('');
    setDurationValue('');
    setDurationUnit('dias');
    setConcern('');
    setFormError('');
    setOrientationResult(null);
    setRecommendationError('');
    setIsLoadingRecommendations(false);
    setLastRequest(null);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return undefined;

    const previouslyFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.setTimeout(() => closeButtonRef.current?.focus(), 0);

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose();
        return;
      }

      if (event.key !== 'Tab' || !dialogRef.current) return;
      const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
        'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled])',
      );
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (!dialogRef.current.contains(document.activeElement)) {
        event.preventDefault();
        first.focus();
      } else if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
      previouslyFocused?.focus();
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) return undefined;

    const session = getClientSession();
    if (!session) {
      setPets([]);
      setPetsError('Tu sesión terminó. Inicia sesión nuevamente para consultar tus mascotas.');
      return undefined;
    }

    let isCurrent = true;
    setIsLoadingPets(true);
    setPetsError('');

    listClientPets(session.documentoIdentidad, session.token)
      .then((result) => {
        if (!isCurrent) return;
        setPets(result);
        setPetId((currentPetId) => (
          result.some((pet) => String(pet.id) === currentPetId)
            ? currentPetId
            : result.length === 1 ? String(result[0].id) : ''
        ));
      })
      .catch((requestError: unknown) => {
        if (!isCurrent) return;
        setPets([]);
        setPetsError(requestError instanceof Error ? requestError.message : 'No fue posible consultar tus mascotas.');
      })
      .finally(() => {
        if (isCurrent) setIsLoadingPets(false);
      });

    return () => {
      isCurrent = false;
    };
  }, [isOpen, loadAttempt]);

  useEffect(() => {
    if (orientationResult !== null) resultsHeadingRef.current?.focus();
  }, [orientationResult]);

  if (!isOpen) return null;

  async function loadRecommendations(request: SmartOrientationRequest) {
    const session = getClientSession();
    if (!session) {
      setRecommendationError('Tu sesión terminó. Inicia sesión nuevamente para solicitar orientación.');
      return;
    }

    const requestId = requestSequence.current + 1;
    requestSequence.current = requestId;
    setLastRequest(request);
    setIsLoadingRecommendations(true);
    setRecommendationError('');
    setFormError('');

    try {
      const result = await requestSmartOrientation(request, session.token);
      if (requestSequence.current !== requestId) return;
      setOrientationResult(result);
    } catch (requestError: unknown) {
      if (requestSequence.current !== requestId) return;
      setRecommendationError(
        requestError instanceof Error ? requestError.message : 'No fue posible consultar los servicios disponibles.',
      );
    } finally {
      if (requestSequence.current === requestId) setIsLoadingRecommendations(false);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError('');

    const parsedDuration = Number(durationValue);
    if (!petId) {
      setFormError('Selecciona la mascota que necesita atención.');
      return;
    }
    if (symptoms.trim().length < 10) {
      setFormError('Describe los síntomas con al menos 10 caracteres.');
      symptomsRef.current?.focus();
      return;
    }
    if (!Number.isInteger(parsedDuration) || parsedDuration < 1 || parsedDuration > 365) {
      setFormError('Indica una duración entre 1 y 365.');
      return;
    }
    if (!concern) {
      setFormError('Selecciona el nivel de preocupación.');
      return;
    }

    void loadRecommendations({
      mascotaId: Number(petId),
      sintomas: symptoms.trim(),
      duracionValor: parsedDuration,
      duracionUnidad: durationUnit,
      nivelPreocupacion: concern,
    });
  }

  function goToBooking(serviceId: number, veterinarian: SmartOrientationResult['recomendaciones'][number]['veterinarios'][number]) {
    const query = new URLSearchParams({
      servicioId: String(serviceId),
      veterinarioId: String(veterinarian.id),
      mascotaId: String(petId),
    });
    onClose();
    navigate(`/citas/reservar?${query.toString()}`);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-900/60 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={`${ids}-title`}
        aria-describedby={`${ids}-description`}
        className="my-auto flex max-h-[calc(100vh-2rem)] w-full max-w-2xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl shadow-slate-950/20"
      >
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-5 sm:px-7">
          <div className="flex gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-teal-50 text-[#0D5C75]">
              <Brain className="h-6 w-6" aria-hidden="true" />
            </span>
            <div>
              <p className="text-xs font-bold uppercase text-[#0D9488]">Acompañamiento para tu mascota</p>
              <h2 id={`${ids}-title`} className="mt-1 text-2xl font-bold text-slate-950">Orientación inteligente</h2>
              <p id={`${ids}-description`} className="mt-1 text-sm leading-6 text-slate-600">
                Cuéntanos qué ocurre para preparar una orientación de atención.
              </p>
            </div>
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            aria-label="Cerrar orientación inteligente"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-slate-600 transition hover:bg-slate-100 hover:text-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D9488]"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate className="min-h-0 flex-1 overflow-y-auto">
          <div className="space-y-5 px-5 py-5 sm:px-7">
            <div className="flex gap-3 rounded-lg border border-amber-300 bg-amber-50 p-4 text-amber-950">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
              <p className="text-sm leading-6">
                Esta orientación no reemplaza la valoración ni el diagnóstico de un veterinario. Si tu mascota presenta
                síntomas graves o empeora rápidamente, busca atención veterinaria inmediata.
              </p>
            </div>

            <p className="text-xs leading-5 text-slate-500">
              Al solicitar orientación, los síntomas, la especie y la edad se envían a Google Gemini para analizarlos.
              No enviamos tu nombre, contacto ni el nombre o identificador de tu mascota al proveedor de IA.
            </p>

            {orientationResult === null && (
              <>
            {isLoadingPets && (
              <div role="status" className="flex items-center gap-3 py-2 text-sm font-medium text-slate-600">
                <span className="h-5 w-5 animate-spin rounded-full border-2 border-slate-200 border-t-[#0D9488]" />
                Consultando tus mascotas...
              </div>
            )}

            {!isLoadingPets && petsError && (
              <div role="alert" className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">
                <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
                <div className="text-sm">
                  <p className="font-semibold">{petsError}</p>
                  {getClientSession() && (
                    <button
                      type="button"
                      onClick={() => setLoadAttempt((attempt) => attempt + 1)}
                      className="mt-2 font-bold underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-700"
                    >
                      Reintentar consulta
                    </button>
                  )}
                </div>
              </div>
            )}

            {!isLoadingPets && !petsError && pets.length === 0 && (
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm leading-6 text-slate-700">Aún no tienes mascotas registradas para solicitar orientación.</p>
                <Link
                  to="/mascotas/registro"
                  onClick={onClose}
                  className="mt-2 inline-flex min-h-10 items-center font-bold text-[#0D5C75] underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D9488]"
                >
                  Registrar una mascota
                </Link>
              </div>
            )}

            {!isLoadingPets && !petsError && pets.length > 0 && (
              <>
                <div>
                  <label htmlFor={`${ids}-pet`} className="mb-1.5 block text-sm font-bold text-slate-800">
                    Mascota <span className="text-red-700" aria-hidden="true">*</span>
                  </label>
                  <select
                    ref={petSelectRef}
                    id={`${ids}-pet`}
                    required
                    value={petId}
                    onChange={(event) => setPetId(event.target.value)}
                    className="min-h-12 w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-900 focus:border-[#0D9488] focus:outline-none focus:ring-2 focus:ring-[#0D9488]/20"
                  >
                    <option value="">Selecciona una mascota</option>
                    {pets.map((pet) => (
                      <option key={pet.id} value={pet.id}>
                        {pet.nombre} · {pet.especie}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor={`${ids}-symptoms`} className="mb-1.5 block text-sm font-bold text-slate-800">
                    ¿Qué síntomas observas? <span className="text-red-700" aria-hidden="true">*</span>
                  </label>
                  <textarea
                    ref={symptomsRef}
                    id={`${ids}-symptoms`}
                    required
                    minLength={10}
                    maxLength={1000}
                    rows={4}
                    value={symptoms}
                    onChange={(event) => setSymptoms(event.target.value)}
                    aria-describedby={`${ids}-symptoms-hint`}
                    placeholder="Describe qué has notado en tu mascota..."
                    className="w-full resize-y rounded-lg border border-slate-300 px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-[#0D9488] focus:outline-none focus:ring-2 focus:ring-[#0D9488]/20"
                  />
                  <p id={`${ids}-symptoms-hint`} className="mt-1 text-xs text-slate-500">
                    No incluyas datos personales. Entre 10 y 1000 caracteres ({symptoms.length}/1000).
                  </p>
                </div>

                <div>
                  <label htmlFor={`${ids}-duration`} className="mb-1.5 block text-sm font-bold text-slate-800">
                    ¿Desde hace cuánto? <span className="text-red-700" aria-hidden="true">*</span>
                  </label>
                  <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-3">
                    <input
                      id={`${ids}-duration`}
                      type="number"
                      min="1"
                      max="365"
                      step="1"
                      required
                      value={durationValue}
                      onChange={(event) => setDurationValue(event.target.value)}
                      aria-describedby={`${ids}-duration-hint`}
                      className="min-h-12 min-w-0 rounded-lg border border-slate-300 px-4 py-3 focus:border-[#0D9488] focus:outline-none focus:ring-2 focus:ring-[#0D9488]/20"
                    />
                    <select
                      aria-label="Unidad de duración"
                      value={durationUnit}
                      onChange={(event) => {
                        const { value } = event.target;
                        if (value === 'horas' || value === 'dias' || value === 'semanas') {
                          setDurationUnit(value);
                        }
                      }}
                      className="min-h-12 min-w-0 rounded-lg border border-slate-300 bg-white px-3 py-3 focus:border-[#0D9488] focus:outline-none focus:ring-2 focus:ring-[#0D9488]/20"
                    >
                      <option value="horas">Horas</option>
                      <option value="dias">Días</option>
                      <option value="semanas">Semanas</option>
                    </select>
                  </div>
                  <p id={`${ids}-duration-hint`} className="mt-1 text-xs text-slate-500">Indica un valor entre 1 y 365.</p>
                </div>

                <fieldset>
                  <legend className="mb-2 text-sm font-bold text-slate-800">
                    ¿Qué tan preocupante te parece? <span className="text-red-700" aria-hidden="true">*</span>
                  </legend>
                  <div className="grid gap-2 sm:grid-cols-3">
                    {concernLevels.map((level) => (
                      <label
                        key={level.value}
                        className={`flex cursor-pointer gap-3 rounded-lg border p-3 transition focus-within:ring-2 focus-within:ring-[#0D9488] ${
                          concern === level.value ? 'border-[#0D9488] bg-teal-50' : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name={`${ids}-concern`}
                          value={level.value}
                          checked={concern === level.value}
                          onChange={() => setConcern(level.value)}
                          className="mt-1 h-4 w-4 accent-[#0D5C75]"
                        />
                        <span>
                          <span className="block text-sm font-bold text-slate-900">{level.label}</span>
                          <span className="mt-0.5 block text-xs leading-5 text-slate-600">{level.description}</span>
                        </span>
                      </label>
                    ))}
                  </div>
                </fieldset>
              </>
            )}

            {formError && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-800">{formError}</p>}

            <p className="flex items-center gap-2 text-xs leading-5 text-slate-500">
              <Clock3 className="h-4 w-4 shrink-0" aria-hidden="true" />
              Solo solicitamos información necesaria para orientar la atención de tu mascota.
            </p>
              </>
            )}

            {isLoadingRecommendations && (
              <div role="status" aria-live="polite" className="flex items-center gap-3 rounded-lg bg-slate-50 p-4 text-sm font-medium text-slate-700">
                <span className="h-5 w-5 animate-spin rounded-full border-2 border-slate-200 border-t-[#0D9488]" />
                Analizando síntomas y servicios disponibles...
              </div>
            )}

            {recommendationError && (
              <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">
                <p className="text-sm font-semibold">{recommendationError}</p>
                <button
                  type="button"
                  onClick={() => lastRequest && void loadRecommendations(lastRequest)}
                  disabled={!lastRequest || isLoadingRecommendations}
                  className="mt-2 min-h-10 font-bold underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-700 disabled:opacity-60"
                >
                  Reintentar consulta
                </button>
              </div>
            )}

            {orientationResult !== null && !isLoadingRecommendations && !recommendationError && (
              <section aria-labelledby={`${ids}-results-title`} aria-live="polite">
                <h3
                  ref={resultsHeadingRef}
                  id={`${ids}-results-title`}
                  tabIndex={-1}
                  className="text-lg font-bold text-slate-950 focus:outline-none"
                >
                  Orientación para {pets.find((pet) => String(pet.id) === petId)?.nombre}
                </h3>
                <p className="mt-1 text-sm leading-6 text-slate-700">{orientationResult.mensaje}</p>

                {orientationResult.modoRespaldo && (
                  <div role="status" className="mt-4 rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm leading-6 text-amber-950">
                    <p>El análisis de IA no está disponible; se muestran solo coincidencias claras encontradas en el catálogo, si las hay.</p>
                    <button
                      type="button"
                      onClick={() => {
                        if (!lastRequest) return;
                        setOrientationResult(null);
                        void loadRecommendations(lastRequest);
                      }}
                      disabled={isLoadingRecommendations || !lastRequest}
                      className="mt-2 inline-flex min-h-10 items-center gap-2 font-bold underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-800 disabled:opacity-60"
                    >
                      <RefreshCw className="h-4 w-4" aria-hidden="true" />
                      Reintentar análisis
                    </button>
                  </div>
                )}

                {orientationResult.urgente && (
                  <p role="alert" className="mt-4 flex gap-3 rounded-lg border border-red-300 bg-red-50 p-4 text-sm font-semibold leading-6 text-red-900">
                    <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
                    {orientationResult.mensajeUrgencia || 'Busca atención veterinaria inmediata. Esta herramienta no puede evaluar ni descartar urgencias.'}
                  </p>
                )}

                {orientationResult.recomendaciones.length === 0 ? (
                  <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
                    <p className="text-sm leading-6 text-slate-700">
                      No se encontraron servicios del catálogo suficientemente relacionados con lo descrito. No sugeriremos opciones que puedan no corresponder.
                    </p>
                  </div>
                ) : (
                  <ul className="mt-4 space-y-3">
                    {orientationResult.recomendaciones.map((recommendation) => (
                      <li key={recommendation.servicioId} className="rounded-lg border border-slate-200 p-4">
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <h4 className="font-bold text-slate-950">{recommendation.nombre}</h4>
                        </div>
                        <p className="mt-2 text-sm leading-6 text-slate-600">{recommendation.explicacion}</p>
                        <div className="mt-4 border-t border-slate-100 pt-3">
                          <p className="text-sm font-semibold text-slate-800">Profesionales que ofrecen este servicio</p>
                          <ul className="mt-2 flex flex-wrap gap-2">
                            {recommendation.veterinarios.map((veterinarian) => (
                              <li key={veterinarian.id}>
                                <button
                                  type="button"
                                  onClick={() => goToBooking(recommendation.servicioId, veterinarian)}
                                  className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-[#0D5C75] px-3 py-2 text-sm font-bold text-[#0D5C75] transition hover:bg-teal-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D9488] focus-visible:ring-offset-2"
                                >
                                  <CalendarDays className="h-4 w-4" aria-hidden="true" />
                                  Agendar con {veterinarian.nombre}
                                </button>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
                <p className="mt-4 text-xs leading-5 text-slate-500">{orientationResult.advertencia}</p>
              </section>
            )}
          </div>

          <div className="flex flex-col-reverse gap-3 border-t border-slate-200 bg-slate-50 px-5 py-4 sm:flex-row sm:justify-end sm:px-7">
            {orientationResult === null ? (
              <>
                <button
                  type="button"
                  onClick={onClose}
                  className="min-h-11 rounded-lg border border-slate-300 px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D9488]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isLoadingPets || pets.length === 0 || Boolean(petsError) || isLoadingRecommendations}
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[#0D5C75] px-5 py-2 text-sm font-bold text-white transition hover:bg-[#094356] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D9488] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <PawPrint className="h-4 w-4" aria-hidden="true" />
                  {isLoadingRecommendations ? 'Consultando catálogo...' : 'Consultar opciones disponibles'}
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={onClose}
                  className="min-h-11 rounded-lg border border-slate-300 px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D9488]"
                >
                  Cerrar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setOrientationResult(null);
                    setRecommendationError('');
                    window.setTimeout(() => petSelectRef.current?.focus(), 0);
                  }}
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[#0D5C75] px-5 py-2 text-sm font-bold text-white transition hover:bg-[#094356] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D9488] focus-visible:ring-offset-2"
                >
                  <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                  Editar solicitud
                </button>
              </>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
