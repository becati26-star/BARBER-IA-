import React, { useState } from 'react';
import { 
  Scissors, 
  Check, 
  Sparkles, 
  Clock, 
  ShieldCheck, 
  ArrowRight,
  Flame,
  Zap
} from 'lucide-react';
import { BarberServicePackage } from '../types';
import { INITIAL_PACKAGES } from '../services/store';

interface PackagesSectionProps {
  onSelectPackageForBooking: (pkg: BarberServicePackage) => void;
  onOpenFaceScanner: () => void;
}

export const PackagesSection: React.FC<PackagesSectionProps> = ({
  onSelectPackageForBooking,
  onOpenFaceScanner,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = [
    { id: 'all', label: 'Todos los Paquetes' },
    { id: 'precision', label: 'Precisión & Fade' },
    { id: 'vip', label: 'Barba VIP' },
    { id: 'color', label: 'Coloración IA' },
    { id: 'spa', label: 'Spa Facial Ozono' },
  ];

  const filteredPackages = selectedCategory === 'all' 
    ? INITIAL_PACKAGES 
    : INITIAL_PACKAGES.filter(p => p.category === selectedCategory || (selectedCategory === 'vip' && p.category === 'combo'));

  return (
    <section id="paquetes" className="py-20 bg-[#060810] relative">
      
      {/* Background Cyber Accents */}
      <div className="absolute top-1/2 left-0 w-96 h-96 bg-cyan-600/10 blur-[130px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-10 right-0 w-96 h-96 bg-blue-600/10 blur-[130px] rounded-full pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-950 border border-cyan-500/40 text-cyan-300 text-xs font-mono font-bold uppercase tracking-wider mb-3">
            <Scissors className="w-3.5 h-3.5" />
            <span>Menú de Servicios de Vanguardia</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white uppercase font-tech tracking-tight">
            PAQUETES DE CORTE <span className="text-cyan-400 glow-text-cyan">& BARBA</span>
          </h2>
          <p className="text-slate-400 text-sm sm:text-base mt-3">
            Cada paquete integra el diagnóstico morfológico de BARBER IA para asegurar que la longitud, el desvanecido y la simetría armonicen con tus facciones.
          </p>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-8">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-cyan-500 text-slate-950 shadow-[0_0_15px_rgba(0,240,255,0.4)]'
                    : 'bg-slate-900/90 text-slate-300 border border-slate-800 hover:border-cyan-500/40 hover:text-white'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Packages Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredPackages.map((pkg) => (
            <div
              key={pkg.id}
              className="group relative rounded-2xl bg-[#090e1a] border border-cyan-500/30 hover:border-cyan-400 p-6 flex flex-col justify-between transition-all duration-300 hover:shadow-[0_0_30px_rgba(0,240,255,0.2)] hover:-translate-y-1"
            >
              {/* Badge if exists */}
              {pkg.badge && (
                <div className="absolute -top-3 right-6 bg-gradient-to-r from-cyan-400 to-blue-600 text-slate-950 text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full shadow-md">
                  {pkg.badge}
                </div>
              )}

              <div>
                {/* Image Cover */}
                <div className="relative rounded-xl overflow-hidden aspect-[16/9] mb-4 bg-slate-900 border border-slate-800">
                  <img 
                    src={pkg.image} 
                    alt={pkg.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#090e1a] via-transparent to-transparent"></div>
                  
                  <div className="absolute bottom-2 left-2 flex items-center space-x-1.5 bg-black/70 backdrop-blur-sm px-2 py-1 rounded-md text-[11px] font-mono text-cyan-300">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{pkg.durationMinutes} min</span>
                  </div>
                </div>

                {/* Title & Tagline */}
                <h3 className="text-xl font-black text-white font-tech group-hover:text-cyan-400 transition-colors">
                  {pkg.title}
                </h3>
                <p className="text-xs text-slate-400 mt-1 min-h-[36px]">
                  {pkg.tagline}
                </p>

                {/* Price Display */}
                <div className="my-4 pb-4 border-b border-slate-800/80 flex items-baseline space-x-2">
                  <span className="text-3xl font-black text-white font-tech">
                    ${pkg.price}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">USD / Efectivo o Tarjeta</span>
                </div>

                {/* Features list */}
                <ul className="space-y-2.5 text-xs text-slate-300">
                  {pkg.features.map((feat, i) => (
                    <li key={i} className="flex items-start space-x-2">
                      <div className="w-4 h-4 rounded-full bg-cyan-950 border border-cyan-500/50 flex items-center justify-center shrink-0 mt-0.5 text-cyan-400">
                        <Check className="w-2.5 h-2.5" />
                      </div>
                      <span className="leading-tight">{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 pt-4 border-t border-slate-800 space-y-2">
                <button
                  onClick={() => onSelectPackageForBooking(pkg)}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-600 hover:from-cyan-300 hover:to-blue-500 text-slate-950 font-black text-xs uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(0,240,255,0.3)] flex items-center justify-center space-x-2"
                >
                  <span>Reservar Este Paquete</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={onOpenFaceScanner}
                  className="w-full py-2 rounded-xl bg-slate-950 hover:bg-slate-900 border border-slate-800 text-cyan-400 hover:text-cyan-300 font-mono text-[11px] transition-colors flex items-center justify-center space-x-1.5"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>Verificar compatibilidad con mi rostro</span>
                </button>
              </div>

            </div>
          ))}
        </div>

        {/* Guarantee Banner */}
        <div className="mt-16 p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-cyan-950/40 to-slate-900 border border-cyan-500/30 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/20 border border-cyan-500/50 flex items-center justify-center text-cyan-400 shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-base font-bold text-white font-tech">Garantía de Simetría & Satisfacción 100%</h4>
              <p className="text-xs text-slate-400">
                Si el corte o perfilado no coincide con el diseño biométrico simulado, nuestro Master Barber retoca sin costo adicional.
              </p>
            </div>
          </div>

          <button
            onClick={onOpenFaceScanner}
            className="px-5 py-2.5 rounded-xl bg-cyan-500/20 border border-cyan-400 text-cyan-300 hover:bg-cyan-500 hover:text-slate-950 text-xs font-bold font-mono transition-all uppercase tracking-wider shrink-0"
          >
            Escanear Mi Rostro Primero
          </button>
        </div>

      </div>
    </section>
  );
};
