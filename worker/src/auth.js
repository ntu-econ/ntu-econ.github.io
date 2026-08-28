import { HttpError, cleanEmail, publicRecord, toBoolean } from './util.js';

const GOOGLE_ISSUERS = new Set(['https://accounts.google.com', 'accounts.google.com']);
const GOOGLE_JWKS_URL = 'https://www.googleapis.com/oauth2/v3/certs';
let jwksCache = { keys: [], expiresAt: 0 };

function decodeBase64Url(value) {
  const normalized = String(value).replace(/-/g, '+').replace(/_/g, '/');
  const padded = normalized + '='.repeat((4 - (normalized.length % 4)) % 4);
  let binary;
  try { binary = atob(padded); } catch (_) {
    throw new HttpError(401, 'Google 登入憑證格式不正確。', 'invalid_google_token');
  }
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
  return bytes;
}

function decodeJwtPart(value) {
  try { return JSON.parse(new TextDecoder().decode(decodeBase64Url(value))); } catch (error) {
    if (error instanceof HttpError) throw error;
    throw new HttpError(401, 'Google 登入憑證格式不正確。', 'invalid_google_token');
  }
}

function configuredValue(value, name) {
  const text = String(value || '').trim();
  if (!text || text.startsWith('REPLACE_')) throw new Error(`${name} is not configured.`);
  return text;
}

export function validateGoogleClaims(header, payload, env, nowSeconds = Math.floor(Date.now() / 1000)) {
  const clientId = configuredValue(env.GOOGLE_CLIENT_ID, 'GOOGLE_CLIENT_ID');
  const hostedDomain = configuredValue(env.GOOGLE_HOSTED_DOMAIN, 'GOOGLE_HOSTED_DOMAIN').toLowerCase();
  const clockSkew = Math.max(0, Math.min(300, Number(env.GOOGLE_CLOCK_SKEW_SECONDS || 30)));

  if (!header || header.alg !== 'RS256') {
    throw new HttpError(401, 'Google 登入憑證的簽章演算法不受支援。', 'invalid_google_token');
  }
  if (!payload || !GOOGLE_ISSUERS.has(payload.iss)) {
    throw new HttpError(401, 'Google 登入憑證的簽發者不正確。', 'invalid_google_token');
  }
  const audienceMatches = Array.isArray(payload.aud)
    ? payload.aud.includes(clientId)
    : payload.aud === clientId;
  if (!audienceMatches || (payload.azp != null && payload.azp !== clientId)) {
    throw new HttpError(401, 'Google 登入憑證不屬於本網站。', 'invalid_google_token');
  }
  const expiresAt = Number(payload.exp);
  const issuedAt = Number(payload.iat);
  if (!Number.isFinite(expiresAt) || expiresAt < nowSeconds - clockSkew) {
    throw new HttpError(401, 'Google 登入憑證已過期。', 'expired_google_token');
  }
  if (!Number.isFinite(issuedAt) || issuedAt > nowSeconds + clockSkew) {
    throw new HttpError(401, 'Google 登入憑證的時間不正確。', 'invalid_google_token');
  }
  if (payload.nbf != null && Number(payload.nbf) > nowSeconds + clockSkew) {
    throw new HttpError(401, 'Google 登入憑證尚未生效。', 'invalid_google_token');
  }
  if (payload.email_verified !== true) {
    throw new HttpError(401, 'Google 帳號的 Email 尚未驗證。', 'unverified_google_email');
  }
  if (String(payload.hd || '').toLowerCase() !== hostedDomain) {
    throw new HttpError(403, `請使用 ${hostedDomain} 帳號登入。`, 'wrong_google_domain');
  }
  const email = cleanEmail(payload.email, { domain: hostedDomain });
  const sub = String(payload.sub || '').trim();
  if (!sub || sub.length > 255) {
    throw new HttpError(401, 'Google 登入憑證缺少使用者識別碼。', 'invalid_google_token');
  }

  return {
    sub,
    email,
    name: String(payload.name || email.split('@')[0]).trim().slice(0, 200),
    expiresAt,
  };
}

async function fetchGoogleKeys(forceRefresh = false) {
  const now = Date.now();
  if (!forceRefresh && jwksCache.keys.length && jwksCache.expiresAt > now) return jwksCache.keys;
  const response = await fetch(GOOGLE_JWKS_URL, { headers: { Accept: 'application/json' } });
  if (!response.ok) throw new HttpError(503, 'Google 登入服務暫時無法使用，請稍後再試。', 'google_keys_unavailable');
  const data = await response.json();
  const cacheControl = response.headers.get('Cache-Control') || '';
  const maxAge = Number(cacheControl.match(/max-age=(\d+)/i)?.[1] || 3600);
  jwksCache = {
    keys: Array.isArray(data.keys) ? data.keys : [],
    expiresAt: now + Math.max(60, Math.min(maxAge, 86400)) * 1000,
  };
  return jwksCache.keys;
}

async function getGoogleKey(kid) {
  let keys = await fetchGoogleKeys(false);
  let key = keys.find((candidate) => candidate.kid === kid && candidate.kty === 'RSA');
  if (!key) {
    keys = await fetchGoogleKeys(true);
    key = keys.find((candidate) => candidate.kid === kid && candidate.kty === 'RSA');
  }
  if (!key) throw new HttpError(401, 'Google 登入憑證使用未知的簽章金鑰。', 'invalid_google_token');
  return key;
}

