export default async function handler(req, res) {
  const { centre, client, operation } = req.query;
  const SCRIPT_URL = process.env.NEXT_PUBLIC_APPS_SCRIPT_URL;

  try {
    const response = await fetch(SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify({ action: 'get_leads', filters: { centre, client, operation } }),
    });
    const data = await response.json();

    let leads = data.leads || [];

    if (client) {
      const configRes = await fetch(SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify({ action: 'get_config' }),
      });
      const config = await configRes.json();
      const ops = (config.campagnes || [])
        .filter(c => c.client_id === client && c.actif)
        .map(c => c.operation);
      leads = leads.filter(l =>
        ops.includes(l.operation) &&
        ['VALIDE', 'CONTESTE', 'ARBITRAGE_OK', 'ARBITRAGE_KO'].includes(l.statut)
      );
    }

    res.status(200).json({ leads });
  } catch (e) {
    console.error(e);
    res.status(500).json({ leads: [], error: e.message });
  }
}
