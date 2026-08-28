import {
  HttpError,
  cleanDate,
  cleanEmail,
  cleanText,
  cleanUrl,
  nowIso,
  publicRecord,
  toBoolean,
  toInteger,
} from './util.js';
import { announcementRecord, linkRecord, memberContentRecord, pageContentRecord } from './content.js';
import { INITIAL_ANNOUNCEMENTS, INITIAL_LINKS } from './seed.js';

const PERMISSIONS = new Set(['content', 'members', 'audit', 'all']);
const ANNOUNCEMENT_TAGS = new Set(['公告', '活動', '最新', '招募']);
const LINK_ICONS = new Set(['instagram', 'facebook', 'globe', 'youtube', 'line']);
const PAGE_SLUGS = new Set(['about', 'review', 'support']);
const PAGE_BLOCK_TYPES = new Set(['hero', 'text', 'image', 'split', 'cards', 'button', 'divider']);
const PAGE_BLOCK_TONES = new Set(['plain', 'card', 'navy', 'gold', 'soft']);
const PAGE_BLOCK_ALIGNS = new Set(['left', 'center']);
const PAGE_BLOCK_WIDTHS = new Set(['full', 'wide', 'narrow']);

function requireAdmin(identity) {
  if (!identity.admin) throw new HttpError(403, '此帳號沒有後台權限。', 'admin_required');
}

function can(identity, permission) {
  return identity.owner || identity.permissions.includes('all') || identity.permissions.includes(permission);
}

function requirePermission(identity, permission) {
  requireAdmin(identity);
  if (!can(identity, permission)) throw new HttpError(403, '您沒有此功能的操作權限。', 'permission_denied');
}

function requireOwner(identity) {
  if (!identity.owner) throw new HttpError(403, '只有系統擁有者可以執行此操作。', 'owner_required');
}

function argsObject(args) {
  return args && typeof args === 'object' && !Array.isArray(args) ? args : {};
}

function idFromArgs(args) {
  if (typeof args === 'string') return cleanText(args, { name: 'ID', max: 200, required: true });
  return cleanText(argsObject(args).id, { name: 'ID', max: 200, required: true });
}

function newId(prefix) {
  return `${prefix}-${crypto.randomUUID()}`;
}

function assertFresh(existing, submitted) {
  if (existing && submitted.updatedAt && submitted.updatedAt !== existing.updatedAt) {
    throw new HttpError(409, '這筆資料已被其他管理員更新，請重新載入後再修改。', 'edit_conflict');
  }
}

async function saveById(sheets, sheetName, record, submitted) {
  const existing = await sheets.findById(sheetName, record.id, { fresh: true });
  assertFresh(existing, submitted);
  if (existing) await sheets.update(sheetName, existing, record);
  else await sheets.append(sheetName, record);
  return record;
}

async function deleteById(sheets, sheetName, id) {
  const existing = await sheets.findById(sheetName, id, { fresh: true });
  if (!existing) throw new HttpError(404, '找不到要刪除的資料。', 'not_found');
  await sheets.deleteRow(sheetName, existing);
  return existing;
}

async function writeAudit(sheets, identity, action, target) {
  await sheets.append('AuditLog', {
    time: nowIso(),
    actor: identity.email,
    action,
    target: cleanText(target, { max: 500 }),
  });
}

function withUpdateFields(record, identity) {
  return { ...record, updatedAt: nowIso(), updatedBy: identity.email };
}

function normalizeAnnouncement(args, identity) {
  const input = argsObject(args);
  const tag = cleanText(input.tag || '公告', { name: '標籤', max: 20 });
  if (!ANNOUNCEMENT_TAGS.has(tag)) throw new HttpError(400, '公告標籤不在允許清單中。', 'invalid_tag');
  return withUpdateFields({
    id: cleanText(input.id, { name: 'ID', max: 200 }) || newId('announcement'),
    date: cleanDate(input.date, { name: '公告日期', required: true }),
    title: cleanText(input.title, { name: '公告標題', max: 200, required: true }),
    link: cleanUrl(input.link, { name: '公告連結', allowRelative: true }),
    body: cleanText(input.body, { name: '公告內容', max: 20000 }),
    tag,
    highlight: String(toBoolean(input.highlight)),
    published: String(toBoolean(input.published)),
    publishFrom: cleanDate(input.publishFrom, { name: '上架時間' }),
    publishUntil: cleanDate(input.publishUntil, { name: '下架時間' }),
    order: String(toInteger(input.order, { min: -9999, max: 9999 })),
  }, identity);
}

