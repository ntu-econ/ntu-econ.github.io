import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { adminDispatch } from "../src/admin.js";

const env = Object.freeze({
  GOOGLE_HOSTED_DOMAIN: "g.ntu.edu.tw",
});

const owner = Object.freeze({
  sub: "owner-sub",
  email: "owner@g.ntu.edu.tw",
  name: "Owner",
  member: true,
  admin: true,
  owner: true,
  permissions: ["all"],
});

const contentAdmin = Object.freeze({
  sub: "content-admin-sub",
  email: "content-admin@g.ntu.edu.tw",
  name: "Content Admin",
  member: true,
  admin: true,
  owner: false,
  permissions: ["content"],
});

const memberAdmin = Object.freeze({
  sub: "member-admin-sub",
  email: "member-admin@g.ntu.edu.tw",
  name: "Member Admin",
  member: true,
  admin: true,
  owner: false,
  permissions: ["members"],
});

const member = Object.freeze({
  sub: "member-sub",
  email: "member@g.ntu.edu.tw",
  name: "Member",
  member: true,
  admin: false,
  owner: false,
  permissions: [],
});

const ntuUser = Object.freeze({
  sub: "ntu-sub",
  email: "ntu@g.ntu.edu.tw",
  name: "NTU User",
  member: false,
  admin: false,
  owner: false,
  permissions: [],
});

class MemorySheets {
  constructor(initial = {}) {
    this.tables = new Map();
    for (const [name, rows] of Object.entries(initial)) {
      this.tables.set(name, rows.map((row, index) => ({
        ...row,
        __row: index + 2,
      })));
    }
  }

  table(name) {
    if (!this.tables.has(name)) this.tables.set(name, []);
    return this.tables.get(name);
  }

  async read(name) {
    return this.table(name);
  }

  async append(name, record) {
    const rows = this.table(name);
    rows.push({ ...record, __row: rows.length + 2 });
  }

  async appendMany(name, records) {
    for (const record of records) await this.append(name, record);
  }

  async update(name, row, patch) {
    const rows = this.table(name);
    const index = rows.findIndex((candidate) => candidate.__row === row.__row);
    if (index < 0) throw new Error(`Missing ${name} row ${row.__row}`);
    rows[index] = { ...rows[index], ...patch, __row: row.__row };
  }

  async deleteRow(name, row) {
    const rows = this.table(name);
    const index = rows.findIndex((candidate) => candidate.__row === row.__row);
    if (index < 0) throw new Error(`Missing ${name} row ${row.__row}`);
    rows.splice(index, 1);
    rows.forEach((candidate, rowIndex) => {
      candidate.__row = rowIndex + 2;
    });
  }

  async findById(name, id) {
    return this.table(name).find((row) => row.id === id) || null;
  }

  async getSetting(key, fallback = "") {
    const row = this.table("Settings").find((item) => item.key === key);
    return row ? row.value : fallback;
  }

  async saveSetting(key, value, actor = "") {
    const rows = this.table("Settings");
    const existing = rows.find((item) => item.key === key);
    const record = {
      key,
      value: String(value),
      updatedAt: new Date().toISOString(),
      updatedBy: actor,
    };
    if (existing) await this.update("Settings", existing, record);
    else await this.append("Settings", record);
  }
}

function context(identity, sheets = new MemorySheets()) {
  return { identity, sheets, env };
}

function hasCode(code) {
  return (error) => {
    assert.equal(error?.code, code);
    return true;
  };
}

