<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin-auth' })
const route = useRoute()
</script>

<template>
  <ContentEditor :id="String(route.params.id)" kind="news" />
</template>
