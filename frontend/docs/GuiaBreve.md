# Frontend `frontend-tis`

Frontend principal de PortaFy construido con `React 19 + Vite`.

## Arranque rapido

```bash
npm install
npm run dev
```

Variables locales principales en `.env`:

- `VITE_API_URL`
- `VITE_BACKEND_URL`
- `VITE_GOOGLE_CLIENT_ID`
- `VITE_LINKEDIN_CLIENT_ID`
- `VITE_GITHUB_CLIENT_ID`
- `VITE_RECAPTCHA_SITE_KEY`

## Estructura que debe respetar el equipo

- `src/pages/`: pantallas completas por dominio.
  Aqui va una vista entera como `auth`, `dashboard`, `profile`, `landing`.
- `src/components/`: bloques visuales reutilizables.
  Si un bloque aparece en varias pantallas o tiene UI propia, va aqui.
- `src/features/`: logica y recursos propios de una feature.
  Normalizadores, config de una feature, constantes, piezas del workspace.
- `src/services/`: comunicacion con backend.
  No hacer `fetch` directo en pages o components.
- `src/context/`: estado global compartido.
  Auth y sincronizacion global van aqui.
- `src/hooks/`: comportamiento reutilizable con React.
- `src/utils/`: helpers puros, sin UI.
- `src/i18n/`: traducciones.
- `src/styles/`: estilos globales y por pagina.
- `docs/`: decisiones y referencias internas, no codigo ejecutable.

## Que tocar segun el cambio

- Nueva pantalla: `src/pages/<dominio>/`
- Nuevo bloque reutilizable: `src/components/<dominio>/`
- Nueva llamada al backend: `src/services/`
- Nueva transformacion de datos: `src/features/<feature>/` o `src/utils/`
- Nuevo estado global: `src/context/`
- Nuevo hook reusable: `src/hooks/`
- Nuevos textos: `src/i18n/locales/`
- Estilos de una pagina: `src/styles/pages/`

## Reglas practicas

- La `page` coordina, no hace todo.
- No guardar tokens ni tocar `localStorage` directo desde pantallas.
  Usar `src/services/sessionService.js`.
- No hardcodear URLs.
  Usar `src/config.js`.
- Si una UI social/auth ya existe, extenderla antes de duplicarla.
- Si el cambio es de auth, revisar primero:
  `src/pages/auth/`, `src/components/auth/`, `src/context/AuthContext.jsx`, `src/services/authService.js`
- Si el cambio es de portfolio/dashboard, revisar primero:
  `src/features/dashboard-portfolio/`, `src/components/dashboard/`, `src/services/portfolioService.js`

## Flujo recomendado para agregar algo nuevo

1. Ubicar el dominio correcto.
2. Crear o extender el service.
3. Normalizar datos si backend y UI no hablan igual.
4. Extraer componente reusable si el bloque crece.
5. Agregar textos a `i18n` si aplica.
6. Correr `npm run lint`.

## Archivos clave

- `src/App.jsx`: rutas principales
- `src/config.js`: config centralizada
- `src/context/AuthContext.jsx`: sesion global
- `src/services/http/httpClient.js`: cliente HTTP comun
- `src/services/authService.js`: auth, perfil base y onboarding

## Documentacion interna

- [docs/frontend-estructura-y-guia-equipo.md](docs/frontend-estructura-y-guia-equipo.md)
- [docs/frontend-optimizacion-stark-level.md](docs/frontend-optimizacion-stark-level.md)
