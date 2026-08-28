import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

function source(relativePath) {
  return readFileSync(new URL('../' + relativePath, import.meta.url), 'utf8');
}

function siteSource(relativePath) {
  return readFileSync(new URL('../../' + relativePath, import.meta.url), 'utf8');
}

test('member and admin roles share one Google login surface', () => {
  const memberHtml = source('public/member/index.html');
  const memberJs = source('public/assets/member.js');
  const adminHtml = source('public/admin/index.html');
  const adminJs = source('public/assets/admin.js');

  assert.match(memberHtml, /會員與管理員登入/);
  assert.match(memberHtml, /accounts\.google\.com\/gsi\/client/);
  assert.match(memberJs, /window\.location\.replace\('\/admin\/'\)/);
  assert.match(memberJs, /view'\) === 'member'/);

  assert.doesNotMatch(adminHtml, /accounts\.google\.com\/gsi\/client/);
  assert.doesNotMatch(adminHtml, /id="google-signin"/);
  assert.match(adminHtml, /href="\/member\/\?next=\/admin\/"/);
  assert.match(adminJs, /redirectToLogin/);
  assert.match(adminJs, /\/member\/\?next=/);
});

test('content editors expose safe live layout previews', () => {
  const adminHtml = source('public/admin/index.html');
  const adminJs = source('public/assets/admin.js');

  [
    'announcement-preview-stage',
    'link-preview-stage',
    'member-content-preview-stage',
    'page-preview-stage',
  ].forEach((id) => assert.match(adminHtml, new RegExp('id="' + id + '"')));

  assert.match(adminHtml, /data-preview-width="desktop"/);
  assert.match(adminHtml, /data-preview-width="mobile"/);
  assert.match(adminJs, /updateAnnouncementPreview/);
  assert.match(adminJs, /updateLinkPreview/);
  assert.match(adminJs, /updateMemberContentPreview/);
  assert.match(adminHtml, /data-panel="pages"/);
  ['hero', 'text', 'image', 'split', 'cards', 'button', 'divider'].forEach((type) => {
    assert.match(adminHtml, new RegExp('data-add-block="' + type + '"'));
  });
  assert.match(source('public/assets/page-editor.js'), /savePageContent/);
  assert.match(source('public/assets/page-editor.js'), /blocksFromForm/);
  assert.doesNotMatch(adminJs, /\.innerHTML\s*=/);
  assert.doesNotMatch(source('public/assets/page-editor.js'), /\.innerHTML\s*=/);
});

test('administrator permissions use explicit checkboxes', () => {
  const adminHtml = source('public/admin/index.html');
  const adminJs = source('public/assets/admin.js');
  ['content', 'members', 'audit', 'all'].forEach((permission) => {
    assert.match(adminHtml, new RegExp('id="admin-permission-' + permission + '"'));
  });
  assert.match(adminJs, /selectedAdminPermissions/);
  assert.doesNotMatch(adminHtml, /placeholder="all 或 content,members"/);
});

test('public editable pages keep a static fallback and use the safe page loader', () => {
  ['01_about.html', '02_review.html', '03_support.html'].forEach((page) => {
    const html = siteSource(page);
    assert.match(html, /data-cms-page=/);
    assert.match(html, /assets\/js\/page-content\.js/);
  });
  const pageLoader = siteSource('assets/js/page-content.js');
  assert.match(pageLoader, /NTU_ECON_PAGE_READY/);
  assert.match(pageLoader, /renderFreeBlocks/);
  assert.match(pageLoader, /cms-free-layout/);
  assert.match(pageLoader, /textContent/);
  assert.doesNotMatch(pageLoader, /\.innerHTML\s*=/);
});

test('portal recovers from a stale CSRF token once', () => {
  const portalJs = source('public/assets/portal.js');
  const sessionJs = source('src/session.js');

  assert.match(portalJs, /isInvalidCsrf/);
  assert.match(portalJs, /return adminCall\(action, args, options, true\)/);
  assert.match(portalJs, /return loginWithGoogle\(credential, true\)/);
  assert.match(sessionJs, /csrfTokenFromRequest/);
  assert.match(sessionJs, /issueCsrfToken\(maxAge = 7200, existingToken = ''\)/);
});
