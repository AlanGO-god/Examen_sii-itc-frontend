# SII ITC — Frontend

Portal del estudiante en Vue 3 + Vite, que consume el backend de este
proyecto para mostrar perfil, calificaciones, kardex y horario del SII ITC,
con un sistema de notificaciones de cambios y un módulo de **mentorías**
entre estudiantes.

Repositorio del backend: <LINK-A-TU-REPO-BACKEND>

## ¿Por qué Vue 3 + Vite?

La aplicación es una SPA con pocas vistas y un estado simple (el estado de la
sesión + los datos que trae cada vista). Vite da arranque casi instantáneo
con recarga en caliente, y la Composition API de Vue 3 (`<script setup>`)
mantiene la lógica de cada vista corta y legible sin necesitar SSR/SSG — por
eso se descartó Nuxt, que habría sido peso extra sin beneficio real aquí.

## Estructura

```
src/
  assets/       estilos globales (tokens de color, tipografía)
  components/   AppLayout (navegación), NotificationBell, iconos
  router/       rutas y guard de autenticación
  store/        estado de sesión (Pinia)
  services/     cliente HTTP (axios con cookies) y temporizador de sesión
  views/        Login, Dashboard, Calificaciones, Kardex, Horario, Mentorías
vercel.json     reescritura a index.html (necesaria para el router en modo history)
```

## Sesión

El frontend **nunca ve el token**: al iniciar sesión, el backend deja una
cookie `httpOnly` y el cliente axios la envía sola (`withCredentials: true`).
El estado de la sesión se consulta en `GET /api/session`, que también indica
cuánto le queda; el frontend programa el cierre automático para ese momento.
Cualquier respuesta `401` regresa al usuario al login.

## Diseño visual

El sistema visual está inspirado en el propio concepto de "kardex": cada
vista se trata como una ficha de un expediente académico, con una barra
lateral de pestañas estilo folder, tipografía serif para prosa y monoespaciada
para datos tabulares (calificaciones, horarios, claves), y un solo color de
acento (guinda) reservado para alertas y estados — nunca decorativo.

## Instalación y ejecución

```bash
npm install
cp .env.example .env
npm run dev
```

Corre en `http://localhost:5173`. Necesita el backend corriendo en paralelo
(ver su propio README) — la URL se configura en `.env`:

```
VITE_API_BASE_URL=http://localhost:4000/api
```

## Funcionalidad extra: notificaciones

La campanita en la barra lateral permite revisar manualmente cambios en
calificaciones/horario, o activar un monitoreo automático. También avisa de
las novedades de tus mentorías (solicitudes nuevas, aceptadas, rechazadas o
canceladas). Ver el README del backend para el detalle.

## Funcionalidad extra: mentorías

Pestaña **Mentorías**, con cinco secciones:

- **Buscar tutor**: lista de tutores con filtro por materia, clave o nombre.
  Al abrir uno se ven sus horarios futuros; los ya reservados aparecen
  bloqueados. Se reserva eligiendo un horario y escribiendo un mensaje.
- **Ofrecerme como tutor**: solo aparecen las materias de tu kardex con
  calificación suficiente. Ahí mismo publicas tus horarios de atención
  (no se aceptan fechas pasadas).
- **Mis solicitudes**: lo que pediste, con materia, fecha, hora y estado. Se
  puede cancelar una solicitud pendiente o aceptada.
- **Solicitudes recibidas**: lo que te pidieron como tutor; aceptas o rechazas
  las pendientes.
- **Administración** (solo si eres admin): desactivar tutores y agregar otros
  administradores.

Cada vez que entras a una sección se vuelve a consultar, así que no ves datos
desactualizados.

## Despliegue (Vercel)

El router usa `createWebHistory`, por eso `vercel.json` redirige cualquier
ruta a `index.html`; sin él, recargar `/mentorias` daría 404. Define
`VITE_API_BASE_URL` en el panel de Vercel con la URL pública del backend
(terminada en `/api`).

## Capturas de pantalla

<!-- TODO: agregar capturas del login, dashboard, calificaciones, kardex, horario, la campanita de notificaciones y las secciones de mentorías antes de entregar -->
