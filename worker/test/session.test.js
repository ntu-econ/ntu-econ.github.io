import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  CSRF_COOKIE,
  SESSION_COOKIE,
  createSessionCookie,
  csrfTokenFromRequest,
  issueCsrfToken,
  readSession,
  verifyCsrf,
} from '../src/session.js';

const env = {
  SESSION_SECRET: 'test-only-session-secret-with-more-than-32-characters',
  SESSION_TTL_SECONDS: '3600',
};

function cookiePair(setCookie) {
  return setCookie.split(';', 1)[0];
}

describe('signed portal session', () => {
  it('round-trips a signed HttpOnly session cookie', async () => {
    const setCookie = await createSessionCookie('google-sub-123', Math.floor(Date.now() / 1000) + 3600, env);
    assert.match(setCookie, new RegExp(`^${SESSION_COOKIE}=`));
    assert.match(setCookie, /HttpOnly/);
    assert.match(setCookie, /Secure/);
    assert.match(setCookie, /SameSite=Strict/);
    const request = new Request('https://portal.example.test/api/me', {
      headers: { Cookie: cookiePair(setCookie), 'Sec-Fetch-Site': 'same-origin' },
    });
    const session = await readSession(request, env);
    assert.equal(session.sub, 'google-sub-123');
  });

  it('rejects a tampered session cookie', async () => {
    const setCookie = await createSessionCookie('google-sub-123', Math.floor(Date.now() / 1000) + 3600, env);
    const pair = cookiePair(setCookie);
    const separator = pair.indexOf('=');
    const name = pair.slice(0, separator);
    const value = decodeURIComponent(pair.slice(separator + 1));
    const [payload, signature] = value.split('.');
    const tamperedSignature = `${signature.startsWith('a') ? 'b' : 'a'}${signature.slice(1)}`;
    const tampered = `${name}=${encodeURIComponent(`${payload}.${tamperedSignature}`)}`;
    const request = new Request('https://portal.example.test/api/me', { headers: { Cookie: tampered } });
    await assert.rejects(() => readSession(request, env));
  });
});

describe('double-submit CSRF token', () => {
  it('accepts only the token matching the HttpOnly cookie', () => {
    const csrf = issueCsrfToken();
    assert.match(csrf.cookie, new RegExp(`^${CSRF_COOKIE}=`));
    const request = new Request('https://portal.example.test/api/admin', {
      method: 'POST',
      headers: { Cookie: cookiePair(csrf.cookie), 'X-CSRF-Token': csrf.token },
    });
    assert.doesNotThrow(() => verifyCsrf(request));
  });

  it('rejects a mismatched token', () => {
    const csrf = issueCsrfToken();
    const request = new Request('https://portal.example.test/api/admin', {
      method: 'POST',
      headers: { Cookie: cookiePair(csrf.cookie), 'X-CSRF-Token': `${csrf.token}x` },
    });
    assert.throws(() => verifyCsrf(request));
  });

  it('reuses a valid cookie token across tabs instead of rotating it', () => {
    const first = issueCsrfToken();
    const request = new Request('https://portal.example.test/api/auth/config', {
      headers: { Cookie: cookiePair(first.cookie) },
    });
    const second = issueCsrfToken(7200, csrfTokenFromRequest(request));
    assert.equal(second.token, first.token);
    assert.equal(cookiePair(second.cookie), cookiePair(first.cookie));
  });
});
