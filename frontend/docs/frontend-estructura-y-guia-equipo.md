# Frontend - Estructura Del Repo Y Guia De Trabajo

## Objetivo de este documento

Este documento sirve para 2 cosas:

1. Entender claramente como esta organizado hoy el repositorio frontend.
2. Darle al equipo una guia practica para seguir desarrollando sin volver a mezclar paginas, estilos, logica, servicios y datos dentro del mismo archivo.

La idea es que cualquier persona del equipo, incluso alguien junior, pueda abrir este documento, ubicar rapido una carpeta y saber:

- para que existe
- que tipo de archivos deben ir ahi
- que no deberia ponerse ahi
- como reutilizar codigo sin duplicarlo

## Seccion 1 - Estructura actual del repo

## Vision general

Hoy el repo esta organizado por responsabilidad y por dominio.

La regla principal es esta:

- `pages` = pantallas
- `components` = bloques visuales reutilizables
- `features` = logica y recursos de una feature concreta
- `services` = comunicacion con backend
- `hooks` = comportamiento reutilizable
- `styles` = estilos globales y por pagina
- `context` = estado global compartido
- `utils` = helpers genericos
- `docs` = documentacion y referencias no ejecutables

## Contrato actual con backend

Desde la actualizacion del backend y la base de datos, el frontend trabaja con una capa de compatibilidad.

- la BD usa nombres nuevos como `proveedor`, `proveedor_id`, `empresa`, `cargo`, `nivel_texto`, `nivel_numero`, `plataforma`, `url`, `nivel_formacion` y `nombre_programa`
- la API todavia expone aliases viejos para no romper la UI actual, por ejemplo `provider`, `provider_id`, `company`, `title`, `nivel_cuantitativo`, `nivel_cualitativo`, `nombre_plataforma`, `url_plataforma`, `tipo_formacion` y `nombre_carrera`

La regla para el equipo es:

- los componentes no deben depender de nombres fisicos de columnas SQL
- la traduccion entre UI y backend debe vivir en `src/services/` y `src/features/*/normalizers.js`
- si se crea una vista nueva, se consume el contrato normalizado, no la respuesta cruda del backend

## Raiz del proyecto

### `index.html`

Es el HTML base que Vite usa para montar la app React.

Aqui se inyectan algunas variables de configuracion global y se carga el entrypoint del frontend.

### `.env`

Contiene variables de entorno locales.

Ejemplos:

- URL del backend
- claves publicas de OAuth
- clave de reCAPTCHA

### `.env.example`

Es la plantilla que el equipo debe usar como referencia.

No debe tener secretos reales. Solo muestra que variables necesita el proyecto.

### `docs/`

Aqui va todo lo que no forma parte del codigo ejecutable.

Ahora mismo contiene:

- documentacion tecnica de optimizacion
- referencias viejas o materiales que no deben vivir dentro de `src`

Esto es importante: si algo no forma parte de la app en runtime, no deberia estar dentro de `src`.

## `src/`

Es la carpeta principal del codigo fuente del frontend.

### `src/main.jsx`

Es el punto de entrada de React.

Su trabajo debe ser minimo:

- cargar estilos globales
- cargar i18n
- renderizar `App`

No debe tener logica de negocio.

### `src/App.jsx`

Define las rutas principales y carga las paginas con `lazy`.

Su responsabilidad es:

- declarar rutas
- envolver providers globales
- renderizar el loader general de rutas

No debe mezclar logica de formularios, fetch ni UI compleja.

### `src/config.js`

Centraliza configuracion del frontend.

Ejemplos:

- `apiUrl`
- `backendUrl`
- claves de almacenamiento
- claves de OAuth

Si alguna parte del frontend necesita una URL base o una configuracion comun, primero debe revisarse aqui.

No se deben hardcodear URLs en las paginas.

## `src/pages/`

Ahora `pages` esta organizada por dominio.

Esto hace mucho mas facil ubicar una pantalla.

### `src/pages/auth/`

Contiene pantallas de autenticacion:

- `Login.jsx`
- `Register.jsx`
- `ForgotPassword.jsx`
- `ResetPassword.jsx`

Estas paginas deben enfocarse en:

- estado local del formulario
- validacion de UI
- invocar servicios de auth
- navegar al siguiente paso

No deben guardar tokens manualmente ni hacer `fetch` directo.

### `src/pages/dashboard/`

Contiene pantallas del area interna del usuario:

- `Dashboard.jsx`
- `Feed.jsx`
- `Forms.jsx`

Estas paginas representan vistas del producto una vez que el usuario ya esta dentro.

### `src/pages/discovery/`

Contiene pantallas orientadas a explorar o buscar:

