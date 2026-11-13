import { describe, expect, it, vi } from "vitest";
import { getApiHealth } from "../lib/api-health";

describe("API health", () => {
  it("accepts the documented response and makes an uncached request", async () => {
    const fetcher = vi.fn().mockResolvedValue(new Response(JSON.stringify({ status: "ok" }), { status: 200 }));
    expect(await getApiHealth("http://localhost:8000", fetcher)).toEqual({ available: true });
    expect(fetcher.mock.calls[0][0].toString()).toBe("http://localhost:8000/health");
    expect(fetcher.mock.calls[0][1].cache).toBe("no-store");
  });
  it.each([
    new Response("{}", { status: 200 }),
    new Response("not JSON", { status: 200 }),
    new Response("{}", { status: 503 }),
  ])("treats invalid or unsuccessful responses as unavailable", async (response) => {
    expect(await getApiHealth("http://localhost:8000", vi.fn().mockResolvedValue(response))).toEqual({ available: false });
  });
  it("returns unavailable when the request times out", async () => {
    const fetcher: typeof fetch = (_input, init) => new Promise((_resolve, reject) => {
      init?.signal?.addEventListener("abort", () => reject(init.signal?.reason), { once: true });
    });
    expect(await getApiHealth("http://localhost:8000", fetcher)).toEqual({ available: false });
  }, 10000);
  it("handles a response body interrupted during reading", async () => {
    const stream = new ReadableStream({ start(controller) { controller.error(new Error("connection interrupted")); } });
    const fetcher = vi.fn().mockResolvedValue(new Response(stream, { status: 200 }));
    expect(await getApiHealth("http://localhost:8000", fetcher)).toEqual({ available: false });
  });
  it("handles network errors and invalid configuration", async () => {
    expect(await getApiHealth("http://localhost:8000", vi.fn().mockRejectedValue(new Error("offline")))).toEqual({ available: false });
    expect(await getApiHealth("not-a-url")).toEqual({ available: false });
  });
});