function normalizeLink(args, identity) {
  const input = argsObject(args);
  const icon = cleanText(input.icon || 'globe', { name: '圖示', max: 30 });
  if (!LINK_ICONS.has(icon)) throw new HttpError(400, '連結圖示不在允許清單中。', 'invalid_icon');
  return withUpdateFields({
    id: cleanText(input.id, { name: 'ID', max: 200 }) || newId('link'),
    group: cleanText(input.group || '其他', { name: '連結分類', max: 100, required: true }),
    title: cleanText(input.title, { name: '連結標題', max: 200, required: true }),
    description: cleanText(input.description ?? input.desc, { name: '連結說明', max: 500 }),
    url: cleanUrl(input.url, { name: '連結網址', required: true, allowRelative: true }),
    icon,
    order: String(toInteger(input.order, { min: -9999, max: 9999 })),
    showOnHome: String(toBoolean(input.showOnHome)),
    published: String(toBoolean(input.published)),
  }, identity);
}

function normalizeMemberContent(args, identity) {
  const input = argsObject(args);
  return withUpdateFields({
    id: cleanText(input.id, { name: 'ID', max: 200 }) || newId('member-content'),
    title: cleanText(input.title, { name: '標題', max: 200, required: true }),
    summary: cleanText(input.summary, { name: '摘要', max: 1000 }),
    body: cleanText(input.body, { name: '內容', max: 30000, required: true }),
    link: cleanUrl(input.link, { name: '延伸連結', allowRelative: false }),
    order: String(toInteger(input.order, { min: -9999, max: 9999 })),
    published: String(toBoolean(input.published)),
    publishFrom: cleanDate(input.publishFrom, { name: '上架時間' }),
    publishUntil: cleanDate(input.publishUntil, { name: '下架時間' }),
  }, identity);
}

function normalizePageFields(value) {
  const source = value && typeof value === 'object' && !Array.isArray(value) ? value : {};
  const entries = Object.entries(source);
  if (entries.length > 180) throw new HttpError(400, '頁面欄位數量過多。', 'invalid_page_content');
  const fields = {};
  for (const [rawKey, rawValue] of entries) {
    const key = cleanText(rawKey, { name: '頁面欄位鍵值', max: 100, required: true });
    if (!/^[a-zA-Z0-9._-]+$/.test(key)) throw new HttpError(400, '頁面欄位鍵值格式不正確。', 'invalid_page_content');
    fields[key] = cleanText(rawValue, { name: '頁面內容', max: 12000 });
  }
  if (JSON.stringify(fields).length > 48000) throw new HttpError(400, '頁面內容過大。', 'invalid_page_content');
  return fields;
}

function normalizePageGalleries(value) {
  const source = value && typeof value === 'object' && !Array.isArray(value) ? value : {};
  const galleries = {};
  let imageCount = 0;
  for (const [rawKey, rawItems] of Object.entries(source)) {
    const key = cleanText(rawKey, { name: '相簿鍵值', max: 100, required: true });
    if (!/^[a-zA-Z0-9._/-]+$/.test(key) || !Array.isArray(rawItems) || rawItems.length > 80) {
      throw new HttpError(400, '相簿資料格式不正確。', 'invalid_gallery_content');
    }
    galleries[key] = rawItems.map((item) => {
      const input = item && typeof item === 'object' && !Array.isArray(item) ? item : { url: item };
      imageCount += 1;
      return {
        url: cleanUrl(input.url, { name: '圖片網址', required: true, allowRelative: true }),
        caption: cleanText(input.caption, { name: '圖片說明', max: 500 }),
        credit: cleanText(input.credit, { name: '攝影資訊', max: 500 }),
      };
    });
  }
  if (imageCount > 250 || JSON.stringify(galleries).length > 48000) {
    throw new HttpError(400, '相簿圖片數量或內容過大。', 'invalid_gallery_content');
  }
  return galleries;
}

function pageBlockChoice(value, allowed, fallback) {
  const selected = String(value || '').trim();
  return allowed.has(selected) ? selected : fallback;
}

