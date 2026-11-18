import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  APIProvider,
  Map as GoogleMap,
  AdvancedMarker,
  InfoWindow,
  useMap,
  useMapsLibrary,
  useAdvancedMarkerRef,
} from '@vis.gl/react-google-maps';
import {
  MapPin,
  Navigation,
  Clock,
  Phone,
  Mail,
  Star,
  Send,
  Crosshair,
  Car,
  Footprints,
  Bike,
  TrainFront,
  MessageSquarePlus,
  CheckCircle2,
  ExternalLink,
  Search,
  Sparkles,
  Route as RouteIcon,
  Calendar,
} from 'lucide-react';
import { BarberReview, ClientProfile } from '../types';
import { INITIAL_BARBERS, INITIAL_PACKAGES, storeService } from '../services/store';

// Flagship BARBER IA physical coordinates (Equipetrol, Av. San Martín, Santa Cruz de la Sierra, Bolivia)
const BARBERSHOP_LOCATION: google.maps.LatLngLiteral = {
  lat: -17.7689,
  lng: -63.1965,
};

const BARBERSHOP_ADDRESS = 'Av. San Martín #450, Equipetrol, Santa Cruz de la Sierra';

const QUICK_ORIGINS: { label: string; coords: google.maps.LatLngLiteral }[] = [
  { label: 'Plaza 24 de Septiembre', coords: { lat: -17.7833, lng: -63.1821 } },
  { label: 'Ventura Mall (4to Anillo)', coords: { lat: -17.7544, lng: -63.1983 } },
  { label: 'Parque Urbano Central', coords: { lat: -17.7915, lng: -63.1739 } },
];

type TravelModeKey = 'DRIVING' | 'WALKING' | 'BICYCLING' | 'TRANSIT';

interface RouteSummary {
  distanceKm: string;
  durationMin: number;
  summaryLabel: string;
}

interface LocationContactSectionProps {
  activeClient?: ClientProfile | null;
  onOpenBooking?: () => void;
}

function isQuotaError(err: any): boolean {
  const msg = String(err?.message || err?.status || err || '');
  return (
    err?.status === 429 ||
    msg.includes('RESOURCE_EXHAUSTED') ||
    msg.includes('OVER_QUERY_LIMIT') ||
    msg.includes('429')
  );
}

/**
 * Inner Map Content Component handling Markers, InfoWindow, and Modern Routes API
 */
