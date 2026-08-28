import { Sheets } from './sheets.js';
import { ensureSchema } from './schema.js';
import {
  clientProfile,
  registerGoogleUser,
  resolveIdentity,
  resolveIdentityFromSub,
  verifyGoogleIdToken,
} from './auth.js';
import {
  clearCsrfCookie,
  clearSessionCookie,
  createSessionCookie,
  csrfTokenFromRequest,
  issueCsrfToken,
  readSession,
  requireSameOrigin,
  verifyCsrf,
} from './session.js';
import { getMemberContent, getPublicHome, getPublicLinks, getPublicPage } from './content.js';
import { adminDispatch } from './admin.js';
import { HttpError, jsonResponse, readJson } from './util.js';

function isConfigured(value) {
  const text = String(value || '').trim();
  return Boolean(text && !text.startsWith('REPLACE_'));
}

function allowedPublicOrigin(request, env) {
  const origin = request.headers.get('Origin') || '';
  const allowed = new Set(
    String(env.PUBLIC_SITE_ORIGINS || '')
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean),
  );
  return origin && allowed.has(origin) ? origin : '';
}

function publicCorsHeaders(request, env) {
  const origin = allowedPublicOrigin(request, env);
  if (!origin) return { Vary: 'Origin' };
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin',
  };
}

function privateHeaders(extra = {}) {
  return {
    'Cache-Control': 'private, no-store',
    Pragma: 'no-cache',
    ...extra,
  };
}

function withCookies(response, cookies) {
  const headers = new Headers(response.headers);
  for (const value of cookies.filter(Boolean)) headers.append('Set-Cookie', value);
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
}

function requirePortalConfig(env) {
  if (!isConfigured(env.GOOGLE_CLIENT_ID)) throw new HttpError(503, 'Google 登入尚未完成設定。', 'auth_not_configured');
  if (!isConfigured(env.SPREADSHEET_ID)) throw new HttpError(503, '會員資料庫尚未完成設定。', 'storage_not_configured');
}

async function authenticatedContext(request, env) {
  requireSameOrigin(request);
  const session = await readSession(request, env);
  const sheets = new Sheets(env);
  await ensureSchema(sheets);
  const identity = await resolveIdentityFromSub(sheets, session.sub, env);
  return { session, sheets, identity, env };
}

async function handleAuthConfig(request, env) {
  const csrf = issueCsrfToken(
    Number(env.SESSION_TTL_SECONDS || 3600) + 600,
    csrfTokenFromRequest(request),
  );
  const response = jsonResponse({
    ok: true,
    configured: isConfigured(env.GOOGLE_CLIENT_ID) && isConfigured(env.SPREADSHEET_ID),
    googleClientId: isConfigured(env.GOOGLE_CLIENT_ID) ? env.GOOGLE_CLIENT_ID : '',
    hostedDomain: String(env.GOOGLE_HOSTED_DOMAIN || 'g.ntu.edu.tw'),
    csrfToken: csrf.token,
  }, { headers: privateHeaders() });
  return withCookies(response, [csrf.cookie]);
}

async function handleGoogleLogin(request, env) {
  requireSameOrigin(request);
  requirePortalConfig(env);
  const body = await readJson(request, 32768);
  verifyCsrf(request, body.csrfToken);
  const googleUser = await verifyGoogleIdToken(body.credential, env);
  const sheets = new Sheets(env);
  await ensureSchema(sheets);
  await registerGoogleUser(sheets, googleUser);
  const identity = await resolveIdentity(sheets, googleUser, env);
  const sessionCookie = await createSessionCookie(identity.sub, googleUser.expiresAt, env);
  const response = jsonResponse({ ok: true, profile: clientProfile(identity) }, { headers: privateHeaders() });
  return withCookies(response, [sessionCookie]);
}

async function handleLogout(request) {
  requireSameOrigin(request);
  const body = await readJson(request).catch(() => ({}));
  verifyCsrf(request, body.csrfToken);
  const response = jsonResponse({ ok: true }, { headers: privateHeaders() });
  return withCookies(response, [clearSessionCookie(), clearCsrfCookie()]);
}

async function handleMe(request, env) {
  const context = await authenticatedContext(request, env);
  return jsonResponse({ ok: true, profile: clientProfile(context.identity) }, { headers: privateHeaders() });
}

async function handleMemberContent(request, env) {
  const context = await authenticatedContext(request, env);
  if (!context.identity.member) throw new HttpError(403, '此帳號不在有效會員名單中。', 'member_required');
  const items = await getMemberContent(context.sheets);
  return jsonResponse({ ok: true, items }, { headers: privateHeaders() });
}

async function handleAdmin(request, env) {
  const context = await authenticatedContext(request, env);
  if (!context.identity.admin) throw new HttpError(403, '此帳號沒有後台權限。', 'admin_required');
  const body = await readJson(request);
  verifyCsrf(request, body.csrfToken);
  const action = String(body.action || '').trim();
  if (!action) throw new HttpError(400, '缺少後台操作名稱。', 'missing_action');
  const result = await adminDispatch(action, body.args, context);
  return jsonResponse({ ok: true, result }, { headers: privateHeaders() });
}

async function handlePublicHome(request, env) {
  const sheets = new Sheets(env);
  await ensureSchema(sheets);
  const result = await getPublicHome(sheets);
  const maxAge = Math.max(0, Math.min(300, Number(env.PUBLIC_CACHE_SECONDS || 60)));
  return jsonResponse({ ok: true, ...result }, {
    headers: {
      ...publicCorsHeaders(request, env),
      'Cache-Control': `public, max-age=${maxAge}, stale-while-revalidate=300`,
    },
  });
}

