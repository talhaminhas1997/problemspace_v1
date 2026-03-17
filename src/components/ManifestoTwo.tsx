import { motion } from 'framer-motion'

export function ManifestoTwo() {
  return (
    <section className="relative px-6 py-24 overflow-hidden">
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
          className="font-semibold leading-[1.25] tracking-tight"
          style={{
            fontFamily: 'Space Grotesk, sans-serif',
            fontSize: 'clamp(1.4rem, 3vw, 2.1rem)',
            color: 'hsl(var(--foreground))',
          }}
        >
          You don't need AI that moves faster.{' '}
          <br className="hidden md:block" />
          <span style={{ color: 'hsl(var(--muted))' }}>
            You need AI that tells you what's worth building.
          </span>
        </p>
      </motion.div>
    </section>
  )
}
