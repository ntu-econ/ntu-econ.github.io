(function () {
  'use strict';

  var localHosts = ['localhost', '127.0.0.1', '::1', '[::1]'];
  var isLocal = window.location.protocol === 'file:' ||
    localHosts.indexOf(window.location.hostname) !== -1;

  /*
   * 部署 Worker 後，只需要替換下方 production URL。
   * 公開站會讀取 /api/public/home 與 /api/public/links。
   * `.invalid` 是保留網域，在尚未設定正式網址時不會誤連到真實服務。
   */
  var environment = isLocal ? {
    apiBaseUrl: 'http://localhost:8787',
    portalUrl: 'http://localhost:8787/member/'
  } : {
    apiBaseUrl: 'https://ntu-econ-portal.ntu-econ-portal.workers.dev',
    portalUrl: 'https://ntu-econ-portal.ntu-econ-portal.workers.dev/member/'
  };

  window.NTU_ECON_SITE_CONFIG = Object.freeze({
    apiBaseUrl: environment.apiBaseUrl,
    publicApiBaseUrl: environment.apiBaseUrl + '/api/public',
    portalUrl: environment.portalUrl,
    // Google Sheets 在本機 Worker 冷啟動時可能需要數秒，避免過早取消請求後
    // 誤以為 CMS 沒有公告而退回靜態資料。
    publicApiTimeoutMs: 30000
  });
}());
