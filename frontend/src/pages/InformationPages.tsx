import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { BackToHomeButton } from '../components/BackToHomeButton';
import { Footer } from '../components/Footer';
import { Logo } from '../components/Logo';

type InformationPageProps = {
  eyebrow: string;
  title: string;
  summary: string;
  showUpdatedDate?: boolean;
  children: ReactNode;
};

function InformationPage({ eyebrow, title, summary, showUpdatedDate = true, children }: InformationPageProps) {
  return (
    <main className="min-h-screen bg-white text-slate-900">
      <header className="border-b border-slate-100 bg-white px-5 py-5 md:px-10">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4">
          <Logo />
          <BackToHomeButton />
        </div>
      </header>

      <section className="bg-[#F0F7F7] px-5 py-12 md:px-10 md:py-16">
        <div className="mx-auto max-w-5xl">
          <p className="text-xs font-bold uppercase text-[#0D5C75]">{eyebrow}</p>
          <h1 className="mt-3 max-w-3xl text-3xl font-black leading-tight md:text-5xl">{title}</h1>
          <p className="mt-5 max-w-3xl text-base leading-7 text-slate-600">{summary}</p>
          {showUpdatedDate && <p className="mt-4 text-sm font-semibold text-slate-500">Última actualización: 17 de octubre de 2026</p>}
        </div>
      </section>

      <div className="mx-auto max-w-5xl px-5 py-12 md:px-10 md:py-16">
        <div className="max-w-3xl space-y-10 text-sm leading-7 text-slate-600">{children}</div>
      </div>

      <Footer />
    </main>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="border-t border-slate-200 pt-7 first:border-t-0 first:pt-0">
      <h2 className="text-xl font-bold text-slate-900">{title}</h2>
      <div className="mt-3 space-y-3">{children}</div>
    </section>
  );
}

export function PrivacyPage() {
  return (
    <InformationPage
      eyebrow="Información legal"
      title="Privacidad y Habeas Data"
      summary="Esta política explica de forma clara qué información utiliza VetAgenda, para qué se usa y cómo pueden ejercerse los derechos sobre los datos personales."
    >
      <Section title="1. Alcance de esta política">
        <p>VetAgenda es una demostración académica desarrollada para la Fábrica Escuela. No debe utilizarse para registrar información clínica real, datos sensibles ni datos personales de terceros sin autorización.</p>
      </Section>

      <Section title="2. Información que puede tratar la plataforma">
        <ul className="list-disc space-y-2 pl-5">
          <li>Datos de identificación y contacto suministrados durante el registro.</li>
          <li>Información básica de las mascotas, como nombre, especie y raza.</li>
          <li>Datos necesarios para consultar disponibilidad, reservar y administrar citas.</li>
          <li>Información técnica de sesión necesaria para autenticar y proteger el acceso.</li>
        </ul>
      </Section>

      <Section title="3. Finalidades del tratamiento">
        <p>La información se utiliza exclusivamente para demostrar los flujos de registro, autenticación, agenda, disponibilidad, catálogo de servicios y gestión de citas incluidos en el proyecto.</p>
      </Section>

      <Section title="4. Almacenamiento y terceros">
        <p>La aplicación utiliza servicios de infraestructura como Render, PostgreSQL y Vercel para ejecutar la demostración. VetAgenda no comercializa información personal. Los proveedores de infraestructura solo intervienen para prestar el servicio técnico.</p>
      </Section>

      <Section title="5. Derechos de los titulares">
        <p>De acuerdo con los principios de habeas data aplicables en Colombia, el titular puede solicitar conocer, actualizar, corregir o eliminar su información, así como revocar la autorización cuando corresponda.</p>
        <p>Para reportar una solicitud o un dato incluido por error, utiliza los canales publicados en la página de <Link to="/contacto" className="font-bold text-[#0D5C75] hover:underline">Contacto</Link>.</p>
      </Section>

      <Section title="6. Uso responsable">
        <p>No ingreses historias clínicas reales, documentos oficiales, datos financieros, contraseñas reutilizadas ni información de menores de edad. Al ser un entorno académico, se recomienda utilizar únicamente datos ficticios.</p>
      </Section>
    </InformationPage>
  );
}