function normalizePageBlocks(value) {
  if (value == null || value === '') return [];
  if (!Array.isArray(value) || value.length > 40) {
    throw new HttpError(400, '自由版面區塊格式不正確。', 'invalid_page_blocks');
  }
  const ids = new Set();
  const blocks = value.map((rawBlock, index) => {
    const input = rawBlock && typeof rawBlock === 'object' && !Array.isArray(rawBlock) ? rawBlock : {};
    const type = cleanText(input.type, { name: '區塊類型', max: 30, required: true });
    if (!PAGE_BLOCK_TYPES.has(type)) throw new HttpError(400, '不支援此區塊類型。', 'invalid_page_block_type');
    let id = cleanText(input.id, { name: '區塊 ID', max: 100 }) || `block-${index + 1}`;
    if (!/^[a-zA-Z0-9_-]+$/.test(id) || ids.has(id)) id = `block-${index + 1}`;
    ids.add(id);
    const block = {
      id,
      type,
      tone: pageBlockChoice(input.tone, PAGE_BLOCK_TONES, type === 'hero' ? 'navy' : 'plain'),
      width: pageBlockChoice(input.width, PAGE_BLOCK_WIDTHS, 'wide'),
      align: pageBlockChoice(input.align, PAGE_BLOCK_ALIGNS, 'left'),
    };
    const text = (key, name, max = 1000) => { block[key] = cleanText(input[key], { name, max }); };
    const url = (key, name) => { block[key] = cleanUrl(input[key], { name, allowRelative: true }); };

    if (type === 'hero' || type === 'text' || type === 'split' || type === 'cards') {
      text('eyebrow', '英文小標', 120);
      text('title', '區塊標題', 300);
      text('body', '區塊內容', 12000);
    }
    if (type === 'hero' || type === 'image' || type === 'split') {
      url('imageUrl', '圖片網址');
      text('imageAlt', '圖片替代文字', 300);
    }
    if (type === 'image') {
      text('caption', '圖片說明', 1000);
      url('linkUrl', '圖片連結');
      block.aspect = pageBlockChoice(input.aspect, new Set(['auto', 'wide', 'landscape', 'square']), 'landscape');
    }
    if (type === 'text') {
      block.columns = pageBlockChoice(input.columns, new Set(['one', 'two']), 'one');
    }
    if (type === 'split') {
      block.imageSide = pageBlockChoice(input.imageSide, new Set(['left', 'right']), 'left');
      text('buttonLabel', '按鈕文字', 120);
      url('buttonUrl', '按鈕連結');
    }
    if (type === 'cards') {
      block.columns = pageBlockChoice(input.columns, new Set(['two', 'three', 'four']), 'three');
      const items = Array.isArray(input.items) ? input.items : [];
      if (items.length > 12) throw new HttpError(400, '單一卡片群組最多 12 張卡片。', 'invalid_page_blocks');
      block.items = items.map((rawItem) => {
        const item = rawItem && typeof rawItem === 'object' && !Array.isArray(rawItem) ? rawItem : {};
        return {
          title: cleanText(item.title, { name: '卡片標題', max: 300 }),
          body: cleanText(item.body, { name: '卡片內容', max: 3000 }),
          imageUrl: cleanUrl(item.imageUrl, { name: '卡片圖片', allowRelative: true }),
          imageAlt: cleanText(item.imageAlt, { name: '卡片圖片替代文字', max: 300 }),
          linkLabel: cleanText(item.linkLabel, { name: '卡片連結文字', max: 120 }),
          linkUrl: cleanUrl(item.linkUrl, { name: '卡片連結', allowRelative: true }),
        };
      });
    }
    if (type === 'button') {
      text('label', '按鈕文字', 120);
      url('url', '按鈕連結');
      block.variant = pageBlockChoice(input.variant, new Set(['primary', 'outline', 'text']), 'primary');
    }
    if (type === 'divider') {
      block.space = pageBlockChoice(input.space, new Set(['small', 'medium', 'large']), 'medium');
      block.showLine = toBoolean(input.showLine);
    }
    return block;
  });
  if (JSON.stringify(blocks).length > 48000) {
    throw new HttpError(400, '自由版面內容過大，請減少區塊或文字。', 'invalid_page_blocks');
  }
  return blocks;
}

function normalizePageContent(args, identity) {
  const input = argsObject(args);
  const slug = cleanText(input.slug, { name: '頁面', max: 40, required: true });
  if (!PAGE_SLUGS.has(slug)) throw new HttpError(400, '不支援此頁面。', 'invalid_page_slug');
  return withUpdateFields({
    id: cleanText(input.id, { name: 'ID', max: 200 }) || `page-${slug}`,
    slug,
    fields: JSON.stringify(normalizePageFields(input.fields)),
    galleries: JSON.stringify(normalizePageGalleries(input.galleries)),
    blocks: JSON.stringify(normalizePageBlocks(input.blocks)),
    published: String(input.published == null ? true : toBoolean(input.published)),
  }, identity);
}

