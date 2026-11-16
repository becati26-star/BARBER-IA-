import React, { useState } from 'react';
import { 
  Camera, 
  Calendar, 
  ShieldCheck, 
  User, 
  Bell, 
  LogOut, 
  Scissors, 
  Sparkles,
  ChevronDown,
  Menu,
  X,
  Lock,
  ShoppingBag
} from 'lucide-react';
import { ClientProfile, BarberProfile, UserRole, CurrencyCode } from '../types';
import { storeService } from '../services/store';

interface NavbarProps {
  userRole: UserRole | null;
  activeClient: ClientProfile | null;
  activeBarber: BarberProfile | null;
  onOpenFaceScanner: (mode: 'analysis' | 'auth') => void;
  onOpenBooking: () => void;
  onOpenAuth: (initialTab?: 'client' | 'barber' | 'admin' | 'register') => void;
  onOpenSecurity: () => void;
  onLogout: () => void;
  currentView: 'home' | 'barber-dashboard' | 'admin-dashboard';
  onChangeView: (view: 'home' | 'barber-dashboard' | 'admin-dashboard') => void;
  cartCount?: number;
  onOpenCart?: () => void;
  selectedCurrency?: CurrencyCode;
  onCurrencyChange?: (currency: CurrencyCode) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  userRole,
  activeClient,
  activeBarber,
  onOpenFaceScanner,
  onOpenBooking,
  onOpenAuth,
  onOpenSecurity,
  onLogout,
  currentView,
  onChangeView,
  cartCount = 0,
  onOpenCart,
  selectedCurrency = 'BOB',
  onCurrencyChange,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const notifications = storeService.getNotifications();
  const unreadCount = notifications.filter(n => !n.read).length;

  const handleMarkNotificationsRead = () => {
    storeService.markAllNotificationsRead();
  };

