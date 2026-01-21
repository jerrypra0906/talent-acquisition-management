const XLSX = require('xlsx');

function normalizeHeader(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ');
}

/**
 * Parse an uploaded spreadsheet (CSV/XLSX) into row objects keyed by header.
 * Accepts a Buffer.
 */
function parseSpreadsheet(buffer) {
  const wb = XLSX.read(buffer, { type: 'buffer', cellDates: true });
  const sheetName = wb.SheetNames[0];
  if (!sheetName) return { rows: [], headers: [] };

  const ws = wb.Sheets[sheetName];
  // Get as array-of-arrays so we can normalize headers
  const aoa = XLSX.utils.sheet_to_json(ws, { header: 1, blankrows: false, defval: '' });
  if (!aoa.length) return { rows: [], headers: [] };

  const rawHeaders = aoa[0] || [];
  const headers = rawHeaders.map(normalizeHeader);

  const rows = aoa
    .slice(1)
    .filter((r) => Array.isArray(r) && r.some((c) => String(c || '').trim() !== ''))
    .map((r) => {
      const obj = {};
      headers.forEach((h, idx) => {
        obj[h] = r[idx] !== undefined ? r[idx] : '';
      });
      return obj;
    });

  return { rows, headers };
}

function makeCsvTemplate(headers) {
  const headerLine = headers.join(',');
  return `${headerLine}\n`;
}

function sendTemplate(res, { filenameBase, headers, format = 'csv' }) {
  const safeFormat = (format || 'csv').toLowerCase() === 'xlsx' ? 'xlsx' : 'csv';

  if (safeFormat === 'xlsx') {
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet([headers]);
    XLSX.utils.book_append_sheet(wb, ws, 'Template');
    const out = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${filenameBase}.xlsx"`);
    return res.status(200).send(out);
  }

  const csv = makeCsvTemplate(headers);
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="${filenameBase}.csv"`);
  return res.status(200).send(csv);
}

module.exports = {
  parseSpreadsheet,
  sendTemplate,
};