- `Explore.jsx`
- `SearchUsers.jsx`

Esto separa mejor las vistas publicas de exploracion del dashboard interno.

### `src/pages/landing/`

Contiene la pagina de entrada principal:

- `Home.jsx`

Todo lo relacionado a la experiencia publica inicial deberia vivir aqui.

### `src/pages/profile/`

Contiene pantallas relacionadas al perfil publico o profesional:

- `CrearPerfilProfesional.jsx`

Esta pantalla ya fue modularizada para que no concentre todo dentro del mismo archivo.

### `src/pages/legacy/`

Contiene pantallas viejas o pendientes de limpieza:

- `Configuracion.jsx`

Esto sirve para aislar codigo legado y dejar claro que no es parte del flujo moderno recomendado.

Si una pantalla esta comentada, vieja o en pausa, debe vivir aqui o salir de `src` si ya no se usa.

## `src/components/`

Aqui viven los bloques visuales reutilizables.

La regla es:

- si algo se repite en varias pantallas o representa una pieza clara de UI, deberia ser un componente

### `src/components/auth/`

Contiene piezas reutilizables del flujo de autenticacion.

Ejemplos:

- `OAuthButton.jsx`
- `GoogleButton.jsx`
- `GithubButton.jsx`
- `LinkedInButton.jsx`
- `AuthBrand.jsx`
- `AuthFieldError.jsx`

Esto evita duplicar encabezados visuales, botones sociales y mensajes de error entre login, registro y recovery.

### `src/components/landing/`

Componentes de la landing y exploracion publica.

Ejemplos:

- `Navbar.jsx`
- `Hero.jsx`
- `HowItWorks.jsx`
- `Features.jsx`
- `Footer.jsx`

### `src/components/feed/`

Bloques del feed.

Ejemplos:

- `PostCard.jsx`
- `LeftSidebar.jsx`
- `RightSidebar.jsx`

### `src/components/dashboard/`

Bloques del dashboard.

Ejemplos:

- `DashboardLayout.jsx`
- `DashboardMain.jsx`
- `DashboardPortfolio.jsx`
- `DashboardProfile.jsx`

Tambien tiene subcarpetas como:

- `profile/`
- `portfolio/`

Importante:

Dentro de `components/dashboard/portfolio/` ahora quedaron principalmente componentes visuales del workspace del portafolio.

La configuracion y parte de la logica reusable de esa feature ya no vive ahi.

### `src/components/professional-profile/`

Bloques UI del perfil profesional.

Ejemplo:

- `ProfessionalProfileBlocks.jsx`

Esta carpeta existe porque el perfil profesional ya es una feature importante y merecia sus propios componentes.

### `src/components/ui/`

Componentes de UI genericos, sin acoplarse a una feature concreta.

Ejemplo:

- `button.jsx`

Aqui deben vivir piezas de UI base.

## `src/features/`

Aqui vive la logica o recursos propios de una feature.

Esto es muy importante para no meter mocks, normalizadores, config y transformaciones dentro de `pages`.

### `src/features/professional-profile/`

Contiene:

- `mockData.js`
- `normalizers.js`

Su trabajo es:

- fallback de datos
- adaptar respuesta backend a una forma util para UI
- absorber diferencias entre respuestas nuevas y legacy del backend sin ensuciar la page

### `src/features/dashboard-portfolio/`

Contiene:

- `portfolioConfig.js`
- `portfolioStyles.js`
- `portfolioWorkspaceContent.jsx`
- `portfolioWorkspaceControls.jsx`

Esta carpeta existe porque el modulo portfolio dentro del dashboard funciona casi como una mini-aplicacion dentro del dashboard.

Separarlo como `feature` ayuda a entender que no son simples componentes sueltos.

## `src/services/`

Aqui vive toda la comunicacion con backend.

### `src/services/http/`

Contiene el cliente HTTP compartido:

- `httpClient.js`

Este archivo resuelve:

- headers base
- auth token
- parseo de respuestas
- errores consistentes

### `src/services/authService.js`

Todo lo relacionado a auth y perfil base:

- login
- registro
- forgot/reset password
- perfil
- formacion

### `src/services/portfolioService.js`

Gestiona datos del portfolio del dashboard.

Responsabilidades actuales:

- transformar payloads del frontend a contratos aceptados por backend
- mapear errores de validacion del backend a nombres de campos de UI
- normalizar `overview` para dashboard y perfil
- encapsular la compatibilidad entre aliases viejos y campos nuevos

### `src/services/searchService.js`

Gestiona busqueda y resolucion de recursos relacionados.

### `src/services/sessionService.js`

Centraliza manejo de:

