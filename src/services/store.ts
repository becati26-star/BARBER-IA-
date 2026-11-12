/**
 * Store Service for BARBER IA
 * Manages persistent storage with localStorage fallback, real-time appointments,
 * barber stats, client profiles, and push notifications.
 */

import { BarberProfile, BarberServicePackage, Appointment, ClientProfile, CutStyleItem } from '../types';
import { securityService } from './security';

const STORAGE_KEYS = {
  CLIENTS: 'barber_ia_clients',
  APPOINTMENTS: 'barber_ia_appointments',
  BARBERS: 'barber_ia_barbers',
  ACTIVE_USER: 'barber_ia_active_user',
  NOTIFICATIONS: 'barber_ia_notifications',
};

export const INITIAL_BARBERS: BarberProfile[] = [
  {
    id: 'barber-1',
    name: 'Carlos Mendoza',
    alias: 'Blade',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
    specialties: ['Fade Láser', 'Diseño Cyberpunk', 'Degradado Skin'],
    rating: 4.95,
    reviewsCount: 342,
    status: 'available',
    dailyStats: {
      servicesToday: 7,
      revenueToday: 215,
      tipsToday: 42,
      averageTimeMin: 32,
    },
    schedule: { startHour: 9, endHour: 20, lunchBreak: 14 },
  },
  {
    id: 'barber-2',
    name: 'Alex Silva',
    alias: 'Cyber',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80',
    specialties: ['Coloración Neón', 'Barboterapia Ozono', 'Pompadour Texturizado'],
    rating: 5.0,
    reviewsCount: 489,
    status: 'busy',
    dailyStats: {
      servicesToday: 9,
      revenueToday: 310,
      tipsToday: 65,
      averageTimeMin: 40,
    },
    schedule: { startHour: 10, endHour: 21, lunchBreak: 15 },
  },
  {
    id: 'barber-3',
    name: 'Mateo Rossi',
    alias: 'Fade Master',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80',
    specialties: ['Low & Mid Taper Fade', 'Barba Esculpida', 'Perfilado Navaja'],
    rating: 4.88,
    reviewsCount: 275,
    status: 'available',
    dailyStats: {
      servicesToday: 6,
      revenueToday: 180,
      tipsToday: 30,
      averageTimeMin: 30,
    },
    schedule: { startHour: 9, endHour: 19, lunchBreak: 13 },
  },
  {
    id: 'barber-4',
    name: 'David Gómez',
    alias: 'Viper',
    avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=600&q=80',
    specialties: ['Texturizado Asiático', 'Mullet Moderno', 'Cuidado Capilar Láser'],
    rating: 4.92,
    reviewsCount: 198,
    status: 'available',
    dailyStats: {
      servicesToday: 5,
      revenueToday: 155,
      tipsToday: 25,
      averageTimeMin: 35,
    },
    schedule: { startHour: 11, endHour: 21, lunchBreak: 16 },
  },
];

