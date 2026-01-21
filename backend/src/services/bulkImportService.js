const logger = require('../utils/logger');
const candidateService = require('./candidateService');
const masterDivisionService = require('./masterDivisionService');
const masterOfficeLocationService = require('./masterOfficeLocationService');

function splitName(fullName) {
  const name = String(fullName || '').trim();
  if (!name) return { firstName: '', lastName: '' };
  const parts = name.split(/\s+/);
  const firstName = parts[0] || '';
  const lastName = parts.slice(1).join(' ');
  return { firstName, lastName };
}

function toStringValue(v) {
  const s = String(v ?? '').trim();
  return s;
}

async function importCandidates(rows) {
  const result = { created: 0, failed: 0, errors: [] };

  for (let i = 0; i < rows.length; i += 1) {
    const rowNum = i + 2; // header is row 1
    const row = rows[i] || {};

    const name = toStringValue(row['name']);
    const email = toStringValue(row['email']).toLowerCase();
    const phoneNumber = toStringValue(row['phone number']);
    const positionAppliedFor = toStringValue(row['position applied for']);
    const division = toStringValue(row['division']);

    if (!email) {
      result.failed += 1;
      result.errors.push({ row: rowNum, message: 'Missing Email' });
      continue;
    }

    const { firstName, lastName } = splitName(name);
    if (!firstName) {
      result.failed += 1;
      result.errors.push({ row: rowNum, message: 'Missing Name' });
      continue;
    }

    try {
      await candidateService.createCandidate({
        email,
        firstName,
        lastName,
        phoneNumber: phoneNumber || null,
        division: division || null,
        divisionList: division ? [division] : [],
        positionAppliedFor: positionAppliedFor ? [positionAppliedFor] : [],
        position: positionAppliedFor || null,
      });
      result.created += 1;
    } catch (e) {
      result.failed += 1;
      result.errors.push({ row: rowNum, email, message: e.message || 'Failed to create candidate' });
      logger.warn(`Bulk import candidate failed row ${rowNum}: ${e.message}`);
    }
  }

  return result;
}

async function importMasterDivisions(rows) {
  const result = { created: 0, failed: 0, errors: [] };

  for (let i = 0; i < rows.length; i += 1) {
    const rowNum = i + 2;
    const row = rows[i] || {};

    const divisionName = toStringValue(row['division name']);
    const sectionName = toStringValue(row['section name']);
    const headOfDivisionName = toStringValue(row['head of division name']);

    if (!divisionName || !sectionName || !headOfDivisionName) {
      result.failed += 1;
      result.errors.push({
        row: rowNum,
        message: 'Missing required fields (Division Name, Section Name, Head of Division Name)',
      });
      continue;
    }

    try {
      await masterDivisionService.createDivision({ divisionName, sectionName, headOfDivisionName });
      result.created += 1;
    } catch (e) {
      result.failed += 1;
      result.errors.push({ row: rowNum, message: e.message || 'Failed to create division' });
      logger.warn(`Bulk import division failed row ${rowNum}: ${e.message}`);
    }
  }

  return result;
}

async function importMasterOfficeLocations(rows) {
  const result = { created: 0, failed: 0, errors: [] };

  for (let i = 0; i < rows.length; i += 1) {
    const rowNum = i + 2;
    const row = rows[i] || {};

    const pt = toStringValue(row['pt']);
    const area = toStringValue(row['area']);
    const areaDetail = toStringValue(row['area detail']);

    if (!pt || !area || !areaDetail) {
      result.failed += 1;
      result.errors.push({ row: rowNum, message: 'Missing required fields (PT, Area, Area Detail)' });
      continue;
    }

    try {
      await masterOfficeLocationService.createOfficeLocation({ pt, area, areaDetail });
      result.created += 1;
    } catch (e) {
      result.failed += 1;
      result.errors.push({ row: rowNum, message: e.message || 'Failed to create office location' });
      logger.warn(`Bulk import office location failed row ${rowNum}: ${e.message}`);
    }
  }

  return result;
}

module.exports = {
  importCandidates,
  importMasterDivisions,
  importMasterOfficeLocations,
};


