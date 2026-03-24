/**
 * ============================================================
 *  活動照片資料 — gallery-data.js
 * ============================================================
 *
 *  【照片存放位置】
 *  所有照片放在專案根目錄的 images/ 資料夾內，結構如下：
 *
 *    images/
 *    ├── econ-night/
 *    │   ├── 2024/   ← 把 2024 年的照片放這裡
 *    │   ├── 2022/
 *    │   ├── 2017/
 *    │   └── ...（其他年份依此類推）
 *    ├── econ-week/
 *    │   └── 2023/
 *    ├── econ-camp/
 *    │   └── 2023/
 *    ├── orientation/
 *    └── other-activities/
 *        ├── mahjong/
 *        ├── picnic/
 *        ├── bbq/
 *        └── cocktail/
 *
 * ============================================================
 *  【如何新增照片 — 三步驟】
 *
 *  步驟 1：優化圖片（必做，否則網頁會很慢）
 *    - 執行專案根目錄的 tools/optimize_images.py 腳本批次轉換
 *    - 或使用線上工具：https://squoosh.app
 *    - 目標：WebP 格式、寬度不超過 1920px、單張不超過 300KB
 *
 *  步驟 2：放入對應資料夾
 *    - 命名建議：01.webp、02.webp、03.webp（方便排序）
 *    - 路徑範例：images/econ-night/2024/01.webp
 *
 *  步驟 3：在下方填入路徑（取消註解並修改）
 *    每個活動最多放 5 張，超過只顯示前 5 張。
 *    把路徑加入陣列後存檔，重新整理網頁即可看到效果。
 *
 *  ── 格式 A：純路徑字串（不標任何資訊）─────────────────
 *    'images/econ-night/2024/01.webp',
 *
 *  ── 格式 B：物件格式（可選填 caption 和/或 credit）──────
 *    {
 *      url:     'images/econ-night/2024/02.webp',
 *      caption: '合唱團表演',     ← 表演名稱，顯示在圖片【左上角】（可省略）
 *      credit:  '攝影：陳小明',   ← 攝影者，  顯示在圖片【左下角】（可省略）
 *    },
 *
 *  兩種格式可在同一陣列中混用 *  caption 和 credit 彼此獨立，可以只填其中一個，也可以都填，也可以都不填。
 *
 * ============================================================
 *  【新增年份】
 *  以經濟之夜為例，若要新增 2025 年：
 *    1. 在 images/econ-night/ 新增 2025/ 資料夾
 *    2. 把照片放進去（命名 01.webp, 02.webp ...）
 *    3. 在 02_review.html 的 dock-track 加一個 dock-node 按鈕
 *    4. 在 dock-pane-wrap 加一個 dock-pane（含 gallery div）
 *    5. 在下方 '2025': [...] 填入路徑
 * ============================================================
 */

/*
不要 credit（原本的格式，繼續沿用）：


'images/econ-night/2024/01.webp',
要標攝影者：


{ url: 'images/econ-night/2024/02.webp', credit: '攝影：陳小明' },
兩種混用（同一個活動裡，某幾張要標、某幾張不標）：


'2024': [
  { url: 'images/econ-night/2024/01.webp', credit: '攝影：陳小明' },
  'images/econ-night/2024/02.webp',          // 這張不標
  { url: 'images/econ-night/2024/03.webp', credit: '攝影：林小華' },
],
*/

