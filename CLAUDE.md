Problemspace — Claude Code Context
What This Is
AI-powered product discovery tool for Product Managers. Positioned as "Cursor for PMs." Helps PMs through structured discovery: Framing → Planning → Ideation.
Stack
* Frontend: Next.js 14, Tailwind CSS, Framer Motion, TypeScript — deployed on Vercel
* Backend: FastAPI (Python) — deployed on Railway
* AI: Claude API (claude-sonnet-4-6) via LangChain
* Auth: Supabase (Phase 2 — not yet implemented)
* Vector DB: Pinecone (Phase 2)
* Embeddings: OpenAI text-embedding-3 (Phase 2)
Project Structure
problemspace/ ├── frontend/          # Next.js app │   ├── app/ │   │   ├── page.tsx          # Landing page (DO NOT CHANGE design) │   │   ├── demo/page.tsx     # Demo — stub │   │   ├── chat/page.tsx     # Main agent UI — stub │   │   └── api/              # API routes (BFF) │   ├── components/ │   │   └── ui/               # Design system components │   └── lib/ └── backend/           # FastAPI — stub     ├── main.py     └── routers/
Design System
* Fonts: Space Grotesk (display) + JetBrains Mono (mono)
* Dark mode by default (class="dark" on html)
* Colors via CSS variables in globals.css — do not hardcode colors
* Key classes: font-display, font-mono, text-gradient-accent, glass-card
* Animations: Framer Motion throughout — keep consistent
Agent Behavior (Core Product Logic)
Three-phase discovery flow:
1. Framing — entry prompt: "What's on your mind — are you starting from a problem, an idea, or something someone else handed you?" Routes into idea-first / problem-first / handed-to-me branches.
2. Planning — Story Map (Activities → Tasks → Priority). Infers initiative size silently.
3. Ideation — PM ideas first, agent enriches, red-teams silently, ranks against OKRs.
Layer 1 context (persistent): vision, strategy, OKRs, personas, prior decisions, research base. Layer 2 context (per session/initiative): built during framing conversation.
What NOT to Do
* Do not add auth yet (Supabase comes in Phase 2)
* Do not touch the landing page design (app/page.tsx) without explicit instruction
* Do not use localStorage for anything — no fake auth
* Do not add Pinecone/embeddings yet — stub retrieval only for now
* Do not rename or restructure files without asking
Current Build Phase
Phase 1 — Clean foundation:
* Landing page (Next.js port of Replit design)
* FastAPI backend stub on Railway
* Chat UI stub talking to backend
* Basic agent with framing prompt (no RAG yet)
Key Decisions
* Supabase Auth over Clerk (simpler, one less service)
* Single FastAPI entrypoint (backend/main.py) — no duplicate servers
* Trial mode (no login) works identically, context is session-only
* Agent uses LangChain StateGraph for phase transitions
