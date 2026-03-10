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
 *    - 格式：'images/活動名稱/年份/檔名.webp'
 *    - 每個活動最多放 5 張，超過只顯示前 5 張
 *    - 把路徑加入陣列後存檔，重新整理網頁即可看到效果
 *  ===================
 * 第一次新增照片

    # 1. 安裝 Pillow（只需一次）
    pip install Pillow

    # 2. 把原始照片（JPG/PNG）丟入對應資料夾
    #    例：images/econ-night/2024/

    # 3. 執行壓縮腳本
    python tools/optimize_images.py

    # 4. 確認 .webp 生成後，可刪除原始 .jpg
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

var GALLERY_DATA = {

  /* ──────────────────────────────────────────
     經濟之夜（依年份）
     路徑格式：'images/econ-night/年份/01.webp'
  ────────────────────────────────────────── */
  'econ-night': {

    '2024': [
       'images/econ-night/2024/01.webp',
       'images/econ-night/2024/02.webp',
       'images/econ-night/2024/03.webp',
      // 'images/econ-night/2024/04.webp',
      // 'images/econ-night/2024/05.webp',
    ],

    '2022': [
      // 'images/econ-night/2022/01.webp',
      // 'images/econ-night/2022/02.webp',
      // 'images/econ-night/2022/03.webp',
      // 'images/econ-night/2022/04.webp',
      // 'images/econ-night/2022/05.webp',
    ],

    '2017': [
      // 'images/econ-night/2017/01.webp',
    ],

    '2016': [
      // 'images/econ-night/2016/01.webp',
    ],

    '2015': [
      // 'images/econ-night/2015/01.webp',
    ],

    '2014': [
      // 'images/econ-night/2014/01.webp',
    ],

    '2013': [
      // 'images/econ-night/2013/01.webp',
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
  }

};
