<script setup lang="ts">
const props = defineProps<{ value: string; active: boolean }>()
const valueRef = computed(() => props.value)
const activeRef = toRef(props, 'active')
const display = useCountUp(valueRef, activeRef)
</script>

<template>
  <span>{{ display }}</span>
</template>