export const INITIAL_PACKAGES: BarberServicePackage[] = [
  {
    id: 'pkg-cyber-precision',
    title: 'Corte Cyber Precision',
    category: 'precision',
    tagline: 'Corte milimétrico con análisis morfológico de rostro mediante IA',
    price: 25,
    durationMinutes: 35,
    badge: 'MÁS POPULAR',
    features: [
      'Escaneo facial y recomendación de ángulos',
      'Degradado a elección (Skin, Low, Mid o Taper)',
      'Lavado tónico energizante con mentol',
      'Peinado con cera mate de alta fijación',
      'Garantía de simetría con visor IA',
    ],
    aiRecommendedFor: ['oval', 'square', 'round'],
    image: 'https://images.unsplash.com/photo-1622286342621-4bd786c2447c?auto=format&fit=crop&w=700&q=80',
  },
  {
    id: 'pkg-fade-barba-vip',
    title: 'Fade Holográfico + Barba VIP IA',
    category: 'vip',
    tagline: 'La experiencia definitiva: arquitectura capilar y barba esculpida',
    price: 38,
    durationMinutes: 50,
    badge: 'RECOMENDADO IA',
    features: [
      'Análisis facial completo (rostro + estructura maxilar)',
      'Corte de alta gama con navaja tradicional y máquina láser',
      'Diseño y perfilado de barba con toalla caliente infusionada',
      'Aceite hidronutritivo con extracto de argán y ozonoterapia',
      'Bebida de cortesía en el bar cyber lounge',
    ],
    aiRecommendedFor: ['diamond', 'oblong', 'square'],
    image: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=700&q=80',
  },
  {
    id: 'pkg-color-ia',
    title: 'Transformación Total Color IA',
    category: 'color',
    tagline: 'Decoloración y matiz inteligente adaptado a tu subtono de piel',
    price: 55,
    durationMinutes: 75,
    badge: 'ESTILO EXCLUSIVO',
    features: [
      'Diagnóstico cromático por IA para tono perfecto',
      'Decoloración controlada con protector de enlaces Plex',
      'Tonalización (Platino Cyber, Humo Gris, Azul Eléctrico o Cenizo)',
      'Corte de definición final y sellado de cutícula',
      'Kit de mantenimiento para el hogar incluido',
    ],
    aiRecommendedFor: ['heart', 'oval', 'round'],
    image: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&w=700&q=80',
  },
  {
    id: 'pkg-spa-laser',
    title: 'Perfilado Láser & Spa Facial Ozono',
    category: 'spa',
    tagline: 'Revitalización dérmica profunda, exfoliación y barba de alta costura',
    price: 32,
    durationMinutes: 40,
    features: [
      'Vapor de ozono antibacterial para apertura de poros',
      'Mascarilla negra de carbón activado purificante',
      'Perfilado milimétrico de contornos de barba y cuello',
      'Masaje facial craneal anti-estrés',
      'Bálsamo refrescante sellador con efecto frío',
    ],
    aiRecommendedFor: ['square', 'diamond', 'oblong'],
    image: 'https://images.unsplash.com/photo-1517832606589-7629c3397143?auto=format&fit=crop&w=700&q=80',
  },
  {
    id: 'pkg-combo-master',
    title: 'Combo Ejecutivo Cyber Master',
    category: 'combo',
    tagline: 'Servicio 360° todo incluido para eventos o renovación completa',
    price: 65,
    durationMinutes: 85,
    badge: 'VIP LUXURY',
    features: [
      'Escaneo biométrico y almacenamiento en tu Galería IA',
      'Corte Signature + Barba completa con toallas calientes dobles',
      'Tratamiento capilar reconstructor con colágeno',
      'Exfoliación facial + mascarilla de oro coloidal',
      'Bebida Premium y prioridad de reserva por 6 meses',
    ],
    aiRecommendedFor: ['oval', 'square', 'heart', 'diamond'],
    image: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=700&q=80',
  },
];

export const STYLES_CATALOG: CutStyleItem[] = [
  {
    id: 'style-1',
    name: 'Cyber Taper Fade Texturizado',
    category: 'fade',
    suitability: ['Rostro Ovalado', 'Rostro Cuadrado', 'Cabello Medio'],
    description: 'Laterales desvanecidos con precisión quirúrgica y parte superior despeinada con volumen controlado y textura mate.',
    imageUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=600&q=80',
    difficulty: 'Maestro IA',
    estimatedTime: '35 min',
    popularWithFaceShapes: ['oval', 'square'],
    trendingScore: 98,
  },
  {
    id: 'style-2',
    name: 'Pompadour Neón Moderno',
    category: 'modern',
    suitability: ['Rostro Redondo', 'Rostro Diamante', 'Cabello Lacio/Ondulado'],
    description: 'Líneas limpias, volumen hacia atrás con gran brillo estructurado. Alarga visualmente facciones redondeadas.',
    imageUrl: 'https://images.unsplash.com/photo-1622286342621-4bd786c2447c?auto=format&fit=crop&w=600&q=80',
    difficulty: 'Alto',
    estimatedTime: '40 min',
    popularWithFaceShapes: ['round', 'diamond'],
    trendingScore: 94,
  },
  {
    id: 'style-3',
    name: 'Low Skin Fade con Barba Esculpida',
    category: 'beard',
    suitability: ['Rostro Cuadrado', 'Rostro Oblongo', 'Barba Poblada'],
    description: 'Transición impecable de cero absoluto que se funde perfectamente con las patillas y una barba en ángulo recto.',
    imageUrl: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=600&q=80',
    difficulty: 'Maestro IA',
    estimatedTime: '50 min',
    popularWithFaceShapes: ['square', 'oblong'],
    trendingScore: 99,
  },
  {
    id: 'style-4',
    name: 'Mullet Futurista Cyberpunk',
    category: 'cyberpunk',
    suitability: ['Rostro Diamante', 'Rostro Corazón', 'Estilo Audaz'],
    description: 'Corte vanguardista con laterales casi afeitados, transición a caída posterior desmechada y flequillo recto recortado.',
    imageUrl: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&w=600&q=80',
    difficulty: 'Maestro IA',
    estimatedTime: '45 min',
    popularWithFaceShapes: ['diamond', 'heart'],
    trendingScore: 91,
  },
  {
    id: 'style-5',
    name: 'Buzz Cut con Diseño Láser Geométrico',
    category: 'fade',
    suitability: ['Rostro Ovalado', 'Cráneo Definido', 'Poco Mantenimiento'],
    description: 'Corte militar milimétrico con doble línea simétrica en lateral y nuca pulida como un circuito electrónico.',
    imageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80',
    difficulty: 'Standard',
    estimatedTime: '25 min',
    popularWithFaceShapes: ['oval', 'square'],
    trendingScore: 89,
  },
  {
    id: 'style-6',
    name: 'Crop Top Francés Desconectado',
    category: 'modern',
    suitability: ['Rostro Alargado', 'Frente Amplia', 'Cabello Texturizado'],
    description: 'Flequillo micro-horizontal y textura en puntas que enmarca los ojos y armoniza las proporciones del rostro.',
    imageUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=600&q=80',
    difficulty: 'Alto',
    estimatedTime: '35 min',
    popularWithFaceShapes: ['oblong', 'oval'],
    trendingScore: 93,
  },
];

