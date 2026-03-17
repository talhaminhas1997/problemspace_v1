import { motion } from 'framer-motion'

export function Manifesto() {
  return (
    <section className="relative px-6 py-24 overflow-hidden">
      {/* Divider line */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-12"
        style={{
          background: 'linear-gradient(to bottom, transparent, hsl(var(--border)))',
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="max-w-3xl mx-auto text-center"
      >
        <p
          className="font-semibold leading-[1.2] tracking-tight"
          style={{
            fontFamily: 'Space Grotesk, sans-serif',
            fontSize: 'clamp(1.5rem, 3.5vw, 2.4rem)',
            color: 'hsl(var(--foreground))',
          }}
        >
          The bottleneck isn't building anymore.{' '}
          <span style={{ color: 'hsl(var(--muted))' }}>
            It's knowing what to build.
          </span>
        </p>
      </motion.div>
    </section>
  )
}