export function TermsPage() {
  return (
    <InformationPage
      eyebrow="Información legal"
      title="Términos de uso"
      summary="Estas condiciones establecen el uso permitido de VetAgenda y el alcance de las funciones disponibles en la demostración académica."
    >
      <Section title="1. Naturaleza del servicio">
        <p>VetAgenda es un proyecto académico que simula la operación de una agenda veterinaria. No constituye un servicio veterinario, médico, de urgencias ni una plataforma comercial en producción.</p>
      </Section>

      <Section title="2. Uso permitido">
        <p>La plataforma puede utilizarse para explorar sus funcionalidades, realizar pruebas académicas y evaluar los flujos del producto. El usuario debe emplear datos ficticios y respetar los perfiles y permisos disponibles.</p>
      </Section>

      <Section title="3. Conductas no permitidas">
        <ul className="list-disc space-y-2 pl-5">
          <li>Intentar acceder a cuentas, citas o información de otros usuarios.</li>
          <li>Introducir código malicioso, automatizar solicitudes abusivas o afectar la disponibilidad del sistema.</li>
          <li>Registrar información personal o clínica real sin autorización.</li>
          <li>Presentar el contenido de la demostración como una recomendación veterinaria profesional.</li>
        </ul>
      </Section>

      <Section title="4. Disponibilidad y exactitud">
        <p>Al tratarse de una demostración, el servicio puede cambiar, reiniciarse o quedar temporalmente fuera de línea. Los precios, perfiles, horarios y servicios mostrados son datos de ejemplo y no representan una oferta comercial.</p>
      </Section>

      <Section title="5. Cuentas y seguridad">
        <p>Cada usuario es responsable del uso de sus credenciales. Las cuentas de demostración son temporales y no deben utilizar contraseñas que también se empleen en otros servicios.</p>
      </Section>

      <Section title="6. Consultas y reportes">
        <p>Los errores, inquietudes sobre el uso o solicitudes relacionadas con la información pueden reportarse mediante los canales indicados en <Link to="/contacto" className="font-bold text-[#0D5C75] hover:underline">Contacto</Link>.</p>
      </Section>
    </InformationPage>
  );
}

const projectLinks = [
  {
    title: 'Frontend en GitHub',
    description: 'Reporta inconvenientes de interfaz, navegación o despliegue en Vercel.',
    href: 'https://github.com/EBV08-Fabrica-Escuela-2026-2/vetagenda-frontend/issues',
  },
  {
    title: 'Backend en GitHub',
    description: 'Reporta inconvenientes de API, autenticación, datos o despliegue en Render.',
    href: 'https://github.com/EBV08-Fabrica-Escuela-2026-2/veterinary-system/issues',
  },
  {
    title: 'Proyecto en Azure DevOps',
    description: 'Consulta el backlog, las historias de usuario y el avance del equipo.',
    href: 'https://dev.azure.com/FE-EBV08/VetAgenda',
  },
];

export function ContactPage() {
  return (
    <InformationPage
      eyebrow="Soporte del proyecto"
      title="Contacto"
      summary="Utiliza el canal relacionado con tu consulta para que el equipo pueda ubicarla y darle seguimiento dentro de las herramientas del proyecto."
      showUpdatedDate={false}
    >
      <Section title="Canales disponibles">
        <div className="divide-y divide-slate-200 border-y border-slate-200">
          {projectLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              target="_blank"
              rel="noreferrer"
              className="group flex items-start justify-between gap-5 py-5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D9488]"
            >
              <span>
                <span className="block font-bold text-slate-900 group-hover:text-[#0D5C75]">{link.title}</span>
                <span className="mt-1 block text-sm text-slate-600">{link.description}</span>
              </span>
              <span aria-hidden="true" className="shrink-0 font-bold text-[#0D5C75]">↗</span>
            </a>
          ))}
        </div>
      </Section>

      <Section title="Antes de reportar">
        <p>Describe brevemente el problema, la pantalla donde ocurrió y los pasos para reproducirlo. No publiques contraseñas, documentos de identidad, historias clínicas ni otros datos personales en repositorios o tableros compartidos.</p>
      </Section>
    </InformationPage>
  );
}
