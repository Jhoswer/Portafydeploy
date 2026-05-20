/* ============================================================
   src/components/recruiter/forms/constants.js
   ============================================================ */

export const RUBROS = [
  "Tecnología", "Salud", "Finanzas", "Educación", "Comercio",
  "Manufactura", "Construcción", "Logística", "Marketing", "Legal",
  "Recursos Humanos", "Consultoría", "Energía", "Agro", "Turismo", "Medios",
];

export const STEPS = [
  { label: "Identidad" },
  { label: "Branding"  },
  { label: "Empresa"   },
  { label: "Contacto"  },
];

export const MAX_LOGO_BYTES = 5 * 1024 * 1024;

export const PREFIJOS = [
  { flag: "🇧🇴", code: "+591", label: "Bolivia"    },
  { flag: "🇦🇷", code: "+54",  label: "Argentina"  },
  { flag: "🇨🇱", code: "+56",  label: "Chile"      },
  { flag: "🇨🇴", code: "+57",  label: "Colombia"   },
  { flag: "🇵🇪", code: "+51",  label: "Perú"       },
  { flag: "🇧🇷", code: "+55",  label: "Brasil"     },
  { flag: "🇲🇽", code: "+52",  label: "México"     },
  { flag: "🇪🇸", code: "+34",  label: "España"     },
  { flag: "🇺🇸", code: "+1",   label: "EE.UU."     },
];

/* ── Países con sus ciudades principales ─────────────────── */
export const PAISES_CIUDADES = {
  "Argentina":       ["Buenos Aires", "Córdoba", "Rosario", "Mendoza", "La Plata", "San Miguel de Tucumán", "Mar del Plata", "Salta", "Santa Fe", "San Juan"],
  "Bolivia":         ["La Paz", "Cochabamba", "Santa Cruz de la Sierra", "Oruro", "Potosí", "Sucre", "Tarija", "Trinidad", "Cobija", "Riberalta"],
  "Brasil":          ["São Paulo", "Río de Janeiro", "Brasilia", "Salvador", "Fortaleza", "Belo Horizonte", "Manaus", "Curitiba", "Recife", "Porto Alegre"],
  "Chile":           ["Santiago", "Valparaíso", "Concepción", "La Serena", "Antofagasta", "Temuco", "Rancagua", "Talca", "Arica", "Puerto Montt"],
  "Colombia":        ["Bogotá", "Medellín", "Cali", "Barranquilla", "Cartagena", "Cúcuta", "Bucaramanga", "Pereira", "Santa Marta", "Manizales"],
  "Ecuador":         ["Quito", "Guayaquil", "Cuenca", "Santo Domingo", "Machala", "Durán", "Manta", "Portoviejo", "Loja", "Ambato"],
  "México":          ["Ciudad de México", "Guadalajara", "Monterrey", "Puebla", "Tijuana", "León", "Juárez", "Zapopan", "Mérida", "San Luis Potosí"],
  "Paraguay":        ["Asunción", "Ciudad del Este", "San Lorenzo", "Luque", "Capiatá", "Lambaré", "Fernando de la Mora", "Limpio", "Ñemby", "Encarnación"],
  "Perú":            ["Lima", "Arequipa", "Trujillo", "Chiclayo", "Piura", "Iquitos", "Cusco", "Chimbote", "Huancayo", "Tacna"],
  "Uruguay":         ["Montevideo", "Salto", "Paysandú", "Las Piedras", "Rivera", "Maldonado", "Tacuarembó", "Melo", "Mercedes", "Artigas"],
  "Venezuela":       ["Caracas", "Maracaibo", "Valencia", "Barquisimeto", "Maracay", "Ciudad Guayana", "Barcelona", "Maturín", "San Cristóbal", "Cumaná"],
  "España":          ["Madrid", "Barcelona", "Valencia", "Sevilla", "Zaragoza", "Málaga", "Murcia", "Palma", "Las Palmas", "Bilbao"],
  "Estados Unidos":  ["Nueva York", "Los Ángeles", "Chicago", "Houston", "Phoenix", "Filadelfia", "San Antonio", "San Diego", "Dallas", "San José"],
};

/* Lista de países para el selector */
export const PAISES = Object.keys(PAISES_CIUDADES);