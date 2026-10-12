# ShortCuts

## Setup

```bash
bun install
```

`VITE_CONVEX_URL` is inlined when Vite builds or serves the app. Set it before `bun run dev` or `bun run build`. If it is missing, or it is not an absolute `http://` or `https://` URL, the marketing page at `/home` says the backend is not configured. A valid session shows the dashboard at `/`.

For local development, copy `.env.example` to `.env.local`. `bunx convex dev` writes `VITE_CONVEX_URL` into that file.

Agents must use an isolated deployment:

```bash
CONVEX_AGENT_MODE=anonymous bunx convex dev
```

On Vercel, set `VITE_CONVEX_URL` in the project environment before the build. A value added only at runtime is not visible to the client.

Node.js 24 is required (`engines.node` and `.node-version`) so Vercel builds on Node 24.

## Auth

Sign-in is Convex Auth with Google. Convex rejects any email that is not `@ofy.org`.

Set these on the Convex deployment. Set `VITE_CONVEX_URL` on Vercel as well.

| Variable | Required | Purpose |
| --- | --- | --- |
| `AUTH_GOOGLE_ID` | Yes, for Google sign-in | Google OAuth client id. The Google button stays hidden until this and the secret are set. |
| `AUTH_GOOGLE_SECRET` | Yes, for Google sign-in | Google OAuth client secret. |
| `SITE_URL` | Yes | Canonical app origin. Production is `https://sc.ofys.org`. Missing `SITE_URL` rejects post-login redirects. |
| `ALLOWED_SITE_URLS` | No | Comma-separated extra origins that may receive the post-login redirect. |
| `VITE_CONVEX_URL` | Yes, for the SPA and slug redirects | Absolute Convex cloud URL. Inlined at build time, and read at runtime by the slug middleware. |
| `DEV_PASSWORD_AUTH` | No | Set to `true` to enable the dev password provider. Leave unset in production. |
| `INVITE_DEV_RELAXED` | No | Set to `true` to enable the dev password provider. Leave unset in production. |

The dev password provider is also on when `SITE_URL` is `localhost` or `127.0.0.1`. It is off for any other host unless one of those flags is `true`. Minimum password length is 4 characters.

`CONVEX_SITE_URL` on the Convex deployment is provided by Convex for the auth JWT issuer. Do not set that one manually.

## Public redirects

One path segment that is not an app route (`/`, `/home`, `/login`, `/dashboard`, `/unknown`) or a static file (`favicon.ico`, `logo.png`, `/assets/*`) is a short link. Vercel Routing Middleware (`middleware.ts`) calls the Convex HTTP action `GET /redirect?slug=...`. There is no `/$slug` route in the SPA.

An active link responds `307` to its stored `http` or `https` URL. An unknown, disabled, or expired slug responds `307` to `/unknown`. The lookup does not require a session. `/slug` and `/slug/` are the same link, and the slug match is case-sensitive.

The middleware reads `CONVEX_SITE_URL` when that variable is set on Vercel. Otherwise it reads `VITE_CONVEX_URL` and swaps a `.convex.cloud` host for `.convex.site`. That value has to be available at runtime, not only inlined into the client build. If neither variable is set, a slug request still redirects to `/unknown` instead of serving the SPA.

## Scripts

```bash
bun run dev
bun run test
bun run lint
bun run typecheck
bun run build
```
