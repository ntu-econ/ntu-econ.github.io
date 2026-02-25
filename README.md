# 國立臺灣大學經濟學系學生會 (NTU ECON SA) 官方網站

歡迎來到臺大經濟系學生會官方網站專案！本網站旨在提供系上同學活動資訊、學術資源以及系學會的最新動態。

本專案採用純 HTML/CSS/JavaScript 開發，不依賴複雜的框架，並採用「實驗室風格」的設計語言，強調去 AI 化的獨特視覺體驗。

## 📂 專案結構

```text
ericccclin.github.io/
├── index.html          # 首頁 (包含最新公告與相關連結)
├── 01_about.html       # 關於我們 (組織架構、核心任務)
├── 02_review.html      # 活動回顧 (歷年活動時間軸)
├── 03_support.html     # 贊助支持 (捐款方式、常見問題)
├── README.md           # 專案說明文件
├── images.jpeg         # 網站 Logo
├── horizon.jpg         # 首頁 Banner 圖片
└── assets/             # 靜態資源目錄
    ├── css/
    │   └── style.css   # 全站共用樣式表 (包含變數、RWD 設定)
    ├── js/
    │   └── main.js     # 全站共用腳本 (包含動畫、Header 特效、資料載入)
    └── data/
        └── links.json  # 首頁「相關連結」的資料檔
```

## 🛠 如何修改網站內容

### 1. 修改首頁「相關連結」 (Linktree)

首頁下方的連結區塊是透過讀取 JSON 檔案動態生成的，您不需要修改 HTML 程式碼。

1.  開啟 `assets/data/links.json` 檔案。
2.  依照以下格式新增或修改物件：
    ```json
    {
        "title": "顯示的按鈕文字",
        "url": "https://您的連結網址.com",
        "icon": "icon-name" (目前尚未實裝圖示功能，可忽略)
    }
    ```
3.  儲存檔案即可。

### 2. 修改文字內容 (公告、活動介紹)

所有頁面的文字內容都直接寫在 HTML 檔案中。

*   **首頁公告**：編輯 `index.html` 中的 `<section>` 區塊。
*   **關於我們**：編輯 `01_about.html`。
*   **活動回顧**：編輯 `02_review.html`。若要新增活動，請複製現有的 `<div class="step-item">...</div>` 結構並修改內容。
*   **贊助資訊**：編輯 `03_support.html`。

### 3. 更換圖片

*   **Logo**：替換根目錄下的 `images.jpeg` (請注意檔名大小寫必須完全一致)。
*   **首頁 Banner**：替換根目錄下的 `horizon.jpg`。
*   **活動圖片**：
    1.  將圖片上傳至網路圖床 (如 Imgur) 或放入專案資料夾。
    2.  在 HTML 中找到 `<img src="...">` 標籤，修改 `src` 屬性為新的圖片網址。

### 4. 修改樣式 (顏色、字體)

全站的視覺風格由 `assets/css/style.css` 統一管理。

*   **修改品牌顏色**：找到檔案開頭的 `:root` 區塊，修改 `--navy-900` (深藍) 或 `--gold-500` (金色) 等變數。
*   **修改字體**：搜尋 `font-family` 進行修改。目前標題使用 `Noto Sans TC` (黑體)，內文使用 `PMingLiU` (新細明體)。

## 🚀 如何發布更新

本網站託管於 GitHub Pages，任何推送到 `main` (或 `master`) 分支的更動都會自動部署。

1.  **確認更動**：
    ```bash
    git status
    ```

2.  **加入更動檔案**：
    ```bash
    git add .
    ```

3.  **提交更動 (Commit)**：
    ```bash
    git commit -m "更新網站內容：新增相關連結"
    ```

4.  **推送到 GitHub**：
    ```bash
    git push origin main
    ```

等待約 1-3 分鐘後，重新整理您的網站網址即可看到更新。

## ⚠️ 注意事項

1.  **檔案名稱大小寫**：GitHub 的伺服器 (Linux) 是區分大小寫的。`Image.jpg` 和 `image.jpg` 是不同的檔案。請務必確保程式碼中的檔名與實際檔名大小寫完全一致，建議一律使用**小寫**。
2.  **快取問題**：如果您更新了 CSS 或 JS 但網頁沒有變化，請嘗試**強制重新整理** (Windows: `Ctrl + F5`, Mac: `Cmd + Shift + R`)。

## 🤝 貢獻者

*   **開發者**：[您的名字/團隊]
*   **維護者**：臺大經濟系學生會

---

© 2026 國立臺灣大學經濟學系學生會 | All Rights Reserved.