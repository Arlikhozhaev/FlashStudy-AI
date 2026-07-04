import { describe, expect, it } from "vitest";
import {
  isValidPrivateKey,
  normalizePrivateKey,
} from "@/lib/firebase/normalize-key";

describe("normalizePrivateKey", () => {
  it("converts escaped newlines", () => {
    const key = normalizePrivateKey(
      "-----BEGIN PRIVATE KEY-----\\nabc\\n-----END PRIVATE KEY-----\\n",
    );

    expect(key).toContain("\nabc\n");
    expect(isValidPrivateKey(key)).toBe(true);
  });

  it("strips surrounding quotes", () => {
    const key = normalizePrivateKey(
      '"-----BEGIN PRIVATE KEY-----\\nabc\\n-----END PRIVATE KEY-----\\n"',
    );

    expect(key.startsWith('"')).toBe(false);
    expect(isValidPrivateKey(key)).toBe(true);
  });
});
