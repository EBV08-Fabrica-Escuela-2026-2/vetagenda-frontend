import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Icon, type IconName } from './Icon';
import { Reveal } from './Reveal';

function SectionHeading({ eyebrow, title, text, center = false }: { eyebrow: string; title: string; text?: string; center?: boolean }) {
  return (
    <div className={center ? 'mx-auto max-w-2xl text-center' : 'max-w-2xl'}>
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#0D9488]">{eyebrow}</p>
      <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-900 md:text-4xl">{title}</h2>
      {text && <p className="mt-3 leading-7 text-slate-600">{text}</p>}
    </div>
  );
}

const steps: { icon: IconName; title: string; text: string }[] = [
  { icon: 'paw', title: 'Cuéntanos sobre tu mascota', text: 'Registra a tu compañero con su especie, raza y datos básicos.' },
  { icon: 'calendar', title: 'Elige servicio y horario', text: 'Consulta la disponibilidad de cada profesional y escoge el turno que te convenga.' },
  { icon: 'heart', title: 'Llega y deja el resto en nuestras manos', text: 'Organiza tu visita y concentra tu tiempo en lo importante: cuidar.' },
];

export function HowItWorks() {
  return (
    <section id="como-funciona" className="scroll-mt-28 bg-white px-5 py-16 md:px-10 md:py-24">
      <div className="mx-auto max-w-7xl">
        <Reveal><SectionHeading center eyebrow="Cómo funciona" title="Agendar es tan simple como 1, 2, 3" text="Todo en un solo lugar, sin complicaciones." /></Reveal>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {steps.map((step, i) => (
            <Reveal key={step.title} delay={i * 120}>
              <article className="relative h-full rounded-3xl border border-slate-100 bg-[#F0F7F7] p-7 transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-200/60">
                <span className="absolute right-6 top-5 text-6xl font-black text-[#0D5C75]/10" aria-hidden="true">{i + 1}</span>
                <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-[#0D5C75] shadow-sm"><Icon name={step.icon} className="h-7 w-7" /></span>
                <h3 className="mt-6 text-lg font-extrabold text-slate-900">{step.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{step.text}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

const faqs = [
  { q: '¿Cómo agendo una cita?', a: 'Elige el servicio, el profesional y la fecha en el buscador de inicio y consulta los horarios disponibles.' },
  { q: '¿Qué servicios ofrece VetAgenda?', a: 'Puedes ver el catálogo de servicios con su duración y valores referenciales desde la sección de servicios.' },
  { q: '¿Puedo registrar a más de una mascota?', a: 'Sí. Desde el portal de clientes puedes registrar mascotas y gestionarlas desde una sola cuenta.' },
  { q: '¿Cómo funciona para los veterinarios?', a: 'Los profesionales pueden registrarse, consultar su agenda y gestionar cancelaciones desde su portal.' },
  { q: '¿Esto es una cuenta real?', a: 'Es una demostración académica: los perfiles son de ejemplo y no debes ingresar datos personales reales.' },
];

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  return (
    <section id="faq" className="scroll-mt-28 bg-[#F0F7F7] px-5 py-16 md:px-10 md:py-24">
      <div className="mx-auto max-w-3xl">
        <Reveal><SectionHeading center eyebrow="Preguntas frecuentes" title="Resolvemos tus dudas" /></Reveal>
        <div className="mt-10 space-y-3">
          {faqs.map((item, i) => {
            const isOpen = openIndex === i;
            return (
              <Reveal key={item.q} delay={i * 60}>
                <div className="rounded-2xl bg-white shadow-sm">
                  <h3>
                    <button
                      type="button"
                      aria-expanded={isOpen}
                      aria-controls={`faq-${i}`}
                      onClick={() => setOpenIndex(isOpen ? null : i)}
                      className="flex w-full items-center justify-between gap-4 rounded-2xl px-6 py-5 text-left text-base font-bold text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D9488]"
                    >
                      {item.q}
                      <Icon name="chevron" className={`h-5 w-5 shrink-0 text-[#0D5C75] transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                    </button>
                  </h3>
                  <div id={`faq-${i}`} className={`grid transition-all duration-300 ${isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
                    <p className="overflow-hidden px-6 text-sm leading-7 text-slate-600"><span className="block pb-5">{item.a}</span></p>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export function CtaBanner() {
  return (
    <section className="bg-white px-5 py-16 md:px-10 md:py-20">
      <Reveal>
        <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#0D5C75] via-[#0b7a86] to-[#0D9488] px-7 py-14 text-center text-white md:px-16 md:py-20">
          <div className="absolute -left-10 -top-10 h-48 w-48 rounded-full bg-white/10" aria-hidden="true" />
          <div className="absolute -bottom-16 -right-10 h-64 w-64 rounded-full bg-white/10" aria-hidden="true" />
          <div className="relative">
            <h2 className="mx-auto max-w-2xl text-3xl font-black tracking-tight md:text-5xl">Tu mascota merece el mejor cuidado. Empieza hoy.</h2>
            <p className="mx-auto mt-4 max-w-xl text-base text-white/85">Consulta la disponibilidad y organiza tu próxima visita.</p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link to="/citas/reservar" className="inline-flex min-h-12 items-center gap-2 rounded-full bg-white px-7 text-sm font-bold text-[#0D5C75] shadow-lg transition hover:-translate-y-0.5 hover:bg-[#F0F7F7] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#0D5C75]">
                Agendar mi cita <Icon name="arrow" className="h-4 w-4" />
              </Link>
              <Link to="/cliente/citas" className="inline-flex min-h-12 items-center rounded-full border border-white/80 bg-white/10 px-7 text-sm font-bold text-white transition hover:bg-white/20">
                Consultar mis citas
              </Link>
              <Link to="/catalogo" className="inline-flex min-h-12 items-center rounded-full border border-white/50 px-7 text-sm font-bold text-white transition hover:bg-white/10">
                Ver servicios
              </Link>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
