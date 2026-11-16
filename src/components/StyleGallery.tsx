import React, { useState } from 'react';
import { 
  Sparkles, 
  Search, 
  ArrowRight, 
  CheckCircle, 
  Clock, 
  Camera,
  Scissors,
  X,
  Info,
  ShoppingBag,
  Calendar
} from 'lucide-react';
import { CutStyleItem, ClientProfile } from '../types';
import { STYLES_CATALOG } from '../services/store';

interface StyleGalleryProps {
  activeClient: ClientProfile | null;
  onSelectStyleForBooking: (styleName: string) => void;
  onOpenFaceScanner: () => void;
}

const FACE_SHAPE_LABELS: Record<string, string> = {
  oval: 'Ovalado',
  square: 'Cuadrado',
  diamond: 'Diamante',
  round: 'Redondo',
  oblong: 'Alargado / Oblongo',
  heart: 'Corazón',
};

export const StyleGallery: React.FC<StyleGalleryProps> = ({
  activeClient,
  onSelectStyleForBooking,
  onOpenFaceScanner,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedStyleModal, setSelectedStyleModal] = useState<CutStyleItem | null>(null);

  const clientFaceShape = activeClient?.faceBiometrics?.faceShape || null;

  const filteredStyles = STYLES_CATALOG.filter((style) => {
    const matchesCategory = selectedCategory === 'all' || style.category === selectedCategory;
    const matchesQuery =
      style.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      style.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      style.clipperGuards.toLowerCase().includes(searchQuery.toLowerCase());
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
              <span>Galería de Estilos & Enciclopedia Técnica</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white uppercase font-tech tracking-tight">
              CATÁLOGO DE <span className="text-cyan-400 glow-text-cyan">TENDENCIAS IA</span>
            </h2>
            <p className="text-slate-400 text-sm max-w-xl mt-2">
              Información técnica completa de cada corte: números de peines guía, tipos de cabello, frecuencia de mantenimiento, guía de peinado y compatibilidad facial.
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
                    Rostro Detectado: {FACE_SHAPE_LABELS[activeClient.faceBiometrics.faceShape] || activeClient.faceBiometrics.faceShape.toUpperCase()}
                  </div>
                  <div className="text-xs text-slate-300">
                    {activeClient.preferredStyle ? (
                      <span>Estilo guardado: <strong className="text-white">{activeClient.preferredStyle}</strong></span>
                    ) : (
                      'Compatibilidad personalizada activa'
                    )}
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-slate-400">
                  <Camera className="w-5 h-5 text-cyan-400" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-200">¿Quieres probar un corte en tu cara?</div>
                  <button
                    onClick={onOpenFaceScanner}
                    className="text-xs text-cyan-400 hover:underline font-bold"
                  >
                    Escanear rostro e implementar estilo &rarr;
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
            {[
              { id: 'all', label: 'Todos los Estilos' },
              { id: 'fade', label: 'Fades & Degradados' },
              { id: 'modern', label: 'Modernos & Textura' },
              { id: 'beard', label: 'Corte + Barba' },
              { id: 'cyberpunk', label: 'Vanguardia Cyber' },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-cyan-500 text-slate-950 shadow-[0_0_12px_rgba(0,240,255,0.4)]'
                    : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar corte, guía o estilo..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-900/90 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-cyan-500 transition-colors"
            />
          </div>
        </div>

        {/* Styles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStyles.map((style) => {
            const isHighlyCompatible = clientFaceShape 
              ? style.popularWithFaceShapes.includes(clientFaceShape)
              : style.trendingScore >= 94;
            const matchPercentage = isHighlyCompatible ? 98 : 87;

            return (
              <div
                key={style.id}
                className="group rounded-2xl bg-[#0a0f1c] border border-slate-800 hover:border-cyan-500/60 overflow-hidden transition-all duration-300 hover:shadow-[0_0_25px_rgba(0,240,255,0.2)] flex flex-col justify-between"
              >
                <div>
                  {/* Image with overlay tags */}
                  <div
                    onClick={() => setSelectedStyleModal(style)}
                    className="relative aspect-[4/3] overflow-hidden bg-slate-900 cursor-pointer"
                  >
                    <img 
                      src={style.imageUrl} 
                      alt={style.name} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0a0f1c] via-transparent to-transparent"></div>

                    {/* Compatibility Badge */}
                    <div className="absolute top-3 left-3 bg-[#070b14]/90 backdrop-blur-md border border-cyan-500/40 px-2.5 py-1 rounded-lg flex items-center space-x-1.5 text-xs font-mono text-cyan-300">
                      <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                      <span className="font-bold">
                        {matchPercentage}% {clientFaceShape ? 'Tu Rostro' : 'Match IA'}
                      </span>
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
                    <h3
                      onClick={() => setSelectedStyleModal(style)}
                      className="text-lg font-black text-white font-tech group-hover:text-cyan-400 transition-colors cursor-pointer"
                    >
                      {style.name}
                    </h3>
                    <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                      {style.description}
                    </p>

                    {/* Quick Technical Clipper Summary */}
                    <div className="mt-3 p-2.5 rounded-xl bg-slate-950/90 border border-slate-800/80 text-[11px] font-mono space-y-1">
                      <div className="text-cyan-400 font-bold flex items-center gap-1.5">
                        <Scissors className="w-3 h-3" />
                        <span>Especificación de Máquina:</span>
                      </div>
                      <div className="text-slate-300 leading-snug">{style.clipperGuards}</div>
                      <div className="text-emerald-400 text-[10px]">Retoque sugerido: {style.maintenanceCycle}</div>
                    </div>

                    {/* Suitable for tags */}
                    <div className="mt-3 flex flex-wrap gap-1.5">
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

                {/* Card Footer Actions */}
                <div className="p-5 pt-0 flex items-center gap-2">
                  <button
                    onClick={() => setSelectedStyleModal(style)}
                    className="px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 hover:border-cyan-400 text-slate-300 hover:text-white text-xs font-bold flex items-center gap-1.5 transition-all"
                    title="Ver guía completa del corte"
                  >
                    <Info className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Ficha Técnica</span>
                  </button>

                  <button
                    onClick={() => onSelectStyleForBooking(style.name)}
                    className="flex-1 py-2.5 rounded-xl bg-cyan-950/70 hover:bg-cyan-500 border border-cyan-500/40 hover:border-cyan-400 text-cyan-300 hover:text-slate-950 font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center space-x-1.5"
                  >
                    <span>Agendar</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

              </div>
            );
          })}
        </div>

        {/* Full Cut Technical Guide Modal */}
        {selectedStyleModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
            <div className="relative w-full max-w-2xl bg-[#090d18] border-2 border-cyan-500/50 rounded-2xl overflow-hidden shadow-[0_0_50px_rgba(0,240,255,0.25)] my-auto animate-in zoom-in-95">
              <div className="relative h-56 bg-slate-950">
                <img
                  src={selectedStyleModal.imageUrl}
                  alt={selectedStyleModal.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#090d18] via-[#090d18]/40 to-transparent" />
                <button
                  onClick={() => setSelectedStyleModal(null)}
                  className="absolute top-4 right-4 p-2 rounded-xl bg-black/70 text-slate-200 hover:text-white border border-slate-700"
                >
                  <X className="w-5 h-5" />
                </button>
                <div className="absolute bottom-4 left-6 right-6">
                  <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 mb-1">
                    <span>NIVEL: {selectedStyleModal.difficulty}</span>
                    <span>•</span>
                    <span>DURACIÓN: {selectedStyleModal.estimatedTime}</span>
                  </div>
                  <h3 className="text-2xl font-black text-white font-tech">
                    {selectedStyleModal.name}
                  </h3>
                </div>
              </div>

              <div className="p-6 space-y-4 text-xs">
                <p className="text-slate-300 leading-relaxed text-sm">
                  {selectedStyleModal.description}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono">
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                    <div className="text-cyan-400 font-bold uppercase text-[11px]">Peines Guía & Máquina</div>
                    <div className="text-slate-200">{selectedStyleModal.clipperGuards}</div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                    <div className="text-emerald-400 font-bold uppercase text-[11px]">Ciclo de Mantenimiento</div>
                    <div className="text-slate-200">{selectedStyleModal.maintenanceCycle}</div>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
                  <div className="text-[11px] font-mono text-cyan-400 font-bold uppercase">
                    Guía de Peinado Diario (Paso a Paso)
                  </div>
                  <p className="text-slate-200 leading-relaxed">{selectedStyleModal.stylingGuide}</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                    <div className="text-[11px] font-mono text-slate-400 uppercase font-bold">Tipos de Cabello Aptos</div>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedStyleModal.hairTypes.map((ht, i) => (
                        <span key={i} className="px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-cyan-300 font-mono text-[11px]">
                          {ht}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                    <div className="text-[11px] font-mono text-slate-400 uppercase font-bold flex items-center gap-1">
                      <ShoppingBag className="w-3.5 h-3.5 text-cyan-400" />
                      Productos Recomendados (Bs)
                    </div>
                    <div className="space-y-1">
                      {selectedStyleModal.recommendedProducts.map((prod, i) => (
                        <div key={i} className="text-emerald-300 font-mono text-[11px]">• {prod}</div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3 pt-2 border-t border-slate-800">
                  <button
                    onClick={() => {
                      setSelectedStyleModal(null);
                      onOpenFaceScanner();
                    }}
                    className="px-4 py-3 rounded-xl bg-slate-900 border border-cyan-500/40 hover:border-cyan-400 text-cyan-300 font-bold text-xs flex items-center gap-1.5"
                  >
                    <Camera className="w-4 h-4" />
                    <span>Probar en Mi Rostro con IA</span>
                  </button>

                  <button
                    onClick={() => {
                      const styleName = selectedStyleModal.name;
                      setSelectedStyleModal(null);
                      onSelectStyleForBooking(styleName);
                    }}
                    className="flex-1 py-3 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-600 hover:from-cyan-300 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg"
                  >
                    <Calendar className="w-4 h-4" />
                    <span>Agendar Este Corte Ahora</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </section>
  );
};