async function handlePublicLinks(request, env) {
  const sheets = new Sheets(env);
  await ensureSchema(sheets);
  const result = await getPublicLinks(sheets);
  const maxAge = Math.max(0, Math.min(300, Number(env.PUBLIC_CACHE_SECONDS || 60)));
  return jsonResponse({ ok: true, ...result }, {
    headers: {
      ...publicCorsHeaders(request, env),
      'Cache-Control': `public, max-age=${maxAge}, stale-while-revalidate=300`,
    },
  });
}

async function handlePublicPage(request, env) {
  const slug = new URL(request.url).searchParams.get('slug') || '';
  if (!['about', 'review', 'support'].includes(slug)) {
    throw new HttpError(400, '不支援此頁面。', 'invalid_page_slug');
  }
  const sheets = new Sheets(env);
  await ensureSchema(sheets);
  const result = await getPublicPage(sheets, slug);
  const maxAge = Math.max(0, Math.min(300, Number(env.PUBLIC_CACHE_SECONDS || 60)));
  return jsonResponse({ ok: true, ...result }, {
    headers: {
      ...publicCorsHeaders(request, env),
      'Cache-Control': `public, max-age=${maxAge}, stale-while-revalidate=300`,
    },
  });
}

function secureAssetResponse(response, pathname) {
  const headers = new Headers(response.headers);
  headers.set('X-Content-Type-Options', 'nosniff');
  headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  headers.set('X-Frame-Options', 'DENY');
  headers.set('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
  headers.set('Cross-Origin-Resource-Policy', 'same-origin');
  headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  if (pathname.startsWith('/admin') || pathname.startsWith('/member') || pathname === '/') {
    headers.set(
      'Content-Security-Policy',
      "default-src 'self'; script-src 'self' https://accounts.google.com/gsi/client; style-src 'self' https://accounts.google.com/gsi/style; img-src 'self' data:; font-src 'self'; connect-src 'self' https://accounts.google.com/gsi/; frame-src https://accounts.google.com/gsi/; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'",
    );
    if ((headers.get('Content-Type') || '').includes('text/html')) headers.set('Cache-Control', 'no-cache');
  }
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
}

async function route(request, env) {
  const url = new URL(request.url);
  const pathname = url.pathname.replace(/\/{2,}/g, '/');

  if (request.method === 'OPTIONS' && pathname.startsWith('/api/public/')) {
    const origin = allowedPublicOrigin(request, env);
    if (!origin) return new Response(null, { status: 403 });
    return new Response(null, { status: 204, headers: publicCorsHeaders(request, env) });
  }

  if (request.method === 'GET' && pathname === '/api/health') {
    return jsonResponse({
      ok: true,
      service: 'ntu-econ-portal',
      configured: {
        google: isConfigured(env.GOOGLE_CLIENT_ID),
        sheets: isConfigured(env.SPREADSHEET_ID),
        serviceAccount: Boolean(env.GOOGLE_SA_KEY),
        session: Boolean(env.SESSION_SECRET),
      },
    }, { headers: { 'Cache-Control': 'no-store' } });
  }
  if (request.method === 'GET' && pathname === '/api/auth/config') return handleAuthConfig(request, env);
  if (request.method === 'POST' && pathname === '/api/auth/google') return handleGoogleLogin(request, env);
  if (request.method === 'POST' && pathname === '/api/auth/logout') return handleLogout(request);
  if (request.method === 'GET' && pathname === '/api/me') return handleMe(request, env);
  if (request.method === 'GET' && pathname === '/api/member/content') return handleMemberContent(request, env);
  if (request.method === 'POST' && pathname === '/api/admin') return handleAdmin(request, env);
  if (request.method === 'GET' && pathname === '/api/public/home') return handlePublicHome(request, env);
  if (request.method === 'GET' && pathname === '/api/public/links') return handlePublicLinks(request, env);
  if (request.method === 'GET' && pathname === '/api/public/page') return handlePublicPage(request, env);

  if (pathname.startsWith('/api/')) throw new HttpError(404, '找不到此 API。', 'not_found');
  if (request.method !== 'GET' && request.method !== 'HEAD') throw new HttpError(405, '不支援此操作。', 'method_not_allowed');
  if (pathname === '/') return Response.redirect(`${url.origin}/member/`, 302);
  if (pathname === '/member') return Response.redirect(`${url.origin}/member/`, 308);
  if (pathname === '/admin') return Response.redirect(`${url.origin}/admin/`, 308);
  return secureAssetResponse(await env.ASSETS.fetch(request), pathname);
}

export default {
  async fetch(request, env) {
    try {
      return await route(request, env);
    } catch (error) {
      const status = error instanceof HttpError ? error.status : 500;
      const code = error instanceof HttpError ? error.code : 'internal_error';
      console.error({ event: 'request_failed', path: new URL(request.url).pathname, status, code });
      const message = error instanceof HttpError
        ? error.message
        : '系統暫時發生錯誤，請稍後再試。';
      let response = jsonResponse({ ok: false, error: message, code }, { status, headers: privateHeaders() });
      if (status === 401) response = withCookies(response, [clearSessionCookie()]);
      return response;
    }
  },
};
