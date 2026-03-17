import { useEffect, useState } from 'react'
import { Nav } from './components/Nav'
import { Hero } from './components/Hero'
import { Manifesto } from './components/Manifesto'
import { ManifestoTwo } from './components/ManifestoTwo'
import { Architecture } from './components/Architecture'
import { Features } from './components/Features'
import { BottomCTA } from './components/BottomCTA'
import { Footer } from './components/Footer'
import './index.css'

type Theme = 'dark' | 'light'

function App() {
  const [theme, setTheme] = useState<Theme>(() => {
    const stored = localStorage.getItem('ps-theme')
    if (stored === 'light' || stored === 'dark') return stored
    return 'dark'
  })

  useEffect(() => {
    const body = document.body
    if (theme === 'light') {
      body.classList.add('light')
    } else {
      body.classList.remove('light')
    }
    localStorage.setItem('ps-theme', theme)
  }, [theme])

  const toggleTheme = () => setTheme(t => (t === 'dark' ? 'light' : 'dark'))

  return (
    <div style={{ minHeight: '100vh' }}>
      <Nav theme={theme} onToggleTheme={toggleTheme} />
      <main>
        <Hero />
        <Manifesto />
        <Architecture />
        <ManifestoTwo />
        <Features />
        <BottomCTA />
      </main>
      <Footer />
    </div>
  )
}

export default App
