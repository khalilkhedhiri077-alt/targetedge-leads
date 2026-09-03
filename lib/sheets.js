import { google } from 'googleapis';

const SHEET_ID = process.env.GOOGLE_SHEET_ID;
const SHEET_NAME = 'LEADS';

function getAuth() {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    },
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  return auth;
}

export async function appendLead(lead) {
  const auth = getAuth();
  const sheets = google.sheets({ version: 'v4', auth });

  const row = [
    lead.id,
    lead.date,
    lead.heure,
    lead.centre,          // YNH ou TARGETEDGE — jamais visible client
    lead.operation,
    lead.societe,
    lead.siret,
    lead.cp,
    lead.adresse,
    lead.nom,
    lead.prenom,
    lead.fonction,
    lead.tel,
    lead.email || '',
    JSON.stringify(lead.qualification || {}),
    lead.rdv_date || '',
    lead.rdv_heure || '',
    lead.rdv_format || '',
    lead.rdv_noshow || '',
    lead.commentaire,
    lead.audio_url || '',
    'EN_ATTENTE',         // statut
    '',                   // date_validation
    '',                   // motif_refus
    '',                   // contestation_motif
    '',                   // contestation_date
    '',                   // arbitrage_decision
  ];

  await sheets.spreadsheets.values.append({
    spreadsheetId: SHEET_ID,
    range: `${SHEET_NAME}!A:AA`,
    valueInputOption: 'RAW',
    resource: { values: [row] },
  });
}

export async function getLeads(filters = {}) {
  const auth = getAuth();
  const sheets = google.sheets({ version: 'v4', auth });

  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: `${SHEET_NAME}!A:AA`,
  });

  const rows = res.data.values || [];
  if (rows.length <= 1) return [];

  const headers = [
    'id','date','heure','centre','operation','societe','siret','cp','adresse',
    'nom','prenom','fonction','tel','email','qualification',
    'rdv_date','rdv_heure','rdv_format','rdv_noshow','commentaire','audio_url',
    'statut','date_validation','motif_refus','contestation_motif','contestation_date','arbitrage_decision'
  ];

  let leads = rows.slice(1).map(row => {
    const obj = {};
    headers.forEach((h, i) => { obj[h] = row[i] || ''; });
    try { obj.qualification = JSON.parse(obj.qualification); } catch { obj.qualification = {}; }
    return obj;
  });

  // Filtres
  if (filters.centre) leads = leads.filter(l => l.centre === filters.centre);
  if (filters.operation) leads = leads.filter(l => l.operation === filters.operation);
  if (filters.statut) leads = leads.filter(l => l.statut === filters.statut);

  return leads.reverse(); // plus récents en premier
}

export async function updateLeadStatus(id, updates) {
  const auth = getAuth();
  const sheets = google.sheets({ version: 'v4', auth });

  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: `${SHEET_NAME}!A:AA`,
  });

  const rows = res.data.values || [];
  const rowIndex = rows.findIndex(r => r[0] === id);
  if (rowIndex === -1) return false;

  const colMap = {
    statut: 22,
    date_validation: 23,
    motif_refus: 24,
    contestation_motif: 25,
    contestation_date: 26,
    arbitrage_decision: 27,
  };

  const batchUpdates = Object.entries(updates).map(([key, value]) => ({
    range: `${SHEET_NAME}!${colLetter(colMap[key])}${rowIndex + 1}`,
    values: [[value]],
  }));

  await sheets.spreadsheets.values.batchUpdate({
    spreadsheetId: SHEET_ID,
    resource: {
      valueInputOption: 'RAW',
      data: batchUpdates,
    },
  });

  return true;
}

function colLetter(n) {
  let s = '';
  while (n > 0) {
    n--;
    s = String.fromCharCode(65 + (n % 26)) + s;
    n = Math.floor(n / 26);
  }
  return s;
}