export const INITIAL_CLIENTS: ClientProfile[] = [
  {
    id: 'client-1',
    name: 'Lucas Ramírez',
    email: 'lucas.ramirez@cybermail.com',
    phone: '+54 9 11 4589-2311',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80',
    loyaltyPoints: 340,
    totalVisits: 8,
    favoriteBarberId: 'barber-2',
    preferredStyle: 'Cyber Taper Fade Texturizado',
    faceBiometrics: {
      id: 'bio-demo-1',
      clientId: 'client-1',
      faceHash: 'BIO-F26-9A82B3C4-K7M9P2',
      faceShape: 'square',
      beardDensity: 'medium',
      hairTexture: 'wavy',
      recommendedTone: 'Platino Cenizo 9.1',
      registeredAt: '2026-02-10T14:20:00Z',
      lastVerifiedAt: '2026-11-10T16:45:00Z',
    },
    notes: 'Cliente prefiere degradado bajo sin tocar largo superior.',
  },
  {
    id: 'client-2',
    name: 'Juan Pablo Torres',
    email: 'jp.torres@techcorp.io',
    phone: '+54 9 11 5521-8842',
    avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=400&q=80',
    loyaltyPoints: 180,
    totalVisits: 4,
    favoriteBarberId: 'barber-1',
    preferredStyle: 'Fade Holográfico + Barba VIP IA',
  },
  {
    id: 'client-3',
    name: 'Sebastián Morales',
    email: 'seba.morales@agency.net',
    phone: '+54 9 11 6390-1288',
    avatar: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?auto=format&fit=crop&w=400&q=80',
    loyaltyPoints: 520,
    totalVisits: 14,
    favoriteBarberId: 'barber-2',
    preferredStyle: 'Pompadour Neón Moderno',
  },
];

