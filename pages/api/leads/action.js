export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { id, action, motif } = req.body;
  const SCRIPT_URL = process.env.NEXT_PUBLIC_APPS_SCRIPT_URL;
  const now = new Date().toLocaleString('fr-FR');

  const updates = {};
  if (action === 'VALIDE') { updates.statut = 'VALIDE'; updates.date_validation = now; }
  else if (action === 'REFUSE') { updates.statut = 'REFUSE'; updates.motif_refus = motif || ''; updates.date_validation = now; }
  else if (action === 'ARBITRAGE_OK') { updates.statut = 'ARBITRAGE_OK'; updates.arbitrage_decision = 'Contestation rejetée · ' + now; }
  else if (action === 'ARBITRAGE_KO') { updates.statut = 'ARBITRAGE_KO'; updates.arbitrage_decision = 'Contestation acceptée · ' + now; }

  try {
    const response = await fetch(SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify({ action: 'update_lead', id, updates }),
    });
    const data = await response.json();
    res.status(200).json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
