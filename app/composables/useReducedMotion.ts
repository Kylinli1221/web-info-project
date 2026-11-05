export function useReducedMotion() {
  const reduced = ref(false)

  onMounted(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)')
    reduced.value = query.matches
    const update = (event: MediaQueryListEvent) => {
      reduced.value = event.matches
    }
    query.addEventListener('change', update)
    onBeforeUnmount(() => query.removeEventListener('change', update))
  })

  return reduced
}
