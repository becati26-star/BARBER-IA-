/**
 * Store Service for BARBER IA
 * Manages persistent storage with localStorage fallback, real-time appointments,
 * barber stats, client profiles, and push notifications.
 */

import { 
  BarberProfile, 
  BarberServicePackage, 
  Appointment, 
  ClientProfile, 
  CutStyleItem,
  BarberProduct,
  CartItem,
  ProductOrder
} from '../types';
import { securityService } from './security';

const STORAGE_KEYS = {
  CLIENTS: 'barber_ia_clients',
  APPOINTMENTS: 'barber_ia_appointments',
  BARBERS: 'barber_ia_barbers',
  ACTIVE_USER: 'barber_ia_active_user',
  NOTIFICATIONS: 'barber_ia_notifications',
  CART: 'barber_ia_cart',
  ORDERS: 'barber_ia_orders',
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
    price: 50, // 50 Bs
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
    price: 85, // 85 Bs
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
    price: 130, // 130 Bs
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
    price: 65, // 65 Bs
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
    price: 160, // 160 Bs
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

export const INITIAL_PRODUCTS: BarberProduct[] = [
  // --- Crema de Cabello para Hombre & Styling ---
  {
    id: 'prod-crema-peinar',
    name: 'Crema de Cabello Masculina Mate Urban Ritual',
    category: 'hair_cream',
    categoryName: 'Crema de Cabello Hombre',
    priceBs: 48,
    rating: 4.92,
    reviewsCount: 164,
    stock: 28,
    volumeOrSpecs: '150 ml • Fijación Natural',
    badge: 'PARA HOMBRE',
    description: 'Crema moldeadora masculina de rápida absorción que controla el frizz, hidrata la fibra capilar y deja un peinado masculino natural sin grasa ni brillo artificial.',
    features: ['Acabado mate masculino limpio', 'Con aceite de argán y provitamina B5', 'Controla cabello rebelde u ondulado', 'Aroma fresco amaderado'],
    imageUrl: '/assets/products/men_beard_balm_wax.jpg',
    aiSuggestedFor: ['wavy', 'crop_top'],
  },
  {
    id: 'prod-pomada-mate',
    name: 'Pomada Arcilla Mate Obsidian Clay Hombre',
    category: 'hair_cream',
    categoryName: 'Crema de Cabello Hombre',
    priceBs: 60,
    rating: 5.0,
    reviewsCount: 245,
    stock: 40,
    volumeOrSpecs: '120 g • Fijación Alta',
    badge: 'TOP BARBERÍA',
    description: 'Cera-crema de arcilla bentonita para cortes fade, crop francés y quiffs. Aporta textura seca, densidad visual y fijación todo el día.',
    features: ['Base acuosa (se enjuaga con agua)', 'Fijación fuerte y flexible', 'Acabado 100% mate sin residuos blancos', 'Ideal para clima de ciudad o altura'],
    imageUrl: '/assets/products/men_hair_cream.jpg',
    aiSuggestedFor: ['crop_top', 'fade_textured'],
  },
  {
    id: 'prod-cera-neon',
    name: 'Crema Cera Moldeadora Clásica Hombre',
    category: 'hair_cream',
    categoryName: 'Crema de Cabello Hombre',
    priceBs: 50,
    rating: 4.88,
    reviewsCount: 118,
    stock: 22,
    volumeOrSpecs: '100 g • Brillo Satinado',
    description: 'Especial para peinados de caballero como Slick Back, Pompadour y raya lateral definida con textura suave.',
    features: ['Fijación media re-peinable', 'Brillo elegante de barbero clásico', 'Fragancia notas de cedro y tabaco dulce'],
    imageUrl: '/assets/products/men_hair_cream.jpg',
    aiSuggestedFor: ['pompadour', 'classic_slick'],
  },

  // --- Crema & Cuidado para Barba ---
  {
    id: 'prod-crema-barba-calma',
    name: 'Crema Acondicionadora para Barba Hombre',
    category: 'beard_care',
    categoryName: 'Barba & Bigote',
    priceBs: 45,
    rating: 4.94,
    reviewsCount: 152,
    stock: 30,
    volumeOrSpecs: '100 ml • Suavizante Profundo',
    badge: 'ESENCIAL BARBA',
    description: 'Crema hidratante para barba masculina que ablanda el vello grueso al instante, elimina la picazón y nutre la piel debajo de la barba.',
    features: ['Suaviza barba áspera en segundos', 'Cero sensación grasosa', 'Previene resequedad y caspa en la barba', 'Aroma masculino sándalo & cedro'],
    imageUrl: '/assets/products/men_beard_cream.jpg',
    aiSuggestedFor: ['dense_beard', 'sculpted_beard'],
  },
  {
    id: 'prod-oleo-barba',
    name: 'Óleo Masculino para Barba con Bergamota & Argán',
    category: 'beard_care',
    categoryName: 'Barba & Bigote',
    priceBs: 50,
    rating: 4.92,
    reviewsCount: 142,
    stock: 28,
    volumeOrSpecs: '30 ml • Gotero Precisión',
    badge: 'VIP CARE',
    description: 'Elixir masculino de aceites prensados en frío que aporta brillo saludable, fortalece el folículo y perfuma la barba durante horas.',
    features: ['Jojoba, argán virgen y vitamina E', 'Domina pelos sueltos y puntas abiertas', 'Gotero dosificador de vidrio oscuro'],
    imageUrl: '/assets/products/men_beard_cream.jpg',
    aiSuggestedFor: ['dense_beard'],
  },
  {
    id: 'prod-balsamo-barba',
    name: 'Bálsamo Escultor de Barba & Bigote (Sándalo)',
    category: 'beard_care',
    categoryName: 'Barba & Bigote',
    priceBs: 42,
    rating: 4.88,
    reviewsCount: 95,
    stock: 25,
    volumeOrSpecs: '50 g • Lata Metálica',
    description: 'Manteca de karité y cera natural para dar forma firme a barbas medianas/largas y perfilar el bigote.',
    features: ['Fijación modeladora para barba', 'Protege contra viento y frío', 'Presentación práctica de bolsillo'],
    imageUrl: '/assets/products/men_beard_balm_wax.jpg',
  },

  // --- Crema Corporal para Hombre ---
  {
    id: 'prod-crema-corporal-carbon',
    name: 'Crema Corporal Masculina Carbón & Cedro',
    category: 'body_care',
    categoryName: 'Crema Corporal Hombre',
    priceBs: 52,
    rating: 4.91,
    reviewsCount: 112,
    stock: 26,
    volumeOrSpecs: '300 ml • Absorción Rápida',
    badge: 'NUEVO HOMBRE',
    description: 'Crema corporal hidratante diseñada específicamente para la piel gruesa del hombre. Hidrata 24 horas sin dejar película pegajosa ni olor dulce.',
    features: ['Carbón activo + aceite esencial de cedro', 'Textura ligera de absorción en 10 segundos', 'Ideal post-ducha o post-entrenamiento', 'Fragancia masculina intensa y limpia'],
    imageUrl: '/assets/products/men_body_cream.jpg',
  },
  {
    id: 'prod-crema-corporal-manos',
    name: 'Crema Hidratante Intensiva Cuerpo & Manos Hombre',
    category: 'body_care',
    categoryName: 'Crema Corporal Hombre',
    priceBs: 44,
    rating: 4.86,
    reviewsCount: 78,
    stock: 20,
    volumeOrSpecs: '200 ml • Tubo Mate',
    description: 'Fórmula con manteca de karité y minerales marinos para reparar codos, manos y piel reseca por el clima seco.',
    features: ['Sin parabenos ni brillos grasos', 'Repara piel agrietada y seca', 'Aroma amaderado discreto'],
    imageUrl: '/assets/products/men_body_cream.jpg',
  },

  // --- Crema de Afeitar & After-Shave ---
  {
    id: 'prod-crema-afeitar-clasica',
    name: 'Crema de Afeitar Barbero Espuma Rica + Brocha',
    category: 'shaving',
    categoryName: 'Crema de Afeitar & Post',
    priceBs: 58,
    rating: 4.97,
    reviewsCount: 204,
    stock: 22,
    volumeOrSpecs: '200 g • Fórmula Profesional',
    badge: 'CLÁSICO BARBERÍA',
    description: 'Crema de afeitar cremosa que crea una espuma densa protectora para que la navaja deslice suave al ras sin cortes ni enrojecimiento.',
    features: ['Lubricación superior para navaja o rastrillo', 'Con eucalipto refrescante y glicerina', 'Previene foliculitis y vellos encarnados'],
    imageUrl: '/assets/products/men_shaving_cream.jpg',
  },
  {
    id: 'prod-aftershave-sandalo',
    name: 'Loción After-Shave & Bálsamo Calmante Hombre',
    category: 'shaving',
    categoryName: 'Crema de Afeitar & Post',
    priceBs: 55,
    rating: 4.93,
    reviewsCount: 147,
    stock: 24,
    volumeOrSpecs: '100 ml • Vidrio Ahumado',
    badge: 'ANTI-IRRITACIÓN',
    description: 'Cierra los poros al instante después del afeitado, desinfecta micro-cortes y calma el ardor con aloe vera, mentol y madera de sándalo.',
    features: ['Efecto calmante y refrescante inmediato', 'Sin ardor excesivo', 'Fragancia clásica de barbería masculina'],
    imageUrl: '/assets/products/men_aftershave_bottle.jpg',
  },

  // --- Navajas & Hojas de Afeitar ---
  {
    id: 'prod-navaja-barbero',
    name: 'Navaja de Barbero Acero & Carbono + 10 Hojas',
    category: 'shavers',
    categoryName: 'Navajas & Hojas',
    priceBs: 45,
    rating: 4.95,
    reviewsCount: 189,
    stock: 48,
    volumeOrSpecs: 'Acero Inoxidable + Pack 10 Filos',
    badge: 'PRECISIÓN NAVAJA',
    description: 'Navaja porta-hojas profesional de barbería con mango de fibra de carbono antideslizante para perfilar barba, patillas, cerquillo y nuca.',
    features: ['Brazo de acero inoxidable balanceado', 'Incluye caja de 10 hojas doble filo platino', 'Cambio higiénico y seguro de cuchilla'],
    imageUrl: '/assets/products/barber_straight_razor.jpg',
  },
  {
    id: 'prod-hojas-afeitar',
    name: 'Pack 100 Hojas de Afeitar Doble Filo Acero Sueco',
    category: 'shavers',
    categoryName: 'Navajas & Hojas',
    priceBs: 35,
    rating: 4.9,
    reviewsCount: 210,
    stock: 60,
    volumeOrSpecs: '100 Hojas Partibles (200 Filos)',
    description: 'Cuchillas recubiertas en cromo platino de corte ultra suave, compatibles con toda navaja de barbero y rastrillo clásico metálico.',
    features: ['Filo láser de larga duración', 'Embalaje individual en papel encerado', 'Cero tirones en barba cerrada'],
    imageUrl: '/assets/products/barber_straight_razor.jpg',
  },

  // --- Shampoos para Hombre ---
  {
    id: 'prod-shampoo-carbon',
    name: 'Shampoo Masculino Carbón Activado & Mentol',
    category: 'shampoo',
    categoryName: 'Shampoo Hombre',
    priceBs: 45,
    rating: 4.94,
    reviewsCount: 176,
    stock: 32,
    volumeOrSpecs: '250 ml • Detox Folicular',
    badge: 'MÁS VENDIDO',
    description: 'Shampoo negro purificante para hombre que elimina cera, grasa capilar y caspa dejando el cuero cabelludo frío y limpio.',
    features: ['Carbón activo + mentol cristalizado', 'Limpia residuos de pomadas y ceras', 'Fortalece la raíz del cabello'],
    imageUrl: '/assets/products/men_shampoo_bottle.jpg',
    aiSuggestedFor: ['oily_scalp', 'daily_styling'],
  },
  {
    id: 'prod-shampoo-3en1',
    name: 'Shampoo Hombre 3 en 1 (Cabello, Barba y Cuerpo)',
    category: 'shampoo',
    categoryName: 'Shampoo Hombre',
    priceBs: 50,
    rating: 4.88,
    reviewsCount: 109,
    stock: 25,
    volumeOrSpecs: '350 ml • Uso Diario',
    description: 'Todo en una botella para el hombre práctico: limpia cabello, suaviza la barba y refresca el cuerpo en un solo paso.',
    features: ['Fórmula balanceada sin resecar la barba', 'Ideal para el gimnasio o viajes', 'Aroma fresco de menta y pino'],
    imageUrl: '/assets/products/men_shampoo_bottle.jpg',
  },

  // --- Peines, Cepillos & Máquinas ---
  {
    id: 'prod-peine-carbono',
    name: 'Kit Peine Fibra de Carbono + Cepillo Barba Jabalí',
    category: 'combs',
    categoryName: 'Peines & Cepillos',
    priceBs: 45,
    rating: 4.91,
    reviewsCount: 162,
    stock: 38,
    volumeOrSpecs: 'Peine Antiestático + Cepillo Madera',
    description: 'Set masculino de peine fade antiestático resistente al calor y cepillo de madera con cerdas naturales de jabalí para acomodar la barba.',
    features: ['Cerdas firmes que exfolian la piel bajo la barba', 'Peine de carbono no genera estática', 'Distribuye aceites y cremas uniformemente'],
    imageUrl: '/assets/products/barber_comb_set.jpg',
  },
  {
    id: 'prod-shaver-titanio',
    name: 'Shaver Eléctrica Profesional Cero Absoluto Hombre',
    category: 'shavers',
    categoryName: 'Máquinas & Afeitadoras',
    priceBs: 220,
    rating: 4.98,
    reviewsCount: 310,
    stock: 12,
    volumeOrSpecs: 'Pantalla LED • Batería 120 min',
    badge: 'MÁXIMA PRECISIÓN',
    description: 'Afeitadora eléctrica masculina de láminas dobles de titanio para afeitado al ras cero absoluto en barba, mejillas y degradados skin fade.',
    features: ['Láminas hipoalergénicas anti-irritación', 'Pantalla digital de porcentaje de batería', 'Carga rápida USB-C y motor 9.000 RPM'],
    imageUrl: '/assets/products/men_electric_shaver.jpg',
  },
  {
    id: 'prod-clipper-cyber',
    name: 'Máquina Cortadora Inalámbrica Pro Clipper + Shaver',
    category: 'shavers',
    categoryName: 'Máquinas & Afeitadoras',
    priceBs: 350,
    rating: 5.0,
    reviewsCount: 185,
    stock: 8,
    volumeOrSpecs: 'Cuchilla Acero DLC • 7.200 RPM',
    badge: 'HERRAMIENTA MASTER',
    description: 'Máquina profesional utilizada en BARBER IA para cortes en casa o barbería. Cuchilla ajustable con palanca cónica y batería de litio.',
    features: ['Display LED de carga en tiempo real', 'Cuchilla de acero inoxidable enfriada', 'Incluye 6 peines guía magnéticos'],
    imageUrl: '/assets/products/men_electric_shaver.jpg',
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
    clipperGuards: 'Patillas y nuca #0 a #1.5 • Superior a tijera entresacadora (4-5 cm)',
    hairTypes: ['Lacio', 'Ondulado', 'Grueso'],
    maintenanceCycle: 'Cada 15 - 20 días',
    stylingGuide: 'Secar con difusor hacia arriba, aplicar Polvo Texturizador en raíz y fijar puntas con Pomada Mate Cyber Hold.',
    recommendedProducts: ['Pomada Mate Cyber Hold (60 Bs)', 'Polvo Texturizador Mate (55 Bs)'],
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
    clipperGuards: 'Mid Fade #0.5 a #2 • Frontal largo (7-9 cm) peinado en elevación',
    hairTypes: ['Lacio', 'Ondulado'],
    maintenanceCycle: 'Cada 21 días',
    stylingGuide: 'Moldear con cepillo redondo y secador caliente en dirección posterior; sellar con Cera Moldeadora Brillo Medio.',
    recommendedProducts: ['Cera Moldeadora Brillo Medio (50 Bs)', 'Peine Púas Anchas (20 Bs)'],
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
    clipperGuards: 'Shaver 0.0 mm en zona baja • Gradiente #0.5 - #1 - #2 • Barba perfilada a navaja',
    hairTypes: ['Todos los tipos', 'Cabello Fuerte'],
    maintenanceCycle: 'Cada 10 - 15 días',
    stylingGuide: 'Hidratar la barba diariamente con Óleo de Bergamota y perfilar mejillas con Bálsamo Escultor.',
    recommendedProducts: ['Óleo Hidronutritivo para Barba (50 Bs)', 'Bálsamo Escultor (45 Bs)', 'Crema Post-Afeitado (42 Bs)'],
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
    clipperGuards: 'Sienes Burst Fade #0 a #1.5 • Corona y nuca desconectadas en capas (6-10 cm)',
    hairTypes: ['Ondulado', 'Rizado', 'Lacio con textura'],
    maintenanceCycle: 'Cada 20 - 25 días',
    stylingGuide: 'Aplicar Crema de Peinar Anti-Frizz en húmedo y definir mechones posteriores con cera mate ligera.',
    recommendedProducts: ['Crema de Peinar con Argán (48 Bs)', 'Polvo Texturizador Mate (55 Bs)'],
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
    clipperGuards: 'Superior #2 o #3 uniforme • Laterales High Skin Fade 0.0 mm • Líneas con Trimmer T-Wide',
    hairTypes: ['Todos los tipos'],
    maintenanceCycle: 'Cada 10 - 14 días',
    stylingGuide: 'No requiere peinado diario. Lavar con Shampoo Purificante Carbón & Ozono para mantener el cuero cabelludo limpio.',
    recommendedProducts: ['Shampoo Purificante Carbón & Ozono (45 Bs)', 'Cepillo de Jabalí (35 Bs)'],
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
    clipperGuards: 'Drop Fade #0 a #2 • Parte superior texturizada a navaja (3.5 cm) y flequillo recto',
    hairTypes: ['Lacio', 'Ondulado', 'Fino a Medio'],
    maintenanceCycle: 'Cada 18 - 21 días',
    stylingGuide: 'Peinar hacia adelante en húmedo con Peine de Carbono, espolvorear Polvo Voluminizador y apretar con Pomada Mate.',
    recommendedProducts: ['Pomada Mate Cyber Hold (60 Bs)', 'Peine Fibra de Carbono (25 Bs)'],
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
    price: 85,
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
    price: 50,
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
    price: 130,
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
    price: 65,
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
    price: 160,
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

      const savedCart = localStorage.getItem(STORAGE_KEYS.CART);
      this.cart = savedCart ? JSON.parse(savedCart) : [];

      const savedOrders = localStorage.getItem(STORAGE_KEYS.ORDERS);
      this.orders = savedOrders ? JSON.parse(savedOrders) : [];
    } catch {
      this.appointments = INITIAL_APPOINTMENTS;
      this.barbers = INITIAL_BARBERS;
      this.clients = INITIAL_CLIENTS;
      this.cart = [];
      this.orders = [];
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
      `Nueva reserva para paquete ${appointmentData.packageName} (${appointmentData.price} Bs)`
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

  public saveClientFaceStyleProfile(
    clientId: string | undefined,
    params: {
      faceShape: 'oval' | 'square' | 'diamond' | 'round' | 'oblong' | 'heart';
      preferredStyle: string;
      recommendedTone: string;
      faceHash: string;
    }
  ): ClientProfile {
    const targetClient = (clientId ? this.clients.find(c => c.id === clientId) : null) || this.clients[0];
    const now = new Date().toISOString();

    if (targetClient) {
      targetClient.preferredStyle = params.preferredStyle;
      targetClient.faceBiometrics = {
        id: targetClient.faceBiometrics?.id || `bio-${Date.now()}`,
        clientId: targetClient.id,
        faceHash: params.faceHash,
        faceShape: params.faceShape,
        beardDensity: targetClient.faceBiometrics?.beardDensity || 'medium',
        hairTexture: targetClient.faceBiometrics?.hairTexture || 'wavy',
        recommendedTone: params.recommendedTone,
        registeredAt: targetClient.faceBiometrics?.registeredAt || now,
        lastVerifiedAt: now,
      };
      this.saveState();
      return { ...targetClient };
    }

    const guestProfile = this.registerClient({
      name: 'Cliente Escaneado IA',
      email: 'invitado@barberia.bo',
      phone: '+591 7000-0000',
      preferredStyle: params.preferredStyle,
      faceBiometrics: {
        id: `bio-${Date.now()}`,
        clientId: `client-${Date.now()}`,
        faceHash: params.faceHash,
        faceShape: params.faceShape,
        beardDensity: 'medium',
        hairTexture: 'wavy',
        recommendedTone: params.recommendedTone,
        registeredAt: now,
        lastVerifiedAt: now,
      },
    });
    return guestProfile;
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

  private products: BarberProduct[] = INITIAL_PRODUCTS;
  private cart: CartItem[] = [];
  private orders: ProductOrder[] = [];

  public markAllNotificationsRead() {
    this.notifications.forEach(n => (n.read = true));
  }

  // --- Products & Store in Bolivianos (Bs) ---
  public getProducts(): BarberProduct[] {
    return [...this.products];
  }

  public getProductById(id: string): BarberProduct | undefined {
    return this.products.find(p => p.id === id);
  }

  // --- Cart Management ---
  public getCart(): CartItem[] {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CART);
      if (saved) {
        const parsed = JSON.parse(saved) as CartItem[];
        // Refresh catalog metadata (updated photos & Bs pricing) for any cached cart items
        this.cart = parsed.map((item) => {
          const fresh = this.products.find((p) => p.id === item.product?.id);
          return fresh ? { product: fresh, quantity: item.quantity } : item;
        });
      }
    } catch {}
    return [...this.cart];
  }

  public addToCart(product: BarberProduct, quantity: number = 1): void {
    const existingIndex = this.cart.findIndex(item => item.product.id === product.id);
    if (existingIndex > -1) {
      this.cart[existingIndex].quantity += quantity;
    } else {
      this.cart.push({ product, quantity });
    }
    this.saveCart();

    this.addNotification({
      title: 'Producto añadido al carrito',
      message: `${quantity}x ${product.name} (${product.priceBs} Bs c/u) agregado.`,
      type: 'booking',
    });
  }

  public updateCartQuantity(productId: string, quantity: number): void {
    if (quantity <= 0) {
      this.removeFromCart(productId);
      return;
    }
    const item = this.cart.find(i => i.product.id === productId);
    if (item) {
      item.quantity = quantity;
      this.saveCart();
    }
  }

  public removeFromCart(productId: string): void {
    this.cart = this.cart.filter(item => item.product.id !== productId);
    this.saveCart();
  }

  public clearCart(): void {
    this.cart = [];
    this.saveCart();
  }

  public getCartTotalBs(): number {
    return this.cart.reduce((sum, item) => sum + (item.product.priceBs * item.quantity), 0);
  }

  public getCartCount(): number {
    return this.cart.reduce((count, item) => count + item.quantity, 0);
  }

  private saveCart() {
    try {
      localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(this.cart));
    } catch (e) {
      console.warn('Could not save cart to localStorage:', e);
    }
  }

  // --- Orders ---
  public getOrders(): ProductOrder[] {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ORDERS);
      if (saved) this.orders = JSON.parse(saved);
    } catch {}
    return [...this.orders];
  }

  public createProductOrder(orderData: Omit<ProductOrder, 'id' | 'createdAt'>): ProductOrder {
    const newOrder: ProductOrder = {
      ...orderData,
      id: `ORD-BO-${Date.now().toString(36).toUpperCase()}-${Math.floor(Math.random() * 900 + 100)}`,
      createdAt: new Date().toISOString(),
    };

    this.orders.unshift(newOrder);
    try {
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(this.orders));
    } catch {}

    this.clearCart();

    this.addNotification({
      title: '¡Pedido Confirmado en BARBER IA!',
      message: `Tu orden ${newOrder.id} por ${newOrder.totalBs} Bs ha sido procesada con éxito.`,
      type: 'booking',
    });

    securityService.logEvent(
      'PAYMENT_PROCESSED',
      orderData.clientName,
      'ISO_27001_A.12.4',
      `Pedido de tienda ${newOrder.id} registrado (${newOrder.totalBs} Bs) mediante ${orderData.paymentMethod}`
    );

    return newOrder;
  }
}

export const storeService = new StoreService();

