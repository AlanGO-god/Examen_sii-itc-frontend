<script setup>
defineProps({ name: { type: String, required: true } });
</script>

<template>
  <svg viewBox="0 0 24 24" class="icono-app" aria-hidden="true">
    <template v-if="name === 'perfil'">
      <circle cx="12" cy="8" r="3.4" fill="none" stroke="currentColor" stroke-width="1.6" />
      <path fill="none" stroke="currentColor" stroke-width="1.6" d="M5 20c0-4 3-6.5 7-6.5s7 2.5 7 6.5" />
    </template>
    <template v-else-if="name === 'calificaciones'">
      <rect x="4" y="3" width="16" height="18" rx="1.5" fill="none" stroke="currentColor" stroke-width="1.6" />
      <path fill="none" stroke="currentColor" stroke-width="1.6" d="M8 8h8M8 12h8M8 16h5" />
    </template>
    <template v-else-if="name === 'kardex'">
      <path fill="none" stroke="currentColor" stroke-width="1.6" d="M12 3v7M12 10l-6 3.5M12 10l6 3.5M6 13.5V17M18 13.5V17M4 19h4M16 19h4" />
      <circle cx="12" cy="3" r="1.4" fill="currentColor" />
      <circle cx="6" cy="16" r="1.4" fill="currentColor" />
      <circle cx="18" cy="16" r="1.4" fill="currentColor" />
    </template>
    <template v-else-if="name === 'horario'">
      <rect x="3" y="5" width="18" height="16" rx="1.5" fill="none" stroke="currentColor" stroke-width="1.6" />
      <path fill="none" stroke="currentColor" stroke-width="1.6" d="M3 9h18M8 3v4M16 3v4" />
    </template>
    <template v-else-if="name === 'campana'">
      <path fill="none" stroke="currentColor" stroke-width="1.6" d="M6 10a6 6 0 0 1 12 0c0 4 1.5 5.5 1.5 5.5H4.5S6 14 6 10Z" />
      <path fill="none" stroke="currentColor" stroke-width="1.6" d="M10 18a2 2 0 0 0 4 0" />
    </template>
    <template v-else-if="name === 'salir'">
      <path fill="none" stroke="currentColor" stroke-width="1.6" d="M9 4H5v16h4M15 8l4 4-4 4M19 12H9" />
    </template>
    <template v-else-if="name === 'correo'">
      <path fill="none" stroke="currentColor" stroke-width="1.6" d="M3 6h18v12H3z" />
      <path fill="none" stroke="currentColor" stroke-width="1.6" d="M3 7l9 6 9-6" />
    </template>
    <template v-else-if="name === 'balanza'">
      <path fill="none" stroke="currentColor" stroke-width="1.6" d="M12 3v15M7 7l-3 6a3 3 0 0 0 6 0l-3-6ZM17 7l-3 6a3 3 0 0 0 6 0l-3-6ZM5 21h14M9 7h6" />
    </template>
    <template v-else-if="name === 'creditos'">
      <rect x="4" y="6" width="16" height="12" rx="1.5" fill="none" stroke="currentColor" stroke-width="1.6" />
      <path fill="none" stroke="currentColor" stroke-width="1.6" d="M4 10h16" />
      <circle cx="8" cy="15" r="1.1" fill="currentColor" />
    </template>
    <template v-else-if="name === 'check'">
      <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="1.6" />
      <path fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" d="M8 12.5l2.5 2.5L16 9.5" />
    </template>
    <template v-else-if="name === 'equis'">
      <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="1.6" />
      <path fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" d="M9 9l6 6M15 9l-6 6" />
    </template>
    <template v-else-if="name === 'barras'">
      <path fill="none" stroke="currentColor" stroke-width="1.6" d="M4 20V13M10 20V8M16 20V4M2 20h20" />
    </template>
    <template v-else-if="name === 'buscar'">
      <circle cx="10.5" cy="10.5" r="6.5" fill="none" stroke="currentColor" stroke-width="1.6" />
      <path fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" d="M19 19l-4-4" />
    </template>
    <template v-else-if="name === 'mentoria'">
      <circle cx="8" cy="8" r="2.8" fill="none" stroke="currentColor" stroke-width="1.6" />
      <path fill="none" stroke="currentColor" stroke-width="1.6" d="M3 20c0-3.2 2.2-5.5 5-5.5s5 2.3 5 5.5" />
      <circle cx="17" cy="6" r="2" fill="none" stroke="currentColor" stroke-width="1.6" />
      <path fill="none" stroke="currentColor" stroke-width="1.6" d="M13.5 19.5c.3-2.5 2-4.3 3.5-4.3s3.2 1.8 3.5 4.3" />
    </template>
  </svg>
</template>

<style scoped>
.icono-app {
  width: 1em;
  height: 1em;
}
</style>