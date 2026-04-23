// Paste this entire file into your Google Apps Script editor.
// Extensions → Apps Script → replace Code.gs with this → Save → Deploy

const SHEET_NAME = 'Responses'; // tab name inside your spreadsheet

const HEADERS = [
  'Timestamp', 'Name', 'Email', 'Company', 'Role',
  'Intent', 'Uses CI', 'CI Tools', 'Device Preference', 'App Distribution',
  'Frameworks', 'Languages', 'Tests Per Run', 'Target Build Time (min)',
  'Parallelism Goal', 'Platforms', 'OS Versions',
];

function getOrCreateSheet() {
  const ss    = SpreadsheetApp.getActiveSpreadsheet();
  let   sheet = ss.getSheetByName(SHEET_NAME);

  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow(HEADERS);
    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, 1, HEADERS.length)
         .setBackground('#FF6600')
         .setFontColor('#FFFFFF')
         .setFontWeight('bold');
  }

  return sheet;
}

function arr(val) {
  if (!val)                return '';
  if (Array.isArray(val))  return val.join(', ');
  return String(val);
}

function doPost(e) {
  try {
    const data  = JSON.parse(e.postData.contents);
    const sheet = getOrCreateSheet();

    sheet.appendRow([
      new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }), // IST — change as needed
      data.name               || '',
      data.email              || '',
      data.company            || '',
      data.role               || '',
      arr(data.intent),
      data.uses_ci            || '',
      arr(data.ci_tools),
      data.device_preference  || '',
      arr(data.app_distribution),
      arr(data.frameworks),
      arr(data.languages),
      data.test_count         ?? '',
      data.build_time         ?? '',
      data.parallelism        ?? '',
      arr(data.os_devices),
      data.os_versions        || '',
    ]);

    return ContentService
      .createTextOutput(JSON.stringify({ status: 'ok' }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'error', message: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Health-check — visit the deploy URL in browser to confirm it's live
function doGet() {
  return ContentService
    .createTextOutput(JSON.stringify({ status: 'BrowserStack webhook is live ✓' }))
    .setMimeType(ContentService.MimeType.JSON);
}
