# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run setup        # First-time setup: install deps, generate Prisma client, run migrations
npm run dev          # Start dev server with Turbopack
npm run build        # Production build
npm run lint         # Run ESLint
npm run test         # Run Vitest test suite
npm run db:reset     # Reset SQLite database (destructive)
```

Run a single test file:
```bash
npx vitest run src/components/chat/__tests__/ChatInterface.test.tsx
```

## Environment

Copy `.env.example` to `.env` and set:
- `ANTHROPIC_API_KEY` — required for real AI responses; omit to fall back to a mock provider
- `JWT_SECRET` — defaults to `"development-secret-key"` if unset

## Stack

Next.js 15 (App Router, Turbopack), React 19, TypeScript, Tailwind CSS v4, Radix UI, Vercel AI SDK v4, Prisma + SQLite, Vitest + React Testing Library. AI model: `claude-haiku-4-5-20251001`.

## Architecture

UIGen is an AI-powered React component generator with live preview. The user describes a component in a chat interface; Claude generates/edits files in a virtual file system; the browser evaluates the JSX and renders a live preview.

### Data flow

1. `src/app/[projectId]/page.tsx` — project workspace; loads project data from Prisma and hydrates client state
2. `src/app/api/chat/route.ts` — streaming endpoint; instantiates a `VirtualFileSystem`, builds a system prompt (with prompt caching), then calls `streamText` via the Vercel AI SDK
3. Claude uses two tools to modify files:
   - `str_replace_editor` (`src/lib/tools/str-replace.ts`) — create and edit files via string replacement (`view`, `create`, `str_replace`, `insert` commands)
   - `file_manager` (`src/lib/tools/file-manager.ts`) — rename and delete files
4. Tool calls stream to the client and are applied to `FileSystemContext` (`src/lib/contexts/file-system-context.tsx`)
5. `PreviewFrame` (`src/components/preview/PreviewFrame.tsx`) transforms JSX with `@babel/standalone` and evaluates it in the browser; runs inside an iframe for sandboxing; JSX validation lives in `src/lib/transform/jsx-transformer.ts`
6. On stream completion (`onFinish`), the project's messages and file system state are persisted to SQLite via Prisma server actions in `src/actions/`

### Key abstractions

- **`VirtualFileSystem`** (`src/lib/file-system.ts`) — in-memory map of filename → content; used server-side to build context and client-side to drive the editor and preview
- **`FileSystemContext`** / **`ChatContext`** (`src/lib/contexts/`) — React contexts that bridge streaming tool results to the UI
- **`lib/provider.ts`** — returns the Anthropic model or a `MockLanguageModel`; the mock generates canned deterministic responses so the app works without an API key
- **`lib/prompts/generation.tsx`** — system prompt that governs how Claude generates components; edit this to change generation behavior
- **`lib/anon-work-tracker.ts`** — tracks anonymous user actions in `localStorage`; surfaced in `ChatContext` to prompt sign-up after meaningful work

### Database schema

Defined in `prisma/schema.prisma` — always refer to that file for the authoritative schema structure. Two Prisma models:
- **User** — email (unique), hashed password, timestamps
- **Project** — name, optional `userId` (anonymous projects allowed), `messages` (JSON string), `data` (JSON string), timestamps

### Auth

JWT sessions stored in httpOnly cookies (`src/lib/auth.ts` via `jose`). Passwords hashed with `bcrypt`. Server actions in `src/actions/` handle sign-up, sign-in, sign-out, and project CRUD. Projects support anonymous ownership (`userId` is optional on the `Project` model).

### Testing

Tests live next to source in `__tests__/` directories. Vitest runs with a jsdom environment and React Testing Library. Path alias `@/*` maps to `src/*`. Use `vi.mock()` to stub context providers and child components in unit tests.
