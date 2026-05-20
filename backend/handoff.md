# Handoff

## goal
Construir el gestor de notificaciones para la app: lectura de notificaciones, conteo de no leídas, marcado como leído, preferencias de notificación y gestión de tokens push.

## current state
- Ya existe un servicio `app/Services/NotificationService.php` con la lógica básica para:
  - listar notificaciones paginadas para el usuario
  - contar notificaciones no leídas
  - marcar una notificación como leída
  - marcar todas como leídas
  - obtener y guardar preferencias de notificación
  - crear notificaciones de actividad (`createActivity`)
- Ya existe un controlador `app/Http/Controllers/NotificationController.php` con rutas API expuestas en `routes/api.php`.
- `FeedController.php` ya inyecta `NotificationService` y lo usa para crear notificaciones de actividad en algunos flujos.
- En la base de datos ya están definidas las tablas principales del dominio de notificaciones y usuarios, incluyendo `USER`, `USER_ROLE`, `REACTION`, `COMMENT`, `REPORT`, `OFFER`, `OFFER_DETAIL`, `POSTULATION`, `ROLE`.
- En Neon se crearon las tablas de notificaciones:
  - `NOTIFICATION`
  - `NOTIFICATION_SETTINGS`
- Se definieron índices en `NOTIFICATION` para `id_receiver`, `is_read` y `created_at DESC`.

## files in flight
- `app/Http/Controllers/FeedController.php`
- `app/Services/NotificationService.php`
- `app/Http/Controllers/NotificationController.php`
- `routes/api.php`
- posibles modelos relacionados: `app/Models/UserNotification.php`, `app/Models/NotificationPreference.php`

## changed
- No he realizado cambios de código en esta sesión; el handoff recoge el estado actual del trabajo.

## failed attempts
- No se registran intentos fallidos en esta sesión. Solo se hizo inspección del estado actual y revisión de rutas/servicios.

## next step
1. Validar que los modelos `UserNotification` y `NotificationPreference` existen y mappean correctamente las tablas `NOTIFICATION` y `NOTIFICATION_SETTINGS`.
2. Revisar si la tabla `PUSH_TOKEN` existe o se debe crear para completar `storePushToken`.
3. Probar las rutas de notificaciones con un usuario autenticado (`/api/notifications`, `/api/notifications/unread-count`, `/api/notifications/{id}/read`, `/api/notification-preferences`).
4. Implementar el flujo de creación de notificaciones en los eventos del feed y en otros casos de uso (likes, comentarios, nuevos seguidores, ofertas, etc.) según la HU de gestor de notificaciones.
5. Ajustar los nombres de columnas en DB si se usa la convención Laravel estándar o si hay conflictos con mayúsculas y comillas en PostgreSQL/Neon.
