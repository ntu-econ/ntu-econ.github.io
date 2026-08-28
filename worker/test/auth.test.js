import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { validateGoogleClaims } from "../src/auth.js";

const NOW_SECONDS = 1_800_000_000;
const GOOGLE_CLIENT_ID =
  "1234567890-ntu-econ.apps.googleusercontent.com";
const GOOGLE_HOSTED_DOMAIN = "g.ntu.edu.tw";

const env = Object.freeze({
  GOOGLE_CLIENT_ID,
  GOOGLE_HOSTED_DOMAIN,
  GOOGLE_CLOCK_SKEW_SECONDS: "30",
});

const validHeader = Object.freeze({
  alg: "RS256",
  kid: "google-test-key",
  typ: "JWT",
});

function validPayload(overrides = {}) {
  return {
    iss: "https://accounts.google.com",
    sub: "google-user-1234567890",
    aud: GOOGLE_CLIENT_ID,
    azp: GOOGLE_CLIENT_ID,
    iat: NOW_SECONDS - 30,
    exp: NOW_SECONDS + 3_600,
    hd: GOOGLE_HOSTED_DOMAIN,
    email: "student@g.ntu.edu.tw",
    email_verified: true,
    ...overrides,
  };
}

async function assertAccepted(header, payload) {
  await assert.doesNotReject(async () => {
    await validateGoogleClaims(header, payload, env, NOW_SECONDS);
  });
}

async function assertRejected(header, payload) {
  await assert.rejects(async () => {
    await validateGoogleClaims(header, payload, env, NOW_SECONDS);
  });
}

describe("validateGoogleClaims", () => {
  it("accepts a complete Google claim set for the configured NTU domain", async () => {
    await assertAccepted(validHeader, validPayload());
  });

  it("accepts Google's legacy issuer value", async () => {
    await assertAccepted(
      validHeader,
      validPayload({ iss: "accounts.google.com" }),
    );
  });

  it("accepts a token when the optional azp claim is absent", async () => {
    const payload = validPayload();
    delete payload.azp;

    await assertAccepted(validHeader, payload);
  });

  it("rejects a token issued for another OAuth client", async () => {
    await assertRejected(
      validHeader,
      validPayload({ aud: "attacker.apps.googleusercontent.com" }),
    );
  });

  it("rejects an untrusted issuer", async () => {
    await assertRejected(
      validHeader,
      validPayload({ iss: "https://accounts.example.com" }),
    );
  });

  it("rejects a Google Workspace account from another hosted domain", async () => {
    await assertRejected(
      validHeader,
      validPayload({
        hd: "example.edu.tw",
        email: "student@example.edu.tw",
      }),
    );
  });

  it("rejects a suffix-only email when the signed hd claim is absent", async () => {
    const payload = validPayload();
    delete payload.hd;

    await assertRejected(validHeader, payload);
  });

  it("rejects an expired token outside the configured clock skew", async () => {
    await assertRejected(
      validHeader,
      validPayload({ exp: NOW_SECONDS - 300 }),
    );
  });

  it("rejects a token issued materially in the future", async () => {
    await assertRejected(
      validHeader,
      validPayload({ iat: NOW_SECONDS + 300 }),
    );
  });

  it("rejects an unverified email", async () => {
    await assertRejected(
      validHeader,
      validPayload({ email_verified: false }),
    );
  });

  it("rejects an unsigned alg=none header", async () => {
    await assertRejected(
      { ...validHeader, alg: "none" },
      validPayload(),
    );
  });

  it("rejects a mismatched authorized party when azp is present", async () => {
    await assertRejected(
      validHeader,
      validPayload({ azp: "other-client.apps.googleusercontent.com" }),
    );
  });

  it("rejects a token without Google's stable subject identifier", async () => {
    const payload = validPayload();
    delete payload.sub;

    await assertRejected(validHeader, payload);
  });
});
