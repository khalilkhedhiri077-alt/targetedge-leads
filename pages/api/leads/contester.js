import { updateLeadStatus } from '../../../lib/sheets';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { id, motif } = req.body;
  if (!id || !motif) return res.status(400).json({ error: 'Manque id ou motif' });

  const now = new Date().toLocaleString('fr-FR');
  await updateLeadStatus(id, {
    statut: 'CONTESTE',
    contestation_motif: motif,
    contestation_date: now,
  });

  res.status(200).json({ success: true });
}
