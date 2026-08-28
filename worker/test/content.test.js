import assert from 'node:assert/strict';
import test from 'node:test';
import { getMemberContent, getPublicHome, getPublicLinks, getPublicPage } from '../src/content.js';

function fakeSheets() {
  const records = {
    Announcements: [{ id: 'a1', title: '公告', date: '2026-08-25', published: 'true', order: '0' }],
    Links: [{ id: 'l1', title: '連結', url: 'https://example.test', published: 'true', showOnHome: 'true', order: '0' }],
    MemberContent: [{ id: 'm1', title: '會員內容', body: '內容', published: 'true', order: '0' }],
    PageContent: [{
      id: 'page-about', slug: 'about', fields: '{"heroTitle":"關於新版"}', galleries: '{}',
      blocks: '[{"id":"hero-1","type":"hero","title":"自由版面"}]', published: 'true',
    }],
  };
  return {
    async getSetting() { return 'true'; },
    async read(name) { return records[name] || []; },
  };
}

test('non-empty published collections can be filtered and rendered', async () => {
  const sheets = fakeSheets();
  const home = await getPublicHome(sheets);
  const links = await getPublicLinks(sheets);
  const memberContent = await getMemberContent(sheets);
  const page = await getPublicPage(sheets, 'about');

  assert.equal(home.initialized, true);
  assert.equal(home.announcements.length, 1);
  assert.equal(home.links.length, 1);
  assert.equal(links.links.length, 1);
  assert.equal(memberContent.length, 1);
  assert.equal(page.page.fields.heroTitle, '關於新版');
  assert.equal(page.page.blocks[0].type, 'hero');
  assert.equal(page.page.blocks[0].title, '自由版面');
});

test('pinned announcements always appear before regular announcements', async () => {
  const sheets = fakeSheets();
  sheets.read = async (name) => {
    if (name !== 'Announcements') return [];
    return [
      { id: 'regular', title: '一般公告', date: '2026-08-25', published: 'true', highlight: 'false', order: '-100' },
      { id: 'pinned', title: '置頂公告', date: '2026-01-01', published: 'true', highlight: 'true', order: '100' },
    ];
  };

  const home = await getPublicHome(sheets);
  assert.deepEqual(home.announcements.map((item) => item.id), ['pinned', 'regular']);
});
