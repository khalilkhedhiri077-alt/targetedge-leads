import { updateLeadStatus } from '../../../lib/sheets';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { id, action, motif } = req.body;
  if (!id || !action) return res.status(400).json({ error: 'Manque id ou action' });

  const now = new Date().toLocaleString('fr-FR');
  const updates = {};

  if (action === 'VALIDE') {
    updates.statut = 'VALIDE';
    updates.date_validation = now;
  } else if (action === 'REFUSE') {
    updates.statut = 'REFUSE';
    updates.motif_refus = motif || '';
    updates.date_validation = now;
  } else if (action === 'ARBITRAGE_OK') {
    updates.statut = 'ARBITRAGE_OK';
    updates.arbitrage_decision = 'Contestation rejetée — lead maintenu · ' + now;
  } else if (action === 'ARBITRAGE_KO') {
    updates.statut = 'ARBITRAGE_KO';
    updates.arbitrage_decision = 'Contestation acceptée — lead invalidé · ' + now;
  } else {
    return res.status(400).json({ error: 'Action inconnue' });
  }

  await updateLeadStatus(id, updates);
  res.status(200).json({ success: true });
}
