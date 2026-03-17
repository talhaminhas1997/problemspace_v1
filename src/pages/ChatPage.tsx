import { useState, useRef, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'

// ─── Types ────────────────────────────────────────────────────────────────────

type Phase = 'Framing' | 'Planning' | 'Ideation' | 'Complete'
const PHASES: Phase[] = ['Framing', 'Planning', 'Ideation', 'Complete']

type MessageRole = 'agent' | 'user'

interface Attachment {
  id: string
  name: string
  type: string
}

interface StructuredBlock {
  kind: 'problem' | 'storymap' | 'brief' | 'risk'
  title: string
  content: string
}

interface Message {
  id: string
  role: MessageRole
  text: string
  ts: Date
  streaming?: boolean
  structuredBlock?: StructuredBlock
  showDiscoveryPrompt?: boolean
  attachments?: Attachment[]
}

type ChatType = 'free' | 'discovery'

interface Chat {
  id: string
  name: string
  ts: Date
  type: ChatType
  messages: Message[]
}

interface Project {
  id: string
  name: string
  expanded: boolean
  chats: Chat[]
}

interface Decision {
  id: string
  text: string
  ts: Date
}

interface Doc {
  id: string
  title: string
  ts: Date
}

interface ContextSource {
  id: string
  label: string
  active: boolean
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function relativeTime(date: Date): string {
  const diff = (Date.now() - date.getTime()) / 1000
  if (diff < 60) return 'just now'
  if (diff < 3600) return `${Math.round(diff / 60)}m ago`
  if (diff < 86400) return `${Math.round(diff / 3600)}h ago`
  return `${Math.round(diff / 86400)}d ago`
}

function uid() {
  return Math.random().toString(36).slice(2)
}

// Discovery chat constants
const DISCOVERY_FIRST_MESSAGE =
  "What's on your mind — are you starting from a problem, an idea, or something someone else handed you?"

const DISCOVERY_AGENT_RESPONSES = [
  "Got it. Tell me more about the users this affects — who are they and what are they trying to accomplish?",
  "Interesting. What does success look like here? Is there a metric you're trying to move?",
  "That's helpful context. Are there any known constraints — technical, budget, or timeline?",
  "Makes sense. Have you validated any part of this with real users yet?",
]

// Free chat constants
const FREE_FIRST_MESSAGE =
  "What are you working on? Ask me anything — or share a document, note, or source to explore."

const FREE_AGENT_RESPONSES = [
  "Interesting. Tell me more.",
  "Got it. What's the context around that?",
  "That makes sense. What are you trying to figure out?",
  "Sure. Anything specific you want me to dig into?",
  "Happy to help with that. What would be most useful right now?",
]

const DISCOVERY_PROMPT = "I'm noticing a pattern here — want me to run you through a structured discovery cycle?"

const STRUCTURED_OUTPUT: StructuredBlock = {
  kind: 'problem',
  title: 'Problem Statement',
  content: `**Users:** Product managers at early-stage startups\n**Problem:** Lack of structured methodology for product discovery leads to building features that don't address core user needs\n**Impact:** Wasted engineering cycles, delayed product-market fit\n**Opportunity:** An AI-guided discovery workflow that surfaces assumptions, maps user journeys, and produces actionable briefs`,
}

const INITIAL_PROJECTS: Project[] = [
  {
    id: uid(),
    name: 'Discovery — Q2',
    expanded: true,
    chats: [
      { id: uid(), name: 'Onboarding flow rethink', ts: new Date(Date.now() - 7200000), type: 'discovery' as ChatType, messages: [] },
      { id: uid(), name: 'Retention drop analysis', ts: new Date(Date.now() - 86400000), type: 'free' as ChatType, messages: [] },
    ],
  },
  {
    id: uid(),
    name: 'Mobile v2',
    expanded: false,
    chats: [
      { id: uid(), name: 'Push notifications strategy', ts: new Date(Date.now() - 3 * 86400000), type: 'free' as ChatType, messages: [] },
    ],
  },
  {
    id: uid(),
    name: 'Experiments',
    expanded: false,
    chats: [],
  },
]

const INITIAL_DECISIONS: Decision[] = [
  { id: uid(), text: 'Shipping without push notifications in v1', ts: new Date(Date.now() - 2 * 86400000) },
  { id: uid(), text: 'Target B2B PMs, not individual contributors', ts: new Date(Date.now() - 5 * 86400000) },
]

const INITIAL_DOCS: Doc[] = [
  { id: uid(), title: 'PM Interview Notes — March batch', ts: new Date(Date.now() - 86400000) },
  { id: uid(), title: 'Competitive landscape snapshot', ts: new Date(Date.now() - 3 * 86400000) },
  { id: uid(), title: 'OKR framework draft', ts: new Date(Date.now() - 7 * 86400000) },
  { id: uid(), title: 'Design system v0.2', ts: new Date(Date.now() - 10 * 86400000) },
]

const INITIAL_SOURCES: ContextSource[] = [
  { id: uid(), label: 'Figma workspace', active: true },
  { id: uid(), label: 'Linear project', active: false },
  { id: uid(), label: 'Notion docs', active: false },
]

// ─── Sub-components ────────────────────────────────────────────────────────────

function StructuredOutputBlock({ block }: { block: StructuredBlock }) {
  const accent =
    block.kind === 'problem'
      ? { border: 'rgba(168,85,247,0.3)', bg: 'rgba(168,85,247,0.06)', label: 'rgba(168,85,247,0.8)', dot: '#a855f7' }
      : block.kind === 'storymap'
      ? { border: 'rgba(59,130,246,0.3)', bg: 'rgba(59,130,246,0.06)', label: 'rgba(59,130,246,0.8)', dot: '#3b82f6' }
      : block.kind === 'brief'
      ? { border: 'rgba(20,184,166,0.3)', bg: 'rgba(20,184,166,0.06)', label: 'rgba(20,184,166,0.8)', dot: '#14b8a6' }
      : { border: 'rgba(249,115,22,0.3)', bg: 'rgba(249,115,22,0.06)', label: 'rgba(249,115,22,0.8)', dot: '#f97316' }

  const copyMarkdown = () => {
    navigator.clipboard.writeText(`# ${block.title}\n\n${block.content.replace(/\*\*/g, '')}`)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="rounded-lg p-4 mt-2"
      style={{ background: accent.bg, border: `1px solid ${accent.border}` }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: accent.dot }} />
          <span
            className="text-xs font-semibold tracking-wide"
            style={{ color: accent.label, fontFamily: 'JetBrains Mono, monospace' }}
          >
            {block.title}
          </span>
        </div>
        <button
          onClick={copyMarkdown}
          className="text-xs px-2 py-0.5 rounded transition-colors duration-150"
          style={{
            color: 'rgba(255,255,255,0.4)',
            border: '1px solid rgba(255,255,255,0.08)',
            fontFamily: 'Space Grotesk, sans-serif',
            background: 'transparent',
            cursor: 'pointer',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.7)' }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.4)' }}
        >
          Export
        </button>
      </div>
      <div className="space-y-1.5">
        {block.content.split('\n').map((line, i) => (
          <p key={i} className="text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.7)', fontFamily: 'Space Grotesk, sans-serif' }}>
            {line.replace(/\*\*(.*?)\*\*/g, '$1')}
          </p>
        ))}
      </div>
    </motion.div>
  )
}

