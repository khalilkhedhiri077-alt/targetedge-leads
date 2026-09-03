import { google } from 'googleapis';

const SHEET_ID = process.env.GOOGLE_SHEET_ID;
const CONFIG_SHEET = 'CONFIG';

function getAuth() {
  return new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    },
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
}

// Structure de la feuille CONFIG :
// Onglet CONFIG — colonnes :
// A: type (CAMPAGNE | SOUS_TRAITANT | CLIENT)
// B: id (slug unique)
// C: nom (nom affiché)
// D: operation (pour CAMPAGNE)
// E: client_id (pour CAMPAGNE — à qui appartient cette campagne)
// F: cpl_st (prix payé au sous-traitant)
// G: cpl_client (prix facturé au client)
// H: url_slug (page URL)
// I: actif (1 ou 0)

export async function getConfig() {
  const auth = getAuth();
  const sheets = google.sheets({ version: 'v4', auth });
  try {
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: `${CONFIG_SHEET}!A:I`,
    });
    const rows = (res.data.values || []).slice(1); // skip header
    const campagnes = [];
    const soustraitants = [];
    const clients = [];
    rows.forEach(r => {
      const obj = {
        type: r[0] || '',
        id: r[1] || '',
        nom: r[2] || '',
        operation: r[3] || '',
        client_id: r[4] || '',
        cpl_st: parseFloat(r[5]) || 0,
        cpl_client: parseFloat(r[6]) || 0,
        url_slug: r[7] || '',
        actif: r[8] !== '0',
      };
      if (obj.type === 'CAMPAGNE') campagnes.push(obj);
      else if (obj.type === 'SOUS_TRAITANT') soustraitants.push(obj);
      else if (obj.type === 'CLIENT') clients.push(obj);
    });
    return { campagnes, soustraitants, clients };
  } catch {
    return { campagnes: [], soustraitants: [], clients: [] };
  }
}

export async function saveConfigRow(row) {
  // row = { type, id, nom, operation, client_id, cpl_st, cpl_client, url_slug, actif }
  const auth = getAuth();
  const sheets = google.sheets({ version: 'v4', auth });

  // Lire toutes les lignes existantes
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: `${CONFIG_SHEET}!A:I`,
  });
  const rows = res.data.values || [];
  const idx = rows.findIndex((r, i) => i > 0 && r[1] === row.id);

  const values = [
    row.type, row.id, row.nom, row.operation || '',
    row.client_id || '', row.cpl_st || 0, row.cpl_client || 0,
    row.url_slug || '', row.actif ? '1' : '0',
  ];

  if (idx === -1) {
    // Nouvelle ligne
    await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: `${CONFIG_SHEET}!A:I`,
      valueInputOption: 'RAW',
      resource: { values: [values] },
    });
  } else {
    // Mise à jour ligne existante
    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range: `${CONFIG_SHEET}!A${idx + 1}:I${idx + 1}`,
      valueInputOption: 'RAW',
      resource: { values: [values] },
    });
  }
}

export async function deleteConfigRow(id) {
  const auth = getAuth();
  const sheets = google.sheets({ version: 'v4', auth });
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: `${CONFIG_SHEET}!A:I`,
  });
  const rows = res.data.values || [];
  const idx = rows.findIndex((r, i) => i > 0 && r[1] === id);
  if (idx === -1) return;
  // Marquer comme inactif plutôt que supprimer
  await sheets.spreadsheets.values.update({
    spreadsheetId: SHEET_ID,
    range: `${CONFIG_SHEET}!I${idx + 1}`,
    valueInputOption: 'RAW',
    resource: { values: [['0']] },
  });
}
