import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import { verifyGoogleIdToken } from '../src/auth.js';

const env = {
  GOOGLE_CLIENT_ID: 'signature-test.apps.googleusercontent.com',
  GOOGLE_HOSTED_DOMAIN: 'g.ntu.edu.tw',
};

let originalFetch;
let privateKey;
let publicJwk;
let kid;

function encode(value) {
  return Buffer.from(typeof value === 'string' ? value : JSON.stringify(value)).toString('base64url');
}

async function token(payloadOverrides = {}) {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: 'RS256', typ: 'JWT', kid };
  const payload = {
    iss: 'https://accounts.google.com',
    sub: 'signature-test-subject',
    aud: env.GOOGLE_CLIENT_ID,
    azp: env.GOOGLE_CLIENT_ID,
    iat: now - 5,
    exp: now + 300,
    hd: env.GOOGLE_HOSTED_DOMAIN,
    email: 'student@g.ntu.edu.tw',
    email_verified: true,
    name: 'Test Student',
    ...payloadOverrides,
  };
  const unsigned = `${encode(header)}.${encode(payload)}`;
  const signature = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    privateKey,
    new TextEncoder().encode(unsigned),
  );
  return `${unsigned}.${Buffer.from(signature).toString('base64url')}`;
}

before(async () => {
  originalFetch = globalThis.fetch;
  const keys = await crypto.subtle.generateKey(
    { name: 'RSASSA-PKCS1-v1_5', modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: 'SHA-256' },
    true,
    ['sign', 'verify'],
  );
  privateKey = keys.privateKey;
  publicJwk = await crypto.subtle.exportKey('jwk', keys.publicKey);
  kid = `test-${crypto.randomUUID()}`;
  publicJwk = { ...publicJwk, kid, alg: 'RS256', use: 'sig' };
  globalThis.fetch = async () => new Response(JSON.stringify({ keys: [publicJwk] }), {
    status: 200,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=300' },
  });
});

after(() => {
  globalThis.fetch = originalFetch;
});

describe('verifyGoogleIdToken signature', () => {
  it('accepts a correctly signed Google-shaped token', async () => {
    const result = await verifyGoogleIdToken(await token(), env);
    assert.equal(result.sub, 'signature-test-subject');
    assert.equal(result.email, 'student@g.ntu.edu.tw');
  });

  it('rejects a claim payload changed after signing', async () => {
    const signed = await token();
    const parts = signed.split('.');
    const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf8'));
    payload.email = 'another-student@g.ntu.edu.tw';
    const tampered = `${parts[0]}.${encode(payload)}.${parts[2]}`;
    await assert.rejects(() => verifyGoogleIdToken(tampered, env));
  });
});
