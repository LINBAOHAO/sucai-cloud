export const productCategories = [
  { id: "hardware-tools", icon: "Wrench", color: "from-orange-500 to-amber-500" },
  { id: "electrical", icon: "Zap", color: "from-yellow-500 to-orange-500" },
  { id: "safety", icon: "HardHat", color: "from-blue-500 to-cyan-500" },
  { id: "pipes", icon: "Cylinder", color: "from-emerald-500 to-teal-500" },
  { id: "valves", icon: "Settings2", color: "from-purple-500 to-violet-500" },
  { id: "bearings", icon: "CircleDot", color: "from-slate-400 to-slate-600" },
  { id: "consumables", icon: "Boxes", color: "from-rose-500 to-orange-500" },
  { id: "logistics", icon: "Warehouse", color: "from-indigo-500 to-blue-500" },
] as const;

export const hotProducts = [
  { id: "1", category: "hardware-tools" },
  { id: "2", category: "electrical" },
  { id: "3", category: "safety" },
  { id: "4", category: "hardware-tools" },
  { id: "5", category: "electrical" },
  { id: "6", category: "valves" },
  { id: "7", category: "bearings" },
  { id: "8", category: "consumables" },
] as const;

export const brands = [
  { id: "bosch", logo: "BOSCH" },
  { id: "3m", logo: "3M" },
  { id: "skf", logo: "SKF" },
  { id: "stanley", logo: "STANLEY" },
  { id: "dewalt", logo: "DEWALT" },
  { id: "honeywell", logo: "HONEYWELL" },
  { id: "siemens", logo: "SIEMENS" },
  { id: "makita", logo: "MAKITA" },
] as const;

export const testimonials = [
  { id: "1", avatar: "PT", rating: 5 },
  { id: "2", avatar: "CV", rating: 5 },
  { id: "3", avatar: "UD", rating: 5 },
  { id: "4", avatar: "TB", rating: 4 },
] as const;

export const searchTags = [
  "angleGrinder",
  "generator",
  "safetySupplies",
  "cable",
  "valve",
  "bearing",
] as const;
