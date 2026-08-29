const STOP = new Set([
  "the",
  "a",
  "an",
  "and",
  "or",
  "for",
  "to",
  "of",
  "in",
  "on",
  "with",
  "by",
  "at",
  "from",
  "as",
  "is",
  "it",
  "its",
  "this",
  "that",
  "all",
  "new",
  "set",
  "pcs",
  "pc",
  "pack",
  "pk",
  "x",
]);

export function tokenize(title: string): string[] {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .split(/\s+/)
    .filter((token) => token.length >= 3 && !STOP.has(token) && !/^\d+$/.test(token));
}

export function titleHasPhrase(title: string, phrase: string): boolean {
  return title.toLowerCase().includes(phrase.toLowerCase());
}

export function tokenFrequency(titles: string[]): Map<string, number> {
  const counts = new Map<string, number>();
  for (const title of titles) {
    const seen = new Set(tokenize(title));
    for (const token of seen) {
      counts.set(token, (counts.get(token) ?? 0) + 1);
    }
  }
  return counts;
}
