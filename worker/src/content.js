import { publicRecord, toBoolean, toInteger } from './util.js';

function withinWindow(row, at = new Date()) {
  const now = at instanceof Date ? at : new Date();
  if (!toBoolean(row.published)) return false;
  const iso = now.toISOString();
  const day = iso.slice(0, 10);
  if (row.publishFrom) {
    const current = row.publishFrom.length === 10 ? day : iso;
    if (current < row.publishFrom) return false;
  }
  if (row.publishUntil) {
    const current = row.publishUntil.length === 10 ? day : iso;
    if (current > row.publishUntil) return false;
  }
  return true;
}

function byOrderThenDate(left, right) {
  const order = toInteger(left.order) - toInteger(right.order);
  if (order) return order;
  return String(right.date || right.publishFrom || '').localeCompare(String(left.date || left.publishFrom || ''));
}

function byPinnedOrderThenDate(left, right) {
  const leftPinned = toBoolean(left.highlight ?? left.pinned);
  const rightPinned = toBoolean(right.highlight ?? right.pinned);
  if (leftPinned !== rightPinned) return rightPinned ? 1 : -1;
  return byOrderThenDate(left, right);
}

export function announcementRecord(row) {
  return publicRecord(row, ['highlight', 'published'], ['order']);
}

export function linkRecord(row) {
  return publicRecord(row, ['showOnHome', 'published'], ['order']);
}

export function memberContentRecord(row) {
  return publicRecord(row, ['published'], ['order']);
}

function parseObject(value) {
  if (value && typeof value === 'object' && !Array.isArray(value)) return value;
  try {
    const parsed = JSON.parse(String(value || '{}'));
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
  } catch (_) {
    return {};
  }
}

function parseArray(value) {
  if (Array.isArray(value)) return value;
  try {
    const parsed = JSON.parse(String(value || '[]'));
    return Array.isArray(parsed) ? parsed : [];
  } catch (_) {
    return [];
  }
}

export function pageContentRecord(row) {
  const record = publicRecord(row, ['published']);
  record.fields = parseObject(record.fields);
  record.galleries = parseObject(record.galleries);
  record.blocks = parseArray(record.blocks);
  return record;
}

export async function getPublicHome(sheets) {
  const initialized = toBoolean(await sheets.getSetting('cms_initialized', 'false'));
  if (!initialized) return { initialized: false, announcements: [], links: [] };
  const [announcements, links] = await Promise.all([
    sheets.read('Announcements'),
    sheets.read('Links'),
  ]);
  return {
    initialized: true,
    announcements: announcements.filter(withinWindow).sort(byPinnedOrderThenDate).map(announcementRecord),
    links: links
      .filter((row) => withinWindow(row) && toBoolean(row.showOnHome))
      .sort(byOrderThenDate)
      .map(linkRecord),
  };
}

export async function getPublicLinks(sheets) {
  const initialized = toBoolean(await sheets.getSetting('cms_initialized', 'false'));
  if (!initialized) return { initialized: false, links: [] };
  const links = await sheets.read('Links');
  return {
    initialized: true,
    links: links.filter(withinWindow).sort(byOrderThenDate).map(linkRecord),
  };
}

export async function getMemberContent(sheets) {
  const rows = await sheets.read('MemberContent');
  return rows.filter(withinWindow).sort(byOrderThenDate).map(memberContentRecord);
}

export async function getPublicPage(sheets, slug) {
  const rows = await sheets.read('PageContent');
  const row = rows.find((item) => String(item.slug || '') === slug && toBoolean(item.published));
  return { initialized: true, page: row ? pageContentRecord(row) : null };
}
