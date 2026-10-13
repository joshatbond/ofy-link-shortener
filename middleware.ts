import { next } from "@vercel/functions";
import {
  applyShortLinkQuery,
  convexSiteOrigin,
  forwardLocation,
  slugFromPathname,
} from "./src/lib/publicSlug.js";

export const config = {
  runtime: "nodejs",
  matcher: ["/((?!assets/|favicon\\.ico|logo\\.png).*)"],
};

export default async function middleware(request: Request) {
  const requestUrl = new URL(request.url);
  const slug = slugFromPathname(requestUrl.pathname);
  if (slug === null) {
    return next();
  }

  const location = await lookupLocation(slug);
  return new Response(null, {
    status: 307,
    headers: {
      Location: locationWithRequestQuery(location, requestUrl),
      "Cache-Control": "no-store",
    },
  });
}

/** Query merging runs only after an active http(s) lookup. */
function locationWithRequestQuery(
  location: string | null,
  requestUrl: URL,
): string {
  if (location === null || location === "/unknown") {
    return "/unknown";
  }
  return applyShortLinkQuery(location, requestUrl);
}

async function lookupLocation(slug: string): Promise<string | null> {
  const origin = convexSiteOrigin({
    CONVEX_SITE_URL: process.env.CONVEX_SITE_URL,
    VITE_CONVEX_URL: process.env.VITE_CONVEX_URL,
  });
  if (origin === null) {
    console.error(
      "Slug redirect is missing CONVEX_SITE_URL and VITE_CONVEX_URL.",
    );
    return null;
  }

  const endpoint = new URL("/redirect", origin);
  endpoint.searchParams.set("slug", slug);

  try {
    const response = await fetch(endpoint, { redirect: "manual" });
    const status = response.status;
    const location = response.headers.get("Location");
    try {
      await response.body?.cancel();
    } catch {
      // The location decision already happened. Dropping the body is cleanup.
    }
    if (status !== 307) {
      return null;
    }
    return forwardLocation(location);
  } catch (error) {
    console.error(
      "Slug redirect lookup failed.",
      error instanceof Error ? error.message : "Unknown error",
    );
    return null;
  }
}
