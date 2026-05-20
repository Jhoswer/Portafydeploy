// src/components/admin/components/Definicion/mockData.js

export const MOCK_PAISES = [
  { id_country: 1, name: "Bolivia",   state: "activate",   created_at: "2024-01-15 09:00", updated_at: "2024-03-10 14:20" },
  { id_country: 2, name: "Argentina", state: "activate",   created_at: "2024-01-15 09:05", updated_at: "2024-03-10 14:22" },
  { id_country: 3, name: "Brasil",    state: "activate",   created_at: "2024-01-16 10:00", updated_at: "2024-03-11 09:00" },
  { id_country: 4, name: "Chile",     state: "deactivate", created_at: "2024-01-17 11:00", updated_at: "2024-04-01 08:00" },
  { id_country: 5, name: "Perú",      state: "activate",   created_at: "2024-02-01 08:30", updated_at: "2024-04-05 16:00" },
  { id_country: 6, name: "Colombia",  state: "activate",   created_at: "2024-02-10 10:00", updated_at: "2024-04-10 12:00" },
];

export const MOCK_HABILIDADES = [
  { id_skill: 1, name: "React",            state: "activate",   type: "hard", quantitative_level: "Avanzado",   qualitative_level: 4, description: "Biblioteca JS para UI",        created_at: "2024-01-20", updated_at: "2024-03-15", id_area: 1 },
  { id_skill: 2, name: "Trabajo en equipo",state: "activate",   type: "soft", quantitative_level: "Intermedio", qualitative_level: 3, description: "Colaboración efectiva",        created_at: "2024-01-21", updated_at: "2024-03-15", id_area: 2 },
  { id_skill: 3, name: "Node.js",          state: "activate",   type: "hard", quantitative_level: "Avanzado",   qualitative_level: 4, description: "Entorno de ejecución JS",      created_at: "2024-01-22", updated_at: "2024-03-16", id_area: 1 },
  { id_skill: 4, name: "Comunicación",     state: "activate",   type: "soft", quantitative_level: "Básico",     qualitative_level: 2, description: "Expresión oral y escrita",     created_at: "2024-01-23", updated_at: "2024-03-17", id_area: 2 },
  { id_skill: 5, name: "PostgreSQL",       state: "deactivate", type: "hard", quantitative_level: "Intermedio", qualitative_level: 3, description: "Base de datos relacional",     created_at: "2024-02-01", updated_at: "2024-04-01", id_area: 3 },
  { id_skill: 6, name: "Liderazgo",        state: "activate",   type: "soft", quantitative_level: "Avanzado",   qualitative_level: 5, description: "Gestión y motivación de equipos", created_at: "2024-02-05", updated_at: "2024-04-05", id_area: 2 },
];

export const MOCK_ESTADOS = [
  { id_state_country: 1, id_country: 1, name: "Cochabamba",    state: "activate",   created_at: "2024-01-15", updated_at: "2024-03-10" },
  { id_state_country: 2, id_country: 1, name: "La Paz",        state: "activate",   created_at: "2024-01-15", updated_at: "2024-03-10" },
  { id_state_country: 3, id_country: 1, name: "Santa Cruz",    state: "activate",   created_at: "2024-01-15", updated_at: "2024-03-10" },
  { id_state_country: 4, id_country: 1, name: "Oruro",         state: "deactivate", created_at: "2024-01-16", updated_at: "2024-03-11" },
  { id_state_country: 5, id_country: 2, name: "Buenos Aires",  state: "activate",   created_at: "2024-01-20", updated_at: "2024-03-15" },
  { id_state_country: 6, id_country: 2, name: "Córdoba",       state: "activate",   created_at: "2024-01-20", updated_at: "2024-03-15" },
];

