export async function parseApiResponse<T = Record<string, unknown>>(
  response: Response,
): Promise<T> {
  const text = await response.text();

  if (!text.trim()) {
    throw new Error(
      "The server returned an empty response. Check your `.env.local` keys and the terminal logs.",
    );
  }

  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error(
      "The server returned an invalid response. Check your `.env.local` keys and the terminal logs.",
    );
  }
}
