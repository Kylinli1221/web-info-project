<script setup lang="ts">
defineProps<{ html: string }>()
</script>

<template>
  <!-- eslint-disable-next-line vue/no-v-html -- server-sanitized Markdown only -->
  <div class="prose-tech" v-html="html" />
</template>
