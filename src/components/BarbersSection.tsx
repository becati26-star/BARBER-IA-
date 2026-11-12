import React from 'react';
import { Scissors, Star, Clock, CheckCircle2, Award, Calendar, Sparkles } from 'lucide-react';
import { BarberProfile } from '../types';
import { storeService } from '../services/store';

interface BarbersSectionProps {
  onSelectBarberForBooking: (barber: BarberProfile) => void;
  onOpenBarberLogin: () => void;
}

export const BarbersSection: React.FC<BarbersSectionProps> = ({
  onSelectBarberForBooking,
  onOpenBarberLogin,
}) => {
  const barbers = storeService.getBarbers();

  const getStatusBadge = (status: BarberProfile['status']) => {
    switch (status) {
      case 'available':
        return (
          <span className="flex items-center space-x-1.5 text-[10px] font-mono text-emerald-400 bg-emerald-950/80 border border-emerald-500/40 px-2 py-0.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Disponible Ahora</span>
          </span>
        );
      case 'busy':
        return (
          <span className="flex items-center space-x-1.5 text-[10px] font-mono text-amber-400 bg-amber-950/80 border border-amber-500/40 px-2 py-0.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
            <span>En Silla / Cortando</span>
          </span>
        );
      case 'break':
        return (
          <span className="flex items-center space-x-1.5 text-[10px] font-mono text-slate-400 bg-slate-900 border border-slate-700 px-2 py-0.5 rounded-full">
            <span>En Receso</span>
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <section id="barberos" className="py-20 bg-[#060912] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-950 border border-cyan-500/40 text-cyan-300 text-xs font-mono font-bold uppercase tracking-wider mb-2">
              <Award className="w-3.5 h-3.5" />
              <span>Cyber Masters Certificados</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white uppercase font-tech tracking-tight">
              NUESTRO STAFF <span className="text-cyan-400 glow-text-cyan">DE BARBEROS</span>
            </h2>
            <p className="text-slate-400 text-sm max-w-xl mt-2">
              Profesionales de élite con maestría en degradados clásicos y diseño capilar asistido por inteligencia artificial.
            </p>
          </div>

          <button
            onClick={onOpenBarberLogin}
            className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-700 hover:border-cyan-500/50 text-slate-300 hover:text-white text-xs font-semibold flex items-center space-x-2 transition-colors self-start md:self-auto"
          >
            <Scissors className="w-3.5 h-3.5 text-cyan-400" />
            <span>Acceso Barbero (Panel de Turnos)</span>
          </button>
        </div>

        {/* Barbers Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {barbers.map((barber) => (
            <div
              key={barber.id}
              className="rounded-2xl bg-[#090d19] border border-slate-800 hover:border-cyan-500/50 p-5 transition-all duration-300 hover:shadow-[0_0_25px_rgba(0,240,255,0.2)] flex flex-col justify-between group"
            >
              <div>
                {/* Avatar with Status Ring */}
                <div className="relative mb-4">
                  <div className="w-full aspect-square rounded-xl overflow-hidden border border-slate-700 group-hover:border-cyan-400/80 transition-colors">
                    <img 
                      src={barber.avatar} 
                      alt={barber.name} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>

                  <div className="absolute top-2.5 right-2.5">
                    {getStatusBadge(barber.status)}
                  </div>

                  {/* Rating Badge */}
                  <div className="absolute bottom-2.5 left-2.5 bg-black/80 backdrop-blur-md px-2 py-0.5 rounded-lg flex items-center space-x-1 text-xs font-mono text-amber-400 border border-amber-500/30">
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    <span className="font-bold">{barber.rating}</span>
                    <span className="text-[10px] text-slate-400">({barber.reviewsCount})</span>
                  </div>
                </div>

                {/* Name & Alias */}
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-black text-white font-tech group-hover:text-cyan-400 transition-colors">
                    {barber.name}
                  </h3>
                </div>
                <div className="text-xs font-mono text-cyan-400 font-bold uppercase mt-0.5">
                  Alias: "{barber.alias}"
                </div>

                {/* Specialties */}
                <div className="mt-3 flex flex-wrap gap-1">
                  {barber.specialties.map((spec, i) => (
                    <span 
                      key={i}
                      className="text-[10px] bg-slate-950 border border-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono"
                    >
                      {spec}
                    </span>
                  ))}
                </div>

                {/* Daily Activity Stat */}
                <div className="mt-4 pt-3 border-t border-slate-800/80 text-xs text-slate-400 flex items-center justify-between">
                  <span>Cortes hoy:</span>
                  <span className="font-mono font-bold text-cyan-300">{barber.dailyStats.servicesToday} completados</span>
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-4 pt-2">
                <button
                  onClick={() => onSelectBarberForBooking(barber)}
                  className="w-full py-2.5 rounded-xl bg-slate-900 group-hover:bg-cyan-500 border border-slate-700 group-hover:border-cyan-400 text-slate-200 group-hover:text-slate-950 font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center space-x-2"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Agendar con {barber.alias}</span>
                </button>
              </div>

            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
