(function () {
  'use strict';

  var pageSlug = document.body && document.body.getAttribute('data-cms-page');

  function binding(selector, mode) {
    return { selector: selector, mode: mode || 'text' };
  }

  var BINDINGS = {
    about: {
      heroTitle: binding('.page-hero-text h1', 'firstText'), heroEyebrow: binding('.page-hero-text h1 span'), heroIntro: binding('.page-hero-text > p'),
      missionTitle: binding('#mission .section-heading h2'),
      mission1Title: binding('#mission .goal-item:nth-child(1) h4'), mission1Body: binding('#mission .goal-item:nth-child(1) p'),
      mission2Title: binding('#mission .goal-item:nth-child(2) h4'), mission2Body: binding('#mission .goal-item:nth-child(2) p'),
      mission3Title: binding('#mission .goal-item:nth-child(3) h4'), mission3Body: binding('#mission .goal-item:nth-child(3) p'),
      mission4Title: binding('#mission .goal-item:nth-child(4) h4'), mission4Body: binding('#mission .goal-item:nth-child(4) p'),
      structureTitle: binding('#structure .section-heading h2'), structureIntro: binding('#structure > p'),
      department1Title: binding('#structure .department-card:nth-child(1) h3'), department1Body: binding('#structure .department-card:nth-child(1) p'),
      department2Title: binding('#structure .department-card:nth-child(2) h3'), department2Body: binding('#structure .department-card:nth-child(2) p'),
      department3Title: binding('#structure .department-card:nth-child(3) h3'), department3Body: binding('#structure .department-card:nth-child(3) p'),
      department4Title: binding('#structure .department-card:nth-child(4) h3'), department4Body: binding('#structure .department-card:nth-child(4) p'),
      department5Title: binding('#structure .department-card:nth-child(5) h3'), department5Body: binding('#structure .department-card:nth-child(5) p'),
      department6Title: binding('#structure .department-card:nth-child(6) h3'), department6Body: binding('#structure .department-card:nth-child(6) p'),
      department7Title: binding('#structure .department-card:nth-child(7) h3'), department7Body: binding('#structure .department-card:nth-child(7) p'),
      department8Title: binding('#structure .department-card:nth-child(8) h3'), department8Body: binding('#structure .department-card:nth-child(8) p'),
      highlightsTitle: binding('#highlights .section-heading h2'),
      highlight1Title: binding('#highlights .highlight-card:nth-child(1) h3'), highlight1Body: binding('#highlights .highlight-card:nth-child(1) p'),
      highlight2Title: binding('#highlights .highlight-card:nth-child(2) h3'), highlight2Body: binding('#highlights .highlight-card:nth-child(2) p'),
      highlight3Title: binding('#highlights .highlight-card:nth-child(3) h3'), highlight3Body: binding('#highlights .highlight-card:nth-child(3) p'),
      highlight4Title: binding('#highlights .highlight-card:nth-child(4) h3'), highlight4Body: binding('#highlights .highlight-card:nth-child(4) p'),
      highlight5Title: binding('#highlights .highlight-card:nth-child(5) h3'), highlight5Body: binding('#highlights .highlight-card:nth-child(5) p'),
      highlight6Title: binding('#highlights .highlight-card:nth-child(6) h3'), highlight6Body: binding('#highlights .highlight-card:nth-child(6) p'),
      highlight7Title: binding('#highlights .highlight-card:nth-child(7) h3'), highlight7Body: binding('#highlights .highlight-card:nth-child(7) p'),
      contactTitle: binding('#contact .section-heading h2'), contactOffice: binding('#contact .contact-list li:nth-child(1)', 'afterStrong'),
      contactFeedback: binding('#contact .contact-list li:nth-child(5)', 'afterStrong'),
    },
    review: {
      heroTitle: binding('.page-hero-text h1', 'firstText'), heroEyebrow: binding('.page-hero-text h1 span'), heroIntro: binding('.page-hero-text > p'),
      nightTitle: binding('#econ-night .section-heading h2'), nightIntro: binding('#econ-night > p:first-of-type'),
      night2024Title: binding('#econ-night .dock-pane[data-year="2024"] h3'), night2022Title: binding('#econ-night .dock-pane[data-year="2022"] h3'),
      night2017Title: binding('#econ-night .dock-pane[data-year="2017"] h3'), night2016Title: binding('#econ-night .dock-pane[data-year="2016"] h3'),
      night2015Title: binding('#econ-night .dock-pane[data-year="2015"] h3'), night2014Title: binding('#econ-night .dock-pane[data-year="2014"] h3'),
      night2013Title: binding('#econ-night .dock-pane[data-year="2013"] h3'), night2012Title: binding('#econ-night .dock-pane[data-year="2012"] h3'),
      weekTitle: binding('#econ-week .section-heading h2'), weekIntro: binding('#econ-week > p'),
      weekEventTitle: binding('#econ-week .timeline-pane h3'), weekEventBody: binding('#econ-week .timeline-pane > p'),
      campTitle: binding('#econ-camp .section-heading h2'), campIntro: binding('#econ-camp > p'),
      campEventTitle: binding('#econ-camp .timeline-pane h3'), campEventBody: binding('#econ-camp .timeline-pane > p'),
      orientationTitle: binding('#orientation .section-heading h2'), orientationIntro: binding('#orientation > p'),
      orientationEventTitle: binding('#orientation .timeline-pane h3'), orientationEventBody: binding('#orientation .timeline-pane > p'),
      otherTitle: binding('#other-activities .section-heading h2'), otherIntro: binding('#other-activities > p'),
      other1Title: binding('#other-activities .mini-card:nth-child(1) h3'), other1Body: binding('#other-activities .mini-card:nth-child(1) > p'),
      other2Title: binding('#other-activities .mini-card:nth-child(2) h3'), other2Body: binding('#other-activities .mini-card:nth-child(2) > p'),
      other3Title: binding('#other-activities .mini-card:nth-child(3) h3'), other3Body: binding('#other-activities .mini-card:nth-child(3) > p'),
      other4Title: binding('#other-activities .mini-card:nth-child(4) h3'), other4Body: binding('#other-activities .mini-card:nth-child(4) > p'),
    },
    support: {
      heroTitle: binding('.page-header-text h1'), heroIntro: binding('.page-header-text > p'),
      processTitle: binding('#how-to .section-heading h2'),
      step1Title: binding('#how-to .step-item:nth-child(1) h3'), step1Body: binding('#how-to .step-item:nth-child(1) p'),
      step2Title: binding('#how-to .step-item:nth-child(2) h3'), step2Body: binding('#how-to .step-item:nth-child(2) p'),
      step3Title: binding('#how-to .step-item:nth-child(3) h3'), step3Body: binding('#how-to .step-item:nth-child(3) p'),
      step4Title: binding('#how-to .step-item:nth-child(4) h3'), step4Body: binding('#how-to .step-item:nth-child(4) p'),
      paymentTitle: binding('#plan .section-heading h2'),
      payment1Title: binding('#plan .pay-card:nth-child(1) h3'), payment1Notice: binding('#plan .pay-card:nth-child(1) h3 + div'),
      payment1Bank: binding('#plan .pay-card:nth-child(1) .bank-row:nth-child(1) span:last-child'),
      payment1Name: binding('#plan .pay-card:nth-child(1) .bank-row:nth-child(2) span:last-child'),
      payment1Account: binding('#plan .pay-card:nth-child(1) .bank-row:nth-child(3) span:last-child'),
      payment2Title: binding('#plan .pay-card:nth-child(2) h3'), payment2Notice: binding('#plan .pay-card:nth-child(2) h3 + div'),
      payment2Account: binding('#plan .pay-card:nth-child(2) .bank-row:nth-child(2) span:last-child'),
      shippingTitle: binding('#feedback .section-heading h2'), shippingBody: binding('#feedback > p'), shippingNote: binding('#feedback > div', 'afterStrong'),
      goalsTitle: binding('#goal .section-heading h2'),
      goal1Title: binding('#goal .goal-item:nth-child(1) h4'), goal1Body: binding('#goal .goal-item:nth-child(1) p'),
      goal2Title: binding('#goal .goal-item:nth-child(2) h4'), goal2Body: binding('#goal .goal-item:nth-child(2) p'),
      goal3Title: binding('#goal .goal-item:nth-child(3) h4'), goal3Body: binding('#goal .goal-item:nth-child(3) p'),
      faqTitle: binding('#faq .section-heading h2'),
      faq1Title: binding('#faq details:nth-of-type(1) summary', 'firstText'), faq1Body: binding('#faq details:nth-of-type(1) .faq-body'),
      faq2Title: binding('#faq details:nth-of-type(2) summary', 'firstText'), faq2Body: binding('#faq details:nth-of-type(2) .faq-body'),
      faq3Title: binding('#faq details:nth-of-type(3) summary', 'firstText'), faq3Body: binding('#faq details:nth-of-type(3) .faq-body'),
      faq4Title: binding('#faq details:nth-of-type(4) summary', 'firstText'), faq4Body: binding('#faq details:nth-of-type(4) .faq-body'),
      faq5Title: binding('#faq details:nth-of-type(5) summary', 'firstText'), faq5Body: binding('#faq details:nth-of-type(5) .faq-body'),
      faq6Title: binding('#faq details:nth-of-type(6) summary', 'firstText'), faq6Body: binding('#faq details:nth-of-type(6) .faq-body'),
    },
  };

  function replaceFirstText(node, value) {
    for (var i = 0; i < node.childNodes.length; i += 1) {
      if (node.childNodes[i].nodeType === Node.TEXT_NODE) {
        node.childNodes[i].nodeValue = value;
        return;
      }
    }
    node.insertBefore(document.createTextNode(value), node.firstChild);
  }

  function replaceAfterStrong(node, value) {
    var strong = node.querySelector('strong');
    if (!strong) { node.textContent = value; return; }
    while (strong.nextSibling) node.removeChild(strong.nextSibling);
    node.appendChild(document.createTextNode(' ' + value));
  }

  function applyFields(fields) {
    var bindings = BINDINGS[pageSlug] || {};
    Object.keys(fields || {}).forEach(function (key) {
      var rule = bindings[key];
      if (!rule) return;
      var node = document.querySelector(rule.selector);
      if (!node) return;
      var value = String(fields[key] == null ? '' : fields[key]);
      if (rule.mode === 'firstText') replaceFirstText(node, value);
      else if (rule.mode === 'afterStrong') replaceAfterStrong(node, value);
      else node.textContent = value;
    });
  }

  function applyGalleries(galleries) {
    if (!window.GALLERY_DATA || !galleries || typeof galleries !== 'object') return;
    Object.keys(galleries).forEach(function (key) {
      var parts = key.split('/');
      if (parts.length !== 2 || !Array.isArray(galleries[key])) return;
      if (!window.GALLERY_DATA[parts[0]]) window.GALLERY_DATA[parts[0]] = {};
      window.GALLERY_DATA[parts[0]][parts[1]] = galleries[key];
    });
  }

  function choice(value, allowed, fallback) {
    return allowed.indexOf(String(value || '')) !== -1 ? String(value) : fallback;
  }

  function safeUrl(value) {
    var raw = String(value == null ? '' : value).trim();
    if (!raw || /^\/\//.test(raw)) return '';
    try {
      var parsed = new URL(raw, window.location.href);
      if (parsed.username || parsed.password || (parsed.protocol !== 'http:' && parsed.protocol !== 'https:')) return '';
      return parsed.href;
    } catch (_) {
      return '';
    }
  }

  function addText(parent, tag, className, value) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    node.textContent = String(value == null ? '' : value);
    parent.appendChild(node);
    return node;
  }

  function blockImage(url, alt, className, eager) {
    var safe = safeUrl(url);
    if (!safe) return null;
    var image = document.createElement('img');
    image.src = safe;
    image.alt = String(alt == null ? '' : alt);
    image.className = className || '';
    image.loading = eager ? 'eager' : 'lazy';
    image.decoding = 'async';
    return image;
  }

  function blockLink(label, url, className) {
    var safe = safeUrl(url);
    if (!safe || !label) return null;
    var link = document.createElement('a');
    link.href = safe;
    link.textContent = String(label);
    link.className = className || '';
    if (new URL(safe).origin !== window.location.origin) {
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
    }
    return link;
  }

  function appendHeading(parent, block, headingTag) {
    if (block.eyebrow) addText(parent, 'span', 'cms-block-eyebrow', block.eyebrow);
    if (block.title) addText(parent, headingTag || 'h2', 'cms-block-title', block.title);
    if (block.body) addText(parent, 'p', 'cms-block-body', block.body);
  }

  function renderFreeBlocks(blocks) {
    if (!Array.isArray(blocks) || !blocks.length) return false;
    var main = document.querySelector('main');
    if (!main) return false;
    document.body.classList.add('cms-free-active');
    Array.from(main.children).forEach(function (child) { child.hidden = true; });
    var layout = document.createElement('div');
    layout.className = 'cms-free-layout';
    layout.dataset.cmsFreeLayout = pageSlug || 'page';

    blocks.forEach(function (block) {
      if (!block || typeof block !== 'object') return;
      var type = choice(block.type, ['hero', 'text', 'image', 'split', 'cards', 'button', 'divider'], '');
      if (!type) return;
      var tone = choice(block.tone, ['plain', 'card', 'navy', 'gold', 'soft'], type === 'hero' ? 'navy' : 'plain');
      var width = choice(block.width, ['full', 'wide', 'narrow'], 'wide');
      var align = choice(block.align, ['left', 'center'], 'left');
      var section = document.createElement('section');
      section.className = 'cms-block cms-block--' + type + ' cms-tone--' + tone + ' cms-width--' + width + ' cms-align--' + align;

      if (type === 'hero') {
        var heroImage = blockImage(block.imageUrl, block.imageAlt, 'cms-hero-image', true);
        if (heroImage) section.appendChild(heroImage);
        var heroCopy = document.createElement('div');
        heroCopy.className = 'cms-hero-copy';
        appendHeading(heroCopy, block, 'h1');
        section.appendChild(heroCopy);
      } else if (type === 'text') {
        appendHeading(section, block, 'h2');
        if (choice(block.columns, ['one', 'two'], 'one') === 'two') section.classList.add('cms-text--columns');
      } else if (type === 'image') {
        var figure = document.createElement('figure');
        figure.className = 'cms-figure cms-aspect--' + choice(block.aspect, ['auto', 'wide', 'landscape', 'square'], 'landscape');
        var image = blockImage(block.imageUrl, block.imageAlt, 'cms-figure-image', false);
        if (image) {
          var imageLink = blockLink(block.imageAlt || '開啟圖片連結', block.linkUrl, 'cms-image-link');
          if (imageLink) { imageLink.replaceChildren(image); figure.appendChild(imageLink); }
          else figure.appendChild(image);
        }
        if (block.caption) addText(figure, 'figcaption', '', block.caption);
        section.appendChild(figure);
      } else if (type === 'split') {
        var imageWrap = document.createElement('div');
        imageWrap.className = 'cms-split-image';
        var splitImage = blockImage(block.imageUrl, block.imageAlt, '', false);
        if (splitImage) imageWrap.appendChild(splitImage);
        else imageWrap.setAttribute('aria-hidden', 'true');
        var splitCopy = document.createElement('div');
        splitCopy.className = 'cms-split-copy';
        appendHeading(splitCopy, block, 'h2');
        var splitButton = blockLink(block.buttonLabel, block.buttonUrl, 'cms-button cms-button--primary');
        if (splitButton) splitCopy.appendChild(splitButton);
        if (choice(block.imageSide, ['left', 'right'], 'left') === 'right') section.classList.add('cms-split--reverse');
        section.append(imageWrap, splitCopy);
      } else if (type === 'cards') {
        var groupHeading = document.createElement('div');
        groupHeading.className = 'cms-group-heading';
        appendHeading(groupHeading, block, 'h2');
        section.appendChild(groupHeading);
        var grid = document.createElement('div');
        grid.className = 'cms-card-grid cms-card-grid--' + choice(block.columns, ['two', 'three', 'four'], 'three');
        (Array.isArray(block.items) ? block.items : []).forEach(function (item) {
          if (!item || typeof item !== 'object') return;
          var card = document.createElement('article');
          card.className = 'cms-content-card';
          var cardImage = blockImage(item.imageUrl, item.imageAlt, 'cms-card-image', false);
          if (cardImage) card.appendChild(cardImage);
          var cardCopy = document.createElement('div');
          cardCopy.className = 'cms-card-copy';
          if (item.title) addText(cardCopy, 'h3', '', item.title);
          if (item.body) addText(cardCopy, 'p', '', item.body);
          var cardLink = blockLink(item.linkLabel, item.linkUrl, 'cms-card-link');
          if (cardLink) cardCopy.appendChild(cardLink);
          card.appendChild(cardCopy);
          grid.appendChild(card);
        });
        section.appendChild(grid);
      } else if (type === 'button') {
        var variant = choice(block.variant, ['primary', 'outline', 'text'], 'primary');
        var button = blockLink(block.label, block.url, 'cms-button cms-button--' + variant);
        if (button) section.appendChild(button);
      } else if (type === 'divider') {
        section.classList.add('cms-divider--' + choice(block.space, ['small', 'medium', 'large'], 'medium'));
        if (block.showLine === true || block.showLine === 'true') section.appendChild(document.createElement('hr'));
      }
      layout.appendChild(section);
    });
    main.appendChild(layout);
    return true;
  }

  function loadPageContent() {
    var config = window.NTU_ECON_SITE_CONFIG || {};
    var base = config.publicApiBaseUrl;
    if (!pageSlug || !BINDINGS[pageSlug] || typeof base !== 'string' || !base || base.indexOf('.invalid') !== -1) {
      return Promise.resolve(null);
    }
    var controller = typeof AbortController === 'function' ? new AbortController() : null;
    var timeoutId = controller ? window.setTimeout(function () { controller.abort(); }, Number(config.publicApiTimeoutMs) || 30000) : null;
    return fetch(base.replace(/\/$/, '') + '/page?slug=' + encodeURIComponent(pageSlug), {
      credentials: 'omit', headers: { Accept: 'application/json' }, signal: controller ? controller.signal : undefined,
    }).then(function (response) {
      if (!response.ok) throw new Error('HTTP ' + response.status);
      return response.json();
    }).then(function (payload) {
      var page = payload && payload.ok === true ? payload.page : null;
      if (page && page.published !== false) {
        if (!renderFreeBlocks(page.blocks || [])) {
          applyFields(page.fields || {});
          applyGalleries(page.galleries || {});
        }
      }
      return page;
    }).catch(function (error) {
      console.warn('頁面 CMS 載入失敗，已保留靜態內容：', pageSlug, error.message);
      return null;
    }).then(function (page) {
      if (timeoutId !== null) window.clearTimeout(timeoutId);
      return page;
    });
  }

  window.NTU_ECON_PAGE_READY = loadPageContent();
}());
