export default async function handler(req, res) {
  const SCRIPT_URL = process.env.NEXT_PUBLIC_APPS_SCRIPT_URL;

  if (req.method === 'GET') {
    try {
      const response = await fetch(SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action: 'get_config' }),
        redirect: 'follow',
      });
      const text = await response.text();
      const data = JSON.parse(text);
      return res.status(200).json(data);
    } catch (e) {
      return res.status(500).json({ campagnes: [], soustraitants: [], clients: [], error: e.message });
    }
  }

  if (req.method === 'POST') {
    const { action, row } = req.body;
    try {
      const response = await fetch(SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({
          action: action === 'save' ? 'save_config' : 'delete_config',
          row: action === 'save' ? row : undefined,
          id: action === 'delete' ? row.id : undefined,
        }),
        redirect: 'follow',
      });
      const text = await response.text();
      const data = JSON.parse(text);
      return res.status(200).json(data);
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  }

  res.status(405).end();
}
