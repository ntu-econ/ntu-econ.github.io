(function () {
  'use strict';

  var Portal = window.NtuEconPortal;
  var me = null;
  var stores = {
    announcements: new Map(),
    links: new Map(),
    memberContent: new Map(),
    members: new Map(),
    admins: new Map(),
  };
  var rootViews = [
    document.getElementById('loading-view'),
    document.getElementById('login-view'),
    document.getElementById('denied-view'),
    document.getElementById('admin-view'),
  ];

  function showRoot(id) {
    Portal.showOnly(rootViews, document.getElementById(id));
  }

  function showAdminEntry(message) {
    Portal.setText(
      document.getElementById('admin-entry-message'),
      message || '會員與管理員共用同一個 Google 登入入口，登入後系統會依角色自動帶您到正確頁面。'
    );
    showRoot('login-view');
  }

  function setHeader(profile) {
    Portal.setText(document.getElementById('header-user'), profile && profile.email);
    document.getElementById('logout-button').hidden = !(profile && profile.authenticated);
  }

  function redirectToLogin() {
    window.location.replace('/member/?next=' + encodeURIComponent('/admin/'));
  }

  function hasAnyPermission(names) {
    if (!me || !me.admin) return false;
    if (me.owner || me.permissions === 'all') return true;
    if (!Array.isArray(me.permissions) || !me.permissions.length) return false;
    if (me.permissions.indexOf('all') !== -1) return true;
    return names.some(function (name) { return me.permissions.indexOf(name) !== -1; });
  }

  function canOpenPanel(name) {
    if (name === 'dashboard') return true;
    if (name === 'admins') return !!me.owner;
    if (name === 'audit') return hasAnyPermission(['audit']);
    if (name === 'members') return hasAnyPermission(['members', 'roster']);
    if (name === 'announcements') return hasAnyPermission(['content', 'announcements', 'announce']);
    if (name === 'links') return hasAnyPermission(['content', 'links']);
    if (name === 'pages') return hasAnyPermission(['content', 'pages']);
    if (name === 'member-content') return hasAnyPermission(['content', 'memberContent', 'member-content']);
    return false;
  }

  function applyNavigationPermissions() {
    document.querySelectorAll('#admin-nav [data-panel]').forEach(function (button) {
      button.hidden = !canOpenPanel(button.dataset.panel);
    });
  }

  async function openPanel(name) {
    if (!canOpenPanel(name)) {
      Portal.announce('您沒有此功能的使用權限。', 'error');
      name = 'dashboard';
    }
    document.querySelectorAll('[data-admin-panel]').forEach(function (panel) {
      panel.classList.toggle('is-active', panel.dataset.adminPanel === name);
    });
    document.querySelectorAll('#admin-nav [data-panel]').forEach(function (button) {
      if (button.dataset.panel === name) button.setAttribute('aria-current', 'page');
      else button.removeAttribute('aria-current');
    });

    var loaders = {
      dashboard: loadDashboard,
      announcements: loadAnnouncements,
      links: loadLinks,
      pages: window.NtuEconPageEditor && window.NtuEconPageEditor.load,
      'member-content': loadMemberContent,
      members: loadMembers,
      admins: loadAdmins,
      audit: loadAudit,
    };
    if (loaders[name]) await loaders[name]();
  }

  function tableMessage(tbody, colspan, message) {
    Portal.clear(tbody);
    var tr = document.createElement('tr');
    tr.className = 'loading-row';
    var td = document.createElement('td');
    td.colSpan = colspan;
    td.textContent = message;
    tr.appendChild(td);
    tbody.appendChild(tr);
  }

  function cell(value, className) {
    var td = document.createElement('td');
    if (className) td.className = className;
    td.textContent = Portal.text(value);
    return td;
  }

  function textBlock(value, className) {
    var node = document.createElement('div');
    if (className) node.className = className;
    node.textContent = Portal.text(value);
    return node;
  }

  function badge(label, state) {
    var span = document.createElement('span');
    span.className = 'status-badge' + (state ? ' status-badge--' + state : '');
    span.textContent = label;
    return span;
  }

  function actionButton(label, kind, handler) {
    var button = document.createElement('button');
    button.type = 'button';
    button.className = 'btn btn--small' + (kind === 'danger' ? ' btn--danger' : '');
    button.textContent = label;
    button.addEventListener('click', handler);
    return button;
  }

  function actionCell(editHandler, deleteHandler, deleteAllowed) {
    var td = document.createElement('td');
    var row = document.createElement('div');
    row.className = 'btn-row';
    row.appendChild(actionButton('編輯', '', editHandler));
    if (deleteAllowed !== false) row.appendChild(actionButton('刪除', 'danger', deleteHandler));
    td.appendChild(row);
    return td;
  }

  function recordKey(row, index) {
    return Portal.trimmed(row && (row.id || row.email || row.slug)) || String(index);
  }

  function remember(storeName, rows) {
    var store = stores[storeName];
    store.clear();
    rows.forEach(function (row, index) { store.set(recordKey(row, index), row); });
  }

  function today() {
    return new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Taipei', year: 'numeric', month: '2-digit', day: '2-digit',
    }).format(new Date());
  }

  function validCmsUrl(raw, allowEmpty) {
    var input = Portal.trimmed(raw);
    if (!input && allowEmpty) return '';
    var safe = Portal.safeUrl(input, { allowRelative: true, allowHttp: true });
    if (!safe) throw new Error('網址格式不安全；僅接受 http、https 或本站相對路徑。');
    return safe;
  }

  function fieldValue(id) {
    var node = document.getElementById(id);
    return node ? Portal.trimmed(node.value) : '';
  }

  function previewStatus(id, label, isDraft) {
    var node = document.getElementById(id);
    Portal.setText(node, label);
    if (node) node.classList.toggle('is-draft', !!isDraft);
  }

  function updateAnnouncementPreview() {
    var title = fieldValue('announcement-title') || '請輸入公告標題';
    var date = fieldValue('announcement-date') || '日期';
    var tag = fieldValue('announcement-tag') || '公告';
    var body = fieldValue('announcement-body') || '尚未輸入內文。首頁目前只顯示上方公告列。';
    var hasLink = !!fieldValue('announcement-link');
    var highlighted = document.getElementById('announcement-highlight').checked;
    var published = document.getElementById('announcement-published').checked;
    var from = fieldValue('announcement-from');
    var until = fieldValue('announcement-until');
    var tagClasses = { '活動': 'event', '最新': 'new', '招募': 'recruit' };
    var tagNode = document.getElementById('announcement-preview-tag');
    var row = document.getElementById('announcement-preview-row');
    var statusParts = [published ? '公開' : '草稿', highlighted ? '醒目置頂' : '一般公告'];

    if (from || until) statusParts.push('排程 ' + (from || '現在') + ' ～ ' + (until || '持續公開'));
    Portal.setText(document.getElementById('announcement-preview-heading'), title);
    Portal.setText(document.getElementById('announcement-preview-date'), date);
    Portal.setText(tagNode, tag);
    Portal.setText(document.getElementById('announcement-preview-body'), body);
    document.getElementById('announcement-preview-arrow').hidden = !hasLink;
    row.classList.toggle('is-highlight', highlighted);
    tagNode.className = 'preview-news-tag' + (tagClasses[tag] ? ' preview-news-tag--' + tagClasses[tag] : '');
    previewStatus('announcement-preview-status', statusParts.join(' · '), !published);
  }

  function updateLinkPreview() {
    var title = fieldValue('link-title') || '請輸入連結標題';
    var group = fieldValue('link-group') || '相關連結';
    var description = fieldValue('link-description') || '連結說明會顯示在這裡';
    var url = fieldValue('link-url');
    var icon = fieldValue('link-icon') || 'globe';
    var published = document.getElementById('link-published').checked;
    var onHome = document.getElementById('link-home').checked;
    var iconLabels = {
      globe: 'WEB',
      instagram: 'IG',
      facebook: 'FB',
      youtube: 'YT',
      line: 'LINE',
    };
    var status = published
      ? (onHome ? '公開 · 首頁與完整連結頁' : '公開 · 完整連結頁')
      : '停用 · 不會顯示在網站上';

    Portal.setText(document.getElementById('link-preview-heading'), title);
    Portal.setText(document.getElementById('link-preview-group'), group);
    Portal.setText(document.getElementById('link-preview-description'), description);
    Portal.setText(document.getElementById('link-preview-url'), url || '尚未設定網址');
    Portal.setText(document.getElementById('link-preview-icon'), iconLabels[icon] || 'WEB');
    previewStatus('link-preview-status', status, !published);
  }

  function updateMemberContentPreview() {
    var title = fieldValue('member-content-title') || '請輸入內容標題';
    var summary = fieldValue('member-content-summary') || '摘要會顯示在這裡。';
    var body = fieldValue('member-content-body') || '開始輸入內容後，就能在這裡確認段落與換行。';
    var link = fieldValue('member-content-link');
    var published = document.getElementById('member-content-published').checked;
    var from = fieldValue('member-content-from');
    var until = fieldValue('member-content-until');
    var statusParts = [published ? '開放會員查看' : '停用 · 會員不會看到'];
    var resource = document.getElementById('member-content-preview-link');

    if (from || until) statusParts.push('排程 ' + (from || '現在') + ' ～ ' + (until || '持續開放'));
    Portal.setText(document.getElementById('member-content-preview-heading'), title);
    Portal.setText(document.getElementById('member-content-preview-summary'), summary);
    Portal.setText(document.getElementById('member-content-preview-body'), body);
    resource.classList.toggle('is-hidden', !link);
    previewStatus('member-content-preview-status', statusParts.join(' · '), !published);
  }

  function bindLivePreviews() {
    [
      ['announcement-form', updateAnnouncementPreview],
      ['link-form', updateLinkPreview],
      ['member-content-form', updateMemberContentPreview],
    ].forEach(function (entry) {
      var form = document.getElementById(entry[0]);
      form.addEventListener('input', entry[1]);
      form.addEventListener('change', entry[1]);
    });

    document.querySelectorAll('[data-preview-stage][data-preview-width]').forEach(function (button) {
      button.addEventListener('click', function () {
        var stageId = button.dataset.previewStage;
        var stage = document.getElementById(stageId);
        if (!stage) return;
        stage.classList.toggle('is-mobile', button.dataset.previewWidth === 'mobile');
        document.querySelectorAll('[data-preview-stage="' + stageId + '"]').forEach(function (candidate) {
          candidate.setAttribute('aria-pressed', candidate === button ? 'true' : 'false');
        });
      });
    });
  }

  async function runWrite(button, task, successMessage) {
    if (button) button.disabled = true;
    try {
      await task();
      if (successMessage) Portal.announce(successMessage);
    } catch (error) {
      if (error.status === 401) {
        await start();
        return;
      }
      Portal.announce(Portal.errorMessage(error), 'error');
    } finally {
      if (button) button.disabled = false;
    }
  }

  function metric(id, value) {
    Portal.setText(document.getElementById(id), value == null ? '—' : value);
  }

  async function loadDashboard() {
    Portal.setText(document.getElementById('system-status'), '正在讀取後台狀態…');
    try {
      var result = await Portal.adminCall('dashboard', {});
      if (result && result.initialized === false && me.owner) {
        var seeded = await Portal.adminCall('bootstrap', {}, { write: true });
        result = await Portal.adminCall('dashboard', {});
        if (seeded && seeded.seeded) Portal.announce('已建立必要資料表並匯入初始內容。');
      }
      var counts = result && result.counts ? result.counts : {};
      metric('metric-announcements', counts.announcements);
      metric('metric-links', counts.links);
      metric('metric-pages', counts.pages);
      metric('metric-content', counts.memberContent);
      metric('metric-members', counts.members);
      var profile = result && result.profile ? result.profile : null;
      var name = Portal.trimmed(profile && profile.name) || me.name;
      Portal.setText(document.getElementById('welcome-title'), name ? name + '，您好' : '網站管理後台');
      Portal.setText(document.getElementById('system-status'), result && result.initialized === false
        ? '後台尚未初始化，請聯絡系統擁有者完成初始設定。'
        : '後台資料表與登入服務運作正常。');
    } catch (error) {
      Portal.setText(document.getElementById('system-status'), Portal.errorMessage(error));
      Portal.announce(Portal.errorMessage(error), 'error');
    }
  }

  // ----- Announcements -----
  function resetAnnouncementForm() {
    var form = document.getElementById('announcement-form');
    form.reset();
    document.getElementById('announcement-id').value = '';
    document.getElementById('announcement-date').value = today();
    document.getElementById('announcement-order').value = '0';
    document.getElementById('announcement-published').checked = true;
    Portal.setText(document.getElementById('announcement-form-title'), '新增公告');
    updateAnnouncementPreview();
  }

  function editAnnouncement(row) {
    document.getElementById('announcement-id').value = Portal.text(row.id);
    document.getElementById('announcement-title').value = Portal.text(row.title);
    document.getElementById('announcement-date').value = Portal.text(row.date);
    document.getElementById('announcement-tag').value = Portal.text(row.tag || '公告');
    document.getElementById('announcement-order').value = Portal.text(row.order || 0);
    document.getElementById('announcement-link').value = Portal.text(row.link || row.url);
    document.getElementById('announcement-body').value = Portal.text(row.body || row.content);
    document.getElementById('announcement-from').value = Portal.text(row.publishFrom || row.publish_from);
    document.getElementById('announcement-until').value = Portal.text(row.publishUntil || row.publish_until);
    document.getElementById('announcement-highlight').checked = Portal.bool(row.highlight != null ? row.highlight : row.pinned);
    document.getElementById('announcement-published').checked = Portal.bool(row.published, true);
    Portal.setText(document.getElementById('announcement-form-title'), '編輯公告');
    updateAnnouncementPreview();
    document.getElementById('announcement-form').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function announcementObject() {
    var id = Portal.trimmed(document.getElementById('announcement-id').value);
    var existing = id ? stores.announcements.get(id) : null;
    var link = validCmsUrl(document.getElementById('announcement-link').value, true);
    var highlight = document.getElementById('announcement-highlight').checked;
    return {
      id: id,
      updatedAt: existing ? Portal.text(existing.updatedAt) : '',
      title: Portal.trimmed(document.getElementById('announcement-title').value),
      date: document.getElementById('announcement-date').value,
      tag: document.getElementById('announcement-tag').value,
      order: Number(document.getElementById('announcement-order').value) || 0,
      link: link,
      body: document.getElementById('announcement-body').value,
      highlight: highlight,
      pinned: highlight,
      published: document.getElementById('announcement-published').checked,
      publishFrom: document.getElementById('announcement-from').value,
      publishUntil: document.getElementById('announcement-until').value,
    };
  }

  function renderAnnouncements(rows) {
    var tbody = document.getElementById('announcements-body');
    Portal.clear(tbody);
    remember('announcements', rows);
    if (!rows.length) { tableMessage(tbody, 4, '尚無公告。'); return; }
    rows.forEach(function (row) {
      var tr = document.createElement('tr');
      var info = document.createElement('td');
      info.appendChild(textBlock(row.title || '未命名公告', 'cell-title'));
      info.appendChild(textBlock(row.body || row.content, 'cell-preview'));
      var publicLink = Portal.createSafeLink('查看連結', row.link || row.url);
      if (publicLink) info.appendChild(publicLink);
      tr.appendChild(info);

      var schedule = document.createElement('td');
      schedule.appendChild(textBlock(row.date || '未設定日期'));
      var range = [row.publishFrom || row.publish_from, row.publishUntil || row.publish_until].filter(Boolean).join(' ～ ');
      if (range) schedule.appendChild(textBlock(range, 'cell-muted'));
      tr.appendChild(schedule);

      var status = document.createElement('td');
      status.appendChild(badge(Portal.bool(row.published, true) ? '公開' : '草稿', Portal.bool(row.published, true) ? 'yes' : 'no'));
      if (Portal.bool(row.highlight != null ? row.highlight : row.pinned)) status.appendChild(badge('置頂', 'warn'));
      tr.appendChild(status);

      tr.appendChild(actionCell(
        function () { editAnnouncement(row); },
        function () { deleteAnnouncement(row); }
      ));
      tbody.appendChild(tr);
    });
  }

  async function loadAnnouncements() {
    var tbody = document.getElementById('announcements-body');
    tableMessage(tbody, 4, '載入中…');
    try {
      var result = await Portal.adminCall('listAnnouncements', {});
      renderAnnouncements(Portal.arrayFrom(result, 'announcements'));
    } catch (error) {
      tableMessage(tbody, 4, Portal.errorMessage(error));
    }
  }

  async function deleteAnnouncement(row) {
    if (!window.confirm('確定刪除公告「' + Portal.text(row.title) + '」？此操作無法復原。')) return;
    await runWrite(null, async function () {
      await Portal.adminCall('deleteAnnouncement', { id: row.id }, { write: true });
      await Promise.all([loadAnnouncements(), loadDashboard()]);
    }, '公告已刪除。');
  }

  // ----- Links -----
  function resetLinkForm() {
    document.getElementById('link-form').reset();
    document.getElementById('link-id').value = '';
    document.getElementById('link-order').value = '0';
    document.getElementById('link-published').checked = true;
    Portal.setText(document.getElementById('link-form-title'), '新增連結');
    updateLinkPreview();
  }

  function editLink(row) {
    document.getElementById('link-id').value = Portal.text(row.id);
    document.getElementById('link-title').value = Portal.text(row.title);
    document.getElementById('link-group').value = Portal.text(row.group || row.category);
    document.getElementById('link-description').value = Portal.text(row.description || row.desc);
    document.getElementById('link-url').value = Portal.text(row.url || row.link);
    document.getElementById('link-icon').value = Portal.text(row.icon || 'globe');
    document.getElementById('link-order').value = Portal.text(row.order || 0);
    document.getElementById('link-home').checked = Portal.bool(row.showOnHome != null ? row.showOnHome : row.show_on_home);
    document.getElementById('link-published').checked = Portal.bool(row.published, true);
    Portal.setText(document.getElementById('link-form-title'), '編輯連結');
    updateLinkPreview();
    document.getElementById('link-form').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function linkObject() {
    var id = Portal.trimmed(document.getElementById('link-id').value);
    var existing = id ? stores.links.get(id) : null;
    return {
      id: id,
      updatedAt: existing ? Portal.text(existing.updatedAt) : '',
      title: Portal.trimmed(document.getElementById('link-title').value),
      group: Portal.trimmed(document.getElementById('link-group').value),
      description: Portal.trimmed(document.getElementById('link-description').value),
      url: validCmsUrl(document.getElementById('link-url').value, false),
      icon: document.getElementById('link-icon').value,
      order: Number(document.getElementById('link-order').value) || 0,
      showOnHome: document.getElementById('link-home').checked,
      published: document.getElementById('link-published').checked,
    };
  }

  function renderLinks(rows) {
    var tbody = document.getElementById('links-body');
    Portal.clear(tbody);
    remember('links', rows);
    if (!rows.length) { tableMessage(tbody, 5, '尚無相關連結。'); return; }
    rows.forEach(function (row) {
      var tr = document.createElement('tr');
      var info = document.createElement('td');
      info.appendChild(textBlock(row.group || row.category || '未分類', 'cell-muted'));
      info.appendChild(textBlock(row.title || '未命名連結', 'cell-title'));
      info.appendChild(textBlock(row.description || row.desc, 'cell-preview'));
      tr.appendChild(info);
      var urlCell = document.createElement('td');
      var anchor = Portal.createSafeLink(row.url || row.link, row.url || row.link);
      if (anchor) urlCell.appendChild(anchor); else urlCell.textContent = '網址無效';
      tr.appendChild(urlCell);
      tr.appendChild(cell(row.order || '0'));
      var status = document.createElement('td');
      status.appendChild(badge(Portal.bool(row.published, true) ? '公開' : '停用', Portal.bool(row.published, true) ? 'yes' : 'no'));
      if (Portal.bool(row.showOnHome != null ? row.showOnHome : row.show_on_home)) status.appendChild(badge('首頁', 'warn'));
      tr.appendChild(status);
      tr.appendChild(actionCell(function () { editLink(row); }, function () { deleteLink(row); }));
      tbody.appendChild(tr);
    });
  }

  async function loadLinks() {
    var tbody = document.getElementById('links-body');
    tableMessage(tbody, 5, '載入中…');
    try {
      var result = await Portal.adminCall('listLinks', {});
      renderLinks(Portal.arrayFrom(result, 'links'));
    } catch (error) { tableMessage(tbody, 5, Portal.errorMessage(error)); }
  }

  async function deleteLink(row) {
    if (!window.confirm('確定刪除連結「' + Portal.text(row.title) + '」？')) return;
    await runWrite(null, async function () {
      await Portal.adminCall('deleteLink', { id: row.id }, { write: true });
      await Promise.all([loadLinks(), loadDashboard()]);
    }, '連結已刪除。');
  }

  // ----- Member content -----
  function resetMemberContentForm() {
    document.getElementById('member-content-form').reset();
    document.getElementById('member-content-id').value = '';
    document.getElementById('member-content-order').value = '0';
    document.getElementById('member-content-published').checked = true;
    Portal.setText(document.getElementById('member-content-form-title'), '新增會員內容');
    updateMemberContentPreview();
  }

  function editMemberContent(row) {
    document.getElementById('member-content-id').value = Portal.text(row.id);
    document.getElementById('member-content-title').value = Portal.text(row.title);
    document.getElementById('member-content-order').value = Portal.text(row.order || 0);
    document.getElementById('member-content-summary').value = Portal.text(row.summary);
    document.getElementById('member-content-body').value = Portal.text(row.body || row.content);
    document.getElementById('member-content-link').value = Portal.text(row.link || row.url);
    document.getElementById('member-content-from').value = Portal.text(row.publishFrom || row.publish_from);
    document.getElementById('member-content-until').value = Portal.text(row.publishUntil || row.publish_until);
    document.getElementById('member-content-published').checked = Portal.bool(row.published, true);
    Portal.setText(document.getElementById('member-content-form-title'), '編輯會員內容');
    updateMemberContentPreview();
    document.getElementById('member-content-form').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function memberContentObject() {
    var id = Portal.trimmed(document.getElementById('member-content-id').value);
    var existing = id ? stores.memberContent.get(id) : null;
    return {
      id: id,
      updatedAt: existing ? Portal.text(existing.updatedAt) : '',
      title: Portal.trimmed(document.getElementById('member-content-title').value),
      order: Number(document.getElementById('member-content-order').value) || 0,
      summary: Portal.trimmed(document.getElementById('member-content-summary').value),
      body: document.getElementById('member-content-body').value,
      link: (function () {
        var raw = Portal.trimmed(document.getElementById('member-content-link').value);
        if (!raw) return '';
        var safe = Portal.safeUrl(raw, { allowRelative: false, allowHttp: true });
        if (!safe) throw new Error('會員資源連結必須是完整的 http 或 https 網址。');
        return safe;
      }()),
      publishFrom: document.getElementById('member-content-from').value,
      publishUntil: document.getElementById('member-content-until').value,
      published: document.getElementById('member-content-published').checked,
    };
  }

  function renderMemberContent(rows) {
    var tbody = document.getElementById('member-content-body-list');
    Portal.clear(tbody);
    remember('memberContent', rows);
    if (!rows.length) { tableMessage(tbody, 4, '尚無會員內容。'); return; }
    rows.forEach(function (row) {
      var tr = document.createElement('tr');
      var info = document.createElement('td');
      info.appendChild(textBlock(row.title || '未命名內容', 'cell-title'));
      info.appendChild(textBlock(row.summary || row.body || row.content, 'cell-preview'));
      var link = Portal.createSafeLink('查看資源', row.link || row.url);
      if (link) info.appendChild(link);
      tr.appendChild(info);
      tr.appendChild(cell([row.publishFrom || row.publish_from, row.publishUntil || row.publish_until].filter(Boolean).join(' ～ ') || '未設定'));
      var status = document.createElement('td');
      status.appendChild(badge(Portal.bool(row.published, true) ? '開放' : '停用', Portal.bool(row.published, true) ? 'yes' : 'no'));
      tr.appendChild(status);
      tr.appendChild(actionCell(function () { editMemberContent(row); }, function () { deleteMemberContent(row); }));
      tbody.appendChild(tr);
    });
  }

  async function loadMemberContent() {
    var tbody = document.getElementById('member-content-body-list');
    tableMessage(tbody, 4, '載入中…');
    try {
      var result = await Portal.adminCall('listMemberContent', {});
      renderMemberContent(Portal.arrayFrom(result, 'memberContent'));
    } catch (error) { tableMessage(tbody, 4, Portal.errorMessage(error)); }
  }

  async function deleteMemberContent(row) {
    if (!window.confirm('確定刪除會員內容「' + Portal.text(row.title) + '」？')) return;
    await runWrite(null, async function () {
      await Portal.adminCall('deleteMemberContent', { id: row.id }, { write: true });
      await Promise.all([loadMemberContent(), loadDashboard()]);
    }, '會員內容已刪除。');
  }

  // ----- Members -----
  function resetMemberForm() {
    document.getElementById('member-form').reset();
    document.getElementById('member-id').value = '';
    document.getElementById('member-original-email').value = '';
    document.getElementById('member-status').value = 'active';
    document.getElementById('member-email').readOnly = false;
    Portal.setText(document.getElementById('member-form-title'), '新增會員');
  }

  function memberStatus(row) {
    var status = Portal.trimmed(row.status).toLowerCase();
    if (!status) status = Portal.bool(row.active, true) ? 'active' : 'inactive';
    var until = Portal.trimmed(row.validUntil || row.expiresAt);
    if (status === 'active' && until && until < today()) return 'expired';
    return status;
  }

  function editMember(row) {
    var email = Portal.text(row.email);
    document.getElementById('member-id').value = Portal.text(row.id);
    document.getElementById('member-original-email').value = email;
    document.getElementById('member-email').value = email;
    document.getElementById('member-email').readOnly = true;
    document.getElementById('member-name').value = Portal.text(row.name);
    document.getElementById('member-valid-until').value = Portal.text(row.validUntil || row.expiresAt);
    document.getElementById('member-status').value = memberStatus(row) === 'inactive' ? 'inactive' : 'active';
    document.getElementById('member-notes').value = Portal.text(row.notes || row.note);
    Portal.setText(document.getElementById('member-form-title'), '編輯會員');
    document.getElementById('member-form').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  async function validateNtuEmail(value) {
    var email = Portal.trimmed(value).toLowerCase();
    var config = await Portal.loadConfig(false);
    var domain = Portal.configDomain(config).toLowerCase();
    if (!email || !email.endsWith('@' + domain) || email.slice(0, -(domain.length + 1)).indexOf('@') !== -1) {
      throw new Error('Email 必須是有效的 @' + domain + ' 帳號。');
    }
    return email;
  }

  async function memberObject() {
    var status = document.getElementById('member-status').value;
    var until = document.getElementById('member-valid-until').value;
    var notes = Portal.trimmed(document.getElementById('member-notes').value);
    return {
      id: Portal.trimmed(document.getElementById('member-id').value),
      originalEmail: Portal.trimmed(document.getElementById('member-original-email').value).toLowerCase(),
      email: await validateNtuEmail(document.getElementById('member-email').value),
      name: Portal.trimmed(document.getElementById('member-name').value),
      validUntil: until,
      expiresAt: until,
      notes: notes,
      note: notes,
      status: status,
      active: status === 'active',
      updatedAt: (function () {
        var id = Portal.trimmed(document.getElementById('member-id').value);
        var existing = id ? stores.members.get(id) : null;
        return existing ? Portal.text(existing.updatedAt) : '';
      }()),
    };
  }

  function renderMembers(rows) {
    var tbody = document.getElementById('members-body');
    Portal.clear(tbody);
    remember('members', rows);
    if (!rows.length) { tableMessage(tbody, 5, '尚無會員。'); return; }
    rows.forEach(function (row) {
      var tr = document.createElement('tr');
      var info = document.createElement('td');
      info.appendChild(textBlock(row.name || '未填姓名', 'cell-title'));
      info.appendChild(textBlock(row.email, 'cell-muted'));
      tr.appendChild(info);
      tr.appendChild(cell(row.validUntil || row.expiresAt || '未設定'));
      var state = memberStatus(row);
      var status = document.createElement('td');
      status.appendChild(badge(state === 'active' ? '有效' : (state === 'expired' ? '已過期' : '停用'), state === 'active' ? 'yes' : (state === 'expired' ? 'warn' : 'no')));
      tr.appendChild(status);
      tr.appendChild(cell(row.notes || row.note || '', 'cell-preview'));
      tr.appendChild(actionCell(function () { editMember(row); }, function () { deleteMember(row); }));
      tbody.appendChild(tr);
    });
  }

  async function loadMembers() {
    var tbody = document.getElementById('members-body');
    tableMessage(tbody, 5, '載入中…');
    try {
      var result = await Portal.adminCall('listMembers', {});
      renderMembers(Portal.arrayFrom(result, 'members'));
    } catch (error) { tableMessage(tbody, 5, Portal.errorMessage(error)); }
  }

  async function deleteMember(row) {
    if (!window.confirm('確定從會員名單移除 ' + Portal.text(row.email) + '？')) return;
    await runWrite(null, async function () {
      await Portal.adminCall('deleteMember', { id: row.id }, { write: true });
      await Promise.all([loadMembers(), loadDashboard()]);
    }, '會員已移除。');
  }

  function parseCsvLine(line) {
    var fields = [];
    var value = '';
    var quoted = false;
    for (var i = 0; i < line.length; i += 1) {
      var char = line.charAt(i);
      if (char === '"') {
        if (quoted && line.charAt(i + 1) === '"') { value += '"'; i += 1; }
        else quoted = !quoted;
      } else if (char === ',' && !quoted) {
        fields.push(value.trim()); value = '';
      } else value += char;
    }
    if (quoted) throw new Error('CSV 引號未成對。');
    fields.push(value.trim());
    return fields;
  }

  async function parseMemberBulk(raw) {
    var rows = [];
    var seen = new Set();
    var lines = Portal.text(raw).split(/\r?\n/).filter(function (line) { return line.trim(); });
    for (var i = 0; i < lines.length; i += 1) {
      var fields = parseCsvLine(lines[i]);
      if (i === 0 && /^email$/i.test(fields[0])) continue;
      var email = await validateNtuEmail(fields[0]);
      if (seen.has(email)) throw new Error('第 ' + (i + 1) + ' 行 Email 重複：' + email);
      seen.add(email);
      rows.push({
        email: email,
        name: fields[1] || '',
        validUntil: fields[2] || '',
        expiresAt: fields[2] || '',
        notes: fields.slice(3).join(', '),
        note: fields.slice(3).join(', '),
        status: 'active',
        active: true,
      });
    }
    if (!rows.length) throw new Error('沒有可匯入的會員資料。');
    return rows;
  }

  // ----- Admins -----
  var ADMIN_PERMISSION_IDS = {
    content: 'admin-permission-content',
    members: 'admin-permission-members',
    audit: 'admin-permission-audit',
    all: 'admin-permission-all',
  };

  function permissionValues(value) {
    if (Array.isArray(value)) return value;
    return Portal.text(value).split(',').map(function (item) { return item.trim(); }).filter(Boolean);
  }

  function setAdminPermissions(value) {
    var permissions = permissionValues(value);
    var all = permissions.indexOf('all') !== -1;
    Object.keys(ADMIN_PERMISSION_IDS).forEach(function (permission) {
      var input = document.getElementById(ADMIN_PERMISSION_IDS[permission]);
      input.checked = permission === 'all' ? all : (all || permissions.indexOf(permission) !== -1);
      if (permission !== 'all') input.disabled = all;
    });
  }

  function selectedAdminPermissions() {
    if (document.getElementById(ADMIN_PERMISSION_IDS.all).checked) return ['all'];
    var permissions = ['content', 'members', 'audit'].filter(function (permission) {
      return document.getElementById(ADMIN_PERMISSION_IDS[permission]).checked;
    });
    if (!permissions.length) throw new Error('請至少勾選一項管理員權限。');
    return permissions;
  }

  function permissionLabel(value) {
    var labels = { content: '網站內容', members: '會員名單', audit: '操作紀錄', all: '全部功能' };
    return permissionValues(value).map(function (permission) { return labels[permission] || permission; }).join('、') || '未設定';
  }

  function resetAdminForm() {
    document.getElementById('admin-form').reset();
    document.getElementById('admin-id').value = '';
    document.getElementById('admin-original-email').value = '';
    document.getElementById('admin-email').readOnly = false;
    document.getElementById('admin-active').checked = true;
    setAdminPermissions(['content']);
    Portal.setText(document.getElementById('admin-form-title'), '新增管理員');
  }

  function editAdmin(row) {
    var email = Portal.text(row.email);
    document.getElementById('admin-id').value = Portal.text(row.id);
    document.getElementById('admin-original-email').value = email;
    document.getElementById('admin-email').value = email;
    document.getElementById('admin-email').readOnly = true;
    document.getElementById('admin-name').value = Portal.text(row.name);
    setAdminPermissions(row.permissions || row.pages || ['content']);
    document.getElementById('admin-active').checked = Portal.bool(row.active, true);
    Portal.setText(document.getElementById('admin-form-title'), '編輯管理員');
    document.getElementById('admin-form').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  async function adminObject() {
    var permissions = selectedAdminPermissions();
    return {
      id: Portal.trimmed(document.getElementById('admin-id').value),
      originalEmail: Portal.trimmed(document.getElementById('admin-original-email').value).toLowerCase(),
      email: await validateNtuEmail(document.getElementById('admin-email').value),
      name: Portal.trimmed(document.getElementById('admin-name').value),
      permissions: permissions,
      pages: permissions,
      active: document.getElementById('admin-active').checked,
      updatedAt: (function () {
        var id = Portal.trimmed(document.getElementById('admin-id').value);
        var existing = id ? stores.admins.get(id) : null;
        return existing ? Portal.text(existing.updatedAt) : '';
      }()),
    };
  }

  function renderAdmins(rows) {
    var tbody = document.getElementById('admins-body');
    Portal.clear(tbody);
    remember('admins', rows);
    if (!rows.length) { tableMessage(tbody, 5, '尚無管理員資料。'); return; }
    rows.forEach(function (row) {
      var tr = document.createElement('tr');
      var info = document.createElement('td');
      info.appendChild(textBlock(row.name || '未填姓名', 'cell-title'));
      info.appendChild(textBlock(row.email, 'cell-muted'));
      tr.appendChild(info);
      tr.appendChild(cell(permissionLabel(row.permissions || row.pages || 'all')));
      tr.appendChild(cell(Portal.formatDateTime(row.lastLogin || row.last_login)));
      var status = document.createElement('td');
      var isOwner = Portal.bool(row.owner);
      status.appendChild(badge(isOwner ? '擁有者' : (Portal.bool(row.active, true) ? '啟用' : '停用'), isOwner ? 'warn' : (Portal.bool(row.active, true) ? 'yes' : 'no')));
      tr.appendChild(status);
      tr.appendChild(actionCell(function () { editAdmin(row); }, function () { deleteAdmin(row); }, !isOwner));
      tbody.appendChild(tr);
    });
  }

  async function loadAdmins() {
    var tbody = document.getElementById('admins-body');
    tableMessage(tbody, 5, '載入中…');
    try {
      var result = await Portal.adminCall('listAdmins', {});
      renderAdmins(Portal.arrayFrom(result, 'admins'));
    } catch (error) { tableMessage(tbody, 5, Portal.errorMessage(error)); }
  }

  async function deleteAdmin(row) {
    if (Portal.bool(row.owner)) return;
    if (!window.confirm('確定移除管理員 ' + Portal.text(row.email) + '？')) return;
    await runWrite(null, async function () {
      await Portal.adminCall('deleteAdmin', { id: row.id }, { write: true });
      await Promise.all([loadAdmins(), loadDashboard()]);
    }, '管理員已移除。');
  }

  // ----- Audit -----
  function renderAudit(rows) {
    var tbody = document.getElementById('audit-body');
    Portal.clear(tbody);
    if (!rows.length) { tableMessage(tbody, 4, '尚無操作紀錄。'); return; }
    rows.forEach(function (row) {
      var tr = document.createElement('tr');
      tr.appendChild(cell(Portal.formatDateTime(row.time || row.createdAt)));
      tr.appendChild(cell(row.actor || row.email));
      tr.appendChild(cell(row.action));
      var target = row.target;
      if (target && typeof target === 'object') {
        try { target = JSON.stringify(target); } catch (error) { target = '[無法顯示]'; }
      }
      tr.appendChild(cell(target, 'cell-preview'));
      tbody.appendChild(tr);
    });
  }

  async function loadAudit() {
    var tbody = document.getElementById('audit-body');
    tableMessage(tbody, 4, '載入中…');
    try {
      var result = await Portal.adminCall('listAudit', {});
      renderAudit(Portal.arrayFrom(result, 'audit'));
    } catch (error) { tableMessage(tbody, 4, Portal.errorMessage(error)); }
  }

  // ----- Forms and events -----
  function bindForms() {
    document.getElementById('announcement-form').addEventListener('submit', function (event) {
      event.preventDefault();
      var button = event.submitter;
      runWrite(button, async function () {
        var record = announcementObject();
        if (!record.title) throw new Error('請填寫公告標題。');
        await Portal.adminCall('saveAnnouncement', record, { write: true });
        resetAnnouncementForm();
        await Promise.all([loadAnnouncements(), loadDashboard()]);
      }, '公告已儲存。');
    });
    document.getElementById('link-form').addEventListener('submit', function (event) {
      event.preventDefault();
      var button = event.submitter;
      runWrite(button, async function () {
        var record = linkObject();
        if (!record.title) throw new Error('請填寫連結標題。');
        await Portal.adminCall('saveLink', record, { write: true });
        resetLinkForm();
        await Promise.all([loadLinks(), loadDashboard()]);
      }, '連結已儲存。');
    });
    document.getElementById('member-content-form').addEventListener('submit', function (event) {
      event.preventDefault();
      var button = event.submitter;
      runWrite(button, async function () {
        var record = memberContentObject();
        if (!record.title) throw new Error('請填寫會員內容標題。');
        await Portal.adminCall('saveMemberContent', record, { write: true });
        resetMemberContentForm();
        await Promise.all([loadMemberContent(), loadDashboard()]);
      }, '會員內容已儲存。');
    });
    document.getElementById('member-form').addEventListener('submit', function (event) {
      event.preventDefault();
      var button = event.submitter;
      runWrite(button, async function () {
        var record = await memberObject();
        await Portal.adminCall('saveMember', record, { write: true });
        resetMemberForm();
        await Promise.all([loadMembers(), loadDashboard()]);
      }, '會員資料已儲存。');
    });
    document.getElementById('admin-form').addEventListener('submit', function (event) {
      event.preventDefault();
      var button = event.submitter;
      runWrite(button, async function () {
        var record = await adminObject();
        await Portal.adminCall('saveAdmin', record, { write: true });
        resetAdminForm();
        await Promise.all([loadAdmins(), loadDashboard()]);
      }, '管理員資料已儲存。');
    });
  }

  function bindControls() {
    if (window.NtuEconPageEditor) window.NtuEconPageEditor.bind();
    document.getElementById('admin-nav').addEventListener('click', function (event) {
      var button = event.target.closest('[data-panel]');
      if (button) openPanel(button.dataset.panel);
    });
    document.querySelectorAll('[data-refresh]').forEach(function (button) {
      button.addEventListener('click', function () { openPanel(button.dataset.refresh); });
    });
    document.getElementById('refresh-dashboard-button').addEventListener('click', loadDashboard);
    document.getElementById('announcement-cancel').addEventListener('click', resetAnnouncementForm);
    document.getElementById('link-cancel').addEventListener('click', resetLinkForm);
    document.getElementById('member-content-cancel').addEventListener('click', resetMemberContentForm);
    document.getElementById('member-cancel').addEventListener('click', resetMemberForm);
    document.getElementById('admin-cancel').addEventListener('click', resetAdminForm);
    document.getElementById('admin-permission-all').addEventListener('change', function (event) {
      var checked = event.currentTarget.checked;
      ['content', 'members', 'audit'].forEach(function (permission) {
        var input = document.getElementById(ADMIN_PERMISSION_IDS[permission]);
        input.checked = checked;
        input.disabled = checked;
      });
    });
    document.getElementById('bulk-members-button').addEventListener('click', function (event) {
      runWrite(event.currentTarget, async function () {
        var rows = await parseMemberBulk(document.getElementById('member-bulk').value);
        if (!window.confirm('即將新增或更新 ' + rows.length + ' 筆會員資料，確定繼續？')) return;
        await Portal.adminCall('bulkUpsertMembers', { rows: rows }, { write: true });
        document.getElementById('member-bulk').value = '';
        await Promise.all([loadMembers(), loadDashboard()]);
        Portal.announce('已匯入 ' + rows.length + ' 筆會員資料。');
      });
    });
  }

  async function signOut() {
    var buttons = [document.getElementById('logout-button'), document.getElementById('switch-account-button')];
    buttons.forEach(function (button) { button.disabled = true; });
    try { await Portal.logout(); }
    catch (error) { Portal.announce(Portal.errorMessage(error), 'error'); }
    finally {
      buttons.forEach(function (button) { button.disabled = false; });
      me = null;
      setHeader(null);
      redirectToLogin();
    }
  }

  async function start() {
    showRoot('loading-view');
    setHeader(null);
    try {
      await Portal.loadConfig(false);
      me = await Portal.getMe();
      if (!me.authenticated) {
        redirectToLogin();
        return;
      }
      setHeader(me);
      if (!me.admin) {
        Portal.setText(document.getElementById('denied-copy'), '帳號 ' + me.email + ' 已登入，但不在有效管理員名單中。');
        showRoot('denied-view');
        return;
      }
      applyNavigationPermissions();
      showRoot('admin-view');
      await openPanel('dashboard');
    } catch (error) {
      if (error.status === 401) {
        redirectToLogin();
        return;
      }
      showAdminEntry(Portal.errorMessage(error));
    }
  }

  document.getElementById('logout-button').addEventListener('click', signOut);
  document.getElementById('switch-account-button').addEventListener('click', signOut);
  bindForms();
  bindControls();
  bindLivePreviews();
  resetAnnouncementForm();
  resetLinkForm();
  resetMemberContentForm();
  resetMemberForm();
  resetAdminForm();
  start();
}());