const BarberMapContent: React.FC<{
  origin: google.maps.LatLngLiteral | null;
  originLabel: string;
  travelMode: TravelModeKey;
  onRouteCalculated: (summary: RouteSummary | null, errorMsg?: string | null) => void;
  onComputingChange: (loading: boolean) => void;
}> = ({ origin, originLabel, travelMode, onRouteCalculated, onComputingChange }) => {
  const map = useMap();
  const routesLib = useMapsLibrary('routes');
  const [shopMarkerRef, shopMarker] = useAdvancedMarkerRef();
  const [infoOpen, setInfoOpen] = useState<boolean>(true);
  const polylinesRef = useRef<google.maps.Polyline[]>([]);

  useEffect(() => {
    // Cleanup previous polylines
    polylinesRef.current.forEach((p) => p.setMap(null));
    polylinesRef.current = [];

    if (!map || !routesLib || !origin) {
      if (!origin) {
        onRouteCalculated(null, null);
      }
      return;
    }

    let cancelled = false;
    onComputingChange(true);
    onRouteCalculated(null, null);

    const request = {
      origin,
      destination: BARBERSHOP_LOCATION,
      travelMode,
      provideRouteAlternatives: true,
      fields: ['path', 'distanceMeters', 'durationMillis', 'viewport', 'legs'],
    };

    (routesLib.Route as any)
      .computeRoutes(request)
      .then((response: { routes?: any[] }) => {
        if (cancelled) return;
        onComputingChange(false);

        const routes = response?.routes;
        if (!routes || routes.length === 0) {
          onRouteCalculated(null, 'No se encontró una ruta disponible para el modo seleccionado.');
          return;
        }

        // Pick fastest route by shortest durationMillis
        const fastestRoute = [...routes].sort(
          (a, b) => (a.durationMillis ?? Number.MAX_SAFE_INTEGER) - (b.durationMillis ?? Number.MAX_SAFE_INTEGER)
        )[0];

        let createdPolylines: google.maps.Polyline[] = [];
        if (typeof fastestRoute.createPolylines === 'function') {
          createdPolylines = fastestRoute.createPolylines();
          createdPolylines.forEach((polyline: google.maps.Polyline) => {
            polyline.setOptions({
              strokeColor: '#00f0ff',
              strokeOpacity: 0.95,
              strokeWeight: 6,
            });
            polyline.setMap(map);
          });
        } else if (fastestRoute.path) {
          const fallbackPoly = new google.maps.Polyline({
            path: fastestRoute.path,
            geodesic: true,
            strokeColor: '#00f0ff',
            strokeOpacity: 0.95,
            strokeWeight: 6,
            map,
          });
          createdPolylines = [fallbackPoly];
        }

        polylinesRef.current = createdPolylines;

        if (fastestRoute.viewport) {
          map.fitBounds(fastestRoute.viewport);
        }

        const distanceMeters = fastestRoute.distanceMeters ?? 0;
        const durationMillis = fastestRoute.durationMillis ?? 0;
        onRouteCalculated(
          {
            distanceKm: (distanceMeters / 1000).toFixed(1),
            durationMin: Math.max(1, Math.round(durationMillis / 60000)),
            summaryLabel:
              routes.length > 1
                ? `Ruta más rápida seleccionada (${routes.length} opciones evaluadas)`
                : 'Ruta directa más rápida',
          },
          null
        );
      })
      .catch((err: any) => {
        if (cancelled) return;
        onComputingChange(false);
        if (isQuotaError(err)) {
          window.dispatchEvent(new CustomEvent('gmp-quota-exceeded'));
        }
        onRouteCalculated(
          null,
          'No se pudo calcular la ruta en este momento. Verifica tu conexión o punto de partida.'
        );
      });

    return () => {
      cancelled = true;
      polylinesRef.current.forEach((p) => p.setMap(null));
      polylinesRef.current = [];
    };
  }, [map, routesLib, origin, travelMode]);

  return (
    <>
      {/* Flagship Barbershop Marker */}
      <AdvancedMarker
        ref={shopMarkerRef}
        position={BARBERSHOP_LOCATION}
        onClick={() => setInfoOpen((prev) => !prev)}
        title="BARBER IA • Sede Central"
      >
        <div className="flex flex-col items-center cursor-pointer group">
          <div className="px-2.5 py-1 rounded-full bg-[#05070d]/95 border-2 border-cyan-400 text-cyan-300 font-tech font-black text-[11px] shadow-[0_0_20px_rgba(0,240,255,0.6)] flex items-center gap-1.5 group-hover:scale-105 transition-transform">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <span>BARBER IA</span>
          </div>
          <div className="w-0 h-0 border-l-[7px] border-l-transparent border-r-[7px] border-r-transparent border-t-[9px] border-t-cyan-400 -mt-0.5" />
        </div>
      </AdvancedMarker>

      {infoOpen && shopMarker && (
        <InfoWindow
          anchor={shopMarker}
          maxWidth={270}
          onCloseClick={() => setInfoOpen(false)}
        >
          <div className="p-1.5 text-slate-900 space-y-1.5">
            <div className="font-black text-sm tracking-tight text-slate-950">
              BARBER IA • Estudio Morfológico
            </div>
            <p className="text-xs text-slate-700 leading-snug">{BARBERSHOP_ADDRESS}</p>
            <div className="text-[11px] text-slate-600 font-medium">
              Lun - Sáb: 09:00 - 21:00 • Dom: 10:00 - 18:00
            </div>
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${BARBERSHOP_LOCATION.lat},${BARBERSHOP_LOCATION.lng}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-xs font-bold text-cyan-700 hover:underline pt-0.5"
            >
              <span>Abrir navegación GPS</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </InfoWindow>
      )}

      {/* Origin Marker when route is active */}
      {origin && (
        <AdvancedMarker position={origin} title={`Origen: ${originLabel}`}>
          <div className="px-2 py-0.5 rounded-full bg-emerald-500 text-slate-950 font-mono font-bold text-[10px] border-2 border-white shadow-lg">
            Tu Origen
          </div>
        </AdvancedMarker>
      )}
    </>
  );
};