- token
- usuario en storage
- cierre de sesion
- actualizacion de datos persistidos

## `src/context/`

Estado global compartido.

### `auth-context.js`

Define el contexto base.

### `AuthContext.jsx`

Implementa el provider global.

### `useAuth.jsx`

Hook para consumir auth facilmente.

Regla:

- los componentes no deberian usar el contexto bruto si ya existe un hook como `useAuth`

## `src/hooks/`

Aqui van hooks reutilizables.

Ejemplos:

- `useClickOutside.js`
- `useRevealOnScroll.js`

Si una logica basada en `useEffect`, listeners o estado se repite o es reutilizable, debe evaluarse como hook.

## `src/styles/`

Aqui viven los estilos.

### `src/styles/index.css`

Punto de entrada de estilos globales.

### `src/styles/base.css`

Clases utilitarias y reglas compartidas del shell general.

### `src/styles/legacy.css`

Hoja historica grande que aun sostiene parte visual del proyecto.

Sigue funcionando, pero debe ir migrandose por capas.

### `src/styles/pages/`

Estilos por pagina o feature.

Ejemplos:

- `explore.css`
- `professional-profile.css`

Esta carpeta es la recomendada cuando una pantalla tiene mucho estilo propio.

## `src/data/`

Datos locales o mocks reutilizables por una vista.

Ejemplo:

- `posts.js`

Si son datos de una feature concreta, idealmente deben ir dentro de `features/<feature>`.
Si son datos compartidos o transversales, pueden vivir aqui.

## `src/i18n/`

Todo lo relacionado a internacionalizacion.

Ejemplos:

- configuracion general
- `locales/es`
- `locales/en`
- `locales/pt`

No se deben hardcodear textos nuevos si ya existe traduccion para esa zona del producto.

## `src/assets/`

Activos usados por la aplicacion:

- imagenes
- logos
- ilustraciones

Solo deberian estar aqui assets realmente usados por el frontend.

## `src/utils/`

Helpers pequeños y genericos.

Ejemplo:

- `authNavigation.js`

Si una funcion no depende de React ni de una feature concreta, puede vivir aqui.

## Seccion 2 - Guia para el equipo de desarrollo

## Regla madre del repo

Una `page` no debe convertirse en un archivo gigante que haga todo.

La `page` debe ser el director de orquesta, no toda la orquesta.

Eso significa:

- la `page` arma la pantalla
- llama hooks
- usa servicios
- compone componentes

Pero no deberia:

- tener 800 lineas
- guardar mocks
- tener 20 estilos inline grandes
- hacer `fetch` directo
- transformar respuestas del backend a mano en el mismo archivo

## Donde agregar cada cosa

## Si vas a crear una pantalla nueva

Debe ir en `src/pages/<dominio>/`.

Ejemplos:

- nueva pantalla de auth -> `src/pages/auth/`
- nueva pantalla de dashboard -> `src/pages/dashboard/`
- nueva pantalla publica -> `src/pages/landing/` o `src/pages/discovery/`
- nueva pantalla de perfil -> `src/pages/profile/`

## Si vas a crear un bloque reutilizable de UI

Debe ir en `src/components/<dominio>/`.

Ejemplos:

- un header reutilizable del perfil -> `src/components/professional-profile/`
- un panel del dashboard -> `src/components/dashboard/`
- un bloque comun de auth -> `src/components/auth/`

## Si vas a crear logica propia de una feature

Debe ir en `src/features/<feature>/`.

Ejemplos:

- mocks
- normalizadores
- configuracion de una feature
- adaptadores
- constantes de una feature

Esto evita ensuciar `pages` y `components`.

## Si vas a conectar con el backend

Debe ir en `src/services/`.

Reglas:

- no usar `fetch` directo en pages
- no usar `axios` directo en pages
- toda llamada pasa por `httpClient.js`

Si la llamada es de auth:

- usar o extender `authService.js`

Si es de portfolio:

- usar o extender `portfolioService.js`

Si es de busqueda:

- usar o extender `searchService.js`

## Si necesitas usar localStorage

No lo hagas directo desde la `page`.

Usa:

- `sessionService.js`

Razon:

- evita inconsistencias de nombre de keys
- evita duplicar logica
- permite cambiar estrategia despues sin tocar todas las pantallas

## Si necesitas un comportamiento reutilizable con React

Evaluar si debe ser un hook en `src/hooks/`.

Ejemplos:

- click outside
- reveal on scroll
- listeners de ventana
- sincronizacion de algo entre componentes

## Si necesitas estilos

Primero decide de que tipo son.

### Estilos globales

Si afectan toda la app o una base comun:

- `src/styles/base.css`
- `src/styles/index.css`

