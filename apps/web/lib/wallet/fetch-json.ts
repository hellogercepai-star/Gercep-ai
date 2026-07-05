/** Baca response fetch dengan aman — hindari Safari "expected pattern" dari .json() pada HTML. */
export async function readJsonResponse<T = Record<string, unknown>>(
  res: Response,
  step: string
): Promise<T> {
  const text = await res.text();
  if (!text.trim()) {
    throw new Error(`${step}: server kosong (HTTP ${res.status}).`);
  }

  try {
    return JSON.parse(text) as T;
  } catch {
    const preview = text.slice(0, 80).replace(/\s+/g, " ");
    throw new Error(
      `${step}: response bukan JSON (HTTP ${res.status}). ${preview}`
    );
  }
}
