import { motion } from 'framer-motion'
import { Compass, Scale, ShieldCheck } from 'lucide-react'

const features = [
  {
    icon: <Compass size={18} />,
    title: 'You Set the Direction',
    description:
      'AI executes. Your job is the one that matters most: setting the right goal.',
  },
  {
    icon: <Scale size={18} />,
    title: 'You Make the Call',
    description:
      'Problemspace argues both sides with real data. You make the decisions that matter with conviction, not guesswork.',
  },
  {
    icon: <ShieldCheck size={18} />,
    title: 'You Stay in Control',
    description:
      'Every insight is cited. Every artifact is editable. Nothing ships without your approval.',
  },
]

export function Features() {
  return (
    <section className="px-6 py-16">
      <div className="max-w-5xl mx-auto">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
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
            AI that keeps you in the loop
          </span>
          <h2
            className="font-bold tracking-tight"
            style={{
              fontFamily: 'Space Grotesk, sans-serif',
              fontSize: 'clamp(1.6rem, 3vw, 2.2rem)',
              color: 'hsl(var(--foreground))',
            }}
          >
            AI does the heavy lifting.{' '}
            <span style={{ color: 'hsl(var(--muted))' }}>
              You make the calls that matter.
            </span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: i * 0.1 }}
              className="relative rounded-xl overflow-hidden flex flex-col"
              style={{
                border: '1px solid hsla(var(--border) / 0.3)',
                backgroundColor: 'hsla(var(--secondary) / 0.8)',
                backdropFilter: 'blur(8px)',
              }}
            >
              {/* Gradient top strip */}
              <div
                className="h-[2px] w-full shrink-0"
                style={{ background: 'linear-gradient(90deg, #818cf8, #2dd4bf)' }}
              />
              <div className="p-6 flex flex-col gap-4 flex-1">
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center"
                  style={{
                    backgroundColor: 'hsla(var(--primary) / 0.12)',
                    color: 'hsl(var(--primary))',
                    border: '1px solid hsla(var(--primary) / 0.2)',
                  }}
                >
                  {feature.icon}
                </div>
                <div>
                  <h3
                    className="font-semibold mb-2 text-base"
                    style={{
                      fontFamily: 'Space Grotesk, sans-serif',
                      color: 'hsl(var(--foreground))',
                    }}
                  >
                    {feature.title}
                  </h3>
                  <p
                    className="text-sm leading-relaxed"
                    style={{
                      color: 'hsl(var(--muted))',
                      fontFamily: 'Space Grotesk, sans-serif',
                    }}
                  >
                    {feature.description}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
