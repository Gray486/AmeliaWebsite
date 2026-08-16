# Amelia Website

A Cloudflare Pages + Workers monorepo with a single frontend app and backend worker.

## Project Structure

```
.
├── apps/
│   └── frontend/          # Vite + React frontend (Cloudflare Pages)
├── workers/
│   └── backend/           # Hono + Wrangler backend (Cloudflare Worker)
├── scripts/               # Development utilities
├── package.json           # Root workspace config
└── pnpm-workspace.yaml    # pnpm monorepo definition
```

## Development

### Prerequisites

- Node.js (use `.node-version` if set)
- pnpm 11+

### Start Development Servers

```bash
pnpm dev
```

This will:
1. Start all development servers in parallel
2. Wait for them to be ready
3. Display URLs and port information

**Servers:**
- Frontend: http://localhost:5173
- Backend Worker: http://localhost:8787

The frontend is configured to proxy `/api/*` requests to the backend at `http://localhost:8787`.

### Run Without Welcome Message

```bash
pnpm dev:silent
```

## Commands

### Development
```bash
pnpm dev           # Start all dev servers with status display
pnpm dev:silent    # Start all dev servers (minimal output)
```

### Building
```bash
# In workspace root or specific app/worker directory:
pnpm build         # Build frontend (runs tsc + vite build)
```

### Code Quality
```bash
pnpm lint          # Lint all packages with Biome
pnpm typecheck     # Run TypeScript type checking
pnpm test          # Run tests (if configured)
```

## Adding Dependencies

### To Frontend
```bash
cd apps/frontend
pnpm add <package>
```

### To Backend
```bash
cd workers/backend
pnpm add <package>
```

### To Root (Shared Dev Dependencies)
```bash
pnpm add -w -D <package>
```

## Frontend Development

Located in `apps/frontend/`

- **Framework:** React 19 with Vite
- **Dev Server:** Vite (port 5173)
- **Type Checking:** TypeScript
- **Config:** `vite.config.ts`

Start frontend only:
```bash
cd apps/frontend && pnpm dev
```

### Environment Variables

- `.env.development` - Local development
- `.env.production` - Production build

### Building

```bash
cd apps/frontend
pnpm build    # Builds to dist/
pnpm preview  # Preview production build locally
```

## Backend Development

Located in `workers/backend/`

- **Framework:** Hono
- **Runtime:** Cloudflare Workers (wrangler dev)
- **Dev Server:** port 8787
- **Type Checking:** TypeScript
- **Config:** `wrangler.toml`

Start backend only:
```bash
cd workers/backend && pnpm dev
```

### API Endpoints

Example endpoints in `src/index.ts`:
- `GET /health` - Health check
- `GET /api/example` - Example endpoint

### Environment Configuration

- **Local:** `wrangler.toml` `[vars]` section
- **Production:** `wrangler.toml` `[env.production]` section

## Deployment

### Frontend (Cloudflare Pages)

Push to your git repo. Pages will auto-detect the workspace and run:
```bash
pnpm install --frozen-lockfile
pnpm run build --filter @amelia/frontend
```

### Backend (Cloudflare Workers)

From the `workers/backend/` directory:
```bash
pnpm deploy
```

Or with environment:
```bash
pnpm deploy --env production
```

## Code Style

Uses [Biome](https://biomejs.dev/) for linting and formatting.

```bash
pnpm lint       # Check all files
```

## TypeScript

Root `tsconfig.base.json` extends to all packages.

Each package has its own `tsconfig.json` that extends the base config.

Check types across workspace:
```bash
pnpm typecheck
```
