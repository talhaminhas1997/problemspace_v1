# Problemspace – Claude Code Guide

## Stack
- **Framework**: Vite + React 19 + TypeScript
- **Styling**: Tailwind CSS v4 (via `@tailwindcss/vite`)
- **Animation**: Framer Motion (all page/element transitions)
- **Routing**: React Router v7 (`BrowserRouter` in `main.tsx`, routes in `Router.tsx`)
- **Icons**: Lucide React

## Project Structure

```
src/
  main.tsx          # Entry point — wraps app in BrowserRouter
  Router.tsx        # All route definitions (/, /auth, /chat, /settings)
  App.tsx           # Landing page — DO NOT TOUCH
  pages/
    AuthPage.tsx    # /auth — login/signup/guest
    ChatPage.tsx    # /chat — sidebar + chat interface
    SettingsPage.tsx # /settings — profile, integrations, security
  components/       # Shared landing page components — DO NOT TOUCH
    Nav.tsx
    CTAButton.tsx
    BottomCTA.tsx
    ... (all other landing page components)
  index.css         # Global CSS + CSS variable design tokens
```

## Key Rules

### Segregation
Landing page lives in `src/App.tsx` + `src/components/`. **Never modify these** when working on app pages. New pages go in `src/pages/`.

### Design System
- **Background**: `#0a0a0f`
- **Fonts**: Space Grotesk (UI), JetBrains Mono (code/labels)
- **Color pattern**: `rgba(255,255,255/opacity)` — no hardcoded hex colors for text
- **Accent colors** (structured output blocks only):
  - Purple → Problem framing
  - Blue → Story map
  - Teal → Brief
  - Orange → Risk
- **Animations**: `opacity: 0→1`, `y: 8→0`, `duration: 0.3s` via Framer Motion

### Chat Types (`ChatPage.tsx`)
- `'free'` — casual AI chat, no phase bar
- `'discovery'` — structured cycle with Framing → Planning → Ideation → Complete phase bar + structured output blocks

### Portal Pattern
`NewChatPicker` uses `createPortal(…, document.body)` to escape the sidebar's `overflow-hidden`. Position derived from `getBoundingClientRect()` on the trigger button.

## Dev Commands

```bash
npm run dev      # Start local dev server
npm run build    # Production build
npm run lint     # ESLint
```

## Deployment
Deployed on Vercel. `vercel.json` configures SPA rewrites so `/auth`, `/chat`, `/settings` all serve `index.html`. `.npmrc` has `legacy-peer-deps=true` for peer dep compatibility.

## Next Steps (Planned)
- Claude API integration + streaming responses
- Real authentication (Supabase or similar)
- Persistent chat storage
