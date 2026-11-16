import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { QrCode, Download, CheckCircle2, Clock, RefreshCw, Smartphone } from 'lucide-react';
import { buildBolivianQRPayload } from '../services/currency';

interface PaymentQRCodeProps {
  amountBs: number;
  concept: string;
  reference: string;
  selectedBank: string;
  onBankChange: (bank: string) => void;
  qrConfirmed?: boolean;
  onSimulateScanConfirm?: () => void;
}

const BOLIVIA_BANKS = [
  { id: 'SIMPLE', name: 'QR Simple Universal (Todos los Bancos)' },
  { id: 'BNB', name: 'Banco Nacional de Bolivia (BNB)' },
  { id: 'UNION', name: 'Banco Unión S.A.' },
  { id: 'BCP', name: 'Banco de Crédito BCP' },
  { id: 'BMSC', name: 'Banco Mercantil Santa Cruz' },
  { id: 'YAPE', name: 'Yape Bolivia / Tigo Money' },
];

export const PaymentQRCode: React.FC<PaymentQRCodeProps> = ({
  amountBs,
  concept,
  reference,
  selectedBank,
  onBankChange,
  qrConfirmed = false,
  onSimulateScanConfirm,
}) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [secondsLeft, setSecondsLeft] = useState<number>(899); // 15 min validity
  const [regenerating, setRegenerating] = useState<boolean>(false);

  const generateQR = async () => {
    setRegenerating(true);
    try {
      const payload = buildBolivianQRPayload({
        reference,
        amountBs,
        bankCode: selectedBank,
        concept,
      });

      const dataUrl = await QRCode.toDataURL(payload, {
        width: 280,
        margin: 2,
        color: {
          dark: '#05070d',
          light: '#ffffff',
        },
        errorCorrectionLevel: 'M',
      });
      setQrDataUrl(dataUrl);
    } catch (err) {
      console.error('Error generating QR code:', err);
    } finally {
      setRegenerating(false);
    }
  };

  useEffect(() => {
    generateQR();
  }, [amountBs, reference, selectedBank, concept]);

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60).toString().padStart(2, '0');
    const s = (sec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleDownloadQR = () => {
    if (!qrDataUrl) return;
    const link = document.createElement('a');
    link.href = qrDataUrl;
    link.download = `QR_BARBER_IA_${reference}_${amountBs}Bs.png`;
    link.click();
  };

  return (
    <div className="p-4 rounded-xl bg-slate-950 border border-cyan-500/40 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
        <span className="font-bold text-white font-mono flex items-center gap-1.5">
          <QrCode className="w-4 h-4 text-cyan-400" />
          QR Simple Interbancario (Bolivia)
        </span>
        <div className="flex items-center space-x-2">
          <span className="text-[10px] text-amber-300 font-mono flex items-center gap-1 bg-amber-950/50 border border-amber-500/30 px-2 py-0.5 rounded">
            <Clock className="w-3 h-3" />
            Válido: {formatTimer(secondsLeft)}
          </span>
          <span className="text-[10px] text-emerald-400 font-mono font-bold bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded">
            ASFI Verificado
          </span>
        </div>
      </div>

      {/* Bank Selector */}
      <div>
        <label className="text-[10px] font-mono text-slate-400 uppercase block mb-1">
          Entidad Financiera / Billetera Móvil
        </label>
        <select
          value={selectedBank}
          onChange={(e) => onBankChange(e.target.value)}
          className="w-full p-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-cyan-300 font-mono focus:outline-none focus:border-cyan-400"
        >
          {BOLIVIA_BANKS.map((bank) => (
            <option key={bank.id} value={bank.id}>
              {bank.name}
            </option>
          ))}
        </select>
      </div>

      {/* QR Visual + Details */}
      <div className="flex flex-col sm:flex-row items-center gap-4 bg-slate-900/80 p-3.5 rounded-xl border border-slate-800">
        <div className="relative bg-white p-2.5 rounded-xl shrink-0 shadow-[0_0_25px_rgba(0,240,255,0.25)]">
          {qrDataUrl && !regenerating ? (
            <img
              src={qrDataUrl}
              alt={`Código QR para pago de ${amountBs} Bs`}
              className="w-36 h-36 sm:w-40 sm:h-40 object-contain"
            />
          ) : (
            <div className="w-36 h-36 sm:w-40 sm:h-40 flex items-center justify-center text-slate-900">
              <RefreshCw className="w-6 h-6 animate-spin" />
            </div>
          )}

          {qrConfirmed && (
            <div className="absolute inset-0 bg-emerald-950/90 rounded-xl flex flex-col items-center justify-center text-emerald-400 p-2 text-center">
              <CheckCircle2 className="w-10 h-10 mb-1" />
              <span className="text-[11px] font-mono font-bold uppercase">Pago QR Validado</span>
            </div>
          )}
        </div>

        <div className="flex-1 space-y-2 text-[11px] text-slate-300 font-mono w-full">
          <div className="p-2 bg-slate-950 rounded-lg border border-slate-800 space-y-1">
            <div className="flex justify-between">
              <span className="text-slate-500">Monto Exacto:</span>
              <span className="text-cyan-400 font-bold text-sm">{amountBs} Bs</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Referencia QR:</span>
              <span className="text-white">{reference}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Moneda:</span>
              <span className="text-emerald-400">BOB (Bolivianos)</span>
            </div>
          </div>

          <p className="text-[10px] text-slate-400 leading-relaxed flex items-start gap-1.5">
            <Smartphone className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
            <span>Abre la app de tu banco en Bolivia, selecciona <strong>"Pagar con QR"</strong> y escanea este código generado en tiempo real.</span>
          </p>

          <div className="flex flex-wrap gap-2 pt-1">
            <button
              type="button"
              onClick={handleDownloadQR}
              className="flex-1 py-1.5 px-2.5 rounded-lg bg-slate-950 border border-slate-700 hover:border-cyan-400 text-cyan-300 text-[10px] font-bold flex items-center justify-center gap-1 transition-colors"
            >
              <Download className="w-3 h-3" />
              <span>Descargar QR</span>
            </button>

            <button
              type="button"
              onClick={generateQR}
              className="py-1.5 px-2.5 rounded-lg bg-slate-950 border border-slate-700 hover:border-cyan-400 text-slate-300 text-[10px] font-bold flex items-center justify-center gap-1 transition-colors"
              title="Regenerar código QR"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Actualizar</span>
            </button>

            {onSimulateScanConfirm && !qrConfirmed && (
              <button
                type="button"
                onClick={onSimulateScanConfirm}
                className="w-full py-1.5 px-2.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500 border border-emerald-500/50 text-emerald-300 hover:text-slate-950 text-[10px] font-bold transition-all"
              >
                ✓ Ya escaneé y pagué el QR
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
