export function Footer() {
  return (
    <footer
      className="px-6 py-6 text-center border-t"
      style={{ borderColor: 'hsla(var(--border) / 0.4)' }}
    >
      <p
        className="text-xs"
        style={{
          color: 'hsl(var(--muted))',
          fontFamily: 'JetBrains Mono, monospace',
        }}
      >
        © {new Date().getFullYear()} Problemspace. All rights reserved.
      </p>
    </footer>
  )
}
