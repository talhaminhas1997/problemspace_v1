import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'

function useAutoResize(value: string) {
  const ref = useRef<HTMLTextAreaElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = el.scrollHeight + 'px'
  }, [value])
  return ref
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="rounded-xl p-6"
      style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}
    >
      <h2
        className="text-xs font-semibold mb-5 tracking-widest"
        style={{ color: 'rgba(255,255,255,0.4)', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.1em' }}
      >
        {title}
      </h2>
      {children}
    </motion.section>
  )
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label
      className="block mb-1.5 text-xs"
      style={{ color: 'rgba(255,255,255,0.4)', fontFamily: 'Space Grotesk, sans-serif' }}
    >
      {children}
    </label>
  )
}

const textareaBase: React.CSSProperties = {
  width: '100%',
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 8,
  color: 'rgba(255,255,255,0.85)',
  fontFamily: 'Space Grotesk, sans-serif',
  fontSize: 12,
  lineHeight: 1.7,
  padding: '10px 12px',
  resize: 'none',
  outline: 'none',
  overflowY: 'hidden',
  transition: 'border-color 0.15s',
}

const inputBase: React.CSSProperties = {
  width: '100%',
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 8,
  color: 'rgba(255,255,255,0.85)',
  fontFamily: 'Space Grotesk, sans-serif',
  fontSize: 12,
  padding: '10px 12px',
  outline: 'none',
  transition: 'border-color 0.15s',
}

