import { getLeads } from '../../../lib/sheets';
import { getConfig } from '../../../lib/config';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();
  const { centre, client, operation } = req.query;
  const filters = {};
  if (centre) filters.centre = centre;
  if (operation) filters.operation = operation;

  let leads = await getLeads(filters);

  // Si filtre client : ne retourner que les leads de ses campagnes
  if (client) {
    const config = await getConfig();
    const ops = config.campagnes
      .filter(c => c.client_id === client && c.actif)
      .map(c => c.operation);
    leads = leads.filter(l =>
      ops.includes(l.operation) &&
      ['VALIDE', 'CONTESTE', 'ARBITRAGE_OK', 'ARBITRAGE_KO'].includes(l.statut)
    );
  }

  res.status(200).json({ leads });
}
