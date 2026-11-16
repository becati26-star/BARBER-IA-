import React, { useState, useEffect } from 'react';
import { 
  X, 
  Calendar, 
  Clock, 
  User, 
  CreditCard, 
  CheckCircle2, 
  Sparkles, 
  ShieldCheck, 
  Scissors, 
  ArrowRight,
  ArrowLeft,
  Smartphone,
  Lock,
  QrCode,
  AlertCircle
} from 'lucide-react';
import { BarberServicePackage, BarberProfile, ClientProfile, Appointment } from '../types';
import { INITIAL_PACKAGES, storeService } from '../services/store';
import { securityService } from '../services/security';
import { PaymentQRCode } from './PaymentQRCode';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedPackage?: BarberServicePackage | null;
  preselectedBarber?: BarberProfile | null;
  preselectedStyleName?: string | null;
  activeClient?: ClientProfile | null;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  isOpen,
  onClose,
  preselectedPackage,
  preselectedBarber,
  preselectedStyleName,
  activeClient,
}) => {
  const [step, setStep] = useState<number>(1);
  const barbers = storeService.getBarbers();

  // Booking Form State
  const [selectedPackage, setSelectedPackage] = useState<BarberServicePackage>(
    preselectedPackage || INITIAL_PACKAGES[0]
  );
  const [selectedBarber, setSelectedBarber] = useState<BarberProfile>(
    preselectedBarber || barbers[0]
  );
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [selectedTime, setSelectedTime] = useState<string>('12:00');
  
  // Client details
  const [clientName, setClientName] = useState<string>(activeClient?.name || '');
  const [clientEmail, setClientEmail] = useState<string>(activeClient?.email || '');
  const [clientPhone, setClientPhone] = useState<string>(activeClient?.phone || '');
  const [suggestedStyle, setSuggestedStyle] = useState<string>(preselectedStyleName || '');
  const [notes, setNotes] = useState<string>('');

  // Payment details
  const [paymentMethod, setPaymentMethod] = useState<'qr_simple' | 'credit_card' | 'apple_pay' | 'google_pay'>('qr_simple');
  const [selectedBank, setSelectedBank] = useState<string>('SIMPLE');
  const [qrReference] = useState<string>(`CITA-${Date.now().toString(36).toUpperCase().slice(-6)}`);
  const [qrConfirmed, setQrConfirmed] = useState<boolean>(false);
  const [cardNumber, setCardNumber] = useState<string>('•••• •••• •••• 4242');
  const [cardExpiry, setCardExpiry] = useState<string>('12/28');
  const [cardCvc, setCardCvc] = useState<string>('•••');
  const [formError, setFormError] = useState<string | null>(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState<boolean>(false);
  const [confirmedAppointment, setConfirmedAppointment] = useState<Appointment | null>(null);

  useEffect(() => {
    if (preselectedPackage) setSelectedPackage(preselectedPackage);
  }, [preselectedPackage]);

  useEffect(() => {
    if (preselectedBarber) setSelectedBarber(preselectedBarber);
  }, [preselectedBarber]);

  useEffect(() => {
    if (preselectedStyleName) setSuggestedStyle(preselectedStyleName);
  }, [preselectedStyleName]);

  useEffect(() => {
    if (activeClient) {
      setClientName(activeClient.name);
      setClientEmail(activeClient.email);
      setClientPhone(activeClient.phone);
    }
  }, [activeClient]);

  // Available daily hours generator
  const availableSlots = [
    '09:30', '10:15', '11:00', '11:45', '12:30',
    '14:00', '14:45', '15:30', '16:15', '17:00', '18:00', '19:00'
  ];

  const handleProcessPayment = () => {
    setFormError(null);
    if (!clientName || !clientEmail || !clientPhone) {
      setFormError('Por favor completa todos tus datos de contacto.');
      return;
    }

    setIsProcessingPayment(true);

    // Simulate PCI-DSS secure tokenization with payment gateway
    setTimeout(() => {
      const sanitizedName = securityService.sanitizeInput(clientName);
      const sanitizedNotes = securityService.sanitizeInput(notes);

      const newApt = storeService.addAppointment({
        clientName: sanitizedName,
        clientEmail: clientEmail.trim(),
        clientPhone: clientPhone.trim(),
        clientId: activeClient?.id,
        barberId: selectedBarber.id,
        barberName: `${selectedBarber.name} (${selectedBarber.alias})`,
        packageId: selectedPackage.id,
        packageName: selectedPackage.title,
        price: selectedPackage.price,
        date: selectedDate,
        time: selectedTime,
        status: 'confirmed',
        paymentStatus: 'paid',
        paymentMethod: paymentMethod,
        aiSuggestedCut: suggestedStyle || undefined,
        notes: sanitizedNotes,
      });

      setConfirmedAppointment(newApt);
      setIsProcessingPayment(false);
      setStep(4); // Confirmation step
    }, 1500);
  };

  const handleResetAndClose = () => {
    setStep(1);
    setConfirmedAppointment(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-[#090d18] border-2 border-cyan-500/40 rounded-2xl shadow-[0_0_50px_rgba(0,240,255,0.25)] overflow-hidden my-auto animate-in fade-in zoom-in-95">
        
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 border-b border-cyan-500/30">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-cyan-950 border border-cyan-500 text-cyan-400">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white uppercase font-tech">
                Agendamiento & Pasarela en Tiempo Real
              </h3>
              <p className="text-xs text-slate-400">
                Reserva automática sincronizada con la agenda del barbero
              </p>
            </div>
          </div>

          <button
            onClick={handleResetAndClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Indicator */}
        <div className="px-6 py-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between text-xs font-mono">
          <div className={`flex items-center gap-1.5 ${step >= 1 ? 'text-cyan-400 font-bold' : 'text-slate-500'}`}>
            <span className="w-5 h-5 rounded-full border border-current flex items-center justify-center text-[10px]">1</span>
            <span>Paquete & Barbero</span>
          </div>
          <div className="h-px w-8 bg-slate-800"></div>
          <div className={`flex items-center gap-1.5 ${step >= 2 ? 'text-cyan-400 font-bold' : 'text-slate-500'}`}>
            <span className="w-5 h-5 rounded-full border border-current flex items-center justify-center text-[10px]">2</span>
            <span>Fecha & Hora</span>
          </div>
          <div className="h-px w-8 bg-slate-800"></div>
          <div className={`flex items-center gap-1.5 ${step >= 3 ? 'text-cyan-400 font-bold' : 'text-slate-500'}`}>
            <span className="w-5 h-5 rounded-full border border-current flex items-center justify-center text-[10px]">3</span>
            <span>Pasarela / QR Bs</span>
          </div>
        </div>

        {formError && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-red-950/60 border border-red-500/50 text-xs text-red-200 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        {/* Step 1: Package & Barber Selection */}
        {step === 1 && (
          <div className="p-6 space-y-6">
            
            {/* Suggested Style Badge if available */}
            {suggestedStyle && (
              <div className="p-3 bg-cyan-950/40 border border-cyan-500/30 rounded-xl flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span className="text-slate-300">
                    Estilo seleccionado por IA: <strong className="text-cyan-300">{suggestedStyle}</strong>
                  </span>
                </div>
                <button
                  onClick={() => setSuggestedStyle('')}
                  className="text-[10px] text-slate-400 hover:text-white"
                >
                  Quitar
                </button>
              </div>
            )}

            {/* Select Package */}
            <div>
              <label className="block text-xs font-mono text-cyan-400 uppercase tracking-wider mb-2">
                1. Selecciona el Paquete o Servicio
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-48 overflow-y-auto pr-1">
                {INITIAL_PACKAGES.map((pkg) => (
                  <div
                    key={pkg.id}
                    onClick={() => setSelectedPackage(pkg)}
                    className={`p-3 rounded-xl border cursor-pointer transition-all ${
                      selectedPackage.id === pkg.id
                        ? 'bg-cyan-950/60 border-cyan-400 text-white shadow-[0_0_15px_rgba(0,240,255,0.2)]'
                        : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="font-bold text-xs font-tech">{pkg.title}</div>
                      <span className="text-xs font-mono font-bold text-cyan-400">{pkg.price} Bs</span>
                    </div>
                    <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-1 font-mono">
                      <Clock className="w-3 h-3 text-cyan-400" />
                      {pkg.durationMinutes} minutos
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Select Barber */}
            <div>
              <label className="block text-xs font-mono text-cyan-400 uppercase tracking-wider mb-2">
                2. Selecciona tu Master Barber
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {barbers.map((barber) => (
                  <div
                    key={barber.id}
                    onClick={() => setSelectedBarber(barber)}
                    className={`p-3 rounded-xl border text-center cursor-pointer transition-all ${
                      selectedBarber.id === barber.id
                        ? 'bg-cyan-950/60 border-cyan-400 shadow-[0_0_15px_rgba(0,240,255,0.2)]'
                        : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div className="w-12 h-12 rounded-full overflow-hidden mx-auto border border-slate-700 mb-1.5">
                      <img src={barber.avatar} alt={barber.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="text-xs font-bold text-white font-tech truncate">{barber.name}</div>
                    <div className="text-[10px] text-cyan-400 font-mono">"{barber.alias}"</div>
                    <div className="text-[10px] text-amber-400 font-mono mt-0.5">★ {barber.rating}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-3">
              <button
                onClick={() => setStep(2)}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-600 hover:from-cyan-300 text-slate-950 font-black text-xs uppercase tracking-wider transition-all flex items-center space-x-2 shadow-lg"
              >
                <span>Continuar a Fecha & Hora</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </div>
        )}

        {/* Step 2: Date & Available Slots */}
        {step === 2 && (
          <div className="p-6 space-y-6">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Date Input */}
              <div>
                <label className="block text-xs font-mono text-cyan-400 uppercase tracking-wider mb-2">
                  Fecha de la Cita
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full p-3 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
                />
              </div>

              {/* Summary of Selection */}
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs">
                <div className="text-[10px] text-slate-400 font-mono">Resumen de Turno:</div>
                <div className="font-bold text-white font-tech text-sm mt-1">{selectedPackage.title}</div>
                <div className="text-cyan-400 font-mono mt-0.5">Barbero: {selectedBarber.alias}</div>
                <div className="text-slate-300 font-mono mt-1 font-bold">Total: {selectedPackage.price} Bs</div>
              </div>
            </div>

            {/* Time Slot Grid */}
            <div>
              <label className="block text-xs font-mono text-cyan-400 uppercase tracking-wider mb-2">
                Horarios Disponibles en Tiempo Real
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
                {availableSlots.map((slot) => (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => setSelectedTime(slot)}
                    className={`py-2 px-3 rounded-lg text-xs font-mono font-bold transition-all ${
                      selectedTime === slot
                        ? 'bg-cyan-500 text-slate-950 shadow-[0_0_12px_rgba(0,240,255,0.4)]'
                        : 'bg-slate-900 text-slate-300 border border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            </div>

            {/* Client Contact Info */}
            <div className="space-y-3 pt-2 border-t border-slate-800">
              <div className="text-xs font-mono text-cyan-400 uppercase tracking-wider">
                Datos del Cliente
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input
                  type="text"
                  placeholder="Tu Nombre Completo"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                />
                <input
                  type="email"
                  placeholder="Correo Electrónico"
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  className="p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                />
                <input
                  type="tel"
                  placeholder="Teléfono / WhatsApp"
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  className="p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <input
                type="text"
                placeholder="Notas adicionales para el barbero (opcional)"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="flex justify-between items-center pt-3">
              <button
                onClick={() => setStep(1)}
                className="px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 text-xs font-bold hover:text-white flex items-center space-x-1.5"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Volver</span>
              </button>

              <button
                onClick={() => {
                  setFormError(null);
                  if (!clientName || !clientEmail || !clientPhone) {
                    setFormError('Por favor ingresa tu nombre, correo y teléfono.');
                    return;
                  }
                  setStep(3);
                }}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-600 hover:from-cyan-300 text-slate-950 font-black text-xs uppercase tracking-wider transition-all flex items-center space-x-2 shadow-lg"
              >
                <span>Continuar a Pasarela de Pago</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </div>
        )}

        {/* Step 3: Payment Gateway */}
        {step === 3 && (
          <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
            
            {/* Payment Method Selector */}
            <div>
              <label className="block text-xs font-mono text-cyan-400 uppercase tracking-wider mb-2">
                Selecciona la Pasarela de Pago (Bolivianos Bs)
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('qr_simple')}
                  className={`p-3 rounded-xl border flex flex-col items-center justify-center text-xs font-bold transition-all ${
                    paymentMethod === 'qr_simple'
                      ? 'bg-cyan-950 border-cyan-400 text-white shadow-[0_0_15px_rgba(0,240,255,0.2)]'
                      : 'bg-slate-900 border-slate-800 text-slate-400'
                  }`}
                >
                  <QrCode className="w-5 h-5 text-cyan-400 mb-1" />
                  <span>QR Simple</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('credit_card')}
                  className={`p-3 rounded-xl border flex flex-col items-center justify-center text-xs font-bold transition-all ${
                    paymentMethod === 'credit_card'
                      ? 'bg-cyan-950 border-cyan-400 text-white shadow-[0_0_15px_rgba(0,240,255,0.2)]'
                      : 'bg-slate-900 border-slate-800 text-slate-400'
                  }`}
                >
                  <CreditCard className="w-5 h-5 text-cyan-400 mb-1" />
                  <span>Tarjeta</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('apple_pay')}
                  className={`p-3 rounded-xl border flex flex-col items-center justify-center text-xs font-bold transition-all ${
                    paymentMethod === 'apple_pay'
                      ? 'bg-cyan-950 border-cyan-400 text-white shadow-[0_0_15px_rgba(0,240,255,0.2)]'
                      : 'bg-slate-900 border-slate-800 text-slate-400'
                  }`}
                >
                  <Smartphone className="w-5 h-5 text-slate-200 mb-1" />
                  <span>Apple Pay</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('google_pay')}
                  className={`p-3 rounded-xl border flex flex-col items-center justify-center text-xs font-bold transition-all ${
                    paymentMethod === 'google_pay'
                      ? 'bg-cyan-950 border-cyan-400 text-white shadow-[0_0_15px_rgba(0,240,255,0.2)]'
                      : 'bg-slate-900 border-slate-800 text-slate-400'
                  }`}
                >
                  <ShieldCheck className="w-5 h-5 text-emerald-400 mb-1" />
                  <span>Google Pay</span>
                </button>
              </div>
            </div>

            {/* Scannable QR Simple Bolivia */}
            {paymentMethod === 'qr_simple' && (
              <PaymentQRCode
                amountBs={selectedPackage.price}
                concept={selectedPackage.title}
                reference={qrReference}
                selectedBank={selectedBank}
                onBankChange={setSelectedBank}
                qrConfirmed={qrConfirmed}
                onSimulateScanConfirm={() => setQrConfirmed(true)}
              />
            )}

            {/* Credit Card Input Form Simulation */}
            {paymentMethod === 'credit_card' && (
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <div>
                  <label className="text-[10px] font-mono text-slate-400 uppercase">Número de Tarjeta (PCI-DSS Tokenizado)</label>
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 font-mono mt-1"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-mono text-slate-400 uppercase">Vencimiento</label>
                    <input
                      type="text"
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                      className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 font-mono mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-mono text-slate-400 uppercase">CVC / CVV</label>
                    <input
                      type="password"
                      value={cardCvc}
                      onChange={(e) => setCardCvc(e.target.value)}
                      className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 font-mono mt-1"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Order Total */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-slate-900 to-cyan-950/40 border border-cyan-500/30 flex justify-between items-center">
              <div>
                <div className="text-xs text-slate-400">Total a pagar:</div>
                <div className="text-xs text-cyan-400 font-mono">{selectedPackage.title}</div>
              </div>
              <div className="text-2xl font-black text-white font-tech">
                {selectedPackage.price} <span className="text-cyan-400">Bs</span>
              </div>
            </div>

            <div className="flex items-center space-x-2 text-[11px] text-emerald-400 font-mono">
              <Lock className="w-3.5 h-3.5" />
              <span>Conexión cifrada TLS 1.3 con pasarela certificada (Bolivia & Internacional)</span>
            </div>

            <div className="flex justify-between items-center pt-3">
              <button
                disabled={isProcessingPayment}
                onClick={() => setStep(2)}
                className="px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 text-xs font-bold hover:text-white"
              >
                Volver
              </button>

              <button
                disabled={isProcessingPayment}
                onClick={handleProcessPayment}
                className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-600 hover:from-cyan-300 text-slate-950 font-black text-xs uppercase tracking-wider transition-all shadow-[0_0_25px_rgba(0,240,255,0.4)] flex items-center space-x-2 disabled:opacity-50"
              >
                {isProcessingPayment ? (
                  <span>Procesando Pago Seguro...</span>
                ) : (
                  <span>Pagar {selectedPackage.price} Bs & Confirmar Cita</span>
                )}
              </button>
            </div>

          </div>
        )}

        {/* Step 4: Booking & Payment Confirmation */}
        {step === 4 && confirmedAppointment && (
          <div className="p-8 text-center space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-cyan-500/20 border-2 border-cyan-400 flex items-center justify-center mx-auto text-cyan-400 shadow-[0_0_30px_rgba(0,240,255,0.4)]">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <span className="text-xs font-mono bg-cyan-950 text-cyan-300 border border-cyan-500/50 px-3 py-1 rounded-full font-bold uppercase">
                ¡Turno Confirmado con Éxito!
              </span>
              <h3 className="text-2xl font-black text-white font-tech mt-3">
                Cita Agendada en BARBER IA
              </h3>
              <p className="text-xs text-slate-300 mt-1 max-w-sm mx-auto">
                Hemos enviado la confirmación y recordatorio push a tu dispositivo y correo.
              </p>
            </div>

            {/* Appointment Ticket */}
            <div className="max-w-md mx-auto p-4 rounded-xl bg-slate-950 border border-cyan-500/40 text-left font-mono text-xs space-y-2">
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-400">Token de Cita:</span>
                <span className="text-cyan-400 font-bold">{confirmedAppointment.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Cliente:</span>
                <span className="text-white font-bold">{confirmedAppointment.clientName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Paquete:</span>
                <span className="text-white font-bold">{confirmedAppointment.packageName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Barbero Asignado:</span>
                <span className="text-cyan-300">{confirmedAppointment.barberName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Fecha & Hora:</span>
                <span className="text-white font-bold">{confirmedAppointment.date} a las {confirmedAppointment.time} hs</span>
              </div>
              <div className="flex justify-between border-t border-slate-800 pt-2">
                <span className="text-slate-400">Estado de Pago:</span>
                <span className="text-emerald-400 font-bold">PAGADO ({confirmedAppointment.price} Bs)</span>
              </div>
            </div>

            <div className="flex justify-center space-x-3 pt-2">
              <button
                onClick={handleResetAndClose}
                className="px-6 py-3 rounded-xl bg-cyan-500 text-slate-950 font-black text-xs uppercase tracking-wider transition-all shadow-md"
              >
                Finalizar & Volver al Inicio
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