function normalizeMember(args, identity, env, existing = null) {
  const input = argsObject(args);
  const active = input.status
    ? cleanText(input.status, { name: '會員狀態', max: 20 }).toLowerCase() === 'active'
    : (input.active == null ? true : toBoolean(input.active));
  return withUpdateFields({
    id: cleanText(input.id, { name: 'ID', max: 200 }) || existing?.id || newId('member'),
    sub: existing?.sub || cleanText(input.sub, { name: 'Google 使用者 ID', max: 255 }),
    email: cleanEmail(input.email, { domain: String(env.GOOGLE_HOSTED_DOMAIN || '').toLowerCase() }),
    name: cleanText(input.name, { name: '姓名', max: 200 }),
    studentId: cleanText(input.studentId, { name: '學號', max: 30 }),
    status: active ? 'active' : 'inactive',
    validUntil: cleanDate(input.validUntil ?? input.expiresAt, { name: '會員期限' }),
    notes: cleanText(input.notes ?? input.note, { name: '備註', max: 1000 }),
  }, identity);
}

function normalizeAdmin(args, identity, env, existing = null) {
  const input = argsObject(args);
  const rawPermissions = Array.isArray(input.permissions)
    ? input.permissions
    : String(input.permissions || 'content').split(',');
  const permissions = [...new Set(rawPermissions.map((item) => String(item).trim()).filter(Boolean))];
  if (!permissions.length || permissions.some((item) => !PERMISSIONS.has(item))) {
    throw new HttpError(400, '管理員權限設定不正確。', 'invalid_permissions');
  }
  return withUpdateFields({
    id: cleanText(input.id, { name: 'ID', max: 200 }) || existing?.id || newId('admin'),
    sub: existing?.sub || cleanText(input.sub, { name: 'Google 使用者 ID', max: 255 }),
    email: cleanEmail(input.email, { domain: String(env.GOOGLE_HOSTED_DOMAIN || '').toLowerCase() }),
    name: cleanText(input.name, { name: '姓名', max: 200 }),
    permissions: permissions.includes('all') ? 'all' : permissions.join(','),
    active: String(input.active == null ? true : toBoolean(input.active)),
  }, identity);
}

async function dashboard(_args, { sheets, identity }) {
  requireAdmin(identity);
  const [announcements, links, memberContent, pages, members, admins, initialized] = await Promise.all([
    sheets.read('Announcements'),
    sheets.read('Links'),
    sheets.read('MemberContent'),
    sheets.read('PageContent'),
    sheets.read('Members'),
    sheets.read('Admins'),
    sheets.getSetting('cms_initialized', 'false'),
  ]);
  const today = new Date().toISOString().slice(0, 10);
  const activeMembers = members.filter((row) => String(row.status || '').toLowerCase() === 'active'
    && (!row.validUntil || row.validUntil >= today));
  const activeAdmins = admins.filter((row) => toBoolean(row.active));
  return {
    initialized: toBoolean(initialized),
    counts: {
      announcements: announcements.length,
      links: links.length,
      memberContent: memberContent.length,
      pages: pages.length,
      members: activeMembers.length,
      admins: activeAdmins.length + (identity.owner ? 1 : 0),
    },
    profile: {
      email: identity.email,
      name: identity.name,
      owner: identity.owner,
      permissions: identity.permissions,
    },
  };
}

async function bootstrap(_args, { sheets, identity }) {
  requireOwner(identity);
  if (toBoolean(await sheets.getSetting('cms_initialized', 'false'))) {
    return { initialized: true, seeded: { announcements: 0, links: 0 } };
  }
  const timestamp = nowIso();
  const decorate = (record) => ({ ...record, updatedAt: timestamp, updatedBy: identity.email });
  const [existingAnnouncements, existingLinks] = await Promise.all([
    sheets.read('Announcements', { fresh: true }),
    sheets.read('Links', { fresh: true }),
  ]);
  const announcements = existingAnnouncements.length ? [] : INITIAL_ANNOUNCEMENTS.map(decorate);
  const links = existingLinks.length ? [] : INITIAL_LINKS.map(decorate);
  await sheets.appendMany('Announcements', announcements);
  await sheets.appendMany('Links', links);
  await sheets.saveSetting('cms_initialized', 'true', identity.email);
  await writeAudit(sheets, identity, 'bootstrap', `announcements=${announcements.length}, links=${links.length}`);
  return { initialized: true, seeded: { announcements: announcements.length, links: links.length } };
}

