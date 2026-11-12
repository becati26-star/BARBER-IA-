import React from 'react';
import { Camera, Calendar, ShieldCheck, Sparkles, CheckCircle, ArrowRight, Zap, Cpu } from 'lucide-react';

interface HeroProps {
  onOpenFaceScanner: (mode: 'analysis' | 'auth') => void;
  onOpenBooking: () => void;
  onOpenAuth: () => void;
}

export const Hero: React.FC<HeroProps> = ({
  onOpenFaceScanner,
  onOpenBooking,
  onOpenAuth,
}) => {
  return (
    <div className="relative overflow-hidden pt-8 pb-16 lg:pt-14 lg:pb-24">
      {/* Background Cyber Glow & Grid Lines */}
      <div className="absolute inset-0 pointer-events-none opacity-25">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-gradient-to-tr from-cyan-600/30 via-blue-600/20 to-transparent blur-[120px] rounded-full"></div>
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500/40 to-transparent"></div>
        <div 
          className="w-full h-full"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(0, 240, 255, 0.08) 1px, transparent 0)`,
            backgroundSize: '40px 40px',
          }}
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Top Operational Pill */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex items-center space-x-2.5 px-4 py-1.5 rounded-full bg-slate-900/90 border border-cyan-500/40 shadow-[0_0_20px_rgba(0,240,255,0.2)]">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-mono font-bold tracking-wider text-cyan-300 uppercase">
              SISTEMA BARBER IA EN LÍNEA • RECONOCIMIENTO FACIAL 2.6
            </span>
            <span className="text-[10px] bg-cyan-950 text-cyan-400 px-2 py-0.5 rounded border border-cyan-500/30 font-mono">
              ISO 27001
            </span>
          </div>
        </div>

        {/* Main Grid: Content + Cyber Visual Emblem */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Heading and CTAs */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white uppercase font-tech leading-[1.1]">
              LA EVOLUCIÓN DEL ESTILO <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-500 glow-text-cyan">
                CON INTELIGENCIA ARTIFICIAL
              </span>
            </h1>

            <p className="text-slate-300 text-base sm:text-lg max-w-2xl mx-auto lg:mx-0 font-normal leading-relaxed">
              Descubre tu corte ideal con nuestro motor biométrico facial. Análisis morfológico de cráneo, mandíbula y tono de piel en segundos. Agenda tu cita con maestros barberos y gestiona tus turnos en tiempo real con pasarela de pago segura.
            </p>

            {/* Quick Benefits Bullet List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs sm:text-sm text-slate-300">
              <div className="flex items-center space-x-2 bg-slate-900/60 border border-slate-800 p-2.5 rounded-xl">
                <CheckCircle className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>Reconocimiento facial biométrico con webcam</span>
              </div>
              <div className="flex items-center space-x-2 bg-slate-900/60 border border-slate-800 p-2.5 rounded-xl">
                <CheckCircle className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>Asesor de corte y coloración personalizada</span>
              </div>
              <div className="flex items-center space-x-2 bg-slate-900/60 border border-slate-800 p-2.5 rounded-xl">
                <CheckCircle className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>Agendamiento en tiempo real con pasarela</span>
              </div>
              <div className="flex items-center space-x-2 bg-slate-900/60 border border-slate-800 p-2.5 rounded-xl">
                <CheckCircle className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>Cifrado y privacidad ISO 27001 & OWASP</span>
              </div>
            </div>

            {/* Primary Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-4">
              <button
                onClick={() => onOpenFaceScanner('analysis')}
                className="w-full sm:w-auto flex items-center justify-center space-x-3 px-6 py-4 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-600 hover:from-cyan-300 hover:to-blue-500 text-slate-950 font-black text-sm uppercase tracking-wider transition-all shadow-[0_0_30px_rgba(0,240,255,0.4)] active:scale-95 group"
              >
                <Camera className="w-5 h-5 text-slate-950 group-hover:scale-110 transition-transform" />
                <span>Escanear Rostro con IA</span>
                <ArrowRight className="w-4 h-4 text-slate-950 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={onOpenBooking}
                className="w-full sm:w-auto flex items-center justify-center space-x-2.5 px-6 py-4 rounded-xl bg-slate-900/90 hover:bg-slate-800 border-2 border-cyan-500/40 hover:border-cyan-400 text-cyan-300 font-bold text-sm tracking-wide transition-all shadow-lg active:scale-95"
              >
                <Calendar className="w-5 h-5 text-cyan-400" />
                <span>Agendar Cita en Línea</span>
              </button>
            </div>

            {/* Face ID Quick Link */}
            <div className="pt-2 flex items-center justify-center lg:justify-start space-x-2 text-xs text-slate-400">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>¿Ya registraste tu rostro?</span>
              <button
                onClick={() => onOpenFaceScanner('auth')}
                className="text-cyan-400 hover:underline font-bold"
              >
                Ingresar con Face ID Biométrico
              </button>
            </div>

          </div>

          {/* Right Column: Hero Visual Showcase */}
          <div className="lg:col-span-5 flex justify-center relative">
            
            {/* Cyber Frame Glow Card */}
            <div className="relative w-full max-w-md">
              
              {/* Animated Barber Pole Accent Lines on Side */}
              <div className="absolute -left-3 top-6 bottom-6 w-1.5 rounded-full barber-pole-stripes shadow-[0_0_10px_rgba(239,68,68,0.5)]"></div>
              <div className="absolute -right-3 top-6 bottom-6 w-1.5 rounded-full barber-pole-stripes shadow-[0_0_10px_rgba(0,153,255,0.5)]"></div>

              {/* Central Logo Container */}
              <div className="relative rounded-2xl bg-[#090e1a] border-2 border-cyan-500/50 p-3 shadow-[0_0_50px_rgba(0,240,255,0.25)] overflow-hidden">
                
                {/* HUD Corner Tech Accents */}
                <div className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-cyan-400"></div>
                <div className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-cyan-400"></div>
                <div className="absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 border-cyan-400"></div>
                <div className="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-cyan-400"></div>

                <div className="relative rounded-xl overflow-hidden bg-black/90 aspect-[4/3] flex items-center justify-center">
                  <img 
                    src="/assets/aistudio/WhatsApp_Image_2026-11-12_at_09.03.14_0a9180d3.jpeg" 
                    alt="BARBER IA - Estilo, Tecnología y Precisión"
                    className="w-full h-full object-contain hover:scale-105 transition-transform duration-500"
                  />
                  
                  {/* Floating AI Diagnostic Tag */}
                  <div className="absolute bottom-3 left-3 right-3 bg-[#080d1a]/90 backdrop-blur-md border border-cyan-500/40 rounded-xl p-2.5 flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-2">
                      <Cpu className="w-4 h-4 text-cyan-400 animate-pulse" />
                      <div>
                        <div className="font-bold text-slate-100 text-[11px]">Motor Biométrico Activo</div>
                        <div className="text-[10px] text-cyan-300 font-mono">Detección de ángulos 3D</div>
                      </div>
                    </div>
                    <span className="text-[10px] bg-cyan-950 border border-cyan-400 text-cyan-300 font-mono px-2 py-0.5 rounded font-bold">
                      99.8% PRECISION
                    </span>
                  </div>
                </div>

                {/* Sub-card features preview */}
                <div className="mt-3 p-3 bg-slate-900/80 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 font-bold font-mono">
                      IA
                    </div>
                    <div>
                      <div className="font-bold text-slate-200">Recomendación Morfológica</div>
                      <div className="text-[10px] text-slate-400">Corte & Barba según facciones</div>
                    </div>
                  </div>
                  <button
                    onClick={() => onOpenFaceScanner('analysis')}
                    className="text-cyan-400 hover:text-cyan-300 font-bold text-xs uppercase underline tracking-wider"
                  >
                    Probar
                  </button>
                </div>

              </div>

            </div>

          </div>

        </div>

        {/* Live Metrics Counter Bar */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-2xl bg-[#090d18]/80 border border-cyan-500/30 backdrop-blur-md">
          <div className="text-center p-3 border-r border-slate-800 last:border-0">
            <div className="text-2xl sm:text-3xl font-black text-cyan-400 font-tech">1,450+</div>
            <div className="text-xs text-slate-400 font-medium mt-0.5">Cortes Realizados con IA</div>
          </div>
          <div className="text-center p-3 border-r border-slate-800 last:border-0">
            <div className="text-2xl sm:text-3xl font-black text-white font-tech">99.8%</div>
            <div className="text-xs text-slate-400 font-medium mt-0.5">Satisfacción Biométrica</div>
          </div>
          <div className="text-center p-3 border-r border-slate-800 last:border-0">
            <div className="text-2xl sm:text-3xl font-black text-cyan-400 font-tech">4 Masters</div>
            <div className="text-xs text-slate-400 font-medium mt-0.5">Barberos Especialistas</div>
          </div>
          <div className="text-center p-3">
            <div className="text-2xl sm:text-3xl font-black text-emerald-400 font-tech">0 Min</div>
            <div className="text-xs text-slate-400 font-medium mt-0.5">Tiempo de Espera con Cita</div>
          </div>
        </div>

      </div>
    </div>
  );
};
