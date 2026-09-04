export default async function handler(req, res) {
  const SCRIPT_URL = process.env.NEXT_PUBLIC_APPS_SCRIPT_URL;

  if (req.method === 'GET') {
    try {
      const response = await fetch(SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify({ action: 'get_config' }),
      });
      const data = await response.json();
      res.status(200).json(data);
    } catch (e) {
      res.status(500).json({ campagnes: [], soustraitants: [], clients: [] });
    }
    return;
  }

  if (req.method === 'POST') {
    const { action, row } = req.body;
    try {
      const response = await fetch(SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify({
          action: action === 'save' ? 'save_config' : 'delete_config',
          row: action === 'save' ? row : undefined,
          id: action === 'delete' ? row.id : undefined,
        }),
      });
      const data = await response.json();
      res.status(200).json(data);
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
    return;
  }

  res.status(405).end();
}
