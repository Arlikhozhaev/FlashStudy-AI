import { describe, expect, it } from "vitest";
import { GET } from "@/app/api/health/route";

describe("GET /api/health", () => {
  it("returns service health metadata", async () => {
    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.service).toBe("flashstudy-ai");
    expect(typeof body.timestamp).toBe("string");
    expect(body.checks).toBeDefined();
  });
});
