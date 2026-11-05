<script setup lang="ts">
const props = defineProps<{
  page: number
  total: number
  pageSize: number
  basePath: string
}>()
const { t } = useI18n()
const lastPage = computed(() => Math.max(1, Math.ceil(props.total / props.pageSize)))
const hasPrevious = computed(() => props.page > 1)
const hasNext = computed(() => props.page < lastPage.value)

function link(page: number) {
  return page <= 1 ? props.basePath : `${props.basePath}?page=${page}`
}
</script>

<template>
  <nav v-if="lastPage > 1" class="mt-14 flex items-center justify-between border-t border-white/10 pt-6" :aria-label="t('lists.page', { page })">
    <NuxtLink
      v-if="hasPrevious"
      :to="link(page - 1)"
      class="btn-ghost !px-4 !py-2 text-xs"
      rel="prev"
    >
      ← {{ t('lists.previous') }}
    </NuxtLink>
    <span v-else class="text-xs text-slate-600">{{ t('lists.previous') }}</span>

    <span class="font-mono text-[10px] tracking-[0.16em] text-slate-500">
      {{ String(page).padStart(2, '0') }} / {{ String(lastPage).padStart(2, '0') }}
    </span>

    <NuxtLink
      v-if="hasNext"
      :to="link(page + 1)"
      class="btn-ghost !px-4 !py-2 text-xs"
      rel="next"
    >
      {{ t('lists.next') }} →
    </NuxtLink>
    <span v-else class="text-xs text-slate-600">{{ t('lists.next') }}</span>
  </nav>
</template>
