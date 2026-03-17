import { Sun, Moon } from 'lucide-react'
import { motion } from 'framer-motion'

interface NavProps {
  theme: 'dark' | 'light'
  onToggleTheme: () => void
}

export function Nav({ theme, onToggleTheme }: NavProps) {
  return (
    <motion.nav
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 border-b"
      style={{
        borderColor: 'hsl(var(--border))',
        backgroundColor: 'hsla(var(--background) / 0.85)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
      }}
    >
      {/* Wordmark */}
      <a href="#" className="flex items-center gap-2.5 group">
        <div
          className="w-6 h-6 rounded-[5px] flex items-center justify-center shrink-0"
          style={{
            background: 'linear-gradient(135deg, #818cf8, #2dd4bf)',
          }}
        >
          <span
            className="text-white font-bold leading-none"
            style={{ fontSize: '11px', fontFamily: 'Space Grotesk, sans-serif' }}
          >
            P
          </span>
        </div>
        <span
          className="font-bold tracking-tight"
          style={{
            fontFamily: 'Space Grotesk, sans-serif',
            fontSize: '15px',
            color: 'hsl(var(--foreground))',
          }}
        >
          problemspace
        </span>
      </a>

      {/* Right side */}
      <div className="flex items-center gap-6">
        <a
          href="#contact"
          className="text-sm transition-colors"
          style={{
            fontFamily: 'Space Grotesk, sans-serif',
            color: 'hsl(var(--muted))',
          }}
          onMouseEnter={e => ((e.target as HTMLElement).style.color = 'hsl(var(--foreground))')}
          onMouseLeave={e => ((e.target as HTMLElement).style.color = 'hsl(var(--muted))')}
        >
          Contact
        </a>
        <button
          onClick={onToggleTheme}
          className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
          style={{
            color: 'hsl(var(--muted))',
            border: '1px solid hsl(var(--border))',
          }}
          onMouseEnter={e => {
            const el = e.currentTarget
            el.style.color = 'hsl(var(--foreground))'
            el.style.borderColor = 'hsl(var(--muted))'
          }}
          onMouseLeave={e => {
            const el = e.currentTarget
            el.style.color = 'hsl(var(--muted))'
            el.style.borderColor = 'hsl(var(--border))'
          }}
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
        </button>
      </div>
    </motion.nav>
  )
}
