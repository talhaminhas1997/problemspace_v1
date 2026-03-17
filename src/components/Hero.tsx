import { motion } from 'framer-motion'
import { CTAButton } from './CTAButton'

export function Hero() {
  const fadeUp = (delay: number) => ({
    hidden: { opacity: 0, y: 16 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.55, delay, ease: 'easeOut' as const },
    },
  })

  return (
    <section className="relative flex flex-col items-center justify-center px-6 pt-40 pb-32 text-center overflow-hidden">
      {/* Ambient glow */}
      <div
        className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse, hsla(266,100%,64%,0.07) 0%, transparent 70%)',
          filter: 'blur(40px)',
        }}
      />

      {/* Badge */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeUp(0)}
        className="mb-7"
      >
        <span
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] tracking-[0.2em] uppercase border"
          style={{
            backgroundColor: 'hsla(var(--primary) / 0.12)',
            color: 'hsl(var(--primary))',
            borderColor: 'hsla(var(--primary) / 0.3)',
            fontFamily: 'JetBrains Mono, monospace',
          }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
          AI for builders
        </span>
      </motion.div>

      {/* Heading */}
      <motion.h1
        initial="hidden"
        animate="visible"
        variants={fadeUp(0.1)}
        className="max-w-3xl font-bold leading-[1.05] tracking-tight"
        style={{
          fontFamily: 'Space Grotesk, sans-serif',
          fontSize: 'clamp(2.6rem, 5vw, 4rem)',
          color: 'hsl(var(--foreground))',
        }}
      >
        Build products{' '}
        <span
          style={{
            background: 'linear-gradient(90deg, #818cf8, #2dd4bf)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          that matter.
        </span>
      </motion.h1>

      {/* Subheading */}
      <motion.p
        initial="hidden"
        animate="visible"
        variants={fadeUp(0.22)}
        className="mt-6 max-w-lg leading-relaxed"
        style={{
          color: 'hsl(var(--muted))',
          fontSize: '1.05rem',
          fontFamily: 'Space Grotesk, sans-serif',
        }}
      >
        Building is easy. Knowing what to build is the hard part. Problemspace solves it.
      </motion.p>

      {/* CTAs */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeUp(0.34)}
        className="mt-10 flex items-center gap-4 flex-wrap justify-center"
      >
        <CTAButton>Get early access</CTAButton>
        <a
          href="#architecture"
          className="text-sm transition-colors"
          style={{
            color: 'hsl(var(--muted))',
            fontFamily: 'Space Grotesk, sans-serif',
          }}
          onMouseEnter={e => ((e.target as HTMLElement).style.color = 'hsl(var(--foreground))')}
          onMouseLeave={e => ((e.target as HTMLElement).style.color = 'hsl(var(--muted))')}
        >
          See how it works →
        </a>
      </motion.div>
    </section>
  )
}