### Estilos de una pagina

Si pertenecen casi por completo a una pantalla:

- `src/styles/pages/<nombre>.css`

Ejemplo:

- `src/styles/pages/professional-profile.css`

### Estilos de un bloque reutilizable

Si varios componentes del mismo dominio comparten estilo, se puede crear un CSS especifico dentro de `styles` o una convencion equivalente del feature.

Importante:

- evitar objetos `style={{...}}` gigantes
- usar inline solo para casos realmente pequeños y excepcionales

## Que hacer

1. Mantener las pages cortas y enfocadas.
2. Extraer componentes cuando un bloque visual se repita o sea muy largo.
3. Extraer normalizadores y mocks a `features`.
4. Reutilizar servicios existentes antes de crear otros.
5. Reutilizar hooks existentes antes de inventar listeners nuevos.
6. Preferir una estructura por dominio antes que una carpeta con todo mezclado.
7. Documentar decisiones importantes en `docs/`.

## Que no hacer

1. No meter `fetch` en una page.
2. No guardar tokens manualmente en cada vista.
3. No dejar mocks largos dentro de una page.
4. No crear estilos gigantes inline dentro de JSX.
5. No duplicar botones, headers o validaciones si ya existe un componente reusable.
6. No poner archivos que no usa la app dentro de `src`.
7. No mezclar codigo legacy con pantallas activas sin marcarlo.

## Señales de alerta de que un archivo ya esta creciendo mal

Si pasa una o varias de estas cosas, toca dividirlo:

- supera aprox. 250-300 lineas
- tiene varios bloques visuales grandes
- tiene mas de una responsabilidad
- incluye mocks, estilos y logica de red juntos
- repite mucho codigo de otro archivo
- cuesta explicarle a otro dev “que hace” en una sola frase

## Patron recomendado para una feature grande

Ejemplo ideal:

```text
src/
  pages/
    profile/
      CrearAlgo.jsx
  components/
    algo/
      AlgoHeader.jsx
      AlgoCard.jsx
      AlgoModal.jsx
  features/
    algo/
      mockData.js
      normalizers.js
      constants.js
  services/
    algoService.js
  styles/
    pages/
      algo.css
```

Con eso:

- la `page` queda liviana
- la UI se reutiliza
- la logica de transformacion no contamina el JSX
- los estilos estan localizados

## Como reutilizar correctamente

## Reutilizar funciones

Si una funcion:

- transforma datos
- formatea respuestas
- adapta datos del backend

entonces normalmente debe vivir en:

- `features/<feature>/`
- o `utils/` si es muy generica

## Reutilizar servicios

Antes de crear `nuevoService.js`, revisar:

- si la llamada pertenece a un servicio existente
- si ya hay una funcion parecida
- si conviene extender una funcion actual

## Reutilizar estilos

No copiar y pegar 20 clases o 20 estilos inline entre componentes.

Si un patron visual aparece varias veces:

- moverlo a CSS del dominio
- o crear un componente reusable

## Reutilizar componentes

Preguntas utiles:

- este bloque aparece en mas de una pantalla
- este bloque tiene logica visual propia
- este bloque tiene su propia semantica de UI

Si la respuesta es si, probablemente deberia ser componente.

## Flujo recomendado para un nuevo desarrollo

1. Ubicar el dominio correcto.
2. Crear o reutilizar el servicio.
3. Crear normalizadores si backend y UI no hablan igual.
4. Crear componentes reutilizables del dominio.
5. Crear la page usando esos bloques.
6. Agregar estilos en `styles/pages` o donde corresponda.
7. Validar con `lint` y `build`.
8. Documentar si el cambio abre una nueva convencion.

## Estado actual recomendado para el equipo

Hoy el repo ya tiene una base mucho mas sana que antes.

La recomendacion es continuar con el mismo criterio que ya se aplico en:

- auth
- profile profesional
- reorganizacion de pages
- separacion de portfolio como feature

Los siguientes candidatos naturales para seguir ordenando son:

- dashboard
- feed
- mas componentes con muchos `style={{...}}`
- migracion gradual de `legacy.css`

## Resumen corto para juniors

Si dudas donde poner algo, usa esta tabla mental:

- pantalla completa -> `pages`
- pieza visual reusable -> `components`
- logica de una feature -> `features`
- llamada al backend -> `services`
- comportamiento reusable con React -> `hooks`
- estilo global o de pagina -> `styles`
- helper generico -> `utils`
- documentacion o material no ejecutable -> `docs`

Si aun asi no estas seguro, la mejor decision suele ser:

- no meterlo en la `page`
- no meterlo en `src` si no se ejecuta
- no duplicarlo si ya existe algo parecido
