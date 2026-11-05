import type { Ref } from 'vue'

function numericTemplate(value: string, progress: number): string {
  return value.replace(/\d+(?:\.\d+)?/g, (match) => {
    const target = Number(match)
    const decimals = match.includes('.') ? match.split('.')[1]?.length ?? 0 : 0
    return (target * progress).toFixed(decimals)
  })
}

export function useCountUp(value: Ref<string>, active: Ref<boolean>) {
  const display = ref(value.value)
  const reduced = useReducedMotion()
  let frame = 0

  watch([value, active, reduced], ([nextValue, isActive, prefersReduced]) => {
    if (import.meta.client) cancelAnimationFrame(frame)
    if (!isActive || prefersReduced || !import.meta.client) {
      display.value = nextValue
      return
    }

    const duration = 1200
    const started = performance.now()
    display.value = numericTemplate(nextValue, 0)

    const tick = (now: number) => {
      const progress = Math.min((now - started) / duration, 1)
      const eased = 1 - (1 - progress) ** 3
      display.value = numericTemplate(nextValue, eased)
      if (progress < 1) frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
  }, { immediate: true })

  onBeforeUnmount(() => {
    if (import.meta.client) cancelAnimationFrame(frame)
  })

  return display
}
