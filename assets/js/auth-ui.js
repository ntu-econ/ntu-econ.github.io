(function () {
  'use strict';

  function getPortalUrl() {
    var config = window.NTU_ECON_SITE_CONFIG || {};
    var candidate = config.portalUrl;

    try {
      var url = new URL(candidate);
      if (url.protocol === 'https:' || url.protocol === 'http:') {
        return url.href;
      }
    } catch (error) {
      // 使用下方不會解析到真實服務的安全 placeholder。
    }

    return 'https://ntu-econ-portal.example.invalid/member/';
  }

  function injectMemberPortalLink() {
    var navList = document.querySelector('#main-header .nav-area nav ul');
    if (!navList) return;

    var item = navList.querySelector('[data-member-portal-item]');
    var link;

    if (!item) {
      item = document.createElement('li');
      item.setAttribute('data-member-portal-item', '');
      item.className = 'member-portal-nav-item';
      navList.appendChild(item);
    }

    link = item.querySelector('a');
    if (!link) {
      link = document.createElement('a');
      item.appendChild(link);
    }

    link.className = 'nav-link member-portal-link';
    link.href = getPortalUrl();
    link.textContent = '會員登入';
    link.setAttribute('aria-label', '使用 g.ntu.edu.tw 帳號登入會員專區或管理後台');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectMemberPortalLink);
  } else {
    injectMemberPortalLink();
  }
}());
