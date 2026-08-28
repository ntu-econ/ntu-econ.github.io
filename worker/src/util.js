export class HttpError extends Error {
  constructor(status, message, code = 'request_failed') {
    super(message);
    this.name = 'HttpError';
    this.status = status;
    this.code = code;
  }
}

export function cleanText(value, { name = '欄位', max = 500, required = false } = {}) {
  const text = String(value ?? '').trim();
  if (required && !text) throw new HttpError(400, `${name}不可空白。`, 'invalid_input');
  if (text.length > max) throw new HttpError(400, `${name}不可超過 ${max} 個字元。`, 'invalid_input');
  return text;
}

export function cleanEmail(value, { required = true, domain = '' } = {}) {
  const email = cleanText(value, { name: 'Email', max: 320, required }).toLowerCase();
  if (!email) return '';
  if (!/^[^\s@]+@[^\s@]+$/.test(email)) {
    throw new HttpError(400, 'Email 格式不正確。', 'invalid_email');
  }
  if (domain && email.split('@').pop() !== domain.toLowerCase()) {
    throw new HttpError(400, `Email 必須使用 @${domain}。`, 'invalid_email_domain');
  }
  return email;
}

export function cleanDate(value, { name = '日期', required = false } = {}) {
  const text = cleanText(value, { name, max: 32, required });
  if (!text) return '';
  if (!/^\d{4}-\d{2}-\d{2}(?:T\d{2}:\d{2}(?::\d{2})?(?:\.\d+)?Z?)?$/.test(text)) {
    throw new HttpError(400, `${name}格式不正確。`, 'invalid_date');
  }
  return text;
}

export function cleanUrl(value, { name = '網址', required = false, allowRelative = false } = {}) {
  const text = cleanText(value, { name, max: 2048, required });
  if (!text) return '';
  if (allowRelative && (/^\/(?!\/)/.test(text) || /^[A-Za-z0-9][A-Za-z0-9._~\-/]*(?:\?[A-Za-z0-9._~!$&'()*+,;=:@%/?-]*)?$/.test(text))) {
    return text;
  }
  let parsed;
  try { parsed = new URL(text); } catch (_) {
    throw new HttpError(400, `${name}格式不正確。`, 'invalid_url');
  }
  if (!['http:', 'https:'].includes(parsed.protocol)) {
    throw new HttpError(400, `${name}僅接受 http 或 https。`, 'invalid_url');
  }
  return parsed.toString();
}

export function toBoolean(value) {
  return value === true || String(value).toLowerCase() === 'true' || String(value) === '1';
}

export function toInteger(value, { min = -1000000, max = 1000000, fallback = 0 } = {}) {
  const number = Number.parseInt(String(value ?? ''), 10);
  if (!Number.isFinite(number)) return fallback;
  return Math.max(min, Math.min(max, number));
}

export function nowIso() {
  return new Date().toISOString();
}

export function publicRecord(row, booleanFields = [], integerFields = []) {
  const out = {};
  for (const [key, value] of Object.entries(row || {})) {
    if (key !== '__row') out[key] = value ?? '';
  }
  for (const key of booleanFields) out[key] = toBoolean(out[key]);
  for (const key of integerFields) out[key] = toInteger(out[key]);
  return out;
}

export function parseCookies(request) {
  const result = {};
  const raw = request.headers.get('Cookie') || '';
  for (const part of raw.split(';')) {
    const index = part.indexOf('=');
    if (index < 1) continue;
    const key = part.slice(0, index).trim();
    const value = part.slice(index + 1).trim();
    try { result[key] = decodeURIComponent(value); } catch (_) { result[key] = value; }
  }
  return result;
}

export function jsonResponse(data, { status = 200, headers = {} } = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'X-Content-Type-Options': 'nosniff',
      ...headers,
    },
  });
}

export async function readJson(request, maxBytes = 131072) {
  const contentLength = Number(request.headers.get('Content-Length') || 0);
  if (contentLength > maxBytes) throw new HttpError(413, '資料量過大。', 'payload_too_large');
  let data;
  try { data = await request.json(); } catch (_) {
    throw new HttpError(400, '請求內容不是有效的 JSON。', 'invalid_json');
  }
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    throw new HttpError(400, '請求內容格式不正確。', 'invalid_json');
  }
  return data;
}