export function SettingsPage() {
  const navigate = useNavigate()

  // Product context
  const [vision, setVision] = useState('We help product managers move from vague ideas to clear, validated product decisions — faster than ever before.')
  const [okrs, setOkrs] = useState('Q2 2026:\n• 10,000 active users\n• 40% week-3 retention\n• NPS ≥ 45')
  const [constraints, setConstraints] = useState('No mobile app in v1. Backend-only AI — no fine-tuned models. Ship monthly, not quarterly.')
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [saving, setSaving] = useState(false)

  const visionRef = useAutoResize(vision)
  const okrsRef = useAutoResize(okrs)
  const constraintsRef = useAutoResize(constraints)

  // Password
  const [currentPw, setCurrentPw] = useState('')
  const [newPw, setNewPw] = useState('')
  const [confirmPw, setConfirmPw] = useState('')
  const [pwError, setPwError] = useState('')
  const [pwSuccess, setPwSuccess] = useState(false)
  const [pwLoading, setPwLoading] = useState(false)

  // Export
  const [exporting, setExporting] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(false)

  const handleSaveContext = async () => {
    setSaving(true)
    await new Promise(r => setTimeout(r, 700))
    setLastSaved(new Date())
    setSaving(false)
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setPwError('')
    setPwSuccess(false)
    if (!currentPw) { setPwError('Current password is required.'); return }
    if (newPw.length < 8) { setPwError('New password must be at least 8 characters.'); return }
    if (newPw !== confirmPw) { setPwError('Passwords do not match.'); return }
    setPwLoading(true)
    await new Promise(r => setTimeout(r, 800))
    setPwLoading(false)
    setPwSuccess(true)
    setCurrentPw(''); setNewPw(''); setConfirmPw('')
  }

  const handleExport = async () => {
    setExporting(true)
    await new Promise(r => setTimeout(r, 600))
    const data = {
      exportedAt: new Date().toISOString(),
      productContext: { vision, okrs, constraints },
      projects: [],
      decisions: [],
      documents: [],
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'problemspace-export.json'
    a.click()
    URL.revokeObjectURL(url)
    setExporting(false)
  }

  return (
    <div className="min-h-screen" style={{ background: '#0a0a0f', fontFamily: 'Space Grotesk, sans-serif' }}>
      {/* Top bar */}
      <div
        className="sticky top-0 z-10 flex items-center gap-4 px-6 py-3"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(10,10,15,0.95)', backdropFilter: 'blur(8px)' }}
      >
        <button
          onClick={() => navigate('/chat')}
          className="flex items-center gap-1.5 text-xs transition-colors"
          style={{ color: 'rgba(255,255,255,0.35)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Space Grotesk, sans-serif' }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.7)' }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.35)' }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/></svg>
          Back to chat
        </button>
        <span className="text-xs font-semibold" style={{ color: 'rgba(255,255,255,0.7)' }}>Settings</span>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-8 space-y-5">

        {/* ── Product Context ── */}
        <Section title="PRODUCT CONTEXT">
          <div className="space-y-4">
            <div>
              <FieldLabel>Vision</FieldLabel>
              <textarea
                ref={visionRef}
                value={vision}
                onChange={e => setVision(e.target.value)}
                style={textareaBase}
                onFocus={e => { (e.currentTarget as HTMLTextAreaElement).style.borderColor = 'rgba(255,255,255,0.15)' }}
                onBlur={e => { (e.currentTarget as HTMLTextAreaElement).style.borderColor = 'rgba(255,255,255,0.08)' }}
              />
            </div>
            <div>
              <FieldLabel>OKRs</FieldLabel>
              <textarea
                ref={okrsRef}
                value={okrs}
                onChange={e => setOkrs(e.target.value)}
                style={textareaBase}
                onFocus={e => { (e.currentTarget as HTMLTextAreaElement).style.borderColor = 'rgba(255,255,255,0.15)' }}
                onBlur={e => { (e.currentTarget as HTMLTextAreaElement).style.borderColor = 'rgba(255,255,255,0.08)' }}
              />
            </div>
            <div>
              <FieldLabel>Known constraints</FieldLabel>
              <textarea
                ref={constraintsRef}
                value={constraints}
                onChange={e => setConstraints(e.target.value)}
                style={textareaBase}
                onFocus={e => { (e.currentTarget as HTMLTextAreaElement).style.borderColor = 'rgba(255,255,255,0.15)' }}
                onBlur={e => { (e.currentTarget as HTMLTextAreaElement).style.borderColor = 'rgba(255,255,255,0.08)' }}
              />
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={handleSaveContext}
                disabled={saving}
                className="px-4 py-2 rounded-lg text-xs font-medium transition-all"
                style={{
                  background: saving ? 'rgba(255,255,255,0.6)' : '#fff',
                  color: '#0a0a0f',
                  border: 'none',
                  cursor: saving ? 'not-allowed' : 'pointer',
                  fontFamily: 'Space Grotesk, sans-serif',
                }}
              >
                {saving ? 'Saving…' : 'Save'}
              </button>
              {lastSaved && !saving && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-xs"
                  style={{ color: 'rgba(255,255,255,0.3)', fontFamily: 'JetBrains Mono, monospace' }}
                >
                  Last saved {lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </motion.span>
              )}
            </div>
          </div>
        </Section>

        {/* ── Notion Integration ── */}
        <Section title="INTEGRATIONS">
          <div
            className="rounded-lg p-4"
            style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}
          >
            <div className="flex items-start gap-3">
              {/* Notion icon placeholder */}
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                <span className="text-sm">N</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-medium" style={{ color: 'rgba(255,255,255,0.75)' }}>Notion</span>
                  <span
                    className="px-1.5 py-0.5 rounded text-xs"
                    style={{
                      background: 'rgba(249,115,22,0.1)',
                      border: '1px solid rgba(249,115,22,0.2)',
                      color: 'rgba(249,115,22,0.8)',
                      fontFamily: 'JetBrains Mono, monospace',
                      fontSize: 10,
                    }}
                  >
                    Coming soon
                  </span>
                </div>
                <p className="text-xs leading-relaxed mb-3" style={{ color: 'rgba(255,255,255,0.35)' }}>
                  When connected, Problemspace will sync your decisions and build briefs directly into your Notion workspace — automatically creating pages, updating databases, and keeping everything in one place.
                </p>
                <div className="space-y-1">
                  {['Auto-create decision logs in your Notion database', 'Push structured output blocks as formatted pages', 'Two-way sync for linked documents'].map((feat, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="w-1 h-1 rounded-full flex-shrink-0" style={{ background: 'rgba(255,255,255,0.2)' }} />
                      <span className="text-xs" style={{ color: 'rgba(255,255,255,0.3)', fontFamily: 'Space Grotesk, sans-serif' }}>{feat}</span>
                    </div>
                  ))}
                </div>
                <button
                  disabled
                  className="mt-3 px-3 py-1.5 rounded-lg text-xs"
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    color: 'rgba(255,255,255,0.25)',
                    cursor: 'not-allowed',
                    fontFamily: 'Space Grotesk, sans-serif',
                  }}
                >
                  Connect Notion
                </button>
              </div>
            </div>
          </div>
        </Section>

        {/* ── Account ── */}
        <Section title="ACCOUNT">
          <form onSubmit={handleChangePassword} className="space-y-3">
            <div>
              <FieldLabel>Current password</FieldLabel>
              <input
                type="password"
                value={currentPw}
                onChange={e => { setCurrentPw(e.target.value); setPwError(''); setPwSuccess(false) }}
                placeholder="••••••••"
                style={inputBase}
                onFocus={e => { (e.currentTarget as HTMLInputElement).style.borderColor = 'rgba(255,255,255,0.15)' }}
                onBlur={e => { (e.currentTarget as HTMLInputElement).style.borderColor = 'rgba(255,255,255,0.08)' }}
              />
            </div>
            <div>
              <FieldLabel>New password</FieldLabel>
              <input
                type="password"
                value={newPw}
                onChange={e => { setNewPw(e.target.value); setPwError(''); setPwSuccess(false) }}
                placeholder="Minimum 8 characters"
                style={inputBase}
                onFocus={e => { (e.currentTarget as HTMLInputElement).style.borderColor = 'rgba(255,255,255,0.15)' }}
                onBlur={e => { (e.currentTarget as HTMLInputElement).style.borderColor = 'rgba(255,255,255,0.08)' }}
              />
            </div>
            <div>
              <FieldLabel>Confirm new password</FieldLabel>
              <input
                type="password"
                value={confirmPw}
                onChange={e => { setConfirmPw(e.target.value); setPwError(''); setPwSuccess(false) }}
                placeholder="••••••••"
                style={inputBase}
                onFocus={e => { (e.currentTarget as HTMLInputElement).style.borderColor = 'rgba(255,255,255,0.15)' }}
                onBlur={e => { (e.currentTarget as HTMLInputElement).style.borderColor = 'rgba(255,255,255,0.08)' }}
              />
            </div>

            {pwError && (
              <p className="text-xs" style={{ color: 'rgba(239,68,68,0.8)', fontFamily: 'Space Grotesk, sans-serif' }}>{pwError}</p>
            )}
            {pwSuccess && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-xs"
                style={{ color: 'rgba(34,197,94,0.8)', fontFamily: 'Space Grotesk, sans-serif' }}
              >
                Password updated successfully.
              </motion.p>
            )}

            <button
              type="submit"
              disabled={pwLoading}
              className="px-4 py-2 rounded-lg text-xs font-medium transition-all"
              style={{
                background: 'transparent',
                border: '1px solid rgba(255,255,255,0.12)',
                color: 'rgba(255,255,255,0.7)',
                cursor: pwLoading ? 'not-allowed' : 'pointer',
                fontFamily: 'Space Grotesk, sans-serif',
              }}
              onMouseEnter={e => { if (!pwLoading) (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.25)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.12)' }}
            >
              {pwLoading ? 'Updating…' : 'Update password'}
            </button>
          </form>
        </Section>

        {/* ── Data & Privacy ── */}
        <Section title="DATA & PRIVACY">
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-medium mb-1" style={{ color: 'rgba(255,255,255,0.7)' }}>Export all data</p>
                <p className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>
                  Download everything — projects, chats, decisions, and documents — as a structured JSON file.
                </p>
              </div>
              <button
                onClick={handleExport}
                disabled={exporting}
                className="flex-shrink-0 px-3 py-1.5 rounded-lg text-xs transition-all"
                style={{
                  background: 'transparent',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: 'rgba(255,255,255,0.5)',
                  cursor: exporting ? 'not-allowed' : 'pointer',
                  fontFamily: 'Space Grotesk, sans-serif',
                  whiteSpace: 'nowrap',
                }}
                onMouseEnter={e => { if (!exporting) (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.2)' }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.1)' }}
              >
                {exporting ? 'Preparing…' : 'Export JSON'}
              </button>
            </div>

            <div className="h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />

            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-medium mb-1" style={{ color: 'rgba(239,68,68,0.7)' }}>Delete account</p>
                <p className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>
                  Permanently delete your account and all associated data. This cannot be undone.
                </p>
              </div>
              {!deleteConfirm ? (
                <button
                  onClick={() => setDeleteConfirm(true)}
                  className="flex-shrink-0 px-3 py-1.5 rounded-lg text-xs transition-all"
                  style={{
                    background: 'transparent',
                    border: '1px solid rgba(239,68,68,0.2)',
                    color: 'rgba(239,68,68,0.6)',
                    cursor: 'pointer',
                    fontFamily: 'Space Grotesk, sans-serif',
                    whiteSpace: 'nowrap',
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(239,68,68,0.4)' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(239,68,68,0.2)' }}
                >
                  Delete account
                </button>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center gap-2 flex-shrink-0"
                >
                  <span className="text-xs" style={{ color: 'rgba(255,255,255,0.4)', fontFamily: 'Space Grotesk, sans-serif' }}>Sure?</span>
                  <button
                    onClick={() => setDeleteConfirm(false)}
                    className="px-2 py-1 rounded text-xs"
                    style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontFamily: 'Space Grotesk, sans-serif' }}
                  >
                    Cancel
                  </button>
                  <button
                    className="px-2 py-1 rounded text-xs"
                    style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: 'rgba(239,68,68,0.9)', cursor: 'pointer', fontFamily: 'Space Grotesk, sans-serif' }}
                  >
                    Confirm
                  </button>
                </motion.div>
              )}
            </div>
          </div>
        </Section>

      </div>
    </div>
  )
}
