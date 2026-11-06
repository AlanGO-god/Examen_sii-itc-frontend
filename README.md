# SII ITC — Frontend

Portal del estudiante en Vue 3 + Vite, que consume el backend de este
proyecto para mostrar perfil, calificaciones, kardex y horario del SII ITC,
con un sistema de notificaciones de cambios.

Repositorio del backend: <LINK-A-TU-REPO-BACKEND>

## ¿Por qué Vue 3 + Vite?

La aplicación es una SPA con pocas vistas y un estado simple (un token de
sesión + los datos que trae cada vista). Vite da arranque casi instantáneo
con recarga en caliente, y la Composition API de Vue 3 (`<script setup>`)
mantiene la lógica de cada vista corta y legible sin necesitar SSR/SSG — por
eso se descartó Nuxt, que habría sido peso extra sin beneficio real aquí.

## Estructura

src/
assets/ estilos globales (tokens de color, tipografía)
components/ AppLayout (navegación), NotificationBell
router/ rutas y guard de autenticación
store/ estado de sesión (Pinia)
services/ cliente HTTP (axios + interceptor de token)
views/ Login, Dashboard, Calificaciones, Kardex, Horario


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
VITE_API_BASE_URL=http://localhost:4000/api

## Funcionalidad extra: notificaciones

La campanita en la barra lateral permite revisar manualmente cambios en
calificaciones/horario, o activar un monitoreo automático. Ver el README del
backend para el detalle de cómo funciona la detección de cambios.

## Capturas de pantalla

<!-- TODO: agregar capturas del login, dashboard, calificaciones, kardex, horario y la campanita de notificaciones antes de entregar -->