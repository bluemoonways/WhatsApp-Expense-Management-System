const SPREADSHEET_ID = 'PASTE_YOUR_GOOGLE_SHEET_ID_HERE';

function doGet() {
  return HtmlService.createHtmlOutputFromFile('index')
    .setTitle('Expense Tracker')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

function getPersonDataPublic(person) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const exp = ss.getSheetByName('Expenses');
  const pay = ss.getSheetByName('Payments');
  if (!exp || !pay) throw new Error('Expenses or Payments sheet not found.');

  const e = exp.getDataRange().getValues();
  const p = pay.getDataRange().getValues();
  const all = person === '__ALL__';
  let totalExpense = 0, totalPaid = 0, records = [], cats = {};

  for (let i = 1; i < e.length; i++) {
    const date = e[i][0], category = e[i][1], who = String(e[i][2] || '').trim(), amount = Number(e[i][3]) || 0;
    if (all || who === person) {
      totalExpense += amount;
      records.push({
        date: date instanceof Date ? Utilities.formatDate(date, Session.getScriptTimeZone(), 'yyyy-MM-dd') : String(date || ''),
        category: String(category || 'other'),
        amount: amount,
        person: who
      });
      const c = String(category || 'other');
      cats[c] = (cats[c] || 0) + amount;
    }
  }

  for (let i = 1; i < p.length; i++) {
    const who = String(p[i][2] || '').trim(), amount = Number(p[i][3]) || 0;
    if (all || who === person) totalPaid += amount;
  }

  return {
    person: all ? 'All Persons' : person,
    expense: totalExpense,
    paid: totalPaid,
    balance: totalPaid - totalExpense,
    count: records.length,
    records: records.reverse(),
    cats: cats
  };
}