/**
 * Autocomplete Origin Search Input using Places API (New) AutocompleteSuggestion
 */
const OriginAutocompleteInput: React.FC<{
  onSelectOrigin: (coords: google.maps.LatLngLiteral, label: string) => void;
}> = ({ onSelectOrigin }) => {
  const placesLib = useMapsLibrary('places');
  const [query, setQuery] = useState<string>('');
  const [suggestions, setSuggestions] = useState<google.maps.places.AutocompleteSuggestion[]>([]);
  const [searching, setSearching] = useState<boolean>(false);
  const sessionTokenRef = useRef<google.maps.places.AutocompleteSessionToken | null>(null);

  useEffect(() => {
    if (!placesLib || !query.trim() || query.trim().length < 3) {
      setSuggestions([]);
      return;
    }

    const { AutocompleteSessionToken, AutocompleteSuggestion } = placesLib;
    if (!sessionTokenRef.current) {
      sessionTokenRef.current = new AutocompleteSessionToken();
    }

    let active = true;
    setSearching(true);
    const timer = setTimeout(() => {
      AutocompleteSuggestion.fetchAutocompleteSuggestions({
        input: query,
        sessionToken: sessionTokenRef.current ?? undefined,
        locationBias: {
          center: BARBERSHOP_LOCATION,
          radius: 25000,
        },
      })
        .then((res) => {
          if (!active) return;
          setSuggestions(res.suggestions || []);
          setSearching(false);
        })
        .catch((err) => {
          if (!active) return;
          setSearching(false);
          if (isQuotaError(err)) {
            window.dispatchEvent(new CustomEvent('gmp-quota-exceeded'));
          }
        });
    }, 280);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [placesLib, query]);

  const handleChooseSuggestion = useCallback(
    async (suggestion: google.maps.places.AutocompleteSuggestion) => {
      if (!placesLib || !suggestion.placePrediction) return;
      try {
        const place = suggestion.placePrediction.toPlace();
        await place.fetchFields({
          fields: ['location', 'formattedAddress', 'displayName'],
        });
        if (place.location) {
          const lat = place.location.lat();
          const lng = place.location.lng();
          const label =
            place.displayName ||
            place.formattedAddress ||
            suggestion.placePrediction.text.text;
          setQuery(label);
          setSuggestions([]);
          onSelectOrigin({ lat, lng }, label);
        }
        sessionTokenRef.current = null;
      } catch (err) {
        if (isQuotaError(err)) {
          window.dispatchEvent(new CustomEvent('gmp-quota-exceeded'));
        }
      }
    },
    [placesLib, onSelectOrigin]
  );

  return (
    <div className="relative flex-1">
      <div className="relative">
        <Search className="w-4 h-4 text-cyan-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Escribe tu dirección, zona o punto de partida..."
          className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 focus:border-cyan-400 focus:outline-none text-xs text-white placeholder-slate-500"
        />
        {searching && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-cyan-400 font-mono">
            ...
          </span>
        )}
      </div>

      {suggestions.length > 0 && (
        <ul className="absolute left-0 right-0 mt-1.5 bg-[#0a0f1d] border border-cyan-500/40 rounded-xl shadow-2xl z-30 max-h-48 overflow-y-auto divide-y divide-slate-800/80">
          {suggestions.map((item, idx) => (
            <li
              key={idx}
              onClick={() => handleChooseSuggestion(item)}
              className="px-3 py-2 text-xs text-slate-200 hover:bg-cyan-950/70 hover:text-cyan-300 cursor-pointer flex items-center gap-2 transition-colors"
            >
              <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span className="truncate">{item.placePrediction?.text.text}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export const LocationContactSection: React.FC<LocationContactSectionProps> = ({
  activeClient,
  onOpenBooking,
}) => {
  const [mapsApiKey, setMapsApiKey] = useState<string>(
    () => (import.meta as any).env?.VITE_GOOGLE_MAPS_API_KEY || ''
  );
  const [keyLoading, setKeyLoading] = useState<boolean>(!mapsApiKey);

  // Route states
  const [originCoords, setOriginCoords] = useState<google.maps.LatLngLiteral | null>(null);
  const [originLabel, setOriginLabel] = useState<string>('');
  const [travelMode, setTravelMode] = useState<TravelModeKey>('DRIVING');
  const [routeSummary, setRouteSummary] = useState<RouteSummary | null>(null);
  const [routeError, setRouteError] = useState<string | null>(null);
  const [computingRoute, setComputingRoute] = useState<boolean>(false);
  const [locatingUser, setLocatingUser] = useState<boolean>(false);

  // Client reviews states
  const [reviews, setReviews] = useState<BarberReview[]>(() => storeService.getReviews());
  const [averageRating, setAverageRating] = useState<number>(() => storeService.getAverageReviewRating());
  const [ratingFilter, setRatingFilter] = useState<number | null>(null);
  const [showReviewForm, setShowReviewForm] = useState<boolean>(false);
  const [reviewName, setReviewName] = useState<string>(activeClient?.name || '');
  const [reviewBarber, setReviewBarber] = useState<string>(
    `${INITIAL_BARBERS[0].name} (${INITIAL_BARBERS[0].alias})`
  );
  const [reviewService, setReviewService] = useState<string>(INITIAL_PACKAGES[0].title);
  const [reviewRating, setReviewRating] = useState<number>(5);
  const [reviewComment, setReviewComment] = useState<string>('');
  const [reviewSuccess, setReviewSuccess] = useState<boolean>(false);

  useEffect(() => {
    if (activeClient?.name && !reviewName) {
      setReviewName(activeClient.name);
    }
  }, [activeClient?.name]);

  useEffect(() => {
    if (mapsApiKey) {
      setKeyLoading(false);
      return;
    }
    let mounted = true;
    fetch('/api/maps/config')
      .then((res) => res.json())
      .then((data) => {
        if (!mounted) return;
        if (data?.apiKey) {
          setMapsApiKey(data.apiKey);
        }
        setKeyLoading(false);
      })
      .catch(() => {
        if (mounted) setKeyLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [mapsApiKey]);

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      setRouteError('Tu navegador no soporta geolocalización GPS. Ingresa una dirección arriba.');
      return;
    }
    setLocatingUser(true);
    setRouteError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocatingUser(false);
        setOriginCoords({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
        setOriginLabel('Mi Ubicación GPS Actual');
      },
      () => {
        setLocatingUser(false);
        setRouteError(
          'No pudimos acceder a tu ubicación GPS. Activa los permisos o selecciona un punto de partida rápido.'
        );
      },
      { enableHighAccuracy: true, timeout: 9000 }
    );
  };

  const handleRouteCalculated = useCallback((summary: RouteSummary | null, errorMsg?: string | null) => {
    setRouteSummary(summary);
    setRouteError(errorMsg ?? null);
  }, []);

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = reviewName.trim();
    const cleanComment = reviewComment.trim();
    if (!cleanName || cleanComment.length < 6) return;

    storeService.addReview({
      clientName: cleanName,
      barberName: reviewBarber,
      serviceName: reviewService,
      rating: reviewRating,
      comment: cleanComment,
      verifiedVisit: Boolean(activeClient),
    });

    setReviews(storeService.getReviews());
    setAverageRating(storeService.getAverageReviewRating());
    setReviewComment('');
    setReviewRating(5);
    setShowReviewForm(false);
    setReviewSuccess(true);
    setTimeout(() => setReviewSuccess(false), 3500);
  };

  const visibleReviews = ratingFilter
    ? reviews.filter((r) => r.rating === ratingFilter)
    : reviews;

  return (
    <section
      id="contacto"
      className="py-16 sm:py-20 bg-gradient-to-b from-[#070b14] to-[#05070d] border-t border-cyan-500/20 relative overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-10">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-950/70 border border-cyan-500/40 text-cyan-300 text-xs font-mono font-bold mb-3">
              <MapPin className="w-3.5 h-3.5 text-cyan-400" />
              <span>UBICACIÓN, RUTAS RÁPIDAS & RESEÑAS</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-white font-tech tracking-tight">
              Encuentra <span className="text-cyan-400 glow-text-cyan">BARBER IA</span> y Llega sin Demoras
            </h2>
            <p className="text-sm text-slate-400 mt-2 max-w-2xl">
              Calcula la ruta más rápida en tiempo real hasta nuestra sucursal central en Equipetrol y revisa o comparte experiencias de otros clientes.
            </p>
          </div>

          {onOpenBooking && (
            <button
              onClick={onOpenBooking}
              className="self-start md:self-auto px-5 py-3 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-600 hover:from-cyan-300 text-slate-950 font-black text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(0,240,255,0.35)] flex items-center gap-2 transition-all active:scale-95"
            >
              <Calendar className="w-4 h-4" />
              <span>Reservar Turno Presencial</span>
            </button>
          )}
        </div>

        {/* Main Grid: Interactive Map + Fastest Route (7 cols) & Reviews (5 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left 7 Cols: Interactive Google Map & Fastest Route Planner */}
          <div className="lg:col-span-7 space-y-4">
            <div className="rounded-2xl bg-[#0a0f1d] border-2 border-cyan-500/30 p-4 sm:p-5 space-y-4 shadow-[0_0_35px_rgba(0,240,255,0.12)]">
              
              {/* Route Calculator Bar */}
              <div className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="text-sm font-black text-white uppercase font-tech flex items-center gap-2">
                    <Navigation className="w-4 h-4 text-cyan-400" />
                    Calcular Ruta Más Rápida a la Barbería
                  </h3>
                  <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
                    {(
                      [
                        { id: 'DRIVING', label: 'Auto', Icon: Car },
                        { id: 'WALKING', label: 'A pie', Icon: Footprints },
                        { id: 'BICYCLING', label: 'Bici', Icon: Bike },
                        { id: 'TRANSIT', label: 'Bus', Icon: TrainFront },
                      ] as const
                    ).map(({ id, label, Icon }) => (
                      <button
                        key={id}
                        type="button"
                        onClick={() => setTravelMode(id)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold flex items-center gap-1 transition-all ${
                          travelMode === id
                            ? 'bg-cyan-500 text-slate-950'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">{label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Origin Search + GPS Button */}
                {mapsApiKey ? (
                  <APIProvider apiKey={mapsApiKey} language="es" region="BO" libraries={['marker', 'routes', 'places']}>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <OriginAutocompleteInput
                        onSelectOrigin={(coords, label) => {
                          setOriginCoords(coords);
                          setOriginLabel(label);
                        }}
                      />
                      <button
                        type="button"
                        disabled={locatingUser}
                        onClick={handleUseMyLocation}
                        className="px-4 py-2.5 rounded-xl bg-cyan-950/70 border border-cyan-500/50 hover:bg-cyan-500 hover:text-slate-950 text-cyan-300 text-xs font-bold flex items-center justify-center gap-1.5 transition-all shrink-0 disabled:opacity-60"
                      >
                        <Crosshair className={`w-4 h-4 ${locatingUser ? 'animate-spin' : ''}`} />
                        <span>{locatingUser ? 'Ubicando...' : 'Usar Mi GPS'}</span>
                      </button>
                    </div>

                    {/* Quick Landmark Origins */}
                    <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                      <span className="text-slate-500 font-mono">Salida rápida:</span>
                      {QUICK_ORIGINS.map((q) => (
                        <button
                          key={q.label}
                          type="button"
                          onClick={() => {
                            setOriginCoords(q.coords);
                            setOriginLabel(q.label);
                          }}
                          className={`px-2.5 py-1 rounded-lg border font-mono transition-colors ${
                            originLabel === q.label
                              ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 font-bold'
                              : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                          }`}
                        >
                          {q.label}
                        </button>
                      ))}
                      {originCoords && (
                        <button
                          type="button"
                          onClick={() => {
                            setOriginCoords(null);
                            setOriginLabel('');
                            setRouteSummary(null);
                            setRouteError(null);
                          }}
                          className="px-2 py-1 text-[10px] text-slate-400 hover:text-red-400 underline font-mono"
                        >
                          Limpiar ruta
                        </button>
                      )}
                    </div>

                    {/* Live Route ETA Banner */}
                    {computingRoute && (
                      <div className="p-2.5 rounded-xl bg-cyan-950/40 border border-cyan-500/30 text-xs text-cyan-300 font-mono flex items-center gap-2">
                        <RouteIcon className="w-4 h-4 animate-pulse" />
                        <span>Calculando la ruta más rápida con tráfico en tiempo real...</span>
                      </div>
                    )}

                    {routeSummary && !computingRoute && (
                      <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/40 flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400">
                            <RouteIcon className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="text-sm font-black text-white font-tech">
                              {routeSummary.durationMin} min • {routeSummary.distanceKm} km
                            </div>
                            <div className="text-[11px] text-emerald-300 font-mono">
                              {routeSummary.summaryLabel} desde {originLabel}
                            </div>
                          </div>
                        </div>

                        <a
                          href={`https://www.google.com/maps/dir/?api=1&origin=${originCoords?.lat},${originCoords?.lng}&destination=${BARBERSHOP_LOCATION.lat},${BARBERSHOP_LOCATION.lng}&travelmode=${travelMode.toLowerCase()}`}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-1.5 rounded-lg bg-emerald-500 text-slate-950 text-xs font-black flex items-center gap-1 hover:bg-emerald-400 transition-colors"
                        >
                          <span>Iniciar GPS</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    )}

                    {routeError && (
                      <div className="p-2.5 rounded-xl bg-amber-950/40 border border-amber-500/40 text-xs text-amber-200">
                        {routeError}
                      </div>
                    )}

                    {/* Map Viewport Container (Explicit Height Required per CF2) */}
                    <div className="w-full h-[380px] sm:h-[440px] rounded-xl overflow-hidden border border-cyan-500/30 relative bg-slate-950">
                      <GoogleMap
                        mapId="DEMO_MAP_ID"
                        defaultCenter={BARBERSHOP_LOCATION}
                        defaultZoom={15}
                        gestureHandling="greedy"
                        internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
                        style={{ width: '100%', height: '100%' }}
                      >
                        <BarberMapContent
                          origin={originCoords}
                          originLabel={originLabel}
                          travelMode={travelMode}
                          onRouteCalculated={handleRouteCalculated}
                          onComputingChange={setComputingRoute}
                        />
                      </GoogleMap>
                    </div>
                  </APIProvider>
                ) : (
                  <div className="w-full h-[360px] rounded-xl border border-slate-800 bg-slate-950 flex flex-col items-center justify-center p-6 text-center space-y-3">
                    <MapPin className="w-10 h-10 text-cyan-400" />
                    <p className="text-sm font-bold text-white">
                      {keyLoading
                        ? 'Inicializando visor interactivo de Google Maps...'
                        : 'Google Maps listo para activar con tu clave de proyecto'}
                    </p>
                    <p className="text-xs text-slate-400 max-w-md">{BARBERSHOP_ADDRESS}</p>
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${BARBERSHOP_LOCATION.lat},${BARBERSHOP_LOCATION.lng}`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-4 py-2 rounded-xl bg-cyan-500 text-slate-950 text-xs font-black flex items-center gap-1.5"
                    >
                      <span>Ver Ruta en Google Maps</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                )}
              </div>

              {/* Contact Quick Strip below map */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-800 text-xs">
                <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-950 border border-slate-800/80">
                  <MapPin className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-white">Dirección</div>
                    <div className="text-slate-400 text-[11px]">{BARBERSHOP_ADDRESS}</div>
                  </div>
                </div>
                <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-950 border border-slate-800/80">
                  <Clock className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-white">Horarios</div>
                    <div className="text-slate-400 text-[11px]">Lun-Sáb 09:00-21:00 • Dom 10:00-18:00</div>
                  </div>
                </div>
                <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-950 border border-slate-800/80">
                  <Phone className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-white">Contacto Directo</div>
                    <div className="text-slate-400 text-[11px] flex flex-col">
                      <span>+591 7788-9900</span>
                      <span className="flex items-center gap-1 text-cyan-400">
                        <Mail className="w-3 h-3" /> citas@barberia.bo
                      </span>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Right 5 Cols: Client Reviews & Add Review Widget */}
          <div className="lg:col-span-5 space-y-4">
            <div className="rounded-2xl bg-[#0a0f1d] border-2 border-cyan-500/30 p-5 space-y-4 shadow-[0_0_35px_rgba(0,240,255,0.1)]">
              
              {/* Rating Header */}
              <div className="flex items-center justify-between gap-3 border-b border-slate-800 pb-4">
                <div>
                  <div className="text-[11px] font-mono text-cyan-400 uppercase font-bold">
                    Opiniones de Clientes
                  </div>
                  <div className="flex items-center gap-2.5 mt-1">
                    <span className="text-3xl font-black text-white font-tech">{averageRating.toFixed(1)}</span>
                    <div>
                      <div className="flex items-center text-amber-400">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            className={`w-4 h-4 ${
                              s <= Math.round(averageRating) ? 'fill-amber-400 text-amber-400' : 'text-slate-700'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-[11px] text-slate-400 font-mono">
                        {reviews.length} reseñas registradas
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowReviewForm(!showReviewForm)}
                  className="px-3.5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center gap-1.5 transition-all shrink-0"
                >
                  <MessageSquarePlus className="w-4 h-4" />
                  <span>{showReviewForm ? 'Cerrar' : 'Añadir Reseña'}</span>
                </button>
              </div>

              {/* Confirmation Toast */}
              {reviewSuccess && (
                <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-xs text-emerald-300 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>¡Gracias! Tu reseña ya quedó publicada en BARBER IA.</span>
                </div>
              )}

              {/* Add Review Form */}
              {showReviewForm && (
                <form
                  onSubmit={handleSubmitReview}
                  className="p-4 rounded-xl bg-slate-950 border border-cyan-500/40 space-y-3 animate-in fade-in slide-in-from-top-2"
                >
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-cyan-400" />
                    <span>Cuéntanos cómo fue tu corte en BARBER IA</span>
                  </div>

                  {/* Interactive Star Picker */}
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono text-slate-400">Tu Calificación:</span>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((starVal) => (
                        <button
                          key={starVal}
                          type="button"
                          onClick={() => setReviewRating(starVal)}
                          className="p-1 hover:scale-110 transition-transform"
                          title={`${starVal} estrellas`}
                        >
                          <Star
                            className={`w-5 h-5 ${
                              starVal <= reviewRating
                                ? 'fill-amber-400 text-amber-400'
                                : 'text-slate-600'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  <input
                    type="text"
                    required
                    value={reviewName}
                    onChange={(e) => setReviewName(e.target.value)}
                    placeholder="Tu nombre completo"
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 focus:border-cyan-400 focus:outline-none text-xs text-white"
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <select
                      value={reviewService}
                      onChange={(e) => setReviewService(e.target.value)}
                      className="px-2.5 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-200 focus:border-cyan-400 focus:outline-none"
                    >
                      {INITIAL_PACKAGES.map((p) => (
                        <option key={p.id} value={p.title}>
                          {p.title}
                        </option>
                      ))}
                    </select>

                    <select
                      value={reviewBarber}
                      onChange={(e) => setReviewBarber(e.target.value)}
                      className="px-2.5 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-200 focus:border-cyan-400 focus:outline-none"
                    >
                      {INITIAL_BARBERS.map((b) => (
                        <option key={b.id} value={`${b.name} (${b.alias})`}>
                          {b.name} ({b.alias})
                        </option>
                      ))}
                    </select>
                  </div>

                  <textarea
                    required
                    minLength={6}
                    rows={3}
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="¿Qué te pareció el corte, la atención y la ubicación?"
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 focus:border-cyan-400 focus:outline-none text-xs text-white resize-none"
                  />

                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-600 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Publicar Reseña</span>
                  </button>
                </form>
              )}

              {/* Star Filter Pills */}
              <div className="flex flex-wrap gap-1.5 text-[11px] font-mono">
                <button
                  type="button"
                  onClick={() => setRatingFilter(null)}
                  className={`px-2.5 py-1 rounded-lg border transition-colors ${
                    ratingFilter === null
                      ? 'bg-cyan-500 text-slate-950 border-cyan-400 font-bold'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                  }`}
                >
                  Todas ({reviews.length})
                </button>
                {[5, 4, 3].map((stars) => {
                  const count = reviews.filter((r) => r.rating === stars).length;
                  return (
                    <button
                      key={stars}
                      type="button"
                      onClick={() => setRatingFilter(ratingFilter === stars ? null : stars)}
                      className={`px-2.5 py-1 rounded-lg border transition-colors ${
                        ratingFilter === stars
                          ? 'bg-cyan-500 text-slate-950 border-cyan-400 font-bold'
                          : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                      }`}
                    >
                      {stars}★ ({count})
                    </button>
                  );
                })}
              </div>

              {/* Reviews Feed */}
              <div className="space-y-3 max-h-[410px] overflow-y-auto pr-1">
                {visibleReviews.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-500 bg-slate-950 rounded-xl border border-slate-800">
                    No hay reseñas con esa calificación todavía. ¡Sé el primero en opinar!
                  </div>
                ) : (
                  visibleReviews.map((rev) => (
                    <div
                      key={rev.id}
                      className="p-3.5 rounded-xl bg-slate-950/90 border border-slate-800 hover:border-cyan-500/40 transition-colors space-y-2"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-white">{rev.clientName}</span>
                            {rev.verifiedVisit && (
                              <span className="text-[9px] bg-emerald-950 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.5 rounded font-mono">
                                Cliente Verificado
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-cyan-400 font-mono mt-0.5">
                            {rev.serviceName} • {rev.barberName}
                          </div>
                        </div>

                        <div className="flex items-center gap-0.5 shrink-0">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                              key={s}
                              className={`w-3.5 h-3.5 ${
                                s <= rev.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-700'
                              }`}
                            />
                          ))}
                        </div>
                      </div>

                      <p className="text-xs text-slate-300 leading-relaxed">{rev.comment}</p>

                      <div className="text-[10px] text-slate-500 font-mono">
                        {new Date(rev.createdAt).toLocaleDateString('es-BO', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </div>
                    </div>
                  ))
                )}
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