describe("adminDispatch contract", () => {
  it("lets an owner inspect and bootstrap an empty CMS exactly once", async () => {
    const sheets = new MemorySheets();
    const ctx = context(owner, sheets);

    const before = await adminDispatch("dashboard", {}, ctx);
    assert.equal(before.initialized, false);
    assert.deepEqual(before.counts, {
      announcements: 0,
      links: 0,
      memberContent: 0,
      pages: 0,
      members: 0,
      admins: 1,
    });

    const seeded = await adminDispatch("bootstrap", {}, ctx);
    assert.equal(seeded.initialized, true);
    assert.equal(seeded.seeded.announcements, 1);
    assert.equal(seeded.seeded.links, 5);

    const again = await adminDispatch("bootstrap", {}, ctx);
    assert.deepEqual(again.seeded, { announcements: 0, links: 0 });
    assert.equal(sheets.table("Announcements").length, 1);
    assert.equal(sheets.table("Links").length, 5);
    assert.equal(sheets.table("AuditLog").length, 1);
  });

  it("uses a direct object for content-admin save/list/deleteAnnouncement", async () => {
    const sheets = new MemorySheets();
    const ctx = context(contentAdmin, sheets);
    const input = {
      date: "2026-08-24",
      title: "測試公告",
      link: "/news/test.html",
      body: "公告內容",
      tag: "公告",
      highlight: true,
      published: true,
      order: 10,
    };

    const saved = await adminDispatch("saveAnnouncement", input, ctx);
    assert.match(saved.id, /^announcement-/);
    assert.equal(saved.title, input.title);
    assert.equal(saved.published, true);

    const listed = await adminDispatch("listAnnouncements", {}, ctx);
    assert.equal(listed.length, 1);
    assert.equal(listed[0].id, saved.id);

    const deleted = await adminDispatch(
      "deleteAnnouncement",
      { id: saved.id },
      ctx,
    );
    assert.deepEqual(deleted, { id: saved.id });
    assert.deepEqual(
      await adminDispatch("listAnnouncements", {}, ctx),
      [],
    );
  });

  it("rejects the old single-element array wrapper for object actions", async () => {
    await assert.rejects(
      () => adminDispatch(
        "saveAnnouncement",
        [{ date: "2026-08-24", title: "Wrapped" }],
        context(contentAdmin),
      ),
      hasCode("invalid_input"),
    );
  });

  it("lets a content admin save, list, and restore an editable public page", async () => {
    const sheets = new MemorySheets();
    const ctx = context(contentAdmin, sheets);
    const saved = await adminDispatch("savePageContent", {
      slug: "about",
      fields: { heroTitle: "新的關於我們", mission1Body: "更新後的任務說明" },
      galleries: {
        "highlights/econ-night": [{ url: "images/new.webp", caption: "新照片", credit: "攝影：測試" }],
      },
      blocks: [
        { id: "hero-1", type: "hero", title: "自由版面", body: "新版介紹", tone: "navy", width: "full" },
        {
          id: "cards-1", type: "cards", title: "活動精選", columns: "three",
          items: [{ title: "經濟之夜", imageUrl: "images/night.webp", linkLabel: "查看", linkUrl: "/02_review.html" }],
        },
      ],
      published: true,
    }, ctx);

    assert.equal(saved.id, "page-about");
    assert.equal(saved.fields.heroTitle, "新的關於我們");
    assert.equal(saved.galleries["highlights/econ-night"][0].url, "images/new.webp");
    assert.equal(saved.blocks.length, 2);
    assert.equal(saved.blocks[0].type, "hero");
    assert.equal(saved.blocks[1].items[0].imageUrl, "images/night.webp");
    assert.deepEqual((await adminDispatch("listPageContent", {}, ctx)).map((row) => row.slug), ["about"]);

    assert.deepEqual(await adminDispatch("deletePageContent", { id: saved.id }, ctx), { id: saved.id });
    assert.deepEqual(await adminDispatch("listPageContent", {}, ctx), []);

    await assert.rejects(
      () => adminDispatch("savePageContent", {
        slug: "review",
        fields: {},
        galleries: { "econ-night/2024": [{ url: "javascript:alert(1)" }] },
      }, ctx),
      hasCode("invalid_url"),
    );

    await assert.rejects(
      () => adminDispatch("savePageContent", {
        slug: "review",
        blocks: [{ type: "image", imageUrl: "javascript:alert(1)" }],
      }, ctx),
      hasCode("invalid_url"),
    );
  });

  it("lets a members admin bulk-upsert through the { rows } object contract", async () => {
    const sheets = new MemorySheets();
    const ctx = context(memberAdmin, sheets);

    const first = await adminDispatch("bulkUpsertMembers", {
      rows: [
        {
          email: "alice@g.ntu.edu.tw",
          name: "Alice",
          studentId: "B001",
          status: "active",
        },
        {
          email: "bob@g.ntu.edu.tw",
          name: "Bob",
          studentId: "B002",
          status: "active",
        },
      ],
    }, ctx);

    assert.deepEqual(first, { created: 2, updated: 0, total: 2 });

    const second = await adminDispatch("bulkUpsertMembers", {
      rows: [{
        email: "ALICE@g.ntu.edu.tw",
        name: "Alice Updated",
        studentId: "B001",
        status: "inactive",
      }],
    }, ctx);

    assert.deepEqual(second, { created: 0, updated: 1, total: 1 });
    const members = await adminDispatch("listMembers", {}, ctx);
    assert.equal(members.length, 2);
    assert.equal(
      members.find((row) => row.email === "alice@g.ntu.edu.tw")?.name,
      "Alice Updated",
    );
  });

  it("rejects member-only and ordinary NTU identities from admin actions", async () => {
    await assert.rejects(
      () => adminDispatch("dashboard", {}, context(member)),
      hasCode("admin_required"),
    );
    await assert.rejects(
      () => adminDispatch("dashboard", {}, context(ntuUser)),
      hasCode("admin_required"),
    );
  });

  it("does not let a non-owner administer the admin roster", async () => {
    await assert.rejects(
      () => adminDispatch("listAdmins", {}, context(contentAdmin)),
      hasCode("owner_required"),
    );
    await assert.rejects(
      () => adminDispatch("saveAdmin", {
        email: "new-admin@g.ntu.edu.tw",
        permissions: ["content"],
      }, context(memberAdmin)),
      hasCode("owner_required"),
    );
  });
});
