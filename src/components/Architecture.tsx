import { motion } from 'framer-motion'
import { useEffect, useRef } from 'react'

const dataSources = [
  { label: 'Interviews', desc: 'User research sessions', soon: false },
  { label: 'Slack', desc: 'Team signals & threads', soon: true },
  { label: 'Notion', desc: 'Docs & wikis', soon: true },
  { label: 'Linear', desc: 'Issues & projects', soon: true },
  { label: 'Google Docs', desc: 'Specs & briefs', soon: true },
  { label: 'Figma', desc: 'Design files', soon: true },
  { label: 'Amplitude', desc: 'Usage analytics', soon: true },
  { label: 'Support', desc: 'Tickets & threads', soon: true },
]

const insights = [
  { label: 'Hair-on-Fire Problems', desc: 'Urgent pain, high signal' },
  { label: 'Priority Stack Rank', desc: 'Scored by reach & impact' },
  { label: 'Unmet Needs', desc: 'Gaps without solutions' },
  { label: 'Solutions That Move the Needle', desc: 'High-leverage opportunities' },
  { label: 'Signal vs. Noise', desc: 'What to act on vs. ignore' },
]

const orbitLabels = ['OKRs', 'Research', 'PRDs', 'Metrics', 'Strategy', 'Decisions']

function HubCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const angleRef = useRef(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    const size = 200
    canvas.width = size
    canvas.height = size
    let raf: number

    const draw = () => {
      ctx.clearRect(0, 0, size, size)
      const cx = size / 2
      const cy = size / 2
      const angle = angleRef.current

      // Rotating conic ring (simulated with arc segments)
      const R = 72
      const ringWidth = 12
      const steps = 64
      for (let i = 0; i < steps; i++) {
        const a1 = (i / steps) * Math.PI * 2 + angle
        const a2 = ((i + 1) / steps) * Math.PI * 2 + angle
        const progress = i / steps
        const r = Math.round(129 + (45 - 129) * progress)
        const g = Math.round(140 + (212 - 140) * progress)
        const b = Math.round(248 + (191 - 248) * progress)
        const alpha = 0.15 + progress * 0.7
        ctx.beginPath()
        ctx.arc(cx, cy, R, a1, a2)
        ctx.strokeStyle = `rgba(${r},${g},${b},${alpha})`
        ctx.lineWidth = ringWidth
        ctx.stroke()
      }

      // Faint orbit track
      ctx.beginPath()
      ctx.arc(cx, cy, R, 0, Math.PI * 2)
      ctx.strokeStyle = 'rgba(255,255,255,0.04)'
      ctx.lineWidth = 1
      ctx.stroke()

      // Center circle
      const grad = ctx.createRadialGradient(cx - 8, cy - 8, 2, cx, cy, 32)
      grad.addColorStop(0, 'rgba(129,140,248,0.25)')
      grad.addColorStop(1, 'rgba(45,212,191,0.08)')
      ctx.beginPath()
      ctx.arc(cx, cy, 30, 0, Math.PI * 2)
      ctx.fillStyle = grad
      ctx.fill()

      // Center border
      ctx.beginPath()
      ctx.arc(cx, cy, 30, 0, Math.PI * 2)
      ctx.strokeStyle = 'rgba(129,140,248,0.35)'
      ctx.lineWidth = 1.5
      ctx.stroke()

      // Center dots
      for (let d = 0; d < 3; d++) {
        const dx = (d - 1) * 10
        ctx.beginPath()
        ctx.arc(cx + dx, cy, 2.5, 0, Math.PI * 2)
        ctx.fillStyle = 'rgba(129,140,248,0.8)'
        ctx.fill()
      }

      angleRef.current += 0.008
      raf = requestAnimationFrame(draw)
    }

    draw()
    return () => cancelAnimationFrame(raf)
  }, [])

  return <canvas ref={canvasRef} style={{ width: '200px', height: '200px' }} />
}

