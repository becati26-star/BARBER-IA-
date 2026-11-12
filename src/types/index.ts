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
  paymentMethod?: 'credit_card' | 'apple_pay' | 'google_pay' | 'crypto' | 'cash';
  notes?: string;
  aiSuggestedCut?: string;
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
}

export interface AIAnalysisResult {
  faceShape: string;
  faceShapeSpanish: string;
  jawlineDescription: string;
  symmetryScore: number;
  recommendedCuts: {
    styleName: string;
    matchScore: number;
    reason: string;
    recommendedLength: string;
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
