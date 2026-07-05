import { describe, expect, it } from "vitest";
import {
  getServiceAccountProjectId,
  validateFirebaseProjectConfig,
} from "@/lib/firebase/project";

describe("firebase project helpers", () => {
  it("extracts project id from service account email", () => {
    expect(
      getServiceAccountProjectId(
        "firebase-adminsdk-abc@flashstudy-ai.iam.gserviceaccount.com",
      ),
    ).toBe("flashstudy-ai");
  });

  it("throws when project id and service account project differ", () => {
    expect(() =>
      validateFirebaseProjectConfig(
        "flashstudy-ai",
        "firebase-adminsdk-abc@flashcardsaas-a440e.iam.gserviceaccount.com",
      ),
    ).toThrow(/Firebase project mismatch/);
  });
});
