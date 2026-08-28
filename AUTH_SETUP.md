# 登入與部署設定

本文件說明如何為經濟系學會網站設定 Google Identity Services、Cloudflare Worker portal、Google Sheets 與 staging 環境。公開網站仍由 GitHub Pages 提供；登入、會員頁、管理後台與私有 API 必須一起部署在同一個 Worker origin，避免跨站登入 cookie。

## 1. 需要先準備的資料

部署前由網站維護者確認：

- 正式 portal 網址，例如 `https://portal.example.org`。若尚無自訂網域，可先用獨立的 `https://<worker-name>.<account>.workers.dev` 網址。
- staging portal 網址，例如 `https://staging-portal.example.org`。
- Google Cloud 專案，以及管理該專案 OAuth 設定的帳號。
- 正式與 staging 各一份 Google Sheet。
- 一個專供 Worker 使用的 Google Cloud service account。
- 初始 owner 的完整 `g.ntu.edu.tw` 帳號。正式 owner 不應以網域規則自動產生。

正式環境與 staging 應使用不同的 OAuth client ID、session secret、Worker 名稱及 Sheet，避免測試資料或憑證進入正式環境。

## 2. Google OAuth Web client

1. 在 Google Cloud Console 建立或選取專案。
2. 設定 OAuth consent screen／Google Auth Platform branding。
3. 建立類型為 **Web application** 的 OAuth client。
4. 在 **Authorized JavaScript origins** 加入 portal origin，只填 scheme 與 hostname，不含路徑：

   - `https://portal.example.org`
   - staging client 另填 `https://staging-portal.example.org`
   - 本機開發 client 可填實際使用的 `http://localhost:<port>`

5. 現行 portal 使用 GIS JavaScript callback，再同源 POST 到 Worker，因此 **Authorized redirect URIs 可留空**；`/api/auth/google` 不是 OAuth redirect URI。
6. 將 Web client ID 設為 Worker 的 `GOOGLE_CLIENT_ID`。Client ID 會出現在前端，並不是秘密；此 ID-token callback flow 不使用 OAuth client secret。
7. 前端以 `hd: "g.ntu.edu.tw"` 改善帳號選擇體驗，但 Worker 仍須驗證 ID token 中已簽章的 `hd` claim。

Google 官方設定說明：

