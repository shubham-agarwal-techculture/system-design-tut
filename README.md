# System Design Guide

A structured, AI-augmented curriculum for learning system design from first principles — classic distributed systems through LLM serving and agentic architectures.

## Features

- **Validated content store** — lessons live under `content/` as JSON, compiled into a search index
- **12-phase syllabus** — foundations → trading/low-latency → ML/LLM → training/inference → agentic systems
- **Depth tiers** — Core / Deep dive / Expert on every lesson
- **Trend Scout** — scheduled + on-demand discovery of emerging patterns (`npm run scout:*`)
- **Live AI APIs** — tutor, explain, quiz, design review, personalized paths (optional; app works offline)
- **Design system** — four skins (Drafting, Transit, Riso, Instrument) × light/dark × colorways

## Quick start

```bash
npm install
cp .env.example .env   # optional API keys
npm run content:index
npm run dev            # Vite on :5173
```

In another terminal (for tutor / scout / quiz):

```bash
npm run server         # API on :8787 (proxied via /api in dev)
```

## Content pipeline

| Command | Purpose |
|---------|---------|
| `npm run content:gaps` | Diff syllabus vs content |
| `npm run content:generate -- --module networking` | Draft missing lessons |
| `npm run content:deepen -- --lesson <id>` | Add deepDive/expert tiers |
| `npm run content:critique` | Review drafts |
| `npm run content:approve -- <id>` | Publish a draft |
| `npm run content:refresh` | Flag living lessons for update |
| `npm run content:organize` | Recompute related/prereq edges |
| `npm run content:validate` | Schema + graph checks |

Expand stubs from the syllabus:

```bash
npx tsx --tsconfig tsconfig.scripts.json scripts/expand-curriculum.ts
```

## Trend Scout

```bash
npm run scout:fetch
npm run scout:run
npm run scout:now
npm run scout:topic -- --query "speculative decoding"
npm run scout:lesson -- --lesson ti-batching
```

Sources: `content/scout/sources.yaml`. Digests: `content/scout/digests/`. Weekly GitHub Action: `.github/workflows/content-scout.yml`.

## Appearance

Open **Appearance** in the app to switch skin / mode / colorway. Living style guide: `/design`. Contrast CI: `npm run design:contrast`.

## Production

```bash
npm run build
npm run preview
# or pm2: ecosystem.config.cjs (SPA + API)
```

## Tech stack

React 19 · TypeScript · Vite 6 · Tailwind 4 · Hono · Zod · MiniSearch · Vercel AI SDK · better-sqlite3 · Mermaid
