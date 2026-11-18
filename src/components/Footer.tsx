import React from 'react';
import { 
  Scissors, 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  ShieldCheck, 
  Camera, 
  Lock, 
  Sparkles 
} from 'lucide-react';

interface FooterProps {
  onOpenFaceScanner: () => void;
  onOpenBooking: () => void;
  onOpenSecurity: () => void;
  onOpenAdminLogin: () => void;
  onOpenBarberLogin: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onOpenFaceScanner,
  onOpenBooking,
  onOpenSecurity,
  onOpenAdminLogin,
  onOpenBarberLogin,
}) => {
  return (
    <footer className="bg-[#05070d] text-slate-300 border-t border-cyan-500/20 pt-16 pb-12 relative overflow-hidden">
      
      {/* Background Cyber Glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-48 bg-cyan-600/10 blur-[140px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-800">
          
          {/* Col 1 & 2: Brand Information */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-xl overflow-hidden border-2 border-cyan-400 shadow-[0_0_15px_rgba(0,240,255,0.4)]">
                <img 
                  src="/assets/aistudio/WhatsApp_Image_2026-11-12_at_09.03.14_0a9180d3.jpeg" 
                  alt="BARBER IA Logo" 
                  className="w-full h-full object-cover scale-105"
                />
              </div>
              <div>
                <span className="text-2xl font-black text-white font-tech tracking-wider">
                  BARBER <span className="text-cyan-400 glow-text-cyan">IA</span>
                </span>
                <p className="text-[10px] tracking-widest text-slate-400 uppercase font-semibold">
                  Estilo • Tecnología • Precisión
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              La primera barbería impulsada por visión artificial y algoritmos morfológicos para garantizar una armonía facial milimétrica en cada corte y perfilado de barba.
            </p>

            {/* Security Badges */}
            <div className="flex flex-wrap gap-2 pt-2">
              <span className="text-[10px] bg-slate-900 border border-emerald-500/40 text-emerald-400 px-2.5 py-1 rounded-md font-mono flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                ISO 27001
              </span>
              <span className="text-[10px] bg-slate-900 border border-cyan-500/40 text-cyan-400 px-2.5 py-1 rounded-md font-mono flex items-center gap-1">
                <Lock className="w-3 h-3" />
                OWASP ASVS
              </span>
              <span className="text-[10px] bg-slate-900 border border-blue-500/40 text-blue-400 px-2.5 py-1 rounded-md font-mono">
                PCI-DSS Validated
              </span>
            </div>
          </div>

          {/* Col 3: Quick Navigation */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider">
              Plataforma
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a href="#paquetes" className="hover:text-cyan-400 transition-colors">
                  Paquetes de Corte
                </a>
              </li>
              <li>
                <a href="#estilos" className="hover:text-cyan-400 transition-colors">
                  Galería de Estilos IA
                </a>
              </li>
              <li>
                <a href="#barberos" className="hover:text-cyan-400 transition-colors">
                  Staff Master
                </a>
              </li>
              <li>
                <a href="#nosotros" className="hover:text-cyan-400 transition-colors">
                  Misión, Visión & Institucional
                </a>
              </li>
              <li>
                <button onClick={onOpenFaceScanner} className="hover:text-cyan-400 transition-colors text-left">
                  Escáner Facial Biométrico
                </button>
              </li>
              <li>
                <button onClick={onOpenBooking} className="hover:text-cyan-400 transition-colors text-left text-cyan-300 font-bold">
                  Agendar Turno en Línea
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Location & Hours */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider">
              Ubicación & Horarios
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li className="flex items-start space-x-2">
                <MapPin className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <span>Av. San Martín #450, Equipetrol, Santa Cruz de la Sierra</span>
              </li>
              <li className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>Lun - Sáb: 09:00 - 21:00 hs</span>
              </li>
              <li className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>Domingos: 10:00 - 18:00 hs</span>
              </li>
              <li className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>+591 7788-9900</span>
              </li>
              <li className="pt-1">
                <a
                  href="#contacto"
                  className="inline-flex items-center gap-1.5 text-cyan-400 hover:text-cyan-300 font-bold hover:underline"
                >
                  <MapPin className="w-3.5 h-3.5" />
                  <span>Ver Mapa, Ruta Más Rápida y Reseñas</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Col 5: Internal Portals */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider">
              Accesos Internos
            </h4>
            <div className="space-y-2 text-xs">
              <button
                onClick={onOpenBarberLogin}
                className="w-full text-left p-2 rounded-lg bg-slate-900 border border-slate-800 hover:border-blue-500 text-slate-300 hover:text-white transition-all flex items-center justify-between"
              >
                <span>Portal Barberos</span>
                <Scissors className="w-3.5 h-3.5 text-blue-400" />
              </button>

              <button
                onClick={onOpenAdminLogin}
                className="w-full text-left p-2 rounded-lg bg-slate-900 border border-slate-800 hover:border-purple-500 text-slate-300 hover:text-white transition-all flex items-center justify-between"
              >
                <span>Portal Administrador</span>
                <Lock className="w-3.5 h-3.5 text-purple-400" />
              </button>

              <button
                onClick={onOpenSecurity}
                className="w-full text-left p-2 rounded-lg bg-emerald-950/40 border border-emerald-500/30 hover:border-emerald-400 text-emerald-300 text-[11px] transition-all flex items-center justify-between"
              >
                <span>Auditoría & Cumplimiento</span>
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              </button>
            </div>
          </div>

        </div>

        {/* Bottom Rights */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 font-mono gap-4">
          <div>
            © 2026 BARBER IA • Estilo • Tecnología • Precisión. Todos los derechos reservados.
          </div>
          <div className="flex space-x-4">
            <button onClick={onOpenSecurity} className="hover:text-cyan-400 transition-colors">
              Política de Privacidad Biométrica
            </button>
            <span>•</span>
            <button onClick={onOpenSecurity} className="hover:text-cyan-400 transition-colors">
              Arquitectura ISO 42010
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
};
