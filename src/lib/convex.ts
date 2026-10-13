import { ConvexReactClient } from "convex/react";
import {
  observeAuthCodeExchange,
  type AuthActionClient,
} from "./authCodeExchange";

const convexUrl = absoluteConvexUrl(import.meta.env.VITE_CONVEX_URL);

export const convex = convexUrl ? new ConvexReactClient(convexUrl) : null;

if (convex) {
  observeAuthCodeExchange(convex as unknown as AuthActionClient);
}

function absoluteConvexUrl(value: string | undefined): string | null {
  if (value === undefined || value.length === 0) {
    return null;
  }
  const separator = value.indexOf("://");
  if (separator === -1) {
    return null;
  }
  const protocol = value.slice(0, separator);
  if (protocol !== "http" && protocol !== "https") {
    return null;
  }
  return value;
}