export const MOCK_UNIVERSIDADES = [
  { id_university: 1, name: "UMSS",  description: "Universidad Mayor de San Simón",              state: "activate",   created_at: "2024-01-15", updated_at: "2024-03-10" },
  { id_university: 2, name: "UMSA",  description: "Universidad Mayor de San Andrés",              state: "activate",   created_at: "2024-01-15", updated_at: "2024-03-10" },
  { id_university: 3, name: "UAGRM", description: "Universidad Autónoma Gabriel René Moreno",    state: "activate",   created_at: "2024-01-16", updated_at: "2024-03-11" },
  { id_university: 4, name: "UCB",   description: "Universidad Católica Boliviana",               state: "activate",   created_at: "2024-01-17", updated_at: "2024-03-12" },
  { id_university: 5, name: "UPB",   description: "Universidad Privada Boliviana",                state: "deactivate", created_at: "2024-02-01", updated_at: "2024-04-01" },
];

export const MOCK_CARRERAS = [
  { id_career: 1, name: "Ingeniería de Sistemas",      description: "Desarrollo de software y sistemas",         state: "activate",   created_at: "2024-01-15", updated_at: "2024-03-10" },
  { id_career: 2, name: "Ingeniería Civil",            description: "Diseño y construcción de infraestructura",  state: "activate",   created_at: "2024-01-15", updated_at: "2024-03-10" },
  { id_career: 3, name: "Administración de Empresas",  description: "Gestión y administración organizacional",   state: "activate",   created_at: "2024-01-16", updated_at: "2024-03-11" },
  { id_career: 4, name: "Medicina",                   description: "Ciencias médicas y salud",                  state: "activate",   created_at: "2024-01-17", updated_at: "2024-03-12" },
  { id_career: 5, name: "Derecho",                    description: "Ciencias jurídicas y legales",              state: "deactivate", created_at: "2024-02-01", updated_at: "2024-04-01" },
];

export const MOCK_COMPANIAS = [
  { id_company: 1, name: "TechBolivia S.A.", description: "Empresa de tecnología",   industry: "Tecnología",  city: "Cochabamba", id_country: 1, phone_prefix: "+591", phone: "77712345", website: "https://techbolivia.bo", state: "active",     created_at: "2024-01-15", updated_at: "2024-03-10", mission: "Innovar tecnología",      vision: "Líderes en tech" },
  { id_company: 2, name: "DataLab SRL",      description: "Análisis de datos",       industry: "Consultoría", city: "La Paz",     id_country: 1, phone_prefix: "+591", phone: "72298765", website: "https://datalab.bo",    state: "active",     created_at: "2024-01-20", updated_at: "2024-03-15", mission: "Transformar datos",       vision: "Data-driven Bolivia" },
  { id_company: 3, name: "Construye SA",     description: "Constructora nacional",   industry: "Construcción",city: "Santa Cruz", id_country: 1, phone_prefix: "+591", phone: "33456789", website: null,                    state: "inactive",   created_at: "2024-02-01", updated_at: "2024-04-01", mission: null,                      vision: null },
  { id_company: 4, name: "EduTech Bolivia",  description: "Plataforma educativa",    industry: "Educación",   city: "Cochabamba", id_country: 1, phone_prefix: "+591", phone: "44567890", website: "https://edutech.bo",    state: "active",     created_at: "2024-02-10", updated_at: "2024-04-10", mission: "Educar con tecnología",   vision: "Bolivia educada" },
  { id_company: 5, name: "FinanzasPlus",     description: "Servicios financieros",   industry: "Finanzas",    city: "La Paz",     id_country: 1, phone_prefix: "+591", phone: "22334455", website: null,                    state: "suspended",  created_at: "2024-03-01", updated_at: "2024-04-15", mission: null,                      vision: null },
];

export const MOCK_AREAS = [
  { id_area: 1, name: "Desarrollo de Software", description: "Programación y arquitectura de sistemas",       created_at: "2024-01-15", updated_at: "2024-03-10" },
  { id_area: 2, name: "Habilidades Blandas",    description: "Competencias interpersonales y comunicación",   created_at: "2024-01-15", updated_at: "2024-03-10" },
  { id_area: 3, name: "Bases de Datos",          description: "Diseño y administración de BD",                created_at: "2024-01-16", updated_at: "2024-03-11" },
  { id_area: 4, name: "Diseño UX/UI",            description: "Experiencia e interfaz de usuario",            created_at: "2024-01-17", updated_at: "2024-03-12" },
  { id_area: 5, name: "Ciberseguridad",          description: "Seguridad informática y redes",                created_at: "2024-02-01", updated_at: "2024-04-01" },
];