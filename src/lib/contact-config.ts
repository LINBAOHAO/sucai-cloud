export const contactConfig = {
  whatsapp: {
    phone: "622112345678",
    getUrl: (message?: string) => {
      const base = `https://wa.me/${contactConfig.whatsapp.phone}`;
      if (!message) return base;
      return `${base}?text=${encodeURIComponent(message)}`;
    },
  },
} as const;
