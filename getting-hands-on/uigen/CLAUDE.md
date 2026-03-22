# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Setup (first time)
npm run setup          # install deps + generate Prisma client + run migrations

# Development
npm run dev            # start dev server with Turbopack
npm run dev:daemon     # run dev server in background (logs to logs.txt)

# Build & Production
npm run build
npm run start

# Quality
npm run lint           # ESLint via Next.js
npm run test           # Vitest unit tests

# Database
npm run db:reset       # force reset and re-migrate (destructive)
```

Run a single test file: `npx vitest run src/path/to/file.test.tsx`

Set `ANTHROPIC_API_KEY` in `.env` to use real Claude. Without it, the app falls back to a `MockLanguageModel`.

## Architecture

UIGen is a **Next.js 15 App Router** application where users describe React components in natural language and see them generated and previewed live.

### Core Data Flow

1. User types in chat → `ChatProvider` (`src/lib/contexts/chat-context.tsx`) sends messages to `/api/chat`
2. `/api/chat/route.ts` streams responses from Claude using Vercel AI SDK
3. Claude invokes tools (`str_replace_editor`, `file_manager`) to create/edit virtual files
4. `FileSystemProvider` (`src/lib/contexts/file-system-context.tsx`) updates in-memory virtual FS
5. `PreviewFrame` compiles and renders files in an iframe using `@babel/standalone`

### Key Modules

- **`src/lib/provider.ts`** — selects real Anthropic or MockLanguageModel based on `ANTHROPIC_API_KEY`
- **`src/lib/file-system.ts`** — in-memory virtual file system (no disk writes); hierarchical tree with JSON serialization
- **`src/lib/tools/`** — tool handlers called by Claude: `str-replace.ts` (create/edit files), `file-manager.ts` (directory ops)
- **`src/lib/prompts/generation.tsx`** — system prompt defining component generation rules
- **`src/lib/transform/jsx-transformer.ts`** — converts virtual FS files to a runnable HTML blob for the iframe
- **`src/lib/auth.ts`** — JWT sessions via HTTP-only cookies (`jose` + bcrypt); anonymous mode supported

### Authentication

- JWT tokens in HTTP-only cookies (7-day expiry), signed with `jose`
- Anonymous users can work without signing in; work migrates to their account on sign-in (`src/lib/anon-work-tracker.ts`)
- Server actions in `src/actions/` for auth (signUp, signIn, signOut) and project CRUD
- Middleware (`src/app/middleware.ts`) protects `/api/projects` and `/api/filesystem`

### Persistence

- **Prisma + SQLite** (`prisma/schema.prisma`): `User` and `Project` models
- Projects store chat messages and file system state as JSON blobs
- Run `npm run setup` after cloning; `npm run db:reset` to wipe and re-migrate

### Preview System

- `PreviewFrame` renders an iframe with a dynamically constructed HTML document
- `jsx-transformer.ts` auto-detects the entry point (`App.jsx`, `index.jsx`, etc.) and builds an import map
- Babel standalone handles JSX compilation client-side in the iframe

### UI Stack

- Tailwind CSS v4, Radix UI primitives, shadcn components (`components.json`)
- Resizable panels via `react-resizable-panels`
- Monaco editor for code editing
- Path alias: `@/*` → `src/*`
