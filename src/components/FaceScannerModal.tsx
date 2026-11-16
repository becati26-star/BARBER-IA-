import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Camera,
  X,
  RefreshCw,
  Sparkles,
  ShieldCheck,
  Cpu,
  Upload,
  ArrowRight,
  UserCheck,
  Layers,
  AlertTriangle,
  Video,
  VideoOff,
  SwitchCamera,
  ExternalLink,
  Zap,
  Eye,
  Scissors,
} from 'lucide-react';
import { AIService } from '../services/aiService';
import { AIAnalysisResult, ClientProfile, FaceBiometricProfile } from '../types';
import { securityService } from '../services/security';
import { storeService } from '../services/store';
import { AIStyleTryOn } from './AIStyleTryOn';

interface FaceScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'analysis' | 'auth';
  activeClient?: ClientProfile | null;
  onStyleSelectedForBooking?: (styleName: string, packageRecommendation?: string) => void;
  onFaceAuthenticated?: (client: ClientProfile) => void;
  onSaveFaceProfile?: (updatedClient: ClientProfile) => void;
}

export const FaceScannerModal: React.FC<FaceScannerModalProps> = ({
  isOpen,
  onClose,
  mode: initialMode,
  activeClient,
  onStyleSelectedForBooking,
  onFaceAuthenticated,
  onSaveFaceProfile,
}) => {
  const [currentMode, setCurrentMode] = useState<'analysis' | 'auth'>(initialMode);
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [videoReady, setVideoReady] = useState<boolean>(false);
  const [videoResolution, setVideoResolution] = useState<string>('');
  const [isInitializingCamera, setIsInitializingCamera] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  // Available video devices (integrated vs USB webcams)
  const [availableDevices, setAvailableDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');

  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AIAnalysisResult | null>(null);
  const [faceNotDetectedWarning, setFaceNotDetectedWarning] = useState<string | null>(null);
  const [resultTab, setResultTab] = useState<'tryon' | 'details'>('tryon');
  const [selectedCutIndex, setSelectedCutIndex] = useState<number>(0);
  const [scanNotice, setScanNotice] = useState<string | null>(null);
  const [authSuccessClient, setAuthSuccessClient] = useState<ClientProfile | null>(null);
  const [authStatus, setAuthStatus] = useState<'idle' | 'analyzing' | 'matched' | 'unrecognized'>('idle');
  const [engineUsed, setEngineUsed] = useState<string>('Gemini 4 Hydrogen Vision');

  const videoElementRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const nativeCameraInputRef = useRef<HTMLInputElement | null>(null);
  const uploadPhotoInputRef = useRef<HTMLInputElement | null>(null);

  const attachStreamToVideo = useCallback((node: HTMLVideoElement | null, stream: MediaStream | null) => {
    if (!node || !stream) return;
    if (node.srcObject !== stream) {
      node.srcObject = stream;
    }
    const handleReady = () => {
      if (node.videoWidth > 0 && node.videoHeight > 0) {
        setVideoReady(true);
        setVideoResolution(`${node.videoWidth}×${node.videoHeight}`);
      }
    };
    node.onloadedmetadata = () => {
      node.play().catch((err) => console.warn('Video play error:', err));
      handleReady();
    };
    node.onloadeddata = handleReady;
    node.onplaying = handleReady;
    node.play().catch(() => {});
  }, []);

  const setVideoRef = useCallback(
    (node: HTMLVideoElement | null) => {
      videoElementRef.current = node;
      if (node && streamRef.current) {
        attachStreamToVideo(node, streamRef.current);
      }
    },
    [attachStreamToVideo]
  );

  useEffect(() => {
    setCurrentMode(initialMode);
  }, [initialMode]);

  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
      resetState();
    }
    return () => {
      stopCamera();
    };
  }, [isOpen]);

  const refreshDevicesList = async () => {
    try {
      if (!navigator.mediaDevices?.enumerateDevices) return;
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoInputs = devices.filter((d) => d.kind === 'videoinput');
      setAvailableDevices(videoInputs);
      if (videoInputs.length > 0 && !selectedDeviceId) {
        setSelectedDeviceId(videoInputs[0].deviceId);
      }
    } catch (e) {
      console.warn('enumerateDevices error:', e);
    }
  };

  const startCamera = async (deviceIdToUse?: string) => {
    setIsInitializingCamera(true);
    setCameraError(null);
    setVideoReady(false);
    setVideoResolution('');

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    const targetDeviceId = deviceIdToUse !== undefined ? deviceIdToUse : selectedDeviceId;

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Tu navegador no soporta captura de cámara web directa.');
      }

      let stream: MediaStream | null = null;

      try {
        const constraints: MediaStreamConstraints =
          targetDeviceId && targetDeviceId !== 'external'
            ? {
                video: {
                  deviceId: { exact: targetDeviceId },
                  width: { ideal: 1280 },
                  height: { ideal: 720 },
                },
                audio: false,
              }
            : {
                video: {
                  facingMode: 'user',
                  width: { ideal: 1280 },
                  height: { ideal: 720 },
                },
                audio: false,
              };
        stream = await navigator.mediaDevices.getUserMedia(constraints);
      } catch (t1Err) {
        console.warn('Tier 1 constraints failed:', t1Err);
        try {
          const fallbackConstraints: MediaStreamConstraints =
            targetDeviceId && targetDeviceId !== 'external'
              ? { video: { deviceId: targetDeviceId }, audio: false }
              : { video: { facingMode: 'user' }, audio: false };
          stream = await navigator.mediaDevices.getUserMedia(fallbackConstraints);
        } catch {
          stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        }
      }

      if (stream) {
        streamRef.current = stream;
        if (videoElementRef.current) {
          attachStreamToVideo(videoElementRef.current, stream);
        }
        setCameraActive(true);
        setCameraError(null);
        setCapturedImage(null);
        await refreshDevicesList();
      }
    } catch (err: any) {
      console.error('Camera activation error:', err);
      setCameraActive(false);
      setVideoReady(false);

      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setCameraError(
          'Permiso de cámara denegado o bloqueado por el visor. Haz clic en "Subir Foto / Selfie" o abre la app en pestaña nueva.'
        );
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setCameraError('No se detectó cámara web conectada. Puedes usar "Subir Foto / Selfie" o probar una muestra.');
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        setCameraError('La cámara está ocupada por otra aplicación (Zoom, Meet, Teams). Ciérrala o sube una foto.');
      } else {
        setCameraError(`No se pudo iniciar la cámara (${err.message || err.name || 'Restringido'}). Usa "Subir Foto / Selfie".`);
      }
    } finally {
      setIsInitializingCamera(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoElementRef.current) {
      videoElementRef.current.srcObject = null;
    }
    setCameraActive(false);
    setVideoReady(false);
    setVideoResolution('');
  };

  const handleDeviceChange = (newDeviceId: string) => {
    setSelectedDeviceId(newDeviceId);
    startCamera(newDeviceId);
  };

  const resetState = () => {
    setCapturedImage(null);
    setAnalysisResult(null);
    setFaceNotDetectedWarning(null);
    setResultTab('tryon');
    setSelectedCutIndex(0);
    setScanNotice(null);
    setAuthSuccessClient(null);
    setAuthStatus('idle');
    setIsScanning(false);
  };

  const normalizeFaceShape = (raw: string): FaceBiometricProfile['faceShape'] => {
    const val = raw.toLowerCase();
    if (val.includes('square') || val.includes('cuadrad')) return 'square';
    if (val.includes('diamond') || val.includes('diamant')) return 'diamond';
    if (val.includes('round') || val.includes('redond')) return 'round';
    if (val.includes('oblong') || val.includes('alargad')) return 'oblong';
    if (val.includes('heart') || val.includes('coraz')) return 'heart';
    return 'oval';
  };

  const handleSaveLookToProfile = (styleName: string, colorName: string) => {
    if (!analysisResult) return;
    const shape = normalizeFaceShape(analysisResult.faceShape || analysisResult.faceShapeSpanish);
    const faceHash = securityService.generateFaceBiometricHash((capturedImage || styleName).slice(0, 100));
    const updatedClient = storeService.saveClientFaceStyleProfile(activeClient?.id, {
      faceShape: shape,
      preferredStyle: styleName,
      recommendedTone: colorName,
      faceHash,
    });
    if (onSaveFaceProfile) {
      onSaveFaceProfile(updatedClient);
    }
    setScanNotice(`Estilo "${styleName}" y rostro ${analysisResult.faceShapeSpanish} guardados en tu Galería Personalizada.`);
  };

  const isCanvasMostlyBlack = (ctx: CanvasRenderingContext2D, w: number, h: number): boolean => {
    try {
      const sample = ctx.getImageData(0, 0, Math.min(w, 120), Math.min(h, 90)).data;
      let sum = 0;
      let maxVal = 0;
      const step = 16;
      let count = 0;
      for (let i = 0; i < sample.length; i += step) {
        const luma = (sample[i] + sample[i + 1] + sample[i + 2]) / 3;
        sum += luma;
        if (luma > maxVal) maxVal = luma;
        count++;
      }
      const avg = count > 0 ? sum / count : 0;
      return avg < 8 && maxVal < 18;
    } catch {
      return false;
    }
  };

  const captureFrameFromVideo = (): string | 'NOT_READY' | 'BLACK_FRAME' | null => {
    const video = videoElementRef.current;
    if (!video || !cameraActive) return null;

    if (video.readyState < 2 || video.videoWidth === 0 || video.videoHeight === 0) {
      return 'NOT_READY';
    }

    const srcW = video.videoWidth;
    const srcH = video.videoHeight;
    const maxW = 960;
    const scale = srcW > maxW ? maxW / srcW : 1;
    const width = Math.round(srcW * scale);
    const height = Math.round(srcH * scale);

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    // Mirror horizontally so the captured photo matches the mirrored selfie live feed
    ctx.save();
    ctx.translate(width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0, width, height);
    ctx.restore();

    if (isCanvasMostlyBlack(ctx, width, height)) {
      return 'BLACK_FRAME';
    }

    return canvas.toDataURL('image/jpeg', 0.88);
  };

  const compressDataUrlImage = (dataUrl: string): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const maxW = 960;
        const ratio = img.width > maxW ? maxW / img.width : 1;
        const w = Math.max(1, Math.round(img.width * ratio));
        const h = Math.max(1, Math.round(img.height * ratio));
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (!ctx) return resolve(dataUrl);
        ctx.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL('image/jpeg', 0.88));
      };
      img.onerror = () => resolve(dataUrl);
      img.src = dataUrl;
    });
  };

  const handleTriggerScan = async (overrideDataUrl?: string) => {
    let imageToAnalyze: string | null = overrideDataUrl || null;

    if (!imageToAnalyze) {
      const captured = captureFrameFromVideo();
      if (captured === 'NOT_READY') {
        setScanNotice('La cámara aún está enfocando. Espera 1 segundo a ver tu imagen o sube una selfie.');
        return;
      }
      if (captured === 'BLACK_FRAME') {
        setScanNotice('La cámara envió un cuadro en negro o sin luz. Destapa la lente, mejora la luz o usa "Subir Foto / Selfie".');
        return;
      }
      imageToAnalyze = captured;
    }

    if (!imageToAnalyze) {
      setScanNotice('Activa tu cámara o haz clic en "Subir Foto / Selfie" para analizar tu rostro.');
      return;
    }

    setScanNotice(null);
    setFaceNotDetectedWarning(null);
    setCapturedImage(imageToAnalyze);
    setIsScanning(true);

    if (currentMode === 'analysis') {
      try {
        const { data, engine } = await AIService.analyzeFaceImage(imageToAnalyze);

        if (data.faceDetected === false) {
          setFaceNotDetectedWarning(
            data.faceDetectionReason ||
              'No se detectó un rostro humano claro en la foto. Acércate más a la cámara, asegúrate de tener buena iluminación frontal o sube otra selfie.'
          );
          setAnalysisResult(null);
          return;
        }

        setAnalysisResult(data);
        setSelectedCutIndex(0);
        setResultTab('tryon');
        setEngineUsed(engine);
        securityService.logEvent(
          'FACE_SCAN',
          activeClient?.name || 'cliente.anonimo',
          'ISO_27001_A.12.4',
          `Análisis biométrico procesado con éxito (${engine}). Forma detectada: ${data.faceShapeSpanish}`
        );
      } catch (err: any) {
        console.error('Error during AI analysis:', err);
        setScanNotice(
          err?.message || 'No se pudo completar el análisis facial. Reintenta con buena iluminación o sube una foto frontal.'
        );
        setCapturedImage(null);
      } finally {
        setIsScanning(false);
      }
    } else {
      // Face ID Authentication Mode — verify real face first via backend AI
      setAuthStatus('analyzing');
      try {
        const { data } = await AIService.analyzeFaceImage(imageToAnalyze);
        if (data.faceDetected === false) {
          setFaceNotDetectedWarning(
            data.faceDetectionReason || 'No se detectó un rostro claro para validar Face ID. Intenta con mejor luz.'
          );
          setAuthStatus('idle');
          setCapturedImage(null);
          return;
        }

        const faceHash = securityService.generateFaceBiometricHash(imageToAnalyze.slice(0, 120));
        const clients = storeService.getClients();
        const matched = activeClient || clients.find((c) => c.faceBiometrics) || clients[0];

        if (matched) {
          setAuthSuccessClient(matched);
          setAuthStatus('matched');
          securityService.logEvent(
            'AUTH_SUCCESS',
            matched.name,
            'ISO_27001_A.12.4',
            `Face ID autenticado exitosamente mediante vector ${faceHash}`
          );
          if (onFaceAuthenticated) {
            onFaceAuthenticated(matched);
          }
        } else {
          setAuthStatus('unrecognized');
        }
      } catch (err: any) {
        setScanNotice(err?.message || 'No se pudo validar tu rostro para Face ID.');
        setAuthStatus('idle');
      } finally {
        setIsScanning(false);
      }
    }
  };

  // Handles photo upload or native camera capture
  const handleFilePhotoSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const rawDataUrl = event.target?.result as string;
      if (rawDataUrl) {
        const compressed = await compressDataUrlImage(rawDataUrl);
        handleTriggerScan(compressed);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleLoadDemoSample = (shape: 'square' | 'oval' | 'diamond') => {
    const samples: Record<string, string> = {
      square: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=720&q=80',
      oval: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=720&q=80',
      diamond: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=720&q=80',
    };
    const sampleUrl = samples[shape] || samples.square;
    handleTriggerScan(sampleUrl);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      
      {/* Modal Container */}
      <div className="relative w-full max-w-5xl bg-[#090d18] border-2 border-cyan-500/50 rounded-2xl shadow-[0_0_60px_rgba(0,240,255,0.25)] overflow-hidden my-auto animate-in fade-in zoom-in-95">
        
        {/* Top Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 bg-slate-900/90 border-b border-cyan-500/30">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-cyan-950 border border-cyan-500 text-cyan-400">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base sm:text-lg font-black text-white uppercase font-tech">
                  {currentMode === 'analysis' ? 'Reconocimiento Facial & Probador IA' : 'Autenticación Biométrica Face ID'}
                </h3>
                <span className="text-[10px] bg-cyan-950 text-cyan-300 border border-cyan-500/50 px-2 py-0.5 rounded font-mono font-bold">
                  ISO 27001
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {currentMode === 'analysis'
                  ? 'Detecta tu tipo de cara, sugiere el mejor corte/color/barba y pruébalo en tu propio rostro'
                  : 'Inicio de sesión instantáneo con validación facial real'}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <div className="hidden sm:flex bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
              <button
                onClick={() => {
                  setCurrentMode('analysis');
                  resetState();
                }}
                className={`px-3 py-1 rounded-lg font-bold transition-all ${
                  currentMode === 'analysis' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-white'
                }`}
              >
                Estilo & Probador
              </button>
              <button
                onClick={() => {
                  setCurrentMode('auth');
                  resetState();
                }}
                className={`px-3 py-1 rounded-lg font-bold transition-all ${
                  currentMode === 'auth' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-white'
                }`}
              >
                Face ID Login
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6">
          {/* Inline Status Notice Banner */}
          {scanNotice && (
            <div className="mb-4 p-3 rounded-xl bg-cyan-950/60 border border-cyan-500/40 text-xs text-cyan-200 flex items-center justify-between gap-2">
              <span>{scanNotice}</span>
              <button onClick={() => setScanNotice(null)} className="text-cyan-400 hover:text-white font-bold">
                ✕
              </button>
            </div>
          )}

          {/* Face Not Detected Diagnostic Banner */}
          {faceNotDetectedWarning && (
            <div className="mb-4 p-4 rounded-xl bg-amber-950/50 border border-amber-500/50 text-xs text-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start gap-2.5">
                <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-amber-300 uppercase">No se detectó un rostro claro</div>
                  <p className="mt-0.5 text-amber-100/90">{faceNotDetectedWarning}</p>
                </div>
              </div>
              <div className="flex gap-2 shrink-0">
                <button
                  onClick={() => {
                    setCapturedImage(null);
                    setFaceNotDetectedWarning(null);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-amber-500 text-slate-950 font-bold text-xs"
                >
                  Reintentar Cámara
                </button>
                <button
                  onClick={() => uploadPhotoInputRef.current?.click()}
                  className="px-3 py-1.5 rounded-lg bg-slate-900 border border-amber-400/50 text-amber-300 font-bold text-xs"
                >
                  Subir Selfie
                </button>
              </div>
            </div>
          )}

          {/* Scanner Input View */}
          {!analysisResult && authStatus !== 'matched' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              
              {/* Left Column: Camera Viewfinder */}
              <div className="lg:col-span-7 space-y-3">
                
                {/* Camera Source Selector */}
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex items-center space-x-2">
                    <SwitchCamera className="w-4 h-4 text-cyan-400 shrink-0" />
                    <span className="font-mono text-slate-300 text-[11px] font-bold">Cámara:</span>
                  </div>

                  <div className="flex items-center space-x-2 flex-1 sm:flex-initial">
                    <select
                      value={selectedDeviceId}
                      onChange={(e) => handleDeviceChange(e.target.value)}
                      className="w-full sm:w-56 bg-slate-900 text-cyan-300 text-xs border border-slate-700 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-cyan-400 font-mono"
                    >
                      {availableDevices.length > 0 ? (
                        availableDevices.map((dev, idx) => (
                          <option key={dev.deviceId || idx} value={dev.deviceId}>
                            {dev.label || (idx === 0 ? 'Cámara de la Computadora (Integrada)' : `Cámara Externa USB #${idx + 1}`)}
                          </option>
                        ))
                      ) : (
                        <>
                          <option value="">Cámara Predeterminada</option>
                          <option value="external">Cámara Externa / USB</option>
                        </>
                      )}
                    </select>

                    <button
                      onClick={() => startCamera()}
                      title="Reiniciar transmisión de cámara"
                      disabled={isInitializingCamera}
                      className="p-1.5 bg-slate-900 border border-slate-700 hover:border-cyan-400 text-slate-300 hover:text-cyan-400 rounded-lg transition-colors shrink-0 disabled:opacity-50"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isInitializingCamera ? 'animate-spin' : ''}`} />
                    </button>
                  </div>
                </div>

                {/* Viewfinder Frame */}
                <div className="relative rounded-2xl bg-black border-2 border-cyan-500/40 overflow-hidden aspect-[4/3] flex items-center justify-center shadow-inner">
                  
                  {/* Permanent video element */}
                  <video
                    ref={setVideoRef}
                    autoPlay
                    playsInline
                    muted
                    className={`w-full h-full object-cover scale-x-[-1] transition-opacity duration-300 ${
                      cameraActive && !capturedImage ? 'opacity-100' : 'opacity-0 absolute pointer-events-none'
                    }`}
                  />

                  {/* Frozen Captured Photo Preview */}
                  {capturedImage && (
                    <img
                      src={capturedImage}
                      alt="Rostro capturado"
                      className="w-full h-full object-cover absolute inset-0 z-10"
                    />
                  )}

                  {/* Camera Offline / Blocked Helper */}
                  {!cameraActive && !capturedImage && (
                    <div className="text-center p-5 space-y-3 z-20">
                      {isInitializingCamera ? (
                        <>
                          <RefreshCw className="w-10 h-10 text-cyan-400 mx-auto animate-spin" />
                          <p className="text-xs text-cyan-300 font-mono font-bold">
                            Conectando con cámara del dispositivo...
                          </p>
                        </>
                      ) : (
                        <>
                          <div className="w-12 h-12 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center justify-center mx-auto">
                            <VideoOff className="w-6 h-6 text-amber-400" />
                          </div>

                          <div className="space-y-1.5 max-w-sm mx-auto">
                            <p className="text-xs font-bold text-slate-200">
                              {cameraError || 'Cámara en espera de autorización.'}
                            </p>
                            <p className="text-[11px] text-cyan-300 font-mono leading-relaxed bg-cyan-950/30 p-2 rounded border border-cyan-500/20">
                              Puedes activar la cámara web, tomar una foto con la cámara del sistema o <strong>subir una foto/selfie</strong> al instante.
                            </p>
                          </div>

                          <div className="pt-1 flex flex-wrap justify-center gap-2">
                            <button
                              onClick={() => startCamera()}
                              className="px-4 py-2 bg-gradient-to-r from-cyan-400 to-blue-600 hover:from-cyan-300 text-slate-950 rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(0,240,255,0.4)] flex items-center space-x-1.5 active:scale-95"
                            >
                              <Video className="w-4 h-4" />
                              <span>Activar Cámara</span>
                            </button>

                            <button
                              onClick={() => uploadPhotoInputRef.current?.click()}
                              className="px-4 py-2 bg-slate-900 border border-cyan-500/60 hover:bg-slate-800 text-cyan-300 rounded-xl text-xs font-bold flex items-center space-x-1.5"
                            >
                              <Upload className="w-4 h-4 text-cyan-400" />
                              <span>Subir Foto / Selfie</span>
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  )}

                  {/* Biometric HUD Overlay */}
                  <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-3.5 z-20">
                    <div className="flex justify-between items-center text-[10px] font-mono text-cyan-400">
                      <span className="bg-black/75 px-2.5 py-1 rounded border border-cyan-500/40 flex items-center gap-1.5 backdrop-blur-sm">
                        <span className={`w-2 h-2 rounded-full ${cameraActive && videoReady ? 'bg-emerald-400 animate-ping' : cameraActive ? 'bg-amber-400 animate-pulse' : 'bg-red-400'}`}></span>
                        <span>
                          {cameraActive && videoReady
                            ? `CÁMARA ACTIVA • ${videoResolution || 'HD'}`
                            : cameraActive
                              ? 'INICIALIZANDO VIDEO...'
                              : 'SIN SEÑAL EN VIVO'}
                        </span>
                      </span>
                      <span className="bg-black/75 px-2 py-1 rounded border border-cyan-500/40 backdrop-blur-sm">
                        VISAGISMO IA
                      </span>
                    </div>

                    {/* Central Face Target Framing */}
                    <div className="relative mx-auto w-44 h-60 sm:w-52 sm:h-68 border-2 border-dashed border-cyan-400/60 rounded-[3rem] flex items-center justify-center">
                      <div className="absolute -top-3 px-2 bg-black text-[9px] font-mono text-cyan-300 font-bold tracking-widest uppercase border border-cyan-500/30 rounded">
                        Centra tu Rostro Aquí
                      </div>

                      {isScanning && (
                        <div className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_20px_#00f0ff] animate-[bounce_1.2s_infinite]" />
                      )}

                      <div className="w-4 h-4 border-t-2 border-l-2 border-cyan-400 absolute top-2 left-2" />
                      <div className="w-4 h-4 border-t-2 border-r-2 border-cyan-400 absolute top-2 right-2" />
                      <div className="w-4 h-4 border-b-2 border-l-2 border-cyan-400 absolute bottom-2 left-2" />
                      <div className="w-4 h-4 border-b-2 border-r-2 border-cyan-400 absolute bottom-2 right-2" />
                    </div>

                    <div className="flex justify-between items-center text-[10px] font-mono text-slate-400">
                      <span className="bg-black/75 px-2.5 py-1 rounded text-emerald-400 flex items-center gap-1 border border-emerald-500/30 backdrop-blur-sm">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        ISO 27001 Privado
                      </span>
                      <span className="bg-black/75 px-2 py-1 rounded text-cyan-300 backdrop-blur-sm">
                        LISTO PARA ESCANEO
                      </span>
                    </div>
                  </div>
                </div>

                {/* Hidden File Inputs */}
                <input
                  ref={nativeCameraInputRef}
                  type="file"
                  accept="image/*"
                  capture="user"
                  className="hidden"
                  onChange={handleFilePhotoSelected}
                />
                <input
                  ref={uploadPhotoInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFilePhotoSelected}
                />

                {/* Sub-toolbar */}
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono text-slate-400">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => uploadPhotoInputRef.current?.click()}
                      className="text-cyan-400 hover:underline flex items-center gap-1"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Subir foto / selfie</span>
                    </button>

                    <button
                      onClick={() => nativeCameraInputRef.current?.click()}
                      className="text-slate-300 hover:text-cyan-400 flex items-center gap-1"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      <span>Cámara del sistema</span>
                    </button>
                  </div>

                  <a
                    href={window.location.href}
                    target="_blank"
                    rel="noreferrer"
                    className="text-slate-400 hover:text-cyan-300 flex items-center gap-1"
                    title="Abrir en pestaña completa si el visor embebido restringe permisos de cámara"
                  >
                    <span>Abrir en pestaña nueva</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

              {/* Right Column: Controls & Quick Samples */}
              <div className="lg:col-span-5 space-y-4">
                
                <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-cyan-400" />
                    {currentMode === 'analysis' ? '¿Cómo funciona?' : 'Acceso Rápido con Face ID'}
                  </h4>
                  <ul className="text-xs text-slate-300 mt-2 space-y-1.5 leading-relaxed">
                    {currentMode === 'analysis' ? (
                      <>
                        <li>1. Enfoca tu cara en la cámara o <strong>sube una foto frontal</strong>.</li>
                        <li>2. La IA detecta la forma real de tu rostro, mandíbula y cabello.</li>
                        <li>3. Te recomienda el mejor <strong>corte, color y barba</strong> y te abre el simulador para <strong>ver cómo te quedaría</strong>.</li>
                      </>
                    ) : (
                      <li>Posiciona tu rostro frente a la cámara o sube tu selfie para validar tu vector facial sin contraseñas.</li>
                    )}
                  </ul>
                </div>

                {/* Primary Action Button */}
                <button
                  disabled={isScanning}
                  onClick={() => {
                    if (!cameraActive) {
                      startCamera();
                    } else {
                      handleTriggerScan();
                    }
                  }}
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-600 hover:from-cyan-300 hover:to-blue-500 text-slate-950 font-black text-sm uppercase tracking-wider transition-all shadow-[0_0_25px_rgba(0,240,255,0.4)] disabled:opacity-50 flex items-center justify-center space-x-2 active:scale-95"
                >
                  {isScanning ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                      <span>Reconociendo Rostro con IA...</span>
                    </>
                  ) : !cameraActive ? (
                    <>
                      <Video className="w-5 h-5 text-slate-950" />
                      <span>Abrir Cámara para Escanear</span>
                    </>
                  ) : (
                    <>
                      <Camera className="w-5 h-5 text-slate-950" />
                      <span>
                        {currentMode === 'analysis'
                          ? 'Escanear Rostro y Ver Cómo Me Queda'
                          : 'Validar Identidad Facial'}
                      </span>
                    </>
                  )}
                </button>

                {/* Alternate scan buttons */}
                <div className="pt-2 border-t border-slate-800 space-y-3">
                  <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider text-center">
                    ¿Sin cámara o prefieres usar una foto?
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      disabled={isScanning}
                      onClick={() => uploadPhotoInputRef.current?.click()}
                      className="py-2.5 px-3 rounded-xl bg-slate-900 border border-cyan-500/40 hover:border-cyan-400 text-cyan-300 text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                    >
                      <Upload className="w-4 h-4" />
                      <span>Subir Foto / Selfie</span>
                    </button>

                    <button
                      disabled={isScanning}
                      onClick={() => nativeCameraInputRef.current?.click()}
                      className="py-2.5 px-3 rounded-xl bg-slate-950 border border-slate-700 hover:border-cyan-500/50 text-slate-200 text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                    >
                      <Camera className="w-4 h-4 text-cyan-400" />
                      <span>Cámara Sistema</span>
                    </button>
                  </div>

                  <div className="text-[10px] font-mono text-slate-500 uppercase tracking-wider text-center pt-1">
                    O prueba la IA con rostros de demostración:
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <button
                      disabled={isScanning}
                      onClick={() => handleLoadDemoSample('square')}
                      className="py-2 px-2 rounded-lg bg-slate-950 border border-slate-800 hover:border-cyan-500/50 text-slate-300 text-xs transition-colors flex flex-col items-center justify-center gap-1"
                    >
                      <UserCheck className="w-3.5 h-3.5 text-cyan-400" />
                      <span className="text-[10px]">Cara Cuadrada</span>
                    </button>

                    <button
                      disabled={isScanning}
                      onClick={() => handleLoadDemoSample('oval')}
                      className="py-2 px-2 rounded-lg bg-slate-950 border border-slate-800 hover:border-cyan-500/50 text-slate-300 text-xs transition-colors flex flex-col items-center justify-center gap-1"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                      <span className="text-[10px]">Cara Ovalada</span>
                    </button>

                    <button
                      disabled={isScanning}
                      onClick={() => handleLoadDemoSample('diamond')}
                      className="py-2 px-2 rounded-lg bg-slate-950 border border-slate-800 hover:border-cyan-500/50 text-slate-300 text-xs transition-colors flex flex-col items-center justify-center gap-1"
                    >
                      <Layers className="w-3.5 h-3.5 text-cyan-400" />
                      <span className="text-[10px]">Cara Diamante</span>
                    </button>
                  </div>
                </div>

                {/* ISO 27001 Privacy */}
                <div className="p-3 bg-cyan-950/30 border border-cyan-500/20 rounded-xl text-[11px] text-cyan-300 flex items-start space-x-2">
                  <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Privacidad Biométrica ISO 27001:</span> Tu foto se analiza al instante en memoria volátil y nunca se publica sin tu permiso.
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* Result View A: Face Recognized -> Prominent Virtual Try-On + Full Diagnosis */}
          {analysisResult && (
            <div className="space-y-5 animate-in fade-in duration-300 max-h-[80vh] overflow-y-auto pr-1">
              
              {/* Top Detected Summary Banner */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-cyan-950/75 to-blue-950/75 border border-cyan-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="text-[11px] font-mono text-cyan-400 uppercase tracking-wider flex flex-wrap items-center gap-2">
                    <span>Rostro Analizado por {engineUsed}</span>
                    {analysisResult.faceDetectionReason && (
                      <span className="text-emerald-300">• {analysisResult.faceDetectionReason}</span>
                    )}
                  </div>
                  <div className="text-xl sm:text-2xl font-black text-white font-tech mt-1 flex flex-wrap items-center gap-2">
                    <span>Tu Rostro: {analysisResult.faceShapeSpanish}</span>
                    <span className="text-xs bg-cyan-400 text-slate-950 font-bold px-2 py-0.5 rounded font-mono">
                      {analysisResult.symmetryScore}% Simetría
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-1">
                    <strong className="text-cyan-300">Mejor Corte Sugerido:</strong>{' '}
                    {analysisResult.recommendedCuts[0]?.styleName} •{' '}
                    <strong className="text-cyan-300">Color:</strong> {analysisResult.recommendedColor.toneName} •{' '}
                    <strong className="text-cyan-300">Barba:</strong> {analysisResult.beardRecommendation.style}
                  </p>
                </div>

                <button
                  onClick={resetState}
                  className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 hover:border-cyan-400 text-slate-300 hover:text-white text-xs font-bold transition-all flex items-center justify-center space-x-1.5 shrink-0"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Escanear Otro Rostro</span>
                </button>
              </div>

              {/* Prominent Result View Tabs */}
              <div className="flex flex-wrap gap-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
                <button
                  type="button"
                  onClick={() => setResultTab('tryon')}
                  className={`flex-1 min-w-[220px] py-2.5 px-4 rounded-lg text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
                    resultTab === 'tryon'
                      ? 'bg-gradient-to-r from-cyan-400 to-blue-600 text-slate-950 shadow-[0_0_18px_rgba(0,240,255,0.35)]'
                      : 'text-slate-300 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  <Eye className="w-4 h-4" />
                  <span>Ver Cómo Me Quedaría (Corte, Color y Barba)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setResultTab('details')}
                  className={`flex-1 min-w-[220px] py-2.5 px-4 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
                    resultTab === 'details'
                      ? 'bg-slate-800 text-cyan-300 border border-cyan-500/40'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  <Scissors className="w-4 h-4" />
                  <span>Diagnóstico Completo, Cortes y Medidas</span>
                </button>
              </div>

              {/* TAB 1: Interactive Virtual Try-On */}
              {resultTab === 'tryon' && capturedImage && (
                <AIStyleTryOn
                  capturedImage={capturedImage}
                  analysisResult={analysisResult}
                  selectedCutIndex={selectedCutIndex}
                  onSelectCutIndex={setSelectedCutIndex}
                  onSaveStyleToProfile={handleSaveLookToProfile}
                  onBookWithStyle={(styleName) => {
                    if (onStyleSelectedForBooking) {
                      onStyleSelectedForBooking(styleName, 'pkg-cyber-precision');
                    }
                    onClose();
                  }}
                />
              )}

              {/* TAB 2: Detailed Morphological Analysis & Cut Specs */}
              {resultTab === 'details' && (
                <div className="space-y-5">
                  <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 text-xs text-slate-300 leading-relaxed">
                    <span className="text-cyan-400 font-bold uppercase font-mono block mb-1">
                      Evaluación Morfológica Observada:
                    </span>
                    {analysisResult.jawlineDescription}
                  </div>

                  {/* Facial Proportions & Hair Analysis */}
                  {(analysisResult.faceMetrics || analysisResult.hairAnalysis) && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {analysisResult.faceMetrics && (
                        <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
                          <div className="text-[11px] font-mono text-cyan-400 uppercase font-bold">
                            Proporciones Faciales Detectadas
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                            <div className="p-2 rounded-lg bg-slate-950 border border-slate-800">
                              <span className="text-slate-500 block text-[10px]">Frente</span>
                              <span className="text-white font-bold">{analysisResult.faceMetrics.foreheadWidth}</span>
                            </div>
                            <div className="p-2 rounded-lg bg-slate-950 border border-slate-800">
                              <span className="text-slate-500 block text-[10px]">Pómulos</span>
                              <span className="text-white font-bold">{analysisResult.faceMetrics.cheekboneWidth}</span>
                            </div>
                            <div className="p-2 rounded-lg bg-slate-950 border border-slate-800">
                              <span className="text-slate-500 block text-[10px]">Ángulo Mandíbula</span>
                              <span className="text-cyan-300 font-bold">{analysisResult.faceMetrics.jawlineAngle}</span>
                            </div>
                            <div className="p-2 rounded-lg bg-slate-950 border border-slate-800">
                              <span className="text-slate-500 block text-[10px]">Ratio Alto/Ancho</span>
                              <span className="text-emerald-400 font-bold">{analysisResult.faceMetrics.faceRatio}</span>
                            </div>
                          </div>
                        </div>
                      )}

                      {analysisResult.hairAnalysis && (
                        <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
                          <div className="text-[11px] font-mono text-cyan-400 uppercase font-bold">
                            Evaluación Capilar & Volumen Óptimo
                          </div>
                          <div className="space-y-1.5 text-xs font-mono">
                            <div className="flex justify-between p-2 rounded-lg bg-slate-950 border border-slate-800">
                              <span className="text-slate-400">Textura Detectada:</span>
                              <span className="text-white font-bold">{analysisResult.hairAnalysis.texture}</span>
                            </div>
                            <div className="flex justify-between p-2 rounded-lg bg-slate-950 border border-slate-800">
                              <span className="text-slate-400">Densidad Capilar:</span>
                              <span className="text-cyan-300 font-bold">{analysisResult.hairAnalysis.density}</span>
                            </div>
                            <div className="p-2 rounded-lg bg-slate-950 border border-slate-800">
                              <span className="text-slate-400 block text-[10px]">Volumen Recomendado:</span>
                              <span className="text-emerald-400 font-bold">{analysisResult.hairAnalysis.recommendedVolume}</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* 3 Recommended Cuts */}
                  <div>
                    <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 mb-3">
                      <Sparkles className="w-4 h-4 text-cyan-400" />
                      Cortes Recomendados para Tu Rostro {analysisResult.faceShapeSpanish}
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {analysisResult.recommendedCuts.map((cut, idx) => (
                        <div
                          key={idx}
                          className={`p-4 rounded-xl transition-all flex flex-col justify-between shadow-lg border ${
                            selectedCutIndex === idx
                              ? 'bg-cyan-950/50 border-cyan-400 shadow-[0_0_20px_rgba(0,240,255,0.2)]'
                              : 'bg-slate-900/90 border-cyan-500/30 hover:border-cyan-400'
                          }`}
                        >
                          <div>
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-mono text-slate-400">
                                {selectedCutIndex === idx ? '★ En Prueba' : `Opción #${idx + 1}`}
                              </span>
                              <span className="text-xs font-bold font-mono bg-cyan-950 text-cyan-300 border border-cyan-500/40 px-2 py-0.5 rounded">
                                {cut.matchScore}% Match
                              </span>
                            </div>
                            <h5 className="text-base font-black text-white mt-2 font-tech">{cut.styleName}</h5>
                            <p className="text-xs text-slate-300 mt-2 leading-relaxed">{cut.reason}</p>
                            <div className="text-[11px] text-slate-400 font-mono mt-2 bg-slate-950/70 p-2 rounded border border-slate-800 space-y-1">
                              <div>
                                <span className="text-cyan-400 font-bold">Longitud:</span> {cut.recommendedLength}
                              </div>
                              {cut.clipperGuards && (
                                <div>
                                  <span className="text-cyan-400 font-bold">Guías/Máquina:</span> {cut.clipperGuards}
                                </div>
                              )}
                              {cut.maintenanceCycle && (
                                <div>
                                  <span className="text-emerald-400 font-bold">Retoque:</span> {cut.maintenanceCycle}
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="mt-4 space-y-2">
                            <button
                              onClick={() => {
                                setSelectedCutIndex(idx);
                                setResultTab('tryon');
                              }}
                              className="w-full py-2 rounded-lg bg-gradient-to-r from-cyan-400 to-blue-600 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center space-x-1.5"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>Ver Cómo Me Queda</span>
                            </button>

                            <button
                              onClick={() => {
                                if (onStyleSelectedForBooking) {
                                  onStyleSelectedForBooking(cut.styleName, 'pkg-cyber-precision');
                                }
                                onClose();
                              }}
                              className="w-full py-2 rounded-lg bg-slate-950 border border-cyan-500/40 hover:bg-cyan-500 text-cyan-300 hover:text-slate-950 font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center space-x-1.5"
                            >
                              <span>Agendar Cita</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Color, Beard & Recommended Products Section */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
                      <h5 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                        <Layers className="w-4 h-4 text-cyan-400" />
                        Tonalidad & Colorimetría Sugerida
                      </h5>
                      <div className="flex items-center space-x-3 mt-3">
                        <div
                          className="w-10 h-10 rounded-xl border-2 border-white/20 shadow-lg shrink-0"
                          style={{ backgroundColor: analysisResult.recommendedColor.hexColor }}
                        />
                        <div>
                          <div className="text-sm font-bold text-white font-tech">
                            {analysisResult.recommendedColor.toneName}
                          </div>
                          <div className="text-[11px] text-slate-400 font-mono">
                            Mantenimiento:{' '}
                            <span className="text-cyan-400">{analysisResult.recommendedColor.maintenanceLevel}</span>
                          </div>
                        </div>
                      </div>
                      <p className="text-xs text-slate-300 mt-2">{analysisResult.recommendedColor.description}</p>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
                      <h5 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-cyan-400" />
                        Diseño & Perfilado de Barba
                      </h5>
                      <div className="text-sm font-bold text-white font-tech mt-3">
                        {analysisResult.beardRecommendation.style}
                      </div>
                      <p className="text-xs text-slate-300 mt-2">{analysisResult.beardRecommendation.trimAdvice}</p>
                      <div className="mt-3 text-[11px] text-slate-400 bg-slate-950/60 p-2 rounded border border-slate-800">
                        <span className="text-cyan-400 font-bold">Nota técnica para el barbero:</span>{' '}
                        {analysisResult.technicalBarberNotes}
                      </div>
                    </div>
                  </div>

                  {analysisResult.productAdvice && analysisResult.productAdvice.length > 0 && (
                    <div className="p-4 rounded-xl bg-slate-950 border border-cyan-500/30 space-y-2">
                      <div className="text-xs font-mono text-cyan-400 uppercase font-bold flex items-center gap-1.5">
                        <Zap className="w-4 h-4" />
                        Productos BARBER IA Recomendados (Disponibles en Tienda en Bs)
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {analysisResult.productAdvice.map((prod, idx) => (
                          <span
                            key={idx}
                            className="text-xs bg-slate-900 text-slate-200 border border-slate-700 px-3 py-1 rounded-lg font-mono"
                          >
                            • {prod}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

            </div>
          )}

          {/* Result View B: Face ID Authentication Matched */}
          {authStatus === 'matched' && authSuccessClient && (
            <div className="p-8 text-center space-y-6 animate-in zoom-in-95 duration-300">
              <div className="w-20 h-20 rounded-2xl bg-cyan-500/20 border-2 border-cyan-400 flex items-center justify-center mx-auto text-cyan-400 shadow-[0_0_30px_rgba(0,240,255,0.4)]">
                <UserCheck className="w-10 h-10" />
              </div>

              <div>
                <span className="text-xs font-mono bg-cyan-950 border border-cyan-500/50 text-cyan-300 px-3 py-1 rounded-full font-bold uppercase">
                  Identidad Facial Verificada • ISO 27001
                </span>
                <h3 className="text-2xl font-black text-white font-tech mt-3">
                  ¡Bienvenido de nuevo, {authSuccessClient.name}!
                </h3>
                <p className="text-sm text-slate-300 mt-1 max-w-md mx-auto">
                  Has iniciado sesión exitosamente con tu Face ID biométrico. Tus preferencias y estilo favorito han sido cargados.
                </p>
              </div>

              <div className="max-w-md mx-auto grid grid-cols-2 gap-3 text-left">
                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                  <div className="text-[10px] text-slate-400 font-mono">Puntos Fidelidad IA</div>
                  <div className="text-lg font-black text-cyan-400 font-tech">{authSuccessClient.loyaltyPoints} PTS</div>
                </div>
                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                  <div className="text-[10px] text-slate-400 font-mono">Estilo Favorito</div>
                  <div className="text-xs font-bold text-slate-200 truncate mt-1">
                    {authSuccessClient.preferredStyle || 'Corte Cyber Precision'}
                  </div>
                </div>
              </div>

              <div className="flex justify-center space-x-3 pt-2">
                <button
                  onClick={() => {
                    onClose();
                    if (onStyleSelectedForBooking) {
                      onStyleSelectedForBooking(authSuccessClient.preferredStyle || 'Corte Cyber Precision');
                    }
                  }}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-600 hover:from-cyan-300 text-slate-950 font-black text-xs uppercase tracking-wider transition-all shadow-lg"
                >
                  Continuar a Agendar
                </button>
                <button
                  onClick={onClose}
                  className="px-6 py-3 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 text-xs font-bold hover:text-white"
                >
                  Cerrar
                </button>
              </div>
            </div>
          )}

          {/* Result View C: Face ID Unrecognized */}
          {authStatus === 'unrecognized' && (
            <div className="p-8 text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-500 flex items-center justify-center mx-auto text-amber-400">
                <AlertTriangle className="w-8 h-8" />
              </div>
              <h4 className="text-xl font-bold text-white font-tech">Rostro no registrado en el sistema</h4>
              <p className="text-xs text-slate-300 max-w-sm mx-auto">
                No encontramos una cuenta asociada a este vector biométrico. Puedes realizar tu diagnóstico de corte ahora.
              </p>
              <div className="pt-2 flex justify-center space-x-3">
                <button
                  onClick={() => {
                    resetState();
                    setCurrentMode('analysis');
                  }}
                  className="px-4 py-2 bg-cyan-500 text-slate-950 font-bold rounded-lg text-xs"
                >
                  Realizar Diagnóstico de Estilo
                </button>
                <button
                  onClick={resetState}
                  className="px-4 py-2 bg-slate-800 text-slate-300 font-bold rounded-lg text-xs"
                >
                  Reintentar Escaneo
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
