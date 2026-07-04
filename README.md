# 國立臺灣大學經濟學系學生會官方網站

這個專案是國立臺灣大學經濟學系學生會的官方網站，主要內容包含系上公告、活動資訊、回顧頁面與常用外部連結。網站以靜態頁面為主，使用純 HTML、CSS、JavaScript，不使用前端框架。大多數內容直接寫在 HTML，少數共用資料集中放在 `assets/data/`。

網站的視覺基調以深藍、金色與白色為主，搭配少量動態效果與圖片區塊。內容沿用既有格式時，版面與風格會維持一致。

## 專案結構

```text
ntu-econ.github.io/
├── index.html               # 首頁
├── 01_intro.html            # 簡介頁
├── 01_about.html            # 關於我們
├── 02_review.html           # 活動回顧
├── 03_support.html          # 贊助支持
├── links.html               # 連結頁
├── news/                    # 新聞／活動頁面
├── assets/
│   ├── css/style.css        # 全站樣式
│   ├── js/main.js           # 共用功能與首頁資料渲染
│   └── data/
│       ├── announcements.js # 首頁公告資料
│       └── links.json       # 首頁相關連結資料
├── images/                  # 圖片資料夾
├── horizon.jpg              # 首頁大圖
├── images.jpeg              # logo圖示
└── README.md                # 專案說明文件
```


## 網站頁面

- `index.html`：首頁，含公告與相關連結。
- `01_intro.html`：簡介頁。
- `01_about.html`：關於我們頁面。
- `02_review.html`：活動回顧頁。
- `03_support.html`：贊助支持頁面。
- `links.html`：連結頁，內容需和 `assets/data/links.json` 一起確認。
- `news/`：個別新聞或活動頁面。

頁面內容都直接寫在對應 HTML 檔中。修改哪一頁直接改對應的檔案。

## 共用資料

### 首頁公告

首頁公告由 `assets/data/announcements.js` 控制。新增公告時放在最上面。

資料格式：

```js
{
  date: '2026-03-15',
  title: '這是一則公告標題',
  link: 'https://...',
  tag: '公告',
  highlight: true,
}
```

欄位：

- `date`：日期，格式 `YYYY-MM-DD`
- `title`：標題
- `link`：連結，沒有就填 `null`
- `tag`：`公告`、`活動`、`最新`、`招募`
- `highlight`：是否顯示成醒目公告

顯示邏輯在 `assets/js/main.js`，通常只需要改 `announcements.js`。

### 首頁相關連結

首頁卡片連結由 `assets/data/links.json` 控制。`links.html` 也有一份連結內容，兩邊要一起確認。

格式：

```json
{
  "title": "系學會 Instagram",
  "url": "https://www.instagram.com/ntueconsa/",
  "icon": "instagram"
}
```

`icon` 目前支援 `instagram`、`facebook`、`globe`、`youtube`、`line`。新增 icon 時要同步改 `assets/js/main.js`。

## 圖片管理

圖片放在 `images/`，通常按活動、年份或主題分資料夾。檔名和路徑盡量一眼看得懂。

- 檔名盡量用小寫英文，避免空格與特殊符號。
- 同一活動若有多張照片，可用 `01`、`02`、`03` 之類的序號排序。
- HTML 中直接用相對路徑引用，例如 `images/econ-night/2025/opening.jpg`。
- 圖片太大時可以先壓縮，避免載入過慢。

範例：

```html
<img src="images/econ-night/2025/opening.jpg" alt="經濟之夜開場照">
```

## 樣式與功能

- `assets/css/style.css`：全站外觀，包含顏色、字體、按鈕與版面間距
- `assets/js/main.js`：Header 捲動效果、顯示動畫、首頁公告與相關連結渲染

## 新增或更新內容

- 公告：改 `assets/data/announcements.js`
- 首頁連結：改 `assets/data/links.json`
- 連結頁：改 `links.html`，並同步確認 `assets/data/links.json`
- 外觀：改 `assets/css/style.css`
- 首頁互動或共用渲染：改 `assets/js/main.js`
- 單一頁文字或圖片：改對應 HTML 檔

## 維護流程

這個網站沒有額外的建置流程，屬於靜態網站。改文字或圖片時，通常直接預覽 HTML 即可。大概的檢查項目：

- 首頁是否正常載入公告與連結。
- 圖片路徑是否正確。
- 新增連結是否能正常開啟。
- 手機版版面是否還能正常顯示。

### 發布流程

修改完成後，通常依下列流程提交：

```bash
git status
git add .
git commit -m "更新網站內容"
git push origin main
```

---

© 2026 國立臺灣大學經濟學系學生會 | All Rights Reserved.