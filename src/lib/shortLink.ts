/**
 * Public short links are served by the ofy.sh worker.
 * Copy, QR, and the success panel use this host, not the dashboard origin.
 */
export const SHORT_LINK_ORIGIN = "https://ofy.sh";

export function shortLinkUrl(slug: string): string {
  return `${SHORT_LINK_ORIGIN}/${slug}`;
}

/** Label in the success panel. The scheme stays off the panel. */
export function shortLinkLabel(slug: string): string {
  return `ofy.sh/${slug}`;
}