export async function verifyGoogleIdToken(credential, env) {
  const token = String(credential || '');
  if (!token || token.length > 16384) {
    throw new HttpError(401, '缺少有效的 Google 登入憑證。', 'invalid_google_token');
  }
  const parts = token.split('.');
  if (parts.length !== 3 || parts.some((part) => !part)) {
    throw new HttpError(401, 'Google 登入憑證格式不正確。', 'invalid_google_token');
  }
  const header = decodeJwtPart(parts[0]);
  const payload = decodeJwtPart(parts[1]);
  if (header.alg !== 'RS256' || typeof header.kid !== 'string' || !header.kid) {
    throw new HttpError(401, 'Google 登入憑證的簽章資訊不正確。', 'invalid_google_token');
  }
  validateGoogleClaims(header, payload, env);

  const jwk = await getGoogleKey(header.kid);
  const key = await crypto.subtle.importKey(
    'jwk',
    jwk,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['verify'],
  );
  const verified = await crypto.subtle.verify(
    'RSASSA-PKCS1-v1_5',
    key,
    decodeBase64Url(parts[2]),
    new TextEncoder().encode(`${parts[0]}.${parts[1]}`),
  );
  if (!verified) throw new HttpError(401, 'Google 登入憑證簽章無效。', 'invalid_google_token');
  return validateGoogleClaims(header, payload, env);
}

function ownerLists(env) {
  return {
    emails: new Set(String(env.OWNER_ADMINS || '').split(',').map((item) => item.trim().toLowerCase()).filter(Boolean)),
    subs: new Set(String(env.OWNER_SUBS || '').split(',').map((item) => item.trim()).filter(Boolean)),
  };
}

function recordIsActive(record, type) {
  if (!record) return false;
  if (type === 'member') {
    if (String(record.status || '').toLowerCase() !== 'active') return false;
    if (record.validUntil && record.validUntil < new Date().toISOString().slice(0, 10)) return false;
    return true;
  }
  return toBoolean(record.active);
}

function findBoundRecord(rows, user) {
  return rows.find((row) => row.sub && row.sub === user.sub)
    || rows.find((row) => !row.sub && String(row.email || '').trim().toLowerCase() === user.email)
    || null;
}

async function bindRecordIfNeeded(sheets, sheetName, record, user) {
  if (!record || record.sub) return record;
  await sheets.update(sheetName, record, { sub: user.sub });
  return { ...record, sub: user.sub };
}

function parsePermissions(value) {
  const permissions = String(value || '').split(',').map((item) => item.trim()).filter(Boolean);
  return permissions.includes('all') ? ['all'] : [...new Set(permissions)];
}

export async function registerGoogleUser(sheets, googleUser) {
  const users = await sheets.read('Users', { fresh: true });
  const existing = users.find((row) => row.id === googleUser.sub);
  const record = {
    id: googleUser.sub,
    email: googleUser.email,
    name: googleUser.name,
    lastLoginAt: new Date().toISOString(),
  };
  if (existing) await sheets.update('Users', existing, record);
  else await sheets.append('Users', record);
  return googleUser;
}

export async function resolveIdentity(sheets, user, env) {
  const owners = ownerLists(env);
  const owner = owners.subs.has(user.sub) || owners.emails.has(user.email);
  const [memberRows, adminRows] = await Promise.all([
    sheets.read('Members', { fresh: true }),
    sheets.read('Admins', { fresh: true }),
  ]);
  let memberRecord = findBoundRecord(memberRows, user);
  let adminRecord = findBoundRecord(adminRows, user);
  if (memberRecord && !memberRecord.sub) memberRecord = await bindRecordIfNeeded(sheets, 'Members', memberRecord, user);
  if (adminRecord && !adminRecord.sub) adminRecord = await bindRecordIfNeeded(sheets, 'Admins', adminRecord, user);

  const admin = owner || recordIsActive(adminRecord, 'admin');
  const member = admin || recordIsActive(memberRecord, 'member');
  const permissions = owner ? ['all'] : (admin ? parsePermissions(adminRecord.permissions) : []);
  const roles = ['ntu'];
  if (member) roles.push('member');
  if (admin) roles.push('admin');
  if (owner) roles.push('owner');

  return {
    sub: user.sub,
    email: user.email,
    name: user.name || user.email.split('@')[0],
    roles,
    member,
    admin,
    owner,
    permissions,
  };
}

export async function resolveIdentityFromSub(sheets, sub, env) {
  const user = (await sheets.read('Users', { fresh: true })).find((row) => row.id === sub);
  if (!user) throw new HttpError(401, '登入狀態已失效，請重新登入。', 'invalid_session');
  return resolveIdentity(sheets, {
    sub: user.id,
    email: cleanEmail(user.email, { domain: String(env.GOOGLE_HOSTED_DOMAIN || '').toLowerCase() }),
    name: String(user.name || ''),
  }, env);
}

export function clientProfile(identity) {
  return publicRecord({
    email: identity.email,
    name: identity.name,
    roles: identity.roles,
    member: identity.member,
    admin: identity.admin,
    owner: identity.owner,
    permissions: identity.permissions,
  });
}
