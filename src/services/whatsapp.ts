import { Appointment } from '../types';

/**
 * Normalizes a phone number into international WhatsApp digits-only format.
 * Defaults to Bolivia (+591) when an 8-digit local mobile number is provided.
 */
export function normalizeWhatsAppNumber(rawPhone: string, defaultCountryCode = '591'): string {
  const digits = (rawPhone || '').replace(/\D/g, '');
  if (!digits) return '';

  // Local Bolivian mobile numbers have 8 digits (usually starting with 6 or 7)
  if (digits.length === 8) {
    return `${defaultCountryCode}${digits}`;
  }

  // Strip leading 00 international prefix if entered
  if (digits.startsWith('00')) {
    return digits.slice(2);
  }

  return digits;
}

export function formatWhatsAppDisplay(rawPhone: string): string {
  const normalized = normalizeWhatsAppNumber(rawPhone);
  if (!normalized) return 'Sin número registrado';
  if (normalized.startsWith('591') && normalized.length === 11) {
    return `+591 ${normalized.slice(3, 7)}-${normalized.slice(7)}`;
  }
  return `+${normalized}`;
}

/**
 * Builds a complete Spanish WhatsApp reminder message containing all requested haircut specifications.
 */
export function buildAppointmentReminderMessage(
  apt: Appointment,
  options?: { isReminder?: boolean }
): string {
  const header = options?.isReminder
    ? `🔔 *RECORDATORIO DE CITA — BARBER IA*`
    : `✅ *CONFIRMACIÓN DE CITA — BARBER IA*`;

  const specsLines: string[] = [];
  if (apt.aiSuggestedCut) {
    specsLines.push(`• *Corte / Estilo:* ${apt.aiSuggestedCut}`);
  }
  if (apt.fadeOrLengthSpec) {
    specsLines.push(`• *Degradado / Largo:* ${apt.fadeOrLengthSpec}`);
  }
  if (apt.beardSpec) {
    specsLines.push(`• *Barba:* ${apt.beardSpec}`);
  }
  if (apt.notes && apt.notes.trim()) {
    specsLines.push(`• *Notas adicionales:* ${apt.notes.trim()}`);
  }

  const specsBlock =
    specsLines.length > 0
      ? `\n✂️ *Especificaciones solicitadas:*\n${specsLines.join('\n')}\n`
      : `\n✂️ *Especificaciones:* Asesoría personalizada en silla con IA.\n`;

  return [
    header,
    `Hola *${apt.clientName}*, te recordamos los detalles de tu cita agendada en *BARBER IA*:`,
    '',
    `🎫 *Código de Cita:* ${apt.id}`,
    `📅 *Fecha:* ${apt.date}`,
    `⏰ *Hora:* ${apt.time} hs`,
    `💈 *Servicio:* ${apt.packageName} (${apt.price} Bs)`,
    `👨‍🔧 *Master Barber:* ${apt.barberName}`,
    specsBlock.trimEnd(),
    '',
    `📍 *Ubicación:* Av. San Martín #450, Equipetrol, Santa Cruz de la Sierra`,
    `Por favor llega 10 minutos antes. ¡Te esperamos en BARBER IA!`,
  ].join('\n');
}

export function getWhatsAppChatUrl(phone: string, message: string): string {
  const normalized = normalizeWhatsAppNumber(phone);
  const encoded = encodeURIComponent(message);
  if (!normalized) {
    return `https://wa.me/?text=${encoded}`;
  }
  return `https://wa.me/${normalized}?text=${encoded}`;
}

export interface WhatsAppDispatchResponse {
  success: boolean;
  mode: 'cloud_api' | 'click_to_chat';
  formattedPhone: string;
  whatsappUrl: string;
  message: string;
  detail?: string;
}

export async function dispatchWhatsAppReminder(
  apt: Appointment,
  isReminder = true
): Promise<WhatsAppDispatchResponse> {
  const message = buildAppointmentReminderMessage(apt, { isReminder });
  const normalized = normalizeWhatsAppNumber(apt.clientPhone);
  const whatsappUrl = getWhatsAppChatUrl(apt.clientPhone, message);
  const formattedPhone = formatWhatsAppDisplay(apt.clientPhone);

  try {
    const resp = await fetch('/api/whatsapp/send-reminder', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        phone: normalized,
        message,
        appointmentId: apt.id,
        clientName: apt.clientName,
      }),
    });
    if (resp.ok) {
      const data = await resp.json();
      return {
        success: true,
        mode: data.mode === 'cloud_api' ? 'cloud_api' : 'click_to_chat',
        formattedPhone,
        whatsappUrl: data.whatsappUrl || whatsappUrl,
        message,
        detail: data.detail,
      };
    }
  } catch {
    // Graceful fallback to direct WhatsApp Click-to-Chat link
  }

  return {
    success: true,
    mode: 'click_to_chat',
    formattedPhone,
    whatsappUrl,
    message,
  };
}
