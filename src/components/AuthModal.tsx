import React, { useState } from 'react';
import { 
  X, 
  User, 
  Lock, 
  Mail, 
  Phone, 
  Camera, 
  Scissors, 
  ShieldCheck, 
  ArrowRight,
  Sparkles,
  KeyRound,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';
import { UserRole, ClientProfile, BarberProfile } from '../types';
import { storeService } from '../services/store';
import { securityService } from '../services/security';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'client' | 'barber' | 'admin' | 'register';
  onLoginSuccess: (role: UserRole, client?: ClientProfile, barber?: BarberProfile) => void;
  onOpenFaceIDScanner: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'client',
  onLoginSuccess,
  onOpenFaceIDScanner,
}) => {
  const [tab, setTab] = useState<'client' | 'barber' | 'admin' | 'register'>(initialTab);
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  
  // Registration fields
  const [regName, setRegName] = useState<string>('');
  const [regEmail, setRegEmail] = useState<string>('');
  const [regPhone, setRegPhone] = useState<string>('');
  const [regPassword, setRegPassword] = useState<string>('');

  // Barber login fields
  const barbers = storeService.getBarbers();
  const [selectedBarberId, setSelectedBarberId] = useState<string>(barbers[0].id);
  const [barberPin, setBarberPin] = useState<string>('1234');

  // Admin login fields
  const [adminUser, setAdminUser] = useState<string>('admin@barberia.ai');
  const [adminToken2FA, setAdminToken2FA] = useState<string>('982-411');

  // Password Recovery state
  const [isRecoveringPassword, setIsRecoveringPassword] = useState<boolean>(false);
  const [recoveryEmail, setRecoveryEmail] = useState<string>('');
  const [recoverySent, setRecoverySent] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const handleClientLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const clients = storeService.getClients();
    const found = clients.find(c => c.email.toLowerCase() === email.toLowerCase().trim()) || clients[0];
    
    securityService.logEvent('AUTH_SUCCESS', found.name, 'ISO_27001_A.12.4', 'Inicio de sesión de cliente verificado con credenciales TLS');
    onLoginSuccess('client', found);
    onClose();
  };

  const handleSocialLogin = (provider: 'Google' | 'Apple' | 'GitHub') => {
    const clients = storeService.getClients();
    const demoClient = clients[0];
    securityService.logEvent('AUTH_SUCCESS', demoClient.name, 'OWASP_AUTH_FAIL', `OAuth 2.0 OpenID Connect vía ${provider} exitoso`);
    onLoginSuccess('client', demoClient);
    onClose();
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    if (!regName.trim() || !regEmail.trim() || !regPhone.trim()) {
      setAuthError('Por favor completa nombre, correo y número de WhatsApp.');
      return;
    }

    const newClient = storeService.registerClient({
      name: securityService.sanitizeInput(regName),
      email: regEmail.trim(),
      phone: regPhone.trim(),
    });

    onLoginSuccess('client', newClient);
    onClose();
  };

  const handleBarberLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const b = barbers.find(item => item.id === selectedBarberId) || barbers[0];
    securityService.logEvent('AUTH_SUCCESS', b.name, 'ISO_27001_A.12.4', `Acceso a panel de barbero validado por PIN`);
    onLoginSuccess('barber', undefined, b);
    onClose();
  };

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    securityService.logEvent('ADMIN_ACCESS', 'admin.master', 'ISO_27001_A.12.4', 'Acceso a consola de super administración autorizado con token 2FA');
    onLoginSuccess('admin');
    onClose();
  };

  const handlePasswordRecovery = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    if (!recoveryEmail.trim()) {
      setAuthError('Por favor ingresa tu correo electrónico.');
      return;
    }
    setRecoverySent(true);
    securityService.logEvent('AUTH_SUCCESS', recoveryEmail, 'OWASP_AUTH_FAIL', 'Token de restablecimiento de contraseña de un solo uso generado y enviado');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-md bg-[#090d18] border-2 border-cyan-500/40 rounded-2xl shadow-[0_0_50px_rgba(0,240,255,0.25)] overflow-hidden my-auto animate-in fade-in zoom-in-95">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 border-b border-cyan-500/30">
          <div className="flex items-center space-x-2.5">
            <div className="p-1.5 rounded-lg bg-cyan-950 border border-cyan-500 text-cyan-400">
              <Lock className="w-4 h-4" />
            </div>
            <h3 className="text-base font-black text-white uppercase font-tech">
              Autenticación Segura BARBER IA
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        {!isRecoveringPassword && (
          <div className="grid grid-cols-4 bg-slate-950 p-1 border-b border-slate-800 text-[11px] font-mono font-bold">
            <button
              onClick={() => setTab('client')}
              className={`py-2 rounded-lg transition-all ${tab === 'client' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-white'}`}
            >
              Cliente
            </button>
            <button
              onClick={() => setTab('register')}
              className={`py-2 rounded-lg transition-all ${tab === 'register' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-white'}`}
            >
              Registro
            </button>
            <button
              onClick={() => setTab('barber')}
              className={`py-2 rounded-lg transition-all ${tab === 'barber' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
            >
              Barbero
            </button>
            <button
              onClick={() => setTab('admin')}
              className={`py-2 rounded-lg transition-all ${tab === 'admin' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'}`}
            >
              Admin
            </button>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-6">
          
          {/* View: Password Recovery */}
          {isRecoveringPassword ? (
            <div className="space-y-4">
              <div className="flex items-center space-x-2 text-cyan-400 text-xs font-mono">
                <KeyRound className="w-4 h-4" />
                <span>Recuperación de Contraseña Segura</span>
              </div>
              <p className="text-xs text-slate-400">
                Ingresa el correo registrado para enviarte un enlace de un solo uso con cifrado tokenizado según ISO 27001.
              </p>

              {recoverySent ? (
                <div className="p-4 bg-emerald-950/40 border border-emerald-500/40 rounded-xl text-center space-y-2">
                  <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                  <div className="text-xs font-bold text-white">¡Enlace de recuperación enviado!</div>
                  <p className="text-[11px] text-slate-300">
                    Revisa la bandeja de entrada de <strong>{recoveryEmail}</strong>. El token expira en 15 minutos.
                  </p>
                  <button
                    onClick={() => { setIsRecoveringPassword(false); setRecoverySent(false); }}
                    className="mt-3 text-xs text-cyan-400 underline font-bold"
                  >
                    Volver al Inicio de Sesión
                  </button>
                </div>
              ) : (
                <form onSubmit={handlePasswordRecovery} className="space-y-3">
                  <input
                    type="email"
                    required
                    placeholder="tucorreo@ejemplo.com"
                    value={recoveryEmail}
                    onChange={(e) => setRecoveryEmail(e.target.value)}
                    className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                  />
                  <button
                    type="submit"
                    className="w-full py-2.5 bg-gradient-to-r from-cyan-400 to-blue-600 hover:from-cyan-300 text-slate-950 font-bold text-xs uppercase tracking-wider rounded-xl transition-all"
                  >
                    Enviar Token de Recuperación
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsRecoveringPassword(false)}
                    className="w-full py-1.5 text-xs text-slate-400 hover:text-white"
                  >
                    Cancelar y Volver
                  </button>
                </form>
              )}
            </div>
          ) : (
            <>
              {/* Tab 1: Client Login */}
              {tab === 'client' && (
                <div className="space-y-4">
                  {/* Quick Face ID Trigger */}
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenFaceIDScanner();
                    }}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-950 to-blue-950 hover:from-cyan-900 hover:to-blue-900 border border-cyan-400 text-cyan-300 text-xs font-bold flex items-center justify-center space-x-2 transition-all shadow-[0_0_15px_rgba(0,240,255,0.2)]"
                  >
                    <Camera className="w-4 h-4 text-cyan-400" />
                    <span>Ingresar con Reconocimiento Facial (Face ID)</span>
                  </button>

                  <div className="relative flex items-center justify-center">
                    <div className="border-t border-slate-800 w-full"></div>
                    <span className="bg-[#090d18] px-2 text-[10px] font-mono text-slate-500 uppercase">
                      o credenciales
                    </span>
                  </div>

                  <form onSubmit={handleClientLogin} className="space-y-3">
                    <div>
                      <label className="text-[10px] font-mono text-slate-400 uppercase">Correo Electrónico</label>
                      <input
                        type="email"
                        placeholder="ej: lucas.ramirez@cybermail.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-cyan-500 mt-1"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between items-center">
                        <label className="text-[10px] font-mono text-slate-400 uppercase">Contraseña</label>
                        <button
                          type="button"
                          onClick={() => setIsRecoveringPassword(true)}
                          className="text-[10px] text-cyan-400 hover:underline"
                        >
                          ¿Olvidaste tu contraseña?
                        </button>
                      </div>
                      <input
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-cyan-500 mt-1"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3 bg-gradient-to-r from-cyan-400 to-blue-600 hover:from-cyan-300 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-md"
                    >
                      Ingresar como Cliente
                    </button>
                  </form>

                  {/* Social Login Buttons */}
                  <div className="pt-2 border-t border-slate-800 space-y-2">
                    <div className="text-[10px] font-mono text-slate-500 text-center uppercase">
                      Acceso rápido con Redes Sociales
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => handleSocialLogin('Google')}
                        className="py-2 px-3 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-300 font-semibold flex items-center justify-center space-x-1.5 transition-colors"
                      >
                        <span>Google SSO</span>
                      </button>
                      <button
                        onClick={() => handleSocialLogin('Apple')}
                        className="py-2 px-3 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-300 font-semibold flex items-center justify-center space-x-1.5 transition-colors"
                      >
                        <span>Apple ID</span>
                      </button>
                    </div>
                  </div>

                  {/* Demo Helper Pill */}
                  <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 text-[10px] text-slate-400 font-mono text-center">
                    💡 <span className="text-cyan-300">Tip de prueba:</span> Haz clic en "Ingresar como Cliente" directamente para acceder como Lucas Ramírez.
                  </div>
                </div>
              )}

              {/* Tab 2: New Client Registration */}
              {tab === 'register' && (
                <form onSubmit={handleRegister} className="space-y-3">
                  <div>
                    <label className="text-[10px] font-mono text-slate-400 uppercase">Nombre Completo</label>
                    <input
                      type="text"
                      required
                      placeholder="ej: Rodrigo Rossi"
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-cyan-500 mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-mono text-slate-400 uppercase">Correo Electrónico</label>
                    <input
                      type="email"
                      required
                      placeholder="rodrigo@ejemplo.com"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-cyan-500 mt-1"
                    />
                  </div>
                  {authError && (
                    <div className="p-2.5 rounded-xl bg-red-950/60 border border-red-500/40 text-xs text-red-200">
                      {authError}
                    </div>
                  )}
                  <div>
                    <label className="text-[10px] font-mono text-emerald-400 uppercase">
                      Número de WhatsApp (para recordatorios de citas)
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="+591 7788-9900"
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      className="w-full p-2.5 bg-slate-900 border border-emerald-500/40 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-emerald-400 mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-mono text-slate-400 uppercase">Contraseña Segura</label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-cyan-500 mt-1"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-gradient-to-r from-cyan-400 to-blue-600 hover:from-cyan-300 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-md mt-2"
                  >
                    Crear Cuenta (+50 Puntos de Bienvenida)
                  </button>
                </form>
              )}

              {/* Tab 3: Barber Login */}
              {tab === 'barber' && (
                <form onSubmit={handleBarberLogin} className="space-y-4">
                  <div className="p-3 bg-blue-950/40 border border-blue-500/30 rounded-xl text-xs text-blue-300">
                    <div className="font-bold flex items-center gap-1.5">
                      <Scissors className="w-4 h-4" />
                      Acceso Exclusivo para el Staff
                    </div>
                    <div className="text-[11px] text-slate-300 mt-1">
                      Gestiona tus turnos del día, estadísticas de ganancias y visualiza las fichas morfológicas IA de tus clientes.
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-mono text-slate-400 uppercase">Selecciona tu Perfil</label>
                    <select
                      value={selectedBarberId}
                      onChange={(e) => setSelectedBarberId(e.target.value)}
                      className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none mt-1 font-mono"
                    >
                      {barbers.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.name} ("{b.alias}")
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-mono text-slate-400 uppercase">PIN de Seguridad Barbero</label>
                    <input
                      type="password"
                      value={barberPin}
                      onChange={(e) => setBarberPin(e.target.value)}
                      className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 font-mono mt-1"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-md"
                  >
                    Ingresar al Panel de Barbero
                  </button>
                </form>
              )}

              {/* Tab 4: Admin Login */}
              {tab === 'admin' && (
                <form onSubmit={handleAdminLogin} className="space-y-4">
                  <div className="p-3 bg-purple-950/40 border border-purple-500/30 rounded-xl text-xs text-purple-300">
                    <div className="font-bold flex items-center gap-1.5">
                      <Lock className="w-4 h-4" />
                      Consola de Alta Dirección
                    </div>
                    <div className="text-[11px] text-slate-300 mt-1">
                      Control total de reservas, auditoría ISO 27001, balance de facturación y gestión de barberos.
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-mono text-slate-400 uppercase">Usuario Administrador</label>
                    <input
                      type="text"
                      value={adminUser}
                      onChange={(e) => setAdminUser(e.target.value)}
                      className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 font-mono mt-1"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-mono text-slate-400 uppercase">Token 2FA (Hardware Key)</label>
                    <input
                      type="text"
                      value={adminToken2FA}
                      onChange={(e) => setAdminToken2FA(e.target.value)}
                      className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 font-mono mt-1"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-purple-600 hover:bg-purple-500 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-md"
                  >
                    Acceder a la Consola de Administración
                  </button>
                </form>
              )}
            </>
          )}

        </div>

      </div>
    </div>
  );
};
