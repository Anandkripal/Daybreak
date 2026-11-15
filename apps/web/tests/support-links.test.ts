import { describe, expect, it } from "vitest";
import { supportLinks } from "../lib/support-links";

describe("support starting points", () => {
  it("uses unique identifiers and HTTPS links to the stated organisations", () => {
    expect(new Set(supportLinks.map((link) => link.id)).size).toBe(supportLinks.length);
    const allowedHosts = ["askizzy.org.au", "ndh.org.au", "www.service.nsw.gov.au"];
    for (const link of supportLinks) {
      const url = new URL(link.url);
      expect(url.protocol).toBe("https:");
      expect(allowedHosts).toContain(url.hostname);
      expect(link.checked).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });
});
