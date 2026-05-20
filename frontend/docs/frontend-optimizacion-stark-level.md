# Frontend - Optimizacion Stark Level

## Resumen ejecutivo

Esta rama reorganiza el frontend para que tenga una base mas escalable, consistente y mantenible sin romper el flujo principal del producto. El objetivo no fue rehacer toda la UI, sino dejar una columna vertebral solida para que el equipo pueda seguir desarrollando sin mezclar paginas, auth, estilos, red y almacenamiento.

## Actualizacion de compatibilidad frontend-backend

Despues de la optimizacion del backend y la nueva base de datos, se reviso el frontend contra el contrato real de la API.

Cambios confirmados:

- `src/services/portfolioService.js` ahora reconoce mejor campos nuevos del backend como `empresa`, `cargo`, `nivel_texto`, `nivel_numero`, `plataforma`, `url` y `cv_url`
- el mapeo de errores de validacion ya contempla nombres nuevos y legacy para no romper formularios actuales
- `src/features/professional-profile/normalizers.js` ahora acepta estructuras nuevas como `profile`, `projects`, `skills` y `socials.links`, ademas de claves legacy
- el frontend sigue funcionando sin acoplarse directamente a nombres fisicos de tablas o columnas

## Objetivos cumplidos

- Centralizar la comunicacion con backend.
- Eliminar URLs hardcodeadas en las pantallas principales.
- Unificar la sesion y el manejo de autenticacion.
- Reducir carga inicial del bundle con rutas lazy.
- Separar la entrada global de estilos hacia una carpeta `styles`.
- Reutilizar la autenticacion social en vez de duplicarla.
- Documentar una estructura de trabajo clara para el equipo.
- Alinear el frontend con el backend actualizado sin romper la UI actual.

## Cambios aplicados

### 0. Segunda pasada de modularizacion

Despues de la primera optimizacion se aplico una segunda pasada centrada en aligerar `.jsx` grandes y sacar estilos/logica repetida fuera de las paginas.

Resultados concretos:

- `src/pages/CrearPerfilProfesional.jsx` paso de 1280 lineas a 170 lineas.
- se extrajeron mocks, normalizadores, bloques reutilizables y CSS de la pagina de perfil profesional.
- se extrajeron piezas repetidas de auth como `AuthBrand` y `AuthFieldError`.
- se agrego un hook reutilizable `useRevealOnScroll`.

### 1. Configuracion y entorno

Se fortalecio la configuracion central en `src/config.js` para resolver:

- `apiUrl`
- `backendUrl`
- claves de OAuth
- `recaptchaSiteKey`
- nombres de claves de almacenamiento

Tambien se actualizo `index.html` para inyectar `backendUrl` en `window.__APP_CONFIG__`, y se agrego `.env.example` para que el equipo tenga una referencia limpia de variables esperadas.

### 2. Cliente HTTP compartido

Se creo `src/services/http/httpClient.js` como capa unica de red.

Beneficios:

- headers consistentes
- token compartido
- serializacion uniforme de JSON y `FormData`
- errores con `status`, `data` y `validationErrors`
- menos `fetch` sueltos dentro de paginas

Esto reduce mucho el acoplamiento entre UI y backend.

### 3. Sesion y autenticacion unificadas

Se creo `src/services/sessionService.js` para centralizar:

- lectura de usuario
- persistencia de token
- compatibilidad con `token` y `AUTH_TOKEN`
- cierre de sesion
- marcado de perfil completado
- actualizacion de usuario almacenado

`src/context/AuthContext.jsx` ahora delega en servicios y ya no repite logica de `localStorage` en varias pantallas.

Ademas se extrajo `src/context/useAuth.jsx` y `src/context/auth-context.js` para mantener compatibilidad con Fast Refresh y pasar `eslint`.

### 4. Auth social reutilizable

Se creo `src/components/auth/OAuthButton.jsx` y se simplificaron:

- `src/components/auth/GoogleButton.jsx`
- `src/components/auth/GithubButton.jsx`
- `src/components/auth/LinkedInButton.jsx`

Antes habia tres componentes casi iguales y `Login.jsx` ademas tenia una implementacion aparte para Google. Ahora los tres proveedores usan la misma base, el mismo popup flow y el mismo manejo de estado.

### 5. Servicios por dominio

Se reescribio `src/services/authService.js` para que use el cliente HTTP compartido y concentre:

- login
- registro
- forgot password
- reset password
- completar perfil
- actualizar perfil
- obtener perfil
- obtener overview del perfil
- formacion academica

Tambien se creo `src/services/searchService.js` para concentrar la busqueda y la resolucion de fotos de usuario.

`src/services/portfolioService.js` fue adaptado para apoyarse en la capa HTTP compartida en vez de volver a implementar request/headers/token.

