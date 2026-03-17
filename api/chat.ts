import Anthropic from '@anthropic-ai/sdk'
import type { IncomingMessage, ServerResponse } from 'http'

export const config = { maxDuration: 60 }

const PHASES = ['Framing', 'Planning', 'Ideation', 'Complete']

const FREE_SYSTEM = `You are an AI assistant built for product managers. You help think through product problems, strategy, user research, prioritization, roadmapping, and anything related to building great products. Be concise and direct. Ask one focused clarifying question when it moves the conversation forward.`

function discoverySystem(phase: string): string {
  return `You are guiding a product manager through a structured product discovery process. The current phase is: ${phase}.

Phase context:
- Framing: Help define the problem space — who is affected, what are they trying to do, and what's the core pain.
- Planning: Map potential solutions, identify success metrics, surface constraints.
- Ideation: Generate and evaluate ideas, surface assumptions, explore approaches.
- Complete: Synthesize the conversation into a structured output.

Guide through focused questions — one per response. Be direct and concise. Do not lecture.`
}

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  if (req.method !== 'POST') {
    res.writeHead(405)
    res.end('Method Not Allowed')
    return
  }

  // Parse body
  const body = await new Promise<string>((resolve, reject) => {
    let data = ''
    req.on('data', chunk => { data += chunk })
    req.on('end', () => resolve(data))
    req.on('error', reject)
  })

  let messages: Anthropic.MessageParam[], chatType: string, phaseIdx: number
  try {
    ;({ messages, chatType, phaseIdx } = JSON.parse(body))
  } catch {
    res.writeHead(400)
    res.end('Bad Request')
    return
  }

  const phase = PHASES[phaseIdx] ?? 'Framing'
  const system = chatType === 'discovery' ? discoverySystem(phase) : FREE_SYSTEM

  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    'Connection': 'keep-alive',
    'X-Accel-Buffering': 'no',
  })

  // Flush headers immediately
  if (typeof (res as { flushHeaders?: () => void }).flushHeaders === 'function') {
    ;(res as { flushHeaders: () => void }).flushHeaders()
  }

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    res.write(`data: ${JSON.stringify({ text: '[Error: ANTHROPIC_API_KEY not configured]' })}\n\n`)
    res.write('data: [DONE]\n\n')
    res.end()
    return
  }

  const client = new Anthropic({ apiKey })

  try {
    const stream = await client.messages.create({
      model: 'claude-opus-4-6',
      max_tokens: 1024,
      system,
      messages,
      stream: true,
    })

    for await (const event of stream) {
      if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
        res.write(`data: ${JSON.stringify({ text: event.delta.text })}\n\n`)
      }
    }

    res.write('data: [DONE]\n\n')
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('Claude API error:', message)
    res.write(`data: ${JSON.stringify({ text: `[API Error: ${message}]` })}\n\n`)
  }

  res.end()
}
