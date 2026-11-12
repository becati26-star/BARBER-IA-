import React, { useState } from 'react';
import { 
  Sparkles, 
  Search, 
  Filter, 
  ArrowRight, 
  CheckCircle, 
  Clock, 
  Zap, 
  Star,
  Camera
} from 'lucide-react';
import { CutStyleItem, ClientProfile } from '../types';
import { STYLES_CATALOG } from '../services/store';

interface StyleGalleryProps {
  activeClient: ClientProfile | null;
  onSelectStyleForBooking: (styleName: string) => void;
  onOpenFaceScanner: () => void;
}

export const StyleGallery: React.FC<StyleGalleryProps> = ({
  activeClient,
  onSelectStyleForBooking,
  onOpenFaceScanner,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const clientFaceShape = activeClient?.faceBiometrics?.faceShape || null;

  const filteredStyles = STYLES_CATALOG.filter((style) => {
    const matchesCategory = selectedCategory === 'all' || style.category === selectedCategory;
    const matchesQuery = style.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         style.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesQuery;
  });

  return (
    <section id="estilos" className="py-20 bg-[#070b14] relative border-t border-cyan-500/20">
      
      {/* Background Cyber Texture */}
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#00f0ff_1px,transparent_1px)] [background-size:32px_32px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-950 border border-cyan-500/40 text-cyan-300 text-xs font-mono font-bold uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Galería de Estilos Personalizada</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white uppercase font-tech tracking-tight">
              CATÁLOGO DE <span className="text-cyan-400 glow-text-cyan">TENDENCIAS IA</span>
            </h2>
            <p className="text-slate-400 text-sm max-w-xl mt-2">
              Explora los cortes vanguardistas más solicitados. El algoritmo calcula la compatibilidad según la simetría de tus facciones.
            </p>
          </div>

          {/* Client Face Status Banner */}
          <div className="p-4 rounded-xl bg-slate-900/90 border border-cyan-500/40 flex items-center space-x-3 shrink-0">
            {activeClient?.faceBiometrics ? (
              <>
                <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500 flex items-center justify-center text-cyan-400">
                  <CheckCircle className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-mono text-cyan-400 font-bold uppercase">
                    Rostro Detectado: {activeClient.faceBiometrics.faceShape.toUpperCase()}
                  </div>
                  <div className="text-xs text-slate-300">
                    Compatibilidad personalizada activa
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-slate-400">
                  <Camera className="w-5 h-5 text-cyan-400" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-200">¿Quieres ver qué estilo te queda mejor?</div>
                  <button
                    onClick={onOpenFaceScanner}
                    className="text-xs text-cyan-400 hover:underline font-bold"
                  >
                    Escanear tu rostro ahora &rarr;
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
            {['all', 'fade', 'modern', 'beard', 'cyberpunk'].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all capitalize ${
                  selectedCategory === cat
                    ? 'bg-cyan-500 text-slate-950 shadow-[0_0_12px_rgba(0,240,255,0.4)]'
                    : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
                }`}
              >
                {cat === 'all' ? 'Todos los Estilos' : cat}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por estilo o corte..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-900/90 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-cyan-500 transition-colors"
            />
          </div>
        </div>

        {/* Styles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStyles.map((style) => {
            // Calculate simulated personalized compatibility
            const isHighlyCompatible = clientFaceShape 
              ? style.popularWithFaceShapes.includes(clientFaceShape)
              : style.trendingScore >= 94;
            const matchPercentage = isHighlyCompatible ? 97 : 88;

            return (
              <div
                key={style.id}
                className="group rounded-2xl bg-[#0a0f1c] border border-slate-800 hover:border-cyan-500/60 overflow-hidden transition-all duration-300 hover:shadow-[0_0_25px_rgba(0,240,255,0.2)] flex flex-col justify-between"
              >
                <div>
                  {/* Image with overlay tags */}
                  <div className="relative aspect-[4/3] overflow-hidden bg-slate-900">
                    <img 
                      src={style.imageUrl} 
                      alt={style.name} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0a0f1c] via-transparent to-transparent"></div>

                    {/* Compatibility Pill */}
                    <div className="absolute top-3 left-3 bg-[#070b14]/90 backdrop-blur-md border border-cyan-500/40 px-2.5 py-1 rounded-lg flex items-center space-x-1.5 text-xs font-mono text-cyan-300">
                      <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                      <span className="font-bold">{matchPercentage}% Match IA</span>
                    </div>

                    <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-md px-2 py-0.5 rounded text-[10px] font-mono text-slate-300">
                      {style.difficulty}
                    </div>

                    <div className="absolute bottom-2 right-3 flex items-center space-x-1 text-[11px] font-mono text-slate-300">
                      <Clock className="w-3.5 h-3.5 text-cyan-400" />
                      <span>{style.estimatedTime}</span>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-5">
                    <h3 className="text-lg font-black text-white font-tech group-hover:text-cyan-400 transition-colors">
                      {style.name}
                    </h3>
                    <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                      {style.description}
                    </p>

                    {/* Suitable for tags */}
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {style.suitability.map((tag, idx) => (
                        <span 
                          key={idx}
                          className="text-[10px] bg-slate-900 text-slate-300 border border-slate-800 px-2 py-0.5 rounded-md font-mono"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Card Footer Action */}
                <div className="p-5 pt-0">
                  <button
                    onClick={() => onSelectStyleForBooking(style.name)}
                    className="w-full py-2.5 rounded-xl bg-cyan-950/70 hover:bg-cyan-500 border border-cyan-500/40 hover:border-cyan-400 text-cyan-300 hover:text-slate-950 font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center space-x-1.5"
                  >
                    <span>Agendar con Este Estilo</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
