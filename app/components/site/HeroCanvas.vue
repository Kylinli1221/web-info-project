<script setup lang="ts">
interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  radius: number
}

const canvas = ref<HTMLCanvasElement | null>(null)
const reduced = useReducedMotion()
let context: CanvasRenderingContext2D | null = null
let particles: Particle[] = []
let width = 0
let height = 0
let frame = 0
let resizeObserver: ResizeObserver | null = null
let pointerX = 0
let pointerY = 0
let running = false

function createParticles() {
  const count = Math.max(24, Math.min(82, Math.round((width * height) / 23000)))
  particles = Array.from({ length: count }, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    vx: (Math.random() - 0.5) * 0.18,
    vy: (Math.random() - 0.5) * 0.18,
    radius: Math.random() * 1.1 + 0.45,
  }))
}

function sizeCanvas() {
  if (!canvas.value) return
  const bounds = canvas.value.getBoundingClientRect()
  width = Math.max(1, bounds.width)
  height = Math.max(1, bounds.height)
  const dpr = Math.min(window.devicePixelRatio || 1, 1.5)
  canvas.value.width = Math.round(width * dpr)
  canvas.value.height = Math.round(height * dpr)
  context = canvas.value.getContext('2d')
  context?.setTransform(dpr, 0, 0, dpr, 0, 0)
  createParticles()
  draw()
}

function draw() {
  if (!context) return
  context.clearRect(0, 0, width, height)

  context.strokeStyle = 'rgba(88, 229, 255, 0.045)'
  context.lineWidth = 1
  const grid = 64
  for (let x = 0; x < width; x += grid) {
    context.beginPath()
    context.moveTo(x, 0)
    context.lineTo(x, height)
    context.stroke()
  }
  for (let y = 0; y < height; y += grid) {
    context.beginPath()
    context.moveTo(0, y)
    context.lineTo(width, y)
    context.stroke()
  }

  for (let i = 0; i < particles.length; i++) {
    const particle = particles[i]!
    if (!reduced.value) {
      particle.x += particle.vx + pointerX * 0.08
      particle.y += particle.vy + pointerY * 0.08
      if (particle.x < -10) particle.x = width + 10
      if (particle.x > width + 10) particle.x = -10
      if (particle.y < -10) particle.y = height + 10
      if (particle.y > height + 10) particle.y = -10
    }

    context.beginPath()
    context.fillStyle = i % 5 === 0 ? 'rgba(139, 125, 255, 0.8)' : 'rgba(88, 229, 255, 0.66)'
    context.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2)
    context.fill()

    for (let j = i + 1; j < particles.length; j++) {
      const other = particles[j]!
      const dx = particle.x - other.x
      const dy = particle.y - other.y
      const distance = Math.hypot(dx, dy)
      if (distance < 125) {
        context.beginPath()
        context.strokeStyle = `rgba(88, 229, 255, ${0.13 * (1 - distance / 125)})`
        context.lineWidth = 0.6
        context.moveTo(particle.x, particle.y)
        context.lineTo(other.x, other.y)
        context.stroke()
      }
    }
  }
}

function loop() {
  draw()
  if (running && !reduced.value && !document.hidden) frame = requestAnimationFrame(loop)
}

function start() {
  if (running) return
  running = true
  cancelAnimationFrame(frame)
  frame = requestAnimationFrame(loop)
}

function stop() {
  running = false
  cancelAnimationFrame(frame)
}

function onVisibilityChange() {
  if (document.hidden) stop()
  else start()
}

function onPointerMove(event: PointerEvent) {
  pointerX = (event.clientX / window.innerWidth - 0.5) * 2
  pointerY = (event.clientY / window.innerHeight - 0.5) * 2
}

onMounted(() => {
  sizeCanvas()
  resizeObserver = new ResizeObserver(sizeCanvas)
  if (canvas.value) resizeObserver.observe(canvas.value)
  document.addEventListener('visibilitychange', onVisibilityChange)
  window.addEventListener('pointermove', onPointerMove, { passive: true })
  start()
})

watch(reduced, value => {
  if (value) {
    stop()
    draw()
  } else {
    start()
  }
})

onBeforeUnmount(() => {
  stop()
  resizeObserver?.disconnect()
  document.removeEventListener('visibilitychange', onVisibilityChange)
  window.removeEventListener('pointermove', onPointerMove)
})
</script>

<template>
  <canvas ref="canvas" class="pointer-events-none absolute inset-0 h-full w-full" aria-hidden="true" />
</template>
