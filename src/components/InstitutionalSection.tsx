import React, { useState } from 'react';
import {
  Building2,
  Compass,
  Eye,
  HeartHandshake,
  ShieldCheck,
  Users,
  Cpu,
  Wrench,
  Wallet,
  Scissors,
  Sparkles,
  ScanFace,
  Droplets,
  ShoppingBag,
  Target,
  MapPin,
  CheckCircle2,
  PlayCircle,
  Image as ImageIcon,
  X,
  ArrowUpRight,
} from 'lucide-react';

interface InstitutionalSectionProps {
  onOpenFaceScanner: () => void;
  onOpenBooking: () => void;
}

type TabFilter = 'all' | 'estrategia' | 'administracion' | 'servicios-objetivos';

const INSTITUTIONAL_VALUES = [
  {
    name: 'Innovación',
    description: 'Aplicamos tecnología para mejorar tu experiencia.',
    metric: 'Tecnología IA',
  },
  {
    name: 'Calidad',
    description: 'Ofrecemos servicios de alto nivel.',
    metric: 'Estándar Premium',
  },
  {
    name: 'Respeto',
    description: 'Valoramos a cada cliente.',
    metric: 'Trato Personalizado',
  },
  {
    name: 'Compromiso',
    description: 'Cumplimos con nuestros clientes.',
    metric: 'Puntualidad y Confianza',
  },
];

const ADMINISTRATIVE_SERVICES = [
  'Cortes de cabello con IA (recomendación de estilo)',
  'Afeitado y arreglos de barba',
  'Diseño de cejas y perfilado',
  'Tratamientos capilares con análisis IA',
  'Venta de productos premium',
];

const ORG_AREAS = [
  {
    area: 'Área de Atención al Cliente',
    responsibility: 'Recepción y Reservas',
  },
  {
    area: 'Área Técnica (Barber IA)',
    responsibility: 'Cortes, Estilo y Análisis con IA',
  },
  {
    area: 'Área Comercial y Marketing',
    responsibility: 'Ventas y Promoción',
  },
];

const REQUIRED_RESOURCES = [
  {
    category: 'Humanos',
    details: 'Barberos, Administrador, Marketing',
    Icon: Users,
  },
  {
    category: 'Tecnológicos',
    details: 'IA, software de reservas, equipos premium',
    Icon: Cpu,
  },
  {
    category: 'Materiales',
    details: 'Herramientas, productos de cuidado',
    Icon: Wrench,
  },
  {
    category: 'Financieros',
    details: 'Capital inicial y sostenimiento',
    Icon: Wallet,
  },
];

const FEATURED_SERVICES = [
  {
    number: '01',
    title: 'Cortes Inteligentes (con IA)',
    description: 'Asesoría morfológica y ejecución milimétrica adaptada a cada rostro.',
    actionLabel: 'Ver paquetes',
    href: '#paquetes',
    Icon: Scissors,
  },
  {
    number: '02',
    title: 'Diseño de Barba Personalizado',
    description: 'Perfilado geométrico, rebaje y ritual de afeitado con toalla caliente.',
    actionLabel: 'Ver estilos',
    href: '#estilos',
    Icon: Sparkles,
  },
  {
    number: '03',
    title: 'Análisis de Estilo Facial (con IA)',
    description: 'Escaneo biométrico con recomendación instantánea y probador virtual.',
    actionLabel: 'Abrir escáner',
    actionType: 'scanner' as const,
    Icon: ScanFace,
  },
  {
    number: '04',
    title: 'Tratamientos Capilares',
    description: 'Diagnóstico y cuidado intensivo para fortalecer el cuero cabelludo.',
    actionLabel: 'Reservar turno',
    actionType: 'booking' as const,
    Icon: Droplets,
  },
  {
    number: '05',
    title: 'Productos Premium',
    description: 'Ceras, aceites de barba, shampoo y herramientas en bolivianos (Bs).',
    actionLabel: 'Ir a tienda',
    href: '#productos',
    Icon: ShoppingBag,
  },
];

const SMART_OBJECTIVES = [
  {
    index: '01',
    kpi: '+40%',
    horizon: '12 meses',
    statement: 'Incrementar la base de clientes en un 40% en 12 meses mediante marketing digital.',
  },
  {
    index: '02',
    kpi: '95%',
    horizon: 'Satisfacción',
    statement: 'Lograr un 95% de satisfacción del cliente con la experiencia de servicio.',
  },
  {
    index: '03',
    kpi: '6 meses',
    horizon: 'Plataforma',
    statement: 'Desarrollar y mantener la app de reservas en 6 meses.',
  },
  {
    index: '04',
    kpi: '+30%',
    horizon: 'Año 1',
    statement: 'Aumentar los ingresos en un 30% en el primer año.',
  },
  {
    index: '05',
    kpi: '3 años',
    horizon: 'Expansión',
    statement: 'Expandir la marca a otras ciudades en 3 años.',
  },
];