export const INITIAL_APPOINTMENTS: Appointment[] = [
  {
    id: 'apt-101',
    clientName: 'Lucas Ramírez',
    clientEmail: 'lucas.ramirez@cybermail.com',
    clientPhone: '+54 9 11 4589-2311',
    clientId: 'client-1',
    barberId: 'barber-2',
    barberName: 'Alex Silva (Cyber)',
    packageId: 'pkg-fade-barba-vip',
    packageName: 'Fade Holográfico + Barba VIP IA',
    price: 38,
    date: new Date().toISOString().split('T')[0],
    time: '11:00',
    status: 'in_chair',
    paymentStatus: 'paid',
    paymentMethod: 'apple_pay',
    notes: 'Autenticado mediante reconocimiento facial biométrico.',
    aiSuggestedCut: 'Low Skin Fade con Barba Cuadrada',
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: 'apt-102',
    clientName: 'Juan Pablo Torres',
    clientEmail: 'jp.torres@techcorp.io',
    clientPhone: '+54 9 11 5521-8842',
    clientId: 'client-2',
    barberId: 'barber-1',
    barberName: 'Carlos Mendoza (Blade)',
    packageId: 'pkg-cyber-precision',
    packageName: 'Corte Cyber Precision',
    price: 25,
    date: new Date().toISOString().split('T')[0],
    time: '12:30',
    status: 'confirmed',
    paymentStatus: 'paid',
    paymentMethod: 'credit_card',
    aiSuggestedCut: 'Cyber Taper Fade Texturizado',
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
  },
  {
    id: 'apt-103',
    clientName: 'Sebastián Morales',
    clientEmail: 'seba.morales@agency.net',
    clientPhone: '+54 9 11 6390-1288',
    clientId: 'client-3',
    barberId: 'barber-2',
    barberName: 'Alex Silva (Cyber)',
    packageId: 'pkg-color-ia',
    packageName: 'Transformación Total Color IA',
    price: 55,
    date: new Date().toISOString().split('T')[0],
    time: '15:00',
    status: 'confirmed',
    paymentStatus: 'paid',
    paymentMethod: 'google_pay',
    aiSuggestedCut: 'Mullet Cyberpunk con Tono Platino',
    createdAt: new Date(Date.now() - 3600000 * 8).toISOString(),
  },
  {
    id: 'apt-104',
    clientName: 'Martín Zúñiga',
    clientEmail: 'martin.z@devstudio.com',
    clientPhone: '+54 9 11 7712-4409',
    barberId: 'barber-3',
    barberName: 'Mateo Rossi (Fade Master)',
    packageId: 'pkg-spa-laser',
    packageName: 'Perfilado Láser & Spa Facial Ozono',
    price: 32,
    date: new Date().toISOString().split('T')[0],
    time: '16:30',
    status: 'confirmed',
    paymentStatus: 'paid',
    paymentMethod: 'credit_card',
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
  },
  {
    id: 'apt-105',
    clientName: 'Diego Fernández',
    clientEmail: 'diego.f@startups.co',
    clientPhone: '+54 9 11 8831-9922',
    barberId: 'barber-1',
    barberName: 'Carlos Mendoza (Blade)',
    packageId: 'pkg-combo-master',
    packageName: 'Combo Ejecutivo Cyber Master',
    price: 65,
    date: new Date().toISOString().split('T')[0],
    time: '18:00',
    status: 'pending',
    paymentStatus: 'pending',
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
  },
];

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: 'booking' | 'reminder' | 'ai' | 'security';
}

class StoreService {
  private appointments: Appointment[] = [];
  private barbers: BarberProfile[] = [];
  private clients: ClientProfile[] = [];
  private notifications: AppNotification[] = [
    {
      id: 'notif-1',
      title: '¡Recordatorio de Turno!',
      message: 'Lucas Ramírez tiene turno hoy a las 11:00 con Alex "Cyber" Silva.',
      timestamp: 'Hace 15 min',
      read: false,
      type: 'reminder',
    },
    {
      id: 'notif-2',
      title: 'Nuevo Análisis Morfológico IA',
      message: 'Diagnóstico de rostro ovalado completado con 98% de compatibilidad.',
      timestamp: 'Hace 45 min',
      read: false,
      type: 'ai',
    },
    {
      id: 'notif-3',
      title: 'Auditoría ISO 27001',
      message: 'Vector biométrico encriptado y autenticado sin brechas.',
      timestamp: 'Hace 2 horas',
      read: true,
      type: 'security',
    },
  ];

  constructor() {
    this.loadState();
  }

  private loadState() {
    try {
      const savedApts = localStorage.getItem(STORAGE_KEYS.APPOINTMENTS);
      this.appointments = savedApts ? JSON.parse(savedApts) : INITIAL_APPOINTMENTS;

      const savedBarbers = localStorage.getItem(STORAGE_KEYS.BARBERS);
      this.barbers = savedBarbers ? JSON.parse(savedBarbers) : INITIAL_BARBERS;

      const savedClients = localStorage.getItem(STORAGE_KEYS.CLIENTS);
      this.clients = savedClients ? JSON.parse(savedClients) : INITIAL_CLIENTS;
    } catch {
      this.appointments = INITIAL_APPOINTMENTS;
      this.barbers = INITIAL_BARBERS;
      this.clients = INITIAL_CLIENTS;
    }
  }

