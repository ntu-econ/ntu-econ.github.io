(function () {
  'use strict';

  var Portal = window.NtuEconPortal;
  var views = {
    loading: document.getElementById('loading-view'),
    login: document.getElementById('login-view'),
    denied: document.getElementById('denied-view'),
    member: document.getElementById('member-view'),
  };
  var loginMounted = false;

  function selectView(name) {
    Portal.showOnly(Object.keys(views).map(function (key) { return views[key]; }), views[name]);
  }

  function setLoginError(message) {
    var node = document.getElementById('login-message');
    node.textContent = Portal.text(message);
    node.hidden = !message;
  }

  function setSignedInHeader(me) {
    Portal.setText(document.getElementById('header-user'), me && me.email);
    document.getElementById('logout-button').hidden = !(me && me.authenticated);
    document.getElementById('admin-entry-link').hidden = !(me && me.admin);
    document.getElementById('member-admin-button').hidden = !(me && me.admin);
  }

  function memberViewWasRequested() {
    try {
      return new URLSearchParams(window.location.search).get('view') === 'member';
    } catch (error) {
      return false;
    }
  }

  function openAdmin() {
    window.location.replace('/admin/');
  }

  async function ensureLoginButton() {
    if (loginMounted) return;
    loginMounted = true;
    try {
      await Portal.mountGoogleButton(
        document.getElementById('google-signin'),
        async function () {
          setLoginError('');
          await start();
        },
        function (error) {
          setLoginError(Portal.errorMessage(error));
        }
      );
    } catch (error) {
      loginMounted = false;
      setLoginError(Portal.errorMessage(error));
    }
  }

  function sortContent(rows) {
    return rows.slice().sort(function (a, b) {
      var ao = Number(a.order != null ? a.order : a.sortOrder) || 0;
      var bo = Number(b.order != null ? b.order : b.sortOrder) || 0;
      if (ao !== bo) return ao - bo;
      return Portal.text(a.title).localeCompare(Portal.text(b.title), 'zh-Hant');
    });
  }

  function renderContent(data) {
    var container = document.getElementById('member-content');
    Portal.clear(container);
    var rows = sortContent(Portal.arrayFrom(data, 'items'));
    if (!rows.length) {
      var empty = document.createElement('div');
      empty.className = 'empty-state';
      empty.textContent = '目前沒有會員限定內容。';
      container.appendChild(empty);
      return;
    }

    rows.forEach(function (row) {
      var card = document.createElement('article');
      card.className = 'content-card';

      var title = document.createElement('h2');
      title.textContent = Portal.text(row.title || '未命名內容');
      card.appendChild(title);

      var body = document.createElement('p');
      body.className = 'content-card__body';
      var summary = Portal.trimmed(row.summary);
      var content = Portal.text(row.body || row.content || row.description);
      body.textContent = summary && content ? summary + '\n\n' + content : (summary || content);
      card.appendChild(body);

      var link = Portal.createSafeLink('開啟資源', row.link || row.url, 'btn btn--primary');
      if (link) card.appendChild(link);
      container.appendChild(card);
    });
  }

  async function loadMemberContent() {
    var button = document.getElementById('refresh-content-button');
    button.disabled = true;
    try {
      var data = await Portal.request('/api/member/content');
      renderContent(data);
    } catch (error) {
      if (error.status === 401) {
        await start();
        return;
      }
      if (error.status === 403) {
        selectView('denied');
        return;
      }
      Portal.announce(Portal.errorMessage(error), 'error');
      renderContent([]);
    } finally {
      button.disabled = false;
    }
  }

  async function start() {
    selectView('loading');
    setSignedInHeader(null);
    try {
      await Portal.loadConfig(false);
      var me = await Portal.getMe();
      if (!me.authenticated) {
        selectView('login');
        await ensureLoginButton();
        return;
      }

      setSignedInHeader(me);
      if ((me.admin || me.owner) && !memberViewWasRequested()) {
        openAdmin();
        return;
      }
      if (!(me.member || me.admin || me.owner)) {
        Portal.setText(
          document.getElementById('denied-copy'),
          '帳號 ' + me.email + ' 已通過臺大網域驗證，但目前不在有效會員名單中。如有疑問，請聯絡系學會。'
        );
        selectView('denied');
        return;
      }

      var greeting = me.name ? me.name + '，歡迎回來。' : '歡迎回來。';
      Portal.setText(document.getElementById('member-greeting'), greeting);
      selectView('member');
      await loadMemberContent();
    } catch (error) {
      if (error.status === 401) {
        selectView('login');
        await ensureLoginButton();
        return;
      }
      selectView('login');
      setLoginError(Portal.errorMessage(error));
      await ensureLoginButton();
    }
  }

  async function signOut() {
    var buttons = [document.getElementById('logout-button'), document.getElementById('switch-account-button')];
    buttons.forEach(function (button) { button.disabled = true; });
    try {
      await Portal.logout();
    } catch (error) {
      Portal.announce(Portal.errorMessage(error), 'error');
    } finally {
      buttons.forEach(function (button) { button.disabled = false; });
      loginMounted = false;
      setSignedInHeader(null);
      selectView('login');
      await ensureLoginButton();
    }
  }

  document.getElementById('logout-button').addEventListener('click', signOut);
  document.getElementById('switch-account-button').addEventListener('click', signOut);
  document.getElementById('refresh-content-button').addEventListener('click', loadMemberContent);
  start();
}());
