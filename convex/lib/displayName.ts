const MAX_DISPLAY_NAME_LENGTH = 100;

export function normalizeDisplayName(raw: string): string {
  const name = raw.trim();

  if (name.length < 1) {
    throw new Error("Name is required.");
  }

  if (name.length > MAX_DISPLAY_NAME_LENGTH) {
    throw new Error(
      `Name must be ${MAX_DISPLAY_NAME_LENGTH} characters or less.`,
    );
  }

  return name;
}
