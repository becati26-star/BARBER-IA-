import React, { useState } from 'react';
import { 
  Scissors, 
  Clock, 
  DollarSign, 
  CheckCircle, 
  AlertCircle, 
  User, 
  Sparkles, 
  Bell, 
  Calendar, 
  ChevronRight,
  TrendingUp,
  Award,
  ArrowLeft,
  Eye,
  RefreshCw
} from 'lucide-react';
import { BarberProfile, Appointment } from '../types';
import { storeService } from '../services/store';

interface BarberDashboardProps {
  barber: BarberProfile;
  onBackToHome: () => void;
}

export const BarberDashboard: React.FC<BarberDashboardProps> = ({
  barber: initialBarber,
  onBackToHome,
}) => {
  const barbers = storeService.getBarbers();
  const [activeBarberId, setActiveBarberId] = useState<string>(initialBarber.id);
  const activeBarber = barbers.find(b => b.id === activeBarberId) || initialBarber;

  const [appointments, setAppointments] = useState<Appointment[]>(storeService.getAppointments());
  const [selectedClientApt, setSelectedClientApt] = useState<Appointment | null>(null);

  // Filter appointments for active barber
  const barberAppointments = appointments.filter(a => a.barberId === activeBarber.id);

  const handleUpdateStatus = (aptId: string, status: Appointment['status']) => {
    storeService.updateAppointmentStatus(aptId, status);
    setAppointments(storeService.getAppointments());

    if (status === 'completed') {
      storeService.addNotification({
        title: '¡Servicio Finalizado!',
        message: `El barbero ${activeBarber.alias} ha marcado como completado el servicio de la cita ${aptId}.`,
        type: 'booking',
      });
    }
  };

  const handleToggleAvailability = (newStatus: BarberProfile['status']) => {
    storeService.updateBarberStatus(activeBarber.id, newStatus);
    setAppointments(storeService.getAppointments());
  };

  const handleSendClientReminder = (apt: Appointment) => {
    storeService.addNotification({
      title: 'Recordatorio Enviado al Cliente',
      message: `Se notificó a ${apt.clientName} sobre su turno a las ${apt.time} hs con ${activeBarber.alias}.`,
      type: 'reminder',
    });
    alert(`Recordatorio push enviado con éxito a ${apt.clientName} (${apt.clientPhone})`);
  };

  return (
    <div className="min-h-screen bg-[#060810] text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Top Bar with Switcher & Back Button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-cyan-500/20 gap-4">
          <div className="flex items-center space-x-3">
            <button
              onClick={onBackToHome}
              className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-2xl font-black text-white uppercase font-tech">
                  Panel de Control del Barbero
                </h1>
                <span className="text-xs bg-blue-950 text-blue-400 border border-blue-500/40 px-2 py-0.5 rounded font-mono font-bold">
                  TURNO EN TIEMPO REAL
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Gestión de silla, tiempos de atención y fichas morfológicas IA
              </p>
            </div>
          </div>

          {/* Quick Barber Switcher for Testing */}
          <div className="flex items-center space-x-2 bg-slate-900/90 border border-slate-800 p-1.5 rounded-xl text-xs">
            <span className="text-[11px] font-mono text-slate-400 px-2">Barbero activo:</span>
            <select
              value={activeBarber.id}
              onChange={(e) => setActiveBarberId(e.target.value)}
              className="bg-slate-950 text-cyan-300 font-bold border border-slate-700 rounded-lg px-2.5 py-1 text-xs focus:outline-none"
            >
              {barbers.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name} ({b.alias})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Barber Profile Header & State Toggle */}
        <div className="p-6 rounded-2xl bg-[#090e1a] border border-cyan-500/30 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-xl overflow-hidden border-2 border-cyan-400 shrink-0">
              <img src={activeBarber.avatar} alt={activeBarber.name} className="w-full h-full object-cover" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl font-black text-white font-tech">{activeBarber.name}</h2>
                <span className="text-xs font-mono text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-500/40 font-bold">
                  "{activeBarber.alias}"
                </span>
              </div>
              <div className="text-xs text-slate-400 mt-1 flex items-center space-x-3 font-mono">
                <span>Horario: {activeBarber.schedule.startHour}:00 - {activeBarber.schedule.endHour}:00 hs</span>
                <span>• Calificación: ★ {activeBarber.rating} ({activeBarber.reviewsCount})</span>
              </div>
            </div>
          </div>

          {/* Availability Status Buttons */}
          <div className="flex items-center space-x-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
            <button
              onClick={() => handleToggleAvailability('available')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeBarber.status === 'available'
                  ? 'bg-emerald-500 text-slate-950 shadow-[0_0_12px_rgba(16,185,129,0.4)]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Disponible
            </button>
            <button
              onClick={() => handleToggleAvailability('busy')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeBarber.status === 'busy'
                  ? 'bg-amber-500 text-slate-950 shadow-[0_0_12px_rgba(245,158,11,0.4)]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              En Servicio (Ocupado)
            </button>
            <button
              onClick={() => handleToggleAvailability('break')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeBarber.status === 'break'
                  ? 'bg-slate-700 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              En Receso
            </button>
          </div>
        </div>

        {/* Daily Stats Counter Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800">
            <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
              <span>Cortes de Hoy</span>
              <Scissors className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-white font-tech mt-2">
              {activeBarber.dailyStats.servicesToday}
            </div>
            <div className="text-[10px] text-cyan-400 font-mono mt-1">+2 respecto a ayer</div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800">
            <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
              <span>Ingresos Diarios</span>
              <DollarSign className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-emerald-400 font-tech mt-2">
              {activeBarber.dailyStats.revenueToday} Bs
            </div>
            <div className="text-[10px] text-slate-400 font-mono mt-1">Comisión estimada: 60%</div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800">
            <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
              <span>Propinas Recibidas</span>
              <Award className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-amber-400 font-tech mt-2">
              {activeBarber.dailyStats.tipsToday} Bs
            </div>
            <div className="text-[10px] text-slate-400 font-mono mt-1">100% para el barbero</div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800">
            <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
              <span>Tiempo Promedio</span>
              <Clock className="w-4 h-4 text-blue-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-white font-tech mt-2">
              {activeBarber.dailyStats.averageTimeMin} min
            </div>
            <div className="text-[10px] text-emerald-400 font-mono mt-1">Eficiencia óptima</div>
          </div>
        </div>

        {/* Real-time Appointments Queue for Active Barber */}
        <div className="p-6 rounded-2xl bg-[#090d18] border border-slate-800">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-black text-white uppercase font-tech">
                Cola de Turnos Asignados en Tiempo Real
              </h3>
              <p className="text-xs text-slate-400">
                {barberAppointments.length} citas registradas para {activeBarber.alias}
              </p>
            </div>

            <button
              onClick={() => setAppointments(storeService.getAppointments())}
              className="p-2 rounded-lg bg-slate-900 text-slate-400 hover:text-white transition-colors"
              title="Refrescar turnos"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          {barberAppointments.length === 0 ? (
            <div className="text-center py-12 text-slate-500 font-mono text-xs">
              No hay turnos pendientes para este barbero hoy.
            </div>
          ) : (
            <div className="space-y-3">
              {barberAppointments.map((apt) => (
                <div
                  key={apt.id}
                  className={`p-4 rounded-xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                    apt.status === 'in_chair'
                      ? 'bg-cyan-950/40 border-cyan-400 shadow-[0_0_20px_rgba(0,240,255,0.2)]'
                      : apt.status === 'completed'
                      ? 'bg-slate-950/60 border-slate-800 opacity-60'
                      : 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {/* Left: Info */}
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-cyan-400 font-bold text-sm">{apt.time} hs</span>
                      <span className="text-slate-600">•</span>
                      <span className="text-white font-bold font-tech text-base">{apt.clientName}</span>
                      {apt.status === 'in_chair' && (
                        <span className="text-[10px] bg-cyan-950 text-cyan-300 border border-cyan-400 px-2 py-0.5 rounded-full font-mono font-bold animate-pulse">
                          EN SILLA AHORA
                        </span>
                      )}
                    </div>

                    <div className="text-xs text-slate-300">
                      Paquete: <strong className="text-cyan-300">{apt.packageName}</strong> ({apt.price} Bs)
                    </div>

                    {apt.aiSuggestedCut && (
                      <div className="text-[11px] text-cyan-400 font-mono flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Estilo IA: {apt.aiSuggestedCut}</span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap items-center gap-2">
                    {/* View AI tech sheet */}
                    <button
                      onClick={() => setSelectedClientApt(apt)}
                      className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 hover:border-cyan-400 text-slate-300 hover:text-white text-xs font-mono flex items-center space-x-1.5 transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Ficha IA</span>
                    </button>

                    {/* Push reminder */}
                    <button
                      onClick={() => handleSendClientReminder(apt)}
                      className="p-2 rounded-lg bg-slate-950 border border-slate-700 hover:border-cyan-400 text-slate-300 hover:text-white transition-colors"
                      title="Enviar recordatorio push al cliente"
                    >
                      <Bell className="w-3.5 h-3.5" />
                    </button>

                    {/* Status change actions */}
                    {apt.status === 'confirmed' && (
                      <button
                        onClick={() => handleUpdateStatus(apt.id, 'in_chair')}
                        className="px-3.5 py-1.5 rounded-lg bg-cyan-500 text-slate-950 font-bold text-xs uppercase transition-all shadow-md"
                      >
                        Pasar a Silla
                      </button>
                    )}

                    {apt.status === 'in_chair' && (
                      <button
                        onClick={() => handleUpdateStatus(apt.id, 'completed')}
                        className="px-3.5 py-1.5 rounded-lg bg-emerald-500 text-slate-950 font-bold text-xs uppercase transition-all shadow-md flex items-center space-x-1"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>Terminar Corte</span>
                      </button>
                    )}

                    {apt.status === 'completed' && (
                      <span className="text-xs text-emerald-400 font-mono font-bold flex items-center gap-1">
                        <CheckCircle className="w-4 h-4" />
                        Completado
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal: Client AI Technical Sheet */}
        {selectedClientApt && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="relative w-full max-w-lg bg-[#090d18] border-2 border-cyan-500/50 rounded-2xl p-6 space-y-4">
              <div className="flex justify-between items-start border-b border-slate-800 pb-3">
                <div>
                  <h4 className="text-lg font-black text-white font-tech">Ficha Técnica & Morfológica IA</h4>
                  <p className="text-xs text-slate-400">Cliente: {selectedClientApt.clientName}</p>
                </div>
                <button 
                  onClick={() => setSelectedClientApt(null)}
                  className="text-slate-400 hover:text-white"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-3 text-xs font-mono">
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <div className="text-cyan-400 font-bold uppercase">Estilo Sugerido por IA:</div>
                  <div className="text-white text-sm font-bold mt-1 font-tech">
                    {selectedClientApt.aiSuggestedCut || 'Corte Cyber Precision Clásico'}
                  </div>
                </div>

                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <div className="text-slate-400">Notas del Cliente:</div>
                  <div className="text-slate-200 mt-1">
                    {selectedClientApt.notes || 'Sin especificaciones previas registradas.'}
                  </div>
                </div>

                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <div className="text-slate-400">Parámetros Técnicos de Ejecución:</div>
                  <div className="text-cyan-300 mt-1">
                    • Degradado milimétrico en parietales con guía #1.<br />
                    • Perfilado de barba a 45° con toalla caliente infusionada.<br />
                    • Cera mate fijación alta sin brillo artificial.
                  </div>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => setSelectedClientApt(null)}
                  className="px-4 py-2 bg-cyan-500 text-slate-950 font-bold rounded-lg text-xs"
                >
                  Entendido
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
