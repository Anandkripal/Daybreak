export type ApiHealth = { status: "ok" };
export type HealthResult = { available: true } | { available: false };

// This request is made by the web server; no user information is sent.
export async function getApiHealth(baseUrl: string, fetcher: typeof fetch = fetch): Promise<HealthResult> {
  try {
    const response = await fetcher(new URL("/health", baseUrl), {
      cache: "no-store",
      signal: AbortSignal.timeout(3000),
    });
    if (!response.ok) return { available: false };
    const body: unknown = await response.json();
    if (typeof body !== "object" || body === null || !("status" in body) || body.status !== "ok") {
      return { available: false };
    }
    return { available: true };
  } catch {
    return { available: false };
  }
}