var GALLERY_DATA = {

  /* ──────────────────────────────────────────
     經濟之夜（依年份）
     路徑格式：'images/econ-night/年份/01.webp'
  ────────────────────────────────────────── */
  /* 格式 A：純路徑，不加任何標註 */
  // 'images/econ-night/2024/01.webp',
  /* 格式 B：只標攝影者 */
  // { url: 'images/econ-night/2024/02.webp', credit: '攝影：陳小明' },
  /* 格式 B：只標表演名稱（左上角）*/
  // { url: 'images/econ-night/2024/03.webp', caption: '合唱團表演' },
  /* 格式 B：同時標表演名稱和攝影者 */
  // { url: 'images/econ-night/2024/04.webp', caption: '舞蹈表演', credit: '攝影：林小華' },
  // 'images/econ-night/2024/05.webp',
  'econ-night': {

    '2025': [
      { url: 'images/econ-night/2025/01.webp', caption: '大合照' },
      { url: 'images/econ-night/2025/02.webp', caption: '合照' },
      { url: 'images/econ-night/2025/03.webp', caption: '合照' },
      { url: 'images/econ-night/2025/04.webp', caption: '合照' },
      { url: 'images/econ-night/2025/05.webp', caption: '表演者獨照' },
      { url: 'images/econ-night/2025/06.webp', caption: '表演照' },
      { url: 'images/econ-night/2025/07.webp', caption: '合照' },
      { url: 'images/econ-night/2025/08.webp', caption: '表演照' },
      { url: 'images/econ-night/2025/09.webp', caption: '表演照' },
      { url: 'images/econ-night/2025/10.webp', caption: '抽獎' },
      { url: 'images/econ-night/2025/11.webp', caption: '抽獎' },
      { url: 'images/econ-night/2025/12.webp', caption: '合照' },
      { url: 'images/econ-night/2025/13.webp', caption: '合照' },
      { url: 'images/econ-night/2025/14.webp', caption: '表演照' },
      { url: 'images/econ-night/2025/15.webp', caption: '表演照' },
      { url: 'images/econ-night/2025/16.webp', caption: '表演照' },
      { url: 'images/econ-night/2025/17.webp', caption: '表演照' },
      { url: 'images/econ-night/2025/18.webp', caption: '表演照' },
      { url: 'images/econ-night/2025/19.webp', caption: '表演照' },
    ],

    '2024': [
      { url: 'images/econ-night/2024/01.webp', caption: '大合照', credit: '攝影：小柚子' },
      { url: 'images/econ-night/2024/02.webp', credit: '攝影：小柚子' },
      { url: 'images/econ-night/2024/03.webp', caption: 'Econ baby', credit: '攝影：小柚子' },
      { url: 'images/econ-night/2024/04.webp', caption: '菜頭想去海邊', credit: '攝影：小柚子' },
      { url: 'images/econ-night/2024/05.webp', caption: '戴光佑徵女友', credit: '攝影：小柚子' },
      { url: 'images/econ-night/2024/06.webp', caption: 'My name sayin', credit: '攝影：小柚子' },
      { url: 'images/econ-night/2024/07.webp', caption: '家有大鼻', credit: '攝影：小柚子' },
      { url: 'images/econ-night/2024/08.webp', caption: '家有大鼻', credit: '攝影：小柚子' },
      { url: 'images/econ-night/2024/09.webp', caption: '一紅和他的小夥伴', credit: '攝影：小柚子' },
      { url: 'images/econ-night/2024/10.webp', caption: 'To the X', credit: '攝影：小柚子' },
      { url: 'images/econ-night/2024/11.webp', caption: '街舞', credit: '攝影：小柚子' },
      { url: 'images/econ-night/2024/12.webp', caption: '我更聰明寶貝', credit: '攝影：小柚子' },
    ],

    '2022': [
      { url: 'images/econ-night/2022/01.webp', caption: '劇1' },
      { url: 'images/econ-night/2022/02.webp', caption: 'Band-我想和你一起花錢' },
      { url: 'images/econ-night/2022/03.webp', caption: '女舞' },
      { url: 'images/econ-night/2022/04.webp', caption: '魔術' },
      { url: 'images/econ-night/2022/05.webp', caption: 'Band - Ryan\'s Party' },
      { url: 'images/econ-night/2022/06.webp', caption: '經吉檸檬' },
      { url: 'images/econ-night/2022/07.webp', caption: '唱跳' },
      { url: 'images/econ-night/2022/08.webp', caption: '男舞' },
      { url: 'images/econ-night/2022/09.webp', caption: 'Band-菜頭的白日夢' }
    ],

    '2017': [
      { url: 'images/econ-night/2017/01.webp', caption: '競技啦啦隊' },
      { url: 'images/econ-night/2017/02.webp', caption: '大一Band' },
      { url: 'images/econ-night/2017/03.webp', caption: '大二Band' },
      { url: 'images/econ-night/2017/04.webp', caption: '大一舞' },
      { url: 'images/econ-night/2017/05.webp', caption: '音樂劇' },
      { url: 'images/econ-night/2017/06.webp', caption: 'Acappella' },
      { url: 'images/econ-night/2017/07.webp', caption: '大四劇' },
      { url: 'images/econ-night/2017/08.webp', caption: '光舞' },
      { url: 'images/econ-night/2017/09.webp', caption: '跨屆女舞' },
      { url: 'images/econ-night/2017/10.webp', caption: '跨屆男舞' },
    ],

    '2016': [
      // 'images/econ-night/2016/01.webp',
    ],

    '2015': [
      { url: 'images/econ-night/2015/01.webp', caption: '大合照' },
      { url: 'images/econ-night/2015/02.webp', caption: '倒數一天' },
      { url: 'images/econ-night/2015/03.webp', caption: '倒數三天' },
      { url: 'images/econ-night/2015/04.webp', caption: '倒數四天' },
      { url: 'images/econ-night/2015/05.webp', caption: '倒數六天' },
      { url: 'images/econ-night/2015/06.webp', caption: '倒數十天' },
      { url: 'images/econ-night/2015/07.webp', caption: '倒數十一天' },
      { url: 'images/econ-night/2015/08.webp', caption: '倒數十二天' },
      { url: 'images/econ-night/2015/09.webp', caption: '倒數十三天' },
      { url: 'images/econ-night/2015/10.webp', caption: '倒數十四天' },
      { url: 'images/econ-night/2015/11.webp', caption: '倒數十五天' },
      { url: 'images/econ-night/2015/12.webp', caption: '倒數十六天' },
      // Ice Monster 活動冰品兌換卷抽獎：https://www.facebook.com/share/v/18Wfngomfi/
    ],

    '2014': [
      { url: 'images/econ-night/2014/01.webp', caption: '大合照' },
      { url: 'images/econ-night/2014/02.webp', caption: '倒數一天' },
      { url: 'images/econ-night/2014/03.webp', caption: '倒數五天' },
      { url: 'images/econ-night/2014/04.webp', caption: '倒數六天' },
      { url: 'images/econ-night/2014/05.webp', caption: '倒數九天' },
      { url: 'images/econ-night/2014/06.webp', caption: '倒數十天' },
      { url: 'images/econ-night/2014/07.webp', caption: '倒數十三天' },
      { url: 'images/econ-night/2014/08.webp', caption: '倒數十五天' },
      { url: 'images/econ-night/2014/09.webp', caption: '倒數十六天' },
      { url: 'images/econ-night/2014/10.webp', caption: '倒數十八天' },
      { url: 'images/econ-night/2014/11.webp', caption: '倒數十八天' },
      { url: 'images/econ-night/2014/12.webp', caption: '倒數二十天' }
    ],

    '2013': [
      { url: 'images/econ-night/2013/01.webp', caption: '大合照' },
      { url: 'images/econ-night/2013/02.webp', caption: '倒數33天' },
      { url: 'images/econ-night/2013/03.webp', caption: '倒數29天' },
      { url: 'images/econ-night/2013/04.webp', caption: '倒數28天' },
      { url: 'images/econ-night/2013/05.webp', caption: '倒數12天' },
      { url: 'images/econ-night/2013/06.webp', caption: '倒數6天' },
      { url: 'images/econ-night/2013/07.webp', caption: '倒數5天' },
      { url: 'images/econ-night/2013/08.webp', caption: '倒數3天' },
      { url: 'images/econ-night/2013/09.webp', caption: '倒數2天' },
      { url: 'images/econ-night/2013/10.webp', caption: '宣傳片' },
    ],

    '2012': [
      // 'images/econ-night/2012/01.webp',
    ]
  },

  /* ──────────────────────────────────────────
     經濟週（依年份）
     路徑格式：'images/econ-week/年份/01.webp'
  ────────────────────────────────────────── */
  'econ-week': {

    '2023': [
      // 'images/econ-week/2023/01.webp',
      // 'images/econ-week/2023/02.webp',
    ]
  },

  /* ──────────────────────────────────────────
     經濟營（依年份）
     路徑格式：'images/econ-camp/年份/01.webp'
  ────────────────────────────────────────── */
  'econ-camp': {

    '2023': [
      // 'images/econ-camp/2023/01.webp',
      // 'images/econ-camp/2023/02.webp',
    ]
  },

  /* ──────────────────────────────────────────
     迎新
     路徑格式：'images/orientation/01.webp'
  ────────────────────────────────────────── */
  'orientation': {

    'future': [
      // 'images/orientation/01.webp',
      // 'images/orientation/02.webp',
    ]
  },

  /* ──────────────────────────────────────────
     其他活動（對應四張 mini-card）
     路徑格式：'images/other-activities/活動key/01.webp'
  ────────────────────────────────────────── */
  'other-activities': {

    'mahjong': [   /* 麻將大賽 */
      // 'images/other-activities/mahjong/01.webp',
    ],

    'picnic': [    /* 系野餐 */
      // 'images/other-activities/picnic/01.webp',
    ],

    'bbq': [       /* 系烤 */
      // 'images/other-activities/bbq/01.webp',
    ],

    'cocktail': [  /* 系酒會 */
      // 'images/other-activities/cocktail/01.webp',
    ]
  },

  /* ──────────────────────────────────────────
     關於我們 — 年度亮點活動（01_about.html）
     路徑格式：'images/highlights/活動key/01.webp'
  ────────────────────────────────────────── */
  'highlights': {

    'econ-night': [    /* 經濟之夜 */
      'images/econ-night/2024/01.webp'
    ],

    'lecture': [       /* 職涯與學術講座 */
      // 'images/highlights/lecture/01.webp',
    ],

    'azalea': [        /* 杜鵑花節 */
      // 'images/highlights/azalea/01.webp',
    ],

    'econ-camp': [     /* 經濟營 */
      // 'images/econ-camp/2023/01.webp',
    ],

    'econ-week': [     /* 經濟週 */
      // 'images/econ-week/2023/01.webp',
    ],

    'orientation': [   /* 大迎新 */
      // 'images/orientation/01.webp',
    ],

    'camp': [          /* 宿營 */
      // 'images/highlights/camp/01.webp',
    ],
  }

};
