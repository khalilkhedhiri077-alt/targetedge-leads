import { getConfig, saveConfigRow, deleteConfigRow } from '../../../lib/config';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const config = await getConfig();
    return res.status(200).json(config);
  }

  if (req.method === 'POST') {
    const { action, row } = req.body;
    if (action === 'save') {
      await saveConfigRow(row);
      return res.status(200).json({ success: true });
    }
    if (action === 'delete') {
      await deleteConfigRow(row.id);
      return res.status(200).json({ success: true });
    }
    return res.status(400).json({ error: 'Action inconnue' });
  }

  res.status(405).end();
}