- [取得 Google API client ID](https://developers.google.com/identity/gsi/web/guides/get-google-api-clientid)
- [GIS HTML API](https://developers.google.com/identity/gsi/web/reference/html-reference)
- [在後端驗證 Google ID token](https://developers.google.com/identity/gsi/web/guides/verify-google-id-token)

## 3. Worker 變數與 secrets

建議的非敏感環境變數：

| 名稱 | 正式環境範例 | 用途 |
| --- | --- | --- |
| `GOOGLE_CLIENT_ID` | `123...apps.googleusercontent.com` | Worker 驗證 `aud`，portal 初始化 GIS |
| `GOOGLE_HOSTED_DOMAIN` | `g.ntu.edu.tw` | Worker 驗證簽章保護的 `hd` claim |
| `PUBLIC_SITE_ORIGINS` | `https://ntu-econ.github.io` | 逗號分隔的公開唯讀 API 精確 CORS allowlist |
| `SESSION_TTL_SECONDS` | `3600` | signed session cookie 的最長有效期；實作限制在 5 分鐘到 8 小時 |
| `PUBLIC_CACHE_SECONDS` | `60` | 公開內容 API 的短期 cache 秒數 |
| `SPREADSHEET_ID` | Sheet ID | 指定該環境的資料來源 |
| `OWNER_ADMINS` | 初始 owner email | 僅用於首次 bootstrap；綁定後改用 `OWNER_SUBS` |
| `OWNER_SUBS` | Google sub | 正式 owner 的逗號分隔穩定識別碼 |

以下值屬於 secrets，不可放進 `wrangler.toml`、`wrangler.jsonc`、GitHub repository variables、前端 JavaScript 或任何 commit：

| 名稱 | 用途 |
| --- | --- |
| `SESSION_SECRET` | HMAC-SHA-256 簽署站內 session cookie，使用至少 32 bytes 的密碼學隨機值 |
| `GOOGLE_SA_KEY` | 完整 Google service-account credential JSON，包含 client email 與私鑰 |

以 Cloudflare dashboard 或 `wrangler secret put <NAME>` 設定正式 secrets。本機只可使用未提交的 `.dev.vars`；`.dev.vars*` 與 `.env*` 必須在 `.gitignore`。Cloudflare 官方說明：[Workers Secrets](https://developers.cloudflare.com/workers/configuration/secrets/)。

每次更換 `SESSION_SECRET` 都會使既有 cookie 失效。若未來要無中斷輪替，可新增 `SESSION_SECRET_PREVIOUS`，只用於短期驗證舊 cookie，不可再用它簽發新 cookie。

## 4. Google Sheets 與 service account

1. 在 Google Cloud 專案啟用 Google Sheets API。
2. 建立專用 service account。不要使用個人帳號的長期 access token。
3. 建立正式 Sheet，並只將該 Sheet 分享給 service account email；需要後台寫入時授予 Editor。
4. 建立 staging Sheet，填入測試會員及測試內容，避免複製真實完整名單。
5. 使用固定工作表名稱及第一列欄名；部署前由 Worker 的健康檢查確認必要工作表與欄位存在。
6. 所有使用者輸入以 Sheets API 的 `RAW` 模式寫入，避免以公式執行；輸出至 HTML 時仍須 escape／sanitize。
7. 禁止將會員名單或管理員工作表設為「知道連結的任何人可檢視」。

建議初始工作表：

- `Settings`
- `Announcements`
- `Links`
- `MemberContent`
- `PageContent`
- `Users`
- `Members`
- `Admins`
- `AuditLog`

欄位與角色判斷詳見 [ARCHITECTURE.md](./ARCHITECTURE.md)。

## 5. 登入端點與 cookie

建議 portal 使用下列端點：

- `GET /api/auth/config`：回傳公開的 client ID、hosted domain 與短效 CSRF token，並設定相符的 HttpOnly CSRF cookie。
- `POST /api/auth/google`：接收 GIS credential、驗證 CSRF 與 ID token、建立站內 cookie。
- `POST /api/auth/logout`：清除 cookie。
- `GET /api/me`：回傳目前使用者及即時角色，不回傳 credential 或 session signature。

Google credential 的 Worker 驗證至少包含：

- Google RS256 簽章與可信 `kid`。
- `alg` 僅允許 `RS256`。
- `aud` 精確等於該環境的 `GOOGLE_CLIENT_ID`。
- `iss` 僅允許 `https://accounts.google.com` 與 legacy `accounts.google.com`。
- `exp` 未過期，且 `iat` 不可顯著晚於 Worker 時間。
- `hd` 精確等於 `g.ntu.edu.tw`。
- `email_verified === true`。
- `sub` 存在；之後以 `sub` 作為穩定使用者主鍵。
- `azp` 存在時須符合此環境 client ID。

不能以 email suffix 取代 `hd`，也不能把 Google ID token 直接當成長期 session。

站內 cookie 建議格式：

```text
Set-Cookie: __Host-ntu_econ_session=<signed-value>; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=3600
```

要求：

- 使用 `__Host-` prefix 時不得設定 `Domain`，且必須使用 `Path=/` 與 `Secure`。
- cookie 內只放必要的版本、Google `sub`、`iat` 與 `exp`；簽章不是加密，不放 email、會員資料或 role。
- 每次受保護請求都從 Sheet 重新確認 member/admin 狀態，避免撤權後仍沿用 cookie 中的舊角色。
- 所有登入、會員、管理員與 `/api/me` response 設定 `Cache-Control: private, no-store`。
- logout 必須使用 POST，並將 cookie `Max-Age=0`。

## 6. CSRF、CORS 與安全 headers

現行 JavaScript callback flow 先由 `GET /api/auth/config` 設定 `__Host-ntu_econ_csrf` cookie，並把相同隨機 token 回給 portal。`POST /api/auth/google` 將 token 放在 JSON `csrfToken`；logout 與管理寫入則放在 `X-CSRF-Token` header。Worker 必須完整比對 cookie 與提交值，並檢查 same-origin `Origin`／`Sec-Fetch-Site`。缺少或不相等即拒絕。

Portal UI 與私有 API 同源，因此私有端點不應開 CORS。只有 GitHub Pages 需要讀取的公開 GET API 可回：

```text
Access-Control-Allow-Origin: https://ntu-econ.github.io
Vary: Origin
```

不得對帶 credential 的端點使用 `Access-Control-Allow-Origin: *`。

GIS 所需 CSP 至少需依實際使用方式允許：

- `script-src https://accounts.google.com/gsi/client`
- `connect-src https://accounts.google.com/gsi/`
- `frame-src https://accounts.google.com/gsi/`
- `style-src https://accounts.google.com/gsi/style`

同時設定 `X-Content-Type-Options: nosniff`、合適的 `Referrer-Policy` 與 frame policy。若 popup 在非 FedCM 環境無法完成，依 Google 指引檢查 `Cross-Origin-Opener-Policy`。

## 7. Staging 檢查

正式部署前至少確認：

- staging 使用自己的 OAuth client ID，正式 Worker 不接受 staging 的 `aud`。
- staging origin 精確登記且沒有 wildcard；現行 callback flow 不設定 redirect URI。
- staging 使用獨立 session secret 與 Sheet。
- 一個非 `g.ntu.edu.tw` Google 帳號被拒絕。
- `g.ntu.edu.tw` 非會員可登入，但無法進會員頁。
- active member 可進會員頁但不可執行 admin API。
- inactive member 與被撤權 admin 在下一次 request 立即失去權限。
- admin 可以更新測試內容，並在 `AuditLog` 留下紀錄。
- GitHub Pages 可讀公開資料，但無法跨站呼叫私有 API。
- credential、cookie、service-account key、完整會員名單未出現在 Worker logs 或前端 bundle。
- `node --test worker/test/*.test.js` 通過。

首次 owner 完成登入並確認 `sub` 後，將該值移到 `OWNER_SUBS`，再從 `OWNER_ADMINS` 移除 email。正式 owner 長期只靠 email 會受帳號改名或未來重新配發影響。

Cloudflare 建議在 Workers runtime 內測試 bindings 與 Web Crypto；若日後加入 Vitest，可再改用 Workers Vitest integration。官方說明：[Workers testing](https://developers.cloudflare.com/workers/testing/)。
