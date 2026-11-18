/**
 * Data models for BARBER IA
 * Estilo • Tecnología • Precisión
 */

export type UserRole = 'client' | 'barber' | 'admin';

export interface FaceBiometricProfile {
  id: string;
  clientId: string;
  faceHash: string; // Non-reversible ISO 27001 compliant SHA-256 hash
  faceShape: 'oval' | 'square' | 'diamond' | 'round' | 'oblong' | 'heart';
  beardDensity: 'none' | 'light' | 'medium' | 'dense';
  hairTexture: 'straight' | 'wavy' | 'curly' | 'coily';
  recommendedTone: string;
  registeredAt: string;
  lastVerifiedAt: string;
}

export interface ClientProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  loyaltyPoints: number;
  totalVisits: number;
  favoriteBarberId?: string;
  faceBiometrics?: FaceBiometricProfile;
  notes?: string;
  preferredStyle?: string;
}

export interface BarberProfile {
  id: string;
  name: string;
  alias: string; // e.g. "Blade", "Cyber", "Fade Master"
  avatar: string;
  specialties: string[];
  rating: number;
  reviewsCount: number;
  status: 'available' | 'busy' | 'break' | 'offline';
  dailyStats: {
    servicesToday: number;
    revenueToday: number;
    tipsToday: number;
    averageTimeMin: number;
  };
  schedule: {
    startHour: number; // e.g. 9 for 09:00
    endHour: number; // e.g. 20 for 20:00
    lunchBreak: number; // e.g. 14 for 14:00
  };
}

export interface BarberServicePackage {
  id: string;
  title: string;
  category: 'precision' | 'vip' | 'color' | 'spa' | 'combo';
  tagline: string;
  price: number;
  durationMinutes: number;
  badge?: string;
  features: string[];
  aiRecommendedFor?: string[];
  image: string;
}

export type AppointmentStatus = 'pending' | 'confirmed' | 'in_chair' | 'completed' | 'cancelled';

export interface Appointment {
  id: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  clientId?: string;
  barberId: string;
  barberName: string;
  packageId: string;
  packageName: string;
  price: number;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  status: AppointmentStatus;
  paymentStatus: 'pending' | 'paid' | 'refunded';
  paymentMethod?: 'qr_simple' | 'credit_card' | 'apple_pay' | 'google_pay' | 'crypto' | 'cash';
  notes?: string;
  aiSuggestedCut?: string;
  fadeOrLengthSpec?: string;
  beardSpec?: string;
  whatsappOptIn?: boolean;
  whatsappReminderSentAt?: string;
  createdAt: string;
}

export interface CutStyleItem {
  id: string;
  name: string;
  category: 'fade' | 'modern' | 'classic' | 'cyberpunk' | 'beard';
  suitability: string[];
  description: string;
  imageUrl: string;
  difficulty: 'Standard' | 'Alto' | 'Maestro IA';
  estimatedTime: string;
  popularWithFaceShapes: string[];
  trendingScore: number;
  clipperGuards: string;
  hairTypes: string[];
  maintenanceCycle: string;
  stylingGuide: string;
  recommendedProducts: string[];
}

export interface FaceBoxCoordinates {
  xCenterPct: number;   // 0-100 horizontal center of the face
  yHairTopPct: number;  // 0-100 top of hair/crown
  yEyebrowsPct: number; // 0-100 eyebrow line / forehead bottom
  yChinPct: number;     // 0-100 bottom of chin
  faceWidthPct: number; // 0-100 face width at cheekbones relative to image width
  headTiltDeg?: number; // -25 to +25 degrees head roll angle
}

export interface AIAnalysisResult {
  faceDetected?: boolean;
  faceDetectionReason?: string;
  faceBox?: FaceBoxCoordinates;
  faceShape: string;
  faceShapeSpanish: string;
  jawlineDescription: string;
  symmetryScore: number;
  faceMetrics?: {
    foreheadWidth: string;
    cheekboneWidth: string;
    jawlineAngle: string;
    faceRatio: string;
  };
  hairAnalysis?: {
    texture: string;
    density: string;
    recommendedVolume: string;
  };
  recommendedCuts: {
    styleName: string;
    matchScore: number;
    reason: string;
    recommendedLength: string;
    clipperGuards?: string;
    stylingTime?: string;
    maintenanceCycle?: string;
    visualPreset?: 'fade-textured' | 'pompadour' | 'buzz-laser' | 'mullet' | 'crop-top' | 'slick-back';
  }[];
  recommendedColor: {
    toneName: string;
    hexColor: string;
    description: string;
    maintenanceLevel: 'Bajo' | 'Medio' | 'Alto';
  };
  beardRecommendation: {
    style: string;
    trimAdvice: string;
    beardPreset?: 'sculpted' | 'stubble' | 'full-trimmed' | 'goatee' | 'clean';
  };
  productAdvice: string[];
  technicalBarberNotes: string;
}

export interface AuditSecurityLog {
  id: string;
  timestamp: string;
  eventType: 'AUTH_SUCCESS' | 'AUTH_FAILURE' | 'FACE_SCAN' | 'APPOINTMENT_CREATE' | 'PAYMENT_PROCESSED' | 'ADMIN_ACCESS';
  actor: string;
  ipMasked: string;
  isoStandard: 'ISO_27001_A.12.4' | 'OWASP_AUTH_FAIL' | 'OWASP_INJECTION_DEFENSE' | 'ISO_42010_ARCH';
  details: string;
  status: 'info' | 'warning' | 'success';
}

export type CurrencyCode = 'BOB' | 'USD' | 'EUR' | 'BRL' | 'ARS';

export type ProductCategory = 'shampoo' | 'hair_cream' | 'beard_care' | 'body_care' | 'shaving' | 'combs' | 'shavers' | 'styling';

export interface BarberProduct {
  id: string;
  name: string;
  category: ProductCategory;
  categoryName: string;
  priceBs: number; // Base price in Bolivianos (Bs)
  rating: number;
  reviewsCount: number;
  stock: number;
  description: string;
  features: string[];
  volumeOrSpecs: string; // e.g. "300 ml", "100 g", "Batería Li-Ion 120 min"
  imageUrl: string;
  badge?: string;
  aiSuggestedFor?: string[]; // e.g. ['square', 'oval', 'dense_beard']
}

export interface CartItem {
  product: BarberProduct;
  quantity: number;
}

export interface ProductOrder {
  id: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  items: CartItem[];
  totalBs: number;
  currencyUsed?: CurrencyCode;
  exchangeRate?: number;
  paymentMethod: 'qr_simple' | 'card' | 'cash_on_pickup';
  qrReference?: string;
  deliveryMethod: 'pickup_barberia' | 'delivery_express';
  deliveryAddress?: string;
  status: 'pending' | 'confirmed' | 'delivered';
  createdAt: string;
}

export interface BarberReview {
  id: string;
  clientName: string;
  barberName: string;
  serviceName: string;
  rating: number; // 1 to 5
  comment: string;
  verifiedVisit: boolean;
  createdAt: string;
}