function Panel({
  title,
  items,
  align,
}: {
  title: string
  items: typeof dataSources | typeof insights
  align: 'left' | 'right'
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="rounded-xl flex flex-col overflow-hidden"
      style={{
        border: '1px solid hsla(var(--border) / 0.5)',
        backgroundColor: 'hsla(var(--secondary) / 0.8)',
        backdropFilter: 'blur(8px)',
        minWidth: 0,
      }}
    >
      {/* Gradient top strip */}
      <div
        className="h-[3px] w-full shrink-0"
        style={{ background: 'linear-gradient(90deg, #818cf8, #2dd4bf)' }}
      />
      <div className="p-5 flex flex-col gap-4">
        <p
          className="text-[10px] tracking-[0.2em] uppercase"
          style={{
            fontFamily: 'JetBrains Mono, monospace',
            color: 'hsl(var(--muted))',
          }}
        >
          {title}
        </p>
        <div className="flex flex-col gap-2.5">
          {'soon' in (items[0] ?? {})
            ? (items as typeof dataSources).map((item, i) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, x: align === 'left' ? -8 : 8 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.07 * i, duration: 0.4 }}
                  className="flex items-start gap-3"
                >
                  <div
                    className="mt-1 w-1.5 h-1.5 rounded-full shrink-0"
                    style={{ background: 'linear-gradient(135deg, #818cf8, #2dd4bf)' }}
                  />
                  <div className="flex items-baseline gap-2 min-w-0">
                    <p
                      className="text-xs font-medium leading-tight"
                      style={{ fontFamily: 'Space Grotesk, sans-serif', color: 'hsl(var(--foreground))' }}
                    >
                      {item.label}
                    </p>
                    {item.soon && (
                      <span
                        className="text-[9px] tracking-[0.15em] uppercase shrink-0"
                        style={{ fontFamily: 'JetBrains Mono, monospace', color: 'hsl(var(--muted))' }}
                      >
                        soon
                      </span>
                    )}
                  </div>
                </motion.div>
              ))
            : (items as typeof insights).map((item, i) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, x: align === 'left' ? -8 : 8 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.07 * i, duration: 0.4 }}
                  className="flex items-start gap-3"
                >
                  <div
                    className="mt-1 w-1.5 h-1.5 rounded-full shrink-0"
                    style={{ background: 'linear-gradient(135deg, #818cf8, #2dd4bf)' }}
                  />
                  <div>
                    <p
                      className="text-xs font-medium leading-tight"
                      style={{ fontFamily: 'Space Grotesk, sans-serif', color: 'hsl(var(--foreground))' }}
                    >
                      {item.label}
                    </p>
                    <p
                      className="text-[11px] mt-0.5"
                      style={{ color: 'hsl(var(--muted))', fontFamily: 'Space Grotesk, sans-serif' }}
                    >
                      {item.desc}
                    </p>
                  </div>
                </motion.div>
              ))}
        </div>
      </div>
    </motion.div>
  )
}

export function Architecture() {
  return (
    <section id="architecture" className="px-6 py-24">
      <div className="max-w-5xl mx-auto">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <span
            className="inline-block mb-4 px-4 py-1.5 rounded-full text-[10px] tracking-[0.2em] uppercase border"
            style={{
              fontFamily: 'JetBrains Mono, monospace',
              backgroundColor: 'hsla(var(--secondary) / 0.8)',
              color: 'hsl(var(--muted))',
              borderColor: 'hsla(var(--border) / 0.5)',
            }}
          >
            The Product Intelligence Layer
          </span>
          <h2
            className="font-bold tracking-tight"
            style={{
              fontFamily: 'Space Grotesk, sans-serif',
              fontSize: 'clamp(1.6rem, 3vw, 2.2rem)',
              color: 'hsl(var(--foreground))',
            }}
          >
            From raw signals to actionable insight
          </h2>
          <p
            className="mt-3 max-w-md mx-auto text-sm"
            style={{ color: 'hsl(var(--muted))', fontFamily: 'Space Grotesk, sans-serif' }}
          >
            Problemspace connects every input across your product surface and continuously synthesizes
            them into structured intelligence.
          </p>
        </motion.div>

        {/* Three-column layout */}
        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-6 items-center">
          <Panel title="Data Sources" items={dataSources} align="left" />

          {/* Center hub */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="flex flex-col items-center gap-4 py-4"
          >
            <div className="relative">
              <HubCanvas />
              {/* Orbit labels */}
              {orbitLabels.map((label, i) => {
                const angle = (i / orbitLabels.length) * 360 - 90
                const rad = (angle * Math.PI) / 180
                const r = 98
                const x = 100 + r * Math.cos(rad)
                const y = 100 + r * Math.sin(rad)
                return (
                  <span
                    key={label}
                    className="absolute text-[9px] tracking-wide whitespace-nowrap pointer-events-none"
                    style={{
                      fontFamily: 'JetBrains Mono, monospace',
                      color: 'hsl(var(--muted))',
                      left: x,
                      top: y,
                      transform: 'translate(-50%, -50%)',
                    }}
                  >
                    {label}
                  </span>
                )
              })}
            </div>
            <p
              className="text-[10px] tracking-[0.15em] uppercase text-center"
              style={{
                fontFamily: 'JetBrains Mono, monospace',
                color: 'hsl(var(--muted))',
              }}
            >
              problemspace
            </p>
          </motion.div>

          <Panel title="Insights" items={insights} align="right" />
        </div>
      </div>
    </section>
  )
}
