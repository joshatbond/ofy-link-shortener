# ShortCuts

## Setup

```bash
bun install
```

`VITE_CONVEX_URL` is inlined when Vite builds or serves the app. Set it before `bun run dev` or `bun run build`. If it is missing, or it is not an absolute `http://` or `https://` URL, the landing page says the backend is not configured.

For local development, copy `.env.example` to `.env.local`. `bunx convex dev` writes `VITE_CONVEX_URL` into that file.

Agents must use an isolated deployment:

```bash
CONVEX_AGENT_MODE=anonymous bunx convex dev
```

On Vercel, set `VITE_CONVEX_URL` in the project environment before the build. A value added only at runtime is not visible to the client.

## Scripts

```bash
bun run dev
bun run test
bun run lint
bun run typecheck
bun run build
```
