export function normalizePrivateKey(raw: string | undefined): string {
  if (!raw) {
    return "";
  }

  let key = raw.trim();

  if (
    (key.startsWith('"') && key.endsWith('"')) ||
    (key.startsWith("'") && key.endsWith("'"))
  ) {
    key = key.slice(1, -1);
  }

  return key.replace(/\\n/g, "\n");
}

export function isValidPrivateKey(key: string): boolean {
  return (
    key.includes("BEGIN PRIVATE KEY") && key.includes("END PRIVATE KEY")
  );
}