async function listAnnouncements(_args, { sheets, identity }) {
  requirePermission(identity, 'content');
  return (await sheets.read('Announcements', { fresh: true })).map(announcementRecord);
}

async function saveAnnouncement(args, context) {
  requirePermission(context.identity, 'content');
  const record = normalizeAnnouncement(args, context.identity);
  await saveById(context.sheets, 'Announcements', record, argsObject(args));
  await writeAudit(context.sheets, context.identity, 'saveAnnouncement', `${record.id}: ${record.title}`);
  return announcementRecord(record);
}

async function deleteAnnouncement(args, context) {
  requirePermission(context.identity, 'content');
  const existing = await deleteById(context.sheets, 'Announcements', idFromArgs(args));
  await writeAudit(context.sheets, context.identity, 'deleteAnnouncement', `${existing.id}: ${existing.title}`);
  return { id: existing.id };
}

async function listLinks(_args, { sheets, identity }) {
  requirePermission(identity, 'content');
  return (await sheets.read('Links', { fresh: true })).map(linkRecord);
}

async function saveLink(args, context) {
  requirePermission(context.identity, 'content');
  const record = normalizeLink(args, context.identity);
  await saveById(context.sheets, 'Links', record, argsObject(args));
  await writeAudit(context.sheets, context.identity, 'saveLink', `${record.id}: ${record.title}`);
  return linkRecord(record);
}

async function deleteLink(args, context) {
  requirePermission(context.identity, 'content');
  const existing = await deleteById(context.sheets, 'Links', idFromArgs(args));
  await writeAudit(context.sheets, context.identity, 'deleteLink', `${existing.id}: ${existing.title}`);
  return { id: existing.id };
}

async function listMemberContent(_args, { sheets, identity }) {
  requirePermission(identity, 'content');
  return (await sheets.read('MemberContent', { fresh: true })).map(memberContentRecord);
}

async function saveMemberContent(args, context) {
  requirePermission(context.identity, 'content');
  const record = normalizeMemberContent(args, context.identity);
  await saveById(context.sheets, 'MemberContent', record, argsObject(args));
  await writeAudit(context.sheets, context.identity, 'saveMemberContent', `${record.id}: ${record.title}`);
  return memberContentRecord(record);
}

async function deleteMemberContent(args, context) {
  requirePermission(context.identity, 'content');
  const existing = await deleteById(context.sheets, 'MemberContent', idFromArgs(args));
  await writeAudit(context.sheets, context.identity, 'deleteMemberContent', `${existing.id}: ${existing.title}`);
  return { id: existing.id };
}

async function listPageContent(_args, { sheets, identity }) {
  requirePermission(identity, 'content');
  return (await sheets.read('PageContent', { fresh: true })).map(pageContentRecord);
}

async function savePageContent(args, context) {
  requirePermission(context.identity, 'content');
  const record = normalizePageContent(args, context.identity);
  await saveById(context.sheets, 'PageContent', record, argsObject(args));
  await writeAudit(context.sheets, context.identity, 'savePageContent', `${record.slug}`);
  return pageContentRecord(record);
}

async function deletePageContent(args, context) {
  requirePermission(context.identity, 'content');
  const existing = await deleteById(context.sheets, 'PageContent', idFromArgs(args));
  await writeAudit(context.sheets, context.identity, 'deletePageContent', `${existing.slug}`);
  return { id: existing.id };
}

async function listMembers(_args, { sheets, identity }) {
  requirePermission(identity, 'members');
  return (await sheets.read('Members', { fresh: true })).map((row) => publicRecord(row));
}

async function saveMember(args, context) {
  requirePermission(context.identity, 'members');
  const input = argsObject(args);
  const rows = await context.sheets.read('Members', { fresh: true });
  const existing = input.id
    ? rows.find((row) => row.id === input.id)
    : rows.find((row) => String(row.email || '').toLowerCase() === String(input.email || '').toLowerCase());
  assertFresh(existing, input);
  const record = normalizeMember(input, context.identity, context.env, existing);
  if (existing) await context.sheets.update('Members', existing, record);
  else await context.sheets.append('Members', record);
  await writeAudit(context.sheets, context.identity, 'saveMember', `${record.id}: ${record.email}`);
  return publicRecord(record);
}

