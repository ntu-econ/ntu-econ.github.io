/**
 * ============================================================
 *  BETA SITE DATA — site-data.js
 *  單一維護檔案，所有可編輯內容集中於此
 * ============================================================
 *
 *  包含以下資料：
 *    1. SITE_EVENTS   — 首頁互動日曆（月份/日期/活動名稱）
 *    2. ANNOUNCEMENTS — 最新公告列表
 *    3. SITE_LINKS    — 相關連結（Linktree 區塊）
 *    4. GALLERY_DATA  — 各活動照片路徑（附 caption / credit）
 *
 * ============================================================
 *  【1】互動日曆活動 SITE_EVENTS
 *
 *  格式：
 *    { month: 3, day: 15, title: '活動名稱', tag: '標籤', color: '#CBA16E'（可選） }
 *
 *  month  = 1–12（月）
 *  day    = 1–31（日）
 *  tag    可用：'活動' / '公告' / '招募' / '體育' / '學術'
 *  color  可選，預設用 tag 對應色
 *
 * ============================================================
 */

var SITE_EVENTS = [
  // ── 3 月 ──
  { month: 3,  day: 1,  title: '學期開始 & 系學會幹部招募',   tag: '招募' },
  { month: 3,  day: 6,  title: '幹部會議', tag: '公告' },
  { month: 3,  day: 15, title: '杜鵑花節報名開始',             tag: '學術' },
  { month: 3,  day: 29, title: '職涯講座 — 金融業校友分享',    tag: '學術' },
  // ── 4 月 ──
  { month: 4,  day: 5,  title: '杜鵑花節 Day 1',              tag: '活動' },
  { month: 4,  day: 6,  title: '杜鵑花節 Day 2',              tag: '活動' },
  { month: 4,  day: 20, title: '系野餐',                      tag: '活動' },
  // ── 5 月 ──
  { month: 5,  day: 10, title: '經濟之夜技術綵排',             tag: '活動' },
  { month: 5,  day: 15, title: '🎭 經濟之夜',                  tag: '活動' },
  { month: 5,  day: 25, title: '期中考',                       tag: '公告' },
  // ── 6 月 ──
  { month: 6,  day: 12, title: '學術講座 — 計量經濟學工作坊',  tag: '學術' },
  { month: 6,  day: 20, title: '期末歌唱派對',                 tag: '活動' },
  // ── 7 月 ──
  { month: 7,  day: 10, title: '⛺ 經濟營 Day 1',              tag: '活動' },
  { month: 7,  day: 11, title: '⛺ 經濟營 Day 2',              tag: '活動' },
  { month: 7,  day: 12, title: '⛺ 經濟營 Day 3',              tag: '活動' },
  // ── 8 月 ──
  { month: 8,  day: 20, title: '🏕️ 宿營 Day 1',               tag: '活動' },
  { month: 8,  day: 21, title: '🏕️ 宿營 Day 2',               tag: '活動' },
  // ── 9 月 ──
  { month: 9,  day: 5,  title: '大迎新 Day 1',                 tag: '活動' },
  { month: 9,  day: 6,  title: '大迎新 Day 2',                 tag: '活動' },
  { month: 9,  day: 20, title: '系烤',                         tag: '活動' },
  // ── 10 月 ──
  { month: 10, day: 5,  title: '北經盃報名截止',              tag: '體育' },
  { month: 10, day: 18, title: '🏐 北經盃',                    tag: '體育' },
  { month: 10, day: 26, title: '🛍️ 經濟週 Day 1',             tag: '活動' },
  { month: 10, day: 27, title: '🛍️ 經濟週 Day 2',             tag: '活動' },
  // ── 11 月 ──
  { month: 11, day: 8,  title: '大經盃報名截止',              tag: '體育' },
  { month: 11, day: 15, title: '🏀 大經盃',                    tag: '體育' },
  { month: 11, day: 28, title: '系酒會',                       tag: '活動' },
  // ── 12 月 ──
  { month: 12, day: 10, title: '期末歌唱派對',                 tag: '活動' },
  { month: 12, day: 25, title: '聖誕系烤',                     tag: '活動' },
];

/**
 * ============================================================
 *  【2】最新公告 ANNOUNCEMENTS
 *
 *  格式：
 *    { date: 'YYYY-MM-DD', title: '...', link: 'url' 或 null, tag: '...' }
 *
 *  ▼ 最新的放最前面 ▼
 * ============================================================
 */
