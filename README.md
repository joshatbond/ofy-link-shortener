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
| `VITE_CONVEX_URL` | Yes, for the SPA | Absolute Convex cloud URL. Inlined at build time. |
| `DEV_PASSWORD_AUTH` | No | Set to `true` to enable the dev password provider. Leave unset in production. |
| `INVITE_DEV_RELAXED` | No | Set to `true` to enable the dev password provider. Leave unset in production. |

The dev password provider is also on when `SITE_URL` is `localhost` or `127.0.0.1`. It is off for any other host unless one of those flags is `true`. Minimum password length is 4 characters.

`CONVEX_SITE_URL` is provided by Convex for the auth JWT issuer. Do not set it manually.

## Scripts

```bash
bun run dev
bun run test
bun run lint
bun run typecheck
bun run build
```
