import { afterEach, describe, expect, it, vi } from "vitest";
import { normalizeSiteUrl, resolveSiteUrl } from "@/lib/site-url";

describe("normalizeSiteUrl", () => {
  it("trims and removes trailing slash", () => {
    expect(normalizeSiteUrl("  https://app.example.com/  ")).toBe(
      "https://app.example.com",
    );
  });
});

describe("resolveSiteUrl", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("uses NEXT_PUBLIC_SITE_URL when configured", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://prod.example.com/");
    expect(resolveSiteUrl("http://localhost:3000")).toBe("https://prod.example.com");
  });

  it("uses request origin when env is unset", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "");
    expect(resolveSiteUrl("http://localhost:3000")).toBe("http://localhost:3000");
  });
});