const OPERATION_STEPS = [
  'El cliente agenda su cita desde la app o en el local.',
  'La IA analiza el rostro y recomienda el mejor estilo.',
  'El barbero aplica el corte con precisión.',
  'Se brinda un servicio premium y se registra el historial del cliente.',
];

export const InstitutionalSection: React.FC<InstitutionalSectionProps> = ({
  onOpenFaceScanner,
  onOpenBooking,
}) => {
  const [activeTab, setActiveTab] = useState<TabFilter>('all');
  const [posterModalOpen, setPosterModalOpen] = useState<boolean>(false);

  const showEstrategia = activeTab === 'all' || activeTab === 'estrategia';
  const showAdministracion = activeTab === 'all' || activeTab === 'administracion';
  const showServiciosObjetivos = activeTab === 'all' || activeTab === 'servicios-objetivos';

  return (
    <section
      id="nosotros"
      className="py-16 sm:py-24 bg-[#05070d] border-t border-slate-800/80 relative"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Section Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 border-b border-slate-800/80 pb-8">
          <div className="space-y-3 max-w-3xl">
            <p className="text-xs font-mono text-cyan-400 tracking-wide">
              Perfil Corporativo · Planificación Estratégica · Santa Cruz de la Sierra, Bolivia
            </p>
            <h2 className="text-3xl sm:text-4xl font-black text-white font-tech tracking-tight text-balance">
              Identidad Institucional y Modelo de Gestión <span className="text-cyan-400">BARBER IA</span>
            </h2>
            <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
              Tu estilo, nuestra pasión... ahora con IA. Conoce nuestra misión, visión, valores, estructura administrativa, recursos clave y objetivos estratégicos SMART.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => setPosterModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 hover:border-cyan-400 text-slate-200 hover:text-white text-xs font-semibold flex items-center gap-2 transition-colors whitespace-nowrap shrink-0"
            >
              <ImageIcon className="w-4 h-4 text-cyan-400" />
              <span>Ver Infografía Oficial</span>
            </button>
          </div>
        </div>

        {/* Interactive Filter Tabs */}
        <div className="flex flex-wrap items-center gap-2 p-1.5 bg-[#0a0f1d] border border-slate-800 rounded-xl w-fit">
          {(
            [
              { id: 'all', label: 'Vista Completa' },
              { id: 'estrategia', label: 'Misión, Visión y Valores' },
              { id: 'administracion', label: 'Administración y Recursos' },
              { id: 'servicios-objetivos', label: 'Servicios y Objetivos SMART' },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                activeTab === tab.id
                  ? 'bg-cyan-500 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* 1. PLANIFICACIÓN ESTRATÉGICA: MISIÓN, VISIÓN Y VALORES INSTITUCIONALES */}
        {showEstrategia && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
              {/* Misión */}
              <div className="rounded-2xl bg-[#0a0f1d] border border-slate-800 p-6 sm:p-8 flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-cyan-400">01. Planificación Estratégica</span>
                    <Compass className="w-5 h-5 text-cyan-400" />
                  </div>
                  <h3 className="text-2xl font-black text-white font-tech">Misión</h3>
                  <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                    Brindar servicios de barbería con tecnología de inteligencia artificial, ofreciendo cortes y estilos personalizados con calidad, innovación y atención de excelencia.
                  </p>
                </div>
                <div className="pt-4 border-t border-slate-800/80 text-xs text-slate-400">
                  Propósito operativo · Barbería inteligente centrada en el cliente
                </div>
              </div>

              {/* Visión */}
              <div className="rounded-2xl bg-[#0a0f1d] border border-slate-800 p-6 sm:p-8 flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-cyan-400">02. Proyección de Liderazgo</span>
                    <Eye className="w-5 h-5 text-cyan-400" />
                  </div>
                  <h3 className="text-2xl font-black text-white font-tech">Visión</h3>
                  <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                    Ser la barbería líder en Bolivia en la combinación de estilo, tecnología e innovación, reconocida por transformar la experiencia de cuidado personal.
                  </p>
                </div>
                <div className="pt-4 border-t border-slate-800/80 text-xs text-slate-400">
                  Alcance nacional · Referente en cuidado personal con IA
                </div>
              </div>
            </div>

            {/* Valores Institucionales */}
            <div className="rounded-2xl bg-[#0a0f1d] border border-slate-800 p-6 sm:p-8 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-4">
                <div>
                  <h3 className="text-xl font-black text-white font-tech flex items-center gap-2.5">
                    <HeartHandshake className="w-5 h-5 text-cyan-400" />
                    <span>Valores Institucionales</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Principios que guían cada atención, diagnóstico facial y servicio en BARBER IA.
                  </p>
                </div>
                <span className="text-xs font-mono text-slate-400">4 Pilares Fundamentales</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 divide-y sm:divide-y-0 sm:divide-x divide-slate-800/80">
                {INSTITUTIONAL_VALUES.map((val, idx) => (
                  <div
                    key={val.name}
                    className={`${idx > 0 ? 'pt-4 sm:pt-0 sm:pl-6' : ''} space-y-2`}
                  >
                    <div className="text-xs font-mono text-cyan-400 tabular-nums">
                      0{idx + 1} · {val.metric}
                    </div>
                    <h4 className="text-lg font-bold text-white">{val.name}</h4>
                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                      {val.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 2. ASPECTOS ADMINISTRATIVOS, LEGALES Y COMERCIALES + RECURSOS NECESARIOS */}
        {showAdministracion && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Aspectos Administrativos (7 cols) */}
            <div className="lg:col-span-7 rounded-2xl bg-[#0a0f1d] border border-slate-800 p-6 sm:p-8 space-y-6">
              <div className="border-b border-slate-800/80 pb-4">
                <p className="text-xs font-mono text-cyan-400">03. Marco Corporativo</p>
                <h3 className="text-xl sm:text-2xl font-black text-white font-tech mt-1 flex items-center gap-2.5">
                  <Building2 className="w-5 h-5 text-cyan-400" />
                  <span>Aspectos Administrativos, Legales y Comerciales</span>
                </h3>
              </div>

              {/* Legal & Commercial Data Table */}
              <dl className="divide-y divide-slate-800/80 text-sm">
                <div className="py-3 grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <dt className="text-slate-400 font-medium">1. Tipo de Empresa</dt>
                  <dd className="sm:col-span-2 text-white font-semibold">
                    Sociedad de Responsabilidad Limitada (S.R.L.)
                  </dd>
                </div>

                <div className="py-3 grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <dt className="text-slate-400 font-medium">2. Nombre Comercial</dt>
                  <dd className="sm:col-span-2 text-white font-semibold">Barber IA</dd>
                </div>

                <div className="py-3 grid grid-cols-1 sm:grid-cols-3 gap-2 items-center">
                  <dt className="text-slate-400 font-medium">3. Logotipo Institucional</dt>
                  <dd className="sm:col-span-2 flex items-center gap-3">
                    <img
                      src="/assets/aistudio/WhatsApp_Image_2026-11-12_at_09.03.14_0a9180d3.jpeg"
                      alt="Logotipo institucional BARBER IA"
                      referrerPolicy="no-referrer"
                      className="w-11 h-11 rounded-lg object-cover border border-cyan-500/40 shrink-0"
                    />
                    <div>
                      <div className="font-tech font-black text-white text-sm tracking-wide">
                        BARBER <span className="text-cyan-400">IA</span>
                      </div>
                      <div className="text-[11px] text-slate-400">
                        Estilo · Tecnología · Precisión
                      </div>
                    </div>
                  </dd>
                </div>

                <div className="py-3 grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <dt className="text-slate-400 font-medium">4. Servicios / Productos</dt>
                  <dd className="sm:col-span-2 space-y-1.5">
                    {ADMINISTRATIVE_SERVICES.map((item) => (
                      <div key={item} className="flex items-start gap-2 text-slate-200 text-xs sm:text-sm">
                        <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </dd>
                </div>

                <div className="py-3 grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <dt className="text-slate-400 font-medium">5. Ubicación Geográfica</dt>
                  <dd className="sm:col-span-2 text-slate-200 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-cyan-400 shrink-0" />
                    <span>Av. Principal 1234, Santa Cruz de la Sierra – Bolivia</span>
                  </dd>
                </div>
              </dl>

              {/* 6. Estructura Organizacional */}
              <div className="pt-4 border-t border-slate-800/80 space-y-4">
                <div className="text-sm font-semibold text-white">
                  6. Estructura Organizacional
                </div>

                <div className="flex flex-col items-center">
                  {/* Top node */}
                  <div className="w-full sm:w-72 text-center px-5 py-3.5 rounded-xl bg-cyan-950/50 border border-cyan-500/40">
                    <div className="text-sm font-black text-white font-tech">Gerencia General</div>
                    <div className="text-xs text-cyan-300 mt-0.5">Dirección y Estrategia</div>
                  </div>

                  {/* Connector line */}
                  <div className="w-px h-6 bg-slate-700" aria-hidden="true" />
                  <div className="hidden sm:block w-2/3 h-px bg-slate-700" aria-hidden="true" />

                  {/* 3 Departments */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full pt-3">
                    {ORG_AREAS.map((dept) => (
                      <div
                        key={dept.area}
                        className="rounded-xl bg-[#070b14] border border-slate-800 p-3.5 text-center space-y-1.5"
                      >
                        <div className="text-xs font-bold text-white leading-snug">{dept.area}</div>
                        <div className="h-px bg-slate-800" />
                        <div className="text-[11px] text-slate-400 leading-snug">
                          {dept.responsibility}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Recursos Necesarios + Simulación de Funcionamiento (5 cols) */}
            <div className="lg:col-span-5 space-y-6">
              {/* Recursos Necesarios */}
              <div className="rounded-2xl bg-[#0a0f1d] border border-slate-800 p-6 sm:p-8 space-y-5">
                <div className="border-b border-slate-800/80 pb-4">
                  <p className="text-xs font-mono text-cyan-400">04. Capacidad Operativa</p>
                  <h3 className="text-xl font-black text-white font-tech mt-1">
                    Recursos Necesarios
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {REQUIRED_RESOURCES.map(({ category, details, Icon }) => (
                    <div
                      key={category}
                      className="rounded-xl bg-[#070b14] border border-slate-800 p-4 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-white">{category}</span>
                        <Icon className="w-4 h-4 text-cyan-400" />
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed">{details}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Simulación de Funcionamiento */}
              <div className="rounded-2xl bg-[#0a0f1d] border border-slate-800 p-6 sm:p-8 space-y-5">
                <div className="border-b border-slate-800/80 pb-4">
                  <p className="text-xs font-mono text-cyan-400">05. Flujo de Atención</p>
                  <h3 className="text-xl font-black text-white font-tech mt-1 flex items-center gap-2">
                    <PlayCircle className="w-5 h-5 text-cyan-400" />
                    <span>Simulación de Funcionamiento</span>
                  </h3>
                </div>

                <ol className="space-y-3">
                  {OPERATION_STEPS.map((step, idx) => (
                    <li key={step} className="flex items-start gap-3 text-xs sm:text-sm text-slate-300">
                      <span className="w-6 h-6 rounded-lg bg-cyan-500/15 border border-cyan-500/40 text-cyan-300 font-mono text-xs font-bold flex items-center justify-center shrink-0 tabular-nums">
                        {idx + 1}
                      </span>
                      <span className="leading-relaxed pt-0.5">{step}</span>
                    </li>
                  ))}
                </ol>

                <div className="pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
                  <p className="text-xs italic text-cyan-300 font-medium">
                    “Más que una barbería, una experiencia inteligente”
                  </p>
                  <button
                    type="button"
                    onClick={onOpenFaceScanner}
                    className="px-3.5 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-colors whitespace-nowrap shrink-0"
                  >
                    Probar Análisis IA
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 3. SERVICIOS Y PRODUCTOS DESTACADOS + OBJETIVOS INSTITUCIONALES (SMART) */}
        {showServiciosObjetivos && (
          <div className="space-y-8">
            {/* Servicios y Productos Destacados */}
            <div className="rounded-2xl bg-[#0a0f1d] border border-slate-800 p-6 sm:p-8 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-slate-800/80 pb-4">
                <div>
                  <p className="text-xs font-mono text-cyan-400">06. Portafolio Principal</p>
                  <h3 className="text-xl sm:text-2xl font-black text-white font-tech mt-1">
                    Servicios y Productos Destacados
                  </h3>
                </div>
                <span className="text-xs text-slate-400">
                  5 líneas clave de atención y cuidado personal
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                {FEATURED_SERVICES.map((item) => {
                  const Icon = item.Icon;
                  const content = (
                    <div className="h-full rounded-xl bg-[#070b14] border border-slate-800 hover:border-cyan-500/50 p-4 flex flex-col justify-between gap-4 transition-colors">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-mono text-slate-500 tabular-nums">
                            {item.number}
                          </span>
                          <Icon className="w-5 h-5 text-cyan-400" />
                        </div>
                        <h4 className="text-sm font-bold text-white leading-snug">
                          {item.title}
                        </h4>
                        <p className="text-xs text-slate-400 leading-relaxed">
                          {item.description}
                        </p>
                      </div>
                      <div className="text-xs font-semibold text-cyan-400 flex items-center gap-1 pt-2 border-t border-slate-800/70">
                        <span>{item.actionLabel}</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  );

                  if (item.href) {
                    return (
                      <a key={item.number} href={item.href} className="block h-full">
                        {content}
                      </a>
                    );
                  }

                  return (
                    <button
                      key={item.number}
                      type="button"
                      onClick={() =>
                        item.actionType === 'scanner' ? onOpenFaceScanner() : onOpenBooking()
                      }
                      className="block w-full h-full text-left"
                    >
                      {content}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Objetivos Institucionales (SMART) + Conclusión */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              <div className="lg:col-span-8 rounded-2xl bg-[#0a0f1d] border border-slate-800 p-6 sm:p-8 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-slate-800/80 pb-4">
                  <div>
                    <p className="text-xs font-mono text-cyan-400">07. Metas Medibles</p>
                    <h3 className="text-xl sm:text-2xl font-black text-white font-tech mt-1 flex items-center gap-2.5">
                      <Target className="w-5 h-5 text-cyan-400" />
                      <span>Objetivos Institucionales (SMART)</span>
                    </h3>
                  </div>
                  <span className="text-xs font-mono text-slate-400">
                    Específicos · Medibles · Alcanzables
                  </span>
                </div>

                <div className="divide-y divide-slate-800/80">
                  {SMART_OBJECTIVES.map((obj) => (
                    <div
                      key={obj.index}
                      className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="flex items-start gap-3.5">
                        <span className="text-xs font-mono font-bold text-cyan-400 tabular-nums pt-0.5">
                          {obj.index}.
                        </span>
                        <p className="text-sm text-slate-200 leading-relaxed">{obj.statement}</p>
                      </div>
                      <div className="sm:text-right shrink-0 pl-7 sm:pl-4">
                        <div className="text-base font-black text-white font-tech tabular-nums">
                          {obj.kpi}
                        </div>
                        <div className="text-[11px] font-mono text-slate-400">{obj.horizon}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Conclusión del Proyecto */}
              <div className="lg:col-span-4 rounded-2xl bg-[#0a0f1d] border border-slate-800 p-6 sm:p-8 flex flex-col justify-between space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-cyan-400">08. Síntesis Ejecutiva</span>
                    <ShieldCheck className="w-5 h-5 text-cyan-400" />
                  </div>
                  <h3 className="text-xl font-black text-white font-tech">Conclusión</h3>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    Barber IA es un proyecto innovador que combina el arte de la barbería con la inteligencia artificial, ofreciendo un servicio moderno, personalizado y de alta calidad, con el objetivo de liderar el mercado y transformar la experiencia de cuidado personal.
                  </p>
                </div>

                <div className="space-y-4 pt-4 border-t border-slate-800/80">
                  <div className="text-xs text-slate-400">
                    BARBER IA · Estilo con inteligencia
                  </div>
                  <button
                    type="button"
                    onClick={onOpenBooking}
                    className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-600 hover:from-cyan-300 hover:to-blue-500 text-slate-950 font-black text-xs uppercase tracking-wider transition-all"
                  >
                    Agendar Experiencia Barber IA
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Lightbox Modal for Official Institutional Poster */}
      {posterModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setPosterModalOpen(false)}
        >
          <div
            className="relative max-w-5xl w-full bg-[#0a0f1d] border border-slate-700 rounded-2xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800">
              <div>
                <h4 className="text-sm font-bold text-white">
                  Infografía Institucional · BARBER IA (S.R.L.)
                </h4>
                <p className="text-xs text-slate-400">
                  Planificación estratégica, estructura organizacional y objetivos SMART
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPosterModalOpen(false)}
                className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                aria-label="Cerrar infografía"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 bg-[#05070d] max-h-[80vh] overflow-auto flex items-center justify-center">
              <img
                src="/assets/aistudio/WhatsApp_Image_2026-11-18_at_18.33.00_a17f6e57.jpeg"
                alt="Infografía institucional de BARBER IA con misión, visión, valores, aspectos administrativos, recursos y objetivos SMART"
                referrerPolicy="no-referrer"
                className="w-full h-auto rounded-lg object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