function TypewriterText({ text, onDone }: { text: string; onDone?: () => void }) {
  const [displayed, setDisplayed] = useState('')
  const words = text.split(' ')
  const wordIdx = useRef(0)

  useEffect(() => {
    wordIdx.current = 0
    setDisplayed('')
    const interval = setInterval(() => {
      if (wordIdx.current >= words.length) {
        clearInterval(interval)
        onDone?.()
        return
      }
      setDisplayed(words.slice(0, wordIdx.current + 1).join(' '))
      wordIdx.current++
    }, 60)
    return () => clearInterval(interval)
  }, [text]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <span>
      {displayed}
      {displayed.length < text.length && (
        <span className="inline-block w-0.5 h-3 ml-0.5 align-middle animate-pulse" style={{ background: 'rgba(255,255,255,0.4)' }} />
      )}
    </span>
  )
}

function AttachmentChip({ att, onRemove }: { att: Attachment; onRemove: () => void }) {
  const icon =
    att.type.includes('pdf') ? '📄' :
    att.type.includes('image') ? '🖼' :
    att.type.includes('video') ? '🎥' : '📎'

  return (
    <div
      className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs"
      style={{
        background: 'rgba(255,255,255,0.06)',
        border: '1px solid rgba(255,255,255,0.1)',
        color: 'rgba(255,255,255,0.7)',
        fontFamily: 'Space Grotesk, sans-serif',
      }}
    >
      <span>{icon}</span>
      <span>{att.name}</span>
      <button
        onClick={onRemove}
        className="ml-1 opacity-40 hover:opacity-80 transition-opacity"
        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', padding: 0 }}
      >
        ×
      </button>
    </div>
  )
}