async function deleteMember(args, context) {
  requirePermission(context.identity, 'members');
  const existing = await deleteById(context.sheets, 'Members', idFromArgs(args));
  await writeAudit(context.sheets, context.identity, 'deleteMember', `${existing.id}: ${existing.email}`);
  return { id: existing.id };
}

async function bulkUpsertMembers(args, context) {
  requirePermission(context.identity, 'members');
  const inputRows = Array.isArray(args) ? args : argsObject(args).rows;
  if (!Array.isArray(inputRows) || inputRows.length < 1 || inputRows.length > 500) {
    throw new HttpError(400, '會員匯入需包含 1 至 500 筆資料。', 'invalid_member_import');
  }
  const existingRows = await context.sheets.read('Members', { fresh: true });
  const byEmail = new Map(existingRows.map((row) => [String(row.email || '').toLowerCase(), row]));
  let created = 0;
  let updated = 0;
  const seen = new Set();
  for (const input of inputRows) {
    const email = cleanEmail(input.email, { domain: String(context.env.GOOGLE_HOSTED_DOMAIN || '').toLowerCase() });
    if (seen.has(email)) continue;
    seen.add(email);
    const existing = byEmail.get(email) || null;
    const record = normalizeMember({ ...input, email }, context.identity, context.env, existing);
    if (existing) {
      await context.sheets.update('Members', existing, record);
      updated += 1;
    } else {
      await context.sheets.append('Members', record);
      created += 1;
    }
  }
  await writeAudit(context.sheets, context.identity, 'bulkUpsertMembers', `created=${created}, updated=${updated}`);
  return { created, updated, total: created + updated };
}

async function listAdmins(_args, { sheets, identity }) {
  requireOwner(identity);
  return (await sheets.read('Admins', { fresh: true })).map((row) => publicRecord(row, ['active']));
}

async function saveAdmin(args, context) {
  requireOwner(context.identity);
  const input = argsObject(args);
  const rows = await context.sheets.read('Admins', { fresh: true });
  const existing = input.id
    ? rows.find((row) => row.id === input.id)
    : rows.find((row) => String(row.email || '').toLowerCase() === String(input.email || '').toLowerCase());
  assertFresh(existing, input);
  const record = normalizeAdmin(input, context.identity, context.env, existing);
  if (existing) await context.sheets.update('Admins', existing, record);
  else await context.sheets.append('Admins', record);
  await writeAudit(context.sheets, context.identity, 'saveAdmin', `${record.id}: ${record.email}`);
  return publicRecord(record, ['active']);
}

async function deleteAdmin(args, context) {
  requireOwner(context.identity);
  const existing = await context.sheets.findById('Admins', idFromArgs(args), { fresh: true });
  if (!existing) throw new HttpError(404, '找不到要刪除的管理員。', 'not_found');
  if (String(existing.email || '').toLowerCase() === context.identity.email) {
    throw new HttpError(400, '不能刪除目前登入中的管理員帳號。', 'cannot_delete_self');
  }
  await context.sheets.deleteRow('Admins', existing);
  await writeAudit(context.sheets, context.identity, 'deleteAdmin', `${existing.id}: ${existing.email}`);
  return { id: existing.id };
}

async function listAudit(_args, { sheets, identity }) {
  requirePermission(identity, 'audit');
  return (await sheets.read('AuditLog', { fresh: true }))
    .sort((left, right) => String(right.time).localeCompare(String(left.time)))
    .slice(0, 300)
    .map((row) => publicRecord(row));
}

const ACTIONS = {
  dashboard,
  bootstrap,
  listAnnouncements,
  saveAnnouncement,
  deleteAnnouncement,
  listLinks,
  saveLink,
  deleteLink,
  listMemberContent,
  saveMemberContent,
  deleteMemberContent,
  listPageContent,
  savePageContent,
  deletePageContent,
  listMembers,
  saveMember,
  deleteMember,
  bulkUpsertMembers,
  listAdmins,
  saveAdmin,
  deleteAdmin,
  listAudit,
};

export async function adminDispatch(action, args, context) {
  requireAdmin(context.identity);
  const handler = ACTIONS[action];
  if (!handler) throw new HttpError(400, '未知的後台操作。', 'unknown_admin_action');
  return handler(args, context);
}
