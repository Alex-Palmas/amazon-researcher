export async function loadOptionalJson<T>(file: string): Promise<T | null> {
  try {
    const res = await fetch(`${import.meta.env.BASE_URL}data/${file}`);
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}
