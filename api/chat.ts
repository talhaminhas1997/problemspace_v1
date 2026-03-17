import Anthropic from '@anthropic-ai/sdk'

export const config = {
  runtime: 'edge',
}

const PHASES = ['Framing', 'Planning', 'Ideation', 'Complete']

const FREE_SYSTEM = `You are an AI assistant built for product managers. You help think through product problems, strategy, user research, prioritization, roadmapping, and anything related to building great products. Be concise and direct. Ask one focused clarifying question when it moves the conversation forward.`

function discoverySystem(phase: string): string {
  return `You are guiding a product manager through a structured product discovery process. The current phase is: ${phase}.

Phase context:
- Framing: Help define the problem space — who is affected, what are they trying to do, and what's the core pain.
- Planning: Map potential solutions, identify success metrics, surface constraints.
- Ideation: Generate and evaluate ideas, surface assumptions, explore approaches.
- Complete: Synthesize the conversation into a structured output.

Guide through focused questions — one per response. Be direct and concise. Do not lecture. When you have enough context, produce a structured summary using this format exactly:

[PROBLEM_STATEMENT]
Users: <who is affected>
Problem: <core pain or gap>
Impact: <why it matters>
Opportunity: <what could be different>
[/PROBLEM_STATEMENT]`
}

export default async function handler(req: Request) {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 })
  }

  const { messages, chatType, phaseIdx } = await req.json()

  const phase = PHASES[phaseIdx] ?? 'Framing'
  const system = chatType === 'discovery' ? discoverySystem(phase) : FREE_SYSTEM

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

  const stream = client.messages.stream({
    model: 'claude-opus-4-6',
    max_tokens: 1024,
    system,
    messages,
  })

  const readable = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder()
      try {
        for await (const event of stream) {
          if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ text: event.delta.text })}\n\n`)
            )
          }
        }
        controller.enqueue(encoder.encode('data: [DONE]\n\n'))
      } catch (err) {
        controller.error(err)
      }
      controller.close()
    },
  })

  return new Response(readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  })
}
