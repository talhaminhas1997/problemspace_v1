import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'

type Mode = 'login' | 'signup'

type FieldError = {
  email?: string
  password?: string
  confirm?: string
  general?: string
}

const MOCK_USERS = [{ email: 'demo@problemspace.ai', password: 'demo1234' }]

export function AuthPage() {
  const navigate = useNavigate()
  const [mode, setMode] = useState<Mode>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [errors, setErrors] = useState<FieldError>({})
  const [loading, setLoading] = useState(false)

  const validate = (): boolean => {
    const e: FieldError = {}
    if (!email.trim()) e.email = 'Email is required.'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = 'Enter a valid email.'
    if (!password) e.password = 'Password is required.'
    else if (password.length < 8) e.password = 'Password must be at least 8 characters.'
    if (mode === 'signup' && password !== confirm) e.confirm = 'Passwords do not match.'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    await new Promise(r => setTimeout(r, 800))

    if (mode === 'login') {
      const found = MOCK_USERS.find(u => u.email === email)
      if (!found) {
        setErrors({ email: 'No account found with this email.' })
      } else if (found.password !== password) {
        setErrors({ password: 'Incorrect password.' })
      } else {
        navigate('/chat')
        return
      }
    } else {
      navigate('/chat')
      return
    }
    setLoading(false)
  }

  const switchMode = (next: Mode) => {
    setMode(next)
    setErrors({})
    setPassword('')
    setConfirm('')
  }

  const inputBase =
    'w-full px-3 py-2.5 rounded-lg text-xs outline-none transition-all duration-200'
  const inputStyle = (hasErr: boolean) => ({
    background: 'rgba(255,255,255,0.05)',
    border: `1px solid ${hasErr ? 'rgba(239,68,68,0.6)' : 'rgba(255,255,255,0.08)'}`,
    color: 'rgba(255,255,255,0.9)',
    fontFamily: 'Space Grotesk, sans-serif',
  })

  return (
    <div
      className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{ background: '#0a0a0f' }}
    >
      {/* Animated background orbs */}
      <motion.div
        className="absolute pointer-events-none"
        style={{
          width: 600,
          height: 600,
          borderRadius: '50%',
          background: 'radial-gradient(circle, hsla(266,100%,64%,0.04) 0%, transparent 70%)',
          top: '-10%',
          left: '20%',
          filter: 'blur(60px)',
        }}
        animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute pointer-events-none"
        style={{
          width: 400,
          height: 400,
          borderRadius: '50%',
          background: 'radial-gradient(circle, hsla(180,70%,50%,0.03) 0%, transparent 70%)',
          bottom: '5%',
          right: '15%',
          filter: 'blur(50px)',
        }}
        animate={{ x: [0, -20, 0], y: [0, 25, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Grid overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="relative z-10 w-full max-w-sm px-4"
      >
        {/* Wordmark */}
        <div className="mb-8 text-center">
          <span
            className="text-sm font-semibold tracking-tight"
            style={{ color: 'rgba(255,255,255,0.9)', fontFamily: 'Space Grotesk, sans-serif' }}
          >
            problemspace
          </span>
        </div>

        {/* Card */}
        <div
          className="rounded-xl p-6"
          style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          {/* Tab toggle */}
          <div
            className="flex rounded-lg p-0.5 mb-6"
            style={{ background: 'rgba(255,255,255,0.04)' }}
          >
            {(['login', 'signup'] as Mode[]).map(m => (
              <button
                key={m}
                onClick={() => switchMode(m)}
                className="flex-1 py-1.5 rounded-md text-xs font-medium transition-all duration-200"
                style={{
                  fontFamily: 'Space Grotesk, sans-serif',
                  background: mode === m ? 'rgba(255,255,255,0.08)' : 'transparent',
                  color: mode === m ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.4)',
                }}
              >
                {m === 'login' ? 'Log in' : 'Sign up'}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.form
              key={mode}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
              onSubmit={handleSubmit}
              className="space-y-3"
            >
              {/* General error */}
              {errors.general && (
                <p className="text-xs" style={{ color: 'rgba(239,68,68,0.9)', fontFamily: 'Space Grotesk, sans-serif' }}>
                  {errors.general}
                </p>
              )}

              {/* Email */}
              <div>
                <label
                  className="block mb-1 text-xs"
                  style={{ color: 'rgba(255,255,255,0.4)', fontFamily: 'Space Grotesk, sans-serif' }}
                >
                  Email
                </label>
                <input
                  type="text"
                  autoComplete="email"
                  value={email}
                  onChange={e => { setEmail(e.target.value); setErrors(prev => ({ ...prev, email: undefined })) }}
                  placeholder="you@company.com"
                  className={inputBase}
                  style={{
                    ...inputStyle(!!errors.email),
                    '::placeholder': { color: 'rgba(255,255,255,0.2)' },
                  } as React.CSSProperties}
                />
                {errors.email && (
                  <p className="mt-1 text-xs" style={{ color: 'rgba(239,68,68,0.8)', fontFamily: 'Space Grotesk, sans-serif' }}>
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Password */}
              <div>
                <label
                  className="block mb-1 text-xs"
                  style={{ color: 'rgba(255,255,255,0.4)', fontFamily: 'Space Grotesk, sans-serif' }}
                >
                  Password
                </label>
                <input
                  type="password"
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                  value={password}
                  onChange={e => { setPassword(e.target.value); setErrors(prev => ({ ...prev, password: undefined })) }}
                  placeholder="••••••••"
                  className={inputBase}
                  style={inputStyle(!!errors.password)}
                />
                {errors.password && (
                  <p className="mt-1 text-xs" style={{ color: 'rgba(239,68,68,0.8)', fontFamily: 'Space Grotesk, sans-serif' }}>
                    {errors.password}
                  </p>
                )}
              </div>

              {/* Confirm (signup only) */}
              <AnimatePresence>
                {mode === 'signup' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    style={{ overflow: 'hidden' }}
                  >
                    <label
                      className="block mb-1 text-xs"
                      style={{ color: 'rgba(255,255,255,0.4)', fontFamily: 'Space Grotesk, sans-serif' }}
                    >
                      Confirm password
                    </label>
                    <input
                      type="password"
                      autoComplete="new-password"
                      value={confirm}
                      onChange={e => { setConfirm(e.target.value); setErrors(prev => ({ ...prev, confirm: undefined })) }}
                      placeholder="••••••••"
                      className={inputBase}
                      style={inputStyle(!!errors.confirm)}
                    />
                    {errors.confirm && (
                      <p className="mt-1 text-xs" style={{ color: 'rgba(239,68,68,0.8)', fontFamily: 'Space Grotesk, sans-serif' }}>
                        {errors.confirm}
                      </p>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-lg text-xs font-semibold transition-all duration-200 mt-1"
                style={{
                  background: loading ? 'rgba(255,255,255,0.7)' : '#fff',
                  color: '#0a0a0f',
                  fontFamily: 'Space Grotesk, sans-serif',
                  cursor: loading ? 'not-allowed' : 'pointer',
                }}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin w-3 h-3" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.3" />
                      <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                    </svg>
                    {mode === 'login' ? 'Signing in…' : 'Creating account…'}
                  </span>
                ) : mode === 'login' ? 'Sign in' : 'Create account'}
              </button>
            </motion.form>
          </AnimatePresence>

          {/* Divider */}
          <div className="flex items-center gap-3 my-4">
            <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />
            <span className="text-xs" style={{ color: 'rgba(255,255,255,0.2)', fontFamily: 'Space Grotesk, sans-serif' }}>
              or
            </span>
            <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />
          </div>

          {/* Guest / trial */}
          <button
            onClick={() => navigate('/chat')}
            className="w-full py-2.5 rounded-lg text-xs transition-all duration-200"
            style={{
              background: 'transparent',
              border: '1px solid rgba(255,255,255,0.08)',
              color: 'rgba(255,255,255,0.5)',
              fontFamily: 'Space Grotesk, sans-serif',
              cursor: 'pointer',
            }}
            onMouseEnter={e => {
              ;(e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.15)'
              ;(e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.7)'
            }}
            onMouseLeave={e => {
              ;(e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.08)'
              ;(e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.5)'
            }}
          >
            Continue without account
          </button>
        </div>

        <p
          className="mt-5 text-center text-xs"
          style={{ color: 'rgba(255,255,255,0.2)', fontFamily: 'Space Grotesk, sans-serif' }}
        >
          By continuing, you agree to our{' '}
          <span style={{ color: 'rgba(255,255,255,0.4)', cursor: 'pointer' }}>Terms</span>
          {' & '}
          <span style={{ color: 'rgba(255,255,255,0.4)', cursor: 'pointer' }}>Privacy Policy</span>
        </p>
      </motion.div>
    </div>
  )
}
