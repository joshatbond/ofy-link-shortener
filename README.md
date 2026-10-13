# ShortCuts

## Setup

```bash
bun install
```

`VITE_CONVEX_URL` is inlined when Vite builds or serves the app. Set it before `bun run dev` or `bun run build`. It must be an absolute `http://` or `https://` URL. A valid `users.viewer` shows the dashboard at `/`. Otherwise the app shows the marketing page at `/home`.

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

One path segment that is not a reserved name is a short link. Reserved names are case-insensitive and are the same names rejected when a slug is saved: `home`, `login`, `dashboard`, `unknown`, `math`, `api`, `monitoring`, `assets`, `favicon.ico`, and `logo.png`. `/` and those names, with or without a trailing slash, stay on the SPA, as do files under `/assets/`. `favicon.ico` and `logo.png` are excluded literally, so a hyphenated slug such as `logo-png` is still a short link. Vercel Routing Middleware (`middleware.ts`) calls the Convex HTTP action `GET /redirect?slug=...`. There is no `/$slug` route in the SPA.

An active link responds `307` to its stored `http` or `https` URL. The short link’s query string is merged onto that destination: new keys are added, the same key replaces the destination’s values, and the destination hash stays. An empty query changes nothing. An unknown, disabled, or expired slug responds `307` to `/unknown` with no query string and no destination. The lookup does not require a session. `/slug` and `/slug/` are the same link. A stored slug is matched exactly, including case.

The middleware reads `CONVEX_SITE_URL` when that variable is set on Vercel. Otherwise it reads `VITE_CONVEX_URL` and swaps a `.convex.cloud` host for `.convex.site`. That value has to be available at runtime, not only inlined into the client build. If neither variable is set, a slug request still redirects to `/unknown` instead of serving the SPA.

## Scripts

```bash
bun run dev
bun run test
bun run lint
bun run typecheck
bun run build
```
