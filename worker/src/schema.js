export const SCHEMA = {
  Settings: ['key', 'value', 'updatedAt', 'updatedBy'],
  Announcements: [
    'id', 'date', 'title', 'link', 'body', 'tag', 'highlight', 'published',
    'publishFrom', 'publishUntil', 'order', 'updatedAt', 'updatedBy',
  ],
  Links: [
    'id', 'group', 'title', 'description', 'url', 'icon', 'order',
    'showOnHome', 'published', 'updatedAt', 'updatedBy',
  ],
  MemberContent: [
    'id', 'title', 'summary', 'body', 'link', 'order', 'published',
    'publishFrom', 'publishUntil', 'updatedAt', 'updatedBy',
  ],
  PageContent: [
    'id', 'slug', 'fields', 'galleries', 'blocks', 'published', 'updatedAt', 'updatedBy',
  ],
  Users: ['id', 'email', 'name', 'lastLoginAt'],
  Members: [
    'id', 'sub', 'email', 'name', 'studentId', 'status', 'validUntil',
    'notes', 'updatedAt', 'updatedBy',
  ],
  Admins: [
    'id', 'sub', 'email', 'name', 'permissions', 'active', 'updatedAt', 'updatedBy',
  ],
  AuditLog: ['time', 'actor', 'action', 'target'],
};

const schemaPromises = new Map();

export async function ensureSchema(sheets) {
  if (!schemaPromises.has(sheets.id)) {
    const promise = (async () => {
      for (const [name, headers] of Object.entries(SCHEMA)) {
        await sheets.ensureSheet(name, headers);
      }
    })();
    schemaPromises.set(sheets.id, promise);
    promise.catch(() => schemaPromises.delete(sheets.id));
  }
  await schemaPromises.get(sheets.id);
}