  return (
    <nav className="sticky top-0 z-40 bg-[#070a12]/90 backdrop-blur-md border-b border-cyan-500/20 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Brand Logo & Name */}
          <div 
            className="flex items-center space-x-3 cursor-pointer group"
            onClick={() => onChangeView('home')}
          >
            <div className="relative">
              <div className="w-12 h-12 rounded-xl overflow-hidden border-2 border-cyan-400 group-hover:border-cyan-300 transition-all shadow-[0_0_15px_rgba(0,240,255,0.4)]">
                <img 
                  src="/assets/aistudio/WhatsApp_Image_2026-11-12_at_09.03.14_0a9180d3.jpeg" 
                  alt="BARBER IA Logo" 
                  className="w-full h-full object-cover scale-105"
                />
              </div>
              <span className="absolute -bottom-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
              </span>
            </div>

            <div>
              <div className="flex items-center space-x-1.5">
                <span className="text-2xl font-black tracking-wider text-slate-100 font-tech">
                  BARBER <span className="text-cyan-400 glow-text-cyan">IA</span>
                </span>
                <span className="text-[10px] bg-cyan-950 text-cyan-300 border border-cyan-500/40 px-1.5 py-0.5 rounded font-mono font-bold tracking-tight">
                  v2.6
                </span>
              </div>
              <p className="text-[10px] tracking-widest text-slate-400 uppercase font-semibold">
                Estilo • Tecnología • Precisión
              </p>
            </div>
          </div>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center space-x-6 text-sm font-medium">
            <button
              onClick={() => onChangeView('home')}
              className={`transition-colors hover:text-cyan-400 ${currentView === 'home' ? 'text-cyan-400 font-bold' : 'text-slate-300'}`}
            >
              Inicio
            </button>
            <a 
              href="#paquetes" 
              onClick={() => onChangeView('home')}
              className="text-slate-300 hover:text-cyan-400 transition-colors"
            >
              Paquetes de Corte
            </a>
            <a 
              href="#estilos" 
              onClick={() => onChangeView('home')}
              className="text-slate-300 hover:text-cyan-400 transition-colors flex items-center gap-1.5"
            >
              <Sparkles className="w-4 h-4 text-cyan-400" />
              Galería IA
            </a>
            <a 
              href="#productos" 
              onClick={() => onChangeView('home')}
              className="text-slate-300 hover:text-cyan-400 transition-colors flex items-center gap-1.5 font-semibold"
            >
              <ShoppingBag className="w-4 h-4 text-cyan-400" />
              Tienda Bs
            </a>
            <a 
              href="#barberos" 
              onClick={() => onChangeView('home')}
              className="text-slate-300 hover:text-cyan-400 transition-colors"
            >
              Staff Master
            </a>
            <button
              onClick={onOpenSecurity}
              className="text-slate-300 hover:text-cyan-400 transition-colors flex items-center gap-1.5 text-xs bg-slate-900/60 border border-slate-700/60 px-2.5 py-1 rounded-md"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              ISO 27001 / OWASP
            </button>
          </div>

          {/* Action Buttons & Profile */}
          <div className="hidden lg:flex items-center space-x-3">
            
            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => {
                  setNotificationsOpen(!notificationsOpen);
                  if (!notificationsOpen) handleMarkNotificationsRead();
                }}
                className="relative p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-300 hover:text-cyan-400 hover:border-cyan-500/40 transition-all"
                title="Notificaciones push"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Dropdown */}
              {notificationsOpen && (
                <div className="absolute right-0 mt-3 w-80 bg-[#0d121f] border border-cyan-500/30 rounded-xl shadow-2xl p-4 z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <span className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                      <Bell className="w-3.5 h-3.5 text-cyan-400" />
                      Notificaciones en Vivo
                    </span>
                    <span className="text-[11px] text-cyan-400 font-mono">Push Active</span>
                  </div>
                  <div className="mt-3 space-y-2.5 max-h-72 overflow-y-auto pr-1">
                    {notifications.map((n) => (
                      <div key={n.id} className="p-2.5 bg-slate-900/80 rounded-lg border border-slate-800 hover:border-cyan-500/40 transition-colors text-xs">
                        <div className="font-semibold text-slate-200 flex items-center justify-between">
                          <span>{n.title}</span>
                          <span className="text-[10px] text-slate-500 font-mono">{n.timestamp}</span>
                        </div>
                        <p className="text-slate-400 mt-1 text-[11px] leading-relaxed">{n.message}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Currency Switcher Compact */}
            {onCurrencyChange && (
              <select
                value={selectedCurrency}
                onChange={(e) => onCurrencyChange(e.target.value as CurrencyCode)}
                title="Divisa de referencia"
                className="bg-slate-900/90 border border-slate-700 text-cyan-300 font-mono text-xs font-bold rounded-xl px-2 py-2 focus:outline-none focus:border-cyan-400"
              >
                <option value="BOB">🇧🇴 Bs</option>
                <option value="USD">🇺🇸 USD</option>
                <option value="EUR">🇪🇺 EUR</option>
                <option value="BRL">🇧🇷 BRL</option>
                <option value="ARS">🇦🇷 ARS</option>
              </select>
            )}

            {/* Persistent Shopping Cart Trigger */}
            {onOpenCart && (
              <button
                onClick={onOpenCart}
                className="relative p-2.5 rounded-xl bg-slate-900/80 border border-cyan-500/40 text-cyan-300 hover:text-white hover:border-cyan-400 transition-all"
                title="Abrir Carrito de Compras"
              >
                <ShoppingBag className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-cyan-400 text-slate-950 text-[10px] font-mono font-black rounded-full h-5 w-5 flex items-center justify-center shadow-md">
                    {cartCount}
                  </span>
                )}
              </button>
            )}

            {/* Quick Face ID Scanner Button */}
            <button
              onClick={() => onOpenFaceScanner('analysis')}
              className="flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-cyan-950/60 border border-cyan-500/50 text-cyan-300 hover:bg-cyan-500/20 hover:text-white transition-all text-xs font-semibold shadow-[0_0_15px_rgba(0,240,255,0.2)] group"
            >
              <Camera className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
              <span>Escanear Rostro IA</span>
            </button>

            {/* Booking Trigger Button */}
            <button
              onClick={onOpenBooking}
              className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(0,240,255,0.4)] active:scale-95"
            >
              <Calendar className="w-4 h-4" />
              <span>Agendar Turno</span>
            </button>

            {/* Role / User Button */}
            {userRole ? (
              <div className="flex items-center space-x-2 bg-slate-900/90 border border-slate-700 px-3 py-1.5 rounded-xl">
                <div className="text-right">
                  <div className="text-xs font-bold text-slate-200">
                    {userRole === 'client' && (activeClient?.name || 'Cliente')}
                    {userRole === 'barber' && (activeBarber?.alias ? `Barbero: ${activeBarber.alias}` : 'Barbero')}
                    {userRole === 'admin' && 'Super Admin'}
                  </div>
                  <div className="text-[10px] text-cyan-400 font-mono capitalize">
                    {userRole === 'client' ? `${activeClient?.loyaltyPoints || 50} Puntos IA` : `${userRole} activo`}
                  </div>
                </div>

                {userRole === 'barber' && (
                  <button 
                    onClick={() => onChangeView('barber-dashboard')} 
                    className="p-1.5 bg-blue-600/30 text-blue-400 rounded-lg hover:bg-blue-600 hover:text-white transition-colors"
                    title="Panel de Barbero"
                  >
                    <Scissors className="w-4 h-4" />
                  </button>
                )}

                {userRole === 'admin' && (
                  <button 
                    onClick={() => onChangeView('admin-dashboard')} 
                    className="p-1.5 bg-purple-600/30 text-purple-400 rounded-lg hover:bg-purple-600 hover:text-white transition-colors"
                    title="Panel de Administración"
                  >
                    <Lock className="w-4 h-4" />
                  </button>
                )}

                <button
                  onClick={onLogout}
                  className="p-1.5 text-slate-400 hover:text-red-400 transition-colors"
                  title="Cerrar Sesión"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => onOpenAuth('client')}
                className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 hover:border-slate-500 transition-all text-xs font-semibold"
              >
                <User className="w-4 h-4 text-cyan-400" />
                <span>Iniciar Sesión</span>
              </button>
            )}

          </div>

          {/* Mobile Menu Button */}
          <div className="flex lg:hidden items-center space-x-2">
            {onOpenCart && (
              <button
                onClick={onOpenCart}
                className="relative p-2 rounded-lg bg-slate-900 border border-cyan-500/40 text-cyan-300"
                title="Carrito"
              >
                <ShoppingBag className="w-4 h-4" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-cyan-400 text-slate-950 font-mono text-[9px] font-black rounded-full h-4 w-4 flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </button>
            )}
            <button
              onClick={() => onOpenBooking()}
              className="px-3 py-1.5 bg-cyan-500 text-slate-950 font-bold rounded-lg text-xs"
            >
              Agendar
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-300 hover:text-white"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#0a0e18] border-b border-cyan-500/20 px-4 pt-3 pb-6 space-y-3">
          <button
            onClick={() => { onChangeView('home'); setMobileMenuOpen(false); }}
            className="block w-full text-left py-2 text-slate-300 hover:text-cyan-400 font-medium"
          >
            Inicio
          </button>
          <a
            href="#paquetes"
            onClick={() => { onChangeView('home'); setMobileMenuOpen(false); }}
            className="block py-2 text-slate-300 hover:text-cyan-400 font-medium"
          >
            Paquetes de Corte (Bs)
          </a>
          <a
            href="#estilos"
            onClick={() => { onChangeView('home'); setMobileMenuOpen(false); }}
            className="block py-2 text-slate-300 hover:text-cyan-400 font-medium"
          >
            Galería IA Personalizada
          </a>
          <a
            href="#productos"
            onClick={() => { onChangeView('home'); setMobileMenuOpen(false); }}
            className="block py-2 text-cyan-300 hover:text-cyan-400 font-bold"
          >
            Tienda de Productos (Bs)
          </a>
          <a
            href="#barberos"
            onClick={() => { onChangeView('home'); setMobileMenuOpen(false); }}
            className="block py-2 text-slate-300 hover:text-cyan-400 font-medium"
          >
            Staff de Barberos
          </a>
          <button
            onClick={() => { onOpenSecurity(); setMobileMenuOpen(false); }}
            className="block w-full text-left py-2 text-emerald-400 font-medium"
          >
            Seguridad ISO 27001 / OWASP
          </button>

          <div className="pt-4 border-t border-slate-800 space-y-2">
            <button
              onClick={() => { onOpenFaceScanner('analysis'); setMobileMenuOpen(false); }}
              className="w-full flex items-center justify-center space-x-2 py-2.5 rounded-xl bg-cyan-950 border border-cyan-500 text-cyan-300 font-bold text-xs"
            >
              <Camera className="w-4 h-4" />
              <span>Escanear Rostro IA</span>
            </button>

            {userRole ? (
              <div className="space-y-2">
                {userRole === 'barber' && (
                  <button
                    onClick={() => { onChangeView('barber-dashboard'); setMobileMenuOpen(false); }}
                    className="w-full py-2 bg-blue-600 text-white rounded-lg text-xs font-bold"
                  >
                    Ir a Panel Barbero
                  </button>
                )}
                {userRole === 'admin' && (
                  <button
                    onClick={() => { onChangeView('admin-dashboard'); setMobileMenuOpen(false); }}
                    className="w-full py-2 bg-purple-600 text-white rounded-lg text-xs font-bold"
                  >
                    Ir a Panel Admin
                  </button>
                )}
                <button
                  onClick={() => { onLogout(); setMobileMenuOpen(false); }}
                  className="w-full py-2 border border-red-500/50 text-red-400 rounded-lg text-xs font-semibold"
                >
                  Cerrar Sesión
                </button>
              </div>
            ) : (
              <button
                onClick={() => { onOpenAuth('client'); setMobileMenuOpen(false); }}
                className="w-full flex items-center justify-center space-x-2 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 text-xs font-bold"
              >
                <User className="w-4 h-4 text-cyan-400" />
                <span>Iniciar Sesión / Registrarse</span>
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};
