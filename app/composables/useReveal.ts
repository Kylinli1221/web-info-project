export function useReveal(threshold = 0.12) {
  const target = ref<HTMLElement | null>(null)
  const visible = ref(false)
  const reduced = useReducedMotion()
  let observer: IntersectionObserver | null = null

  onMounted(async () => {
    if (reduced.value || !('IntersectionObserver' in window)) {
      visible.value = true
      return
    }

    await nextTick()
    const candidate = target.value as unknown as Element | { $el?: Element } | null
    const element = candidate instanceof Element ? candidate : candidate?.$el
    if (!element) {
      visible.value = true
      return
    }

    observer = new IntersectionObserver((entries) => {
      if (entries.some(entry => entry.isIntersecting)) {
        visible.value = true
        observer?.disconnect()
        observer = null
      }
    }, { threshold, rootMargin: '0px 0px -8% 0px' })

    observer.observe(element)
  })

  watch(reduced, (value) => {
    if (value) visible.value = true
  })

  onBeforeUnmount(() => {
    observer?.disconnect()
    observer = null
  })

  return { target, visible }
}