function WaveformBars() {
  return (
    <span className="inline-flex items-end gap-0.5 h-4">
      {[3, 6, 10, 7, 4, 8, 5].map((h, i) => (
        <motion.span
          key={i}
          className="w-0.5 rounded-full"
          style={{ background: 'rgba(239,68,68,0.8)', height: h }}
          animate={{ scaleY: [1, 2.5, 1] }}
          transition={{ duration: 0.6, delay: i * 0.08, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}
    </span>
  )
}

function NewChatPicker({ onSelect, onClose, anchorRect }: { onSelect: (type: ChatType) => void; onClose: () => void; anchorRect: DOMRect | null }) {
  const top = anchorRect ? anchorRect.bottom + 4 : 0
  const left = anchorRect ? anchorRect.left : 0
  const width = anchorRect ? anchorRect.width : 200

  return createPortal(
    <>
      {/* backdrop */}
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, y: -4, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -4, scale: 0.97 }}
        transition={{ duration: 0.15 }}
        className="fixed z-50 rounded-xl p-2 space-y-1"
        style={{ top, left, width: Math.max(width, 220), background: '#16161e', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 12px 32px rgba(0,0,0,0.6)' }}
      >
        <button
          onClick={() => onSelect('free')}
          className="w-full text-left p-2.5 rounded-lg transition-colors group"
          style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.05)' }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent' }}
        >
          <div className="flex items-center gap-2 mb-0.5">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            <span className="text-xs font-medium" style={{ color: 'rgba(255,255,255,0.8)', fontFamily: 'Space Grotesk, sans-serif' }}>Free chat</span>
          </div>
          <p className="text-xs pl-5" style={{ color: 'rgba(255,255,255,0.3)', fontFamily: 'Space Grotesk, sans-serif' }}>
            Ask questions, explore sources, brainstorm freely
          </p>
        </button>

        <button
          onClick={() => onSelect('discovery')}
          className="w-full text-left p-2.5 rounded-lg transition-colors"
          style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.05)' }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent' }}
        >
          <div className="flex items-center gap-2 mb-0.5">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(168,85,247,0.7)" strokeWidth="2"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
            <span className="text-xs font-medium" style={{ color: 'rgba(255,255,255,0.8)', fontFamily: 'Space Grotesk, sans-serif' }}>Discovery cycle</span>
          </div>
          <p className="text-xs pl-5" style={{ color: 'rgba(255,255,255,0.3)', fontFamily: 'Space Grotesk, sans-serif' }}>
            Structured Framing → Planning → Ideation flow
          </p>
        </button>
      </motion.div>
    </>,
    document.body
  )
}

// ─── Main component ────────────────────────────────────────────────────────────

