(function () {
  'use strict';

  var DEFAULT_LINKS = [
    {
      title: '系學會 Instagram',
      description: '追蹤最新活動動態',
      url: 'https://www.instagram.com/ntueconsa/',
      icon: 'instagram',
      group: '社群媒體',
      showOnHome: true
    },
    {
      title: '系學會 Facebook',
      description: '粉絲專頁公告與貼文',
      url: 'https://www.facebook.com/ntueconsa',
      icon: 'facebook',
      group: '社群媒體',
      showOnHome: true
    },
    {
      title: '臺大經濟系官網',
      description: '系所介紹、師資、課程資訊',
      url: 'http://www.econ.ntu.edu.tw/',
      icon: 'globe',
      group: '官方資源',
      showOnHome: true
    },
    {
      title: '台大財務處捐款專頁',
      description: '透過台大財務處贊助學生會',
      url: 'https://giving.ntu.edu.tw/',
      icon: 'globe',
      group: '官方資源',
      showOnHome: false
    },
    {
      title: 'NTU Econ Night YouTube',
      description: '歷年經濟之夜活動影片',
      url: 'https://www.youtube.com/@ntuEconNight/videos',
      icon: 'youtube',
      group: '影音頻道',
      showOnHome: false
    }
  ];

  function asText(value) {
    if (typeof value === 'string' || typeof value === 'number') {
      return String(value);
    }
    return '';
  }

  function appendTextElement(parent, tagName, className, value) {
    var element = document.createElement(tagName);
    element.className = className;
    element.textContent = asText(value);
    parent.appendChild(element);
    return element;
  }

  function getSafeHref(value) {
    if (typeof value !== 'string' || !value.trim()) return null;

    try {
      var url = new URL(value.trim(), document.baseURI);
      var allowed = ['http:', 'https:', 'mailto:', 'tel:'];
      if (window.location.protocol === 'file:') allowed.push('file:');
      return allowed.indexOf(url.protocol) !== -1 ? url.href : null;
    } catch (error) {
      return null;
    }
  }

  function isPublished(item) {
    return item && item.published !== false && item.published !== 0 && item.published !== 'false';
  }

  function sortByOrder(items) {
    return items.slice().sort(function (left, right) {
      var leftOrder = Number(left && left.order);
      var rightOrder = Number(right && right.order);
      if (!Number.isFinite(leftOrder)) leftOrder = Number.MAX_SAFE_INTEGER;
      if (!Number.isFinite(rightOrder)) rightOrder = Number.MAX_SAFE_INTEGER;
      return leftOrder - rightOrder;
    });
  }

  function isHighlighted(item) {
    if (!item || typeof item !== 'object') return false;
    var value = typeof item.highlight !== 'undefined' ? item.highlight : item.pinned;
    return value === true || value === 1 || value === '1' || String(value).toLowerCase() === 'true';
  }

  function sortAnnouncements(items) {
    return items.slice().sort(function (left, right) {
      var pinPriority = Number(isHighlighted(right)) - Number(isHighlighted(left));
      if (pinPriority) return pinPriority;

      var leftOrder = Number(left && left.order);
      var rightOrder = Number(right && right.order);
      if (!Number.isFinite(leftOrder)) leftOrder = Number.MAX_SAFE_INTEGER;
      if (!Number.isFinite(rightOrder)) rightOrder = Number.MAX_SAFE_INTEGER;
      return leftOrder - rightOrder;
    });
  }

  function getIcon(name) {
    var icons = {
      instagram: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/></svg>',
      facebook: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>',
      globe: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>',
      youtube: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.96C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.96-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58zM9.75 15.02V8.98L15.5 12l-5.75 3.02z"/></svg>',
      line: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.627.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63.349 0 .631.285.631.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.281.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314"/></svg>'
    };
    return icons[name] || icons.globe;
  }

  function appendIcon(parent, className, iconName) {
    var icon = document.createElement('span');
    icon.className = className;
    // SVG 來自上方的固定 allowlist，不插入 API/CMS 提供的 HTML。
    icon.innerHTML = getIcon(iconName);
    parent.appendChild(icon);
  }

  function getPublicApiUrl(resource) {
    var config = window.NTU_ECON_SITE_CONFIG || {};
    var base = config.publicApiBaseUrl;
    if (typeof base !== 'string' || !base.trim()) return null;

    try {
      var url = new URL(base.replace(/\/$/, '') + '/' + resource);
      if (url.protocol !== 'https:' && url.protocol !== 'http:') return null;
      if (url.hostname.slice(-8) === '.invalid') return null;
      return url.href;
    } catch (error) {
      return null;
    }
  }

  function fetchPublicPayload(resource) {
    var url = getPublicApiUrl(resource);
    if (!url) return Promise.resolve(null);

    var config = window.NTU_ECON_SITE_CONFIG || {};
    var timeoutMs = Number(config.publicApiTimeoutMs) || 4500;
    var controller = typeof AbortController === 'function' ? new AbortController() : null;
    var timeoutId = controller ? window.setTimeout(function () {
      controller.abort();
    }, timeoutMs) : null;

    return fetch(url, {
      credentials: 'omit',
      headers: { Accept: 'application/json' },
      signal: controller ? controller.signal : undefined
    }).then(function (response) {
      if (!response.ok) throw new Error('HTTP ' + response.status);
      return response.json();
    }).then(function (payload) {
      if (!payload || typeof payload !== 'object' || payload.ok !== true) {
        throw new Error('回應格式不正確');
      }
      // Worker 還沒有完成初始化時，不以空資料覆蓋現有靜態內容。
      return payload.initialized === true ? payload : null;
    }).catch(function (error) {
      console.warn('公開資料 API 載入失敗，已改用靜態資料：', resource, error.message);
      return null;
    }).then(function (payload) {
      if (timeoutId !== null) window.clearTimeout(timeoutId);
      return payload;
    });
  }

  function flattenLinks(collection) {
    var links = [];
    sortByOrder(Array.isArray(collection) ? collection : []).forEach(function (entry) {
      if (!entry || typeof entry !== 'object' || !isPublished(entry)) return;

      if (Array.isArray(entry.items)) {
        var inheritedGroup = asText(entry.group || entry.category || entry.label);
        sortByOrder(entry.items).forEach(function (item) {
          if (!item || typeof item !== 'object' || !isPublished(item)) return;
          var copy = Object.assign({}, item);
          if (!copy.group && !copy.category) copy.group = inheritedGroup;
          links.push(copy);
        });
      } else {
        links.push(entry);
      }
    });
    return links;
  }

  function mergeStaticLinks(staticLinks) {
    var merged = DEFAULT_LINKS.map(function (fallback) {
      var match = staticLinks.find(function (item) {
        return item && (item.title === fallback.title || item.url === fallback.url);
      });
      return match ? Object.assign({}, fallback, match) : Object.assign({}, fallback);
    });

    staticLinks.forEach(function (item) {
      if (!item || typeof item !== 'object') return;
      var exists = merged.some(function (known) {
        return known.title === item.title || known.url === item.url;
      });
      if (!exists) merged.push(Object.assign({ group: '相關連結', showOnHome: true }, item));
    });
    return merged;
  }

  function loadStaticLinks() {
    return fetch('assets/data/links.json', {
      credentials: 'same-origin',
      headers: { Accept: 'application/json' }
    }).then(function (response) {
      if (!response.ok) throw new Error('HTTP ' + response.status);
      return response.json();
    }).then(function (links) {
      if (!Array.isArray(links)) throw new Error('回應格式不正確');
      return mergeStaticLinks(links);
    }).catch(function () {
      return mergeStaticLinks([]);
    });
  }

  function loadDetailedLinks() {
    return fetchPublicPayload('links').then(function (payload) {
      if (payload && Array.isArray(payload.links)) return flattenLinks(payload.links);
      return loadStaticLinks();
    });
  }

  function renderAnnouncements(container, announcements) {
    var tagColors = {
      '公告': 'tag-announce',
      '活動': 'tag-event',
      '最新': 'tag-new',
      '招募': 'tag-recruit'
    };

    var visibleAnnouncements = sortAnnouncements(announcements).filter(isPublished);
    container.textContent = '';
    if (!visibleAnnouncements.length) {
      appendTextElement(container, 'p', 'news-empty', '目前尚無公告。');
      return;
    }

    visibleAnnouncements.forEach(function (item) {
      if (!item || typeof item !== 'object') return;

      var href = getSafeHref(item.link || item.url);
      var row = document.createElement(href ? 'a' : 'div');
      var tag = asText(item.tag || item.category) || '公告';
      var highlighted = isHighlighted(item);
      row.className = 'news-row' + (highlighted ? ' news-highlight' : '');

      if (href) {
        row.href = href;
        row.target = '_blank';
        row.rel = 'noopener noreferrer';
      }

      appendTextElement(
        row,
        'span',
        'news-date',
        item.date || item.publishedAt || item.published_at
      );
      appendTextElement(row, 'span', 'news-tag ' + (tagColors[tag] || 'tag-announce'), tag);
      appendTextElement(row, 'span', 'news-title', item.title);
      if (href) appendTextElement(row, 'span', 'news-arrow', '→');
      container.appendChild(row);
    });
  }

  function renderHomeLinks(container, collection) {
    container.textContent = '';
    flattenLinks(collection).filter(function (link) {
      var showOnHome = link.showOnHome;
      if (typeof showOnHome === 'undefined') showOnHome = link.show_on_home;
      return showOnHome !== false && showOnHome !== 0;
    }).forEach(function (link) {
      var href = getSafeHref(link.url || link.href);
      if (!href) return;

      var card = document.createElement('a');
      card.href = href;
      card.className = 'link-card';
      card.target = '_blank';
      card.rel = 'noopener noreferrer';

      appendIcon(card, 'link-card-icon', asText(link.icon));
      appendTextElement(card, 'span', 'link-card-title', link.title);
      appendTextElement(card, 'span', 'link-card-arrow', '→');
      container.appendChild(card);
    });
  }

  function renderDetailedLinks(container, collection) {
    var grouped = new Map();
    container.textContent = '';

    flattenLinks(collection).forEach(function (link) {
      var href = getSafeHref(link.url || link.href);
      if (!href) return;
      var groupName = asText(link.group || link.category) || '相關連結';
      if (!grouped.has(groupName)) grouped.set(groupName, []);
      grouped.get(groupName).push({ item: link, href: href });
    });

    grouped.forEach(function (links, groupName) {
      appendTextElement(container, 'div', 'links-group-label', groupName);

      links.forEach(function (entry) {
        var link = entry.item;
        var card = document.createElement('a');
        var body = document.createElement('span');
        var description = link.description || link.desc;

        card.href = entry.href;
        card.target = '_blank';
        card.rel = 'noopener noreferrer';
        card.className = 'lk-card';

        appendIcon(card, 'lk-icon', asText(link.icon));
        body.className = 'lk-body';
        appendTextElement(body, 'span', 'lk-title', link.title);
        if (description) appendTextElement(body, 'span', 'lk-desc', description);
        card.appendChild(body);
        appendTextElement(card, 'span', 'lk-arrow', '→');
        container.appendChild(card);
      });
    });
  }

  function initHeader() {
    var header = document.getElementById('main-header') || document.querySelector('header');
    if (!header) return;
    window.addEventListener('scroll', function () {
      header.classList.toggle('scrolled', window.scrollY > 50);
    });
  }

  function initReveal() {
    var elements = document.querySelectorAll('.reveal');
    if (typeof IntersectionObserver !== 'function') {
      elements.forEach(function (element) { element.classList.add('active'); });
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08 });
    elements.forEach(function (element) { observer.observe(element); });
  }

  function initPublicContent() {
    var newsList = document.getElementById('news-list');
    var homeLinks = document.getElementById('linktree-container');
    var detailedLinks = document.getElementById('links-list');

    if (newsList || homeLinks) {
      var fallbackAnnouncements = typeof window.ANNOUNCEMENTS !== 'undefined' &&
        Array.isArray(window.ANNOUNCEMENTS) ? window.ANNOUNCEMENTS : [];
      fetchPublicPayload('home').then(function (payload) {
        var announcements = payload && Array.isArray(payload.announcements) ?
          payload.announcements : fallbackAnnouncements;

        if (newsList) renderAnnouncements(newsList, announcements);

        if (homeLinks) {
          if (payload && Array.isArray(payload.links)) {
            renderHomeLinks(homeLinks, payload.links);
          } else {
            loadStaticLinks().then(function (links) {
              renderHomeLinks(homeLinks, links);
            });
          }
        }
      });
    }

    if (detailedLinks) {
      loadDetailedLinks().then(function (links) {
        renderDetailedLinks(detailedLinks, links);
      });
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    initHeader();
    initReveal();
    initPublicContent();
  });
}());