Ajustes recientes en `portfolioService.js`:

- normalizacion de skills con `nivel_texto` y `nivel_numero`
- normalizacion de experiencia con `empresa`, `cargo` y `actualmente`
- normalizacion de sociales con `plataforma` y `url`
- mapeo de errores de backend nuevo hacia nombres de campos de UI

### 6. Rutas lazy y mejor carga inicial

`src/App.jsx` ahora carga paginas de manera diferida con `lazy` + `Suspense`.

Impacto:

- mejor escalabilidad de rutas
- menor costo inicial de carga
- arquitectura mas preparada para crecer
- `build` ya demuestra chunks separados por pagina

### 7. Migracion de pantallas clave

Se migraron pantallas importantes a la nueva base:

- `src/pages/Login.jsx`
- `src/pages/Register.jsx`
- `src/pages/ForgotPassword.jsx`
- `src/pages/ResetPassword.jsx`
- `src/pages/Forms.jsx`
- `src/pages/Explore.jsx`
- `src/pages/CrearPerfilProfesional.jsx`

Mejoras aplicadas:

- ya no usan URLs hardcodeadas
- ya no hacen `fetch` directo para los casos principales
- navegan usando una utilidad comun de post-auth
- se apoyan en sesion centralizada
- `Explore.jsx` usa servicio compartido de busqueda
- `Forms.jsx` actualiza el estado del usuario desde `AuthContext`

### 8. Navbar y componentes transversales

Se creo `src/hooks/useClickOutside.js` y se aplico en `Navbar` para evitar duplicacion de listeners de cierre en menus.

Tambien se mejoro el sanitizado del input de busqueda para permitir letras unicode, no solo ASCII plano. Eso evita romper nombres con acentos.

### 9. Estilos

Se creo una entrada nueva en `src/styles/index.css` y `src/styles/base.css`.

Tambien se copio la hoja historica a `src/styles/legacy.css`.

Estado actual:

- `src/main.jsx` ya consume `src/styles/index.css`
- existe una carpeta global de estilos
- la base historica sigue funcionando
- el equipo ya puede migrar por capas sin tocar todo de golpe

Esto fue intencional: primero ordenamos la puerta de entrada y luego permitimos una migracion gradual del CSS enorme.

### 10. Perfil profesional modular

La pantalla de perfil profesional ahora sigue un patron por feature:

- `src/pages/CrearPerfilProfesional.jsx` solo orquesta estado y composicion.
- `src/components/professional-profile/ProfessionalProfileBlocks.jsx` contiene bloques reutilizables de UI.
- `src/features/professional-profile/mockData.js` contiene datos mock separados.
- `src/features/professional-profile/normalizers.js` concentra adaptacion de datos backend -> UI.
- `src/styles/pages/professional-profile.css` contiene los estilos de la pantalla.
- `src/hooks/useRevealOnScroll.js` deja la animacion reusable para otras vistas.

Este es el patron recomendado para las pantallas grandes nuevas.

Ajuste reciente en `normalizers.js`:

- el perfil profesional ahora acepta `profile`, `projects`, `skills`, `socials.links` y tambien claves legacy para evitar dependencia de una unica respuesta

### 11. Auth mas liviano y reutilizable

Se extrajeron piezas repetidas hacia:

- `src/components/auth/AuthBrand.jsx`
- `src/components/auth/AuthFieldError.jsx`

Con esto login, register, forgot y reset quedan mas limpios y con menos duplicacion visual.

## Estructura resultante

```text
src/
  components/
    auth/
      AuthBrand.jsx
      AuthFieldError.jsx
      OAuthButton.jsx
      GoogleButton.jsx
      GithubButton.jsx
      LinkedInButton.jsx
    professional-profile/
      ProfessionalProfileBlocks.jsx
  context/
    auth-context.js
    AuthContext.jsx
    useAuth.jsx
  hooks/
    useClickOutside.js
    useRevealOnScroll.js
  features/
    professional-profile/
      mockData.js
      normalizers.js
  services/
    authService.js
    portfolioService.js
    searchService.js
    sessionService.js
    http/
      httpClient.js
  styles/
    base.css
    index.css
    legacy.css
    pages/
      professional-profile.css
  utils/
    authNavigation.js
```

## Verificacion realizada

- `npm run lint` -> OK
- `npm run build` -> OK

La validacion de build tuvo que ejecutarse fuera del sandbox por una restriccion del entorno con Tailwind/Vite en Windows, pero el build final compilo correctamente.

## Beneficios obtenidos

### Rendimiento

- menor carga inicial por lazy loading de rutas
- menos logica repetida al iniciar sesion y buscar datos
- menos roundtrips conceptuales en auth porque toda la capa ya habla igual con backend

