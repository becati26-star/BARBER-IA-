import React, { useState, useMemo, useRef } from 'react';
import {
  Sparkles,
  Sliders,
  Eye,
  CheckCircle2,
  Palette,
  Scissors,
  Download,
  RotateCcw,
  BookmarkCheck,
  ArrowRight,
  User,
} from 'lucide-react';
import { AIAnalysisResult } from '../types';

interface AIStyleTryOnProps {
  capturedImage: string;
  analysisResult: AIAnalysisResult;
  selectedCutIndex: number;
  onSelectCutIndex: (index: number) => void;
  onSaveStyleToProfile: (styleName: string, colorName: string) => void;
  onBookWithStyle: (styleName: string) => void;
}

export type HairPreset = 'fade-textured' | 'pompadour' | 'buzz-laser' | 'mullet' | 'crop-top' | 'slick-back';
export type BeardPreset = 'sculpted' | 'stubble' | 'full-trimmed' | 'goatee' | 'clean';

const EXTRA_CATALOG_PRESETS: { id: HairPreset; label: string }[] = [
  { id: 'fade-textured', label: 'Fade Texturizado' },
  { id: 'pompadour', label: 'Pompadour' },
  { id: 'crop-top', label: 'Crop Francés' },
  { id: 'mullet', label: 'Mullet Moderno' },
  { id: 'slick-back', label: 'Slick Back' },
  { id: 'buzz-laser', label: 'Buzz Láser' },
];

const COLOR_SWATCHES = [
  { name: 'Tono IA Sugerido', hex: '' },
  { name: 'Negro Azabache', hex: '#141820' },
  { name: 'Castaño Oscuro', hex: '#3b2820' },
  { name: 'Castaño Claro', hex: '#6f4e37' },
  { name: 'Rubio Cenizo', hex: '#b89f78' },
  { name: 'Platino Cyber', hex: '#cbd5e1' },
  { name: 'Gris Grafito', hex: '#64748b' },
  { name: 'Azul Neón', hex: '#0284c7' },
];

