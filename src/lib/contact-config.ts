export function whatsappPhoneDigits(phone: string): string {
  return phone.replace(/\D/g, "");
}

export function getWhatsAppUrl(phone: string, message?: string): string {
  const digits = whatsappPhoneDigits(phone);
  const base = `https://wa.me/${digits || "622112345678"}`;
  if (!message) return base;
  return `${base}?text=${encodeURIComponent(message)}`;
}

/** @deprecated Use getWhatsAppUrl with settings.whatsapp */
export const contactConfig = {
  whatsapp: {
    phone: "622112345678",
    getUrl: (message?: string) => getWhatsAppUrl("622112345678", message),
  },
} as const;
