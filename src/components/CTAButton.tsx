import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'

interface CTAButtonProps {
  children?: React.ReactNode
  onClick?: () => void
  href?: string
}

export function CTAButton({ children = 'Get early access', onClick, href = '/auth' }: CTAButtonProps) {
  return (
    <motion.a
      href={href}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="relative inline-flex items-center gap-2 px-7 py-3 rounded-full text-sm font-semibold overflow-hidden group"
      style={{
        backgroundColor: 'hsl(var(--foreground))',
        color: 'hsl(var(--background))',
        fontFamily: 'Space Grotesk, sans-serif',
        textDecoration: 'none',
      }}
    >
      {/* Shimmer overlay */}
      <motion.span
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'linear-gradient(105deg, transparent 40%, rgba(129,140,248,0.35) 50%, rgba(45,212,191,0.25) 58%, transparent 68%)',
          backgroundSize: '200% 100%',
        }}
        initial={{ backgroundPosition: '-200% center' }}
        whileHover={{ backgroundPosition: '200% center' }}
        transition={{ duration: 0.6, ease: 'easeInOut' }}
      />
      <span className="relative z-10">{children}</span>
      <ArrowRight size={14} className="relative z-10 transition-transform group-hover:translate-x-0.5" />
    </motion.a>
  )
}
