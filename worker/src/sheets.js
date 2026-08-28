import { getGoogleAccessToken } from './google.js';

const SHEETS_API = 'https://sheets.googleapis.com/v4/spreadsheets';

function columnLetter(number) {
  let output = '';
  let current = number;
  while (current > 0) {
    const remainder = (current - 1) % 26;
    output = String.fromCharCode(65 + remainder) + output;
    current = Math.floor((current - 1) / 26);
  }
  return output;
}

function normalize(value) {
  if (value === true) return 'true';
  if (value === false) return 'false';
  if (value == null) return '';
  if (value === 'TRUE') return 'true';
  if (value === 'FALSE') return 'false';
  return String(value);
}

export class Sheets {
  constructor(env) {
    this.env = env;
    this.id = String(env.SPREADSHEET_ID || '').trim();
    if (!this.id || this.id.startsWith('REPLACE_')) throw new Error('SPREADSHEET_ID is not configured.');
    this.metadata = null;
    this.headerCache = new Map();
    this.rowCache = new Map();
  }

  async request(url, options = {}) {
    const token = await getGoogleAccessToken(this.env);
    const response = await fetch(url, {
      ...options,
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
    });
    if (!response.ok) {
      const message = await response.text();
      throw new Error(`Google Sheets request failed (${response.status}): ${message.slice(0, 300)}`);
    }
    if (response.status === 204) return {};
    return response.json();
  }

  async getMetadata() {
    if (this.metadata) return this.metadata;
    const data = await this.request(`${SHEETS_API}/${this.id}?fields=sheets.properties(sheetId,title)`);
    this.metadata = {};
    for (const sheet of data.sheets || []) {
      this.metadata[sheet.properties.title] = sheet.properties.sheetId;
    }
    return this.metadata;
  }

  async headers(name) {
    if (this.headerCache.has(name)) return this.headerCache.get(name);
    const data = await this.request(`${SHEETS_API}/${this.id}/values/${encodeURIComponent(`${name}!1:1`)}`);
    const headers = data.values?.[0]?.map(String) || [];
    this.headerCache.set(name, headers);
    return headers;
  }

  async ensureSheet(name, expectedHeaders) {
    const metadata = await this.getMetadata();
    if (metadata[name] == null) {
      await this.request(`${SHEETS_API}/${this.id}:batchUpdate`, {
        method: 'POST',
        body: JSON.stringify({ requests: [{ addSheet: { properties: { title: name } } }] }),
      });
      this.metadata = null;
      await this.request(`${SHEETS_API}/${this.id}/values/${encodeURIComponent(`${name}!A1`)}?valueInputOption=RAW`, {
        method: 'PUT',
        body: JSON.stringify({ values: [expectedHeaders] }),
      });
      this.headerCache.set(name, [...expectedHeaders]);
      return;
    }

    const current = await this.headers(name);
    const missing = expectedHeaders.filter((header) => !current.includes(header));
    if (!missing.length) return;
    const next = [...current, ...missing];
    await this.request(
      `${SHEETS_API}/${this.id}/values/${encodeURIComponent(`${name}!A1:${columnLetter(next.length)}1`)}?valueInputOption=RAW`,
      { method: 'PUT', body: JSON.stringify({ values: [next] }) },
    );
    this.headerCache.set(name, next);
  }

  async read(name, { fresh = false } = {}) {
    if (!fresh && this.rowCache.has(name)) return this.rowCache.get(name);
    const data = await this.request(
      `${SHEETS_API}/${this.id}/values/${encodeURIComponent(name)}?valueRenderOption=FORMATTED_VALUE&dateTimeRenderOption=FORMATTED_STRING`,
    );
    const values = data.values || [];
    const headers = values[0]?.map(String) || [];
    if (headers.length) this.headerCache.set(name, headers);
    const rows = [];
    for (let rowIndex = 1; rowIndex < values.length; rowIndex += 1) {
      const valuesInRow = values[rowIndex] || [];
      if (valuesInRow.every((value) => String(value ?? '') === '')) continue;
      const row = { __row: rowIndex + 1 };
      headers.forEach((header, columnIndex) => {
        if (header) row[header] = normalize(valuesInRow[columnIndex]);
      });
      rows.push(row);
    }
    this.rowCache.set(name, rows);
    return rows;
  }

  async append(name, record) {
    const headers = await this.headers(name);
    const values = headers.map((header) => normalize(record[header]));
    await this.request(
      `${SHEETS_API}/${this.id}/values/${encodeURIComponent(`${name}!A1`)}:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS`,
      { method: 'POST', body: JSON.stringify({ values: [values] }) },
    );
    this.rowCache.delete(name);
  }

  async appendMany(name, records) {
    if (!records.length) return;
    const headers = await this.headers(name);
    const values = records.map((record) => headers.map((header) => normalize(record[header])));
    await this.request(
      `${SHEETS_API}/${this.id}/values/${encodeURIComponent(`${name}!A1`)}:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS`,
      { method: 'POST', body: JSON.stringify({ values }) },
    );
    this.rowCache.delete(name);
  }

  async update(name, row, patch) {
    const headers = await this.headers(name);
    const merged = { ...row, ...patch };
    const values = headers.map((header) => normalize(merged[header]));
    const range = `${name}!A${row.__row}:${columnLetter(headers.length)}${row.__row}`;
    await this.request(`${SHEETS_API}/${this.id}/values/${encodeURIComponent(range)}?valueInputOption=RAW`, {
      method: 'PUT',
      body: JSON.stringify({ values: [values] }),
    });
    this.rowCache.delete(name);
  }

  async deleteRow(name, row) {
    const sheetId = (await this.getMetadata())[name];
    await this.request(`${SHEETS_API}/${this.id}:batchUpdate`, {
      method: 'POST',
      body: JSON.stringify({
        requests: [{
          deleteDimension: {
            range: {
              sheetId,
              dimension: 'ROWS',
              startIndex: row.__row - 1,
              endIndex: row.__row,
            },
          },
        }],
      }),
    });
    this.rowCache.delete(name);
  }

  async findById(name, id, { fresh = false } = {}) {
    return (await this.read(name, { fresh })).find((row) => row.id === id) || null;
  }

  async upsertById(name, record) {
    const existing = await this.findById(name, record.id, { fresh: true });
    if (existing) await this.update(name, existing, record);
    else await this.append(name, record);
    return record;
  }

  async getSetting(key, fallback = '') {
    const row = (await this.read('Settings')).find((item) => item.key === key);
    return row ? row.value : fallback;
  }

  async saveSetting(key, value, actor = '') {
    const rows = await this.read('Settings', { fresh: true });
    const existing = rows.find((item) => item.key === key);
    const record = { key, value: normalize(value), updatedAt: new Date().toISOString(), updatedBy: actor };
    if (existing) await this.update('Settings', existing, record);
    else await this.append('Settings', record);
  }
}