  private saveState() {
    try {
      localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(this.appointments));
      localStorage.setItem(STORAGE_KEYS.BARBERS, JSON.stringify(this.barbers));
      localStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify(this.clients));
    } catch (e) {
      console.warn('Storage quota or storage disabled:', e);
    }
  }

  // --- Appointments ---
  public getAppointments(): Appointment[] {
    return [...this.appointments];
  }

  public addAppointment(appointmentData: Omit<Appointment, 'id' | 'createdAt'>): Appointment {
    const newAppointment: Appointment = {
      ...appointmentData,
      id: `apt-${Date.now()}-${Math.floor(Math.random() * 900 + 100)}`,
      createdAt: new Date().toISOString(),
    };

    this.appointments.unshift(newAppointment);

    // Update barber daily stats
    const barber = this.barbers.find(b => b.id === appointmentData.barberId);
    if (barber) {
      barber.dailyStats.servicesToday += 1;
      barber.dailyStats.revenueToday += appointmentData.price;
    }

    // Add push notification reminder
    this.addNotification({
      title: '¡Cita Confirmada en BARBER IA!',
      message: `Turno agendado para ${appointmentData.clientName} el ${appointmentData.date} a las ${appointmentData.time} con ${appointmentData.barberName}.`,
      type: 'booking',
    });

    securityService.logEvent(
      'APPOINTMENT_CREATE',
      appointmentData.clientName,
      'ISO_27001_A.12.4',
      `Nueva reserva para paquete ${appointmentData.packageName} ($${appointmentData.price})`
    );

    this.saveState();
    return newAppointment;
  }

  public updateAppointmentStatus(id: string, status: Appointment['status']): boolean {
    const index = this.appointments.findIndex(a => a.id === id);
    if (index !== -1) {
      this.appointments[index].status = status;
      this.saveState();
      return true;
    }
    return false;
  }

  // --- Barbers ---
  public getBarbers(): BarberProfile[] {
    return [...this.barbers];
  }

  public updateBarberStatus(barberId: string, status: BarberProfile['status']) {
    const b = this.barbers.find(item => item.id === barberId);
    if (b) {
      b.status = status;
      this.saveState();
    }
  }

  // --- Clients & Face Biometrics ---
  public getClients(): ClientProfile[] {
    return [...this.clients];
  }

  public findClientByFaceHash(faceHash: string): ClientProfile | undefined {
    return this.clients.find(c => c.faceBiometrics?.faceHash === faceHash);
  }

  public findClientByEmail(email: string): ClientProfile | undefined {
    return this.clients.find(c => c.email.toLowerCase() === email.toLowerCase().trim());
  }

  public registerClient(client: Omit<ClientProfile, 'id' | 'loyaltyPoints' | 'totalVisits'>): ClientProfile {
    const newClient: ClientProfile = {
      ...client,
      id: `client-${Date.now()}`,
      loyaltyPoints: 50, // Welcome gift
      totalVisits: 1,
    };
    this.clients.push(newClient);
    this.saveState();

    securityService.logEvent(
      'AUTH_SUCCESS',
      newClient.name,
      'ISO_27001_A.12.4',
      `Nuevo cliente registrado con éxito. ID: ${newClient.id}`
    );

    return newClient;
  }

  public updateClientBiometrics(clientId: string, biometrics: ClientProfile['faceBiometrics']) {
    const client = this.clients.find(c => c.id === clientId);
    if (client) {
      client.faceBiometrics = biometrics;
      this.saveState();
    }
  }

  // --- Notifications ---
  public getNotifications(): AppNotification[] {
    return [...this.notifications];
  }

  public addNotification(notif: Omit<AppNotification, 'id' | 'timestamp' | 'read'>) {
    const item: AppNotification = {
      ...notif,
      id: `notif-${Date.now()}`,
      timestamp: 'Ahora mismo',
      read: false,
    };
    this.notifications.unshift(item);
  }

  public markAllNotificationsRead() {
    this.notifications.forEach(n => (n.read = true));
  }
}

export const storeService = new StoreService();
