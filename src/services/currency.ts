import { CurrencyCode } from '../types';

export interface CurrencyConfig {
  code: CurrencyCode;
  name: string;
  symbol: string;
  // How many Bolivianos (Bs) equal 1 unit of this currency
  rateToBs: number;
  flag: string;
}

export const CURRENCIES: Record<CurrencyCode, CurrencyConfig> = {
  BOB: {
    code: 'BOB',
    name: 'Bolivianos (Oficial)',
    symbol: 'Bs',
    rateToBs: 1,
    flag: '🇧🇴',
  },
  USD: {
    code: 'USD',
    name: 'Dólar Estadounidense',
    symbol: '$us',
    rateToBs: 6.96,
    flag: '🇺🇸',
  },
  EUR: {
    code: 'EUR',
    name: 'Euro',
    symbol: '€',
    rateToBs: 7.55,
    flag: '🇪🇺',
  },
  BRL: {
    code: 'BRL',
    name: 'Real Brasileño',
    symbol: 'R$',
    rateToBs: 1.25,
    flag: '🇧🇷',
  },
  ARS: {
    code: 'ARS',
    name: 'Peso Argentino',
    symbol: 'ARS$',
    rateToBs: 0.007,
    flag: '🇦🇷',
  },
};

/**
 * Converts an amount in Bolivianos (Bs) to the selected currency
 */
export function convertFromBs(amountBs: number, targetCurrency: CurrencyCode): number {
  const rate = CURRENCIES[targetCurrency].rateToBs;
  if (targetCurrency === 'BOB') return amountBs;
  return Number((amountBs / rate).toFixed(2));
}

/**
 * Converts an amount from a foreign currency to Bolivianos (Bs)
 */
export function convertToBs(amount: number, sourceCurrency: CurrencyCode): number {
  const rate = CURRENCIES[sourceCurrency].rateToBs;
  return Math.round(amount * rate);
}

/**
 * Formats a price in Bolivianos (Bs) with optional foreign currency equivalent
 */
export function formatPriceBs(amountBs: number, displayCurrency: CurrencyCode = 'BOB'): {
  primary: string;
  secondary?: string;
} {
  if (displayCurrency === 'BOB') {
    return { primary: `${amountBs} Bs` };
  }
  const converted = convertFromBs(amountBs, displayCurrency);
  const cfg = CURRENCIES[displayCurrency];
  return {
    primary: `${amountBs} Bs`,
    secondary: `≈ ${cfg.symbol} ${converted.toLocaleString('es-BO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${cfg.code}`,
  };
}

/**
 * Generates an EMVCo / QR Simple Bolivia compliant payment string
 */
export function buildBolivianQRPayload(params: {
  reference: string;
  amountBs: number;
  bankCode: string;
  concept: string;
}): string {
  const cleanConcept = params.concept.replace(/[^a-zA-Z0-9\s-]/g, '').slice(0, 32);
  return [
    '000201',
    '010212',
    `26440014bo.com.qrsimple0114${params.bankCode.toUpperCase()}0210BARBERIA`,
    '52047230', // MCC 7230 Barber & Beauty Shops
    '5303068',  // ISO 4217 Currency 068 = BOB (Boliviano)
    `5406${params.amountBs.toFixed(2)}`,
    '5802BO',
    '5912BARBER IA BO',
    '6006LA PAZ',
    `62240512${params.reference}0708${cleanConcept}`,
    '6304B1A9',
  ].join('|');
}
