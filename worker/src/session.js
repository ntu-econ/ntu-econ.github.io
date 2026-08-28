import { HttpError, parseCookies } from './util.js';

export const SESSION_COOKIE = '__Host-ntu_econ_session';
export const CSRF_COOKIE = '__Host-ntu_econ_csrf';

function bytesToBase64Url(bytes) {
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function base64UrlToBytes(value) {
  const normalized = String(value).replace(/-/g, '+').replace(/_/g, '/');
  const padded = normalized + '='.repeat((4 - normalized.length % 4) % 4);
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
  return bytes;
}

function configuredSecret(env) {
  const secret = String(env.SESSION_SECRET || '');
  if (secret.length < 32 || secret.startsWith('replace-')) throw new Error('SESSION_SECRET must contain at least 32 characters.');
  return secret;
}

async function hmacKey(env) {
  return crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(configuredSecret(env)),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify'],
  );
}

function cookie(value, { maxAge, httpOnly = true } = {}) {
  const parts = [value, 'Path=/', 'Secure', 'SameSite=Strict'];
  if (httpOnly) parts.push('HttpOnly');
  if (Number.isFinite(maxAge)) parts.push(`Max-Age=${Math.max(0, Math.floor(maxAge))}`);
  return parts.join('; ');
}

export function clearSessionCookie() {
  return cookie(`${SESSION_COOKIE}=`, { maxAge: 0 });
}

export function clearCsrfCookie() {
  return cookie(`${CSRF_COOKIE}=`, { maxAge: 0 });
}

export async function createSessionCookie(sub, googleExpiresAt, env) {
  const now = Math.floor(Date.now() / 1000);
  const configuredTtl = Math.max(300, Math.min(28800, Number(env.SESSION_TTL_SECONDS || 3600)));
  const expiresAt = Math.min(Number(googleExpiresAt || now + configuredTtl), now + configuredTtl);
  const payload = bytesToBase64Url(new TextEncoder().encode(JSON.stringify({ v: 1, sub, iat: now, exp: expiresAt })));
  const signature = await crypto.subtle.sign('HMAC', await hmacKey(env), new TextEncoder().encode(payload));
  const value = `${payload}.${bytesToBase64Url(new Uint8Array(signature))}`;
  return cookie(`${SESSION_COOKIE}=${encodeURIComponent(value)}`, { maxAge: expiresAt - now });
}

export async function readSession(request, env) {
  const value = parseCookies(request)[SESSION_COOKIE];
  if (!value) throw new HttpError(401, '請先登入。', 'login_required');
  if (value.length > 4096) throw new HttpError(401, '登入狀態無效，請重新登入。', 'invalid_session');
  const parts = value.split('.');
  if (parts.length !== 2) throw new HttpError(401, '登入狀態無效，請重新登入。', 'invalid_session');
  let signature;
  try { signature = base64UrlToBytes(parts[1]); } catch (_) {
    throw new HttpError(401, '登入狀態無效，請重新登入。', 'invalid_session');
  }
  const valid = await crypto.subtle.verify('HMAC', await hmacKey(env), signature, new TextEncoder().encode(parts[0]));
  if (!valid) throw new HttpError(401, '登入狀態無效，請重新登入。', 'invalid_session');
  let payload;
  try { payload = JSON.parse(new TextDecoder().decode(base64UrlToBytes(parts[0]))); } catch (_) {
    throw new HttpError(401, '登入狀態無效，請重新登入。', 'invalid_session');
  }
  const now = Math.floor(Date.now() / 1000);
  const issuedAt = Number(payload.iat);
  const expiresAt = Number(payload.exp);
  const maximumTtl = Math.max(300, Math.min(28800, Number(env.SESSION_TTL_SECONDS || 3600)));
  if (
    payload.v !== 1
    || typeof payload.sub !== 'string'
    || !payload.sub
    || payload.sub.length > 255
    || !Number.isFinite(issuedAt)
    || !Number.isFinite(expiresAt)
    || issuedAt > now + 30
    || expiresAt <= now
    || expiresAt - issuedAt > maximumTtl + 60
  ) {
    throw new HttpError(401, '登入狀態已過期，請重新登入。', 'expired_session');
  }
  return payload;
}

function validCsrfToken(value) {
  return /^[A-Za-z0-9_-]{43}$/.test(String(value || ''));
}

export function csrfTokenFromRequest(request) {
  const token = parseCookies(request)[CSRF_COOKIE] || '';
  return validCsrfToken(token) ? token : '';
}

export function issueCsrfToken(maxAge = 7200, existingToken = '') {
  const bytes = new Uint8Array(32);
  if (!validCsrfToken(existingToken)) crypto.getRandomValues(bytes);
  const token = validCsrfToken(existingToken) ? String(existingToken) : bytesToBase64Url(bytes);
  return {
    token,
    cookie: cookie(`${CSRF_COOKIE}=${encodeURIComponent(token)}`, { maxAge }),
  };
}

function constantTimeEqual(left, right) {
  const leftBytes = new TextEncoder().encode(String(left || ''));
  const rightBytes = new TextEncoder().encode(String(right || ''));
  if (leftBytes.length !== rightBytes.length) return false;
  let result = 0;
  for (let index = 0; index < leftBytes.length; index += 1) result |= leftBytes[index] ^ rightBytes[index];
  return result === 0;
}

export function verifyCsrf(request, submittedToken = '') {
  const cookieToken = parseCookies(request)[CSRF_COOKIE] || '';
  const headerToken = request.headers.get('X-CSRF-Token') || submittedToken || '';
  if (!cookieToken || !headerToken || !constantTimeEqual(cookieToken, headerToken)) {
    throw new HttpError(403, '安全驗證已失效，請重新整理頁面後再試。', 'invalid_csrf');
  }
}

export function requireSameOrigin(request) {
  const expected = new URL(request.url).origin;
  const origin = request.headers.get('Origin');
  if (origin && origin !== expected) throw new HttpError(403, '不允許跨網站執行此操作。', 'invalid_origin');
  const fetchSite = request.headers.get('Sec-Fetch-Site');
  if (fetchSite && !['same-origin', 'none'].includes(fetchSite)) {
    throw new HttpError(403, '不允許跨網站執行此操作。', 'invalid_origin');
  }
}
