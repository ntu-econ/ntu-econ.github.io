(function () {
  'use strict';

  var state = {
    config: null,
    csrfToken: '',
    me: null,
  };

  function ApiError(status, message, data) {
    this.name = 'ApiError';
    this.status = status;
    this.message = message || ('HTTP ' + status);
    this.data = data || null;
    if (Error.captureStackTrace) Error.captureStackTrace(this, ApiError);
  }
  ApiError.prototype = Object.create(Error.prototype);
  ApiError.prototype.constructor = ApiError;

  function text(value) {
    return value == null ? '' : String(value);
  }

  function trimmed(value) {
    return text(value).trim();
  }

  function bool(value, fallback) {
    if (value === true || value === 'true' || value === 1 || value === '1') return true;
    if (value === false || value === 'false' || value === 0 || value === '0' || value === '') return false;
    return fallback === true;
  }

  async function request(path, options) {
    var opts = options || {};
    var headers = new Headers(opts.headers || {});
    headers.set('Accept', 'application/json');
    if (opts.body != null && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json');

    var response;
    try {
      response = await fetch(path, {
        method: opts.method || 'GET',
        headers: headers,
        body: opts.body,
        credentials: 'same-origin',
        cache: 'no-store',
        signal: opts.signal,
      });
    } catch (error) {
      throw new ApiError(0, '無法連線至網站服務，請確認網路後重試。', { cause: error });
    }

    var data = null;
    if (response.status !== 204) {
      try { data = await response.json(); } catch (error) { data = null; }
    }
    if (!response.ok) {
      var message = data && (data.error || data.message);
      if (!message && response.status === 401) message = '登入已失效，請重新登入。';
      if (!message && response.status === 403) message = '您的帳號沒有此功能的權限。';
      throw new ApiError(response.status, message || ('操作失敗（HTTP ' + response.status + '）'), data);
    }
    if (data && data.csrfToken) state.csrfToken = text(data.csrfToken);
    return data;
  }

  async function loadConfig(force) {
    if (state.config && !force) return state.config;
    var response = await request('/api/auth/config');
    var config = response && response.result ? response.result : response;
    state.config = config || {};
    state.csrfToken = text(state.config.csrfToken || state.csrfToken);
    return state.config;
  }

  function configDomain(config) {
    return trimmed(config && (config.domain || config.hostedDomain || config.googleHostedDomain)) || 'g.ntu.edu.tw';
  }

  function configClientId(config) {
    return trimmed(config && (config.googleClientId || config.clientId || config.google_client_id));
  }

  function isInvalidCsrf(error) {
    return !!(error && error.status === 403 && error.data && error.data.code === 'invalid_csrf');
  }

  async function waitForGoogle() {
    var started = Date.now();
    while (!(window.google && window.google.accounts && window.google.accounts.id)) {
      if (Date.now() - started > 12000) {
        throw new Error('Google 登入元件載入逾時，請關閉內容阻擋器後重新整理。');
      }
      await new Promise(function (resolve) { window.setTimeout(resolve, 100); });
    }
    return window.google;
  }

  async function loginWithGoogle(credential, retried) {
    var config = await loadConfig(false);
    var csrf = text(config.csrfToken || state.csrfToken);
    var data;
    try {
      data = await request('/api/auth/google', {
        method: 'POST',
        body: JSON.stringify({ credential: credential, csrfToken: csrf }),
      });
    } catch (error) {
      if (!retried && isInvalidCsrf(error)) {
        await loadConfig(true);
        return loginWithGoogle(credential, true);
      }
      throw error;
    }
    await loadConfig(true);
    return data;
  }

  async function mountGoogleButton(container, onSignedIn, onError) {
    if (!container) throw new Error('找不到 Google 登入按鈕容器。');
    var config = await loadConfig(false);
    var clientId = configClientId(config);
    if (!clientId) throw new Error('Google Client ID 尚未設定，請聯絡網站管理員。');
    var googleApi = await waitForGoogle();
    container.replaceChildren();
    googleApi.accounts.id.initialize({
      client_id: clientId,
      hd: configDomain(config),
      auto_select: false,
      cancel_on_tap_outside: true,
      callback: async function (response) {
        try {
          if (!response || !response.credential) throw new Error('Google 未回傳登入憑證。');
          await loginWithGoogle(response.credential);
          if (typeof onSignedIn === 'function') await onSignedIn();
        } catch (error) {
          if (typeof onError === 'function') onError(error);
        }
      },
    });
    googleApi.accounts.id.renderButton(container, {
      type: 'standard',
      theme: 'outline',
      size: 'large',
      text: 'signin_with',
      shape: 'rectangular',
      logo_alignment: 'left',
      width: Math.max(220, Math.min(320, container.clientWidth || 320)),
    });
  }

  function normalizePermissions(value) {
    if (value === 'all') return 'all';
    if (Array.isArray(value)) return value.map(trimmed).filter(Boolean);
    var raw = trimmed(value);
    if (!raw) return [];
    if (raw === 'all') return 'all';
    return raw.split(',').map(function (item) { return item.trim(); }).filter(Boolean);
  }

  function normalizeMe(raw) {
    var source = raw && raw.result ? raw.result : (raw || {});
    var user = source.user || source.profile || {};
    var access = source.access || user.access || user;
    var rawRoles = Array.isArray(source.roles) ? source.roles : user.roles;
    var roleList = Array.isArray(rawRoles) ? rawRoles.map(trimmed) : [];
    var email = trimmed(user.email || source.email);
    var owner = bool(access.owner != null ? access.owner : (user.owner != null ? user.owner : source.owner), roleList.indexOf('owner') !== -1);
    var admin = owner || bool(access.admin != null ? access.admin : (user.admin != null ? user.admin : source.admin), roleList.indexOf('admin') !== -1);
    var member = admin || bool(access.member != null ? access.member : (user.member != null ? user.member : source.member), roleList.indexOf('member') !== -1);
    var ntu = member || bool(access.ntu != null ? access.ntu : (user.ntu != null ? user.ntu : source.ntu), roleList.indexOf('ntu') !== -1 || !!email);
    var authenticated = source.authenticated !== false && !!email;
    var permissions = normalizePermissions(access.permissions != null
      ? access.permissions
      : (user.permissions != null ? user.permissions : (source.permissions != null ? source.permissions : source.pages)));

    return {
      authenticated: authenticated,
      email: email,
      name: trimmed(user.name || source.name),
      picture: safeUrl(user.picture || source.picture, { allowRelative: false, allowHttp: false }),
      ntu: ntu,
      member: member,
      admin: admin,
      owner: owner,
      permissions: permissions,
      raw: source,
    };
  }

  async function getMe() {
    var data = await request('/api/me');
    state.me = normalizeMe(data);
    return state.me;
  }

  async function logout(retried) {
    if (!state.csrfToken) await loadConfig(false);
    try {
      await request('/api/auth/logout', {
        method: 'POST',
        headers: { 'X-CSRF-Token': state.csrfToken },
        body: JSON.stringify({}),
      });
    } catch (error) {
      if (!retried && isInvalidCsrf(error)) {
        await loadConfig(true);
        return logout(true);
      }
      throw error;
    }
    state.me = null;
    state.config = null;
    state.csrfToken = '';
    try {
      if (window.google && window.google.accounts && window.google.accounts.id) {
        window.google.accounts.id.disableAutoSelect();
      }
    } catch (error) {
      // Local session has already been cleared; GIS cleanup is best-effort.
    }
  }

  async function adminCall(action, args, options, retried) {
    if (!state.csrfToken) await loadConfig(true);
    var data;
    try {
      data = await request('/api/admin', {
        method: 'POST',
        headers: { 'X-CSRF-Token': state.csrfToken },
        body: JSON.stringify({
          action: action,
          args: args == null ? {} : args,
          csrfToken: state.csrfToken,
        }),
      });
    } catch (error) {
      if (!retried && isInvalidCsrf(error)) {
        await loadConfig(true);
        return adminCall(action, args, options, true);
      }
      throw error;
    }
    return data && Object.prototype.hasOwnProperty.call(data, 'result') ? data.result : data;
  }

  function arrayFrom(value, preferredKey) {
    if (Array.isArray(value)) return value;
    if (!value || typeof value !== 'object') return [];
    if (preferredKey && Array.isArray(value[preferredKey])) return value[preferredKey];
    var keys = ['rows', 'items', 'data', 'content', 'result'];
    for (var i = 0; i < keys.length; i += 1) {
      if (Array.isArray(value[keys[i]])) return value[keys[i]];
    }
    if (value.result && typeof value.result === 'object') return arrayFrom(value.result, preferredKey);
    if (value.data && typeof value.data === 'object') return arrayFrom(value.data, preferredKey);
    return [];
  }

  function safeUrl(value, options) {
    var opts = options || {};
    var raw = trimmed(value);
    if (!raw) return '';
    if (/^\/\//.test(raw)) return '';
    try {
      var url = new URL(raw, window.location.origin);
      if (url.username || url.password) return '';
      if (url.origin === window.location.origin && opts.allowRelative !== false) {
        return url.pathname + url.search + url.hash;
      }
      if (url.protocol === 'https:') return url.href;
      if (opts.allowHttp !== false && url.protocol === 'http:') return url.href;
    } catch (error) {
      return '';
    }
    return '';
  }

  function createSafeLink(label, href, className) {
    var valid = safeUrl(href, { allowRelative: true, allowHttp: true });
    if (!valid) return null;
    var anchor = document.createElement('a');
    anchor.textContent = text(label);
    anchor.href = valid;
    if (new URL(valid, window.location.origin).origin !== window.location.origin) {
      anchor.target = '_blank';
      anchor.rel = 'noopener noreferrer';
    }
    if (className) anchor.className = className;
    return anchor;
  }

  function clear(node) {
    if (node) node.replaceChildren();
  }

  function setText(node, value) {
    if (node) node.textContent = text(value);
  }

  function showOnly(nodes, active) {
    nodes.forEach(function (node) { if (node) node.hidden = node !== active; });
  }

  function formatDateTime(value) {
    var raw = trimmed(value);
    if (!raw) return '—';
    var date = new Date(raw);
    if (Number.isNaN(date.getTime())) return raw;
    return new Intl.DateTimeFormat('zh-TW', {
      timeZone: 'Asia/Taipei',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).format(date);
  }

  function hasPermission(me, permission) {
    if (!me || !me.admin) return false;
    if (me.owner || me.permissions === 'all') return true;
    if (!Array.isArray(me.permissions) || me.permissions.length === 0) return false;
    if (me.permissions.indexOf('all') !== -1) return true;
    return me.permissions.indexOf(permission) !== -1;
  }

  function announce(message, type) {
    var region = document.getElementById('toast-region');
    if (!region) return;
    var toast = document.createElement('div');
    toast.className = 'toast' + (type === 'error' ? ' toast--error' : '');
    toast.setAttribute('role', type === 'error' ? 'alert' : 'status');
    toast.textContent = text(message);
    region.appendChild(toast);
    window.setTimeout(function () { toast.remove(); }, type === 'error' ? 7000 : 4200);
  }

  function errorMessage(error) {
    if (!error) return '發生未知錯誤。';
    return trimmed(error.message) || '操作失敗。';
  }

  window.NtuEconPortal = Object.freeze({
    ApiError: ApiError,
    request: request,
    loadConfig: loadConfig,
    configDomain: configDomain,
    mountGoogleButton: mountGoogleButton,
    getMe: getMe,
    normalizeMe: normalizeMe,
    logout: logout,
    adminCall: adminCall,
    arrayFrom: arrayFrom,
    safeUrl: safeUrl,
    createSafeLink: createSafeLink,
    clear: clear,
    setText: setText,
    showOnly: showOnly,
    formatDateTime: formatDateTime,
    hasPermission: hasPermission,
    announce: announce,
    errorMessage: errorMessage,
    text: text,
    trimmed: trimmed,
    bool: bool,
  });
}());
