# 國立臺灣大學經濟學系學生會官方網站

這個專案是國立臺灣大學經濟學系學生會的官方網站，主要內容包含系上公告、活動資訊、回顧頁面與常用外部連結。網站以靜態頁面為主，使用純 HTML、CSS、JavaScript，不使用前端框架。大多數內容直接寫在 HTML，少數共用資料集中放在 `assets/data/`。

## 登入、會員專區與內容後台

公開網站仍由 GitHub Pages 提供，原有頁面與樣式不需搬動。登入後的會員專區、管理後台與 API 則部署在同一個 Cloudflare Worker 網域：

```text
GitHub Pages 公開站
  ├─ 公告／連結公開 API ───────────┐
  └─ 會員登入連結                  │
                                   ▼
Cloudflare Worker portal（同源登入、會員頁、後台、API）
  ├─ Google Identity Services：驗證 g.ntu.edu.tw
  ├─ Members：另行判定系學會會員
  ├─ Admins／OWNER_SUBS：後台角色與權限
  └─ 私人 Google Sheet：內容、名單、角色與 AuditLog
```

網站不會接觸或保存 Google 密碼。Worker 會驗證 Google ID token 的簽章、client ID、issuer、期限、`email_verified` 與 `hd=g.ntu.edu.tw`；通過校方網域驗證後，仍須在 `Members` 名單內才能讀取會員內容。

會員與管理員共用 `/member/` 單一登入入口；登入後由 Worker 回傳的即時角色決定顯示會員專區或自動進入 `/admin/`。管理後台的公告、連結、公開頁面與會員內容表單均提供桌面／手機即時預覽，讓編輯者在儲存前確認公開狀態與大致版面。

新後台第一版可管理：

- 首頁公告與排程／置頂狀態
- 首頁及完整連結頁共用的相關連結
- 「關於我們」、「活動回顧」、「贊助與支持」的自由版面：橫幅、文字、圖片、圖文並排、卡片、按鈕與間距皆可新增及排序
- 會員限定內容
- 公告、連結、公開頁面與會員內容的即時版面預覽
- 會員名單與批次匯入
- 管理員權限與操作紀錄

完整架構請見 [`ARCHITECTURE.md`](ARCHITECTURE.md)，首次 OAuth、Sheet 與 Worker 設定請依 [`AUTH_SETUP.md`](AUTH_SETUP.md)。

## 專案結構

```text
ntu-econ.github.io/
├── index.html               # 首頁
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
├── worker/                  # 登入、會員專區、後台與 Cloudflare Worker API
├── ARCHITECTURE.md          # 權限、資料模型與安全邊界
├── AUTH_SETUP.md            # Google／Cloudflare／Sheet 部署設定
├── images/                  # 圖片資料夾
├── horizon.jpg              # 首頁大圖
├── images.jpeg              # logo圖示
└── README.md                # 專案說明文件
```


## 網站頁面

- `index.html`：首頁，含公告與相關連結。
- `01_about.html`：關於我們頁面。
- `02_review.html`：活動回顧頁。
- `03_support.html`：贊助支持頁面。
- `links.html`：連結頁，內容需和 `assets/data/links.json` 一起確認。
- `news/`：個別新聞或活動頁面。

公開頁保留 HTML 內建內容作為 fallback；沒有自由區塊時，後台仍可修改原模板欄位。加入自由區塊後，`assets/js/page-content.js` 會依儲存順序安全建立版面；文字一律以純文字插入，圖片及連結也會驗證 URL，不接受任意 HTML。

## 共用資料

### 首頁公告

CMS 尚未啟用時，首頁公告由 `assets/data/announcements.js` 作為 fallback。新增 fallback 公告時放在最上面。

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

CMS 尚未啟用時，首頁與完整連結頁會共用 `assets/data/links.json`，並補上程式內既有的分類／說明 metadata。

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

- 正式後台啟用後：由 Worker 的 `/admin/` 更新公告、連結、會員內容與名單。
- Worker 尚未設定或 CMS 尚未初始化時：首頁會自動改用 `assets/data/announcements.js` 與 `assets/data/links.json` 的靜態 fallback。
- 公開頁外觀：改 `assets/css/style.css` 或對應 HTML。
- 首頁互動或共用渲染：改 `assets/js/main.js`
- 單一頁文字或圖片：改對應 HTML 檔

## 維護流程

公開網站沒有額外建置流程；改文字或圖片時可直接預覽 HTML。Worker portal 另在 `worker/` 內驗證與部署：

```bash
cd worker
npm install
npm run validate
npm run dev
```

大概的檢查項目：

- 首頁是否正常載入公告與連結。
- 圖片路徑是否正確。
- 新增連結是否能正常開啟。
- 手機版版面是否還能正常顯示。
- 非 NTU、NTU 非會員、會員、管理員與撤權情境是否符合預期。

### 發布流程

修改完成後，通常依下列流程提交：

```bash
git status
git add .
git commit -m "更新網站內容"
git push origin main
```

GitHub Pages 與 Worker 是兩個發布步驟。Worker 應先部署 staging 並完成角色驗收，再部署 production；最後把 `assets/js/site-config.js` 的 `.invalid` placeholder 換成正式 Worker URL，才推送公開站。任何 service-account JSON、session secret 或會員名單都不可提交到 Git。

---

© 2026 國立臺灣大學經濟學系學生會 | All Rights Reserved.
