import React, { useState } from 'react';
import { 
  ShieldCheck, 
  X, 
  Lock, 
  CheckCircle, 
  Terminal, 
  Cpu, 
  Layers, 
  Server, 
  Eye, 
  Database,
  Fingerprint
} from 'lucide-react';
import { securityService } from '../services/security';

interface SecurityComplianceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SecurityComplianceModal: React.FC<SecurityComplianceModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'iso27001' | 'owasp' | 'iso42010' | 'solid'>('iso27001');
  const auditLogs = securityService.getAuditLogs();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-[#090d18] border-2 border-emerald-500/40 rounded-2xl shadow-[0_0_60px_rgba(16,185,129,0.25)] overflow-hidden my-auto animate-in fade-in zoom-in-95">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 border-b border-emerald-500/30">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-emerald-950 border border-emerald-500 text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-black text-white uppercase font-tech">
                  Centro de Cumplimiento & Arquitectura
                </h3>
                <span className="text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded font-mono font-bold">
                  VERIFICADO
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Auditoría ISO 27001, OWASP Top 10, OSINT Hardening, ISO 42010 y SOLID
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="grid grid-cols-4 bg-slate-950 border-b border-slate-800 text-xs font-mono font-bold">
          <button
            onClick={() => setActiveTab('iso27001')}
            className={`py-3 transition-colors ${activeTab === 'iso27001' ? 'bg-emerald-950/60 text-emerald-400 border-b-2 border-emerald-400' : 'text-slate-400 hover:text-white'}`}
          >
            ISO 27001 & Biometría
          </button>
          <button
            onClick={() => setActiveTab('owasp')}
            className={`py-3 transition-colors ${activeTab === 'owasp' ? 'bg-emerald-950/60 text-emerald-400 border-b-2 border-emerald-400' : 'text-slate-400 hover:text-white'}`}
          >
            OWASP & OSINT
          </button>
          <button
            onClick={() => setActiveTab('iso42010')}
            className={`py-3 transition-colors ${activeTab === 'iso42010' ? 'bg-emerald-950/60 text-emerald-400 border-b-2 border-emerald-400' : 'text-slate-400 hover:text-white'}`}
          >
            ISO 42010 Arquitectura
          </button>
          <button
            onClick={() => setActiveTab('solid')}
            className={`py-3 transition-colors ${activeTab === 'solid' ? 'bg-emerald-950/60 text-emerald-400 border-b-2 border-emerald-400' : 'text-slate-400 hover:text-white'}`}
          >
            Principios SOLID & CX
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 max-h-[70vh] overflow-y-auto space-y-4 text-xs leading-relaxed">
          
          {/* Tab 1: ISO 27001 */}
          {activeTab === 'iso27001' && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                <div className="font-bold text-white text-sm flex items-center gap-2">
                  <Fingerprint className="w-4 h-4 text-emerald-400" />
                  Privacidad y Protección Biométrica (ISO/IEC 27001 & ISO/IEC 24745)
                </div>
                <p className="text-slate-300">
                  La cámara web genera un mapa vectorial de 68 puntos faciales en memoria volátil del navegador. Dicho mapa se convierte inmediatamente en un hash criptográfico salteado con SHA-256 no reversible.
                </p>
                <div className="p-2.5 bg-slate-900 rounded font-mono text-[11px] text-emerald-300">
                  Fórmula: Hash = SHA256(Vector_Morfologico + BARBER_IA_SECURE_SALT_2026)
                </div>
                <p className="text-slate-400 text-[11px]">
                  <strong>Regla de cero almacenamiento de imagen cruda:</strong> Ninguna fotografía del usuario es almacenada en bases de datos persistentes sin consentimiento expreso.
                </p>
              </div>

              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                <div className="font-bold text-white text-sm flex items-center gap-2">
                  <Lock className="w-4 h-4 text-emerald-400" />
                  Control A.12.4: Registro y Auditoría de Acciones Críticas
                </div>
                <p className="text-slate-300">
                  Todos los intentos de login (Face ID, credenciales o redes sociales) y transacciones de reservas quedan asentados en el registro inmutable de auditoría para trazabilidad forense.
                </p>
              </div>
            </div>
          )}

          {/* Tab 2: OWASP & OSINT */}
          {activeTab === 'owasp' && (
            <div className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-emerald-400 font-mono font-bold">OWASP A01: Control de Acceso</span>
                  <p className="text-slate-300 mt-1">
                    Separación estricta entre roles: Clientes solo ven sus reservas; Barberos solo administran su silla asignada; Super Admin posee control total.
                  </p>
                </div>

                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-emerald-400 font-mono font-bold">OWASP A03: Defensa contra Inyección</span>
                  <p className="text-slate-300 mt-1">
                    Sanitización integral de strings en nombres, notas y teléfonos antes de la persistencia o consulta en backend.
                  </p>
                </div>

                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-emerald-400 font-mono font-bold">OWASP A07: Identificación & 2FA</span>
                  <p className="text-slate-300 mt-1">
                    Doble factor de autenticación simulado para el administrador, protección contra ataques de fuerza bruta y Face ID con comprobación viva.
                  </p>
                </div>

                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-emerald-400 font-mono font-bold">OSINT Hardening</span>
                  <p className="text-slate-300 mt-1">
                    Ofuscación de correos personales y números telefónicos en vistas públicas para prevenir recolección no autorizada de datos de fuentes abiertas.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: ISO 42010 Architecture */}
          {activeTab === 'iso42010' && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                <div className="font-bold text-white text-sm flex items-center gap-2">
                  <Layers className="w-4 h-4 text-emerald-400" />
                  Descripción Arquitectónica Formal (ISO/IEC/IEEE 42010:2011)
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 font-mono text-[11px]">
                  <div className="p-2.5 bg-slate-900 rounded border border-slate-800">
                    <strong className="text-cyan-400">1. Vista de Presentación</strong>
                    <div className="text-slate-400 mt-1">React 19 + Tailwind v4 + Motion para HUD biométrico y transiciones.</div>
                  </div>
                  <div className="p-2.5 bg-slate-900 rounded border border-slate-800">
                    <strong className="text-cyan-400">2. Vista de Lógica & IA</strong>
                    <div className="text-slate-400 mt-1">Express API Server + SDK @google/genai con Gemini 3.8 Flash.</div>
                  </div>
                  <div className="p-2.5 bg-slate-900 rounded border border-slate-800">
                    <strong className="text-cyan-400">3. Vista de Datos</strong>
                    <div className="text-slate-400 mt-1">Almacenamiento reactivo en nube con persistencia local y sincronización.</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 4: SOLID & CX/UX */}
          {activeTab === 'solid' && (
            <div className="space-y-3">
              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                <div className="font-bold text-white text-sm flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-emerald-400" />
                  Principios SOLID en el Código Fuente
                </div>
                <ul className="space-y-1.5 text-slate-300 font-mono text-[11px]">
                  <li>• <strong className="text-cyan-400">Single Responsibility (SRP):</strong> Módulos separados para biometría, seguridad, turnos y persistencia.</li>
                  <li>• <strong className="text-cyan-400">Open/Closed (OCP):</strong> El catálogo de paquetes y estilos es extensible sin modificar componentes base.</li>
                  <li>• <strong className="text-cyan-400">Liskov Substitution (LSP):</strong> Todos los perfiles de usuario cumplen con los contratos de autenticación.</li>
                  <li>• <strong className="text-cyan-400">Interface Segregation (ISP):</strong> Interfaces TypeScript específicas en <code>types/index.ts</code>.</li>
                  <li>• <strong className="text-cyan-400">Dependency Inversion (DIP):</strong> Consumo de servicios abstractos inyectables.</li>
                </ul>
              </div>

              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                <div className="font-bold text-white text-sm">Principios CX, UX & UI</div>
                <p className="text-slate-300">
                  Experiencia futurista inmersiva sin fricción: Escaneo facial en 3 segundos, retroalimentación holográfica en pantalla, paleta corporativa coherente con el logotipo y microinteracciones de alta precisión.
                </p>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-900 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition-all"
          >
            Cerrar Especificaciones
          </button>
        </div>

      </div>
    </div>
  );
};
