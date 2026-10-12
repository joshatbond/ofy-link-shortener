export const OFY_EMAIL_DOMAIN = "@ofy.org";

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function isOfyOrgEmail(email: string): boolean {
  const normalized = normalizeEmail(email);
  return (
    normalized.endsWith(OFY_EMAIL_DOMAIN) &&
    normalized.length > OFY_EMAIL_DOMAIN.length
  );
}

export function assertOfyOrgEmail(email: string): string {
  const normalized = normalizeEmail(email);
  const at = normalized.indexOf("@");

  if (at <= 0 || at === normalized.length - 1) {
    throw new Error("Enter a valid email address.");
  }

  if (!isOfyOrgEmail(normalized)) {
    throw new Error("Sign-in requires an @ofy.org account.");
  }

  return normalized;
}