### Orden

- responsabilidades mejor separadas
- paginas menos acopladas a `fetch`, `localStorage` y `.env`
- servicios reutilizables por dominio

### Escalabilidad

- nueva base lista para sumar mas features sin seguir congestionando pages
- auth social extensible
- cliente HTTP preparado para mas modulos
- estilos con punto de entrada centralizado

## Recomendaciones para el equipo

### Reglas de trabajo recomendadas

1. Ninguna pagina debe llamar `fetch` ni `axios` directamente.
2. Ninguna pagina debe leer o escribir `localStorage` directamente.
3. Todo endpoint nuevo debe pasar por `src/services/http/httpClient.js`.
4. La logica de sesion debe pasar por `src/services/sessionService.js`.
5. Las redirecciones post-login deben usar `src/utils/authNavigation.js`.
6. Los estilos nuevos deben entrar desde `src/styles/` o desde CSS especifico por feature, no volver a un archivo gigante en raiz.
7. Los componentes sociales OAuth nuevos deben extender `OAuthButton.jsx`, no duplicarse.
8. Si una pagina supera aprox. 250-300 lineas, se debe evaluar dividirla por feature.
9. Ningun mock, transformacion de datos o mapper de backend debe quedar incrustado dentro de una page.
10. Los estilos no deben vivir en objetos inline grandes dentro de componentes; si son reutilizables o largos, van a `src/styles/` o a una capa `styles` del feature.
11. Los componentes de UI repetidos no deben reescribirse en cada page; se extraen a `src/components/<feature>` o `src/components/common`.

### Convencion sugerida para nuevos modulos

Para cada feature nueva:

- pagina en `src/pages`
- componentes de UI en `src/components/<feature>`
- transformadores, mocks o adapters en `src/features/<feature>`
- servicio en `src/services/<feature>Service.js`
- utilidades en `src/utils`
- hook compartido en `src/hooks` si aplica
- estilos en `src/styles/<feature>.css` o modulo equivalente si el equipo migra luego a CSS modules

### Regla practica para decidir donde poner cada cosa

- `Page`: solo orquesta estado, hooks, servicios y composicion visual.
- `components/<feature>`: piezas visuales reutilizables de esa pantalla o dominio.
- `features/<feature>`: mocks, adapters, normalizers, constants y logica de presentacion del feature.
- `services`: comunicacion con backend o integraciones externas.
- `hooks`: comportamiento reutilizable entre varias pantallas.
- `styles/pages`: estilos propios de una pagina grande.
- `styles/components`: estilos de bloques reutilizables cuando aparezcan varias veces.
- `utils`: helpers genericos no atados a un feature puntual.

## Deuda tecnica que sigue abierta

Esta rama mejora mucho la base, pero todavia quedan puntos que conviene atacar en una siguiente fase:

1. `src/styles/legacy.css` sigue siendo grande y monolitico.
2. `Dashboard` todavia produce chunks pesados y puede beneficiarse de mas division interna.
3. Existe codigo comentado o legacy como `src/pages/Configuracion.jsx` que deberia limpiarse o reactivarse correctamente.
4. Parte del texto del proyecto todavia arrastra problemas de encoding historicos.
5. Aun hay otros componentes con muchos `style={{...}}`, sobre todo en dashboard y feed, que conviene migrar por etapas usando el mismo patron aplicado en perfil profesional.

## Siguiente fase recomendada

### Fase 2 frontend

- dividir `legacy.css` por layout, auth, landing y dashboard
- migrar componentes con muchos estilos inline en dashboard y feed hacia `styles/pages` o `styles/components`
- mover formularios complejos a componentes por seccion
- crear servicios especificos de perfil, dashboard y feed
- introducir tests de componentes y servicios criticos
- revisar `Dashboard` para dividir chunks y vistas internas

## Archivos clave para el equipo

- `src/config.js`
- `src/services/http/httpClient.js`
- `src/services/sessionService.js`
- `src/services/authService.js`
- `src/components/auth/OAuthButton.jsx`
- `src/context/AuthContext.jsx`
- `src/context/useAuth.jsx`
- `src/styles/index.css`
- `src/styles/legacy.css`
- `src/styles/pages/professional-profile.css`
- `src/features/professional-profile/normalizers.js`
- `src/components/professional-profile/ProfessionalProfileBlocks.jsx`

## Criterio de compatibilidad aplicado

Todos los cambios se hicieron priorizando mantener la logica existente y reducir riesgo:

- se conservaron rutas y pantallas
- se mantuvo compatibilidad con claves antiguas de token
- no se rehizo la UI de negocio
- se migraron primero puntos de alto impacto y alta duplicacion

La rama queda lista para que el equipo continue sobre una base mas ordenada y mucho menos fragil.
