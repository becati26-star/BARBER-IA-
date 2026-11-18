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
  RefreshCw,
  MessageCircle,
  ExternalLink
} from 'lucide-react';
import { BarberProfile, Appointment } from '../types';
import { storeService } from '../services/store';
import {
  buildAppointmentReminderMessage,
  formatWhatsAppDisplay,
  getWhatsAppChatUrl,
} from '../services/whatsapp';

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
  const [reminderFeedback, setReminderFeedback] = useState<string | null>(null);

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

  const handleLogWhatsAppReminder = (apt: Appointment) => {
    storeService.addNotification({
      title: 'Recordatorio WhatsApp Enviado',
      message: `Se preparó recordatorio por WhatsApp a ${apt.clientName} (${formatWhatsAppDisplay(apt.clientPhone)}) para las ${apt.time} hs con ${activeBarber.alias}.`,
      type: 'reminder',
    });
    setReminderFeedback(
      `Recordatorio WhatsApp abierto para ${apt.clientName} (${formatWhatsAppDisplay(apt.clientPhone)}).`
    );
    setTimeout(() => setReminderFeedback(null), 4000);
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

          {reminderFeedback && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-xs text-emerald-300 flex items-center gap-2">
              <MessageCircle className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{reminderFeedback}</span>
            </div>
          )}

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

                    {/* WhatsApp Reminder Link */}
                    <a
                      href={getWhatsAppChatUrl(
                        apt.clientPhone,
                        buildAppointmentReminderMessage(apt, { isReminder: true })
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => handleLogWhatsAppReminder(apt)}
                      className="px-3 py-1.5 rounded-lg bg-emerald-950/70 border border-emerald-500/50 hover:bg-emerald-500 hover:text-slate-950 text-emerald-300 text-xs font-bold flex items-center space-x-1.5 transition-colors"
                      title={`Enviar recordatorio por WhatsApp a ${formatWhatsAppDisplay(apt.clientPhone)}`}
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>WhatsApp</span>
                    </a>

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

                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                  <div className="text-slate-400">Especificaciones y Notas del Cliente:</div>
                  {selectedClientApt.fadeOrLengthSpec && (
                    <div className="text-cyan-300">• Degradado / Largo: {selectedClientApt.fadeOrLengthSpec}</div>
                  )}
                  {selectedClientApt.beardSpec && (
                    <div className="text-cyan-300">• Barba: {selectedClientApt.beardSpec}</div>
                  )}
                  <div className="text-slate-200">
                    • Notas: {selectedClientApt.notes || 'Sin especificaciones adicionales.'}
                  </div>
                  <div className="text-emerald-400 pt-1">
                    WhatsApp registrado: {formatWhatsAppDisplay(selectedClientApt.clientPhone)}
                  </div>
                </div>
              </div>

              <div className="pt-2 flex flex-wrap items-center justify-between gap-2">
                <a
                  href={getWhatsAppChatUrl(
                    selectedClientApt.clientPhone,
                    buildAppointmentReminderMessage(selectedClientApt, { isReminder: true })
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => handleLogWhatsAppReminder(selectedClientApt)}
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-lg text-xs flex items-center gap-1.5 transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Enviar Recordatorio WhatsApp</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
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
