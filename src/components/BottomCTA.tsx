import { motion } from 'framer-motion'
import { CTAButton } from './CTAButton'

export function BottomCTA() {
  return (
    <section id="contact" className="relative px-6 py-32 overflow-hidden">
      {/* Ambient glow */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse, hsla(266,100%,64%,0.06) 0%, transparent 70%)',
          filter: 'blur(40px)',
        }}
      />

      {/* Divider top */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-12"
        style={{
          background: 'linear-gradient(to bottom, hsl(var(--border)), transparent)',
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="relative max-w-xl mx-auto text-center flex flex-col items-center gap-6"
      >
        <span
          className="px-4 py-1.5 rounded-full text-[10px] tracking-[0.2em] uppercase border"
          style={{
            fontFamily: 'JetBrains Mono, monospace',
            backgroundColor: 'hsla(var(--secondary) / 0.8)',
            color: 'hsl(var(--muted))',
            borderColor: 'hsla(var(--border) / 0.5)',
          }}
        >
          See it in action
        </span>

        <h2
          className="font-bold tracking-tight"
          style={{
            fontFamily: 'Space Grotesk, sans-serif',
            fontSize: 'clamp(1.8rem, 3.5vw, 2.5rem)',
            color: 'hsl(var(--foreground))',
            lineHeight: 1.1,
          }}
        >
          Ready to ship with conviction?
        </h2>

        <p
          className="text-sm leading-relaxed max-w-sm"
          style={{
            color: 'hsl(var(--muted))',
            fontFamily: 'Space Grotesk, sans-serif',
          }}
        >
          See how Problemspace helps PMs stop guessing and start deciding.
        </p>

        <CTAButton>Get early access</CTAButton>
      </motion.div>
    </section>
  )
}
