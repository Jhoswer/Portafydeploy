export const LATIN_AMERICA_LOCATIONS = [
  {
    country: "Argentina",
    cities: ["Buenos Aires", "Cordoba", "Rosario", "Mendoza", "La Plata", "Mar del Plata", "San Miguel de Tucuman", "Salta", "Santa Fe", "Neuquen"],
  },
  {
    country: "Bolivia",
    cities: ["Cochabamba", "La Paz", "Santa Cruz", "Sucre", "Oruro", "Potosi", "Tarija","Chuquisaca", "Beni", "Pando"],
  },
  {
    country: "Brasil",
    cities: ["Sao Paulo", "Rio de Janeiro", "Brasilia", "Belo Horizonte", "Curitiba", "Porto Alegre", "Salvador", "Fortaleza", "Recife", "Manaus"],
  },
  {
    country: "Chile",
    cities: ["Santiago", "Valparaiso", "Concepcion", "La Serena", "Antofagasta", "Vina del Mar", "Temuco", "Rancagua", "Iquique", "Puerto Montt"],
  },
  {
    country: "Colombia",
    cities: ["Bogota", "Medellin", "Cali", "Barranquilla", "Cartagena", "Bucaramanga", "Pereira", "Manizales", "Santa Marta", "Ibague"],
  },
  {
    country: "Costa Rica",
    cities: ["San Jose", "Alajuela", "Cartago", "Heredia", "Liberia", "Puntarenas", "Limon", "Perez Zeledon"],
  },
  {
    country: "Cuba",
    cities: ["La Habana", "Santiago de Cuba", "Camaguey", "Holguin", "Santa Clara", "Guantanamo", "Cienfuegos", "Matanzas"],
  },
  {
    country: "Ecuador",
    cities: ["Quito", "Guayaquil", "Cuenca", "Ambato", "Manta", "Loja", "Machala", "Riobamba", "Esmeraldas", "Ibarra"],
  },
  {
    country: "El Salvador",
    cities: ["San Salvador", "Santa Ana", "San Miguel", "Soyapango", "Mejicanos", "Santa Tecla", "Apopa", "Sonsonate"],
  },
  {
    country: "Guatemala",
    cities: ["Ciudad de Guatemala", "Quetzaltenango", "Escuintla", "Mixco", "Villa Nueva", "Antigua Guatemala", "Cobán", "Huehuetenango"],
  },
  {
    country: "Honduras",
    cities: ["Tegucigalpa", "San Pedro Sula", "La Ceiba", "Choloma", "Comayagua", "El Progreso", "Choluteca", "Danli"],
  },
  {
    country: "Mexico",
    cities: ["Ciudad de Mexico", "Guadalajara", "Monterrey", "Puebla", "Merida", "Tijuana", "Leon", "Queretaro", "Cancun", "Toluca"],
  },
  {
    country: "Nicaragua",
    cities: ["Managua", "Leon", "Masaya", "Matagalpa", "Chinandega", "Granada", "Esteli", "Jinotega"],
  },
  {
    country: "Panama",
    cities: ["Ciudad de Panama", "San Miguelito", "David", "Colon", "La Chorrera", "Santiago", "Chitre", "Penonome"],
  },
  {
    country: "Paraguay",
    cities: ["Asuncion", "Ciudad del Este", "San Lorenzo", "Luque", "Encarnacion", "Capiata", "Fernando de la Mora", "Lambare"],
  },
  {
    country: "Peru",
    cities: ["Lima", "Arequipa", "Cusco", "Trujillo", "Piura", "Chiclayo", "Iquitos", "Huancayo", "Tacna", "Pucallpa"],
  },
  {
    country: "Republica Dominicana",
    cities: ["Santo Domingo", "Santiago de los Caballeros", "La Romana", "San Pedro de Macoris", "San Cristobal", "Puerto Plata", "Higuey", "La Vega"],
  },
  {
    country: "Uruguay",
    cities: ["Montevideo", "Salto", "Paysandu", "Maldonado", "Rivera", "Las Piedras", "Tacuarembo", "Melo"],
  },
  {
    country: "Venezuela",
    cities: ["Caracas", "Maracaibo", "Valencia", "Barquisimeto", "Maracay", "Ciudad Guayana", "San Cristobal", "Maturin", "Merida", "Puerto La Cruz"],
  },
];

export function getCitiesForCountry(country) {
  return LATIN_AMERICA_LOCATIONS.find((item) => item.country === country)?.cities || [];
}
