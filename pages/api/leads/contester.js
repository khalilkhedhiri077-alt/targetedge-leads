export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { id, motif } = req.body;
  const SCRIPT_URL = process.env.NEXT_PUBLIC_APPS_SCRIPT_URL;
  const now = new Date().toLocaleString('fr-FR');

  try {
    const response = await fetch(SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify({
        action: 'update_lead', id,
        updates: { statut: 'CONTESTE', contestation_motif: motif, contestation_date: now }
      }),
    });
    const data = await response.json();
    res.status(200).json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