var ANNOUNCEMENTS = [
  {
    date:  '2026-03-11',
    title: '114 學年度下學期第一次幹部會議公告',
    link:   null,
    tag:   '公告',
  },
  {
    date:  '2026-03-01',
    title: '經濟之夜 2026 報名開始！快來報名參加年度盛典',
    link:  'news/econ-night-2026.html',
    tag:   '活動',
  },
  {
    date:  '2026-02-15',
    title: '113 學年度下學期贊助說明會簡報公開',
    link:   null,
    tag:   '最新',
  },
];

/**
 * ============================================================
 *  【3】相關連結 SITE_LINKS
 *
 *  格式：
 *    { title: '...', url: 'https://...', icon: '📸' }
 *
 *  新增連結：在下方陣列加一個物件即可。
 * ============================================================
 */
var SITE_LINKS = [
  { title: '系學會 Instagram',        url: 'https://www.instagram.com/ntu_econ_official/', icon: '📸' },
  { title: '系學會 Facebook',          url: 'https://www.facebook.com/NTUECONSA',           icon: '📘' },
  { title: '臺大經濟系官網',            url: 'http://www.econ.ntu.edu.tw/',                  icon: '🌐' },
  { title: '台大財務處捐款（可抵稅）', url: 'https://giving.ntu.edu.tw/',                   icon: '💝' },
  { title: 'NTU Econ Night YouTube',  url: 'https://www.youtube.com/@ntuEconNight/videos',  icon: '▶️' },
];

/**
 * ============================================================
 *  【4】活動照片 GALLERY_DATA
 *
 *  結構：GALLERY_DATA[活動][年份/key] = [ 照片物件陣列 ]
 *
 *  照片物件格式：
 *    格式 A（純路徑）：'images/econ-night/2024/01.webp'
 *    格式 B（含資訊）：
 *      { url: 'images/...', caption: '表演名稱', credit: '攝影：XXX' }
 *    caption 和 credit 均可省略。
 *
 *  照片存放：
 *    images/
 *    ├── econ-night/2024/  01.webp, 02.webp …
 *    ├── econ-week/2023/
 *    ├── econ-camp/2023/
 *    ├── orientation/
 *    └── other-activities/bbq/ picnic/ cocktail/ mahjong/
 *
 *  目標：WebP 格式、寬度 ≤ 1920px、單張 ≤ 300KB
 * ============================================================
 */
var GALLERY_DATA = {

  /* ── 經濟之夜 ── */
  'econ-night': {
    '2024': [
      { url: 'images/econ-night/2024/01.webp', caption: '大合照',          credit: '攝影：小柚子' },
      { url: 'images/econ-night/2024/02.webp',                             credit: '攝影：小柚子' },
      { url: 'images/econ-night/2024/03.webp', caption: 'Econ baby',       credit: '攝影：小柚子' },
      { url: 'images/econ-night/2024/04.webp', caption: '菜頭想去海邊',    credit: '攝影：小柚子' },
      { url: 'images/econ-night/2024/05.webp', caption: '戴光佑徵女友',    credit: '攝影：小柚子' },
      { url: 'images/econ-night/2024/06.webp', caption: 'My name sayin',  credit: '攝影：小柚子' },
      { url: 'images/econ-night/2024/07.webp', caption: '家有大鼻',        credit: '攝影：小柚子' },
      { url: 'images/econ-night/2024/08.webp', caption: '家有大鼻',        credit: '攝影：小柚子' },
      { url: 'images/econ-night/2024/09.webp', caption: '一紅和他的小夥伴', credit: '攝影：小柚子' },
      { url: 'images/econ-night/2024/10.webp', caption: 'To the X',        credit: '攝影：小柚子' },
      { url: 'images/econ-night/2024/11.webp', caption: '街舞',             credit: '攝影：小柚子' },
      { url: 'images/econ-night/2024/12.webp', caption: '我更聰明寶貝',    credit: '攝影：小柚子' },
    ],
    '2022': [
      // { url: 'images/econ-night/2022/01.webp', credit: '攝影：XXX' },
    ],
    '2017': [],
    '2016': [],
    '2015': [],
    '2014': [],
    '2013': [],
    '2012': [],
  },

  /* ── 經濟週 ── */
  'econ-week': {
    '2023': [
      // 'images/econ-week/2023/01.webp',
    ],
  },

  /* ── 經濟營 ── */
  'econ-camp': {
    '2023': [
      // 'images/econ-camp/2023/01.webp',
    ],
  },

  /* ── 迎新 ── */
  'orientation': {
    'future': [
      // 'images/orientation/01.webp',
    ],
  },

  /* ── 其他活動 ── */
  'other-activities': {
    'bbq':      [],   /* 系烤 */
    'cocktail': [],   /* 系酒會 */
    'picnic':   [],   /* 系野餐 */
    'mahjong':  [],   /* 麻將大賽 */
  },
};