export function ChatPage() {
  const navigate = useNavigate()

  // Routing / layout state
  const [rightPanelOpen, setRightPanelOpen] = useState(true)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  // Projects / chats
  const [projects, setProjects] = useState<Project[]>(INITIAL_PROJECTS)
  const [activeProjectId, setActiveProjectId] = useState<string>(INITIAL_PROJECTS[0].id)
  const [activeChatId, setActiveChatId] = useState<string>(INITIAL_PROJECTS[0].chats[0].id)

  // Renaming
  const [renamingId, setRenamingId] = useState<string | null>(null)
  const [renameValue, setRenameValue] = useState('')

  // 3-dot menu
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null)

  // New chat type picker
  const [newChatPickerProjectId, setNewChatPickerProjectId] = useState<string | null>(null)
  const [newChatPickerAnchor, setNewChatPickerAnchor] = useState<DOMRect | null>(null)

  // Active chat type (drives phase bar, responses, first message)
  const [activeChatType, setActiveChatType] = useState<ChatType>('discovery')

  // Chat messages
  const [messages, setMessages] = useState<Message[]>([])
  const [, setPhase] = useState<Phase>('Framing')
  const [phaseIdx, setPhaseIdx] = useState(0)
  const [inputText, setInputText] = useState('')
  const [attachments, setAttachments] = useState<Attachment[]>([])
  const [recording, setRecording] = useState(false)
  const [agentResponseIdx, setAgentResponseIdx] = useState(0)
  const [showMoreDecisions, setShowMoreDecisions] = useState(false)
  const [showMoreDocs, setShowMoreDocs] = useState(false)
  const [contextCollapsed, setContextCollapsed] = useState(false)

  // Context panel state
  const [decisions] = useState<Decision[]>(INITIAL_DECISIONS)
  const [docs] = useState<Doc[]>(INITIAL_DOCS)
  const [sources] = useState<ContextSource[]>(INITIAL_SOURCES)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const renameInputRef = useRef<HTMLInputElement>(null)

  // Auto-send first agent message
  useEffect(() => {
    const timer = setTimeout(() => {
      const firstMsg: Message = {
        id: uid(),
        role: 'agent',
        text: activeChatType === 'discovery' ? DISCOVERY_FIRST_MESSAGE : FREE_FIRST_MESSAGE,
        ts: new Date(),
        streaming: true,
      }
      setMessages([firstMsg])
    }, 400)
    return () => clearTimeout(timer)
  }, [activeChatId, activeChatType])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Rename focus
  useEffect(() => {
    if (renamingId) renameInputRef.current?.focus()
  }, [renamingId])

  const advancePhase = useCallback(() => {
    setPhaseIdx(prev => {
      const next = Math.min(prev + 1, PHASES.length - 1)
      setPhase(PHASES[next])
      return next
    })
  }, [])

  const sendMessage = useCallback(async () => {
    const text = inputText.trim()
    if (!text && attachments.length === 0) return

    const userMsg: Message = {
      id: uid(),
      role: 'user',
      text,
      ts: new Date(),
      attachments: attachments.length > 0 ? [...attachments] : undefined,
    }
    setMessages(prev => [...prev, userMsg])
    setInputText('')
    setAttachments([])

    const userMsgCount = messages.filter(m => m.role === 'user').length + 1

    await new Promise(r => setTimeout(r, 600))

    let agentMsg: Message

    if (activeChatType === 'discovery') {
      // Advance phase every 2 user messages
      if (userMsgCount % 2 === 0) advancePhase()

      const isDiscoveryPrompt = userMsgCount === 5
      const showStructured = userMsgCount === 6

      const agentText = isDiscoveryPrompt
        ? DISCOVERY_PROMPT
        : showStructured
        ? "I've generated a Problem Statement based on our conversation:"
        : DISCOVERY_AGENT_RESPONSES[agentResponseIdx % DISCOVERY_AGENT_RESPONSES.length]

      agentMsg = {
        id: uid(),
        role: 'agent',
        text: agentText,
        ts: new Date(),
        streaming: true,
        showDiscoveryPrompt: isDiscoveryPrompt,
        structuredBlock: showStructured ? STRUCTURED_OUTPUT : undefined,
      }

      if (!isDiscoveryPrompt && !showStructured) {
        setAgentResponseIdx(prev => prev + 1)
      }
    } else {
      // Free chat — just natural responses, no phases or structured blocks
      agentMsg = {
        id: uid(),
        role: 'agent',
        text: FREE_AGENT_RESPONSES[agentResponseIdx % FREE_AGENT_RESPONSES.length],
        ts: new Date(),
        streaming: true,
      }
      setAgentResponseIdx(prev => prev + 1)
    }

    setMessages(prev => [...prev, agentMsg])
  }, [inputText, attachments, messages, agentResponseIdx, advancePhase, activeChatType])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const files = Array.from(e.dataTransfer.files)
    setAttachments(prev => [...prev, ...files.map(f => ({ id: uid(), name: f.name, type: f.type }))])
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setAttachments(prev => [...prev, ...files.map(f => ({ id: uid(), name: f.name, type: f.type }))])
    e.target.value = ''
  }

  // Project actions
  const toggleProject = (pid: string) => {
    setProjects(prev => prev.map(p => p.id === pid ? { ...p, expanded: !p.expanded } : p))
  }

  const createChat = (pid: string, type: ChatType) => {
    const defaultName = type === 'discovery' ? 'Discovery session' : 'New chat'
    const chat: Chat = { id: uid(), name: defaultName, ts: new Date(), type, messages: [] }
    setProjects(prev => prev.map(p => p.id === pid ? { ...p, chats: [...p.chats, chat] } : p))
    setActiveProjectId(pid)
    setActiveChatId(chat.id)
    setActiveChatType(type)
    setMessages([])
    setPhase('Framing')
    setPhaseIdx(0)
    setAgentResponseIdx(0)
    setNewChatPickerProjectId(null)
  }

  const deleteProject = (pid: string) => {
    setProjects(prev => prev.filter(p => p.id !== pid))
    setMenuOpenId(null)
  }

  const startRename = (id: string, currentName: string) => {
    setRenamingId(id)
    setRenameValue(currentName)
    setMenuOpenId(null)
  }

  const commitRename = () => {
    if (!renamingId || !renameValue.trim()) { setRenamingId(null); return }
    setProjects(prev =>
      prev.map(p => {
        if (p.id === renamingId) return { ...p, name: renameValue.trim() }
        return {
          ...p,
          chats: p.chats.map(c => c.id === renamingId ? { ...c, name: renameValue.trim() } : c),
        }
      })
    )
    setRenamingId(null)
  }

  const selectChat = (pid: string, cid: string) => {
    const project = projects.find(p => p.id === pid)
    const chat = project?.chats.find(c => c.id === cid)
    setActiveProjectId(pid)
    setActiveChatId(cid)
    setActiveChatType(chat?.type ?? 'free')
    setMessages([])
    setPhase('Framing')
    setPhaseIdx(0)
    setAgentResponseIdx(0)
  }

  return (
    <div
      className="flex h-screen overflow-hidden"
      style={{ background: '#0a0a0f', fontFamily: 'Space Grotesk, sans-serif' }}
      onDragOver={e => e.preventDefault()}
      onDrop={handleDrop}
    >
      {/* ── Sidebar ── */}
      <motion.aside
        animate={{ width: sidebarCollapsed ? 48 : 224 }}
        transition={{ duration: 0.25, ease: 'easeInOut' }}
        className="flex-shrink-0 flex flex-col overflow-hidden"
        style={{ borderRight: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.01)' }}
      >
        {/* Sidebar header */}
        <div className="flex items-center justify-between px-3 py-3 flex-shrink-0" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          {!sidebarCollapsed && (
            <span className="text-xs font-semibold" style={{ color: 'rgba(255,255,255,0.8)' }}>
              problemspace
            </span>
          )}
          <button
            onClick={() => setSidebarCollapsed(v => !v)}
            className="p-1 rounded transition-colors"
            style={{ color: 'rgba(255,255,255,0.3)', background: 'transparent', border: 'none', cursor: 'pointer' }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.7)' }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.3)' }}
          >
            {sidebarCollapsed ? (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6"/></svg>
            )}
          </button>
        </div>

        {!sidebarCollapsed && (
          <div className="flex-1 overflow-y-auto py-2">
            {projects.map(project => (
              <div key={project.id}>
                {/* Project row */}
                <div
                  className="group flex items-center justify-between px-3 py-1.5 cursor-pointer rounded-md mx-1"
                  style={{ background: activeProjectId === project.id ? 'rgba(255,255,255,0.05)' : 'transparent' }}
                  onMouseEnter={e => { if (activeProjectId !== project.id) (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.03)' }}
                  onMouseLeave={e => { if (activeProjectId !== project.id) (e.currentTarget as HTMLDivElement).style.background = 'transparent' }}
                  onDoubleClick={() => startRename(project.id, project.name)}
                  onClick={() => { toggleProject(project.id); setActiveProjectId(project.id) }}
                >
                  {renamingId === project.id ? (
                    <input
                      ref={renameInputRef}
                      value={renameValue}
                      onChange={e => setRenameValue(e.target.value)}
                      onBlur={commitRename}
                      onKeyDown={e => { if (e.key === 'Enter') commitRename(); if (e.key === 'Escape') setRenamingId(null) }}
                      className="flex-1 bg-transparent outline-none text-xs"
                      style={{ color: 'rgba(255,255,255,0.9)', fontFamily: 'Space Grotesk, sans-serif' }}
                      onClick={e => e.stopPropagation()}
                    />
                  ) : (
                    <>
                      <div className="flex items-center gap-1.5 flex-1 min-w-0">
                        <svg
                          width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                          style={{ color: 'rgba(255,255,255,0.3)', flexShrink: 0, transform: project.expanded ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.15s' }}
                        >
                          <path d="M9 18l6-6-6-6"/>
                        </svg>
                        <span className="text-xs truncate" style={{ color: 'rgba(255,255,255,0.7)' }}>
                          {project.name}
                        </span>
                      </div>
                      <div className="relative">
                        <button
                          onClick={e => { e.stopPropagation(); setMenuOpenId(menuOpenId === project.id ? null : project.id) }}
                          className="opacity-0 group-hover:opacity-100 p-0.5 rounded transition-opacity"
                          style={{ color: 'rgba(255,255,255,0.4)', background: 'transparent', border: 'none', cursor: 'pointer' }}
                        >
                          ···
                        </button>
                        <AnimatePresence>
                          {menuOpenId === project.id && (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.95 }}
                              transition={{ duration: 0.12 }}
                              className="absolute right-0 top-5 z-50 rounded-lg py-1 w-32"
                              style={{ background: '#1a1a24', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 8px 24px rgba(0,0,0,0.5)' }}
                            >
                              <button
                                className="w-full text-left px-3 py-1.5 text-xs transition-colors"
                                style={{ color: 'rgba(255,255,255,0.7)', background: 'transparent', border: 'none', cursor: 'pointer', fontFamily: 'Space Grotesk, sans-serif' }}
                                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.06)' }}
                                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent' }}
                                onClick={e => { e.stopPropagation(); startRename(project.id, project.name) }}
                              >
                                Rename
                              </button>
                              <button
                                className="w-full text-left px-3 py-1.5 text-xs transition-colors"
                                style={{ color: 'rgba(239,68,68,0.8)', background: 'transparent', border: 'none', cursor: 'pointer', fontFamily: 'Space Grotesk, sans-serif' }}
                                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(239,68,68,0.08)' }}
                                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent' }}
                                onClick={e => { e.stopPropagation(); deleteProject(project.id) }}
                              >
                                Delete
                              </button>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </>
                  )}
                </div>

                {/* Chats under project */}
                <AnimatePresence>
                  {project.expanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      style={{ overflow: 'hidden' }}
                    >
                      {project.chats.length === 0 ? (
                        <div className="pl-8 pr-3 py-1.5">
                          <span className="text-xs" style={{ color: 'rgba(255,255,255,0.2)' }}>No chats yet</span>
                        </div>
                      ) : (
                        project.chats.map(chat => (
                          <div
                            key={chat.id}
                            className="group flex items-center justify-between pl-6 pr-3 py-1 cursor-pointer rounded-md mx-1"
                            style={{
                              background: activeChatId === chat.id ? 'rgba(255,255,255,0.06)' : 'transparent',
                            }}
                            onMouseEnter={e => { if (activeChatId !== chat.id) (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.03)' }}
                            onMouseLeave={e => { if (activeChatId !== chat.id) (e.currentTarget as HTMLDivElement).style.background = 'transparent' }}
                            onClick={() => selectChat(project.id, chat.id)}
                            onDoubleClick={() => startRename(chat.id, chat.name)}
                          >
                            {renamingId === chat.id ? (
                              <input
                                ref={renameInputRef}
                                value={renameValue}
                                onChange={e => setRenameValue(e.target.value)}
                                onBlur={commitRename}
                                onKeyDown={e => { if (e.key === 'Enter') commitRename(); if (e.key === 'Escape') setRenamingId(null) }}
                                className="flex-1 bg-transparent outline-none text-xs"
                                style={{ color: 'rgba(255,255,255,0.9)', fontFamily: 'Space Grotesk, sans-serif' }}
                                onClick={e => e.stopPropagation()}
                              />
                            ) : (
                              <>
                                {chat.type === 'discovery' && (
                                  <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="rgba(168,85,247,0.5)" strokeWidth="2" style={{ flexShrink: 0, marginRight: 2 }}><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
                                )}
                                <span className="text-xs truncate flex-1" style={{ color: activeChatId === chat.id ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.45)' }}>
                                  {chat.name}
                                </span>
                                <span className="text-xs ml-1 flex-shrink-0" style={{ color: 'rgba(255,255,255,0.2)', fontFamily: 'JetBrains Mono, monospace', fontSize: 10 }}>
                                  {relativeTime(chat.ts)}
                                </span>
                              </>
                            )}
                          </div>
                        ))
                      )}

                      {/* New Chat button + picker */}
                      {activeProjectId === project.id && (
                        <div className="relative mx-1">
                          <button
                            onClick={e => { e.stopPropagation(); const rect = (e.currentTarget as HTMLButtonElement).getBoundingClientRect(); setNewChatPickerAnchor(rect); setNewChatPickerProjectId(newChatPickerProjectId === project.id ? null : project.id) }}
                            className="flex items-center gap-1.5 pl-6 pr-3 py-1 w-full text-left rounded-md transition-colors"
                            style={{ color: 'rgba(255,255,255,0.25)', background: 'transparent', border: 'none', cursor: 'pointer', fontFamily: 'Space Grotesk, sans-serif' }}
                            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.5)' }}
                            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.25)' }}
                          >
                            <span className="text-sm leading-none">+</span>
                            <span className="text-xs">New chat</span>
                          </button>
                          <AnimatePresence>
                            {newChatPickerProjectId === project.id && (
                              <NewChatPicker
                                onSelect={(type) => createChat(project.id, type)}
                                onClose={() => setNewChatPickerProjectId(null)}
                                anchorRect={newChatPickerAnchor}
                              />
                            )}
                          </AnimatePresence>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        )}

        {/* Bottom nav links */}
        {!sidebarCollapsed && (
          <div className="flex-shrink-0 px-3 py-3" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <button
              onClick={() => navigate('/settings')}
              className="flex items-center gap-2 w-full px-2 py-1.5 rounded text-xs transition-colors"
              style={{ color: 'rgba(255,255,255,0.35)', background: 'transparent', border: 'none', cursor: 'pointer', fontFamily: 'Space Grotesk, sans-serif' }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.6)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.35)' }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
              Settings
            </button>
          </div>
        )}
      </motion.aside>

      {/* ── Chat area ── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Phase bar — discovery only */}
        <div
          className="flex-shrink-0 flex items-center gap-2 px-6 py-2.5"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', minHeight: 40 }}
        >
          {activeChatType === 'discovery' && PHASES.map((p, i) => {
            const isPast = i < phaseIdx
            const isCurrent = i === phaseIdx
            return (
              <div key={p} className="flex items-center gap-2">
                {i > 0 && (
                  <div
                    className="w-6 h-px transition-all duration-500"
                    style={{ background: isPast || isCurrent ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.1)' }}
                  />
                )}
                <motion.span
                  animate={{ opacity: isCurrent ? 1 : isPast ? 0.5 : 0.2 }}
                  transition={{ duration: 0.4 }}
                  className="text-xs font-medium"
                  style={{
                    color: isCurrent ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.4)',
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: 11,
                  }}
                >
                  {p}
                </motion.span>
              </div>
            )
          })}

          <div className="flex-1" />

          {/* Toggle right panel */}
          <button
            onClick={() => setRightPanelOpen(v => !v)}
            className="text-xs px-2 py-1 rounded transition-colors"
            style={{
              color: rightPanelOpen ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.3)',
              background: rightPanelOpen ? 'rgba(255,255,255,0.06)' : 'transparent',
              border: '1px solid rgba(255,255,255,0.08)',
              cursor: 'pointer',
              fontFamily: 'Space Grotesk, sans-serif',
            }}
          >
            Context
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5">
          <AnimatePresence initial={false}>
            {messages.map(msg => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-xl ${msg.role === 'user' ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                  {msg.attachments && msg.attachments.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-1">
                      {msg.attachments.map(a => (
                        <div
                          key={a.id}
                          className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs"
                          style={{
                            background: 'rgba(255,255,255,0.06)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            color: 'rgba(255,255,255,0.6)',
                            fontFamily: 'Space Grotesk, sans-serif',
                          }}
                        >
                          📎 {a.name}
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="relative group">
                    <div
                      className="px-4 py-2.5 rounded-xl text-xs leading-relaxed"
                      style={
                        msg.role === 'user'
                          ? {
                              background: 'rgba(255,255,255,0.08)',
                              color: 'rgba(255,255,255,0.85)',
                              fontFamily: 'Space Grotesk, sans-serif',
                            }
                          : {
                              background: 'transparent',
                              color: 'rgba(255,255,255,0.75)',
                              fontFamily: 'Space Grotesk, sans-serif',
                              padding: '0',
                            }
                      }
                    >
                      {msg.role === 'agent' && msg.streaming ? (
                        <TypewriterText text={msg.text} onDone={() => {
                          setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, streaming: false } : m))
                        }} />
                      ) : (
                        msg.text
                      )}
                    </div>

                    {/* Timestamp tooltip */}
                    <div
                      className="absolute -bottom-4 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                      style={{ [msg.role === 'user' ? 'right' : 'left']: 0 }}
                    >
                      <span
                        className="text-xs whitespace-nowrap"
                        style={{ color: 'rgba(255,255,255,0.2)', fontFamily: 'JetBrains Mono, monospace', fontSize: 10 }}
                      >
                        {msg.ts.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>

                  {/* Structured block */}
                  {msg.structuredBlock && !msg.streaming && (
                    <div className="w-full mt-1">
                      <StructuredOutputBlock block={msg.structuredBlock} />
                    </div>
                  )}

                  {/* Discovery Yes/No */}
                  {msg.showDiscoveryPrompt && !msg.streaming && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 }}
                      className="flex gap-2 mt-1"
                    >
                      <button
                        onClick={() => { setInputText('Yes, run me through it'); sendMessage() }}
                        className="px-3 py-1 rounded-lg text-xs font-medium transition-all"
                        style={{
                          background: '#fff',
                          color: '#0a0a0f',
                          border: 'none',
                          cursor: 'pointer',
                          fontFamily: 'Space Grotesk, sans-serif',
                        }}
                      >
                        Yes
                      </button>
                      <button
                        onClick={() => { setInputText('No, let\'s keep going'); sendMessage() }}
                        className="px-3 py-1 rounded-lg text-xs transition-all"
                        style={{
                          background: 'transparent',
                          color: 'rgba(255,255,255,0.5)',
                          border: '1px solid rgba(255,255,255,0.1)',
                          cursor: 'pointer',
                          fontFamily: 'Space Grotesk, sans-serif',
                        }}
                      >
                        No
                      </button>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>

        {/* Input area */}
        <div className="flex-shrink-0 px-6 pb-6">
          {/* Attachment chips */}
          {attachments.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-2">
              {attachments.map(a => (
                <AttachmentChip
                  key={a.id}
                  att={a}
                  onRemove={() => setAttachments(prev => prev.filter(x => x.id !== a.id))}
                />
              ))}
            </div>
          )}

          <div
            className="flex items-end gap-2 rounded-xl px-4 py-3"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            {/* File attach */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex-shrink-0 p-1 rounded transition-colors mb-0.5"
              style={{ color: 'rgba(255,255,255,0.3)', background: 'transparent', border: 'none', cursor: 'pointer' }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.6)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.3)' }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>
            </button>
            <input ref={fileInputRef} type="file" multiple className="hidden" onChange={handleFileChange} />

            {/* Textarea */}
            <textarea
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Describe a problem, an idea, or a user insight…"
              rows={1}
              className="flex-1 bg-transparent outline-none resize-none text-xs leading-relaxed"
              style={{
                color: 'rgba(255,255,255,0.85)',
                fontFamily: 'Space Grotesk, sans-serif',
                maxHeight: 160,
                overflowY: 'auto',
              }}
              onInput={e => {
                const el = e.currentTarget
                el.style.height = 'auto'
                el.style.height = Math.min(el.scrollHeight, 160) + 'px'
              }}
            />

            {/* Voice */}
            <button
              onClick={() => setRecording(v => !v)}
              className="flex-shrink-0 flex items-center gap-1.5 px-2 py-1 rounded-lg transition-all mb-0.5"
              style={{
                background: recording ? 'rgba(239,68,68,0.1)' : 'transparent',
                border: recording ? '1px solid rgba(239,68,68,0.3)' : '1px solid transparent',
                color: recording ? 'rgba(239,68,68,0.8)' : 'rgba(255,255,255,0.3)',
                cursor: 'pointer',
              }}
            >
              {recording ? (
                <>
                  <WaveformBars />
                  <span className="text-xs" style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 10 }}>Tap to stop</span>
                </>
              ) : (
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>
              )}
            </button>

            {/* Send */}
            <button
              onClick={sendMessage}
              disabled={!inputText.trim() && attachments.length === 0}
              className="flex-shrink-0 p-1.5 rounded-lg transition-all mb-0.5"
              style={{
                background: inputText.trim() || attachments.length > 0 ? '#fff' : 'rgba(255,255,255,0.08)',
                border: 'none',
                cursor: inputText.trim() || attachments.length > 0 ? 'pointer' : 'default',
                color: '#0a0a0f',
              }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
            </button>
          </div>
        </div>
      </div>

      {/* ── Right Panel ── */}
      <AnimatePresence>
        {rightPanelOpen && (
          <motion.aside
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 260, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="flex-shrink-0 flex flex-col overflow-hidden"
            style={{ borderLeft: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.01)' }}
          >
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5" style={{ minWidth: 260 }}>

              {/* Product Context */}
              <div>
                <button
                  className="flex items-center justify-between w-full mb-2"
                  onClick={() => setContextCollapsed(v => !v)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                >
                  <span className="text-xs font-semibold" style={{ color: 'rgba(255,255,255,0.5)', fontFamily: 'JetBrains Mono, monospace', fontSize: 10, letterSpacing: '0.1em' }}>
                    PRODUCT CONTEXT
                  </span>
                  <svg
                    width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                    style={{ color: 'rgba(255,255,255,0.3)', transform: contextCollapsed ? 'rotate(-90deg)' : 'rotate(0deg)', transition: 'transform 0.15s' }}
                  >
                    <path d="M19 9l-7 7-7-7"/>
                  </svg>
                </button>
                <AnimatePresence>
                  {!contextCollapsed ? (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      style={{ overflow: 'hidden' }}
                      className="space-y-1.5"
                    >
                      {[
                        { label: 'Vision', value: 'AI-native product discovery for PMs' },
                        { label: 'OKR', value: '10k active users by Q3' },
                        { label: 'Stage', value: 'Private beta' },
                      ].map(item => (
                        <div key={item.label} className="flex items-start justify-between gap-2">
                          <span className="text-xs flex-shrink-0" style={{ color: 'rgba(255,255,255,0.3)', fontFamily: 'JetBrains Mono, monospace', fontSize: 10 }}>
                            {item.label}
                          </span>
                          <span className="text-xs text-right" style={{ color: 'rgba(255,255,255,0.6)', fontFamily: 'Space Grotesk, sans-serif' }}>
                            {item.value}
                          </span>
                        </div>
                      ))}
                    </motion.div>
                  ) : (
                    <p className="text-xs" style={{ color: 'rgba(255,255,255,0.3)', fontFamily: 'Space Grotesk, sans-serif' }}>
                      Vision, OKRs set
                    </p>
                  )}
                </AnimatePresence>
              </div>

              <div className="h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />

              {/* Connected Sources */}
              <div>
                <p className="text-xs font-semibold mb-2" style={{ color: 'rgba(255,255,255,0.5)', fontFamily: 'JetBrains Mono, monospace', fontSize: 10, letterSpacing: '0.1em' }}>
                  CONNECTED SOURCES
                </p>
                <div className="space-y-1.5">
                  {sources.map(src => (
                    <div key={src.id} className="flex items-center gap-2">
                      <span
                        className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                        style={{
                          background: src.active ? '#22c55e' : 'rgba(255,255,255,0.15)',
                          boxShadow: src.active ? '0 0 6px rgba(34,197,94,0.6)' : 'none',
                          animation: src.active ? 'pulse-ring 2s ease-in-out infinite' : 'none',
                        }}
                      />
                      <span className="text-xs" style={{ color: src.active ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.3)', fontFamily: 'Space Grotesk, sans-serif' }}>
                        {src.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />

              {/* Decisions */}
              <div>
                <p className="text-xs font-semibold mb-2" style={{ color: 'rgba(255,255,255,0.5)', fontFamily: 'JetBrains Mono, monospace', fontSize: 10, letterSpacing: '0.1em' }}>
                  DECISIONS
                </p>
                <div className="space-y-2 overflow-y-auto" style={{ maxHeight: showMoreDecisions ? 200 : 'auto' }}>
                  {(showMoreDecisions ? decisions : decisions.slice(0, 3)).map(d => (
                    <div key={d.id} className="flex items-start gap-2">
                      <span className="text-xs mt-0.5 flex-shrink-0" style={{ color: 'rgba(255,255,255,0.2)' }}>·</span>
                      <span className="text-xs leading-snug" style={{ color: 'rgba(255,255,255,0.55)', fontFamily: 'Space Grotesk, sans-serif' }}>
                        {d.text}
                      </span>
                    </div>
                  ))}
                </div>
                {decisions.length > 3 && (
                  <button
                    onClick={() => setShowMoreDecisions(v => !v)}
                    className="mt-1 text-xs transition-colors"
                    style={{ color: 'rgba(255,255,255,0.25)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Space Grotesk, sans-serif' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.5)' }}
                    onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.25)' }}
                  >
                    {showMoreDecisions ? 'Show less' : `View all ${decisions.length}`}
                  </button>
                )}
              </div>

              <div className="h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />

              {/* Documents */}
              <div>
                <p className="text-xs font-semibold mb-2" style={{ color: 'rgba(255,255,255,0.5)', fontFamily: 'JetBrains Mono, monospace', fontSize: 10, letterSpacing: '0.1em' }}>
                  DOCUMENTS
                </p>
                <div className="space-y-1.5 overflow-y-auto" style={{ maxHeight: showMoreDocs ? 200 : 'auto' }}>
                  {(showMoreDocs ? docs : docs.slice(0, 3)).map(d => (
                    <div key={d.id} className="flex items-center justify-between gap-2">
                      <span className="text-xs truncate flex-1" style={{ color: 'rgba(255,255,255,0.55)', fontFamily: 'Space Grotesk, sans-serif' }}>
                        {d.title}
                      </span>
                      <span className="text-xs flex-shrink-0" style={{ color: 'rgba(255,255,255,0.2)', fontFamily: 'JetBrains Mono, monospace', fontSize: 10 }}>
                        {relativeTime(d.ts)}
                      </span>
                    </div>
                  ))}
                </div>
                {docs.length > 3 && (
                  <button
                    onClick={() => setShowMoreDocs(v => !v)}
                    className="mt-1 text-xs transition-colors"
                    style={{ color: 'rgba(255,255,255,0.25)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Space Grotesk, sans-serif' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.5)' }}
                    onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.25)' }}
                  >
                    {showMoreDocs ? 'Show less' : `View all ${docs.length}`}
                  </button>
                )}
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </div>
  )
}
