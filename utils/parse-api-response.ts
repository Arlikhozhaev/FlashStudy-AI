export async function parseApiResponse<T = Record<string, unknown>>(
  response: Response,
): Promise<T> {
  const text = await response.text();

  if (!text.trim()) {
    if (response.status === 504) {
      throw new Error(
        "The request timed out on the server. OpenAI or Firebase may be slow — check Vercel function logs and consider upgrading your Vercel plan for longer timeouts.",
      );
    }

    throw new Error(
      `The server returned an empty response (HTTP ${response.status}). Check Vercel environment variables and deployment logs.`,
    );
  }

  if (text.trimStart().startsWith("<")) {
    throw new Error(
      `The server returned HTML instead of JSON (HTTP ${response.status}). This usually means a crash or misconfigured deployment on Vercel.`,
    );
  }

  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error(
      `The server returned an invalid JSON response (HTTP ${response.status}): ${text.slice(0, 180)}`,
    );
  }
}