export const AIStyleTryOn: React.FC<AIStyleTryOnProps> = ({
  capturedImage,
  analysisResult,
  selectedCutIndex,
  onSelectCutIndex,
  onSaveStyleToProfile,
  onBookWithStyle,
}) => {
  const activeCut = analysisResult.recommendedCuts[selectedCutIndex] || analysisResult.recommendedCuts[0];

  const [applyHair, setApplyHair] = useState<boolean>(true);
  const [applyBeard, setApplyBeard] = useState<boolean>(true);
  const [compareBeforeAfter, setCompareBeforeAfter] = useState<boolean>(false);
  const [manualHairPreset, setManualHairPreset] = useState<HairPreset | null>(null);

  // Position & scale controls for fine-tuning on top of AI faceBox coordinates
  const [scale, setScale] = useState<number>(1.0);
  const [offsetY, setOffsetY] = useState<number>(0);
  const [offsetX, setOffsetX] = useState<number>(0);
  const [tiltAdjust, setTiltAdjust] = useState<number>(0);
  const [opacity, setOpacity] = useState<number>(0.88);

  const [activeHairColorHex, setActiveHairColorHex] = useState<string>(
    analysisResult.recommendedColor?.hexColor || '#1e293b'
  );
  const [syncBeardColor, setSyncBeardColor] = useState<boolean>(true);
  const [activeBeardColorHex, setActiveBeardColorHex] = useState<string>(
    analysisResult.recommendedColor?.hexColor || '#1e293b'
  );

  const [activeBeardPreset, setActiveBeardPreset] = useState<BeardPreset>(
    (analysisResult.beardRecommendation?.beardPreset as BeardPreset) || 'sculpted'
  );
  const [savedConfirmed, setSavedConfirmed] = useState<boolean>(false);

  const hairSvgRef = useRef<SVGSVGElement | null>(null);
  const beardSvgRef = useRef<SVGSVGElement | null>(null);

  const inferHairPreset = (): HairPreset => {
    if (manualHairPreset) return manualHairPreset;
    if (activeCut?.visualPreset) return activeCut.visualPreset;
    const name = (activeCut?.styleName || '').toLowerCase();
    if (name.includes('pompadour')) return 'pompadour';
    if (name.includes('buzz') || name.includes('militar')) return 'buzz-laser';
    if (name.includes('mullet')) return 'mullet';
    if (name.includes('crop') || name.includes('franc')) return 'crop-top';
    if (name.includes('slick')) return 'slick-back';
    return 'fade-textured';
  };

  const currentPreset = inferHairPreset();
  const effectiveBeardColor = syncBeardColor ? activeHairColorHex : activeBeardColorHex;

  // Compute AI-aligned placement from normalized faceBox coordinates
  const faceAnchors = useMemo(() => {
    const box = analysisResult.faceBox;
    const xCenter = Math.min(82, Math.max(18, box?.xCenterPct ?? 50));
    const yHairTop = Math.min(45, Math.max(4, box?.yHairTopPct ?? 16));
    const yEyebrows = Math.min(62, Math.max(yHairTop + 10, box?.yEyebrowsPct ?? 38));
    const yChin = Math.min(95, Math.max(yEyebrows + 18, box?.yChinPct ?? 76));
    const faceWidth = Math.min(72, Math.max(24, box?.faceWidthPct ?? 40));
    const baseTilt = Math.min(20, Math.max(-20, box?.headTiltDeg ?? 0));

    // Hair sits from just above crown to slightly below temple/eyebrow arch
    const hairWidthPct = faceWidth * 1.48;
    const hairHeightPct = (yEyebrows - yHairTop) * 1.65;
    const hairTopPct = Math.max(0, yHairTop - hairHeightPct * 0.22);

    // Beard sits from nose/cheek level down around the chin
    const lowerFaceHeight = yChin - yEyebrows;
    const beardWidthPct = faceWidth * 1.18;
    const beardHeightPct = lowerFaceHeight * 0.92;
    const beardTopPct = yEyebrows + lowerFaceHeight * 0.28;

    return {
      xCenter,
      faceWidth,
      baseTilt,
      hairWidthPct,
      hairHeightPct,
      hairTopPct,
      beardWidthPct,
      beardHeightPct,
      beardTopPct,
    };
  }, [analysisResult.faceBox]);

  const currentStyleLabel = manualHairPreset
    ? EXTRA_CATALOG_PRESETS.find((p) => p.id === manualHairPreset)?.label || activeCut.styleName
    : activeCut.styleName;

  const renderHairSVG = (preset: HairPreset, color: string, svgRef?: React.RefObject<SVGSVGElement | null>) => {
    const shadeDark = '#05070d';
    switch (preset) {
      case 'pompadour':
        return (
          <svg
            ref={svgRef}
            viewBox="0 0 300 220"
            preserveAspectRatio="none"
            className="w-full h-full drop-shadow-[0_8px_14px_rgba(0,0,0,0.65)]"
          >
            <defs>
              <linearGradient id="hairGradPomp" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity="1" />
                <stop offset="75%" stopColor={color} stopOpacity="0.92" />
                <stop offset="100%" stopColor={shadeDark} stopOpacity="0.88" />
              </linearGradient>
            </defs>
            <path
              d="M66,158 C58,108 66,54 102,28 C134,6 192,10 222,40 C244,62 242,108 234,158 C228,128 216,100 194,88 C166,74 134,76 106,92 C86,102 74,132 66,158 Z"
              fill="url(#hairGradPomp)"
            />
            <path d="M92,48 Q150,20 206,46" stroke="rgba(255,255,255,0.24)" strokeWidth="4.5" fill="none" strokeLinecap="round" />
            <path d="M104,66 Q152,42 198,64" stroke="rgba(255,255,255,0.14)" strokeWidth="3" fill="none" strokeLinecap="round" />
            <path d="M68,142 L62,188 L72,190 L76,146 Z" fill={color} opacity="0.45" />
            <path d="M232,142 L238,188 L228,190 L224,146 Z" fill={color} opacity="0.45" />
          </svg>
        );

      case 'crop-top':
        return (
          <svg
            ref={svgRef}
            viewBox="0 0 300 220"
            preserveAspectRatio="none"
            className="w-full h-full drop-shadow-[0_8px_14px_rgba(0,0,0,0.65)]"
          >
            <defs>
              <linearGradient id="hairGradCrop" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} />
                <stop offset="100%" stopColor={shadeDark} stopOpacity="0.9" />
              </linearGradient>
            </defs>
            <path
              d="M68,144 C66,86 92,42 150,40 C208,42 234,86 232,144 L218,120 L198,108 L182,116 L166,106 L150,114 L134,106 L118,116 L102,108 L82,120 Z"
              fill="url(#hairGradCrop)"
            />
            <path d="M106,64 L124,90 M148,54 L154,88 M188,60 L176,90" stroke="rgba(255,255,255,0.18)" strokeWidth="3.2" strokeLinecap="round" />
            <path d="M68,134 L64,176 L73,176 L77,138 Z" fill={color} opacity="0.35" />
            <path d="M232,134 L236,176 L227,176 L223,138 Z" fill={color} opacity="0.35" />
          </svg>
        );

      case 'mullet':
        return (
          <svg
            ref={svgRef}
            viewBox="0 0 300 220"
            preserveAspectRatio="none"
            className="w-full h-full drop-shadow-[0_8px_14px_rgba(0,0,0,0.65)]"
          >
            <path d="M58,142 L44,216 L78,210 L78,150 Z" fill={color} opacity="0.82" />
            <path d="M242,142 L256,216 L222,210 L222,150 Z" fill={color} opacity="0.82" />
            <path
              d="M72,134 C70,74 100,36 150,34 C200,36 230,74 228,134 C212,106 186,94 150,94 C114,94 88,106 72,134 Z"
              fill={color}
            />
            <path d="M102,58 Q150,38 198,58" stroke="rgba(0,240,255,0.32)" strokeWidth="2.5" fill="none" />
          </svg>
        );

      case 'buzz-laser':
        return (
          <svg
            ref={svgRef}
            viewBox="0 0 300 220"
            preserveAspectRatio="none"
            className="w-full h-full"
          >
            <path
              d="M72,142 C72,82 102,52 150,52 C198,52 228,82 228,142 C220,112 204,96 150,96 C96,96 80,112 72,142 Z"
              fill={color}
              opacity="0.82"
            />
            <line x1="76" y1="122" x2="106" y2="110" stroke="#00f0ff" strokeWidth="2.4" strokeLinecap="round" />
            <line x1="78" y1="130" x2="103" y2="120" stroke="#00f0ff" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
        );

      case 'slick-back':
        return (
          <svg
            ref={svgRef}
            viewBox="0 0 300 220"
            preserveAspectRatio="none"
            className="w-full h-full drop-shadow-[0_8px_14px_rgba(0,0,0,0.65)]"
          >
            <path
              d="M70,144 C68,82 94,40 150,38 C206,40 232,82 230,144 C216,108 190,86 150,86 C110,86 84,108 70,144 Z"
              fill={color}
            />
            <path d="M98,60 Q150,48 202,60" stroke="rgba(255,255,255,0.28)" strokeWidth="3.5" fill="none" />
            <path d="M108,74 Q150,64 192,74" stroke="rgba(255,255,255,0.16)" strokeWidth="2.5" fill="none" />
          </svg>
        );

      case 'fade-textured':
      default:
        return (
          <svg
            ref={svgRef}
            viewBox="0 0 300 220"
            preserveAspectRatio="none"
            className="w-full h-full drop-shadow-[0_8px_14px_rgba(0,0,0,0.65)]"
          >
            <defs>
              <linearGradient id="hairGradFade" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} />
                <stop offset="85%" stopColor={color} stopOpacity="0.95" />
                <stop offset="100%" stopColor={shadeDark} stopOpacity="0.88" />
              </linearGradient>
            </defs>
            <path
              d="M68,148 C64,96 80,50 114,34 L128,44 L146,28 L164,42 L184,30 L198,46 C226,62 236,98 232,148 C220,116 196,94 150,94 C104,94 80,116 68,148 Z"
              fill="url(#hairGradFade)"
            />
            <path d="M102,66 Q132,52 152,64 Q174,52 200,66" stroke="rgba(255,255,255,0.22)" strokeWidth="3.2" fill="none" strokeLinecap="round" />
            <path d="M68,138 L63,178 L72,178 L77,142 Z" fill={color} opacity="0.34" />
            <path d="M232,138 L237,178 L228,178 L223,142 Z" fill={color} opacity="0.34" />
          </svg>
        );
    }
  };

  const renderBeardSVG = (preset: BeardPreset, color: string, svgRef?: React.RefObject<SVGSVGElement | null>) => {
    if (preset === 'clean') return null;

    if (preset === 'goatee') {
      return (
        <svg ref={svgRef} viewBox="0 0 300 180" preserveAspectRatio="none" className="w-full h-full">
          {/* Anchor / Goatee */}
          <path
            d="M112,86 Q150,74 188,86 Q172,96 150,92 Q128,96 112,86 Z"
            fill={color}
            opacity="0.88"
          />
          <path
            d="M116,120 C118,152 134,168 150,168 C166,168 182,152 184,120 L172,118 C168,136 160,144 150,144 C140,144 132,136 128,118 Z"
            fill={color}
            opacity="0.86"
          />
        </svg>
      );
    }

    const beardOpacity = preset === 'stubble' ? 0.42 : preset === 'full-trimmed' ? 0.88 : 0.74;

    return (
      <svg ref={svgRef} viewBox="0 0 300 180" preserveAspectRatio="none" className="w-full h-full">
        {/* Jawline & cheek beard */}
        <path
          d={
            preset === 'full-trimmed'
              ? 'M70,34 L76,102 C86,152 118,174 150,176 C182,174 214,152 224,102 L230,34 L218,44 C208,92 186,112 150,112 C114,112 92,92 82,44 Z'
              : 'M76,38 L82,96 C92,140 122,164 150,166 C178,164 208,140 218,96 L224,38 L214,48 C204,88 182,108 150,108 C118,108 96,88 86,48 Z'
          }
          fill={color}
          opacity={beardOpacity}
        />
        {/* Mustache */}
        <path
          d="M112,92 Q150,78 188,92 Q172,102 150,96 Q128,102 112,92 Z"
          fill={color}
          opacity={Math.min(0.94, beardOpacity + 0.12)}
        />
        {/* Sharp 45-degree cheek razor guideline */}
        {preset === 'sculpted' && (
          <>
            <line x1="86" y1="60" x2="116" y2="94" stroke="rgba(0,240,255,0.45)" strokeWidth="1.5" strokeDasharray="3,3" />
            <line x1="214" y1="60" x2="184" y2="94" stroke="rgba(0,240,255,0.45)" strokeWidth="1.5" strokeDasharray="3,3" />
          </>
        )}
      </svg>
    );
  };

  const handleSaveLook = () => {
    const colorName =
      COLOR_SWATCHES.find((c) => c.hex === activeHairColorHex)?.name ||
      analysisResult.recommendedColor?.toneName ||
      activeHairColorHex;
    onSaveStyleToProfile(currentStyleLabel, colorName);
    setSavedConfirmed(true);
    setTimeout(() => setSavedConfirmed(false), 3000);
  };

  const svgNodeToImage = (svgEl: SVGSVGElement | null): Promise<HTMLImageElement | null> => {
    return new Promise((resolve) => {
      if (!svgEl) return resolve(null);
      const xml = new XMLSerializer().serializeToString(svgEl);
      const blob = new Blob([xml], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const img = new Image();
      img.onload = () => {
        URL.revokeObjectURL(url);
        resolve(img);
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        resolve(null);
      };
      img.src = url;
    });
  };

  const handleDownloadLook = async () => {
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 600;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const baseImg = new Image();
    baseImg.crossOrigin = 'anonymous';
    baseImg.onload = async () => {
      // Draw cover crop
      const imgRatio = baseImg.width / baseImg.height;
      const canvasRatio = canvas.width / canvas.height;
      let sx = 0, sy = 0, sWidth = baseImg.width, sHeight = baseImg.height;
      if (imgRatio > canvasRatio) {
        sWidth = baseImg.height * canvasRatio;
        sx = (baseImg.width - sWidth) / 2;
      } else {
        sHeight = baseImg.width / canvasRatio;
        sy = (baseImg.height - sHeight) / 2;
      }
      ctx.drawImage(baseImg, sx, sy, sWidth, sHeight, 0, 0, canvas.width, canvas.height);

      // Composite hair & beard SVG overlays at anchored faceBox locations
      ctx.save();
      ctx.globalAlpha = opacity;

      const totalTilt = ((faceAnchors.baseTilt + tiltAdjust) * Math.PI) / 180;
      const cx = (faceAnchors.xCenter / 100) * canvas.width + offsetX;

      if (applyHair && hairSvgRef.current) {
        const hairImg = await svgNodeToImage(hairSvgRef.current);
        if (hairImg) {
          const hw = (faceAnchors.hairWidthPct / 100) * canvas.width * scale;
          const hh = (faceAnchors.hairHeightPct / 100) * canvas.height * scale;
          const hy = (faceAnchors.hairTopPct / 100) * canvas.height + offsetY;
          ctx.save();
          ctx.translate(cx, hy + hh / 2);
          ctx.rotate(totalTilt);
          ctx.drawImage(hairImg, -hw / 2, -hh / 2, hw, hh);
          ctx.restore();
        }
      }

      if (applyBeard && activeBeardPreset !== 'clean' && beardSvgRef.current) {
        const beardImg = await svgNodeToImage(beardSvgRef.current);
        if (beardImg) {
          const bw = (faceAnchors.beardWidthPct / 100) * canvas.width * scale;
          const bh = (faceAnchors.beardHeightPct / 100) * canvas.height * scale;
          const by = (faceAnchors.beardTopPct / 100) * canvas.height + offsetY;
          ctx.save();
          ctx.translate(cx, by + bh / 2);
          ctx.rotate(totalTilt);
          ctx.drawImage(beardImg, -bw / 2, -bh / 2, bw, bh);
          ctx.restore();
        }
      }

      ctx.restore();

      // Add BARBER IA cyberpunk info footer overlay
      ctx.fillStyle = 'rgba(7, 10, 18, 0.88)';
      ctx.fillRect(0, canvas.height - 96, canvas.width, 96);
      ctx.strokeStyle = '#00f0ff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, canvas.height - 96);
      ctx.lineTo(canvas.width, canvas.height - 96);
      ctx.stroke();

      ctx.fillStyle = '#00f0ff';
      ctx.font = 'bold 18px sans-serif';
      ctx.fillText(
        `BARBER IA • Rostro ${analysisResult.faceShapeSpanish} (${analysisResult.symmetryScore}% Simetría)`,
        24,
        canvas.height - 58
      );

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 20px sans-serif';
      ctx.fillText(`Simulación Aplicada: ${currentStyleLabel}`, 24, canvas.height - 26);

      const link = document.createElement('a');
      link.download = `BARBER_IA_Look_${analysisResult.faceShape}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    };
    baseImg.src = capturedImage;
  };

  return (
    <div className="p-4 sm:p-5 rounded-2xl bg-[#070b14] border-2 border-cyan-500/40 space-y-5 shadow-[0_0_30px_rgba(0,240,255,0.15)]">
      {/* Studio Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div>
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <h4 className="text-sm font-black text-white uppercase font-tech tracking-wider">
              Simulador en Vivo: Cómo Me Quedaría (Corte, Color y Barba)
            </h4>
            <span className="text-[10px] bg-cyan-950 text-cyan-300 border border-cyan-500/40 px-2 py-0.5 rounded font-mono font-bold">
              AUTO-ALINEADO IA
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Cabello y barba posicionados automáticamente sobre tus facciones detectadas. Cambia estilo, color o ajusta el encuadre libremente.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setCompareBeforeAfter(!compareBeforeAfter)}
          className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold border transition-all flex items-center gap-1.5 self-start shrink-0 ${
            compareBeforeAfter
              ? 'bg-cyan-500 text-slate-950 border-cyan-400'
              : 'bg-slate-900 text-cyan-300 border-cyan-500/40 hover:border-cyan-400'
          }`}
        >
          <Eye className="w-3.5 h-3.5" />
          <span>{compareBeforeAfter ? 'Viendo Original (Antes)' : 'Comparar Antes / Después'}</span>
        </button>
      </div>

      {/* Main Split Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        
        {/* Left: Scanned Photo + AI-Anchored Hair/Beard Implementation */}
        <div className="lg:col-span-6 space-y-3">
          <div className="relative rounded-2xl overflow-hidden bg-black border-2 border-cyan-500/50 aspect-[4/3] shadow-inner select-none">
            <img
              src={capturedImage}
              alt="Rostro Escaneado"
              className="w-full h-full object-cover"
            />

            {/* Anchored Hair & Beard Overlay Layer */}
            {!compareBeforeAfter && (
              <div
                className="absolute inset-0 pointer-events-none transition-opacity duration-150"
                style={{ opacity }}
              >
                {applyHair && (
                  <div
                    className="absolute transition-all duration-150"
                    style={{
                      left: `${faceAnchors.xCenter}%`,
                      top: `${faceAnchors.hairTopPct}%`,
                      width: `${faceAnchors.hairWidthPct}%`,
                      height: `${faceAnchors.hairHeightPct}%`,
                      transform: `translate(calc(-50% + ${offsetX}px), ${offsetY}px) scale(${scale}) rotate(${faceAnchors.baseTilt + tiltAdjust}deg)`,
                      transformOrigin: 'center center',
                    }}
                  >
                    {renderHairSVG(currentPreset, activeHairColorHex, hairSvgRef)}
                  </div>
                )}

                {applyBeard && activeBeardPreset !== 'clean' && (
                  <div
                    className="absolute transition-all duration-150"
                    style={{
                      left: `${faceAnchors.xCenter}%`,
                      top: `${faceAnchors.beardTopPct}%`,
                      width: `${faceAnchors.beardWidthPct}%`,
                      height: `${faceAnchors.beardHeightPct}%`,
                      transform: `translate(calc(-50% + ${offsetX}px), ${offsetY}px) scale(${scale}) rotate(${faceAnchors.baseTilt + tiltAdjust}deg)`,
                      transformOrigin: 'center top',
                    }}
                  >
                    {renderBeardSVG(activeBeardPreset, effectiveBeardColor, beardSvgRef)}
                  </div>
                )}
              </div>
            )}

            {/* Status HUD Tag */}
            <div className="absolute top-2.5 left-2.5 right-2.5 flex justify-between items-center pointer-events-none text-[10px] font-mono">
              <span className="bg-black/80 text-cyan-300 border border-cyan-500/40 px-2 py-0.5 rounded backdrop-blur-sm truncate max-w-[70%]">
                {compareBeforeAfter ? 'ORIGINAL ESCANEADO' : `LOOK: ${currentStyleLabel}`}
              </span>
              <span className="bg-black/80 text-emerald-400 border border-emerald-500/40 px-2 py-0.5 rounded backdrop-blur-sm">
                {manualHairPreset ? 'Catálogo BARBER IA' : `${activeCut.matchScore}% Match`}
              </span>
            </div>
          </div>

          {/* Quick Alignment Sliders */}
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-[11px] font-mono">
            <div className="flex items-center justify-between text-cyan-400 font-bold mb-1">
              <span className="flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5" />
                Ajuste Fino sobre tu Rostro
              </span>
              <button
                type="button"
                onClick={() => {
                  setScale(1);
                  setOffsetY(0);
                  setOffsetX(0);
                  setTiltAdjust(0);
                  setOpacity(0.88);
                }}
                className="text-[10px] text-slate-400 hover:text-white flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                Re-centrar IA
              </button>
            </div>

            <div className="grid grid-cols-2 gap-x-3 gap-y-2">
              <div>
                <div className="flex justify-between text-slate-400">
                  <span>Tamaño:</span>
                  <span className="text-white">{Math.round(scale * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.65"
                  max="1.5"
                  step="0.05"
                  value={scale}
                  onChange={(e) => setScale(parseFloat(e.target.value))}
                  className="w-full accent-cyan-400"
                />
              </div>

              <div>
                <div className="flex justify-between text-slate-400">
                  <span>Altura (Eje Y):</span>
                  <span className="text-white">{offsetY}px</span>
                </div>
                <input
                  type="range"
                  min="-60"
                  max="60"
                  step="2"
                  value={offsetY}
                  onChange={(e) => setOffsetY(parseInt(e.target.value, 10))}
                  className="w-full accent-cyan-400"
                />
              </div>

              <div>
                <div className="flex justify-between text-slate-400">
                  <span>Lateral (Eje X):</span>
                  <span className="text-white">{offsetX}px</span>
                </div>
                <input
                  type="range"
                  min="-50"
                  max="50"
                  step="2"
                  value={offsetX}
                  onChange={(e) => setOffsetX(parseInt(e.target.value, 10))}
                  className="w-full accent-cyan-400"
                />
              </div>

              <div>
                <div className="flex justify-between text-slate-400">
                  <span>Rotación / Opacidad:</span>
                  <span className="text-white">{tiltAdjust}° / {Math.round(opacity * 100)}%</span>
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  <input
                    type="range"
                    min="-15"
                    max="15"
                    step="1"
                    value={tiltAdjust}
                    onChange={(e) => setTiltAdjust(parseInt(e.target.value, 10))}
                    className="w-full accent-cyan-400"
                    title="Inclinación"
                  />
                  <input
                    type="range"
                    min="0.35"
                    max="1"
                    step="0.05"
                    value={opacity}
                    onChange={(e) => setOpacity(parseFloat(e.target.value))}
                    className="w-full accent-cyan-400"
                    title="Intensidad"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Style Switcher, Hair Color, Beard Style & Beard Color Controls */}
        <div className="lg:col-span-6 space-y-4">
          
          {/* 1. AI Recommended Cuts */}
          <div>
            <label className="text-[11px] font-mono text-cyan-400 uppercase font-bold block mb-2">
              1. Cortes Recomendados para Rostro {analysisResult.faceShapeSpanish}:
            </label>
            <div className="space-y-1.5">
              {analysisResult.recommendedCuts.map((cut, idx) => {
                const isSelected = !manualHairPreset && selectedCutIndex === idx;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setManualHairPreset(null);
                      onSelectCutIndex(idx);
                      setApplyHair(true);
                      setCompareBeforeAfter(false);
                    }}
                    className={`w-full p-2.5 rounded-xl border text-left transition-all flex items-center justify-between ${
                      isSelected
                        ? 'bg-cyan-950/70 border-cyan-400 text-white shadow-[0_0_15px_rgba(0,240,255,0.2)]'
                        : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div className="pr-2">
                      <div className="text-xs font-bold font-tech flex items-center gap-1.5">
                        <Scissors className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                        <span>{cut.styleName}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5 line-clamp-1">
                        {cut.clipperGuards || cut.recommendedLength}
                      </div>
                    </div>
                    <span className="text-[11px] font-mono font-bold text-cyan-300 bg-black/50 px-2 py-0.5 rounded shrink-0">
                      {cut.matchScore}%
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Extra quick presets */}
            <div className="mt-2">
              <span className="text-[10px] font-mono text-slate-400 block mb-1">O prueba otro peinado rápido:</span>
              <div className="flex flex-wrap gap-1.5">
                {EXTRA_CATALOG_PRESETS.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      setManualHairPreset(p.id);
                      setApplyHair(true);
                      setCompareBeforeAfter(false);
                    }}
                    className={`px-2 py-1 rounded-lg text-[10px] font-mono border transition-colors ${
                      manualHairPreset === p.id
                        ? 'bg-cyan-500 text-slate-950 border-cyan-400 font-bold'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white hover:border-slate-700'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 2. Hair Color */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[11px] font-mono text-cyan-400 uppercase font-bold flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5" />
                2. Color de Cabello:
              </label>
              <label className="text-[10px] font-mono text-slate-400 flex items-center gap-1.5 cursor-pointer">
                <span>Personalizado</span>
                <input
                  type="color"
                  value={activeHairColorHex}
                  onChange={(e) => {
                    setActiveHairColorHex(e.target.value);
                    setCompareBeforeAfter(false);
                  }}
                  className="w-5 h-5 rounded cursor-pointer bg-transparent border-0"
                />
              </label>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {COLOR_SWATCHES.map((swatch, i) => {
                const hex = swatch.hex || analysisResult.recommendedColor?.hexColor || '#1e293b';
                const isSelected = activeHairColorHex.toLowerCase() === hex.toLowerCase();
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      setActiveHairColorHex(hex);
                      setCompareBeforeAfter(false);
                    }}
                    className={`px-2 py-1 rounded-lg border text-[10px] font-mono flex items-center gap-1.5 transition-all ${
                      isSelected
                        ? 'bg-slate-800 border-cyan-400 text-white font-bold'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <span
                      className="w-3 h-3 rounded-full border border-white/30"
                      style={{ backgroundColor: hex }}
                    />
                    <span>{swatch.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Beard Style & Beard Color */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-mono text-cyan-400 uppercase font-bold flex items-center gap-1.5">
                <User className="w-3.5 h-3.5" />
                3. Estilo & Color de Barba:
              </label>
              <div className="flex items-center gap-2 text-[10px] font-mono">
                <button
                  type="button"
                  onClick={() => setApplyHair(!applyHair)}
                  className={`px-2 py-0.5 rounded border ${
                    applyHair ? 'bg-cyan-950 border-cyan-500 text-cyan-300' : 'bg-slate-900 border-slate-800 text-slate-500'
                  }`}
                >
                  {applyHair ? '✓ Cabello' : 'Sin Cabello'}
                </button>
                <button
                  type="button"
                  onClick={() => setApplyBeard(!applyBeard)}
                  className={`px-2 py-0.5 rounded border ${
                    applyBeard ? 'bg-cyan-950 border-cyan-500 text-cyan-300' : 'bg-slate-900 border-slate-800 text-slate-500'
                  }`}
                >
                  {applyBeard ? '✓ Barba' : 'Sin Barba'}
                </button>
              </div>
            </div>

            {applyBeard && (
              <>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { id: 'sculpted', label: 'Barba Esculpida 45°' },
                    { id: 'stubble', label: 'Barba 3 Días' },
                    { id: 'full-trimmed', label: 'Barba Cerrada' },
                    { id: 'goatee', label: 'Candado / Perilla' },
                    { id: 'clean', label: 'Afeitado Cero' },
                  ].map((b) => (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => {
                        setActiveBeardPreset(b.id as BeardPreset);
                        setCompareBeforeAfter(false);
                      }}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold border transition-colors ${
                        activeBeardPreset === b.id
                          ? 'bg-cyan-500 text-slate-950 border-cyan-400'
                          : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                      }`}
                    >
                      {b.label}
                    </button>
                  ))}
                </div>

                {activeBeardPreset !== 'clean' && (
                  <div className="flex flex-wrap items-center gap-2 pt-1 text-[10px] font-mono">
                    <button
                      type="button"
                      onClick={() => setSyncBeardColor(!syncBeardColor)}
                      className={`px-2 py-1 rounded border transition-colors ${
                        syncBeardColor
                          ? 'bg-slate-800 border-cyan-500/50 text-cyan-300'
                          : 'bg-slate-950 border-slate-700 text-slate-400'
                      }`}
                    >
                      {syncBeardColor ? '✓ Barba igual al cabello' : 'Color de barba independiente'}
                    </button>

                    {!syncBeardColor && (
                      <div className="flex items-center gap-1.5">
                        {['#141820', '#3b2820', '#6f4e37', '#64748b', '#cbd5e1'].map((hex) => (
                          <button
                            key={hex}
                            type="button"
                            onClick={() => setActiveBeardColorHex(hex)}
                            className={`w-4 h-4 rounded-full border ${
                              activeBeardColorHex === hex ? 'border-cyan-400 scale-110' : 'border-white/30'
                            }`}
                            style={{ backgroundColor: hex }}
                            title="Color de barba"
                          />
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Save, Download & Book Actions */}
          <div className="pt-2 border-t border-slate-800 space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleSaveLook}
                className={`py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                  savedConfirmed
                    ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                    : 'bg-slate-900 border-cyan-500/40 hover:border-cyan-400 text-cyan-300'
                }`}
              >
                {savedConfirmed ? <CheckCircle2 className="w-4 h-4" /> : <BookmarkCheck className="w-4 h-4" />}
                <span>{savedConfirmed ? '¡Guardado en Perfil!' : 'Guardar en Mi Galería'}</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadLook}
                className="py-2.5 px-3 rounded-xl bg-slate-900 border border-slate-700 hover:border-cyan-400 text-slate-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
              >
                <Download className="w-4 h-4 text-cyan-400" />
                <span>Descargar Foto PNG</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => onBookWithStyle(currentStyleLabel)}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-600 hover:from-cyan-300 text-slate-950 font-black text-xs uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(0,240,255,0.35)] flex items-center justify-center gap-2"
            >
              <span>Agendar Cita con "{currentStyleLabel}"</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
