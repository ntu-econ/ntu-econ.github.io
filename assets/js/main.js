document.addEventListener('DOMContentLoaded', () => {

  /* ─────────────────────────────────────────────
     Header 縮放效果
  ───────────────────────────────────────────── */
  const header = document.getElementById('main-header') || document.querySelector('header');
  if (header) {
    window.addEventListener('scroll', () => {
      header.classList.toggle('scrolled', window.scrollY > 50);
    });
  }

  /* ─────────────────────────────────────────────
     捲動顯現動畫 (Reveal)
  ───────────────────────────────────────────── */
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08 });
  document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

  /* ─────────────────────────────────────────────
     最新公告列表
     資料來源：assets/data/announcements.js（ANNOUNCEMENTS 陣列）
     ★ 維護：直接編輯 announcements.js，不需動這裡
  ───────────────────────────────────────────── */
  const newsList = document.getElementById('news-list');
  if (newsList && typeof ANNOUNCEMENTS !== 'undefined') {
    if (!ANNOUNCEMENTS.length) {
      newsList.innerHTML = '<p class="news-empty">目前尚無公告。</p>';
    } else {
      ANNOUNCEMENTS.forEach(item => {
        const row = document.createElement(item.link ? 'a' : 'div');
        row.className = 'news-row' + (item.highlight ? ' news-highlight' : '');
        if (item.link) { row.href = item.link; row.target = '_blank'; row.rel = 'noopener'; }

        /* 標籤顏色對應：可在此擴充 */
        const tagColors = {
          '公告': 'tag-announce',
          '活動': 'tag-event',
          '最新': 'tag-new',
          '招募': 'tag-recruit',
        };
        const tagClass = tagColors[item.tag] || 'tag-announce';

        row.innerHTML = `
          <span class="news-date">${item.date}</span>
          <span class="news-tag ${tagClass}">${item.tag}</span>
          <span class="news-title">${item.title}</span>
          ${item.link ? '<span class="news-arrow">→</span>' : ''}
        `;
        newsList.appendChild(row);
      });
    }
  }

  /* ─────────────────────────────────────────────
     相關連結（有框框卡片）
     資料來源：assets/data/links.json
     ★ 維護：編輯 links.json 即可，格式：
       { "title": "顯示文字", "url": "https://...", "icon": "instagram" }
       icon 支援：instagram / facebook / globe / youtube / line
  ───────────────────────────────────────────── */
  const linktreeContainer = document.getElementById('linktree-container');
  if (linktreeContainer) {
    fetch('assets/data/links.json')
      .then(r => r.json())
      .then(links => {
        links.forEach(link => {
          const a = document.createElement('a');
          a.href       = link.url;
          a.className  = 'link-card';
          a.target     = '_blank';
          a.rel        = 'noopener noreferrer';
          a.innerHTML  = `
            <span class="link-card-icon">${getIcon(link.icon)}</span>
            <span class="link-card-title">${link.title}</span>
            <span class="link-card-arrow">→</span>
          `;
          linktreeContainer.appendChild(a);
        });
      })
      .catch(err => console.error('links.json 載入失敗：', err));
  }
});

/* ─────────────────────────────────────────────
   SVG Icon 輔助函式
   ★ 若要新增 icon，在此加入對應的 SVG 路徑
───────────────────────────────────────────── */
function getIcon(name) {
  const icons = {
    instagram: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/></svg>`,
    facebook:  `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>`,
    globe:     `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>`,
    youtube:   `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.96C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.96-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58zM9.75 15.02V8.98L15.5 12l-5.75 3.02z"/></svg>`,
    line:      `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.627.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63.349 0 .631.285.631.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.281.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314"/></svg>`,
  };
  return icons[name] || icons.globe;
}
